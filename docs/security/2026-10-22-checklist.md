# October 22, 2026 Security Audit Checklist

## Scope

- [x] Q-000 [status:verified] Audit repository, local installed environment, historical artifacts, CI and accessible delivery metadata; preserve prior work. Evidence: `2026-10-22-audit.md` and protected local evidence directory. User authorized project remediation, commit/merge and deployment on October 22. Credential rotations and unrelated system-wide changes remain separate.

## Sign-off Gate

- [ ] G-001 [status:in_progress] Full security/production sign-off withheld: open build dependencies and unavailable deployed evidence. Safe repository remediation pass delivered for review, not production certification.
- [ ] G-002 [status:in_progress] Remaining findings require build-tool migration and operator verification; they were not silently accepted.
- [ ] G-003 [status:in_progress] Required local checks rerun after final code and privacy-copy corrections; evidence in V-002/V-003/V-004.
- [ ] G-004 [status:in_progress] Production, workstation and external incident follow-up documented but not performed; residual risks remain open with owners.

## Rerun Matrix

- Runtime/lockfile change: repeat runtime guard, install metadata review, npm/OSV/SBOM, typecheck, lint, tests and build.
- Server/config change: repeat typecheck, lint, HTTP/Vite integration tests, build and relevant browser/HTTP smoke.
- Frontend change: repeat i18n, typecheck, lint, tests, build and relevant browser flow.
- Documentation/format-only change: repeat format check and diff/checklist review. Any functional change reopens affected validations.

## Audit Queue

- [x] Q-001 [status:verified] Review March audits and preserve dirty worktree. Evidence: original `worktree.patch` outside Git; prior onboarding/progress edits retained.
- [x] Q-002 [status:verified] Inspect dependencies/lifecycle scripts, artifacts, history and available records before executing project code. Evidence: report compromise precheck; no credible project compromise found within stated coverage limits.
- [x] Q-003 [status:verified] Refresh all mandatory A-N groups and additional resolved npm packages. Evidence: linked primary-source matrix, OSV final batch and official CISA mirror snapshot; unavailable sources explicitly recorded.
- [x] Q-004 [status:verified] Implement compatible repository/runtime/CI/server/dependency corrections. Evidence: fix log and final source diff on `codex/security-audit-2026-10-22`.
- [x] Q-005 [status:verified] Deliver validated local fixes and production/incident/device handoff. Evidence: report and validation log. External work remains in F/R items, not claimed executed.
- [x] Q-006 [status:verified] Follow user-authorized Replit inspection for mithorizon7; The Glass Wall resolved, published URL https://theglasswall.replit.app and deployment dd029ba8-055e-4fc6-b8dd-a3e803983645 confirmed. Public HTTP/browser checks completed; deployment gaps recorded as F-012/F-013. No deployment, restart or credential changes.
- [x] Q-007 [status:verified] Inspect available Replit metadata/logs/Git/resources in Codex browser per user direction. Evidence: signed-in publishing/log views, Git remote and stale cached ref, development database and storage landing state; timed-out Agent request's completed static report recovered from conversation. No fetch/pull/push, runtime execution, database query, resource creation or publish performed.
- [ ] Q-008 [status:in_progress] Establish actual published runtime/source/image/CA/kernel versions and resource security policies, then approve integration and staged rollout. Owner: deployment/provider operator. Expired build logs/current runtime logs do not contain these versions; workspace paths/configuration are not deployed-process proof. Preserve Replit-only commit before any integration.

## Findings Log

