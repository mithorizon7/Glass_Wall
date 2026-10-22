import { readFileSync } from "node:fs";

const required = readFileSync(new URL("../.nvmrc", import.meta.url), "utf8").trim();
const actual = process.versions.node.split(".").map(Number);
const minimum = required.split(".").map(Number);
const supported =
  actual[0] === minimum[0] &&
  (actual[1] > minimum[1] || (actual[1] === minimum[1] && actual[2] >= minimum[2]));
if (!supported) {
  console.error(
    `Node ${required} or a newer Node ${minimum[0]}.x patch is required; found ${process.versions.node}.`,
  );
  process.exitCode = 1;
}
