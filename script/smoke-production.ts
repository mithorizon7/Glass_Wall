import { pathToFileURL } from "node:url";

export async function smokeProduction(
  release: string | undefined,
  origin = "https://theglasswall.replit.app",
) {
  if (!/^[0-9a-f]{40}$/.test(release ?? ""))
    throw new Error("An exact 40-character release SHA is required");
  const base = new URL(origin);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if (
    (base.protocol !== "https:" && !(loopback && base.protocol === "http:")) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    base.pathname !== "/"
  ) {
    throw new Error("Use a credential-free HTTPS origin, or HTTP loopback for local QA");
  }
  const check = (condition: unknown, message: string) => {
    if (!condition) throw new Error(message);
  };
  const request = (path: string, options?: RequestInit) =>
    fetch(new URL(path, base), {
      redirect: "error",
      signal: AbortSignal.timeout(20000),
      ...options,
    });
  let html = "";
  for (const path of ["/", "/api/missing", "/assets/missing.js", "/.env", "/.git/config"]) {
    const response = await request(path, { headers: { accept: "text/html" } });
    const body = await response.text();
    const headers = response.headers;
    check(response.status === (path === "/" ? 200 : 404), `Unexpected status at ${path}`);
    check(headers.get("x-glass-wall-release") === release, `Release mismatch at ${path}`);
    check(headers.get("x-content-type-options") === "nosniff", `Missing nosniff at ${path}`);
    check(headers.get("x-frame-options") === "DENY", `Missing frame restriction at ${path}`);
    check(
      headers.get("referrer-policy") === "strict-origin-when-cross-origin",
      `Unexpected referrer policy at ${path}`,
    );
    check(
      (headers.get("permissions-policy") ?? "").includes("camera=()"),
      `Missing permissions policy at ${path}`,
    );
    check(
      (headers.get("content-security-policy") ?? "").includes("frame-ancestors 'none'"),
      `Missing CSP at ${path}`,
    );
    check(!headers.has("x-powered-by"), `Backend fingerprint exposed at ${path}`);
    if (path === "/") {
      html = body;
      check((headers.get("cache-control") ?? "").includes("no-store"), "HTML must not be cached");
      check((headers.get("content-type") ?? "").includes("text/html"), "Expected HTML entry point");
      if (!loopback)
        check(
          (headers.get("strict-transport-security") ?? "").includes("max-age="),
          "Missing HTTPS edge HSTS",
        );
    } else if (path === "/api/missing") {
      check(
        (headers.get("content-type") ?? "").includes("application/json"),
        "API miss must be JSON",
      );
      check(body === '{"message":"Not Found"}', "Unexpected API error shape");
    } else check(body === "Not Found", `Unexpected fallback at ${path}`);
  }
  const assets = [
    ...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+)"/g)].map((match) => match[1])),
  ];
  check(
    assets.some((path) => path.endsWith(".js")) && assets.some((path) => path.endsWith(".css")),
    "Missing entry assets",
  );
  for (const path of assets) {
    check(new URL(path, base).origin === base.origin, "Unexpected cross-origin entry asset");
    const response = await request(path);
    check(response.status === 200, `Asset unavailable: ${path}`);
    check(
      (response.headers.get("cache-control") ?? "").includes("immutable"),
      `Asset caching mismatch: ${path}`,
    );
    const type = response.headers.get("content-type") ?? "";
    check(
      path.endsWith(".js") ? /javascript|ecmascript/.test(type) : type.includes("text/css"),
      `Asset MIME mismatch: ${path}`,
    );
    await response.arrayBuffer();
    if (path.endsWith(".js")) {
      const map = await request(`${path}.map`);
      check(map.status === 404, "Public source map must not be available");
      await map.arrayBuffer();
    }
  }
  const head = await request("/", { method: "HEAD" });
  check(head.status === 200 && (await head.text()) === "", "HEAD response mismatch");
  return {
    pass: true,
    release,
    origin: base.origin,
    boundaries: 5,
    assets: assets.length,
    time: new Date().toISOString(),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await smokeProduction(process.argv[2], process.argv[3])));
  } catch (error) {
    console.error(
      `Production smoke failed: ${error instanceof Error ? error.message : "Unknown failure"}`,
    );
    process.exitCode = 1;
  }
}
