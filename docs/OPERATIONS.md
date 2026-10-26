# Glass Wall Operations

## Service and Owner

- Live learner site: [theglasswall.replit.app](https://theglasswall.replit.app).
- Source: [mithorizon7/Glass_Wall](https://github.com/mithorizon7/Glass_Wall), branch `main`.
- Existing operator: `mithorizon7`, verified Replit project owner and GitHub repository administrator. This handoff does not add collaborators or change access.
- Release identity and deployment receipts: [deployment guide](security/deployment.md). The public `X-Glass-Wall-Release` header identifies the built application revision; a later documentation-only commit need not be republished.

## Learner Use

Start with HTTP and VPN off, run the simulated request, then switch to HTTPS and compare what changed. Next try VPN on/off and use Learning tools for the comparison, quiz and printable reference. Quick guide is optional and always reopenable; it must not interrupt a learner reading the page. Only a completed run earns progress.

The login and credentials are fictional. No learner account, production database, file upload or external application API is required. Progress/preferences stay in the browser. Clearing browser storage removes that progress; blocked storage allows current-session learning but cannot promise persistence after reload. Google Fonts is the disclosed external font dependency.

## Routine Checks

Before a workshop or after a deployment, select the project Node runtime, install the reviewed lockfile without lifecycle scripts if needed, then run:

```sh
nvm use
npm ci --ignore-scripts
npm run smoke:production -- FULL_DEPLOYED_40_CHARACTER_SHA
```

Use the verified application revision from the deployment receipt, not an assumed latest documentation commit. The smoke command makes only GET/HEAD requests, requires HTTPS except loopback QA, fails on wrong revision/security headers/routes/assets, and prints no cookies, credentials or response bodies. Also perform one HTTP/HTTPS learner comparison and open help/printing. A point-in-time pass is not an uptime guarantee.

Weekly dependency-update PRs already exist in `.github/dependabot.yml`. The operator reviews these and security alerts; do not auto-merge a failed gate. Every PR/main build runs the Linux release gate: patched runtime, lifecycle-disabled clean install, npm and independent OSV audits, TypeScript, tests, i18n, ESLint, formatting and production build. An unavailable/incomplete OSV result fails closed. The test worker budget is four, retaining the 30-second per-file deadline and all failure assertions.

No new external uptime subscription, monitoring automation, billing commitment or alert recipient was created. Replit Active monitoring was off in the inspected UI, and its detailed metrics were unavailable. The existing operator owns these routine checks; ongoing unattended monitoring is not implied.

## Deploy and Recover

1. Review changes through GitHub with green final-head CI. Preserve Replit-only history, including empty publishing checkpoints, in a review branch and normal merges. Never force-reset it.
2. Integrate the exact approved revision into Replit with a clean tracked tree. Keep engine checks, lifecycle restrictions, runtime checksums and the supported Node 22 module. Run the full existing deployment build gate; do not run database migrations.
3. Publish only to the existing public Autoscale app, without changing resources, secrets, data or access. Retain actual publishing/build IDs and production runtime-ready revision/dirty/lock evidence.
4. Match the public release header and run the smoke command and learner/print checks. Do not substitute a successful preview or local build for actual publication.
5. If release validation fails, stop promotion or use a previously verified **patched** artifact/configuration. A vulnerable historical baseline is not a safe default rollback. Restore a private Git bundle into a new directory, verify its history and compare before integrating; never extract over a running workspace.

Source is also retained off-host in GitHub. Four existing Replit Git bundles were restored into separate new bare repositories and passed full Git integrity checks on October 26. These workspace-local archives are not an off-host backup of ignored secrets or managed databases. A separate private local all-refs bundle was verified before closeout. No raw archive, secret or production log is committed to this repository.

## Explicit Limits

The [October 26 closeout](security/2026-10-26-closeout.md) separates executed checks from unavailable evidence. Real novice trials and physical-device/retail-Safari testing are not represented by automated engine checks. Provider-managed host/image/kernel/edge attestations, federated-account MFA assurance and unavailable resource/backup policies are not certified.

Historical production health-check 500s were confirmed in sampled provider logs, but no cause or currently reproducible application exception was established. Retained evidence and a provider-investigation draft are in the closeout. Preserve new failures with UTC time, release/build ID and sanitized exception/status metadata; never log credentials, lesson payloads or request bodies.
