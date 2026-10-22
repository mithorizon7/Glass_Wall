#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/replit-runtime.sh"

mkdir -p .runtime
temporary="$(mktemp -d "$PWD/.runtime/install.XXXXXX")"
trap 'rm -rf "$temporary"' EXIT
curl --fail --silent --show-error --location --proto '=https' --tlsv1.2 \
  --retry 3 --connect-timeout 15 --max-time 180 \
  "https://nodejs.org/dist/v${version}/${archive}.tar.xz" -o "$temporary/node.tar.xz"
printf '%s  %s\n' "$checksum" "$temporary/node.tar.xz" | sha256sum --check --status
tar -xJf "$temporary/node.tar.xz" -C "$temporary"
mkdir -p "$runtime"
cp -a "$temporary/$archive/." "$runtime/"
node script/check-runtime.mjs
npm ci --ignore-scripts
npm audit --audit-level=moderate
npm run check
npm test
npm run lint:i18n
npm run lint
npm run format:check
npm run build
