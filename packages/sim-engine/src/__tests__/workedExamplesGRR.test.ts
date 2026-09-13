/**
 * @file packages/sim-engine/src/__tests__/workedExamplesGRR.test.ts
 * @description Comprehensive verification suite for Gradual Release of Responsibility (GRR)
 * Worked Examples across all 44 tasks in 5 stations (Smart TV, POS, API, Git, Cyber Bandit).
 */

import { describe, it, expect } from "vitest";
import {
  CODING_TASKS,
  FINTECH_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  WORKED_EXAMPLES,
  getWorkedExample,
  type WorkedExample,
} from "../runtime";

describe("Gradual Release of Responsibility (GRR) Worked Examples Specification", () => {
  const allStations = [
    { name: "Smart TV (Station 01)", tasks: CODING_TASKS, expectedCount: 18 },
    { name: "Fintech POS (Station 02)", tasks: FINTECH_TASKS, expectedCount: 7 },
    { name: "API Forge (Station 04)", tasks: API_FORGE_TASKS, expectedCount: 6 },
    { name: "Git Time Machine (Station 05)", tasks: GIT_TASKS, expectedCount: 6 },
    { name: "Cyber Bandit Lab (Station 06)", tasks: BANDIT_TASKS, expectedCount: 6 },
  ];

  it("should cover all 43 total tasks across all 5 active stations", () => {
    const totalCount = allStations.reduce((sum, s) => sum + s.tasks.length, 0);
    expect(totalCount).toBe(43);
  });

  allStations.forEach(({ name, tasks, expectedCount }) => {
    describe(`Station: ${name}`, () => {
      it(`should contain exactly ${expectedCount} tasks`, () => {
        expect(tasks.length).toBe(expectedCount);
      });

      tasks.forEach((task, index) => {
        describe(`Task [${task.id}] (index ${index + 1})`, () => {
          it("should have a defined WorkedExample directly on task or via getWorkedExample()", () => {
            const worked = task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id);
            expect(worked).toBeDefined();
          });

          it("Такт 1: should provide valid sampleCode, demonstrationLog, and explanation", () => {
            const worked = (task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id)) as WorkedExample;
            expect(worked).toBeDefined();

            // sampleCode check
            if (typeof worked.sampleCode === "string") {
              expect(worked.sampleCode.trim().length).toBeGreaterThan(0);
            } else {
              expect(worked.sampleCode.csharp.trim().length).toBeGreaterThan(0);
              expect(worked.sampleCode.go.trim().length).toBeGreaterThan(0);
            }

            // demonstrationLog check
            expect(worked.demonstrationLog).toBeDefined();
            expect(Array.isArray(worked.demonstrationLog.terminal)).toBe(true);
            expect(worked.demonstrationLog.terminal.length).toBeGreaterThanOrEqual(1);
            expect(worked.demonstrationLog.hardwareEffect.trim().length).toBeGreaterThan(0);

            // explanation check
            expect(worked.explanation.trim().length).toBeGreaterThan(0);
          });

          it("Такт 2: should provide clozeExercise with '___' fill-in-the-blank tokens", () => {
            const worked = (task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id)) as WorkedExample;
            expect(worked).toBeDefined();

            if (typeof worked.clozeExercise === "string") {
              expect(worked.clozeExercise).toContain("___");
            } else {
              expect(worked.clozeExercise.csharp).toContain("___");
              expect(worked.clozeExercise.go).toContain("___");
            }
          });

          it("Такт 3: should provide finalChallenge prompt and targetCode", () => {
            const worked = (task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id)) as WorkedExample;
            expect(worked).toBeDefined();

            expect(worked.finalChallenge).toBeDefined();
            expect(worked.finalChallenge.prompt.trim().length).toBeGreaterThan(0);

            if (typeof worked.finalChallenge.targetCode === "string") {
              expect(worked.finalChallenge.targetCode.trim().length).toBeGreaterThan(0);
            } else {
              expect(worked.finalChallenge.targetCode.csharp.trim().length).toBeGreaterThan(0);
              expect(worked.finalChallenge.targetCode.go.trim().length).toBeGreaterThan(0);
            }
          });
        });
      });
    });
  });

  describe("Domain Authenticity & Separation", () => {
    it("TV worked examples should reference TV hardware (relays, volume, channels, cathode ray)", () => {
      const tvTask1 = getWorkedExample("task-0-1-power-on");
      expect(tvTask1?.demonstrationLog.hardwareEffect.toLowerCase()).toContain("реле");

      const tvTask2 = getWorkedExample("task-0-2-types");
      expect(tvTask2?.demonstrationLog.hardwareEffect.toLowerCase()).toContain("частот");
    });

    it("POS worked examples should reference acquirer, PIN, contactless limits, or receipt printing", () => {
      const posTask1 = getWorkedExample("task-pos-guard-clause");
      expect(posTask1?.demonstrationLog.hardwareEffect.toLowerCase()).toContain("термінал");

      const posTask2 = getWorkedExample("task-pos-fee-calculation");
      expect(posTask2?.demonstrationLog.hardwareEffect.toLowerCase()).toContain("чек");
    });

    it("API Forge worked examples should reference HTTP status codes and wire transit", () => {
      const apiTask1 = getWorkedExample("task-api-1-heartbeat");
      expect(apiTask1?.demonstrationLog.terminal.some((l) => l.includes("200 OK"))).toBe(true);

      const apiTask4 = getWorkedExample("task-api-4-bearer-auth");
      expect(apiTask4?.demonstrationLog.terminal.some((l) => l.includes("401") || l.includes("Bearer"))).toBe(true);
    });

    it("Git Time Machine worked examples should reference Git tree, commits, DAG, and branches", () => {
      const gitTask1 = getWorkedExample("task-git-1-genesis");
      expect(gitTask1?.demonstrationLog.terminal.some((l) => l.toLowerCase().includes("commit"))).toBe(true);

      const gitTask2 = getWorkedExample("task-git-2-branching");
      expect(gitTask2?.demonstrationLog.terminal.some((l) => l.toLowerCase().includes("branch"))).toBe(true);
    });

    it("Cyber Bandit Lab worked examples should reference cryptography, tokens, or security gates", () => {
      const banditTask1 = getWorkedExample("task-bandit-1-hidden-key");
      expect(banditTask1?.demonstrationLog.hardwareEffect.toLowerCase()).toContain("змінних оточення");

      const banditTask3 = getWorkedExample("task-bandit-3-wire-tap");
      expect(banditTask3?.demonstrationLog.terminal.some((l) => l.includes("HMAC"))).toBe(true);
    });
  });

  describe("Anti-Leak Pedagogical Integrity", () => {
    function normalize(s: string): string {
      return s.replace(/[\s\r\n\t]+/g, "").toLowerCase();
    }

    function findLongestCommonSubstring(str1: string, str2: string): string {
      let longest = "";
      for (let i = 0; i < str1.length; i++) {
        for (let j = i + 15; j <= str1.length; j++) {
          const sub = str1.substring(i, j);
          if (str2.includes(sub)) {
            if (sub.length > longest.length) {
              longest = sub;
            }
          } else {
            break;
          }
        }
      }
      return longest;
    }

    it("hints should never leak raw target code snippets (0 leaks >= 15 chars)", () => {
      const allTasks = [
        ...CODING_TASKS,
        ...FINTECH_TASKS,
        ...API_FORGE_TASKS,
        ...GIT_TASKS,
        ...BANDIT_TASKS,
      ];

      for (const task of allTasks) {
        const we = task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id);
        expect(we).toBeDefined();
        if (!we || !we.finalChallenge.hint) continue;

        const hintNorm = normalize(we.finalChallenge.hint);
        const targetCs =
          typeof we.finalChallenge.targetCode === "string"
            ? we.finalChallenge.targetCode
            : we.finalChallenge.targetCode.csharp;
        const targetGo =
          typeof we.finalChallenge.targetCode === "string"
            ? we.finalChallenge.targetCode
            : we.finalChallenge.targetCode.go;

        const targetCsNorm = normalize(targetCs);
        const targetGoNorm = normalize(targetGo);

        const leakCs = findLongestCommonSubstring(hintNorm, targetCsNorm);
        const leakGo = findLongestCommonSubstring(hintNorm, targetGoNorm);

        expect(
          leakCs.length,
          `Hint for task [${task.id}] leaks C# target code substring: "${leakCs}"`
        ).toBeLessThan(15);

        expect(
          leakGo.length,
          `Hint for task [${task.id}] leaks Go target code substring: "${leakGo}"`
        ).toBeLessThan(15);
      }
    });
  });
});

