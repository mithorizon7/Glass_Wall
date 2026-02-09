import "./polyfills";
import { createRoot } from "react-dom/client";
import "./index.css";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
}

function resetInitialScrollPosition() {
  if (typeof window === "undefined") return;
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function showFatalError(error: unknown) {
  const root = document.getElementById("root");
  if (!root) return;

  const container = document.createElement("div");
  container.setAttribute("role", "alert");
  container.style.cssText = [
    "margin: 24px auto",
    "max-width: 960px",
    "padding: 16px",
    "border: 1px solid rgba(220,38,38,0.35)",
    "border-radius: 12px",
    "background: rgba(254,242,242,0.95)",
    "color: rgb(127,29,29)",
    "font-family: ui-monospace, SFMono-Regular, Menlo, monospace",
    "white-space: pre-wrap",
    "line-height: 1.45",
  ].join(";");
  container.textContent = `App failed to load.\n${getErrorMessage(error)}`;

  root.replaceChildren(container);
}

window.addEventListener("error", (event) => {
  if (event.error) {
    showFatalError(event.error);
  }
});

window.addEventListener("unhandledrejection", (event) => {
  showFatalError(event.reason);
});

async function boot() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element '#root' not found");
  }

  // Prevent restored mid-page positions from making the hero appear "cut off" on load.
  resetInitialScrollPosition();

  await import("./lib/i18n");
  const { default: App } = await import("./App");
  createRoot(root).render(<App />);
}

boot().catch((error) => {
  showFatalError(error);
});
