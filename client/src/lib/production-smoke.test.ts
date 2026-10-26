import assert from "node:assert/strict";
import { it } from "node:test";
import { smokeProduction } from "../../../script/smoke-production";

it("rejects ambiguous release IDs and unsafe smoke-test origins before network access", async () => {
  await assert.rejects(smokeProduction("main"), /exact 40-character/);
  for (const origin of [
    "http://example.com",
    "https://user:password@example.com",
    "https://example.com/?token=secret",
    "https://example.com/path",
    "https://example.com/#fragment",
  ]) {
    await assert.rejects(smokeProduction("a".repeat(40), origin), /credential-free HTTPS origin/);
  }
});
