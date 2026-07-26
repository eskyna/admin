---
title: "Designsystem"
summary: "Farben, Typografie, Abstände, Bildsprache und Komponenten für Social Media."
status: "Arbeitsentwurf"
updated: "20.07.2026"
icon: "palette"
weight: 20
---

# ESKYNA design system

## Visual direction

The ESKYNA website uses a warm, elegant and calm visual language.
The design should feel personal and refined, not loud.
Use warm neutrals, soft surfaces and restrained gold accents.

## Core palette

| Token          | Hex       | Use                             |
| -------------- | --------- | ------------------------------- |
| Warm Alabaster | `#f9f6f0` | Main background                 |
| Soft Sand      | `#e3d5c8` | Secondary background            |
| Page Wash      | `#f6f1ea` | Body background                 |
| Muted Gold     | `#c5a059` | Primary accent                  |
| Warm Cocoa     | `#8b5e34` | Strong accent                   |
| Espresso Brown | `#2c1e16` | Text and deep accents           |
| Deep Cocoa     | `#4a3426` | Hero CTA background             |
| White          | `#ffffff` | Light surfaces and text on dark |

## CSS variables

Runtime tokens are defined in `static/css/main.css`.
Use semantic aliases in components:

```css
--bg
--bg-soft
--page-wash
--text
--muted
--accent
--accent-strong
--on-dark
--surface-card-soft
--card-border
```

Machine readable reference tokens live in `data/design_tokens.yaml`.

## Usage rules

Use `--text` for body text.
Use `--accent` for important links, highlights and primary focus moments.
Use `--accent-strong` for hover states and strong borders.
Use `--bg` and `--page-wash` for calm page backgrounds.
Use `--bg-soft` for separated sections.
Do not use pure black for normal text.
Do not invent new beige or gold values for standard components.

## Typography

Use existing font variables:

```css
--font-headline
--font-subtitle
--font-text
```

Headlines should feel refined and calm.
Body text should be easy to scan.
Avoid dense paragraphs.

## Components

Buttons:

- Rounded shape.
- Clear contrast.
- Short labels.
- Gold or deep cocoa for strong actions.

Cards:

- Soft backgrounds.
- Subtle border.
- Gentle shadow only when needed.

Sections:

- Generous vertical spacing.
- Clear heading and short intro.
- No visual overload.

## Campaign extension: MACHN

MACHN uses a stronger navy and gold palette.
This is allowed as a campaign extension.
Keep the tone still premium, clean and calm.
Do not let campaign colors leak into normal ESKYNA components unless intended.
