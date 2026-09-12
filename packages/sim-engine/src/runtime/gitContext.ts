/**
 * @file packages/sim-engine/src/runtime/gitContext.ts
 * @description Virtual Git VCS & GitHub Simulation Engine with DAG commit graphs, branching, fast-forward/3-way merges, conflict resolution, rebase, and PRs
 */

export interface GitCommit {
  id: string; // Short SHA-1 e.g. "c1", "a8b2"
  parents: string[]; // Parent commit IDs (empty for root, 1 for regular, 2 for merge commit)
  message: string;
  author: string;
  timestamp: number;
  branch: string; // Branch it was created on
  files: Record<string, string>; // Virtual filesystem snapshot
}

export interface GitHead {
  type: "branch" | "commit"; // "branch" = attached HEAD, "commit" = detached HEAD
  target: string; // Branch name (e.g. "main") or commit hash (e.g. "c2")
}

export interface GitConflictFile {
  filePath: string;
  ours: string;
  theirs: string;
  base?: string;
  conflictContent: string;
}

export interface GitConflictState {
  sourceBranch: string;
  targetBranch: string;
  files: GitConflictFile[];
}

export interface PullRequestState {
  id: number;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  status: "OPEN" | "MERGED" | "CLOSED";
  ciChecksPassed: boolean;
  reviewsApproved: boolean;
  diffSummary?: string;
}

export interface GitRepoState {
  commits: Record<string, GitCommit>;
  branches: Record<string, string>; // branchName -> commitId
  head: GitHead;
  stagingArea: Record<string, string>; // filePath -> content
  workingTree: Record<string, string>; // filePath -> content
  conflictState: GitConflictState | null;
  pullRequest: PullRequestState | null;
  commitCounter: number;
}

export interface GitCommandResult {
  success: boolean;
  output: string;
  newState: GitRepoState;
  createdCommitId?: string;
  conflictDetected?: boolean;
}

export interface GitRuntimeResult {
  success: boolean;
  output: string;
  finalState: GitRepoState;
  executedCommands: string[];
  error?: string;
}

/**
 * Initial canonical repository state with a genesis commit
 */
export const INITIAL_GIT_STATE: GitRepoState = {
  commits: {
    c1: {
      id: "c1",
      parents: [],
      message: "Initial commit: Blueprint project initialized",
      author: "Engineer <engineer@iwannabesmart.dev>",
      timestamp: 1726000000000,
      branch: "main",
      files: {
        "README.md": "# Blueprint Workbench\nInteractive Engineering Platform",
        "device.config": "mode=production\nbaudrate=115200\nstatus=online",
      },
    },
  },
  branches: {
    main: "c1",
  },
  head: {
    type: "branch",
    target: "main",
  },
  stagingArea: {},
  workingTree: {
    "README.md": "# Blueprint Workbench\nInteractive Engineering Platform",
    "device.config": "mode=production\nbaudrate=115200\nstatus=online",
  },
  conflictState: null,
  pullRequest: null,
  commitCounter: 1,
};

/**
 * Resolves current commit ID referenced by HEAD
 */
export function getCurrentCommitId(state: GitRepoState): string {
  if (state.head.type === "branch") {
    const branchCommit = state.branches[state.head.target];
    return branchCommit || "c1";
  }
  return state.head.target;
}

/**
 * Finds all ancestors of a commit in the DAG
 */
export function getCommitAncestors(state: GitRepoState, startCommitId: string): Set<string> {
  const ancestors = new Set<string>();
  const queue = [startCommitId];

  while (queue.length > 0) {
    const currId = queue.shift()!;
    if (ancestors.has(currId)) continue;
    ancestors.add(currId);

    const commit = state.commits[currId];
    if (commit && commit.parents) {
      for (const parentId of commit.parents) {
        queue.push(parentId);
      }
    }
  }

  return ancestors;
}

/**
 * Generates an ASCII representation of the DAG log
 */
