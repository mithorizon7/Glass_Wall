export function guideKeyboardAction(
  key: string,
  interactiveTarget: boolean,
  repeated: boolean,
): "close" | "next" | "back" | null {
  if (repeated) return null;
  if (key === "Escape") return "close";
  // Native controls already implement Enter; handling it again skips steps or cancels Back.
  if (key === "Enter") return interactiveTarget ? null : "next";
  if (key === "ArrowRight") return "next";
  if (key === "ArrowLeft") return "back";
  return null;
}
