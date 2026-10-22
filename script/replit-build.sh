#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/replit-runtime.sh"
bash script/install-replit-runtime.sh
node script/check-runtime.mjs
npm ci --ignore-scripts
npm audit --audit-level=moderate
npm run check
npm test
npm run lint:i18n
npm run lint
npm run format:check
npm run build
