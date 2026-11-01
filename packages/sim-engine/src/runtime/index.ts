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
export * from "./vertexContext";
export * from "./tasks-vertex";
export * from "./fdeContext";
export * from "./tasks-fde";
export * from "./workedExamplesData";
export * from "./trace";
export * from "./ragEngine";
export * from "./tasks-rag";
export * from "./cyberEngine";
export * from "./tasks-cyber";
export * from "./warRoomEngine";
export * from "./iotContext";
export * from "./tasks-iot";
export * from "./tasterRegistry";
export * from "./tasterEngine";
export * from "./labs/labScenarios";
export * from "./technologyInsights";

import { CODING_TASKS } from "./tasks";
import { FINTECH_TASKS } from "./tasks-fintech";
import { API_FORGE_TASKS } from "./tasks-api";
import { GIT_TASKS } from "./tasks-git";
import { BANDIT_TASKS } from "./tasks-bandit";
import { VERTEX_TASKS } from "./tasks-vertex";
import { FDE_TASKS } from "./tasks-fde";
import { RAG_TASKS } from "./tasks-rag";
import { CYBER_TASKS } from "./tasks-cyber";
import { IOT_TASKS } from "./tasks-iot";

export const ALL_CURRICULUM_TASKS = [
  ...CODING_TASKS,
  ...FINTECH_TASKS,
  ...IOT_TASKS,
  ...API_FORGE_TASKS,
  ...GIT_TASKS,
  ...BANDIT_TASKS,
  ...VERTEX_TASKS,
  ...FDE_TASKS,
  ...RAG_TASKS,
  ...CYBER_TASKS,
];

export const TOTAL_CURRICULUM_TASK_COUNT = ALL_CURRICULUM_TASKS.length;

export const TOTAL_MAX_STARS = TOTAL_CURRICULUM_TASK_COUNT * 4;


