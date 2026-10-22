import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { sendSpaFallbackNotFound, shouldServeSpaFallback } from "./spa-fallback";
import { createDevAccessGuard } from "./dev-access";

const viteLogger = createLogger();

export async function setupVite(server: Server, app: Express) {
  const allowedHosts = process.env.REPLIT_DEV_DOMAIN ? [process.env.REPLIT_DEV_DOMAIN] : [];
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts,
    cors: false as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
    server: { ...viteConfig.server, ...serverOptions },
    appType: "custom",
  });

  app.use(createDevAccessGuard(allowedHosts));
  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
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

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "text/html",
      });
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      res.end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });

  return vite;
}
