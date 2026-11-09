/**
 * @file apps/web/src/__tests__/tailwindGuard.test.ts
 * @description Guards against non-existent / legacy Tailwind classes silently failing in the UI.
 */

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const BANNED = [
  "bg-linear-to-",
  "slate-750",
  "slate-850",
  "font-balsamiq",
  "font-sniglet",
  "text-ink-light-",
  "ring-5",
];

function collectFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "__tests__" || name === "node_modules") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      collectFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

describe("Tailwind class guard", () => {
  it("contains no banned or non-existent Tailwind classes", () => {
    const offenders: string[] = [];
    for (const file of collectFiles(SRC_ROOT)) {
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, idx) => {
        for (const banned of BANNED) {
          if (line.includes(banned)) {
            offenders.push(`${file}:${idx + 1} -> "${banned}"`);
          }
        }
      });
    }
    expect(offenders, `Banned Tailwind classes found:\n${offenders.join("\n")}`).toEqual([]);
  });
});

