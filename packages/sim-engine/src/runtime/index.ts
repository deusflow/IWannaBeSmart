/**
 * @file packages/sim-engine/src/runtime/index.ts
 * @description Exporting the Virtual TV runtime and coding curriculum
 */

export * from "./types";
export * from "./tvContext";
export * from "./parser";
export * from "./evaluator";
export * from "./tasks";
export * from "./terminalContext";
export * from "./tasks-fintech";
export * from "./apiContext";
export * from "./tasks-api";
export * from "./gitContext";
export * from "./tasks-git";
export * from "./banditContext";
export * from "./tasks-bandit";
export * from "./workedExamplesData";

import { CODING_TASKS } from "./tasks";
import { FINTECH_TASKS } from "./tasks-fintech";
import { API_FORGE_TASKS } from "./tasks-api";
import { GIT_TASKS } from "./tasks-git";
import { BANDIT_TASKS } from "./tasks-bandit";

export const TOTAL_MAX_STARS =
  CODING_TASKS.length * 4 +
  FINTECH_TASKS.length * 4 +
  API_FORGE_TASKS.length * 4 +
  GIT_TASKS.length * 3 +
  BANDIT_TASKS.length * 3;

