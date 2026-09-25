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

import { CODING_TASKS } from "./tasks";
import { FINTECH_TASKS } from "./tasks-fintech";
import { API_FORGE_TASKS } from "./tasks-api";
import { GIT_TASKS } from "./tasks-git";
import { BANDIT_TASKS } from "./tasks-bandit";
import { VERTEX_TASKS } from "./tasks-vertex";
import { FDE_TASKS } from "./tasks-fde";
import { RAG_TASKS } from "./tasks-rag";
import { CYBER_TASKS } from "./tasks-cyber";

export const TOTAL_MAX_STARS =
  CODING_TASKS.length * 4 +
  FINTECH_TASKS.length * 4 +
  API_FORGE_TASKS.length * 4 +
  GIT_TASKS.length * 4 +
  BANDIT_TASKS.length * 4 +
  VERTEX_TASKS.length * 4 +
  FDE_TASKS.length * 4 +
  RAG_TASKS.length * 4 +
  CYBER_TASKS.length * 4;

