(() => {
  "use strict";

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const normalize = (value = "") => value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const searchInput = qs("#global-search");
  const assetCards = qsa("[data-asset-card]");
  const promptCards = qsa("[data-prompt-card]");
  const docCards = qsa(".doc-card.searchable");
  const assetEmpty = qs("[data-assets-empty]");
  const promptEmpty = qs("[data-prompts-empty]");
  const visibleAssets = qs("[data-visible-assets]");
  const visiblePrompts = qs("[data-visible-prompts]");
  const toast = qs("[data-toast]");
  let toastTimer;
  const copyFeedbackTimers = new WeakMap();
  let assetFilter = "all";
  let promptFilter = "all";
  let searchQuery = "";

  function showToast(message = "In die Zwischenablage kopiert.") {
    if (!toast) return;
    const label = qs("span", toast);
    if (label) label.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function matchesSearch(element) {
    if (!searchQuery) return true;
    return normalize(element.dataset.search || element.textContent).includes(searchQuery);
  }

  function applyFilters() {
    let assetCount = 0;
    assetCards.forEach((card) => {
      const categoryMatch = assetFilter === "all" || card.dataset.category === assetFilter;
      const visible = categoryMatch && matchesSearch(card);
      card.hidden = !visible;
      if (visible) assetCount += 1;
    });
    if (visibleAssets) visibleAssets.textContent = String(assetCount);
    if (assetEmpty) assetEmpty.hidden = assetCount !== 0;

    let promptCount = 0;
    promptCards.forEach((card) => {
      const categoryMatch = promptFilter === "all" || card.dataset.category === promptFilter;
      const visible = categoryMatch && matchesSearch(card);
      card.hidden = !visible;
      if (visible) promptCount += 1;
    });
    if (visiblePrompts) visiblePrompts.textContent = String(promptCount);
    if (promptEmpty) promptEmpty.hidden = promptCount !== 0;

    docCards.forEach((card) => {
      card.hidden = !matchesSearch(card);
    });
  }

  qsa("[data-asset-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      assetFilter = button.dataset.assetFilter || "all";
      qsa("[data-asset-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
      applyFilters();
    });
  });

  qsa("[data-prompt-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      promptFilter = button.dataset.promptFilter || "all";
      qsa("[data-prompt-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = normalize(searchInput.value.trim());
      applyFilters();
    });
  }

  document.addEventListener("keydown", (event) => {
    const activeTag = document.activeElement?.tagName?.toLowerCase();
    const isTyping = activeTag === "input" || activeTag === "textarea" || document.activeElement?.isContentEditable;
    const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    const slash = event.key === "/" && !isTyping;
    if ((shortcut || slash) && searchInput) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (event.key === "Escape" && document.body.classList.contains("is-sidebar-open")) {
      document.body.classList.remove("is-sidebar-open");
    }
  });

  const sidebarOpen = qs("[data-sidebar-open]");
  const sidebarClose = qs("[data-sidebar-close]");
  sidebarOpen?.addEventListener("click", () => document.body.classList.add("is-sidebar-open"));
  sidebarClose?.addEventListener("click", () => document.body.classList.remove("is-sidebar-open"));
  qsa("[data-nav-link]").forEach((link) => link.addEventListener("click", () => document.body.classList.remove("is-sidebar-open")));

  const navLinks = qsa("[data-nav-link]");
  const inPageNavLinks = navLinks.filter((link) => (link.getAttribute("href") || "").startsWith("#"));
  const observedSections = qsa("[data-section]");
  if ("IntersectionObserver" in window && inPageNavLinks.length && observedSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visibleEntry) return;
      const id = visibleEntry.target.id;
      inPageNavLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
    }, { rootMargin: "-18% 0px -66%", threshold: [0.05, 0.2, 0.5] });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  async function copyText(text, button = null) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }

    showToast(button?.dataset.copyMessage || "In die Zwischenablage kopiert.");

    const label = button ? qs("[data-copy-label]", button) : null;
    if (button && label) {
      const originalLabel = button.dataset.copyOriginalLabel || label.textContent;
      button.dataset.copyOriginalLabel = originalLabel;
      const previousTimer = copyFeedbackTimers.get(button);
      if (previousTimer) window.clearTimeout(previousTimer);
      button.classList.add("is-copied");
      label.textContent = "Kopiert";
      const feedbackTimer = window.setTimeout(() => {
        button.classList.remove("is-copied");
        label.textContent = originalLabel;
        copyFeedbackTimers.delete(button);
      }, 1800);
      copyFeedbackTimers.set(button, feedbackTimer);
    }
  }

  qsa("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copyValue || "", button));
  });

  qsa("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.copyTarget || "");
      copyText(target?.textContent?.trim() || "", button);
    });
  });

  qsa("[data-prompt-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".prompt-card");
      const expanded = card?.classList.toggle("is-expanded") || false;
      button.setAttribute("aria-expanded", String(expanded));
      const textNode = [...button.childNodes].find((node) => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.nodeValue = expanded ? "Weniger anzeigen " : "Prompt ansehen ";
    });
  });

  const assetDialog = qs("#asset-dialog");
  const dialogVisual = qs(".asset-dialog__visual", assetDialog || document);
  const dialogImage = qs("[data-dialog-image]", assetDialog || document);
  const dialogDownload = qs("[data-dialog-download]", assetDialog || document);
  const dialogCopy = qs("[data-dialog-copy]", assetDialog || document);
  let activeAssetPath = "";
  let activeAssetSourcePath = "";
  let activeAssetFilename = "eskyna-asset";

  function setDialogText(selector, value) {
    const element = qs(selector, assetDialog || document);
    if (element) element.textContent = value || "-";
  }

  qsa("[data-asset-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-asset-card]");
      if (!card || !assetDialog) return;
      activeAssetPath = card.dataset.file || "";
      activeAssetSourcePath = card.dataset.path || "";
      activeAssetFilename = card.dataset.filename || "eskyna-asset";
      if (dialogImage) {
        dialogImage.src = activeAssetPath;
        dialogImage.alt = card.dataset.title || "Medienvorschau";
      }
      dialogVisual?.classList.toggle("is-contain", card.dataset.fit === "contain");
      setDialogText("[data-dialog-category]", card.dataset.categoryLabel);
      setDialogText("[data-dialog-title]", card.dataset.title);
      setDialogText("[data-dialog-description]", card.dataset.description);
      setDialogText("[data-dialog-format]", card.dataset.format);
      setDialogText("[data-dialog-dimensions]", card.dataset.dimensions);
      setDialogText("[data-dialog-ratio]", card.dataset.ratio);
      setDialogText("[data-dialog-usage]", card.dataset.usage);
      setDialogText("[data-dialog-rights]", card.dataset.rights);
      setDialogText("[data-dialog-updated]", card.dataset.updated);
      const tagContainer = qs("[data-dialog-tags]", assetDialog);
      if (tagContainer) {
        tagContainer.replaceChildren();
        (card.dataset.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean).forEach((tag) => {
          const span = document.createElement("span");
          span.textContent = tag;
          tagContainer.appendChild(span);
        });
      }
      if (dialogDownload) {
        dialogDownload.href = activeAssetPath;
        dialogDownload.download = activeAssetFilename;
      }
      assetDialog.showModal();
    });
  });

  dialogCopy?.addEventListener("click", () => copyText(activeAssetSourcePath));

  qsa("[data-dialog-open]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.dialogOpen || "");
      if (dialog instanceof HTMLDialogElement) dialog.showModal();
    });
  });

  qsa("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const audioForm = qs("[data-audio-form]");
  const audioText = qs("[data-audio-text]", audioForm || document);
  const audioSubmit = qs("[data-audio-submit]", audioForm || document);
  const audioSubmitLabel = qs("[data-audio-submit-label]", audioForm || document);
  const audioCount = qs("[data-audio-count]", audioForm || document);
  const audioModeLabel = qs("[data-audio-mode-label]");
  const audioPreview = qs("[data-audio-preview]");
  const audioStatus = qs("[data-audio-status]");
  const audioStatusText = qs("[data-audio-status-text]");
  const audioResult = qs("[data-audio-result]");
  const audioPlayer = qs("[data-audio-player]");
  const audioDownload = qs("[data-audio-download]");
  let audioObjectUrl = "";

  function selectedAudioMode() {
    return qs('input[name="audio-mode"]:checked', audioForm || document)?.value || "blog";
  }

  function audioModeName(mode = selectedAudioMode()) {
    return mode === "instagram" ? "Instagram-Modus" : "Blog-Modus";
  }

  function updateAudioMode() {
    if (audioModeLabel) audioModeLabel.textContent = audioModeName();
  }

  function updateAudioCounter() {
    if (!audioText) return;
    const value = audioText.value;
    const trimmed = value.trim();
    const words = trimmed ? trimmed.split(/\s+/u).length : 0;
    if (audioCount) {
      const wordLabel = words === 1 ? "Wort" : "Wörter";
      audioCount.textContent = `${value.length.toLocaleString("de-DE")} Zeichen · ${words.toLocaleString("de-DE")} ${wordLabel}`;
    }
    if (audioSubmit && !audioForm?.classList.contains("is-loading")) audioSubmit.disabled = !trimmed;
  }

  function setAudioStatus(message, state = "idle") {
    if (audioStatusText) audioStatusText.textContent = message;
    if (audioStatus) audioStatus.dataset.state = state;
  }

  function setAudioLoading(loading) {
    audioForm?.classList.toggle("is-loading", loading);
    audioPreview?.classList.toggle("is-generating", loading);
    audioForm?.setAttribute("aria-busy", String(loading));
    if (audioSubmit) {
      audioSubmit.classList.toggle("is-loading", loading);
      audioSubmit.disabled = loading || !audioText?.value.trim();
    }
    if (audioSubmitLabel) audioSubmitLabel.textContent = loading ? "Audio wird generiert ..." : "Audio generieren";
  }

  function clearAudioResult() {
    audioPlayer?.pause();
    if (audioPlayer) {
      audioPlayer.removeAttribute("src");
      audioPlayer.load();
    }
    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
      audioObjectUrl = "";
    }
    if (audioResult) audioResult.hidden = true;
  }

  function filenameFromResponse(response, mode, contentType = "") {
    const disposition = response.headers.get("content-disposition") || "";
    const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    try {
      if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);
    } catch (error) {
      // Fall back to the unescaped filename below.
    }
    if (plainMatch?.[1]) return plainMatch[1].trim();
    const extensionByType = {
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "audio/wav": "wav",
      "audio/x-wav": "wav",
      "audio/ogg": "ogg",
      "audio/webm": "webm",
    };
    const extension = extensionByType[contentType.split(";")[0].trim().toLowerCase()] || "mp3";
    return `eskyna-${mode}-audio.${extension}`;
  }

  async function responseErrorMessage(response) {
    const contentType = response.headers.get("content-type") || "";
    try {
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        return payload?.message || payload?.error || `Serverfehler ${response.status}`;
      }
      const message = (await response.text()).trim();
      return message || `Serverfehler ${response.status}`;
    } catch (error) {
      return `Serverfehler ${response.status}`;
    }
  }

  function showAudioResult(url, filename) {
    if (!url || !audioPlayer || !audioDownload || !audioResult) return;
    audioPlayer.src = url;
    audioPlayer.load();
    audioDownload.href = url;
    audioDownload.download = filename || "eskyna-audio.mp3";
    audioResult.hidden = false;
  }

  qsa('input[name="audio-mode"]', audioForm || document).forEach((input) => {
    input.addEventListener("change", updateAudioMode);
  });
  audioText?.addEventListener("input", updateAudioCounter);

  audioForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const textValue = audioText?.value.trim() || "";
    const mode = selectedAudioMode();
    const endpoint = (audioForm.dataset.endpoint || "").trim();

    if (!textValue) {
      setAudioStatus("Bitte zuerst einen Text für die Vertonung eingeben.", "warning");
      audioText?.focus();
      return;
    }

    if (!endpoint) {
      setAudioStatus("Server-Endpunkt fehlt. Trage ihn in hugo.toml unter params.audioEndpoint ein.", "warning");
      showToast("Audio-Schnittstelle noch nicht verbunden.");
      return;
    }

    const endpointUrl = new URL(endpoint, window.location.href).href;
    clearAudioResult();
    setAudioLoading(true);
    setAudioStatus(`${audioModeName(mode)}: Anfrage wird an den Audio-Server gesendet.`, "working");

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          Accept: "application/json, audio/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          text: textValue,
          locale: "de-DE",
          source: "eskyna-admin",
        }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(await responseErrorMessage(response));

      const contentType = response.headers.get("content-type") || "";
      let audioUrl = "";
      let filename = "";

      if (contentType.toLowerCase().startsWith("audio/") || contentType.toLowerCase().includes("application/octet-stream")) {
        const blob = await response.blob();
        audioObjectUrl = URL.createObjectURL(blob);
        audioUrl = audioObjectUrl;
        filename = filenameFromResponse(response, mode, contentType);
      } else {
        const payload = await response.json().catch(() => null);
        const rawUrl = payload?.audioUrl || payload?.audio_url || payload?.downloadUrl || payload?.download_url || payload?.url || "";
        if (!rawUrl) throw new Error(payload?.message || "Der Server hat keine Audio-URL zurückgegeben.");
        audioUrl = new URL(rawUrl, endpointUrl).href;
        filename = payload?.filename || payload?.fileName || `eskyna-${mode}-audio.mp3`;
      }

      showAudioResult(audioUrl, filename);
      setAudioStatus("Audio ist fertig und kann angehört oder heruntergeladen werden.", "success");
      showToast("Audio erfolgreich generiert.");
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "Die Audio-Generierung hat das Zeitlimit von zwei Minuten überschritten."
        : `Audio konnte nicht generiert werden: ${error?.message || "Unbekannter Fehler"}`;
      setAudioStatus(message, "error");
    } finally {
      window.clearTimeout(timeout);
      setAudioLoading(false);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
  });

  qs("[data-lock-page]")?.addEventListener("click", () => {
    window.location.hash = "staticrypt_logout";
    window.location.reload();
  });

  updateAudioMode();
  updateAudioCounter();
  applyFilters();
})();
