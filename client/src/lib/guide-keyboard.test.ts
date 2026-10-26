import assert from "node:assert/strict";
import { it } from "node:test";
import { guideKeyboardAction } from "./guide-keyboard";

it("lets native guide buttons handle Enter exactly once", () => {
  assert.equal(guideKeyboardAction("Enter", true, false), null);
  assert.equal(guideKeyboardAction("Enter", false, false), "next");
});

it("retains explicit navigation and dismissal without repeated-key step skipping", () => {
  assert.equal(guideKeyboardAction("ArrowRight", true, false), "next");
  assert.equal(guideKeyboardAction("ArrowLeft", true, false), "back");
  assert.equal(guideKeyboardAction("Escape", true, false), "close");
  assert.equal(guideKeyboardAction("Tab", false, false), null);
  for (const key of ["Enter", "ArrowRight", "ArrowLeft"]) {
    assert.equal(guideKeyboardAction(key, false, true), null);
  }
});
