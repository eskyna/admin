---
title: "Dateibenennung & Ablage"
summary: "Ein einfaches Benennungsschema für Bilder, Vorlagen und Social-Media-Exporte."
status: "Vorschlag"
updated: "20.07.2026"
icon: "folder"
weight: 40
---

## Dateinamen

Verwende Kleinbuchstaben, Bindestriche und eine feste Reihenfolge:

`eskyna-[typ]-[motiv]-[format]-[variante]-v01.ext`

### Beispiele

- `eskyna-bg-ivory-editorial-4x5-v01.png`
- `eskyna-natalia-desk-landscape-v02.png`
- `eskyna-carousel-fehlkaeufe-slide-01-v03.png`
- `eskyna-logo-gold-transparent-v01.png`

## Ordnerstruktur

```text
assets/
  backgrounds/
    instagram/     # wird automatisch eingelesen

static/media/
  backgrounds/     # manuell in data/assets.yaml katalogisiert
  natalia/
  brand/
  templates/
```

## Versionen

- Arbeitsversionen: `v01`, `v02`, `v03`
- Finaler freigegebener Export: zusätzlich `-final`
- Keine Dateinamen wie `final-final-neu-2.png`

## Metadaten pro Medium

Jeder Eintrag in `data/assets.yaml` sollte Titel, Kategorie, Format, Abmessungen, Einsatz, Tags, Quelle und Aktualisierungsdatum enthalten.
