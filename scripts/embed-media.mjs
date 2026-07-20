#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const htmlPath = path.resolve(process.argv[2] || "public/admin/index.html");
const siteDirectory = path.resolve(process.argv[3] || path.dirname(htmlPath));
const mediaDirectory = path.join(siteDirectory, "media");
const maxFileSizeMb = Number(process.env.EMBED_MEDIA_MAX_MB || "25");
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".pdf", "application/pdf"],
  [".zip", "application/zip"],
  [".mp4", "video/mp4"],
  [".mov", "video/quicktime"],
]);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath));
    if (entry.isFile()) files.push(absolutePath);
  }
  return files;
}

async function main() {
  let html = await fs.readFile(htmlPath, "utf8");

  try {
    await fs.access(mediaDirectory);
  } catch {
    console.log("No media directory found; nothing to embed.");
    return;
  }

  const files = await listFiles(mediaDirectory);
  let embeddedFiles = 0;
  let embeddedBytes = 0;

  for (const file of files) {
    const buffer = await fs.readFile(file);
    const relativePath = path.relative(siteDirectory, file).split(path.sep).join("/");

    if (buffer.byteLength > maxFileSizeBytes) {
      throw new Error(`${relativePath} is larger than ${maxFileSizeMb} MB. Use real access-controlled storage for large media.`);
    }

    const mimeType = mimeTypes.get(path.extname(file).toLowerCase()) || "application/octet-stream";
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
    const escapedPath = escapeRegExp(relativePath);
    const attributePattern = new RegExp(`\\b(src|href|data-file)=(["'])([^"']*${escapedPath})\\2`, "g");
    let replacements = 0;

    html = html.replace(attributePattern, (_match, attribute, quote) => {
      replacements += 1;
      return `${attribute}=${quote}${dataUri}${quote}`;
    });

    if (replacements === 0) {
      console.warn(`Media file is not referenced and will not be deployed: ${relativePath}`);
      continue;
    }

    embeddedFiles += 1;
    embeddedBytes += buffer.byteLength;
  }

  const unresolved = [...html.matchAll(/\b(?:src|href|data-file)=(["'])[^"']*\/media\/[^"']*\1/g)];
  if (unresolved.length > 0) {
    throw new Error(`Found ${unresolved.length} unresolved media reference(s) after embedding.`);
  }

  await fs.writeFile(htmlPath, html, "utf8");
  await fs.rm(mediaDirectory, { recursive: true, force: true });

  console.log(`Embedded ${embeddedFiles} media files (${(embeddedBytes / 1024 / 1024).toFixed(2)} MB) into ${htmlPath}.`);
  console.log("Removed the public media directory so registered assets remain inside the encrypted HTML.");
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
