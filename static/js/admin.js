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
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visibleEntry) return;
    const id = visibleEntry.target.id;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`));
  }, { rootMargin: "-18% 0px -66%", threshold: [0.05, 0.2, 0.5] });
  qsa("[data-section]").forEach((section) => sectionObserver.observe(section));

  async function copyText(text) {
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
    showToast();
  }

  qsa("[data-copy-value]").forEach((button) => {
    button.addEventListener("click", () => copyText(button.dataset.copyValue || ""));
  });

  qsa("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.copyTarget || "");
      copyText(target?.textContent?.trim() || "");
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
        dialogImage.alt = card.dataset.title || "Asset-Vorschau";
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

  qs("[data-lock-page]")?.addEventListener("click", () => {
    window.location.hash = "staticrypt_logout";
    window.location.reload();
  });

  qs("[data-demo-action]")?.addEventListener("click", () => {
    showToast("Kampagnen-Bearbeitung ist für Phase 2 vorbereitet.");
  });

  applyFilters();
})();
