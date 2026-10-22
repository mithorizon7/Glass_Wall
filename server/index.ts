import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { createErrorHandler } from "./error-handler";
import { buildInfo } from "./build-info";

const app = express();
const httpServer = createServer(app);
const isProd = process.env.NODE_ENV === "production";
let closeDevelopmentServer: (() => Promise<void>) | undefined;

async function cleanUpDevelopmentServer() {
  try {
    await closeDevelopmentServer?.();
  } catch {
    log("Development server cleanup failed", "error");
  }
}

app.disable("x-powered-by");

app.use((_req, res, next) => {
  // Baseline hardening headers that are safe for this SPA/API setup.
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (buildInfo) res.setHeader("X-Glass-Wall-Release", buildInfo.revision);
  next();
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "100kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 200 }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(
        JSON.stringify({
          method: req.method,
          path: path.slice(0, 200),
          status: res.statusCode,
          duration,
        }),
      );
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    const vite = await setupVite(httpServer, app);
    closeDevelopmentServer = () => vite.close();
  }
  app.use(createErrorHandler(isProd, (message) => log(message, "error")));

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT || "5000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  const host = process.env.HOST || (isProd || process.env.REPL_ID ? "0.0.0.0" : "127.0.0.1");
  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    log(`HTTP server failed to listen (${error.code ?? "UNKNOWN"}); check HOST and PORT`, "error");
    process.exitCode = 1;
    void cleanUpDevelopmentServer();
  });
  httpServer.listen(
    {
      port,
      host,
    },
    () => {
      log(
        JSON.stringify({
          event: "runtime-ready",
          node: process.version,
          openssl: process.versions.openssl,
          platform: process.platform,
          arch: process.arch,
          build: buildInfo ?? null,
        }),
      );
      log(`serving on port ${port}`);
    },
  );
})().catch(async () => {
  log("Server startup failed; check runtime, build artifacts, and configuration", "error");
  process.exitCode = 1;
  await cleanUpDevelopmentServer();
});
