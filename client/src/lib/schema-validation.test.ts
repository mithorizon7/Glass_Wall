import { it } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fromError } from "zod-validation-error";
import { insertUserSchema } from "../../../shared/schema";

it("rejects oversized constrained arrays before parsing their elements", () => {
  let visited = 0;
  const schema = z
    .array(
      z.string().refine(() => {
        visited++;
        return false;
      }),
    )
    .max(2);
  const result = schema.safeParse(["one", "two", "three"]);
  assert.equal(result.success, false);
  assert.equal(visited, 0, "the size limit must apply before allocating per-element issues");
  if (!result.success) {
    assert.equal(result.error.issues.length, 1);
    assert.equal(result.error.issues[0].code, "too_big");
  }
});

it("keeps Drizzle schema, form resolver and validation messages compatible with patched Zod", async () => {
  const data = { username: "fictional-learner", password: "fictional-fixture" };
  assert.deepEqual(insertUserSchema.parse(data), data);
  const invalid = insertUserSchema.safeParse({ username: "fictional-learner" });
  assert.equal(invalid.success, false);
  if (!invalid.success) assert.match(fromError(invalid.error).message, /password/);

  const resolver = zodResolver(insertUserSchema.extend({ username: z.string().min(1) }));
  const options = {
    criteriaMode: "firstError" as const,
    shouldUseNativeValidation: false,
    fields: {},
  };
  assert.deepEqual(await resolver(data, undefined, options), { errors: {}, values: data });
  const result = await resolver(
    { username: "", password: "fictional-fixture" },
    undefined,
    options,
  );
  assert.ok("username" in result.errors);
  assert.deepEqual(result.values, {});
});
