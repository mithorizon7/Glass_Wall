import { it } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { compile } from "tailwindcss";

it("keeps icon sizing on supported Tailwind utilities", async () => {
  const directory = new URL("../components/", import.meta.url);
  const files = await readdir(directory, { recursive: true });
  for (const file of files.filter((name) => name.endsWith(".tsx"))) {
    const source = await readFile(new URL(file, directory), "utf8");
    assert.doesNotMatch(source, /\bflex-(?:shrink|grow)(?:-\d+)?\b/, file);
  }
  const compiler = await compile("@tailwind utilities;");
  assert.match(compiler.build(["shrink-0"]), /\.shrink-0\s*\{\s*flex-shrink:\s*0;/);
});
