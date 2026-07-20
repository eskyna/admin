# Instagram-Hintergründe

Lege hier neue Instagram-Hintergrundbilder ab. Unterstützt werden PNG, JPG/JPEG, WebP, GIF, AVIF, BMP und TIFF.

Beim Hugo-Build werden die Dateien automatisch:

- in der Asset-Bibliothek unter **Hintergründe** angezeigt,
- nach `media/backgrounds/instagram/` veröffentlicht,
- mit Titel und Abmessungen aus Dateiname beziehungsweise Bilddatei versehen.

Empfohlenes Benennungsschema:

```text
2026-07-thema-variante-4x5.png
2026-07-thema-variante-story-9x16.webp
```

Für Bilder mit individuellen Metadaten kannst du sie alternativ unter `static/media/` ablegen und in `data/assets.yaml` registrieren.
