import { it } from "node:test";
import assert from "node:assert/strict";
import fs, { type FSWatcher } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { EventEmitter, once } from "node:events";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setImmediate } from "node:timers/promises";
import express from "express";
import { setupVite } from "../../../server/vite";

it(
  "closes native watches when shutdown starts during watch allocation",
  { timeout: 10000 },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "glass-wall-watch-shutdown-"));
    // Exercise Node native watches on macOS too, instead of its default FSEvents backend.
    const vite = await setupVite(createServer(), express(), {
      useFsEvents: false,
      usePolling: false,
    });
    const allocation = new EventEmitter();
    const allocated = once(allocation, "allocated", { signal: t.signal });
    const watch = fs.watch;
    let nativeWatcher: FSWatcher | undefined;
    let nativeClosed = false;
    let shutdown: Promise<void> | undefined;

    t.mock.method(fs, "watch", (...args: Parameters<typeof fs.watch>) => {
      const watcher: FSWatcher = Reflect.apply(watch, fs, args);
      if (String(args[0]) === directory) {
        nativeWatcher = watcher;
        watcher.once("close", () => {
          nativeClosed = true;
        });
        // Reproduce shutdown between native allocation and Chokidar's closer registration.
        shutdown = vite.close();
        allocation.emit("allocated");
      }
      return watcher;
    });

    try {
      vite.watcher.add(directory);
      await allocated;
      assert.ok(shutdown);
      await shutdown;
      await setImmediate();
      assert.equal(nativeClosed, true, "Vite shutdown must close the allocated native watch");
      assert.deepEqual(vite.watcher.getWatched(), {});
    } finally {
      t.mock.restoreAll();
      // A failing regression must release its diagnostic watch without hiding the failure.
      nativeWatcher?.close();
      await vite.close();
      await rm(directory, { recursive: true, force: true });
    }
  },
);
