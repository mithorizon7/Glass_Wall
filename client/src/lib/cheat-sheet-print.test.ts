import assert from "node:assert/strict";
import { it } from "node:test";
import { buildCheatSheetPrintDocument, openCheatSheetPrintPreview } from "./cheat-sheet-print";
import type { CheatSheetPrintData } from "./cheat-sheet-print";
import en from "../locales/en/glass-wall.json";
import lv from "../locales/lv/glass-wall.json";
import ru from "../locales/ru/glass-wall.json";
import pseudo from "../locales/pseudo/glass-wall.json";

const data: CheatSheetPrintData = {
  language: "en",
  title: "Network reference",
  instructions: "Choose a printer or Save as PDF.",
  printButton: "Print / Save as PDF",
  legend: "Metadata / Content",
  sections: [{ title: "HTTP", points: ["Plain text"] }],
  tableTitle: "Comparison",
  headers: ["Data", "HTTP"],
  rows: [{ label: "Passwords", cells: [{ text: "Visible", status: "bad" }] }],
  tips: { title: "Safety", points: ["Use HTTPS"] },
  footer: "The Glass Wall",
};

it("escapes every dynamic print field and contains no inline scripts or event attributes", () => {
  const unsafe = "<img src=x onerror=\"alert(1)\"> & 'quote'";
  const document = buildCheatSheetPrintDocument({
    ...data,
    language: unsafe,
    title: unsafe,
    instructions: unsafe,
    printButton: unsafe,
    legend: unsafe,
    sections: [{ title: unsafe, points: [unsafe] }],
    tableTitle: unsafe,
    headers: [unsafe],
    rows: [{ label: unsafe, cells: [{ text: unsafe, status: "bad" }] }],
    tips: { title: unsafe, points: [unsafe] },
    footer: unsafe,
  });
  assert.ok(!document.includes(unsafe));
  assert.ok(
    document.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quote&#39;"),
  );
  assert.doesNotMatch(document, /<script|<img|\sonclick=/i);
  assert.match(document, /<meta charset="utf-8">/);
  assert.match(document, /<thead>/);
  assert.match(document, /scope="row"/);
  assert.match(document, /\.print-controls \{ display: none; \}/);
});

it("provides localized instructions, errors and print document language for every locale", () => {
  for (const [language, locale] of Object.entries({ en, lv, ru, pseudo })) {
    const sheet = locale.cheatSheet;
    for (const key of ["printHint", "printInstructions", "printError"] as const) {
      assert.ok(sheet[key].trim().length > 10, `${language}: ${key}`);
    }
    const document = buildCheatSheetPrintDocument({
      ...data,
      language,
      title: sheet.printTitle,
      instructions: sheet.printInstructions,
      printButton: sheet.printButton,
      footer: sheet.printFooter,
    });
    assert.match(document, new RegExp(`<html lang="${language}">`));
    assert.ok(document.includes(sheet.printInstructions));
    assert.ok(document.includes(sheet.printFooter));
  }
});

it("reports blocked popups and browser errors instead of silently failing", () => {
  assert.equal(
    openCheatSheetPrintPreview(data, () => null),
    false,
  );
  assert.equal(
    openCheatSheetPrintPreview(data, () => {
      throw new Error("Popup unavailable");
    }),
    false,
  );
});

it("opens a readable preview, prints on demand and retains it after print or cancellation", () => {
  let contents = "";
  let printed = 0;
  let closed = 0;
  let focused = 0;
  let onPrint: (() => void) | undefined;
  const preview = {
    opener: {},
    document: {
      open() {},
      write(value: string) {
        contents += value;
      },
      close() {},
      getElementById(id: string) {
        assert.equal(id, "print-cheat-sheet");
        return {
          addEventListener(event: string, listener: () => void) {
            assert.equal(event, "click");
            onPrint = listener;
          },
        };
      },
    },
    print() {
      printed++;
    },
    close() {
      closed++;
    },
    focus() {
      focused++;
    },
  };
  assert.equal(
    openCheatSheetPrintPreview(data, () => preview as unknown as Window),
    true,
  );
  assert.equal(preview.opener, null);
  assert.ok(contents.includes(data.title));
  assert.equal(printed, 0);
  assert.equal(focused, 1);
  assert.ok(onPrint);
  onPrint();
  onPrint();
  assert.equal(printed, 2);
  assert.equal(closed, 0);
});
