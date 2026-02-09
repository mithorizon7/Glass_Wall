import "./polyfills";
import { createRoot } from "react-dom/client";
import "./index.css";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ? error.stack : `${error.name}: ${error.message}`;
  }
  return String(error);
}

function resetInitialScrollPosition() {
  if (typeof window === "undefined") return;
  if (window.location.hash) return;

  // Preserve expected browser behavior for history navigation.
  const navigationEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (navigationEntry?.type === "back_forward") {
    return;
  }

  const previousScrollRestoration = window.history.scrollRestoration;
  // Disable browser/session scroll restoration during first paint.
  window.history.scrollRestoration = "manual";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Run multiple times to override browser/session restoration timing differences.
  scrollToTop();
  const timeoutIds = [0, 60, 220].map((delay) => window.setTimeout(scrollToTop, delay));
  let nestedRafId: number | null = null;
  const rafId = window.requestAnimationFrame(() => {
    scrollToTop();
    nestedRafId = window.requestAnimationFrame(scrollToTop);
  });
  const handlePageShow = (event: PageTransitionEvent) => {
    // Keep bfcache navigation restoration behavior.
    if (event.persisted) return;
    scrollToTop();
  };
  window.addEventListener("pageshow", handlePageShow);

  return () => {
    timeoutIds.forEach((id) => window.clearTimeout(id));
    window.cancelAnimationFrame(rafId);
    if (nestedRafId !== null) {
      window.cancelAnimationFrame(nestedRafId);
    }
    window.removeEventListener("pageshow", handlePageShow);
    window.history.scrollRestoration = previousScrollRestoration;
  };
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

function registerBootErrorHandlers() {
  let active = true;
  let shown = false;

  const showOnce = (error: unknown) => {
    if (!active || shown) return;
    shown = true;
    showFatalError(error);
  };

  const handleError = (event: ErrorEvent) => {
    if (event.error) {
      showOnce(event.error);
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    showOnce(event.reason);
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    active = false;
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  };
}

async function boot() {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Root element '#root' not found");
  }

  const unregisterBootErrorHandlers = registerBootErrorHandlers();

  // Prevent restored mid-page positions from making the hero appear "cut off" on load.
  const cleanupScrollReset = resetInitialScrollPosition();

  try {
    await import("./lib/i18n");
    const { default: App } = await import("./App");
    createRoot(root).render(<App />);
  } finally {
    if (cleanupScrollReset) {
      const releaseScrollReset = () => {
        window.setTimeout(cleanupScrollReset, 1200);
      };
      if (document.readyState === "complete") {
        releaseScrollReset();
      } else {
        window.addEventListener("load", releaseScrollReset, { once: true });
      }
    }
    unregisterBootErrorHandlers();
  }
}

boot().catch((error) => {
  showFatalError(error);
});
