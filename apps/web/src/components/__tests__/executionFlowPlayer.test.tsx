import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getStationTrace,
  SMART_TV_EXECUTION_TRACE,
  API_FORGE_EXECUTION_TRACE,
  POS_EXECUTION_TRACE,
  GIT_EXECUTION_TRACE,
  BANDIT_EXECUTION_TRACE,
  RAG_EXECUTION_TRACE,
  CYBER_EXECUTION_TRACE,
  TracePlaybackController,
} from "@iw/sim-engine";
import {
  getStationProjectFiles,
  flattenProjectFiles,
} from "../workbench/playground/stationProjectData";

describe("Execution Flow Visualizer & POE Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Station Traces Data Integrity Across All 5 Stations", () => {
    it("returns authentic Smart TV execution trace with valid steps and POE", () => {
      const trace = getStationTrace("tv");
      expect(trace.id).toBe("trace-smart-tv-power-flow");
      expect(trace.stationId).toBe("tv");
      expect(trace.language).toBe("csharp");
      expect(trace.totalSteps).toBe(7);
      expect(trace.steps.length).toBe(7);

      // Verify Step 0 POE checkpoint
      const step0 = trace.steps[0];
      expect(step0.location.fileName).toBe("Program.cs");
      expect(step0.poeQuestion).toBeDefined();
      expect(step0.poeQuestion?.options.length).toBe(3);

      const correctOption = step0.poeQuestion?.options.find((o) => o.isCorrect);
      expect(correctOption?.id).toBe("opt-command");
      expect(correctOption?.targetFileId).toBe("power-command-cs");
    });

    it("returns authentic API Forge order pipeline trace with async await and return unwinding", () => {
      const trace = getStationTrace("api");
      expect(trace.id).toBe(API_FORGE_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("api");
      expect(trace.totalSteps).toBe(7);

      // Verify return unwind steps
      const returnStep = trace.steps.find((s) => s.type === "return_unwind");
      expect(returnStep).toBeDefined();
      expect(returnStep?.returnValue).toBeDefined();
      expect(returnStep?.returnValue?.terminationReason).toBeDefined();
    });

    it("returns authentic POS transaction trace with ledger invariant checks", () => {
      const trace = getStationTrace("pos");
      expect(trace.id).toBe(POS_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("pos");
      expect(trace.totalSteps).toBe(5);

      const step0 = trace.steps[0];
      expect(step0.poeQuestion).toBeDefined();
      const correctOption = step0.poeQuestion?.options.find((o) => o.isCorrect);
      expect(correctOption?.targetFileId).toBe("account-ledger-cs");
    });

    it("returns authentic Git commit trace with DAG blob hashing and ref update", () => {
      const trace = getStationTrace("git");
      expect(trace.id).toBe(GIT_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("git");
      expect(trace.language).toBe("go");
      expect(trace.totalSteps).toBe(5);

      const step0 = trace.steps[0];
      expect(step0.location.fileName).toBe("main.go");
      expect(step0.poeQuestion).toBeDefined();
    });

    it("returns authentic Bandit security filter trace with SQL injection interception", () => {
      const trace = getStationTrace("bandit");
      expect(trace.id).toBe(BANDIT_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("bandit");
      expect(trace.totalSteps).toBe(5);

      const step0 = trace.steps[0];
      expect(step0.poeQuestion).toBeDefined();
      const correctOption = step0.poeQuestion?.options.find((o) => o.isCorrect);
      expect(correctOption?.targetFileId).toBe("security-filter-cs");
    });

    it("returns authentic RAG neural retrieval trace with vector search and ReAct loop", () => {
      const trace = getStationTrace("rag");
      expect(trace.id).toBe(RAG_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("rag");
      expect(trace.language).toBe("python");
      expect(trace.totalSteps).toBe(5);

      const step0 = trace.steps[0];
      expect(step0.location.fileName).toBe("document_chunker.py");
      expect(step0.poeQuestion).toBeDefined();
      const correctOption = step0.poeQuestion?.options.find((o) => o.isCorrect);
      expect(correctOption?.targetFileId).toBe("rag-chunker");
    });

    it("returns authentic Cyber SOC defense trace with Wireshark dissection and iptables drop", () => {
      const trace = getStationTrace("cyber");
      expect(trace.id).toBe(CYBER_EXECUTION_TRACE.id);
      expect(trace.stationId).toBe("cyber");
      expect(trace.language).toBe("python");
      expect(trace.totalSteps).toBe(5);

      const step0 = trace.steps[0];
      expect(step0.location.fileName).toBe("syslog_parser.py");
      expect(step0.poeQuestion).toBeDefined();
      const correctOption = step0.poeQuestion?.options.find((o) => o.isCorrect);
      expect(correctOption?.targetFileId).toBe("cyber-syslog");
    });
  });

  describe("Trace Controller, POE Gates & Breadcrumb History", () => {
    it("generates anti-transient breadcrumb history matching call stack depth and folders", () => {
      const controller = new TracePlaybackController({
        timeline: SMART_TV_EXECUTION_TRACE,
        enablePoe: false, // Scrubber mode
      });

      // Jump to step 3 (Hardware driver call)
      controller.seekTo(3);
      const history = controller.getBreadcrumbHistory();
      expect(history.length).toBe(4);
      expect(history[0].file).toBe("Program.cs");
      expect(history[1].file).toBe("PowerCommand.cs");
      expect(history[1].folder).toBe("Commands");
      expect(history[3].file).toBe("TvRelayDriver.cs");
      expect(history[3].folder).toBe("Hardware");
      expect(history[3].depth).toBe(3);
      expect(history[3].isReturn).toBe(false);

      // Advance to step 4 (Return unwind)
      controller.stepForward();
      const returnHistory = controller.getBreadcrumbHistory();
      expect(returnHistory[4].isReturn).toBe(true);
    });

    it("evaluates POE answers accurately and updates score metrics", () => {
      const controller = new TracePlaybackController({
        timeline: SMART_TV_EXECUTION_TRACE,
        enablePoe: true,
      });

      expect(controller.getState().isWaitingForPoe).toBe(true);

      // Incorrect option
      const wrong = controller.answerPoe("opt-hardware");
      expect(wrong?.isCorrect).toBe(false);
      expect(controller.getState().poeScore.correct).toBe(0);
      expect(controller.getState().poeScore.total).toBe(1);

      // Correct option
      const correct = controller.answerPoe("opt-command");
      expect(correct?.isCorrect).toBe(true);
      expect(controller.getState().poeScore.correct).toBe(1);
      expect(controller.getState().poeScore.total).toBe(2);
      expect(controller.getState().isWaitingForPoe).toBe(false);
    });

    it("preserves playback step index when toggling POE mode", () => {
      const controller = new TracePlaybackController({
        timeline: SMART_TV_EXECUTION_TRACE,
        enablePoe: false,
      });

      // Advance to step 2 in scrubber mode
      controller.seekTo(2);
      expect(controller.getState().currentStepIndex).toBe(2);

      // Turn POE back on
      controller.setEnablePoe(true);
      expect(controller.getState().currentStepIndex).toBe(2);

      // Turn POE off again
      controller.setEnablePoe(false);
      expect(controller.getState().currentStepIndex).toBe(2);
    });
  });

  describe("Project Solution Files Alignment & flattenProjectFiles", () => {
    it("ensures station project files contain execution trace target files across all stations", () => {
      const stations = ["tv", "api", "pos", "git", "bandit", "vertex", "fde", "rag", "cyber"] as const;

      for (const st of stations) {
        const trace = getStationTrace(st);
        const files = getStationProjectFiles(st, false, trace.language, "");
        const rootFolder = files[0];
        expect(rootFolder).toBeDefined();

        const flatFiles = flattenProjectFiles(rootFolder?.children || []);
        expect(flatFiles.length).toBeGreaterThan(1);
        for (const step of trace.steps) {
          if (step.poeQuestion) {
            for (const opt of step.poeQuestion.options) {
              if (opt.targetFileId) {
                const found = flatFiles.some(
                  (f) =>
                    f.id === opt.targetFileId ||
                    f.id.toLowerCase().includes(opt.targetFileId?.toLowerCase() || "")
                );
                expect(
                  found,
                  `Station ${st}: target file ${opt.targetFileId} should exist in project explorer files`
                ).toBe(true);
              }
            }
          }
        }
      }
    });

    it("recursively flattens nested folder trees without losing leaf files", () => {
      const tvFiles = getStationProjectFiles("tv", false, "csharp", "");
      const flat = flattenProjectFiles(tvFiles[0]?.children || []);

      const fileIds = flat.map((f) => f.id);
      expect(fileIds).toContain("csproj");
      expect(fileIds).toContain("program-cs");
      expect(fileIds).toContain("power-command-cs");
      expect(fileIds).toContain("tv-hardware-driver");
      expect(fileIds).toContain("tv-relay-driver-cs");
    });
  });
});
