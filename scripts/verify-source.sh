#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

[[ -f hugo.toml ]] || fail "hugo.toml must be in the repository root."
[[ -f layouts/index.html ]] || fail "layouts/index.html is missing in the repository root."
[[ -f content/audio/_index.md ]] || fail "The dedicated content/audio page is missing."
[[ -f layouts/audio/list.html ]] || fail "The dedicated Audio Studio template is missing."
[[ -f .github/workflows/hugo.yml ]] || fail "The GitHub Pages workflow must be located at .github/workflows/hugo.yml."
[[ -d assets/backgrounds/instagram ]] || fail "assets/backgrounds/instagram is missing."
[[ ! -f data/campaigns.yaml ]] || fail "Remove obsolete data/campaigns.yaml before deploying."

EXPECTED_BASE_URL='https://eskyna.com/admin/'
grep -Fq 'baseURL = "https://eskyna.com/admin/"' hugo.toml || fail "hugo.toml must use ${EXPECTED_BASE_URL} as its single base URL."
grep -Fq 'BASE_URL: https://eskyna.com/admin/' .github/workflows/hugo.yml || fail "The workflow must pass ${EXPECTED_BASE_URL} without appending another path."
if grep -Fq 'steps.pages.outputs.base_url' .github/workflows/hugo.yml; then
  fail "The workflow still consumes the dynamic Pages base URL; this previously caused the duplicated /admin/admin/ path."
fi
if grep -RniE 'http-equiv=["'"']?refresh|window\.location\.href[[:space:]]*=|window\.location\.(replace|assign)[[:space:]]*\(|href=["'"']\./admin/?["'"']' layouts static content --exclude='*.png' --exclude='*.jpg' --exclude='*.jpeg' --exclude='*.webp'; then
  fail "An obsolete redirect to a nested admin folder is still present."
fi

if [[ -f eskyna-admin/hugo.toml ]]; then
  fail "A second project was found in ./eskyna-admin/. Extract the flat release into the repository root and remove the nested folder."
fi

if grep -RniE 'Kampagnen-Board|id="campaigns"|href="#campaigns"|data-campaign-board' \
  layouts static content data --exclude='*.png' --exclude='*.jpg' --exclude='*.jpeg' --exclude='*.webp'; then
  fail "Obsolete campaign-board markup is still present."
fi

grep -q 'data-audio-form' layouts/audio/list.html || fail "Audio form marker is missing from layouts/audio/list.html."
grep -q 'Blog-Modus' layouts/audio/list.html || fail "Blog mode is missing from the Audio Studio."
grep -q 'Instagram-Modus' layouts/audio/list.html || fail "Instagram mode is missing from the Audio Studio."
grep -q 'audio/' layouts/index.html || fail "The dashboard does not link to the dedicated Audio Studio route."
grep -q 'data-prompt-copy' layouts/index.html || fail "The direct prompt copy button is missing from the dashboard."
grep -q 'In Zwischenablage kopieren' layouts/index.html || fail "The prompt copy button label is missing."

printf 'Source verification passed: root project, no campaign board, audio page and direct prompt copy buttons present.\n'
