import { describe, it, expect, beforeEach } from "vitest";
import { TracePlaybackController } from "../traceEngine";
import { SMART_TV_EXECUTION_TRACE, API_FORGE_EXECUTION_TRACE } from "../stationTraces";

describe("TracePlaybackController (Execution Flow & POE Engine)", () => {
  let controller: TracePlaybackController;

  beforeEach(() => {
    controller = new TracePlaybackController({
      timeline: SMART_TV_EXECUTION_TRACE,
      enablePoe: true,
    });
  });

  it("should initialize at step 0 and enforce POE checkpoint before jumping", () => {
    const state = controller.getState();
    expect(state.currentStepIndex).toBe(0);
    expect(state.isWaitingForPoe).toBe(true);

    const step = controller.getCurrentStep();
    expect(step?.location.fileName).toBe("Program.cs");
    expect(step?.poeQuestion).toBeDefined();

    // Advancing should be blocked by POE gate
    const advanced = controller.stepForward();
    expect(advanced).toBe(false);
    expect(controller.getState().currentStepIndex).toBe(0);
  });

  it("should handle incorrect and correct POE answers properly", () => {
    // Answer incorrectly
    const wrongResult = controller.answerPoe("opt-hardware");
    expect(wrongResult?.isCorrect).toBe(false);

    let state = controller.getState();
    expect(state.isWaitingForPoe).toBe(true);
    expect(state.poeScore.correct).toBe(0);
    expect(state.poeScore.total).toBe(1);

    // Still cannot advance
    expect(controller.stepForward()).toBe(false);

    // Answer correctly
    const correctResult = controller.answerPoe("opt-command");
    expect(correctResult?.isCorrect).toBe(true);

    state = controller.getState();
    expect(state.isWaitingForPoe).toBe(false);
    expect(state.poeScore.correct).toBe(1);
    expect(state.poeScore.total).toBe(2);

    // Now advancing succeeds
    const advanced = controller.stepForward();
    expect(advanced).toBe(true);
    expect(controller.getState().currentStepIndex).toBe(1);
  });

  it("should track LIFO Call Stack depth and locations across multi-file transitions", () => {
    // Bypass POE on step 0
    controller.answerPoe("opt-command");

    // Step 0 -> Step 1 (Commands/PowerCommand.cs)
    controller.stepForward();
    let step = controller.getCurrentStep();
    expect(step?.location.fileName).toBe("PowerCommand.cs");
    expect(step?.callStackDepth).toBe(2);
    expect(step?.callStack).toEqual(["Program.Main()", "PowerCommand.Execute()"]);

    // Step 1 -> Step 2 (branch evaluation)
    controller.stepForward();
    step = controller.getCurrentStep();
    expect(step?.type).toBe("branch_eval");

    // Step 2 -> Step 3 (Hardware/TvRelayDriver.cs call)
    controller.stepForward();
    step = controller.getCurrentStep();
    expect(step?.location.fileName).toBe("TvRelayDriver.cs");
    expect(step?.callStackDepth).toBe(3);
    expect(step?.callStack).toContain("TvRelayDriver.CloseRelayContact()");

    // Step 3 -> Step 4 (return unwind from driver)
    controller.stepForward();
    step = controller.getCurrentStep();
    expect(step?.type).toBe("return_unwind");
    expect(step?.returnValue).toBeDefined();
    expect(step?.returnValue?.value).toBe("true");
    expect(step?.returnValue?.terminationReason).toBeDefined();
  });

  it("should support time-travel seek and breadcrumb history tracking", () => {
    // Disable POE for pure scrubber test
    controller.setEnablePoe(false);

    controller.seekTo(4);
    expect(controller.getState().currentStepIndex).toBe(4);

    const breadcrumbs = controller.getBreadcrumbHistory();
    expect(breadcrumbs.length).toBe(5); // steps 0, 1, 2, 3, 4
    expect(breadcrumbs[0].file).toBe("Program.cs");
    expect(breadcrumbs[4].isReturn).toBe(true);

    // Step backward
    controller.stepBackward();
    expect(controller.getState().currentStepIndex).toBe(3);
  });

  it("should switch timeline cleanly and reset state", () => {
    controller.setTimeline(API_FORGE_EXECUTION_TRACE);
    expect(controller.getTimeline().stationId).toBe("api");
    expect(controller.getState().currentStepIndex).toBe(0);
    expect(controller.getCurrentStep()?.location.fileName).toBe("OrdersController.cs");
  });

  it("should dynamically toggle POE mode and re-evaluate pending POE question", () => {
    // Initially at step 0 with POE enabled
    expect(controller.getState().isWaitingForPoe).toBe(true);

    // Disable POE
    controller.setEnablePoe(false);
    expect(controller.getState().isWaitingForPoe).toBe(false);

    // Re-enable POE on the unanswered step
    controller.setEnablePoe(true);
    expect(controller.getState().isWaitingForPoe).toBe(true);

    // Breadcrumbs should record folder information
    const crumbs = controller.getBreadcrumbHistory();
    expect(crumbs[0].folder).toBe("VirtualTV.Solution");
  });

  it("should fire onComplete callback when reaching the end of the timeline", () => {
    let completed = false;
    const testController = new TracePlaybackController({
      timeline: SMART_TV_EXECUTION_TRACE,
      enablePoe: false,
      onComplete: () => {
        completed = true;
      },
    });

    // Advance to the end
    for (let i = 0; i < SMART_TV_EXECUTION_TRACE.totalSteps; i++) {
      testController.stepForward();
    }

    expect(completed).toBe(true);
  });

  it("should correctly handle exception unwinding steps and fault reasons", () => {
    const banditTrace = API_FORGE_EXECUTION_TRACE;
    const testController = new TracePlaybackController({
      timeline: banditTrace,
      enablePoe: false,
    });

    // Step to return_unwind step
    const returnStepIndex = banditTrace.steps.findIndex((s) => s.type === "return_unwind");
    expect(returnStepIndex).toBeGreaterThan(0);

    testController.seekTo(returnStepIndex);
    const currentStep = testController.getCurrentStep();
    expect(currentStep?.type).toBe("return_unwind");
    expect(currentStep?.returnValue).toBeDefined();
    expect(currentStep?.returnValue?.type).toBeDefined();
    expect(currentStep?.returnValue?.terminationReason).toBeDefined();
  });
});
