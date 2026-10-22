import type { RequestHandler } from "express";

export function createDevAccessGuard(additionalHosts: string[] = []): RequestHandler {
  const allowed = new Set([
    "localhost",
    "127.0.0.1",
    "[::1]",
    ...additionalHosts.map((host) => host.toLowerCase()),
  ]);
  return (req, res, next) => {
    try {
      const host = new URL(`http://${req.headers.host ?? ""}`);
      if (
        !allowed.has(host.hostname) ||
        host.username ||
        host.password ||
        host.pathname !== "/" ||
        host.search ||
        host.hash
      ) {
        res.status(403).type("text/plain").send("Forbidden");
        return;
      }
      const origin = req.headers.origin;
      if (origin) {
        const parsedOrigin = new URL(origin);
        if (
          !["http:", "https:"].includes(parsedOrigin.protocol) ||
          parsedOrigin.host !== host.host ||
          parsedOrigin.username ||
          parsedOrigin.password ||
          parsedOrigin.pathname !== "/" ||
          parsedOrigin.search ||
          parsedOrigin.hash
        ) {
          res.status(403).type("text/plain").send("Forbidden");
          return;
        }
      }
      next();
    } catch {
      res.status(403).type("text/plain").send("Forbidden");
    }
  };
}
