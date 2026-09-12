/**
 * @file packages/sim-engine/src/runtime/tasks-git.ts
 * @description Educational curriculum tasks for Station 05: Git Time Machine (C# & Go)
 */

import {
  type GitRepoState,
  type GitRuntimeResult,
  INITIAL_GIT_STATE,
} from "./gitContext";

export interface GitTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: GitRepoState;
  validate: (
    before: GitRepoState,
    after: GitRepoState,
    result: GitRuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const GIT_TASKS: GitTask[] = [
  // ── Task 1: Genesis Commit ──────────────────────────────────────
  {
    id: "task-git-1-genesis",
    order: 1,
    titleKey: "git.tasks.task1.title",
    conceptKey: "git.tasks.task1.concept",
    descKey: "git.tasks.task1.desc",
    hintKey: "git.tasks.task1.hint",
    successKey: "git.tasks.task1.success",
    targetCode: {
      csharp: `// C# Process Execution of Git Commit
using System.Diagnostics;

Process.Start("git", "add .");
Process.Start("git", "commit -m \\"feat: initialize hardware telemetry sensor\\"");`,
      go: `// Go exec.Command Git Commit
package main
import "os/exec"

func main() {
    exec.Command("git", "add", ".").Run()
    exec.Command("git", "commit", "-m", "feat: initialize hardware telemetry sensor").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "add .");
Process.Start("git", /* Вкажіть commit -m "..." */);`,
      go: `exec.Command("git", "add", ".").Run()
exec.Command("git", /* Вкажіть аргументи commit -m */).Run()`,
    },
    initialState: INITIAL_GIT_STATE,
    validate: (before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasCommitCmd =
        normalized.includes("commit") &&
        (normalized.includes("-m") || normalized.includes("feat"));

      const hasMoreCommits =
        Object.keys(after.commits).length > Object.keys(before.commits).length;

      const passed = hasCommitCmd && (hasMoreCommits || result.executedCommands.some(c => c.includes("commit")));

      return {
        passed,
        messageKey: passed ? "git.tasks.task1.success" : "git.tasks.task1.fail",
      };
    },
  },

  // ── Task 2: Parallel Universes (Branching) ──────────────────────
  {
    id: "task-git-2-branching",
    order: 2,
    titleKey: "git.tasks.task2.title",
    conceptKey: "git.tasks.task2.concept",
    descKey: "git.tasks.task2.desc",
    hintKey: "git.tasks.task2.hint",
    successKey: "git.tasks.task2.success",
    targetCode: {
      csharp: `// Create and checkout feature branch
Process.Start("git", "checkout -b feature/ir-blaster");
Process.Start("git", "commit -m \\"feat: calibrate 38khz ir frequency\\"");`,
      go: `// Go branch switch
package main
import "os/exec"

func main() {
    exec.Command("git", "checkout", "-b", "feature/ir-blaster").Run()
    exec.Command("git", "commit", "-m", "feat: calibrate 38khz ir frequency").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "checkout -b /* Вкажіть назву гілки feature/ir-blaster */");
Process.Start("git", "commit -m \\"feat: calibrate 38khz ir frequency\\"");`,
      go: `exec.Command("git", "checkout", "-b", /* Вкажіть feature/ir-blaster */).Run()
exec.Command("git", "commit", "-m", "feat: calibrate 38khz ir frequency").Run()`,
    },
    initialState: INITIAL_GIT_STATE,
    validate: (_before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const mentionsBranch =
        normalized.includes("feature/ir-blaster") ||
        normalized.includes("checkout -b") ||
        normalized.includes("switch -c");

      const branchExists = Boolean(after.branches["feature/ir-blaster"]);
      const isCheckedOut = after.head.type === "branch" && after.head.target === "feature/ir-blaster";

      const passed = mentionsBranch && (branchExists || isCheckedOut || result.executedCommands.some(c => c.includes("checkout -b")));

      return {
        passed,
        messageKey: passed ? "git.tasks.task2.success" : "git.tasks.task2.fail",
      };
    },
  },

  // ── Task 3: Fast-Forward & 3-Way Merge ──────────────────────────
  {
    id: "task-git-3-merge",
    order: 3,
    titleKey: "git.tasks.task3.title",
    conceptKey: "git.tasks.task3.concept",
    descKey: "git.tasks.task3.desc",
    hintKey: "git.tasks.task3.hint",
    successKey: "git.tasks.task3.success",
    targetCode: {
      csharp: `// Checkout main and merge feature branch
Process.Start("git", "checkout main");
Process.Start("git", "merge feature/ir-blaster");`,
      go: `// Go Merge feature branch into main
package main
import "os/exec"

func main() {
    exec.Command("git", "checkout", "main").Run()
    exec.Command("git", "merge", "feature/ir-blaster").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "checkout main");
Process.Start("git", /* Вкажіть merge feature/ir-blaster */);`,
      go: `exec.Command("git", "checkout", "main").Run()
exec.Command("git", /* Вкажіть merge */).Run()`,
    },
    initialState: {
      ...INITIAL_GIT_STATE,
      commits: {
        ...INITIAL_GIT_STATE.commits,
        c2: {
          id: "c2",
          parents: ["c1"],
          message: "feat: add ir blaster signal emitter",
          author: "Engineer <engineer@iwannabesmart.dev>",
          timestamp: 1726000100000,
          branch: "feature/ir-blaster",
          files: {
            ...INITIAL_GIT_STATE.commits["c1"].files,
            "ir_blaster.cpp": "void emit38kHz() { /* Pulse PWM */ }",
          },
        },
      },
      branches: {
        main: "c1",
        "feature/ir-blaster": "c2",
      },
      head: {
        type: "branch",
        target: "feature/ir-blaster",
      },
      commitCounter: 2,
    },
    validate: (_before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasCheckoutMain = normalized.includes("checkout main") || normalized.includes("switch main");
      const hasMergeCmd = normalized.includes("merge feature/ir-blaster") || normalized.includes("merge");

      const mainMovedToC2 = after.branches["main"] === "c2" || (after.commits[after.branches["main"]]?.parents.length ?? 0) > 1;

      const passed = (hasCheckoutMain && hasMergeCmd) || mainMovedToC2 || result.executedCommands.some(c => c.includes("merge"));

      return {
        passed,
        messageKey: passed ? "git.tasks.task3.success" : "git.tasks.task3.fail",
      };
    },
  },

  // ── Task 4: The Collision (Resolving Merge Conflicts) ───────────
  {
    id: "task-git-4-conflict",
    order: 4,
    titleKey: "git.tasks.task4.title",
    conceptKey: "git.tasks.task4.concept",
    descKey: "git.tasks.task4.desc",
    hintKey: "git.tasks.task4.hint",
    successKey: "git.tasks.task4.success",
    targetCode: {
      csharp: `// Resolve conflict: choose unified baudrate and commit
Process.Start("git", "checkout main");
Process.Start("git", "merge hotfix/baudrate");
// Conflict in device.config resolved:
Process.Start("git", "add device.config");
Process.Start("git", "commit -m \\"fix: resolve baudrate conflict between main and hotfix\\"");`,
      go: `// Go conflict resolution
package main
import "os/exec"

func main() {
    exec.Command("git", "checkout", "main").Run()
    exec.Command("git", "merge", "hotfix/baudrate").Run()
    exec.Command("git", "add", "device.config").Run()
    exec.Command("git", "commit", "-m", "fix: resolve baudrate conflict between main and hotfix").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "checkout main");
Process.Start("git", "merge hotfix/baudrate");
Process.Start("git", "add device.config");
Process.Start("git", /* Зробіть merge commit після розв'язання конфлікту */);`,
      go: `exec.Command("git", "checkout", "main").Run()
exec.Command("git", "merge", "hotfix/baudrate").Run()
exec.Command("git", "add", "device.config").Run()
exec.Command("git", /* Завершіть злиття commit -m */).Run()`,
    },
    initialState: {
      ...INITIAL_GIT_STATE,
      commits: {
        ...INITIAL_GIT_STATE.commits,
        c2: {
          id: "c2",
          parents: ["c1"],
          message: "feat: change main baudrate to 230400",
          author: "Engineer <engineer@iwannabesmart.dev>",
          timestamp: 1726000200000,
          branch: "main",
          files: {
            "device.config": "mode=production\nbaudrate=230400\nstatus=online",
          },
        },
        c3: {
          id: "c3",
          parents: ["c1"],
          message: "fix: change hotfix baudrate to 460800",
          author: "DevOps <devops@iwannabesmart.dev>",
          timestamp: 1726000250000,
          branch: "hotfix/baudrate",
          files: {
            "device.config": "mode=production\nbaudrate=460800\nstatus=online",
          },
        },
      },
      branches: {
        main: "c2",
        "hotfix/baudrate": "c3",
      },
      head: {
        type: "branch",
        target: "main",
      },
      commitCounter: 3,
    },
    validate: (before, after, _result, code = "") => {
      const normalized = code.toLowerCase();
      const hasMerge = normalized.includes("merge hotfix/baudrate") || normalized.includes("merge");
      const hasAdd = normalized.includes("add device.config") || normalized.includes("add .");
      const hasCommit = normalized.includes("commit");

      const passed =
        (hasMerge && hasAdd && hasCommit) ||
        (after.conflictState === null && Object.keys(after.commits).length > Object.keys(before.commits).length);

      return {
        passed,
        messageKey: passed ? "git.tasks.task4.success" : "git.tasks.task4.fail",
      };
    },
  },

  // ── Task 5: Rewriting History (Git Rebase) ──────────────────────
  {
    id: "task-git-5-rebase",
    order: 5,
    titleKey: "git.tasks.task5.title",
    conceptKey: "git.tasks.task5.concept",
    descKey: "git.tasks.task5.desc",
    hintKey: "git.tasks.task5.hint",
    successKey: "git.tasks.task5.success",
    targetCode: {
      csharp: `// Rebase feature branch onto main to linearize DAG
Process.Start("git", "checkout feature/sensor-driver");
Process.Start("git", "rebase main");`,
      go: `// Go rebase feature branch onto main
package main
import "os/exec"

func main() {
    exec.Command("git", "checkout", "feature/sensor-driver").Run()
    exec.Command("git", "rebase", "main").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "checkout feature/sensor-driver");
Process.Start("git", /* Вкажіть rebase main */);`,
      go: `exec.Command("git", "checkout", "feature/sensor-driver").Run()
exec.Command("git", /* Вкажіть rebase main */).Run()`,
    },
    initialState: {
      ...INITIAL_GIT_STATE,
      commits: {
        ...INITIAL_GIT_STATE.commits,
        c2: {
          id: "c2",
          parents: ["c1"],
          message: "feat: add sensor driver on feature branch",
          author: "Engineer <engineer@iwannabesmart.dev>",
          timestamp: 1726000300000,
          branch: "feature/sensor-driver",
          files: {
            ...INITIAL_GIT_STATE.commits["c1"].files,
            "sensor.c": "int read() { return 42; }",
          },
        },
        c3: {
          id: "c3",
          parents: ["c1"],
          message: "chore: update ci pipeline in main",
          author: "CI Bot <bot@github.com>",
          timestamp: 1726000350000,
          branch: "main",
          files: {
            ...INITIAL_GIT_STATE.commits["c1"].files,
            ".github/workflows/ci.yml": "name: CI",
          },
        },
      },
      branches: {
        main: "c3",
        "feature/sensor-driver": "c2",
      },
      head: {
        type: "branch",
        target: "feature/sensor-driver",
      },
      commitCounter: 3,
    },
    validate: (_before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasRebaseCmd = normalized.includes("rebase main");

      // After rebase, feature/sensor-driver commit should have parent c3 (or rebased commit)
      const featureCommitId = after.branches["feature/sensor-driver"];
      const featureCommit = after.commits[featureCommitId];
      const isParentC3 = featureCommit?.parents.includes("c3");

      const passed = hasRebaseCmd || isParentC3 || result.executedCommands.some(c => c.includes("rebase"));

      return {
        passed,
        messageKey: passed ? "git.tasks.task5.success" : "git.tasks.task5.fail",
      };
    },
  },

  // ── Task 6: GitHub Pull Request & CI Automation Gate ────────────
  {
    id: "task-git-6-pull-request",
    order: 6,
    titleKey: "git.tasks.task6.title",
    conceptKey: "git.tasks.task6.concept",
    descKey: "git.tasks.task6.desc",
    hintKey: "git.tasks.task6.hint",
    successKey: "git.tasks.task6.success",
    targetCode: {
      csharp: `// GitHub Flow: Push branch, pass CI checks and merge PR
Process.Start("git", "checkout -b pr/crypto-pin-auth");
Process.Start("git", "commit -m \\"feat: integrate SHA-256 PIN hashing\\"");
Process.Start("git", "checkout main");
Process.Start("git", "merge pr/crypto-pin-auth");`,
      go: `// Go GitHub PR Flow
package main
import "os/exec"

func main() {
    exec.Command("git", "checkout", "-b", "pr/crypto-pin-auth").Run()
    exec.Command("git", "commit", "-m", "feat: integrate SHA-256 PIN hashing").Run()
    exec.Command("git", "checkout", "main").Run()
    exec.Command("git", "merge", "pr/crypto-pin-auth").Run()
}`,
    },
    clozeTemplate: {
      csharp: `Process.Start("git", "checkout -b pr/crypto-pin-auth");
Process.Start("git", "commit -m \\"feat: integrate SHA-256 PIN hashing\\"");
Process.Start("git", "checkout main");
Process.Start("git", /* Злийте перевірений PR у main */);`,
      go: `exec.Command("git", "checkout", "-b", "pr/crypto-pin-auth").Run()
exec.Command("git", "commit", "-m", "feat: integrate SHA-256 PIN hashing").Run()
exec.Command("git", "checkout", "main").Run()
exec.Command("git", /* merge */).Run()`,
    },
    initialState: INITIAL_GIT_STATE,
    validate: (_before, _after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasPrBranch =
        normalized.includes("pr/crypto-pin-auth") ||
        normalized.includes("checkout -b");
      const hasMergeMain =
        normalized.includes("checkout main") &&
        normalized.includes("merge");

      const passed =
        (hasPrBranch && hasMergeMain) ||
        result.executedCommands.length >= 3;

      return {
        passed,
        messageKey: passed ? "git.tasks.task6.success" : "git.tasks.task6.fail",
      };
    },
  },
];
