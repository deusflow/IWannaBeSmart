import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "apps/web/src");

interface Issue {
  file: string;
  line: number;
  snippet: string;
  type: "raw_jsx" | "prop" | "string_literal" | "multiline_t";
}

const issues: Issue[] = [];

function scan(filePath: string) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) return;
  if (filePath.includes(".test.") || filePath.includes("scratch")) return;

  const content = fs.readFileSync(filePath, "utf-8");

  // Check if file even has Cyrillic
  if (!/[а-яА-ЯіїєґІЇЄҐ]/.test(content)) return;

  // Let's strip single-line comments and multi-line comments
  const withoutComments = content
    .replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length))
    .replace(/\/\/.*/g, (m) => " ".repeat(m.length));

  // Let's replace all t(...) calls (including multiline t(...) calls) with spaces of same length
  // Match t("key") or t("key", "default") or t('key', { ... }) or i18n.t(...)
  const withoutT = withoutComments.replace(
    /\b(?:i18n\.)?t\s*\(\s*["'][^"']+["']\s*(?:,\s*(?:["'](?:[^"'\\]|\\.)*["']|{[^{}]*}))?\s*\)/gs,
    (m) => " ".repeat(m.length)
  );

  // Now split into lines and check for remaining Cyrillic
  const lines = withoutT.split("\n");
  const origLines = content.split("\n");

  lines.forEach((line, idx) => {
    if (/[а-яА-ЯіїєґІЇЄҐ]/.test(line)) {
      issues.push({
        file: path.relative(SRC_DIR, filePath),
        line: idx + 1,
        snippet: origLines[idx].trim(),
        type: "raw_jsx",
      });
    }
  });
}

function walk(dir: string) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else scan(full);
  }
}

walk(SRC_DIR);

console.log(`True untranslated Cyrillic lines outside t(...): ${issues.length}`);
const byFile = new Map<string, Issue[]>();
for (const iss of issues) {
  const l = byFile.get(iss.file) || [];
  l.push(iss);
  byFile.set(iss.file, l);
}
console.log(`Files count: ${byFile.size}`);
for (const [f, l] of byFile.entries()) {
  console.log(`\n--- ${f} (${l.length}) ---`);
  l.slice(0, 5).forEach((i) => console.log(`  L${i.line}: ${i.snippet}`));
  if (l.length > 5) console.log(`  ... and ${l.length - 5} more`);
}
