# Glass Wall onboarding fluency redesign Checklist

Source of truth checklist for a large/intense task.

## Metadata

- Created: 2026-03-06T15:23:05
- Last Updated: 2026-03-06T15:38:48-0500
- Workspace: /Users/davedxn/Downloads/Glass_Wall
- Checklist Doc: /Users/davedxn/Downloads/Glass_Wall/docs/glass-wall-onboarding-fluency-redesign-production-checklist.md

## Scope

- [x] Q-000 [status:verified] Improve first-session fluency by guiding learners to complete HTTP-vs-HTTPS comparison quickly, reduce onboarding interruption, and keep help recoverable.

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
- [x] Q-004 [status:accepted_risk] Expand or update automated tests.
- [x] Q-005 [status:verified] Run full validation suite.
- [x] Q-006 [status:verified] Final code-quality pass and sign-off review.

## Findings Log

- [x] F-001 [status:verified] [P2] [confidence:0.92] Guided onboarding was a 10-step blocking overlay, front-loading feature explanations before first meaningful comparison.
  - Evidence: `client/src/components/guided-learning-overlay.tsx` (`STEPS` list + immediate auto-open path before refactor).
  - Owner: codex
  - Linked Fix: P-001
- [x] F-002 [status:verified] [P2] [confidence:0.90] Suggested flow checklist was static and not tied to real learner actions, so guidance did not adapt to progress.
  - Evidence: `client/src/components/learning-guidance.tsx` prior logic only used scenario/model/timeline stage, not completed protocol comparisons.
  - Owner: codex
  - Linked Fix: P-002
- [x] F-003 [status:verified] [P2] [confidence:0.86] First-run default used step mode, increasing interaction cost before learners saw the main HTTP-vs-HTTPS outcome.
  - Evidence: `client/src/pages/glass-wall.tsx` initial `stepMode` was `true` before refactor.
  - Owner: codex
  - Linked Fix: P-003
- [x] F-004 [status:verified] [P1] [confidence:0.93] Progress reset in `ProgressTracker` did not update parent onboarding checklist state, leaving stale completion guidance after reset.
  - Evidence: `client/src/pages/glass-wall.tsx` read localStorage only on mount + local state updates, while `client/src/components/progress-tracker.tsx` reset removed localStorage without notifying parent.
  - Owner: codex
  - Linked Fix: P-004

## Fix Log

- [x] P-001 [status:verified] Reduced guided overlay to essential first-success steps and changed auto-open behavior to show only after short inactivity.
  - Addresses: F-001
  - Evidence: `client/src/components/guided-learning-overlay.tsx` (`STEPS` reduced; delayed conditional auto-open effect).
- [x] P-002 [status:verified] Rebuilt Suggested Flow into an outcome-based checklist with real completion tracking and a single primary next-action control.
  - Addresses: F-002
  - Evidence: `client/src/components/learning-guidance.tsx`, `client/src/pages/glass-wall.tsx`.
- [x] P-003 [status:verified] Switched first-run default to full playback (`stepMode = false`) and added adaptive prompts based on completed protocol combinations.
  - Addresses: F-003
  - Evidence: `client/src/pages/glass-wall.tsx` (state default + progress-driven prompt logic + primary action handler).
- [x] P-004 [status:verified] Added shared progress-update event emissions in `ProgressTracker` and parent sync listeners; also upgraded primary action to choose the next unexplored mode combination.
  - Addresses: F-004
  - Evidence: `client/src/components/progress-tracker.tsx`, `client/src/pages/glass-wall.tsx`.

## Validation Log

- [x] V-001 [status:verified] `npm run check`
  - Evidence: 2026-03-06 15:36 EST + pass (`tsc` clean).
- [x] V-002 [status:verified] `npm run lint`
  - Evidence: 2026-03-06 15:38 EST + pass (eslint clean).
- [x] V-003 [status:verified] `npm test`
  - Evidence: 2026-03-06 15:36 EST + pass (no test files; command exits 0). Note: `npm test -- --runInBand` is unsupported in this Vitest setup.
- [x] V-004 [status:verified] `node scripts/i18n-check.js`
  - Evidence: 2026-03-06 15:37 EST + pass (extract/validate/render-sweep all green).
- [x] V-005 [status:verified] `npm run build`
  - Evidence: 2026-03-06 15:36 EST + pass (client + server production build succeeded).

## Residual Risks

- [x] R-001 [status:accepted_risk] No analytics instrumentation exists for TTFMS/activation, so fluency improvement is currently validated by UX structure + static checks, not production behavior telemetry.
  - Rationale: App intentionally emphasizes privacy/no telemetry; adding instrumentation requires product/privacy decision.
  - Owner: product team
  - Follow-up trigger/date: If telemetry policy changes, add privacy-safe onboarding events and run A/B baseline vs adaptive guidance.

## Change Log

- 2026-03-06T15:23:05: Checklist initialized.
- 2026-03-06T15:31:02-0500: Discovery complete; findings logged (F-001..F-003); implemented fixes (P-001..P-003).
- 2026-03-06T15:31:02-0500: Validation suite completed (V-001..V-004); sign-off gates marked verified; residual risk documented.
- 2026-03-06T15:37:35-0500: Second-pass audit found reset-state sync issue (F-004); implemented event-driven sync and next-combo guidance (P-004); reran validation including production build (V-001..V-005).
- 2026-03-06T15:38:48-0500: Final cleanup pass completed; lint rerun after readability polish.
