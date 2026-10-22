#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/replit-runtime.sh"
bash script/install-replit-runtime.sh
node script/check-runtime.mjs
npm ci --ignore-scripts
exec npm run dev
