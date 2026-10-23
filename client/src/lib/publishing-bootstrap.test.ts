import { it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

it(
  "rejects old runtimes even when npm lifecycle hooks are disabled",
  { timeout: 10000 },
  async () => {
    const root = new URL("../../../", import.meta.url);
    const npmrc = await readFile(new URL(".npmrc", root), "utf8");
    assert.match(npmrc, /^engine-strict=true$/m);
    assert.match(npmrc, /^ignore-scripts=true$/m);
    const replit = await readFile(new URL(".replit", root), "utf8");
    const moduleDeclaration = replit.match(/^modules\s*=\s*(\[.*\])$/m);
    assert.ok(moduleDeclaration, "declare the initial runtime explicitly");
    const modules: string[] = JSON.parse(moduleDeclaration[1]);
    assert.deepEqual(
      modules.filter((module) => module.startsWith("nodejs-")),
      ["nodejs-22"],
      "do not let automatic module selection substitute a different Node major",
    );
    const manifest = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
    const npm = process.env.npm_execpath;
    assert.ok(npm, "run the release tests through npm test");
    const directory = await mkdtemp(join(tmpdir(), "glass-wall-runtime-guard-"));
    const shim = join(directory, "old-runtime.mjs");
    try {
      // Change only this fixture child's reported version, never the actual release runtime.
      await writeFile(
        shim,
        'Object.defineProperty(process.versions, "node", { value: "22.22.0" });\n',
      );
      const env: NodeJS.ProcessEnv = {
        ...process.env,
        NODE_OPTIONS: `--import=${pathToFileURL(shim).href}`,
      };
      delete env.NODE_TEST_CONTEXT;
      for (const command of ["dev", "build", "start"]) {
        assert.match(manifest.scripts[command], /^node script\/check-runtime\.mjs && /);
        const child: SpawnSyncReturns<string> = spawnSync(
          process.execPath,
          [npm, "run", command, "--ignore-scripts"],
          {
            cwd: root,
            env,
            encoding: "utf8",
            timeout: 2500,
          },
        );
        assert.ifError(child.error);
        assert.equal(child.status, 1, command);
        assert.match(child.stderr, /Node 22\.23\.4.*required; found 22\.22\.0\./, command);
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
