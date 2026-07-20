#!/usr/bin/env bash
set -euo pipefail

SITE_DIR="${1:-public}"

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[[ -f "${SITE_DIR}/index.html" ]] || fail "${SITE_DIR}/index.html is missing."
[[ -f "${SITE_DIR}/audio/index.html" ]] || fail "${SITE_DIR}/audio/index.html is missing."
[[ -f "${SITE_DIR}/media/backgrounds/ivory-editorial-4x5.png" ]] || fail "Default background asset was not published."
[[ -f "${SITE_DIR}/media/brand/sign-gold.png" ]] || fail "Brand mark was not published."

grep -q 'data-audio-form' "${SITE_DIR}/audio/index.html" || fail "Rendered Audio Studio form is missing."
grep -q 'Blog-Modus' "${SITE_DIR}/audio/index.html" || fail "Rendered Blog mode is missing."
grep -q 'Instagram-Modus' "${SITE_DIR}/audio/index.html" || fail "Rendered Instagram mode is missing."
grep -q '/admin/audio/' "${SITE_DIR}/index.html" || fail "Dashboard does not point to /admin/audio/."
grep -q 'data-prompt-copy' "${SITE_DIR}/index.html" || fail "Rendered prompt copy buttons are missing."
grep -q 'In Zwischenablage kopieren' "${SITE_DIR}/index.html" || fail "Rendered prompt copy labels are missing."

if grep -RniE 'Kampagnen-Board|id="campaigns"|href="#campaigns"|data-campaign-board' "${SITE_DIR}" --include='*.html'; then
  fail "The rendered site still contains campaign-board markup."
fi

if grep -Rni '/admin/admin/' "${SITE_DIR}" --include='*.html' --include='*.css' --include='*.js'; then
  fail "The rendered site contains the duplicated /admin/admin/ path."
fi

printf 'Build verification passed: /admin/, /admin/audio/, prompt copy buttons, assets and campaign-board removal confirmed.\n'
