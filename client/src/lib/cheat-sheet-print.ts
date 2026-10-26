interface PrintSection {
  title: string;
  points: string[];
}

export interface CheatSheetPrintData {
  language: string;
  title: string;
  instructions: string;
  printButton: string;
  legend: string;
  sections: PrintSection[];
  tableTitle: string;
  headers: string[];
  rows: { label: string; cells: { text: string; status: "good" | "bad" }[] }[];
  tips: PrintSection;
  footer: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!;
  });
}

export function buildCheatSheetPrintDocument(data: CheatSheetPrintData): string {
  const list = (points: string[]) =>
    `<ul>${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`;

  return `<!doctype html>
<html lang="${escapeHtml(data.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(data.title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: sans-serif; color: #17202a; line-height: 1.5; margin: 24px auto; padding: 0 20px; max-width: 850px; overflow-wrap: anywhere; }
    h1 { font-size: 24px; line-height: 1.25; }
    h2 { font-size: 18px; margin: 20px 0 8px; }
    p, li, td, th { font-size: 14px; }
    ul { padding-left: 24px; }
    li { margin-bottom: 5px; }
    .print-controls { border-bottom: 1px solid #b8c2cc; padding-bottom: 16px; }
    button { font: inherit; padding: 10px 16px; color: #fff; background: #235d6b; border: 0; border-radius: 5px; }
    button:focus-visible { outline: 3px solid #17202a; outline-offset: 3px; }
    section { break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid #b8c2cc; padding: 8px; text-align: left; vertical-align: top; }
    thead { display: table-header-group; }
    tr { break-inside: avoid; }
    .good { color: #12642e; }
    .bad { color: #9b2020; }
    footer { margin-top: 24px; border-top: 1px solid #b8c2cc; padding-top: 12px; }
    @page { margin: 14mm; }
    @media print {
      body { margin: 0; padding: 0; max-width: none; }
      .print-controls { display: none; }
      h1, h2 { break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <p>${escapeHtml(data.instructions)}</p>
    <button type="button" id="print-cheat-sheet">${escapeHtml(data.printButton)}</button>
  </div>
  <main>
    <h1>${escapeHtml(data.title)}</h1>
    <p>${escapeHtml(data.legend)}</p>
    ${data.sections.map((section) => `<section><h2>${escapeHtml(section.title)}</h2>${list(section.points)}</section>`).join("")}
    <h2>${escapeHtml(data.tableTitle)}</h2>
    <table>
      <thead><tr>${data.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead>
      <tbody>${data.rows.map((row) => `<tr><th scope="row">${escapeHtml(row.label)}</th>${row.cells.map((cell) => `<td class="${cell.status === "good" ? "good" : "bad"}">${escapeHtml(cell.text)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
    <section><h2>${escapeHtml(data.tips.title)}</h2>${list(data.tips.points)}</section>
  </main>
  <footer>${escapeHtml(data.footer)}</footer>
</body>
</html>`;
}

export function openCheatSheetPrintPreview(
  data: CheatSheetPrintData,
  openWindow: () => Window | null,
): boolean {
  let preview: Window | null = null;
  try {
    preview = openWindow();
    if (!preview) return false;
    preview.opener = null;
    preview.document.open();
    preview.document.write(buildCheatSheetPrintDocument(data));
    preview.document.close();
    const printWindow = preview;
    preview.document.getElementById("print-cheat-sheet")!.addEventListener("click", () => {
      printWindow.print();
    });
    // Keep the document available after printing, cancellation, or an unsupported print dialog.
    preview.focus();
    return true;
  } catch {
    preview?.close();
    return false;
  }
}
