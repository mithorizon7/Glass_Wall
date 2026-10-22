# Verified Replit Release

## Runtime and Build

Development requires Node 22.23.4 or a newer maintained 22.x patch. Select `.nvmrc` in the terminal/IDE before installing. Do not disable engine checks to use an older runtime.

The Replit Run workflow uses `script/replit-dev.sh`: the same checksummed runtime installer and a lifecycle-disabled clean install precede development startup. This avoids the stale provider Node wrapper without changing the runtime floor, host/origin restrictions or filesystem protections.

The configured Replit deployment build is `script/replit-build.sh`. Once reached, it downloads official Linux Node 22.23.4, verifies the pinned SHA-256 before extraction, installs packages without lifecycle scripts, audits the entire dependency graph and runs type checking, tests, localization lint, ESLint, formatting and the production build. It never contacts the application database. The `.runtime/` directory must remain in the deployment image, but is ignored by Git. Startup requires that runtime and runs the guard again; it does not download software or relax the security floor.

Formatting covers the explicit application, tooling and documentation directories and root configuration files. Generated Replit/Bun caches are not release sources and must not be formatted or included in the gate.

**Publishing is currently blocked.** The project requests `packager.features.enabledForHosting = false`, a [documented Replit setting](https://docs.replit.com/features/project-setup/configuration#packager-configuration), but the actual publishing builder still performed its own `npm install` before the custom build on October 22, 2026. Both attempted publishes failed closed. The second, at 20:03:55-20:04:11 UTC, used Node 22.22.0/npm 10.9.4 and failed `EBADENGINE`; the available standard Node 22 module also advertised 22.22.0. The logs do not explain why this builder ignored the classic packager flag. Do not treat that setting, workspace preview, or successful candidate build as proof of a successful publication.

The reviewed initialization correction uses the supported `replit.nix` system-dependency mechanism. It pins Nixpkgs revision `5873d3da531a3a8320c9e639e2147eccbe7f2d0d` with source-tree integrity hash `sha256-Ez3EbOIpR9xODoL4V7zgYSZMYKLjMjNYQKyEu70a6GY=`, matching the Node entry in [Replit's immutable upstream module lockfile](https://github.com/replit/nixmodules/blob/a8970e5ae1ec9bcb1865de426b37d74a5957da2b/flake.lock). The source package declares Node 22.23.4 and the expression asserts that exact version. The competing stale `nodejs-22` module is omitted; web/PostgreSQL modules, resources and build/run commands are unchanged. This initializes system dependencies before the later custom build. The Nix hash covers the normalized unpacked source tree, not the official Node archive bytes. Both pins must be reviewed when updating runtimes.

The proposed Nix expression was evaluated and its realized package reported Node 22.23.4/npm 10.9.9/OpenSSL 3.5.9; recursive store integrity/trust verification passed under the existing Nix trust policy. Independently downloaded upstream sources confirm the revision, source hash and declared Node version. Those observations do not prove automatic selection in a new publishing builder: verify its actual initial environment and the full Linux gate before retrying, then retain actual publishing logs. See [Replit environment configuration](https://docs.replit.com/features/project-setup/configuration#replitnix-file).

Project `.npmrc` disables install lifecycle scripts, including for the preliminary install. Since npm also suppresses pre/post run hooks with this option, `dev`, `build` and `start` explicitly execute the runtime guard in the main command. A regression runs all three through npm with hooks disabled and a fixture reporting the old Node version, verifying that the entrypoints never start. The existing prestart/predev checks are retained for callers that explicitly re-enable hooks. See [npm ignore-scripts behavior](https://docs.npmjs.com/cli/v10/using-npm/config#ignore-scripts).

Do not lower the engine floor, disable `engine-strict`, enable install lifecycle scripts, skip audits/tests, or blindly republish the unchanged configuration. No new production release has been confirmed; the previously published app remains available but retains the audit's known delivery gaps.

Runtime checksums come from the [official Node manifest](https://nodejs.org/dist/v22.23.4/SHASUMS256.txt). Updating `.nvmrc` also requires reviewing and updating the two deployment checksums. Unsupported platforms fail closed. Never disable certificate verification.

Runtime caches are checksum-addressed. Every installer run verifies a fresh archive and compares an existing cache byte-for-byte, including symlink identity, before reusing it. A new cache is renamed into place as a complete directory. Existing executables are never overwritten while a preview might be using them; a modified cache fails closed instead of being silently repaired. CI repeats installation while that Node runtime is running.

The test runner applies a 30-second per-test-file deadline. A retained watcher cancels the file and exits nonzero, blocking deployment rather than hanging indefinitely or reporting success. A regression fixture deliberately retains a filesystem watcher to verify this behavior. A separate controlled regression reproduces the Vite/Chokidar native-watch allocation/shutdown race and verifies the close barrier; it forces the native backend on macOS as well as Linux. Neither check hides a failure with a forced-success process exit.

## Release Procedure

1. Preserve Replit-only files and Git refs in a private recoverable backup. Never upload ignored files, credentials, databases or raw logs to the public repository.
2. Review and merge the security branch with passing checks. Integrate the exact approved revision into Replit without resetting or deleting its separate history. Resolve only reviewed conflicts.
3. Run the deployment build gate in Replit. Review the source revision and working-tree state before publishing. Unreviewed tracked changes require a fresh review/build.
4. Publish to the existing public Autoscale app. Do not change sharing, resources, secrets, database schemas or account permissions as part of a routine release.
5. Verify the new publishing ID and the production `runtime-ready` log: Node v22.23.4, OpenSSL 3.5.9, approved source revision, `dirty: false` and expected lock hash. Match `X-Glass-Wall-Release` on public responses to that revision.
6. Recheck root 200 with CSP/nosniff/frame/referrer/permissions headers and no Express fingerprint; missing API, assets and dotfiles must return 404, not HTML 200. Check hashed assets, HTML no-store and no public source maps.
7. In the published browser, complete HTTP and HTTPS without a VPN. Disable Auto-play, toggle VPN without running, and confirm progress stays at 2/4 until a new run completes. Check mobile layout, language switching, keyboard access and learning tools.

The release header identifies the bundle's build-time Git revision, not provider image/kernel provenance. Keep runtime/build logs private and retain only sanitized metadata in the audit report.

## Compatibility

Tailwind 4 requires Safari 16.4+, Chrome 111+ and Firefox 128+. Current browsers are the supported learner environment; older engines are not verified. The simulation remains browser-local. Google Fonts is the disclosed external font dependency. Progress survives blocked browser storage within the current session, but cannot persist across reloads when storage is unavailable.

## Recovery

Keep the previous deployment and private backup available while verifying the new release. If the new service fails its gate, do not promote it or lower the runtime floor. Rebuild from the reviewed revision or use an already verified patched release. Restoring the old vulnerable release is an explicit emergency availability/security tradeoff, not an automatic safe rollback. Do not extract a backup over a live workspace: recover into a new private directory and compare first.

Provider kernel/edge patches, managed-database permissions/backups, global workstation tools and historical cloud incident investigation require their respective owners. Application QA and zero current advisory matches do not establish that those separate systems are secure.
