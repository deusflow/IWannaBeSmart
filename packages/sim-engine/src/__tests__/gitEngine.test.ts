/**
 * @file packages/sim-engine/src/__tests__/gitEngine.test.ts
 * @description Unit tests for Virtual Git simulation engine, DAG commit trees, branching, merges, conflicts, and rebase
 */

import { describe, it, expect } from "vitest";
import {
  INITIAL_GIT_STATE,
  executeGitCommand,
  executeGitScript,
  resolveConflict,
  formatGitLog,
  getCurrentCommitId,
  GIT_TASKS,
} from "../index";

describe("Virtual Git Simulation Engine", () => {
  it("should initialize with canonical genesis commit and main branch", () => {
    expect(INITIAL_GIT_STATE.commits["c1"]).toBeDefined();
    expect(INITIAL_GIT_STATE.commits["c1"].message).toContain("Initial commit");
    expect(INITIAL_GIT_STATE.branches["main"]).toBe("c1");
    expect(INITIAL_GIT_STATE.head).toEqual({ type: "branch", target: "main" });
    expect(getCurrentCommitId(INITIAL_GIT_STATE)).toBe("c1");
  });

  it("should report clean status on fresh repository", () => {
    const res = executeGitCommand(INITIAL_GIT_STATE, "git status");
    expect(res.success).toBe(true);
    expect(res.output).toContain("On branch main");
    expect(res.output).toContain("working tree clean");
  });

  it("should create new commits and advance the active branch pointer", () => {
    const res1 = executeGitCommand(
      INITIAL_GIT_STATE,
      'git commit -m "feat: add telemetry transmitter"'
    );
    expect(res1.success).toBe(true);
    expect(res1.createdCommitId).toBe("c2");
    expect(res1.newState.commits["c2"]).toBeDefined();
    expect(res1.newState.commits["c2"].parents).toEqual(["c1"]);
    expect(res1.newState.branches["main"]).toBe("c2");
    expect(getCurrentCommitId(res1.newState)).toBe("c2");
  });

  it("should support creating and switching branches", () => {
    // git branch feature/radar
    const branchRes = executeGitCommand(INITIAL_GIT_STATE, "git branch feature/radar");
    expect(branchRes.success).toBe(true);
    expect(branchRes.newState.branches["feature/radar"]).toBe("c1");
    expect(branchRes.newState.head.target).toBe("main"); // Still on main

    // git checkout feature/radar
    const checkoutRes = executeGitCommand(branchRes.newState, "git checkout feature/radar");
    expect(checkoutRes.success).toBe(true);
    expect(checkoutRes.newState.head).toEqual({
      type: "branch",
      target: "feature/radar",
    });

    // git checkout -b feature/crypto
    const shortcutRes = executeGitCommand(checkoutRes.newState, "git checkout -b feature/crypto");
    expect(shortcutRes.success).toBe(true);
    expect(shortcutRes.newState.head.target).toBe("feature/crypto");
    expect(shortcutRes.newState.branches["feature/crypto"]).toBe("c1");
  });

  it("should handle detached HEAD when checking out commit hash directly", () => {
    const res = executeGitCommand(INITIAL_GIT_STATE, "git checkout c1");
    expect(res.success).toBe(true);
    expect(res.newState.head).toEqual({ type: "commit", target: "c1" });
    expect(res.output).toContain("detached HEAD");
  });

  it("should perform Fast-Forward merge when current is direct ancestor of target", () => {
    // 1. Create feature branch and commit
    const s1 = executeGitCommand(INITIAL_GIT_STATE, "git checkout -b feature/sonar").newState;
    const s2 = executeGitCommand(s1, 'git commit -m "feat: add sonar probe"').newState;
    expect(s2.branches["feature/sonar"]).toBe("c2");
    expect(s2.branches["main"]).toBe("c1");

    // 2. Checkout main and merge feature/sonar
    const s3 = executeGitCommand(s2, "git checkout main").newState;
    const mergeRes = executeGitCommand(s3, "git merge feature/sonar");

    expect(mergeRes.success).toBe(true);
    expect(mergeRes.output).toContain("Fast-forward");
    expect(mergeRes.newState.branches["main"]).toBe("c2");
  });

  it("should perform 3-Way merge commit when branches have diverged without conflicts", () => {
    // c1 (root) -> c2 (feature/ui)
    //           -> c3 (main)
    const s1 = executeGitCommand(INITIAL_GIT_STATE, "git checkout -b feature/ui").newState;
    s1.workingTree["ui.html"] = "<h1>UI</h1>";
    const s2 = executeGitCommand(s1, 'git commit -m "feat: add ui view"').newState; // c2

    const s3 = executeGitCommand(s2, "git checkout main").newState;
    s3.workingTree["backend.go"] = "package main";
    const s4 = executeGitCommand(s3, 'git commit -m "feat: add backend handler"').newState; // c3

    // Merge feature/ui into main
    const mergeRes = executeGitCommand(s4, "git merge feature/ui");
    expect(mergeRes.success).toBe(true);
    expect(mergeRes.output).toContain("Merge made by the 'ort' strategy");

    const mergeCommitId = mergeRes.createdCommitId!;
    const mergeCommit = mergeRes.newState.commits[mergeCommitId];
    expect(mergeCommit.parents).toEqual(["c3", "c2"]);
    expect(mergeCommit.files["ui.html"]).toBe("<h1>UI</h1>");
    expect(mergeCommit.files["backend.go"]).toBe("package main");
  });

  it("should detect Merge Conflicts when branches edit the same file with different content", () => {
    // Main edits device.config
    const s1 = { ...INITIAL_GIT_STATE };
    s1.workingTree = {
      ...s1.workingTree,
      "device.config": "mode=production\nbaudrate=230400",
    };
    const s2 = executeGitCommand(s1, 'git commit -m "change baudrate to 230400"').newState; // c2

    // Branch hotfix edits device.config from c1
    const s3 = executeGitCommand(s2, "git checkout -b hotfix/baudrate c1").newState;
    s3.workingTree = {
      ...s3.workingTree,
      "device.config": "mode=production\nbaudrate=460800",
    };
    const s4 = executeGitCommand(s3, 'git commit -m "hotfix baudrate to 460800"').newState; // c3

    // Checkout main and merge hotfix
    const s5 = executeGitCommand(s4, "git checkout main").newState;
    const mergeRes = executeGitCommand(s5, "git merge hotfix/baudrate");

    expect(mergeRes.success).toBe(false);
    expect(mergeRes.conflictDetected).toBe(true);
    expect(mergeRes.output).toContain("CONFLICT (content)");
    expect(mergeRes.newState.conflictState).toBeDefined();
    expect(mergeRes.newState.conflictState?.files[0].filePath).toBe("device.config");
    expect(mergeRes.newState.workingTree["device.config"]).toContain("<<<<<<< HEAD");
  });

  it("should resolve conflicts using strategies and commit the resolved state", () => {
    // Setup conflict
    const s1 = { ...INITIAL_GIT_STATE };
    s1.workingTree["config.json"] = '{"port": 8080}';
    const s2 = executeGitCommand(s1, 'git commit -m "port 8080"').newState;

    const s3 = executeGitCommand(s2, "git checkout -b dev c1").newState;
    s3.workingTree["config.json"] = '{"port": 9090}';
    const s4 = executeGitCommand(s3, 'git commit -m "port 9090"').newState;

    const s5 = executeGitCommand(s4, "git checkout main").newState;
    const conflictState = executeGitCommand(s5, "git merge dev").newState;
    expect(conflictState.conflictState).not.toBeNull();

    // Resolve using 'ours' (8080)
    const resolvedState = resolveConflict(conflictState, "ours").newState;
    expect(resolvedState.workingTree["config.json"]).toBe('{"port": 8080}');

    // Commit merge
    const commitRes = executeGitCommand(resolvedState, 'git commit -m "resolve port conflict"');
    expect(commitRes.success).toBe(true);
    expect(commitRes.newState.conflictState).toBeNull();
    expect(commitRes.newState.commits[commitRes.createdCommitId!].parents.length).toBe(2);
  });

  it("should support git rebase to linearize history", () => {
    // main: c1 -> c3
    // feat: c1 -> c2
    const s1 = executeGitCommand(INITIAL_GIT_STATE, "git checkout -b feat").newState;
    s1.workingTree["feature.txt"] = "feat code";
    const s2 = executeGitCommand(s1, 'git commit -m "feat commit"').newState; // c2 on feat

    const s3 = executeGitCommand(s2, "git checkout main").newState;
    s3.workingTree["main.txt"] = "main code";
    const s4 = executeGitCommand(s3, 'git commit -m "main commit"').newState; // c3 on main

    // Switch to feat and rebase on main
    const s5 = executeGitCommand(s4, "git checkout feat").newState;
    const rebaseRes = executeGitCommand(s5, "git rebase main");

    expect(rebaseRes.success).toBe(true);
    expect(rebaseRes.output).toContain("Successfully rebased");

    // The rebased commit on feat should have c3 as its parent
    const featCommitId = rebaseRes.newState.branches["feat"];
    const featCommit = rebaseRes.newState.commits[featCommitId];
    expect(featCommit.parents).toEqual(["c3"]);
    expect(featCommit.message).toContain("(rebased)");
  });

  it("should support git reset (--soft, --mixed, --hard)", () => {
    const s1 = executeGitCommand(INITIAL_GIT_STATE, 'git commit -m "commit c2"').newState;
    expect(s1.branches["main"]).toBe("c2");

    // Reset back to c1
    const resetRes = executeGitCommand(s1, "git reset --hard c1");
    expect(resetRes.success).toBe(true);
    expect(resetRes.newState.branches["main"]).toBe("c1");
    expect(getCurrentCommitId(resetRes.newState)).toBe("c1");
  });

  it("should format ASCII git log with branches and HEAD pointers", () => {
    const logStr = formatGitLog(INITIAL_GIT_STATE);
    expect(logStr).toContain("* c1 (HEAD -> main)");
    expect(logStr).toContain("Initial commit");
  });

  it("should execute C# and Go scripts in executeGitScript", () => {
    const csharpCode = `
Process.Start("git", "checkout -b feature/sensor");
Process.Start("git", "commit -m \\"feat: optical sensor calibration\\"");
`;
    const res = executeGitScript(csharpCode, "csharp", INITIAL_GIT_STATE);
    expect(res.success).toBe(true);
    expect(res.executedCommands).toHaveLength(2);
    expect(res.finalState.branches["feature/sensor"]).toBeDefined();
  });

  it("should validate all 6 curriculum tasks in GIT_TASKS", () => {
    expect(GIT_TASKS).toHaveLength(6);

    for (const task of GIT_TASKS) {
      // Validate C# target code
      const csResult = executeGitScript(task.targetCode.csharp, "csharp", task.initialState);
      const csValidation = task.validate(
        task.initialState,
        csResult.finalState,
        csResult,
        task.targetCode.csharp
      );
      expect(csValidation.passed).toBe(true);

      // Validate Go target code
      const goResult = executeGitScript(task.targetCode.go, "go", task.initialState);
      const goValidation = task.validate(
        task.initialState,
        goResult.finalState,
        goResult,
        task.targetCode.go
      );
      expect(goValidation.passed).toBe(true);
    }
  });
});
