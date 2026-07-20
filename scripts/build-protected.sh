#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${STATICRYPT_PASSWORD:-}" ]]; then
  echo "ERROR: STATICRYPT_PASSWORD is not set." >&2
  exit 1
fi

if (( ${#STATICRYPT_PASSWORD} < 16 )); then
  echo "ERROR: STATICRYPT_PASSWORD must contain at least 16 characters." >&2
  exit 1
fi

STATICRYPT_SALT="${STATICRYPT_SALT:-8d4ac1d77c284d40af09c7f44a5c1e31}"

bash scripts/build.sh

if [[ "${EMBED_MEDIA:-true}" != "false" ]]; then
  node scripts/embed-media.mjs public/admin/index.html public/admin
fi

npx --no-install staticrypt public/admin/index.html \
  --directory public/admin \
  --config false \
  --salt "${STATICRYPT_SALT}" \
  --remember 14 \
  --template-color-primary "#c8ab37" \
  --template-color-secondary "#1d211c" \
  --template-title "ESKYNA Social Media Studio" \
  --template-instructions "Interner Bereich. Bitte das Team-Passwort eingeben." \
  --template-button "Studio öffnen" \
  --template-placeholder "Passwort" \
  --template-toggle-hide "Passwort ausblenden" \
  --template-toggle-show "Passwort anzeigen" \
  --template-remember "Auf diesem Gerät 14 Tage merken" \
  --template-error "Das Passwort ist nicht korrekt."

node scripts/style-lock-screen.mjs public/admin/index.html static/media/brand/sign-gold.png

test -f public/admin/index.html

echo "Protected build created in public/admin"
