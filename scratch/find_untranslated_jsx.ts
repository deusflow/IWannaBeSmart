import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(process.cwd(), "apps/web/src");

interface Finding {
  file: string;
  line: number;
  snippet: string;
}

const findings: Finding[] = [];

function scanFile(filePath: string) {
  if (!filePath.endsWith(".tsx") && !filePath.endsWith(".ts")) return;
  if (filePath.includes(".test.") || filePath.includes("scratch")) return;

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Check if line contains Cyrillic characters
    if (/[а-яА-ЯіїєґІЇЄҐ]/.test(line)) {
      // Ignore comments
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
        return;
      }
      // Check if it's solely inside a t("key", "Default Fallback")
      // e.g. line has t( ... )
      // But wait! If it's a fallback, that might be okay IF the key is translated.
      // But if there's raw Cyrillic outside of t(...), or if t() doesn't cover it:
      const withoutT = line.replace(/t\s*\(\s*["'][^"']+["']\s*,\s*["'][^"']+["']\s*\)/g, "T_CALL");
      const withoutTNoFallback = withoutT.replace(/t\s*\(\s*["'][^"']+["']\s*\)/g, "T_CALL");
      if (/[а-яА-ЯіїєґІЇЄҐ]/.test(withoutTNoFallback)) {
        findings.push({
          file: path.relative(SRC_DIR, filePath),
          line: idx + 1,
          snippet: trimmed,
        });
      }
    }
  });
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

console.log(`Total untranslated snippets found outside t(...): ${findings.length}`);
// Group by file
const byFile = new Map<string, Finding[]>();
findings.forEach((f) => {
  const list = byFile.get(f.file) || [];
  list.push(f);
  byFile.set(f.file, list);
});

console.log(`Total files with untranslated strings: ${byFile.size}`);
for (const [file, list] of byFile.entries()) {
  console.log(`${file}: ${list.length}`);
}
