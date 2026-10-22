import type { Response } from "express";
import path from "path";

export interface SpaFallbackRequestContext {
  method: string;
  path: string;
  acceptHeader?: string | string[];
  acceptsHtml: boolean;
}

export function isApiRequestPath(requestPath: string): boolean {
  try {
    return /^\/api(?:\/|$)/i.test(decodeURIComponent(requestPath));
  } catch {
    return false;
  }
}

export function shouldServeSpaFallback({
  method,
  path: requestPath,
  acceptHeader,
  acceptsHtml,
}: SpaFallbackRequestContext): boolean {
  if (method !== "GET" && method !== "HEAD") return false;
  if (isApiRequestPath(requestPath)) return false;
  try {
    const decodedPath = decodeURIComponent(requestPath);
    if (
      path.extname(decodedPath) ||
      decodedPath.split("/").some((segment) => segment.startsWith("."))
    )
      return false;
  } catch {
    return false;
  }

  const normalizedAccept =
    typeof acceptHeader === "string"
      ? acceptHeader
      : Array.isArray(acceptHeader)
        ? acceptHeader.join(",")
        : "";

  if (normalizedAccept === "") {
    return true;
  }

  return acceptsHtml;
}

export function sendSpaFallbackNotFound(requestPath: string, res: Response) {
  if (isApiRequestPath(requestPath)) {
    res.status(404).json({ message: "Not Found" });
    return;
  }

  res.status(404).type("text/plain").send("Not Found");
}