- [x] F-001 [status:verified] [P1] confidence: high. Repository Node 20 settings and old default Node 22.12.0 were incompatible with current security baseline. Repository pins/guard fixed and isolated runtime verified; normal workstation/deployment tracked separately in R-002. Evidence: `.nvmrc`, `.replit`, package engines, guard rejection/pass. Owner: engineering/operator.
- [x] F-002 [status:verified] [P1] confidence: high. Vite 5.4.21 and permissive host/default binding; middleware setup also discarded explicit filesystem constraints. Evidence: `server/vite.ts`, `server/dev-access.ts`, Vite 6.4.5 lock entry and actual Vite denial test. Owner: engineering.
- [x] F-003 [status:verified] [P2] confidence: high. Final error middleware ordering, headers-sent delegation and status handling unsafe. Evidence: `server/error-handler.ts` and HTTP/unit regression tests. Owner: engineering.
- [x] F-004 [status:verified] [P1] confidence: high. Fresh audit initially reported 40 package entries, including 3 critical and vulnerable runtime packages. Compatible fixes clear production findings; residual build findings are split into F-008. Evidence: before/after npm JSON, OSV and lockfile. Owner: engineering.
- [x] F-005 [status:verified] [P2] confidence: high. Wildcard mount changed req.path; dotfile/missing-asset/API fallback policies unreliable. Evidence: unmounted middleware and real HTTP regression tests. Owner: engineering.
- [x] F-006 [status:verified] [P2] confidence: high. Parser/error diagnostics and response-body logs could contain sensitive data; browser lacked CSP. Evidence: final metadata-only handler, bounded parsers and artifact/browser CSP checks. Owner: engineering.
- [x] F-007 [status:verified] [P2] confidence: high. CI mutable actions/default permissions/persisted credentials and stale runtime. Evidence: immutable official action SHAs, read-only contents, no persisted credential, patched runtime pin and production dependency gate. Remote execution remains unverified in R-001. Owner: engineering/operator.
- [x] F-008 [status:verified] [P1] confidence: high. Removed all three remaining build advisories: Tailwind 4.3.3 Vite integration replaces braces/PostCSS-selector-parser chains; unused typography and v3 animation plugins removed; scoped esbuild 0.25.9 legacy-loader override tested with TypeScript/dynamic imports and database-free Drizzle generation. Evidence: clean npm ci --ignore-scripts; npm audit 0, OSV 750 pairs/no matches. Owner: engineering.
- [x] F-009 [status:verified] [P3] confidence: high. Final format gate failed on seven existing files plus audit docs. Evidence: initial format output; formatting-only changes and final format pass. Owner: engineering.
- [x] F-010 [status:verified] [P2] confidence: high. Privacy tooltip claimed no external server requests despite Google Fonts. Evidence: `client/index.html` font stylesheet/preconnect and footer locale strings. Corrected English/Latvian/Russian/pseudo to describe lesson analytics and disclose fonts. Owner: engineering.
- [x] F-011 [status:verified] [P3] confidence: high. Failed development startup could retain Vite watchers. Evidence: server cleanup and process-level invalid-PORT regression exits with code 1 instead of timing out. Owner: engineering.
- [ ] F-012 [status:open] [P1] confidence: high. Replit production lacks the local CSP/baseline headers, exposes Express fingerprint and returns HTML 200 for missing API/assets/dotfiles. Evidence: `replit-live-http.json`, 2026-10-22 18:11 UTC; all five response bodies match the entry page, not leaked secrets. Owner: deployment operator; verify runtime/source, approve trusted rollout and rerun public probes.
- [ ] F-013 [status:open] [P2] confidence: high. Published progress credits an unexplored VPN combination without another run with auto-play disabled. Evidence: live browser changes 2/4 to 3/4 on VPN toggle and says to run again; `replit-live-progress.txt`/screenshot. Owner: engineering/deployment operator; deploy the existing tested local completion-edge fix and repeat this exact check.
- [ ] F-014 [status:open] [P1] confidence: high for direct UI observations; package/runtime details are Agent-reported static inspection. Replit workspace still selects Node 20 and older affected packages and lacks local hardening; Git cached upstream last fetched eight months ago with one not-pushed commit. Evidence: console, sanitized Agent report and report workspace table. Owner: engineering/deployment operator. Do not blindly sync/reset/republish; preserve Replit-only work and integrate reviewed source/runtime after approval.

## Fix Log

- [x] P-001 [status:verified] Addresses: F-001/F-007. Patched Node pin/engines/startup guard, Replit run path, immutable current actions and restricted CI privileges. Evidence: source diff and isolated runtime pass/old-runtime rejection.
- [x] P-002 [status:verified] Addresses: F-002/F-004. Targeted compatible dependency resolutions, replacement of unused Vitest services with native Node tests, Vite host/origin/filesystem controls with config-preserving merge. Evidence: lockfile, package metadata and final tests.
- [x] P-003 [status:verified] Addresses: F-003/F-005/F-006. Final safe error boundary, SPA classification, CSP bootstrap hashes, metadata-only logs, startup validation and secret/evidence ignore rules. Evidence: source diff and real HTTP/browser checks.
- [x] P-004 [status:verified] Addresses: F-009. Formatting-only corrections preserve prior functionality. Evidence: `prettier --check`, typecheck, tests/build; no unrelated changes reverted.
- [x] P-005 [status:verified] Addresses: F-010. Correct misleading privacy text in all locale files without changing font/design behavior. Evidence: identical locale key and explicit Google Fonts disclosure; final i18n/build/browser check required below.
- [x] P-006 [status:verified] Addresses: F-011. Close Vite on startup/configuration/listen errors. Evidence: `server/index.ts`, final process-exit regression and build.
- [ ] P-007 [status:in_progress] Addresses: F-012/F-013/F-014. Preserve Replit's unpushed commit, review/integrate the audited source and patched runtime, obtain rollout approval, then verify published headers, fallback statuses and completion-only progress. Evidence: report production checklist and follow-up. Owner: deployment operator. No source sync, publish/restart or credential change authorized or attempted.

## Validation Log