export function formatGitLog(state: GitRepoState): string {
  const currentCommit = getCurrentCommitId(state);
  const lines: string[] = [];

  // Sort commits chronologically descending
  const sortedCommits = Object.values(state.commits).sort(
    (a, b) => b.timestamp - a.timestamp
  );

  for (const commit of sortedCommits) {
    const branchesOnCommit = Object.entries(state.branches)
      .filter(([_, commitId]) => commitId === commit.id)
      .map(([name]) => name);

    const isHead = currentCommit === commit.id;
    let refBadge = "";

    if (branchesOnCommit.length > 0 || isHead) {
      const parts: string[] = [];
      if (isHead) {
        if (state.head.type === "branch") {
          parts.push(`HEAD -> ${state.head.target}`);
        } else {
          parts.push(`HEAD (detached at ${commit.id})`);
        }
      }
      for (const b of branchesOnCommit) {
        if (state.head.type !== "branch" || state.head.target !== b) {
          parts.push(b);
        }
      }
      refBadge = ` (${parts.join(", ")})`;
    }

    const parentText =
      commit.parents.length > 1
        ? ` [merge: ${commit.parents.join(" + ")}]`
        : "";

    lines.push(`* ${commit.id}${refBadge}${parentText} - ${commit.message} (${commit.author})`);
  }

  return lines.join("\n");
}

/**
 * Virtual Git CLI command interpreter
 */
