import ts from "typescript";
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "apps/web/src");

interface UntranslatedItem {
  file: string;
  line: number;
  kind: "jsx-text" | "string-literal";
  text: string;
}

const results: UntranslatedItem[] = [];

function checkText(text: string, node: ts.Node, sourceFile: ts.SourceFile, kind: "jsx-text" | "string-literal") {
  const trimmed = text.trim();
  if (!trimmed) return;
  // If it contains Cyrillic
  if (/[а-яА-ЯіїєґІЇЄҐ]/.test(trimmed)) {
    // Check if parent or ancestor is a call to `t(...)`
    let parent: ts.Node | undefined = node.parent;
    let insideTCall = false;
    while (parent) {
      if (ts.isCallExpression(parent)) {
        const expr = parent.expression;
        if (ts.isIdentifier(expr) && expr.text === "t") {
          insideTCall = true;
          break;
        }
        if (ts.isPropertyAccessExpression(expr) && expr.name.text === "t") {
          insideTCall = true;
          break;
        }
      }
      parent = parent.parent;
    }

    if (!insideTCall) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
      results.push({
        file: path.relative(SRC_DIR, sourceFile.fileName),
        line: line + 1,
        kind,
        text: trimmed,
      });
    }
  }
}

function visit(node: ts.Node, sourceFile: ts.SourceFile) {
  if (ts.isJsxText(node)) {
    checkText(node.text, node, sourceFile, "jsx-text");
  } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    checkText(node.text, node, sourceFile, "string-literal");
  }
  ts.forEachChild(node, (child) => visit(child, sourceFile));
}

function scanFile(filePath: string) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) return;
  if (filePath.includes(".test.") || filePath.includes("scratch")) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  visit(sourceFile, sourceFile);
}

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      scanFile(fullPath);
    }
  }
}

walk(SRC_DIR);

console.log(`Total TRULY untranslated strings outside t(): ${results.length}`);
const byFile = new Map<string, UntranslatedItem[]>();
results.forEach((r) => {
  const list = byFile.get(r.file) || [];
  list.push(r);
  byFile.set(r.file, list);
});

console.log(`\nFiles summary:`);
for (const [file, list] of byFile.entries()) {
  console.log(`- ${file}: ${list.length}`);
}
