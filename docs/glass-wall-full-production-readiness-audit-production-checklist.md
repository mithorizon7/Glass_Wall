# Glass Wall full production readiness audit Checklist

Source of truth checklist for a large/intense task.

## Metadata

- Created: 2026-03-06T15:41:32
- Last Updated: 2026-03-10T11:12:54-0400
- Workspace: /Users/davedxn/Downloads/Glass_Wall
- Checklist Doc: /Users/davedxn/Downloads/Glass_Wall/docs/glass-wall-full-production-readiness-audit-production-checklist.md

## Scope

- [x] Q-000 [status:verified] Perform full-site production-readiness audit across server, client, build pipeline, and dependency posture; fix all high-confidence production-impact issues; document residual risks and validate final state.

## Sign-off Gate

- [x] G-001 [status:verified] All queued work, findings, fixes, and validations are complete.
- [x] G-002 [status:verified] All findings are resolved or marked `accepted_risk` with rationale and owner.
- [x] G-003 [status:verified] Required validation suite has been rerun on the final code state.
- [x] G-004 [status:verified] Residual risks and follow-ups are documented.

## Rerun Matrix

- [x] G-010 [status:verified] If code changes after any checked `V-*`, reset affected validation items to unchecked.
- [x] G-011 [status:verified] Final sign-off only after a full validation pass completed after the last code edit.

## Audit Queue

- [x] Q-001 [status:verified] Create checklist and baseline scope.
- [x] Q-002 [status:verified] Complete discovery/audit of impacted systems.
- [x] Q-003 [status:verified] Implement required changes.
- [x] Q-004 [status:verified] Expand or update automated tests.
- [x] Q-005 [status:verified] Run full validation suite.
- [x] Q-006 [status:verified] Final code-quality pass and sign-off review.

## Findings Log

- [x] F-001 [status:verified] [P1] [confidence:0.98] Global Express error handler rethrew errors after responding, which can terminate the process and turn recoverable errors into outages.
  - Evidence: `server/index.ts` previous handler ended with `throw err;` after `res.status(...).json(...)`.
  - Owner: codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P2] [confidence:0.93] Error payload behavior leaked internal error messages for 5xx responses in production.
  - Evidence: `server/index.ts` previously returned `err.message` for all statuses, including server faults.
  - Owner: codex
  - Linked Fix: P-001
- [x] F-003 [status:verified] [P2] [confidence:0.91] API logger included raw JSON response bodies even in production, increasing risk of sensitive data exposure through logs.
  - Evidence: `server/index.ts` logging middleware appended `JSON.stringify(capturedJsonResponse)` without environment gating.
  - Owner: codex
  - Linked Fix: P-002
- [x] F-004 [status:verified] [P2] [confidence:0.87] Baseline security response headers were not explicitly set and Express fingerprinting was enabled.
  - Evidence: `server/index.ts` had no hardening header middleware and did not disable `x-powered-by`.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-005 [status:verified] [P2] [confidence:0.95] Production dependency audit reported vulnerabilities (notably `qs` and `minimatch` in production graph before fix).
  - Evidence: `npm audit --omit=dev --json` initially returned non-zero with prod vulnerabilities.
  - Owner: codex
  - Linked Fix: P-004
- [x] F-006 [status:verified] [P3] [confidence:0.88] Client production builds emitted source maps by default, which can expose implementation details in deployed environments.
  - Evidence: `vite.config.ts` had `build.sourcemap: true`.
  - Owner: codex
  - Linked Fix: P-005
- [x] F-007 [status:verified] [P2] [confidence:0.89] Onboarding progress state was not synchronized across browser tabs, leading to stale guidance in multi-tab sessions.
  - Evidence: `client/src/pages/glass-wall.tsx` progress sync only listened to in-tab custom events and mount state.
  - Owner: codex
  - Linked Fix: P-006
- [x] F-008 [status:accepted_risk] [P2] [confidence:0.86] Dev-toolchain dependency audit still reports CVEs requiring semver-major upgrades (`vite@7`, `vitest@4`, `@typescript-eslint@8`, `drizzle-kit` change path).
  - Evidence: `npm audit --json` reports 13 dev vulnerabilities with `fixAvailable.isSemVerMajor=true`.
  - Owner: engineering
  - Linked Fix: P-007
