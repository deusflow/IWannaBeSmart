/**
 * @file apps/web/src/store/__tests__/workbenchStore.test.ts
 * @description Unit tests for decomposed WorkbenchStore slices
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useWorkbenchStore } from "../workbenchStore";

// Helper accessor to always inspect the fresh Zustand state
const getStore = () => useWorkbenchStore.getState();

describe("WorkbenchStore Slices", () => {
  beforeEach(() => {
    // Reset store to nominal state before each test
    const store = getStore();
    store.resetCircuit();
    store.resetBypasses();
    store.resetPosState();
    if (store.power) {
      store.togglePower();
    }
  });

  describe("tvSlice (FSM Guards & TV Controls)", () => {
    it("should start in unpowered standby state", () => {
      const state = getStore();
      expect(state.power).toBe(false);
      expect(state.channel).toBe(1);
      expect(state.volume).toBe(45);
      expect(state.osdMessage).toContain("очікування");
    });

    it("should block channel and volume modifications when power is OFF", () => {
      getStore().nextChannel();
      expect(getStore().channel).toBe(1);

      getStore().changeVolume(10);
      expect(getStore().volume).toBe(45);
    });

    it("should allow volume and channel navigation when power is ON", () => {
      getStore().togglePower(); // Turn on
      expect(getStore().power).toBe(true);

      getStore().nextChannel();
      expect(getStore().channel).toBe(2);

      getStore().changeVolume(10);
      expect(getStore().volume).toBe(55);

      getStore().toggleMute();
      expect(getStore().isMuted).toBe(true);

      getStore().toggleMute();
      expect(getStore().isMuted).toBe(false);
    });
  });

  describe("circuitSlice (Hardware Fault Injection)", () => {
    it("should toggle circuit edge fault states", () => {
      expect(getStore().isEdgeBroken("edge-psu-mcu")).toBe(false);

      getStore().toggleCircuitEdge("edge-psu-mcu");
      expect(getStore().isEdgeBroken("edge-psu-mcu")).toBe(true);

      getStore().toggleCircuitEdge("edge-psu-mcu");
      expect(getStore().isEdgeBroken("edge-psu-mcu")).toBe(false);
    });

    it("should prevent TV power on when PSU -> MCU trace is broken", () => {
      getStore().toggleCircuitEdge("edge-psu-mcu");

      getStore().togglePower();
      expect(getStore().power).toBe(false);
      expect(getStore().osdMessage).toContain("Помилка живлення");
    });
  });

  describe("architectureSlice (Blueprint Graph & Counterfactual Bypasses)", () => {
    it("should handle bypass toggling and set isTraceBroken", () => {
      expect(getStore().isTraceBroken).toBe(false);
      expect(getStore().bypassedTraceNodes).toHaveLength(0);

      getStore().toggleTraceBypass("node-trace-di-reg");
      expect(getStore().bypassedTraceNodes).toContain("node-trace-di-reg");
      expect(getStore().isTraceBroken).toBe(true);

      getStore().resetBypasses();
      expect(getStore().isTraceBroken).toBe(false);
      expect(getStore().bypassedTraceNodes).toHaveLength(0);
    });
  });

  describe("calculatorSlice (Embedded Math Engine)", () => {
    it("should evaluate basic addition operations", () => {
      getStore().calcClear();
      getStore().calcInputDigit(7);
      getStore().calcSetOperation("+");
      getStore().calcInputDigit(8);
      getStore().calcEvaluate();

      expect(getStore().calcDisplay).toBe("15");
    });

    it("should evaluate subtraction and reset display on clear", () => {
      getStore().calcClear();
      getStore().calcInputDigit(9);
      getStore().calcSetOperation("-");
      getStore().calcInputDigit(4);
      getStore().calcEvaluate();

      expect(getStore().calcDisplay).toBe("5");

      getStore().calcClear();
      expect(getStore().calcDisplay).toBe("0");
    });
  });

  describe("posSlice (Fintech Terminal Keypad)", () => {
    it("should accept PIN input and approve valid PIN 1234 when balance >= amount", () => {
      getStore().resetPosState({ balance: 500, transactionAmount: 100 });
      getStore().posKeypadInput("1");
      getStore().posKeypadInput("2");
      getStore().posKeypadInput("3");
      getStore().posKeypadInput("4");
      getStore().posKeypadInput("ENTR");

      expect(getStore().posState.status).toBe("APPROVED");
    });

    it("should decline transaction when balance < amount", () => {
      getStore().resetPosState({ balance: 50, transactionAmount: 100 });
      getStore().posKeypadInput("1");
      getStore().posKeypadInput("2");
      getStore().posKeypadInput("3");
      getStore().posKeypadInput("4");
      getStore().posKeypadInput("ENTR");

      expect(getStore().posState.status).toBe("DECLINED");
    });

    it("should lock terminal after 3 consecutive wrong PIN entries", () => {
      getStore().resetPosState();

      for (let i = 0; i < 3; i++) {
        getStore().posKeypadInput("9");
        getStore().posKeypadInput("9");
        getStore().posKeypadInput("9");
        getStore().posKeypadInput("9");
        getStore().posKeypadInput("ENTR");
      }

      expect(getStore().posState.status).toBe("BLOCKED");
      expect(getStore().posState.isLocked).toBe(true);
      expect(getStore().posState.failedAttempts).toBe(3);
    });
  });

  describe("mentorSlice (Progress & Star Mastery)", () => {
    it("should increment XP and track task mastery stars", () => {
      const initialXp = getStore().xp;
      getStore().addXp(50);
      expect(getStore().xp).toBe(initialXp + 50);

      getStore().setTaskMastery("task-0-1-power-on", 3);
      expect(getStore().getTaskMastery("task-0-1-power-on")).toBe(3);
    });
  });

  describe("apiForgeSlice (Station 04: Client & Server Simulation)", () => {
    it("should initialize with default /health draft request", () => {
      expect(getStore().clientDraftMethod).toBe("GET");
      expect(getStore().clientDraftPath).toBe("/health");
      expect(getStore().apiState.isCableBroken).toBe(false);
    });

    it("should update draft method, path, and body", () => {
      getStore().setClientDraftMethod("POST");
      getStore().setClientDraftPath("/api/orders");
      getStore().setClientDraftBody(JSON.stringify({ item: "Widget", quantity: 5 }));

      expect(getStore().clientDraftMethod).toBe("POST");
      expect(getStore().clientDraftPath).toBe("/api/orders");
      expect(getStore().clientDraftBody).toContain("Widget");
    });

    it("should dispatch client request and receive 200 OK from server", async () => {
      getStore().resetApiState();
      getStore().setClientDraftMethod("GET");
      getStore().setClientDraftPath("/health");

      const res = await getStore().sendClientRequest();
      expect(res.statusCode).toBe(200);
      expect(getStore().lastApiResponse?.statusCode).toBe(200);
      expect(getStore().apiState.logs.length).toBeGreaterThan(0);
    });

    it("should toggle network cable and receive 504 Gateway Timeout", async () => {
      getStore().resetApiState();
      getStore().toggleNetworkCable();
      expect(getStore().apiState.isCableBroken).toBe(true);

      const res = await getStore().sendClientRequest();
      expect(res.statusCode).toBe(504);
      expect(getStore().lastApiResponse?.statusCode).toBe(504);
    });
  });
});
