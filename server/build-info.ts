interface BuildInfo {
  revision: string;
  dirty: boolean;
  lockHash: string;
}

declare const __BUILD_INFO__: BuildInfo;

// Replaced by the production bundler, not supplied by a request or environment variable.
export const buildInfo: BuildInfo | undefined =
  typeof __BUILD_INFO__ === "undefined" ? undefined : __BUILD_INFO__;