- [x] F-009 [status:verified] [P1] [confidence:0.97] Completed-run tracking could falsely mark new protocol/VPN combinations as explored when learners changed modes after a finished timeline without rerunning it.
  - Evidence: `client/src/pages/glass-wall.tsx` and `client/src/components/progress-tracker.tsx` previously keyed persistence off `timelineStage === "complete"` / `timelineComplete` plus current mode props, so changing the mode while the prior run was still complete recorded the new combination.
  - Owner: codex
  - Linked Fix: P-008, P-009
- [x] F-010 [status:verified] [P2] [confidence:0.93] Progress tracker UI itself could remain stale across tabs and after resets, even though parent guidance state had been synchronized.
  - Evidence: `client/src/components/progress-tracker.tsx` only hydrated from localStorage on mount and kept `hasAutoOpenedRef` set after resets.
  - Owner: codex
  - Linked Fix: P-010
- [x] F-011 [status:verified] [P2] [confidence:0.92] Development SPA fallback behavior was broader than production and could return HTML for API misses or non-navigation requests, masking 404s during local verification.
  - Evidence: `server/vite.ts` previously served transformed `index.html` for all `*` routes without the method/path/accept guards present in `server/static.ts`.
  - Owner: codex
  - Linked Fix: P-011
- [x] F-012 [status:verified] [P2] [confidence:0.95] `npm test` used Vitest watch mode, causing automated validation to hang once real tests existed.
  - Evidence: `package.json` script `vitest --passWithNoTests` stayed open after the newly added tests passed.
  - Owner: codex
  - Linked Fix: P-012
- [x] F-013 [status:verified] [P3] [confidence:0.88] The HTML shell loaded a large set of unused Google font families, increasing first-load weight for no product benefit.
  - Evidence: `client/index.html` referenced more than twenty font families while `client/src/index.css` only uses the Geist, IBM Plex, DM Sans, Libre Baskerville, Merriweather, and JetBrains Mono families.
  - Owner: codex
  - Linked Fix: P-013

## Fix Log

- [x] P-001 [status:verified] Reworked global error handler to avoid rethrowing after response and to sanitize production 5xx messages while logging structured error context.
  - Addresses: F-001, F-002
  - Evidence: `server/index.ts` error middleware.
- [x] P-002 [status:verified] Restricted response-body logging to non-production and added log truncation to limit accidental data leakage.
  - Addresses: F-003
  - Evidence: `server/index.ts` API logging middleware.
- [x] P-003 [status:verified] Added baseline security headers and disabled Express signature header.
  - Addresses: F-004
  - Evidence: `server/index.ts` app bootstrap middleware (`x-powered-by` disable + hardening headers).
- [x] P-004 [status:verified] Ran targeted dependency remediation for production graph (`npm audit fix --omit=dev`) and refreshed lockfile.
  - Addresses: F-005
  - Evidence: `package-lock.json` updates + clean `npm audit --omit=dev --json`.
- [x] P-005 [status:verified] Made source-map generation opt-in for production (`VITE_SOURCEMAP=true`) instead of always on.
  - Addresses: F-006
  - Evidence: `vite.config.ts`.
- [x] P-006 [status:verified] Added `storage` event listener for cross-tab onboarding progress synchronization.
  - Addresses: F-007
  - Evidence: `client/src/pages/glass-wall.tsx`.
- [x] P-007 [status:accepted_risk] Deferred semver-major dev-toolchain upgrades pending dedicated compatibility pass.
  - Addresses: F-008
  - Evidence: `npm audit --json` output; upgrade requires coordinated migration/testing.
- [x] P-008 [status:verified] Added transition-based completion helpers and reused them in page-level explored-combination tracking so only real run completions persist progress.
  - Addresses: F-009
  - Evidence: `client/src/lib/progress-state.ts`, `client/src/pages/glass-wall.tsx`, `client/src/lib/progress-state.test.ts`.
