#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://eskyna.com/admin/}"
BASE_URL="${BASE_URL%/}/"
BUILD_VERSION="${BUILD_VERSION:-0.4.1}"
BUILD_COMMIT="${GITHUB_SHA:-local}"

if [[ ! "${BASE_URL}" =~ ^https?:// ]]; then
  echo "ERROR: BASE_URL must start with http:// or https://" >&2
  exit 1
fi

if [[ "${BASE_URL}" == *"/admin/admin/"* ]]; then
  echo "ERROR: Refusing duplicated admin path in BASE_URL: ${BASE_URL}" >&2
  exit 1
fi

bash scripts/verify-source.sh
rm -rf public

hugo build \
  --gc \
  --minify \
  --destination public \
  --baseURL "${BASE_URL}"

cat > public/robots.txt <<'TXT'
User-agent: *
Disallow: /
TXT

cat > public/build-info.json <<JSON
{"version":"${BUILD_VERSION}","baseURL":"${BASE_URL}","commit":"${BUILD_COMMIT}"}
JSON

bash scripts/verify-build.sh public
printf 'Built %s -> public\n' "${BASE_URL}"
