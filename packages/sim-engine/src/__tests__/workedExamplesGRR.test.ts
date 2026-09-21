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
  VERTEX_TASKS,
  FDE_TASKS,
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
    { name: "Vertex AI Architect (Station 07)", tasks: VERTEX_TASKS, expectedCount: 15 },
    { name: "Field AI Deployer (Station 08)", tasks: FDE_TASKS, expectedCount: 15 },
  ];

  it("should cover all 73 total tasks across all 7 active stations", () => {
    const totalCount = allStations.reduce((sum, s) => sum + s.tasks.length, 0);
    expect(totalCount).toBe(73);
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
              const keys = Object.keys(worked.sampleCode);
              expect(keys.length).toBeGreaterThan(0);
              for (const k of keys) {
                expect(worked.sampleCode[k].trim().length).toBeGreaterThan(0);
              }
            }

            const toStr = (l: unknown): string => (typeof l === "string" ? l : (l as Record<string, string>)?.ua || "");

            // demonstrationLog check
            expect(worked.demonstrationLog).toBeDefined();
            expect(Array.isArray(worked.demonstrationLog.terminal)).toBe(true);
            expect(worked.demonstrationLog.terminal.length).toBeGreaterThanOrEqual(1);
            expect(toStr(worked.demonstrationLog.hardwareEffect).trim().length).toBeGreaterThan(0);

            // explanation check
            expect(toStr(worked.explanation).trim().length).toBeGreaterThan(0);
          });

          it("Такт 2: should provide clozeExercise with '___' fill-in-the-blank tokens", () => {
            const worked = (task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id)) as WorkedExample;
            expect(worked).toBeDefined();

            if (typeof worked.clozeExercise === "string") {
              expect(worked.clozeExercise).toContain("___");
            } else {
              const keys = Object.keys(worked.clozeExercise);
              expect(keys.length).toBeGreaterThan(0);
              for (const k of keys) {
                expect(worked.clozeExercise[k]).toContain("___");
              }
            }
          });

          it("Такт 3: should provide finalChallenge prompt and targetCode", () => {
            const worked = (task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id)) as WorkedExample;
            expect(worked).toBeDefined();

            const toStr = (l: unknown): string => (typeof l === "string" ? l : (l as Record<string, string>)?.ua || "");

            expect(worked.finalChallenge).toBeDefined();
            expect(toStr(worked.finalChallenge.prompt).trim().length).toBeGreaterThan(0);

            if (typeof worked.finalChallenge.targetCode === "string") {
              expect(worked.finalChallenge.targetCode.trim().length).toBeGreaterThan(0);
            } else {
              const keys = Object.keys(worked.finalChallenge.targetCode);
              expect(keys.length).toBeGreaterThan(0);
              for (const k of keys) {
                expect(worked.finalChallenge.targetCode[k].trim().length).toBeGreaterThan(0);
              }
            }
          });
        });
      });
    });
  });

  describe("Domain Authenticity & Separation", () => {
    const toStr = (l: unknown): string => (typeof l === "string" ? l : (l as Record<string, string>)?.ua || "");

    it("TV worked examples should reference TV hardware (relays, volume, channels, cathode ray)", () => {
      const tvTask1 = getWorkedExample("task-0-1-power-on");
      expect(toStr(tvTask1?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("реле");

      const tvTask2 = getWorkedExample("task-0-2-types");
      expect(toStr(tvTask2?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("частот");
    });

    it("POS worked examples should reference acquirer, PIN, contactless limits, or receipt printing", () => {
      const posTask1 = getWorkedExample("task-pos-guard-clause");
      expect(toStr(posTask1?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("термінал");

      const posTask2 = getWorkedExample("task-pos-fee-calculation");
      expect(toStr(posTask2?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("чек");
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
      expect(toStr(banditTask1?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("змінних оточення");

      const banditTask3 = getWorkedExample("task-bandit-3-wire-tap");
      expect(banditTask3?.demonstrationLog.terminal.some((l) => l.includes("HMAC"))).toBe(true);
    });

    it("Vertex AI worked examples should reference GCS, pipelines, hyperparameters, or endpoints", () => {
      const vertexTask1 = getWorkedExample("task-vertex-1-gcs-connect");
      expect(toStr(vertexTask1?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("gcs");

      const vertexTask7 = getWorkedExample("task-vertex-7-deploy-endpoint");
      expect(vertexTask7?.demonstrationLog.terminal.some((l) => l.includes("ENDPOINT") || l.includes("traffic"))).toBe(true);
    });

    it("FDE worked examples should reference discovery, legacy systems, multi-agent, or runbooks", () => {
      const fdeTask1 = getWorkedExample("task-fde-1-initial-meeting");
      expect(toStr(fdeTask1?.demonstrationLog.hardwareEffect).toLowerCase()).toContain("стейкхолдер");

      const fdeTask13 = getWorkedExample("task-fde-13-runbook");
      expect(fdeTask13?.demonstrationLog.terminal.some((l) => l.includes("RUNBOOK") || l.includes("INCIDENT"))).toBe(true);
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
        ...VERTEX_TASKS,
        ...FDE_TASKS,
      ];

      const leaks: string[] = [];
      for (const task of allTasks) {
        const we = task.workedExample || WORKED_EXAMPLES[task.id] || getWorkedExample(task.id);
        expect(we).toBeDefined();
        const toStr = (l: unknown): string => (typeof l === "string" ? l : (l as Record<string, string>)?.ua || "");
        const hintNorm = normalize(toStr(we.finalChallenge.hint));
        if (!hintNorm) continue;

        const targetSnippets: string[] =
          typeof we.finalChallenge.targetCode === "string"
            ? [we.finalChallenge.targetCode]
            : Object.values(we.finalChallenge.targetCode);

        for (const target of targetSnippets) {
          const targetNorm = normalize(target);
          const leak = findLongestCommonSubstring(hintNorm, targetNorm);
          if (leak.length >= 15) {
            leaks.push(`Task [${task.id}] leaks "${leak}" (${leak.length} chars)`);
          }
        }
      }

      expect(leaks).toEqual([]);
    });
  });
});