export function executeGitCommand(
  state: GitRepoState,
  rawCmd: string
): GitCommandResult {
  const trimmed = rawCmd.trim();
  if (!trimmed) {
    return { success: true, output: "", newState: state };
  }

  // Normalize command
  const normalized = trimmed.startsWith("git ") ? trimmed.slice(4).trim() : trimmed;
  const parts = normalized.split(/\s+/);
  const verb = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  // Deep clone state for immutability
  const next: GitRepoState = {
    commits: { ...state.commits },
    branches: { ...state.branches },
    head: { ...state.head },
    stagingArea: { ...state.stagingArea },
    workingTree: { ...state.workingTree },
    conflictState: state.conflictState ? { ...state.conflictState } : null,
    pullRequest: state.pullRequest ? { ...state.pullRequest } : null,
    commitCounter: state.commitCounter,
  };

  switch (verb) {
    case "status": {
      const isDetached = next.head.type === "commit";
      const branchDesc = isDetached
        ? `HEAD detached at ${next.head.target}`
        : `On branch ${next.head.target}`;

      const stagedCount = Object.keys(next.stagingArea).length;
      let statusOutput = `${branchDesc}\n`;

      if (next.conflictState) {
        statusOutput += `\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n`;
        for (const file of next.conflictState.files) {
          statusOutput += `\tunmerged:   ${file.filePath}\n`;
        }
        return { success: true, output: statusOutput.trim(), newState: next };
      }

      if (stagedCount > 0) {
        statusOutput += `\nChanges to be committed:\n`;
        for (const f of Object.keys(next.stagingArea)) {
          statusOutput += `\tmodified:   ${f}\n`;
        }
      } else {
        statusOutput += `\nnothing to commit, working tree clean`;
      }

      return { success: true, output: statusOutput.trim(), newState: next };
    }

    case "log": {
      return { success: true, output: formatGitLog(next), newState: next };
    }

    case "branch": {
      // "git branch" -> list branches
      if (args.length === 0 || args[0] === "--list") {
        const lines = Object.keys(next.branches).map((name) => {
          const isCurrent =
            next.head.type === "branch" && next.head.target === name;
          return `${isCurrent ? "* " : "  "}${name} (${next.branches[name]})`;
        });
        return { success: true, output: lines.join("\n"), newState: next };
      }

      // "git branch -d <name>" -> delete branch
      if (args[0] === "-d" || args[0] === "-D") {
        const toDelete = args[1];
        if (!toDelete || !next.branches[toDelete]) {
          return {
            success: false,
            output: `error: branch '${toDelete}' not found.`,
            newState: next,
          };
        }
        if (next.head.type === "branch" && next.head.target === toDelete) {
          return {
            success: false,
            output: `error: Cannot delete branch '${toDelete}' checked out at current HEAD.`,
            newState: next,
          };
        }
        delete next.branches[toDelete];
        return {
          success: true,
          output: `Deleted branch ${toDelete}.`,
          newState: next,
        };
      }

      // "git branch <name>" -> create new branch pointing to current HEAD commit
      const newBranchName = args[0].replace(/^refs\/heads\//, "");
      if (next.branches[newBranchName]) {
        return {
          success: false,
          output: `fatal: A branch named '${newBranchName}' already exists.`,
          newState: next,
        };
      }

      const currCommit = getCurrentCommitId(next);
      next.branches[newBranchName] = currCommit;
      return {
        success: true,
        output: `Created branch ${newBranchName} at ${currCommit}.`,
        newState: next,
      };
    }

    case "checkout":
    case "switch": {
      // "git checkout -b <new-branch> [start-point]"
      if (args[0] === "-b" || (verb === "switch" && args[0] === "-c")) {
        const branchName = args[1];
        if (!branchName) {
          return {
            success: false,
            output: `fatal: missing branch name for -b flag.`,
            newState: next,
          };
        }
        const startPoint = args[2];
        const startCommit =
          startPoint && (next.branches[startPoint] || next.commits[startPoint])
            ? next.branches[startPoint] || startPoint
            : getCurrentCommitId(next);

        next.branches[branchName] = startCommit;
        next.head = { type: "branch", target: branchName };
        if (next.commits[startCommit]) {
          next.workingTree = { ...next.commits[startCommit].files };
        }
        return {
          success: true,
          output: `Switched to a new branch '${branchName}'`,
          newState: next,
        };
      }

      const target = args[0];
      if (!target) {
        return {
          success: false,
          output: `fatal: missing branch or commit target.`,
          newState: next,
        };
      }

      // Switching to known branch
      if (next.branches[target]) {
        next.head = { type: "branch", target };
        const commitId = next.branches[target];
        next.workingTree = { ...next.commits[commitId].files };
        return {
          success: true,
          output: `Switched to branch '${target}'`,
          newState: next,
        };
      }

      // Checking out commit directly (Detached HEAD)
      if (next.commits[target]) {
        next.head = { type: "commit", target };
        next.workingTree = { ...next.commits[target].files };
        return {
          success: true,
          output: `Note: switching to '${target}'.\nYou are in 'detached HEAD' state.`,
          newState: next,
        };
      }

      return {
        success: false,
        output: `error: pathspec '${target}' did not match any file(s) or branch known to git`,
        newState: next,
      };
    }

    case "add": {
      // "git add ." or "git add <file>"
      const target = args[0] || ".";
      if (target === "." || target === "-A") {
        next.stagingArea = { ...next.workingTree };
        return {
          success: true,
          output: `staged ${Object.keys(next.stagingArea).length} file(s)`,
          newState: next,
        };
      }
      if (next.workingTree[target] !== undefined) {
        next.stagingArea[target] = next.workingTree[target];
        return {
          success: true,
          output: `staged '${target}'`,
          newState: next,
        };
      }
      return {
        success: false,
        output: `fatal: pathspec '${target}' did not match any files`,
        newState: next,
      };
    }

    case "commit": {
      // Parse commit message
      let msg = "feat: update system state";
      const mIdx = args.indexOf("-m");
      if (mIdx !== -1 && args[mIdx + 1]) {
        msg = args.slice(mIdx + 1).join(" ").replace(/^["']|["']$/g, "");
      } else if (args[0] && !args[0].startsWith("-")) {
        msg = args.join(" ").replace(/^["']|["']$/g, "");
      }

      // If in conflict state, commit resolves the conflict
      if (next.conflictState) {
        const parent1 = getCurrentCommitId(next);
        const parent2 = next.branches[next.conflictState.sourceBranch] || "c1";
        next.commitCounter += 1;
        const newCommitId = `c${next.commitCounter}`;

        const resolvedCommit: GitCommit = {
          id: newCommitId,
          parents: [parent1, parent2],
          message: msg || `Merge branch '${next.conflictState.sourceBranch}' into ${next.head.target}`,
          author: "Engineer <engineer@iwannabesmart.dev>",
          timestamp: Date.now(),
          branch: next.head.type === "branch" ? next.head.target : "detached",
          files: { ...next.workingTree },
        };

        next.commits[newCommitId] = resolvedCommit;
        if (next.head.type === "branch") {
          next.branches[next.head.target] = newCommitId;
        } else {
          next.head.target = newCommitId;
        }
        next.conflictState = null;
        next.stagingArea = {};

        return {
          success: true,
          output: `[${next.head.target} ${newCommitId}] ${resolvedCommit.message}`,
          newState: next,
          createdCommitId: newCommitId,
        };
      }

      // Normal commit
      const parentId = getCurrentCommitId(next);
      next.commitCounter += 1;
      const newId = `c${next.commitCounter}`;

      // Snapshot files (merge staging with parent snapshot)
      const parentSnapshot = next.commits[parentId]?.files || {};
      const newFiles = {
        ...parentSnapshot,
        ...next.stagingArea,
        ...next.workingTree,
      };

      const newCommit: GitCommit = {
        id: newId,
        parents: [parentId],
        message: msg,
        author: "Engineer <engineer@iwannabesmart.dev>",
        timestamp: Date.now(),
        branch: next.head.type === "branch" ? next.head.target : "detached",
        files: newFiles,
      };

      next.commits[newId] = newCommit;

      // Advance branch pointer or detached HEAD
      if (next.head.type === "branch") {
        next.branches[next.head.target] = newId;
      } else {
        next.head.target = newId;
      }
      next.stagingArea = {};

      return {
        success: true,
        output: `[${next.head.type === "branch" ? next.head.target : "detached"} ${newId}] ${msg}`,
        newState: next,
        createdCommitId: newId,
      };
    }

    case "merge": {
      const sourceBranch = args[0];
      if (!sourceBranch || !next.branches[sourceBranch]) {
        return {
          success: false,
          output: `fatal: '${sourceBranch}' does not point to a valid branch.`,
          newState: next,
        };
      }

      const currentBranch =
        next.head.type === "branch" ? next.head.target : null;
      if (!currentBranch) {
        return {
          success: false,
          output: `fatal: You are in detached HEAD state. Switch to a branch before merging.`,
          newState: next,
        };
      }

      if (currentBranch === sourceBranch) {
        return {
          success: true,
          output: `Already up to date.`,
          newState: next,
        };
      }

      const currentCommitId = next.branches[currentBranch];
      const sourceCommitId = next.branches[sourceBranch];

      // Check if current is already ancestor of source (Fast-Forward)
      const sourceAncestors = getCommitAncestors(next, sourceCommitId);
      const currentAncestors = getCommitAncestors(next, currentCommitId);

      if (sourceAncestors.has(currentCommitId)) {
        // FAST FORWARD
        next.branches[currentBranch] = sourceCommitId;
        next.workingTree = { ...next.commits[sourceCommitId].files };
        return {
          success: true,
          output: `Updating ${currentCommitId}..${sourceCommitId}\nFast-forward`,
          newState: next,
        };
      }

      if (currentAncestors.has(sourceCommitId)) {
        return {
          success: true,
          output: `Already up to date.`,
          newState: next,
        };
      }

      // Check for file content conflicts between current files and source files
      const currentFiles = next.commits[currentCommitId].files;
      const sourceFiles = next.commits[sourceCommitId].files;

      const conflictingFiles: GitConflictFile[] = [];
      for (const [filePath, srcContent] of Object.entries(sourceFiles)) {
        const currContent = currentFiles[filePath];
        if (currContent !== undefined && currContent !== srcContent) {
          conflictingFiles.push({
            filePath,
            ours: currContent,
            theirs: srcContent,
            conflictContent: `<<<<<<< HEAD (${currentBranch})\n${currContent}\n=======\n${srcContent}\n>>>>>>> ${sourceBranch}`,
          });
        }
      }

      if (conflictingFiles.length > 0) {
        // Trigger conflict state
        next.conflictState = {
          sourceBranch,
          targetBranch: currentBranch,
          files: conflictingFiles,
        };
        // Update working tree with conflict markers
        for (const cf of conflictingFiles) {
          next.workingTree[cf.filePath] = cf.conflictContent;
        }

        return {
          success: false,
          conflictDetected: true,
          output: `Auto-merging ${conflictingFiles.map((f) => f.filePath).join(", ")}\nCONFLICT (content): Merge conflict in ${conflictingFiles[0].filePath}\nAutomatic merge failed; fix conflicts and then commit the result.`,
          newState: next,
        };
      }

      // 3-WAY MERGE COMMIT (No conflict)
      next.commitCounter += 1;
      const mergeCommitId = `c${next.commitCounter}`;
      const mergedFiles = { ...currentFiles, ...sourceFiles };

      const mergeCommit: GitCommit = {
        id: mergeCommitId,
        parents: [currentCommitId, sourceCommitId],
        message: `Merge branch '${sourceBranch}' into ${currentBranch}`,
        author: "Engineer <engineer@iwannabesmart.dev>",
        timestamp: Date.now(),
        branch: currentBranch,
        files: mergedFiles,
      };

      next.commits[mergeCommitId] = mergeCommit;
      next.branches[currentBranch] = mergeCommitId;
      next.workingTree = { ...mergedFiles };

      return {
        success: true,
        output: `Merge made by the 'ort' strategy.\n ${mergeCommitId} Merge branch '${sourceBranch}' into ${currentBranch}`,
        newState: next,
        createdCommitId: mergeCommitId,
      };
    }

    case "rebase": {
      const upstream = args[0];
      if (!upstream || !next.branches[upstream]) {
        return {
          success: false,
          output: `fatal: invalid upstream '${upstream}'`,
          newState: next,
        };
      }

      const currentBranch =
        next.head.type === "branch" ? next.head.target : null;
      if (!currentBranch) {
        return {
          success: false,
          output: `fatal: cannot rebase detached HEAD`,
          newState: next,
        };
      }

      const upstreamCommitId = next.branches[upstream];
      const currentCommitId = next.branches[currentBranch];

      if (upstreamCommitId === currentCommitId) {
        return {
          success: true,
          output: `Current branch ${currentBranch} is up to date.`,
          newState: next,
        };
      }

      // Find commits unique to current branch
      const upstreamAncestors = getCommitAncestors(next, upstreamCommitId);
      const commitsToReplay: GitCommit[] = [];
      let walker: string | undefined = currentCommitId;

      while (walker && !upstreamAncestors.has(walker)) {
        const commit: GitCommit | undefined = next.commits[walker];
        if (!commit) break;
        commitsToReplay.unshift(commit);
        walker = commit.parents[0];
      }

      if (commitsToReplay.length === 0) {
        // Fast-forward rebase
        next.branches[currentBranch] = upstreamCommitId;
        next.workingTree = { ...next.commits[upstreamCommitId].files };
        return {
          success: true,
          output: `Successfully rebased and updated refs/heads/${currentBranch}.`,
          newState: next,
        };
      }

      // Replay commits one by one on top of upstream
      let newBaseId = upstreamCommitId;
      for (const c of commitsToReplay) {
        next.commitCounter += 1;
        const replayedId = `c${next.commitCounter}`;
        const replayedCommit: GitCommit = {
          id: replayedId,
          parents: [newBaseId],
          message: `${c.message} (rebased)`,
          author: c.author,
          timestamp: Date.now(),
          branch: currentBranch,
          files: { ...next.commits[newBaseId].files, ...c.files },
        };
        next.commits[replayedId] = replayedCommit;
        newBaseId = replayedId;
      }

      next.branches[currentBranch] = newBaseId;
      next.workingTree = { ...next.commits[newBaseId].files };

      return {
        success: true,
        output: `Successfully rebased and updated refs/heads/${currentBranch}. (Linear DAG restored)`,
        newState: next,
      };
    }

    case "reset": {
      // "git reset [--soft|--mixed|--hard] <target>"
      let mode: "--soft" | "--mixed" | "--hard" = "--mixed";
      let target = args[0];

      if (args[0] === "--soft" || args[0] === "--mixed" || args[0] === "--hard") {
        mode = args[0];
        target = args[1];
      }

      if (!target || target === "HEAD") {
        target = getCurrentCommitId(next);
      } else if (target === "HEAD~1" || target === "HEAD^") {
        const curr = getCurrentCommitId(next);
        const parent = next.commits[curr]?.parents[0];
        if (!parent) {
          return {
            success: false,
            output: `fatal: ambiguous argument '${target}': unknown revision`,
            newState: next,
          };
        }
        target = parent;
      }

      if (!next.commits[target]) {
        return {
          success: false,
          output: `fatal: Cannot do reset to unknown commit '${target}'`,
          newState: next,
        };
      }

      // Move branch pointer or detached HEAD
      if (next.head.type === "branch") {
        next.branches[next.head.target] = target;
      } else {
        next.head.target = target;
      }

      if (mode === "--hard") {
        next.stagingArea = {};
        next.workingTree = { ...next.commits[target].files };
        next.conflictState = null;
      } else if (mode === "--mixed") {
        next.stagingArea = {};
      }

      return {
        success: true,
        output: `HEAD is now at ${target} ${next.commits[target].message}`,
        newState: next,
      };
    }

    default:
      return {
        success: false,
        output: `git: '${verb}' is not a recognized git command. Try: status, branch, checkout, commit, merge, rebase, reset, log`,
        newState: next,
      };
  }
}

/**
 * Resolves active conflict in repo state
 */
export function resolveConflict(
  state: GitRepoState,
  resolution: "ours" | "theirs" | "both"
): GitCommandResult {
  if (!state.conflictState) {
    return {
      success: false,
      output: "No active merge conflict to resolve.",
      newState: state,
    };
  }

  const next: GitRepoState = {
    ...state,
    workingTree: { ...state.workingTree },
    stagingArea: { ...state.stagingArea },
  };

  for (const cf of state.conflictState.files) {
    if (resolution === "ours") {
      next.workingTree[cf.filePath] = cf.ours;
    } else if (resolution === "theirs") {
      next.workingTree[cf.filePath] = cf.theirs;
    } else {
      // Both: combined
      next.workingTree[cf.filePath] = `${cf.ours}\n// --- Incoming Changes ---\n${cf.theirs}`;
    }
    next.stagingArea[cf.filePath] = next.workingTree[cf.filePath];
  }

  return {
    success: true,
    output: `Resolved conflict in ${state.conflictState.files.length} file(s) using '${resolution}' strategy. Staged for commit.`,
    newState: next,
  };
}

/**
 * High-level script executor for C# and Go Code Gym tasks
 */
export function executeGitScript(
  code: string,
  _language: "csharp" | "go",
  initialState: GitRepoState = INITIAL_GIT_STATE
): GitRuntimeResult {
  let currentState = { ...initialState };
  const executedCommands: string[] = [];
  const logLines: string[] = [];

  // Extract simulated git command lines or programmatic API calls
  const lines = code.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) continue;

    // Pattern 1: CLI invocation e.g. Process.Start("git", "..."), exec.Command("git", "..."), or direct "git ..."
    let extractedCmd = "";
    if (trimmed.startsWith("git ")) {
      extractedCmd = trimmed;
    } else if (trimmed.includes(`exec.Command("git"`)) {
      // Go: exec.Command("git", "checkout", "-b", "branch")
      const matches = [...trimmed.matchAll(/"([^"\\]*(?:\\.[^"\\]*)*)"/g)].map((m) => m[1]);
      if (matches.length > 1) {
        const gitArgs = matches.slice(1);
        const reconstructed = gitArgs
          .map((a) => (a.includes(" ") ? `"${a}"` : a))
          .join(" ");
        extractedCmd = `git ${reconstructed}`;
      }
    } else if (trimmed.includes(`Process.Start("git"`)) {
      // C#: Process.Start("git", "commit -m \"...\"")
      const match = trimmed.match(/Process\.Start\(\s*"git"\s*,\s*"((?:[^"\\]|\\.)*)"\s*\)/);
      if (match) {
        const unescaped = match[1].replace(/\\"/g, '"');
        extractedCmd = `git ${unescaped}`;
      } else {
        const legacyMatch = trimmed.match(/"git",\s*"([^"]+)"/);
        if (legacyMatch) extractedCmd = `git ${legacyMatch[1]}`;
      }
    } else if (trimmed.includes(`"git",`)) {
      const match = trimmed.match(/"git",\s*"([^"]+)"/);
      if (match) extractedCmd = `git ${match[1]}`;
    } else if (trimmed.includes(".Checkout(") || trimmed.includes("git.Checkout(")) {
      const match = trimmed.match(/Checkout\("([^"]+)"\)/);
      if (match) extractedCmd = `git checkout ${match[1]}`;
    } else if (trimmed.includes(".CreateBranch(") || trimmed.includes("CreateBranch(")) {
      const match = trimmed.match(/CreateBranch\("([^"]+)"\)/);
      if (match) extractedCmd = `git branch ${match[1]}`;
    } else if (trimmed.includes(".Commit(") || trimmed.includes("Commit(")) {
      const match = trimmed.match(/Commit\("([^"]+)"/);
      if (match) extractedCmd = `git commit -m "${match[1]}"`;
    } else if (trimmed.includes(".Merge(") || trimmed.includes("Merge(")) {
      const match = trimmed.match(/Merge\("([^"]+)"\)/);
      if (match) extractedCmd = `git merge ${match[1]}`;
    } else if (trimmed.includes(".Rebase(") || trimmed.includes("Rebase(")) {
      const match = trimmed.match(/Rebase\("([^"]+)"\)/);
      if (match) extractedCmd = `git rebase ${match[1]}`;
    }

    if (extractedCmd) {
      executedCommands.push(extractedCmd);
      const res = executeGitCommand(currentState, extractedCmd);
      currentState = res.newState;
      logLines.push(`> ${extractedCmd}\n${res.output}`);
      if (!res.success && res.conflictDetected) {
        logLines.push("[!] Conflict detected during script execution");
      }
    }
  }

  return {
    success: true,
    output: logLines.join("\n\n"),
    finalState: currentState,
    executedCommands,
  };
}
