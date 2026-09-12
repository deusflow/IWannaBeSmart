/**
 * @file apps/web/src/store/slices/gitSlice.ts
 * @description Station 05: Git Time Machine simulation slice (DAG Graph, CLI Terminal, Merge Conflicts)
 */

import type { StateCreator } from "zustand";
import {
  type GitRepoState,
  type GitCommandResult,
  INITIAL_GIT_STATE,
  executeGitCommand,
  resolveConflict,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, GitSlice } from "../types";

export const createGitSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  GitSlice
> = (set, get) => ({
  gitRepoState: JSON.parse(JSON.stringify(INITIAL_GIT_STATE)),
  gitCliInput: "",
  gitCliHistory: [],
  gitTerminalLogs: [
    "Git Time Machine v2.45.0-virtual",
    'Repository initialized at refs/heads/main. Type "git status" or "git log" to begin.',
  ],
  isGitVictoryModalOpen: false,
  selectedCommitId: "c1",

  setGitCliInput: (cmd: string) => {
    set({ gitCliInput: cmd });
  },

  runGitCommand: (rawCmd: string): GitCommandResult => {
    audioFx.playKeyClick();
    const state = get().gitRepoState;
    const res = executeGitCommand(state, rawCmd);

    const logEntry = `> ${rawCmd}\n${res.output}`;
    const newLogs = [...get().gitTerminalLogs, logEntry].slice(-50);
    const newHistory = rawCmd.trim()
      ? [...get().gitCliHistory, rawCmd.trim()].slice(-30)
      : get().gitCliHistory;

    if (res.conflictDetected) {
      audioFx.playErrorBuzz();
    } else if (res.success && res.createdCommitId) {
      audioFx.playSuccessFanfare();
    }

    set({
      gitRepoState: res.newState,
      gitTerminalLogs: newLogs,
      gitCliHistory: newHistory,
      gitCliInput: "",
      selectedCommitId: res.createdCommitId || get().selectedCommitId,
    });

    return res;
  },

  resolveActiveConflict: (strategy: "ours" | "theirs" | "both") => {
    audioFx.playRelayClick();
    const state = get().gitRepoState;
    const res = resolveConflict(state, strategy);

    const logEntry = `[CONFLICT RESOLVER] ${res.output}`;
    const newLogs = [...get().gitTerminalLogs, logEntry].slice(-50);

    set({
      gitRepoState: res.newState,
      gitTerminalLogs: newLogs,
    });
  },

  setSelectedCommitId: (id: string | null) => {
    if (id) audioFx.playKeyClick();
    set({ selectedCommitId: id });
  },

  resetGitRepo: (customState?: Partial<GitRepoState>) => {
    const base = JSON.parse(JSON.stringify(INITIAL_GIT_STATE));
    set({
      gitRepoState: customState ? { ...base, ...customState } : base,
      gitCliInput: "",
      selectedCommitId: "c1",
      gitTerminalLogs: [
        "Git Time Machine v2.45.0-virtual",
        "Repository state reset.",
      ],
    });
  },

  setGitVictoryModalOpen: (open: boolean) => {
    set({ isGitVictoryModalOpen: open });
  },
});
