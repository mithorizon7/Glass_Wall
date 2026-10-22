import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isApiRequestPath, shouldServeSpaFallback } from "../../../server/spa-fallback";

describe("spa fallback routing", () => {
  it("serves the SPA shell for HTML navigations", () => {
    assert.equal(
      shouldServeSpaFallback({
        method: "GET",
        path: "/lesson/http-vs-https",
        acceptHeader: "text/html",
        acceptsHtml: true,
      }),
      true,
    );
  });

  it("rejects API routes and asset paths", () => {
    assert.equal(isApiRequestPath("/api"), true);
    assert.equal(isApiRequestPath("/api/session"), true);
    assert.equal(isApiRequestPath("/about"), false);

    assert.equal(
      shouldServeSpaFallback({
        method: "GET",
        path: "/api/session",
        acceptHeader: "text/html",
        acceptsHtml: true,
      }),
      false,
    );

    assert.equal(
      shouldServeSpaFallback({
        method: "GET",
        path: "/assets/app.js",
        acceptHeader: "text/html",
        acceptsHtml: true,
      }),
      false,
    );
  });

  it("rejects non-navigation requests", () => {
    assert.equal(
      shouldServeSpaFallback({
        method: "POST",
        path: "/",
        acceptHeader: "text/html",
        acceptsHtml: true,
      }),
      false,
    );

    assert.equal(
      shouldServeSpaFallback({
        method: "GET",
        path: "/",
        acceptHeader: "application/json",
        acceptsHtml: false,
      }),
      false,
    );
  });
});
