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
if [[ -e "$runtime" ]]; then
  [[ -d "$runtime" && ! -L "$runtime" ]] || { echo "Invalid runtime cache path" >&2; exit 1; }
  diff --no-dereference --brief --recursive "$temporary/$archive" "$runtime" >/dev/null || {
    echo "Cached runtime differs from the verified archive; preserve and inspect it before rebuilding" >&2
    exit 1
  }
else
  # Rename the complete tree. Never overwrite an executable used by a running preview.
  mv -T "$temporary/$archive" "$runtime"
fi
[[ -x "$runtime/bin/node" && ! -L "$runtime/bin/node" ]] || { echo "Invalid runtime executable" >&2; exit 1; }
node script/check-runtime.mjs
