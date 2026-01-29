import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
          await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/wouter/") ||
            id.includes("/@tanstack/") ||
            id.includes("/react-hook-form/") ||
            id.includes("/react-i18next/") ||
            id.includes("/i18next/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("/@radix-ui/") ||
            id.includes("/lucide-react/") ||
            id.includes("/framer-motion/") ||
            id.includes("/embla-carousel-react/") ||
            id.includes("/vaul/") ||
            id.includes("/cmdk/") ||
            id.includes("/react-icons/") ||
            id.includes("/react-resizable-panels/")
          ) {
            return "vendor-ui";
          }
          if (id.includes("/recharts/") || id.includes("/date-fns/")) {
            return "vendor-charts";
          }
          if (id.includes("/intl-messageformat/")) {
            return "vendor-i18n";
          }
          return "vendor";
        },
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
