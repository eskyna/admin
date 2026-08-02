#!/usr/bin/env node
/**
 * Lint all background PNGs under static/media/backgrounds.
 *
 * Checks:
 *  - aspect ratio is 4:5 (within 2% relative tolerance)
 *  - minimum resolution 1080×1350
 *  - RGB (no alpha / RGBA)
 *  - no visible Google Gemini / Nano Banana sparkle watermark
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { passesThreshold, processImage } from "gemini-watermark";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const BACKGROUNDS_DIR = join(ROOT, "static/media/backgrounds");
const MIN_WIDTH = 1080;
const MIN_HEIGHT = 1350;
const TARGET_RATIO = 4 / 5;
const RATIO_TOLERANCE = 0.02;
/** Confidence gate matching gemini-watermark's default remove threshold. */
const WATERMARK_THRESHOLD = 0.35;

/** Relative paths under the repo root that skip all background lint checks. */
const EXCEPTIONS = new Set([
  "static/media/backgrounds/Baumwolle/09.png",
  "static/media/backgrounds/Blumen/01.png",
  "static/media/backgrounds/Blumen/02.png",
  "static/media/backgrounds/Blumen/06.png",
  "static/media/backgrounds/Flanell/03.png",
  "static/media/backgrounds/Haekelspitze/01.png",
  "static/media/backgrounds/Hahnentritt/07.png",
  "static/media/backgrounds/Kaschmir/07.png",
  "static/media/backgrounds/Klee/04.png",
  "static/media/backgrounds/Klee/05.png",
  "static/media/backgrounds/Kord/06.png",
  "static/media/backgrounds/Leder/15.png",
  "static/media/backgrounds/Moos/01.png",
  "static/media/backgrounds/Mosaik/05.png",
  "static/media/backgrounds/Mosaik/07.png",
  "static/media/backgrounds/Organza/02.png",
  "static/media/backgrounds/Organza/03.png",
  "static/media/backgrounds/Organza/05.png",
  "static/media/backgrounds/pflanzen/01.png",
  "static/media/backgrounds/pflanzen/02.png",
  "static/media/backgrounds/pflanzen/03.png",
  "static/media/backgrounds/pflanzen/04.png",
  "static/media/backgrounds/Pailletten/04.png",
  "static/media/backgrounds/Pailletten/07.png",
  "static/media/backgrounds/Perlmutt/06.png",
  "static/media/backgrounds/Sand/05.png",
  "static/media/backgrounds/Sand/06.png",
  "static/media/backgrounds/Steine/07.png",
]);

const COLOR_TYPES = {
  0: "Grayscale",
  2: "RGB",
  3: "Palette",
  4: "Grayscale+Alpha",
  6: "RGBA",
};

function walkPngs(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkPngs(path));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".png")) {
      out.push(path);
    }
  }
  return out.sort();
}

function ratioOk(width, height) {
  const ratio = width / height;
  return Math.abs(ratio - TARGET_RATIO) / TARGET_RATIO <= RATIO_TOLERANCE;
}

function hasAlpha(png) {
  // Truecolor/Gray with alpha, or palette/RGB with tRNS (pngjs sets .alpha).
  return png.colorType === 4 || png.colorType === 6 || Boolean(png.alpha);
}

function checkGeometry(png) {
  const issues = [];
  if (!ratioOk(png.width, png.height)) {
    issues.push(
      `Seitenverhältnis ${png.width}×${png.height} ist nicht 4:5 (ist ${(png.width / png.height).toFixed(4)}, erwartet ${TARGET_RATIO.toFixed(4)} ±${RATIO_TOLERANCE * 100}%)`,
    );
  }
  if (png.width < MIN_WIDTH || png.height < MIN_HEIGHT) {
    issues.push(
      `Auflösung ${png.width}×${png.height} unter Minimum ${MIN_WIDTH}×${MIN_HEIGHT}`,
    );
  }
  return issues;
}

function checkColor(png) {
  const label = COLOR_TYPES[png.colorType] || `colorType ${png.colorType}`;
  if (hasAlpha(png)) {
    return [`Farbmodus ${label} mit Alpha — erwartet RGB ohne Transparenz`];
  }
  if (png.colorType !== 2) {
    return [`Farbmodus ${label} — erwartet RGB (PNG color type 2)`];
  }
  return [];
}

function checkGeminiWatermark(png) {
  const image = {
    data: png.data,
    width: png.width,
    height: png.height,
    channels: 4,
  };
  const result = processImage(image, { mode: "remove" });
  if (result.status === "processed") {
    const variant = result.variant || "?";
    const conf = Number(result.confidence).toFixed(3);
    return [
      `Sichtbares Gemini/Nano-Banana-Logo erkannt (Variante ${variant}, Konfidenz ${conf})`,
    ];
  }
  if (passesThreshold(result.confidence, WATERMARK_THRESHOLD)) {
    return [
      `Gemini/Nano-Banana-Logo verdächtig (Konfidenz ${Number(result.confidence).toFixed(3)})`,
    ];
  }
  return [];
}

function lintFile(path) {
  const rel = relative(ROOT, path);
  if (EXCEPTIONS.has(rel)) {
    return { path: rel, issues: [], skipped: true };
  }

  let png;
  try {
    png = PNG.sync.read(readFileSync(path));
  } catch (error) {
    return { path: rel, issues: [`PNG unlesbar: ${error.message}`] };
  }

  return {
    path: rel,
    issues: [
      ...checkGeometry(png),
      ...checkColor(png),
      ...checkGeminiWatermark(png),
    ],
  };
}

function main() {
  if (!statSync(BACKGROUNDS_DIR, { throwIfNoEntry: false })?.isDirectory()) {
    console.error(`ERROR: ${relative(ROOT, BACKGROUNDS_DIR)} fehlt.`);
    process.exit(1);
  }

  const files = walkPngs(BACKGROUNDS_DIR);
  if (files.length === 0) {
    console.error("ERROR: Keine PNG-Dateien unter static/media/backgrounds gefunden.");
    process.exit(1);
  }

  console.log(`Lint: ${files.length} Hintergründe in static/media/backgrounds …`);

  const failures = [];
  let checked = 0;
  let skipped = 0;
  for (const file of files) {
    const { path, issues, skipped: isSkipped } = lintFile(file);
    if (isSkipped) {
      skipped += 1;
      console.log(`↷ Ausnahme: ${path}`);
      continue;
    }
    checked += 1;
    if (issues.length === 0) continue;
    failures.push({ path, issues });
    console.error(`\n✗ ${path}`);
    for (const issue of issues) console.error(`  - ${issue}`);
  }

  console.log("");
  if (skipped > 0) {
    console.log(`Ausnahmen: ${skipped}`);
  }
  if (failures.length === 0) {
    console.log(
      `OK: ${checked} Hintergründe bestanden (4:5, ≥${MIN_WIDTH}×${MIN_HEIGHT}, RGB, kein Gemini-Logo).`,
    );
    process.exit(0);
  }

  console.error(`FAIL: ${failures.length} von ${checked} Hintergründen mit Fehlern.`);
  process.exit(1);
}

main();
