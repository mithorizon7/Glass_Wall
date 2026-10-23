import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

type LockedPackage = { name?: string; version?: string; link?: boolean };
type Lockfile = { packages?: Record<string, LockedPackage> };
type Query = { package: { name: string; ecosystem: "npm" }; version: string };
type Finding = { name: string; version: string; advisory: string };

export function lockfileQueries(lockfile: Lockfile): Query[] {
  if (!lockfile.packages || Array.isArray(lockfile.packages)) {
    throw new Error("OSV audit requires a package-lock with package entries");
  }
  const unique = new Map<string, Query>();
  for (const [path, entry] of Object.entries(lockfile.packages)) {
    if (!path) continue;
    if (entry.link || !entry.version) throw new Error(`Unscannable lockfile package: ${path}`);
    const name = entry.name ?? path.split("node_modules/").at(-1);
    if (!name || !/^\d+\.\d+\.\d+/.test(entry.version)) {
      throw new Error(`Invalid lockfile package identity: ${path}`);
    }
    unique.set(`${name}@${entry.version}`, {
      package: { name, ecosystem: "npm" },
      version: entry.version,
    });
  }
  if (!unique.size) throw new Error("Refusing an empty OSV audit");
  return [...unique.values()];
}

export async function auditLockfile(lockfile: Lockfile, fetcher: typeof fetch = fetch) {
  const queries = lockfileQueries(lockfile);
  const findings: Finding[] = [];
  for (let offset = 0; offset < queries.length; offset += 1000) {
    const batch = queries.slice(offset, offset + 1000);
    let response: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetcher("https://api.osv.dev/v1/querybatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ queries: batch }),
          signal: AbortSignal.timeout(20000),
          redirect: "error",
        });
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
          await response.body?.cancel();
          continue;
        }
        break;
      } catch (error) {
        if (attempt === 1)
          throw new Error("OSV unavailable; release audit failed closed", { cause: error });
      }
    }
    if (!response?.ok)
      throw new Error(`OSV audit failed: HTTP ${response?.status ?? "unavailable"}`);
    const payload: unknown = await response.json();
    if (
      !payload ||
      typeof payload !== "object" ||
      !("results" in payload) ||
      !Array.isArray(payload.results) ||
      payload.results.length !== batch.length
    ) {
      throw new Error("OSV returned incomplete results; release audit failed closed");
    }
    for (const [index, result] of payload.results.entries()) {
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        throw new Error("OSV returned a malformed package result");
      }
      if (result.next_page_token) {
        throw new Error("OSV returned paginated results; release audit failed closed");
      }
      if (result.vulns === undefined) continue;
      if (!Array.isArray(result.vulns)) throw new Error("OSV returned malformed advisories");
      for (const advisory of result.vulns) {
        if (!advisory || typeof advisory.id !== "string" || !advisory.id) {
          throw new Error("OSV returned an advisory without an identity");
        }
        findings.push({
          name: batch[index].package.name,
          version: batch[index].version,
          advisory: advisory.id,
        });
      }
    }
  }
  return { checked: queries.length, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const lockfile = JSON.parse(await readFile("package-lock.json", "utf8"));
    const result = await auditLockfile(lockfile);
    console.log(JSON.stringify({ audit: "OSV", ...result }));
    if (result.findings.length) process.exitCode = 1;
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
