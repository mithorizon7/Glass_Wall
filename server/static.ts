import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { sendSpaFallbackNotFound, shouldServeSpaFallback } from "./spa-fallback";

export function serveStatic(app: Express, distPath = path.resolve(__dirname, "public")) {
  const indexPath = path.resolve(distPath, "index.html");
  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  const html = fs.readFileSync(indexPath, "utf8");
  const scriptHashes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attributes, body]) => !/\bsrc\s*=/i.test(attributes) && body.trim())
    .map(([, , body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' ${scriptHashes.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
  app.use((_req, res, next) => {
    res.setHeader("Content-Security-Policy", contentSecurityPolicy);
    next();
  });

  app.use(
    express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          // Never cache HTML entry so it cannot point to stale, deleted bundles.
          res.setHeader("Cache-Control", "no-store, max-age=0");
          return;
        }

        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          // Vite assets are content-hashed, so immutable long cache is safe.
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=3600");
      },
    }),
  );

  app.use((req, res, next) => {
    if (
      !shouldServeSpaFallback({
        method: req.method,
        path: req.path,
        acceptHeader: req.headers.accept,
        acceptsHtml: req.accepts("html") !== false,
      })
    ) {
      sendSpaFallbackNotFound(req.path, res);
      return;
    }

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.sendFile(indexPath, (error) => {
      if (error) next(error);
    });
  });
}
