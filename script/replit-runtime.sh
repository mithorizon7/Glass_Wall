#!/usr/bin/env bash
set -euo pipefail

# Deployment images can lag behind the Node module channel. Never lower the guard.
cd "$(dirname "${BASH_SOURCE[0]}")/.."
version="$(cat .nvmrc)"
[[ "$version" == "22.23.4" ]] || { echo "Review deployment runtime checksums for this Node version" >&2; exit 1; }
case "$(uname -s):$(uname -m)" in
  Linux:x86_64)
    archive="node-v${version}-linux-x64"
    checksum="1805bcd35e6815559bd2eb97db438d3fdb0eb3a5e6a977b7c1badca76337e9ce"
    ;;
  Linux:aarch64|Linux:arm64)
    archive="node-v${version}-linux-arm64"
    checksum="6287aa46b6c375d816e63ae66d024fbbfd70404825aabdfdf898a970871d2f4b"
    ;;
  *) echo "Unsupported deployment platform" >&2; exit 1 ;;
esac
runtime="$PWD/.runtime/$archive"
export PATH="$runtime/bin:$PATH"
