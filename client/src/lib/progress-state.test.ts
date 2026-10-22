import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PROGRESS,
  applyCompletedRunToExploredCombinations,
  applyCompletedRunToProgressState,
  didJustComplete,
  parseStoredProgressState,
  loadExploredCombinationsFromProgressState,
} from "@/lib/progress-state";

describe("progress-state helpers", () => {
  it("only records completion when a run just entered the complete state", () => {
    const initial = new Set<"http-off">(["http-off"]);

    const unchanged = applyCompletedRunToExploredCombinations(initial, "https", "off", false);
    assert.equal(unchanged, initial);

    const completed = applyCompletedRunToExploredCombinations(initial, "https", "off", true);
    assert.deepEqual([...completed], ["http-off", "https-off"]);
  });

  it("does not create false progress when the mode changes after completion", () => {
    const alreadyComplete = didJustComplete(true, true);
    const progress = applyCompletedRunToProgressState(
      DEFAULT_PROGRESS,
      "https",
      "on",
      alreadyComplete,
    );

    assert.equal(progress, DEFAULT_PROGRESS);
  });

  it("marks the protocol, vpn, and combination on a real completion", () => {
    const progress = applyCompletedRunToProgressState(DEFAULT_PROGRESS, "https", "on", true);

    assert.deepEqual(progress, {
      httpExplored: false,
      httpsExplored: true,
      vpnOffExplored: false,
      vpnOnExplored: true,
      httpVpnOff: false,
      httpVpnOn: false,
      httpsVpnOff: false,
      httpsVpnOn: true,
    });
  });

  it("parses invalid stored progress defensively", () => {
    assert.deepEqual(parseStoredProgressState("{invalid"), DEFAULT_PROGRESS);
    assert.deepEqual(parseStoredProgressState(null), DEFAULT_PROGRESS);
    for (const raw of ["null", "42", '"text"', "[]", '{"httpVpnOff":"false"}']) {
      assert.deepEqual(parseStoredProgressState(raw), DEFAULT_PROGRESS);
      assert.deepEqual([...loadExploredCombinationsFromProgressState(JSON.parse(raw))], []);
    }
    assert.deepEqual(
      [...loadExploredCombinationsFromProgressState({ httpsVpnOn: true })],
      ["https-on"],
    );
  });
});
