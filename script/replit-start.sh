#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/replit-runtime.sh"
[[ -x "$runtime/bin/node" ]] || { echo "Verified deployment runtime missing; rebuild required" >&2; exit 1; }
node script/check-runtime.mjs
exec npm run start
