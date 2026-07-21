#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

const targetPath = path.resolve(process.argv[2] || "public");
const logoPath = path.resolve(process.argv[3] || "static/media/brand/sign-gold.png");
const buildVersion = process.env.BUILD_VERSION || "0.4.1";

async function listHtmlFiles(target) {
  const stat = await fs.stat(target);
  if (stat.isFile()) return target.endsWith(".html") ? [target] : [];

  const files = [];
  const entries = await fs.readdir(target, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...await listHtmlFiles(absolutePath));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolutePath);
  }
  return files;
}

function lockThemeCss(logoDataUri, version) {
  return `
<style id="eskyna-lock-theme">
  @font-face {
    font-family: Montserrat;
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url("/admin/fonts/montserrat-600.ttf") format("truetype");
  }
  @font-face {
    font-family: "Open Sans";
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url("/admin/fonts/open-sans-400.ttf") format("truetype");
  }
  @font-face {
    font-family: "Open Sans";
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url("/admin/fonts/open-sans-700.ttf") format("truetype");
  }
  .staticrypt-html, .staticrypt-body { min-height: 100%; }
  .staticrypt-body { background: #f6f1ea !important; }
  .staticrypt-content {
    position: relative;
    min-height: 100vh !important;
    display: grid !important;
    place-items: center !important;
    overflow: hidden;
    padding: 28px !important;
    box-sizing: border-box;
    color: #2c1e16 !important;
    background:
      radial-gradient(circle at 84% 10%, rgba(197,160,89,.22) 0 10%, transparent 10.2%),
      radial-gradient(circle at 8% 88%, rgba(139,94,52,.12) 0 13%, transparent 13.2%),
      linear-gradient(135deg, #f8f3ea, #efe7db) !important;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
  }
  .staticrypt-content::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    opacity: .52;
    background-image:
      linear-gradient(rgba(29,33,28,.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(29,33,28,.025) 1px, transparent 1px);
    background-size: 38px 38px;
    mask-image: linear-gradient(to bottom, transparent, #000 22%, #000 78%, transparent);
  }
  .staticrypt-page {
    position: relative !important;
    z-index: 2;
    width: min(100%, 560px) !important;
    padding: 0 !important;
    margin: auto !important;
    box-sizing: border-box;
  }
  .staticrypt-form {
    position: relative !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 104px 64px 54px !important;
    overflow: hidden;
    color: #2c1e16 !important;
    background: rgba(255,253,248,.96) !important;
    border: 1px solid rgba(44,30,22,.1);
    border-radius: 30px;
    box-shadow: 0 32px 90px rgba(44,30,22,.16) !important;
    text-align: left !important;
    backdrop-filter: blur(20px);
  }
  .staticrypt-form::before {
    content: "";
    position: absolute;
    top: 34px;
    left: 64px;
    width: 46px;
    height: 46px;
    background: url("${logoDataUri}") center / contain no-repeat;
  }
  .staticrypt-form::after {
    content: "ESKYNA  /  INTERNER ARBEITSBEREICH  /  v${version}";
    display: block;
    margin-top: 34px;
    padding-top: 18px;
    color: #7d806f;
    border-top: 1px solid rgba(29,33,28,.1);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: .13em;
  }
  .staticrypt-title {
    margin: 0 0 14px !important;
    color: #2c1e16 !important;
    font-family: Montserrat, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-size: clamp(30px, 6vw, 44px) !important;
    font-weight: 600 !important;
    letter-spacing: -.02em;
    line-height: 1.08 !important;
    text-align: left !important;
  }
  .staticrypt-instructions {
    margin: 0 0 28px !important;
    color: #6d5a4c !important;
    font-size: 14px !important;
    line-height: 1.65 !important;
    text-align: left !important;
  }
  .staticrypt-password,
  .staticrypt-form input[type="password"],
  .staticrypt-form input[type="text"] {
    width: 100% !important;
    min-height: 56px;
    box-sizing: border-box !important;
    color: #2c1e16 !important;
    background: #f6f1ea !important;
    border: 1px solid rgba(44,30,22,.14) !important;
    border-radius: 999px !important;
    outline: none !important;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-size: 16px !important;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .staticrypt-password:focus,
  .staticrypt-form input[type="password"]:focus,
  .staticrypt-form input[type="text"]:focus {
    background: #fffdf8 !important;
    border-color: #c5a059 !important;
    box-shadow: 0 0 0 4px rgba(197,160,89,.16) !important;
  }
  .staticrypt-decrypt-button,
  .staticrypt-form input[type="submit"] {
    width: 100% !important;
    min-height: 54px;
    margin-top: 12px !important;
    color: #fffdf8 !important;
    background: #8b5e34 !important;
    border: 0 !important;
    border-radius: 999px !important;
    font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    letter-spacing: .02em;
    cursor: pointer;
    transition: transform .18s, box-shadow .18s, background .18s;
  }
  .staticrypt-decrypt-button:hover,
  .staticrypt-form input[type="submit"]:hover {
    background: #7a522c !important;
    box-shadow: 0 14px 34px rgba(44,30,22,.2);
    transform: translateY(-1px);
  }
  .staticrypt-remember {
    display: flex !important;
    align-items: center;
    gap: 9px;
    margin: 17px 0 2px !important;
    color: #6d5a4c !important;
    font-size: 12px !important;
    text-align: left !important;
  }
  .staticrypt-remember input { accent-color: #c5a059; }
  #staticrypt-toggle-password-visibility { opacity: .56; }
  @media (max-width: 620px) {
    .staticrypt-content { padding: 12px !important; }
    .staticrypt-form { padding: 96px 24px 38px !important; border-radius: 23px; }
    .staticrypt-form::before { left: 24px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .staticrypt-decrypt-button,
    .staticrypt-form input[type="submit"] { transition: none; }
  }
</style>`;
}

function faviconLinks(logoDataUri) {
  return `
<link rel="icon" href="${logoDataUri}" type="image/png">
<link rel="apple-touch-icon" href="${logoDataUri}">
<meta name="theme-color" content="#2c1e16">`;
}

async function main() {
  const logo = await fs.readFile(logoPath);
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;
  const css = lockThemeCss(logoDataUri, buildVersion.replace(/[^0-9A-Za-z._-]/g, ""));
  const icons = faviconLinks(logoDataUri);
  const htmlFiles = await listHtmlFiles(targetPath);

  if (htmlFiles.length === 0) throw new Error(`No HTML files found in ${targetPath}.`);

  let styled = 0;
  for (const htmlPath of htmlFiles) {
    const html = await fs.readFile(htmlPath, "utf8");
    if (!html.includes("</head>")) throw new Error(`Could not find </head> in ${htmlPath}.`);
    if (html.includes('id="eskyna-lock-theme"')) continue;
    const themed = html.replace("</head>", `${icons}\n${css}\n</head>`);
    await fs.writeFile(htmlPath, themed, "utf8");
    styled += 1;
  }

  console.log(`Applied ESKYNA lock-screen theme to ${styled} HTML file(s).`);
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
});
