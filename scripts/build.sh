#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:1313/admin/}"

rm -rf public
mkdir -p public/admin

hugo build \
  --gc \
  --minify \
  --destination public/admin \
  --baseURL "${BASE_URL}"

cat > public/index.html <<'HTML'
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta http-equiv="refresh" content="0; url=./admin/">
  <title>ESKYNA Admin</title>
</head>
<body><p><a href="./admin/">ESKYNA Social Media Studio öffnen</a></p></body>
</html>
HTML

cat > public/robots.txt <<'TXT'
User-agent: *
Disallow: /admin/
TXT

echo "Built ${BASE_URL} -> public/admin"
