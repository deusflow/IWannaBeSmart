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

    it("should support station navigation and victory modal state for API station", () => {
      getStore().setCurrentStationId("api");
      expect(getStore().currentStationId).toBe("api");

      getStore().setApiVictoryModalOpen(true);
      expect(getStore().isApiVictoryModalOpen).toBe(true);

      getStore().setApiVictoryModalOpen(false);
      expect(getStore().isApiVictoryModalOpen).toBe(false);
    });

    it("should enforce 401 Unauthorized for secure route without token, and 200 OK with Bearer token", async () => {
      getStore().resetApiState();
      getStore().setClientDraftMethod("GET");
      getStore().setClientDraftPath("/api/secure/stats");
      getStore().setClientDraftHeaders({});

      const unauthorizedRes = await getStore().sendClientRequest();
      expect(unauthorizedRes.statusCode).toBe(401);

      getStore().setClientDraftHeaders({
        Authorization: "Bearer forge-token-secure-99",
      });
      const authorizedRes = await getStore().sendClientRequest();
      expect(authorizedRes.statusCode).toBe(200);
    });

    it("should return 201 Created for valid POST /api/orders and 400 Bad Request for invalid body", async () => {
      getStore().resetApiState();
      getStore().setClientDraftMethod("POST");
      getStore().setClientDraftPath("/api/orders");
      getStore().setClientDraftBody(JSON.stringify({ item: "QuantumCore", quantity: 2 }));

      const successRes = await getStore().sendClientRequest();
      expect(successRes.statusCode).toBe(201);

      getStore().setClientDraftBody(JSON.stringify({ item: "", quantity: 0 }));
      const badRes = await getStore().sendClientRequest();
      expect(badRes.statusCode).toBe(400);
    });

    it("should return 200 OK for known device and 404 Not Found for unknown device", async () => {
      getStore().resetApiState();
      getStore().setClientDraftMethod("GET");
      getStore().setClientDraftPath("/api/devices/42");

      const foundRes = await getStore().sendClientRequest();
      expect(foundRes.statusCode).toBe(200);

      getStore().setClientDraftPath("/api/devices/nonexistent-device-999");
      const notFoundRes = await getStore().sendClientRequest();
      expect(notFoundRes.statusCode).toBe(404);
    });
  });

  describe("gitSlice (Station 05: Git Time Machine)", () => {
    it("should execute git commit from CLI and advance main pointer", () => {
      getStore().resetGitRepo();
      const res = getStore().runGitCommand('git commit -m "feat: add telemetry transmitter"');

      expect(res.success).toBe(true);
      expect(res.createdCommitId).toBe("c2");
      expect(getStore().gitRepoState.branches["main"]).toBe("c2");
      expect(getStore().gitTerminalLogs.some((l) => l.includes("telemetry transmitter"))).toBe(true);
    });

    it("should switch branches and commit independently", () => {
      getStore().resetGitRepo();
      getStore().runGitCommand("git checkout -b feature/radar");
      expect(getStore().gitRepoState.head.target).toBe("feature/radar");

      getStore().runGitCommand('git commit -m "feat: radar sweep"');
      expect(getStore().gitRepoState.branches["feature/radar"]).toBe("c2");
      expect(getStore().gitRepoState.branches["main"]).toBe("c1");
    });

    it("should handle merge conflicts and resolve them with strategy", () => {
      getStore().resetGitRepo();
      getStore().gitRepoState.workingTree["config.ini"] = "port=8080";
      getStore().runGitCommand('git commit -m "c2: port 8080"');

      getStore().runGitCommand("git checkout -b dev c1");
      getStore().gitRepoState.workingTree["config.ini"] = "port=9090";
      getStore().runGitCommand('git commit -m "c3: port 9090"');

      getStore().runGitCommand("git checkout main");
      const mergeRes = getStore().runGitCommand("git merge dev");

      expect(mergeRes.conflictDetected).toBe(true);
      expect(getStore().gitRepoState.conflictState).toBeDefined();

      getStore().resolveActiveConflict("theirs");
      expect(getStore().gitRepoState.workingTree["config.ini"]).toBe("port=9090");

      const finishMerge = getStore().runGitCommand('git commit -m "resolve conflict"');
      expect(finishMerge.success).toBe(true);
      expect(getStore().gitRepoState.conflictState).toBeNull();
    });

    it("should open and close Git Victory Modal", () => {
      getStore().setGitVictoryModalOpen(true);
      expect(getStore().isGitVictoryModalOpen).toBe(true);
      getStore().setGitVictoryModalOpen(false);
      expect(getStore().isGitVictoryModalOpen).toBe(false);
    });
  });

  describe("banditSlice (Station 06: Cyber Bandit Lab)", () => {
    it("should execute UNIX commands via bandit terminal and capture flags", () => {
      getStore().resetBanditStationToLevel(1);
      const lsRes = getStore().runBanditCommand("ls -la");
      expect(lsRes.output).toContain(".secret_pass");

      const catRes = getStore().runBanditCommand("cat .secret_pass");
      expect(catRes.output).toContain("bandit{");

      const submitRes = getStore().submitFlagDirect(catRes.output);
      expect(submitRes).toBe(true);
      expect(getStore().banditState.capturedFlags[1]).toBe(catRes.output);
    });

    it("should tamper transit packets and verify HMAC protection", () => {
      getStore().resetBanditStationToLevel(3);

      // Tamper without HMAC -> breach
      getStore().setTamperJson(JSON.stringify({ price: 1 }));
      const forwardRes = getStore().forwardTransitPacketAction();
      expect(forwardRes.responseStatus).toBe(200);

      // Now enable HMAC -> blocked with 403
      getStore().resetBanditStationToLevel(3);
      getStore().toggleBanditDefenseAction("hmacActive");
      expect(getStore().banditState.defenseState.hmacActive).toBe(true);

      getStore().setTamperJson(JSON.stringify({ price: 1 }));
      const blockedRes = getStore().forwardTransitPacketAction();
      expect(blockedRes.responseStatus).toBe(403);
      expect(blockedRes.message).toContain("HMAC signature mismatch");
    });

    it("should test SQL injection and defense toggling", () => {
      getStore().resetBanditStationToLevel(4);

      // Injection without parameterization
      const exploitRes = getStore().runSqlQueryAction("' OR 1=1 --");
      expect(exploitRes.vulnerabilityExploited).toBe(true);
      expect(exploitRes.returnedUsers.length).toBeGreaterThan(1);

      // Enable parameterized queries
      getStore().toggleBanditDefenseAction("sqlParametrized");
      const safeRes = getStore().runSqlQueryAction("' OR 1=1 --");
      expect(safeRes.vulnerabilityExploited).toBe(false);
      expect(safeRes.returnedUsers.length).toBe(0);
    });

    it("should simulate rate limiter token exhaustion", () => {
      getStore().resetBanditStationToLevel(5);
      getStore().toggleBanditDefenseAction("rateLimitActive");

      for (let i = 0; i < 5; i++) {
        const res = getStore().simulateRateLimitAction();
        expect(res.statusCode).toBe(200);
      }

      // 6th request triggers 429
      const throttled = getStore().simulateRateLimitAction();
      expect(throttled.statusCode).toBe(429);
      expect(throttled.message).toContain("429 Too Many Requests");
    });

    it("should toggle Bandit Victory Modal", () => {
      getStore().setBanditVictoryModalOpen(true);
      expect(getStore().isBanditVictoryModalOpen).toBe(true);
      getStore().setBanditVictoryModalOpen(false);
      expect(getStore().isBanditVictoryModalOpen).toBe(false);
    });
  });
});
