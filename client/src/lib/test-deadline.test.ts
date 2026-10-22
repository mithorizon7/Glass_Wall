import { it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

it("fails closed when a test worker retains a filesystem watcher", async () => {
  const directory = await mkdtemp(join(tmpdir(), "glass-wall-deadline-"));
  try {
    await writeFile(join(directory, "watched.txt"), "fixture");
    const fixture = join(directory, "leaked-watcher.test.mjs");
    await writeFile(
      fixture,
      "import { test } from 'node:test';\n" +
        "import { watch } from 'node:fs';\n" +
        "test('leaked watcher fixture', () => {});\n" +
        "watch(new URL('./watched.txt', import.meta.url), () => {});\n",
    );
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, ["--test", "--test-timeout=2000", fixture], {
      encoding: "utf8",
      timeout: 10000,
      env,
    });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /ok 1 - leaked watcher fixture/);
    assert.match(result.stdout, /testTimeoutFailure/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
