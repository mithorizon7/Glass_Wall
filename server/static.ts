import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  const indexPath = path.resolve(distPath, "index.html");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

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

  app.use("*", (req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status(404).type("text/plain").send("Not Found");
      return;
    }

    // API routes should never fall through to SPA HTML.
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    // Never rewrite missing files (e.g. stale JS chunks) to HTML.
    if (path.extname(req.path)) {
      res.status(404).type("text/plain").send("Not Found");
      return;
    }

    const acceptHeader = req.headers.accept ?? "";
    const acceptsHtml = acceptHeader === "" || req.accepts("html");
    if (!acceptsHtml) {
      res.status(404).type("text/plain").send("Not Found");
      return;
    }

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.sendFile(indexPath);
  });
}
