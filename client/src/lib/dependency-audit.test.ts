import { it } from "node:test";
import assert from "node:assert/strict";
import { auditLockfile, lockfileQueries } from "../../../script/audit-lockfile";

const lockfile = {
  packages: {
    "": { name: "app", version: "1.0.0" },
    "node_modules/zod": { version: "4.6.7" },
    "node_modules/nested/node_modules/zod": { version: "4.6.7" },
    "node_modules/@scope/package": { version: "1.2.3" },
  },
};

it("scans unique lockfile versions, including scoped and nested packages", () => {
  assert.deepEqual(lockfileQueries(lockfile), [
    { package: { name: "zod", ecosystem: "npm" }, version: "4.6.7" },
    { package: { name: "@scope/package", ecosystem: "npm" }, version: "1.2.3" },
  ]);
  assert.throws(() => lockfileQueries({ packages: {} }), /empty/);
  assert.throws(() => lockfileQueries({ packages: { linked: { link: true } } }), /Unscannable/);
});

it("preserves advisories even when another audit has not reported them", async () => {
  const fetcher: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.osv.dev/v1/querybatch");
    assert.equal(options?.redirect, "error");
    assert.equal(JSON.parse(String(options?.body)).queries.length, 2);
    return Response.json({ results: [{ vulns: [{ id: "GHSA-fixture" }] }, {}] });
  };
  assert.deepEqual(await auditLockfile(lockfile, fetcher), {
    checked: 2,
    findings: [{ name: "zod", version: "4.6.7", advisory: "GHSA-fixture" }],
  });
});

it("fails closed for unavailable, incomplete or malformed OSV results", async () => {
  let requests = 0;
  const unavailable: typeof fetch = async () => {
    requests++;
    throw new Error("offline fixture");
  };
  await assert.rejects(auditLockfile(lockfile, unavailable), /failed closed/);
  assert.equal(requests, 2);
  for (const result of [
    {},
    { results: [] },
    { results: [null, {}] },
    { results: [{ vulns: [{}] }, {}] },
    { results: [{ next_page_token: "more" }, {}] },
  ]) {
    await assert.rejects(
      auditLockfile(lockfile, async () => Response.json(result)),
      /OSV returned/,
    );
  }
});

it("batches larger lockfiles without dropping or mismatching package results", async () => {
  const packages = Object.fromEntries(
    Array.from({ length: 1001 }, (_, index) => [
      `node_modules/package-${index}`,
      { version: "1.0.0" },
    ]),
  );
  const sizes: number[] = [];
  const fetcher: typeof fetch = async (_url, options) => {
    const { queries } = JSON.parse(String(options?.body));
    sizes.push(queries.length);
    return Response.json({ results: queries.map(() => ({})) });
  };
  assert.deepEqual(await auditLockfile({ packages }, fetcher), { checked: 1001, findings: [] });
  assert.deepEqual(sizes, [1000, 1]);
});

it("retries a transient provider failure but requires a complete successful response", async () => {
  let requests = 0;
  const fetcher: typeof fetch = async () => {
    requests++;
    return requests === 1
      ? new Response("retry", { status: 503 })
      : Response.json({ results: [{}, {}] });
  };
  assert.deepEqual(await auditLockfile(lockfile, fetcher), { checked: 2, findings: [] });
  assert.equal(requests, 2);
});
