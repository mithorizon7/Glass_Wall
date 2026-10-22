import { it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

it("the scoped legacy loader override still transforms TypeScript and dynamic imports", () => {
  const require = createRequire(import.meta.url);
  const loaderRequire = createRequire(require.resolve("@esbuild-kit/esm-loader"));
  const { transformSync } = loaderRequire("@esbuild-kit/core-utils");
  const result = transformSync(
    "export const answer: number = 42; export const load = () => import('node:path');",
    "/tmp/glass-wall-loader-fixture.ts",
    { format: "cjs" },
  );
  assert.match(result.code, /42/);
  assert.match(result.code, /node:path/);
  assert.ok(!result.code.includes(": number"));
});

it("Drizzle can generate the existing schema without database access", async () => {
  const directory = await mkdtemp(join(tmpdir(), "glass-wall-schema-"));
  try {
    const { DATABASE_URL: _unusedDatabaseUrl, ...env } = process.env;
    const result = spawnSync(
      process.execPath,
      [
        "node_modules/drizzle-kit/bin.cjs",
        "generate",
        "--dialect=postgresql",
        "--schema=./shared/schema.ts",
        `--out=${directory}`,
      ],
      { cwd: root, env, encoding: "utf8", timeout: 15000 },
    );
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const migration = (await readdir(directory)).find((file) => file.endsWith(".sql"));
    assert.ok(migration);
    assert.match(await readFile(join(directory, migration), "utf8"), /CREATE TABLE "users"/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
