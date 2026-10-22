import type { ErrorRequestHandler } from "express";

export function createErrorHandler(
  isProduction: boolean,
  report: (message: string) => void,
): ErrorRequestHandler {
  return (error: unknown, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const details = error && typeof error === "object" ? error : {};
    const candidate =
      "status" in details ? details.status : "statusCode" in details ? details.statusCode : 500;
    const status =
      typeof candidate === "number" &&
      Number.isInteger(candidate) &&
      candidate >= 400 &&
      candidate <= 599
        ? candidate
        : 500;
    // Error messages can contain request bodies or credentials. Log metadata only.
    report(JSON.stringify({ method: req.method, path: req.path.slice(0, 200), status }));
    const message =
      status >= 500
        ? "Internal Server Error"
        : status === 413
          ? "Payload Too Large"
          : status === 404
            ? "Not Found"
            : "Bad Request";
    res.setHeader("Cache-Control", "no-store");
    res
      .status(status)
      .json({ message: !isProduction && error instanceof Error ? error.message : message });
  };
}
