# Verified Replit Release

## Runtime and Build

Development requires Node 22.23.4 or a newer maintained 22.x patch. Select `.nvmrc` in the terminal/IDE before installing. Do not disable engine checks to use an older runtime.

The Replit Run workflow uses `script/replit-dev.sh`: the same checksummed runtime installer and a lifecycle-disabled clean install precede development startup. This avoids the stale provider Node wrapper without changing the runtime floor, host/origin restrictions or filesystem protections.

Replit deployment uses `script/replit-build.sh`, not the provider's potentially stale Node wrapper. It downloads official Linux Node 22.23.4, verifies the pinned SHA-256 before extraction, installs packages without lifecycle scripts, audits the entire dependency graph and runs type checking, tests, localization lint, ESLint, formatting and the production build. It never contacts the application database. The `.runtime/` directory must remain in the deployment image, but is ignored by Git. Startup requires that runtime and runs the guard again; it does not download software or relax the security floor.

Formatting covers the explicit application, tooling and documentation directories and root configuration files. Generated Replit/Bun caches are not release sources and must not be formatted or included in the gate.

Replit's automatic hosting package installer is disabled with `packager.features.enabledForHosting = false`. It otherwise runs the provider's old Node/npm before the custom build and fails the engine guard. This documented setting removes only the redundant uncontrolled install; the deployment build still verifies Node, installs the lockfile without lifecycle scripts, audits all dependencies and runs every quality check. The runtime guard must not be weakened to make the provider's preliminary install succeed. See [Replit packager configuration](https://docs.replit.com/features/project-setup/configuration#packager-configuration).

Runtime checksums come from the [official Node manifest](https://nodejs.org/dist/v22.23.4/SHASUMS256.txt). Updating `.nvmrc` also requires reviewing and updating the two deployment checksums. Unsupported platforms fail closed. Never disable certificate verification.

Runtime caches are checksum-addressed. Every installer run verifies a fresh archive and compares an existing cache byte-for-byte, including symlink identity, before reusing it. A new cache is renamed into place as a complete directory. Existing executables are never overwritten while a preview might be using them; a modified cache fails closed instead of being silently repaired. CI repeats installation while that Node runtime is running.

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
