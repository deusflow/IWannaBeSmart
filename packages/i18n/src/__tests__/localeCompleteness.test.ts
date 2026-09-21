/**
 * @file packages/i18n/src/__tests__/localeCompleteness.test.ts
 * @description Vitest test suite to enforce 100% localization parity across UA, EN, DA:
 * 1. Root and nested locale keys match perfectly between English, Ukrainian, and Danish.
 * 2. All Worked Examples provide authentic localized English and Danish translations.
 * 3. All Task Didactics provide authentic localized English and Danish translations.
 */

import { describe, it, expect } from "vitest";
import { WORKED_EXAMPLES } from "@iw/sim-engine";
import {
  enTranslation,
  uaTranslation,
  daTranslation,
  getLocalizedWorkedExample,
  TASK_DIDACTIC_EN,
  TASK_DIDACTIC_DA,
} from "../index";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) {
      keys = keys.concat(flattenKeys(val, newPrefix));
    } else {
      keys.push(newPrefix);
    }
  }
  return keys;
}

describe("Localization Parity & Completeness (UA, EN, DA)", () => {
  const enFlat = flattenKeys(enTranslation).sort();
  const uaFlat = flattenKeys(uaTranslation).sort();
  const daFlat = flattenKeys(daTranslation).sort();

  it("should have identical key counts across all three locales", () => {
    expect(enFlat.length).toBeGreaterThan(1100);
    expect(enFlat.length).toBe(uaFlat.length);
    expect(enFlat.length).toBe(daFlat.length);
  });

  it("should have 0 missing keys between EN and UA", () => {
    const missingInUa = enFlat.filter((k) => !uaFlat.includes(k));
    const missingInEn = uaFlat.filter((k) => !enFlat.includes(k));
    expect(missingInUa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("should have 0 missing keys between EN and DA", () => {
    const missingInDa = enFlat.filter((k) => !daFlat.includes(k));
    const missingInEn = daFlat.filter((k) => !enFlat.includes(k));
    expect(missingInDa).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("should have valid, non-empty localized worked examples in EN and DA for every task", () => {
    const taskIds = Object.keys(WORKED_EXAMPLES);
    expect(taskIds.length).toBeGreaterThanOrEqual(43);

    for (const taskId of taskIds) {
      const baseEx = WORKED_EXAMPLES[taskId];
      const enEx = getLocalizedWorkedExample(baseEx, taskId, "en");
      const daEx = getLocalizedWorkedExample(baseEx, taskId, "da");

      expect(enEx).toBeDefined();
      expect(daEx).toBeDefined();

      // Check hardwareEffect
      const enHardware =
        typeof enEx!.demonstrationLog.hardwareEffect === "string"
          ? enEx!.demonstrationLog.hardwareEffect
          : (enEx!.demonstrationLog.hardwareEffect as Record<string, string>).en;
      const daHardware =
        typeof daEx!.demonstrationLog.hardwareEffect === "string"
          ? daEx!.demonstrationLog.hardwareEffect
          : (daEx!.demonstrationLog.hardwareEffect as Record<string, string>).da;
      expect(enHardware.length).toBeGreaterThan(0);
      expect(daHardware.length).toBeGreaterThan(0);

      // Check explanation
      const enExp =
        typeof enEx!.explanation === "string"
          ? enEx!.explanation
          : (enEx!.explanation as Record<string, string>).en;
      const daExp =
        typeof daEx!.explanation === "string"
          ? daEx!.explanation
          : (daEx!.explanation as Record<string, string>).da;
      expect(enExp.length).toBeGreaterThan(0);
      expect(daExp.length).toBeGreaterThan(0);

      // Check final challenge prompt
      const enPrompt =
        typeof enEx!.finalChallenge.prompt === "string"
          ? enEx!.finalChallenge.prompt
          : (enEx!.finalChallenge.prompt as Record<string, string>).en;
      const daPrompt =
        typeof daEx!.finalChallenge.prompt === "string"
          ? daEx!.finalChallenge.prompt
          : (daEx!.finalChallenge.prompt as Record<string, string>).da;
      expect(enPrompt.length).toBeGreaterThan(0);
      expect(daPrompt.length).toBeGreaterThan(0);

      // Check terminal log entries
      expect(enEx!.demonstrationLog.terminal.length).toBeGreaterThan(0);
      expect(daEx!.demonstrationLog.terminal.length).toBeGreaterThan(0);
    }
  });

  it("should have comprehensive didactics translations in EN and DA for all covered tasks", () => {
    const didacticsEnKeys = Object.keys(TASK_DIDACTIC_EN);
    const didacticsDaKeys = Object.keys(TASK_DIDACTIC_DA);

    expect(didacticsEnKeys.length).toBeGreaterThanOrEqual(33);
    expect(didacticsDaKeys.length).toBeGreaterThanOrEqual(33);
    expect(didacticsEnKeys.sort()).toEqual(didacticsDaKeys.sort());

    for (const taskId of didacticsEnKeys) {
      const enD = TASK_DIDACTIC_EN[taskId];
      const daD = TASK_DIDACTIC_DA[taskId];

      if (enD.whyThisCode) {
        expect(enD.whyThisCode.csharp.length).toBeGreaterThan(0);
        expect(daD.whyThisCode?.csharp.length).toBeGreaterThan(0);
      }
      if (enD.primitiveMemoryNote) {
        expect(enD.primitiveMemoryNote.csharp.length).toBeGreaterThan(0);
        expect(daD.primitiveMemoryNote?.csharp.length).toBeGreaterThan(0);
      }
    }
  });

  it("should verify all static t('...') calls in apps/web/src exist in locales", async () => {
    const fs = await import("fs");
    const path = await import("path");

    function getFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(getFiles(fullPath));
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const webSrc = path.resolve(__dirname, "../../../../apps/web/src");
    const files = getFiles(webSrc);
    const regex = /\bt\(\s*["']([a-zA-Z0-9_.-]+)["']/g;
    const missingKeys: { file: string; key: string }[] = [];

    for (const file of files) {
      if (file.includes("__tests__")) continue;
      const content = fs.readFileSync(file, "utf-8");
      let match;
      while ((match = regex.exec(content)) !== null) {
        const key = match[1];
        // Dynamic or template keys or keys with prefix handled elsewhere
        if (key.startsWith("task-") || key.includes("${")) continue;
        if (!enFlat.includes(key)) {
          // Check if key is a prefix for an object in enTranslation
          const isPrefix = enFlat.some(k => k.startsWith(key + "."));
          if (!isPrefix) {
            missingKeys.push({ file: path.basename(file), key });
          }
        }
      }
    }

    if (missingKeys.length > 0) {
      console.warn("Missing locale keys in apps/web/src:", missingKeys);
    }
    expect(missingKeys).toEqual([]);
  });
});