- [x] P-009 [status:verified] Reset the timeline immediately on protocol/VPN changes and only auto-replay from the reset state, preventing stale complete-state UI from carrying across modes.
  - Addresses: F-009
  - Evidence: `client/src/pages/glass-wall.tsx`.
- [x] P-010 [status:verified] Added storage/custom-event synchronization to the progress tracker and reset its auto-open state when progress is cleared.
  - Addresses: F-010
  - Evidence: `client/src/components/progress-tracker.tsx`.
- [x] P-011 [status:verified] Centralized SPA fallback rules and applied the same navigation-only behavior in dev and production, including explicit HEAD handling and 404 responses for non-navigation misses.
  - Addresses: F-011
  - Evidence: `server/spa-fallback.ts`, `server/static.ts`, `server/vite.ts`, `client/src/lib/spa-fallback.test.ts`.
- [x] P-012 [status:verified] Switched `npm test` to non-watch mode for deterministic validation and added an explicit `test:watch` script for local iteration.
  - Addresses: F-012
  - Evidence: `package.json`.
- [x] P-013 [status:verified] Reduced the Google Fonts request to the families actually used by the app.
  - Addresses: F-013
  - Evidence: `client/index.html`, `client/src/index.css`.

## Validation Log

- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-10 11:12 EDT + pass (`tsc` clean).
- [x] V-002 [status:verified] `npm run lint`
  - Evidence: 2026-03-10 11:12 EDT + pass.
- [x] V-003 [status:verified] `npm test`
  - Evidence: 2026-03-10 11:12 EDT + pass (`vitest run --passWithNoTests`, 2 files / 7 tests).
- [x] V-004 [status:verified] `npm run build`
  - Evidence: 2026-03-10 11:12 EDT + pass (client + server built successfully).
- [x] V-005 [status:verified] `node scripts/i18n-check.js`
  - Evidence: 2026-03-10 11:12 EDT + pass.
- [x] V-006 [status:verified] `npm audit --omit=dev --json`
  - Evidence: 2026-03-10 11:12 EDT + pass (`total: 0` vulnerabilities in production dependency graph).
- [x] V-007 [status:verified] `npm audit --json`
  - Evidence: 2026-03-10 11:12 EDT + fail (13 dev-only vulnerabilities reported); results reviewed and retained as accepted risk F-008/P-007.

## Residual Risks

- [x] R-001 [status:accepted_risk] Dev-toolchain CVEs remain pending major-version migrations (`vite`, `vitest`, `@typescript-eslint`, potentially `drizzle-kit` path updates).
  - Rationale: Requires non-trivial upgrade work and compatibility validation; not production runtime attack surface.
  - Owner: engineering
  - Follow-up trigger/date: Schedule dedicated dependency modernization sprint before next major release.
- [x] R-002 [status:accepted_risk] No automated end-to-end regression suite currently exists.
  - Rationale: Targeted unit tests now cover progress persistence and SPA fallback policy, but primary user flows still lack end-to-end browser coverage.
  - Owner: engineering
  - Follow-up trigger/date: Add smoke/e2e tests for primary learning flow and onboarding interactions in next QA hardening cycle.
- [x] R-003 [status:accepted_risk] PostCSS parser warning still appears during build.
  - Rationale: Non-blocking warning, but could indicate plugin metadata gap.
  - Owner: frontend
  - Follow-up trigger/date: Investigate plugin versions/config if CSS pipeline issues appear.

## Change Log

- 2026-03-06T15:41:32: Checklist initialized.
- 2026-03-06T15:45:39-0500: Discovery/audit completed; findings F-001..F-008 recorded.
- 2026-03-06T15:45:39-0500: Implemented hardening fixes P-001..P-006; documented accepted-risk item P-007.
- 2026-03-06T15:45:39-0500: Full validation pass completed (V-001..V-007); sign-off gates verified.
- 2026-03-06T15:47:14-0500: Final verification rerun after checklist cleanup; sign-off remains clean.
- 2026-03-10T11:12:54-0400: Second comprehensive robustness pass completed; findings F-009..F-013 resolved via P-008..P-013.
- 2026-03-10T11:12:54-0400: Final validation rerun completed on the post-fix state (V-001..V-007 updated); sign-off remains clean.
