import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import ts from "typescript";

const ROOT = process.cwd();

function collectSourceFiles(rootDir: string) {
  const results: string[] = [];
  const stack = [rootDir];

  while (stack.length) {
    const current = stack.pop();
    if (!current) {
      continue;
    }
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === "dist") {
          continue;
        }
        stack.push(fullPath);
      } else if (entry.isFile()) {
        if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
          results.push(path.relative(ROOT, fullPath));
        }
      }
    }
  }

  return results;
}

let files: string[] = [];
try {
  files = execSync("rg --files client/src", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  })
    .trim()
    .split("\n")
    .filter(Boolean);
} catch {
  files = collectSourceFiles(path.join(ROOT, "client", "src"));
}

const FILES = files.filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"));

const USER_FACING_ATTRS = new Set([
  "aria-label",
  "aria-roledescription",
  "title",
  "placeholder",
  "alt",
]);

const issues: Array<{ file: string; line: number; column: number; message: string }> = [];

function isLikelyUserText(value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (!trimmed) return false;
  return /\p{L}/u.test(trimmed);
}

function recordIssue(filePath: string, node: ts.Node, message: string) {
  const source = node.getSourceFile();
  const pos = source.getLineAndCharacterOfPosition(node.getStart());
  issues.push({
    file: path.relative(ROOT, filePath),
    line: pos.line + 1,
    column: pos.character + 1,
    message,
  });
}

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const scriptKind = filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const source = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, scriptKind);

  function visit(node: ts.Node) {
    if (ts.isJsxText(node)) {
      const text = node.getText(source);
      if (isLikelyUserText(text)) {
        recordIssue(filePath, node, `Hard-coded JSX text: ${text.trim()}`);
      }
    }

    if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) {
      const text = node.expression.text;
      if (isLikelyUserText(text)) {
        recordIssue(filePath, node, `Hard-coded JSX expression string: ${text}`);
      }
    }

    if (ts.isJsxAttribute(node)) {
      const name = node.name.getText(source);
      if (USER_FACING_ATTRS.has(name) && node.initializer) {
        if (ts.isStringLiteral(node.initializer)) {
          const text = node.initializer.text;
          if (isLikelyUserText(text)) {
            recordIssue(filePath, node, `Hard-coded ${name}: ${text}`);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(source);
}

for (const file of FILES) {
  scanFile(path.join(ROOT, file));
}

if (issues.length) {
  console.error("i18n lint failed: hard-coded user-facing strings found:");
  for (const issue of issues) {
    console.error(`- ${issue.file}:${issue.line}:${issue.column} ${issue.message}`);
  }
  process.exit(1);
}

console.log("i18n lint passed: no hard-coded user-facing strings detected.");
