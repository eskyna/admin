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

if [[ "${EMBED_MEDIA:-false}" == "true" ]]; then
  node scripts/embed-media.mjs public
fi

rm -rf public-protected
(
  cd public
  npx --no-install staticrypt ./* \
    --recursive \
    --directory ../public-protected \
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
)

rm -rf public
mv public-protected public
node scripts/style-lock-screen.mjs public static/media/brand/sign-gold.png

test -f public/index.html
test -f public/audio/index.html
grep -q 'id="eskyna-lock-theme"' public/index.html
grep -q 'id="eskyna-lock-theme"' public/audio/index.html

if grep -Rni '/admin/admin/' public --include='*.html' --include='*.css' --include='*.js'; then
  echo "ERROR: Protected build contains the duplicated /admin/admin/ path." >&2
  exit 1
fi

printf 'Protected multi-page build created in public.\n'