- [x] V-001 [status:verified] Final clean install, lifecycle/advisory review, npm/OSV/SBOM refresh. Evidence: 2026-10-22 18:55 UTC PASS, release-clean-install/release-audit/release-osv/release-sbom outside Git: npm 0 all scopes, OSV 750 pairs/0 matches, CycloneDX 652 components. Original secret/history review remains bounded; no clean-system certification.
- [x] V-002 [status:verified] Evidence: 2026-10-22 19:00 UTC PASS. Final Node 22.23.4, TypeScript, lint, i18n and production build PASS after source fixes; final logs outside Git. Tailwind migration also removed previous PostCSS from warning.
- [x] V-003 [status:verified] Evidence: 2026-10-22 19:00 UTC PASS. Final 21 tests PASS, zero failures. Includes prior HTTP/Vite/startup security tests plus scoped-loader transform and database-free Drizzle schema generation; malformed progress values covered.
- [x] V-004 [status:verified] Evidence: 2026-10-22 19:00 UTC PASS. Final local production browser QA PASS: HTTP/HTTPS core comparison, manual VPN toggle retains 2/4, locale switching updates html lang, English/Latvian/Russian fit 390px without horizontal overflow, no captured browser warnings/errors. Final format/diff checks repeat before commit.
- [x] V-005 [status:verified] Read-only published-site checks completed. Evidence: 2026-10-22 18:11-18:20 UTC production hardening/routing/progress expectations FAIL, documented as F-012/F-013. HTTPS and browser boot work; HSTS present; no captured browser warning/error. This records inspected failures, not passed deployed remediation. Only audit docs changed after local validation; repeat formatting/diff/checklist review.
- [x] V-006 [status:verified] Signed-in Codex browser inspection completed. Evidence: 2026-10-22 PASS for metadata collection: public Autoscale, North America, 4 vCPU/8 GiB; old publish/build-log expiry; Git remote, stale cached refs and unpushed commit; Development Database present, no bucket list shown. Agent report provides bounded static precheck/package versions/build/runtime-log ranges. Actual published runtime and remediation remain unverified; not a security pass.

## Residual Risks

- [ ] R-001 [status:blocked] Replit URL, publishing/log/Git/resource views inspected; public gaps and stale delivery workspace confirmed. Actual published runtime/source/image, staging inventory, host kernel/edge/CA bundles, DB/storage access policies and current CI remain unverified. Owner: deployment/provider operator. Build logs expired after 30 days; runtime-log accessible range starts October 20, no October 17 history obtained. Need provider evidence and approved integration/rollout. Railway applicability remains unestablished. No production change performed.
- [ ] R-002 [status:open] Normal workstation Node remains 22.12.0; isolated verification runtime does not update global tools. Owner: workstation administrator. Select patched project runtime in actual terminal/IDE and record guard pass; device/browser/agent trust checks separate.
- [x] R-003 [status:verified] Build-tool advisory migrations completed and tested. Browser minimum now Safari 16.4+, Chrome 111+, Firefox 128+ per Tailwind 4; modern desktop/mobile browser QA completed. Evidence: F-008 and release deployment guide.
- [ ] R-004 [status:blocked] Historical LiteLLM/gateway/cloud exposure and supporting-service inventories incomplete. Owner: incident/infrastructure administrators. Need retained artifact/session/cloud records; conditional response documented. No identified local compromise or issued credential implies automatic rotation.

## Change Log

- 2026-10-22: Original work preserved before runtime execution; protected evidence `/private/tmp/glass-wall-security-20261022-l4rt9g0q` (0700). No raw credential values in tracked output.
- 2026-10-22: Targeted repository remediation and local checks completed; real Vite probe caught and corrected filesystem-config replacement. Production and wider security sign-off deliberately blocked. No deployment, credential rotation, global update, commit or push performed in this audit.
- 2026-10-22: Corrected external-request privacy claim in every locale; repeated affected checks and verified rendered disclosure in final production artifact.
- 2026-10-22: Replit follow-up found live URL/deployment and confirmed security/learning fixes are not deployed. Added live-response evidence and reproducible progress regression. Runtime/source/staging/log questions remain open; no remote mutation performed.
- 2026-10-22: User directed Codex browser instead of shared Safari. Signed-in publishing/log/Git/resources now inspected and completed Agent report recovered. Added stale-workspace finding and explicit preservation of Replit-only commit. Build/runtime provenance and rollout approval remain blocking; no remote source/service/credential mutation performed.

- 2026-10-22: User explicitly authorized finishing, commit/merge and deployment. Reopened validations for Tailwind 4 migration, scoped legacy-loader override, verified Linux Node bootstrap and build/runtime provenance. Remote preservation preparation requested; no publish yet.

- 2026-10-22: Final dependency migration clears npm and OSV findings. Added in-memory progress event payloads for blocked storage, strict malformed-value normalization, side-effect-free React state updates, translated document language, unrestricted viewport zoom, pinned/checksummed Replit runtime and artifact/runtime identification. Replit Agent reports verified private workspace archive and all-refs bundle at /home/runner/glass-wall-pre-release-20261022T1848Z-daAETW; existing histories remain unchanged.
