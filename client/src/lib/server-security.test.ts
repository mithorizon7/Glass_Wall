import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { mkdtemp, mkdir, rm, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import express from "express";
import { serveStatic } from "../../../server/static";
import { createErrorHandler } from "../../../server/error-handler";
import { createDevAccessGuard } from "../../../server/dev-access";
import { setupVite } from "../../../server/vite";

describe("production HTTP boundary", () => {
  let directory: string;
  let server: Server;
  let base: string;
  const logs: string[] = [];
  const bootstrap = "window.demoReady = true;";

  before(async () => {
    directory = await mkdtemp(join(tmpdir(), "glass-wall-http-test-"));
    await mkdir(join(directory, "assets"));
    await writeFile(join(directory, "index.html"), `<html><script>${bootstrap}</script></html>`);
    await writeFile(join(directory, "assets/demo-12345678.js"), "export default true;");
    await writeFile(join(directory, ".env"), "FIXTURE_ONLY=not-a-secret");
    const app = express();
    app.use(express.json({ limit: "100kb" }));
    app.get("/api/error", () => {
      throw new Error("private diagnostic marker");
    });
    app.get("/api/invalid-status", () => {
      throw { status: 700 };
    });
    serveStatic(app, directory);
    app.use(createErrorHandler(true, (entry) => logs.push(entry)));
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    base = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (server)
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    if (directory) await rm(directory, { recursive: true, force: true });
  });

  it("returns JSON 404 for API misses and never serves the HTML shell", async () => {
    const response = await fetch(`${base}/api/missing`, { headers: { accept: "text/html" } });
    assert.equal(response.status, 404);
    assert.match(response.headers.get("content-type") ?? "", /application\/json/);
    assert.deepEqual(await response.json(), { message: "Not Found" });
  });

  it("rejects missing assets, dotfiles, unsupported methods, and JSON navigations", async () => {
    for (const [path, options] of [
      ["/assets/stale.js", {}],
      ["/.env", {}],
      ["/%2eenv", {}],
      ["/.git/config", {}],
      ["/lesson", { method: "POST" }],
      ["/lesson", { headers: { accept: "application/json" } }],
    ] as const) {
      const response = await fetch(base + path, options);
      assert.equal(response.status, 404, path);
      assert.equal(await response.text(), "Not Found");
    }
  });

  it("serves uncached HTML and hashes the actual inline bootstrap in CSP", async () => {
    const response = await fetch(`${base}/lesson`, { headers: { accept: "text/html" } });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
    const policy = response.headers.get("content-security-policy") ?? "";
    const hash = createHash("sha256").update(bootstrap).digest("base64");
    assert.ok(policy.includes(`'sha256-${hash}'`));
    assert.ok(policy.includes("frame-ancestors 'none'"));
    assert.ok(policy.includes("form-action 'none'"));
    assert.ok(
      !policy
        .split(";")
        .find((part) => part.startsWith("script-src"))
        ?.includes("unsafe-inline"),
    );
    assert.match(await response.text(), /demoReady/);
  });

  it("supports HEAD and long-lived caching only for assets", async () => {
    const response = await fetch(`${base}/lesson`, { method: "HEAD" });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
    const asset = await fetch(`${base}/assets/demo-12345678.js`);
    assert.equal(asset.status, 200);
    assert.match(asset.headers.get("cache-control") ?? "", /immutable/);
  });

  it("redacts 5xx errors, validates status codes, and keeps diagnostics out of logs", async () => {
    for (const path of ["/api/error", "/api/invalid-status"]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 500);
      assert.deepEqual(await response.json(), { message: "Internal Server Error" });
    }
    assert.ok(logs.length >= 2);
    assert.ok(!logs.join(" ").includes("private diagnostic marker"));
  });

  it("enforces the request limit and redacts malformed JSON diagnostics", async () => {
    const response = await fetch(`${base}/api/missing`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{private-marker",
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { message: "Bad Request" });
    const large = await fetch(`${base}/api/missing`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify("x".repeat(110000)),
    });
    assert.equal(large.status, 413);
    assert.ok(!logs.join(" ").includes("private-marker"));
  });

  it("handles missing entry files through the final error boundary", async () => {
    await unlink(join(directory, "index.html"));
    const response = await fetch(`${base}/lesson`, { headers: { accept: "text/html" } });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { message: "Not Found" });
  });
});

describe("development access boundary", () => {
  const guard = createDevAccessGuard(["preview.example.test"]);
  function check(host: string, origin?: string) {
    let status = 200;
    let continued = false;
    const request = { headers: { host, origin } } as Parameters<typeof guard>[0];
    const response = {
      status(code: number) {
        status = code;
        return this;
      },
      type() {
        return this;
      },
      send() {
        return this;
      },
    } as unknown as Parameters<typeof guard>[1];
    guard(request, response, () => {
      continued = true;
    });
    return { status, continued };
  }
  it("accepts loopback and the explicitly configured preview host", () => {
    assert.equal(check("localhost:5000").continued, true);
    assert.equal(check("127.0.0.1:5000", "http://127.0.0.1:5000").continued, true);
    assert.equal(check("[::1]:5000").continued, true);
    assert.equal(check("preview.example.test", "https://preview.example.test").continued, true);
  });
  it("rejects DNS rebinding hosts, foreign origins, and malformed headers", () => {
    for (const [host, origin] of [
      ["untrusted.example", undefined],
      ["localhost:5000", "https://untrusted.example"],
      ["localhost:5000", "null"],
      ["localhost:5000", "ftp://localhost:5000"],
      ["localhost:5000", "http://user@localhost:5000"],
      ["localhost:5000", "http://localhost:5000/path"],
      ["untrusted@localhost:5000", undefined],
      ["localhost:5000/path", undefined],
      ["localhost:5000?ignored=true", undefined],
      ["localhost:5000#ignored", undefined],
      ["", undefined],
    ]) {
      assert.deepEqual(check(host as string, origin), { status: 403, continued: false });
    }
  });
});

it("delegates errors after headers have been sent without writing a second response", () => {
  const error = new Error("fixture diagnostic");
  let delegated: unknown;
  const handler = createErrorHandler(true, () => assert.fail("unexpected log"));
  handler(
    error,
    {} as Parameters<typeof handler>[1],
    { headersSent: true } as Parameters<typeof handler>[2],
    (received: unknown) => {
      delegated = received;
    },
  );
  assert.equal(delegated, error);
});

it("retains filesystem restrictions in the actual Vite middleware server", async () => {
  const app = express();
  const server = createServer(app);
  const vite = await setupVite(server, app);
  try {
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const base = `http://127.0.0.1:${address.port}`;
    const root = resolve(import.meta.dirname, "../../..");
    for (const file of [".npmrc", "server/index.ts"]) {
      const response = await fetch(`${base}/@fs${root}/${file}`);
      assert.equal(response.status, 403, file);
    }
    const client = await fetch(`${base}/@vite/client`);
    assert.equal(client.status, 200);
  } finally {
    await vite.close();
    if (server.listening) await new Promise<void>((done) => server.close(() => done()));
  }
});

it("closes development watchers and exits when startup configuration is invalid", () => {
  const result = spawnSync(process.execPath, ["--import", "tsx", "server/index.ts"], {
    cwd: resolve(import.meta.dirname, "../../.."),
    env: { ...process.env, NODE_ENV: "development", HOST: "127.0.0.1", PORT: "0" },
    encoding: "utf8",
    timeout: 10000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Server startup failed/);
});
