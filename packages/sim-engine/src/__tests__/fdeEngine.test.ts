/**
 * @file packages/sim-engine/src/__tests__/fdeEngine.test.ts
 * @description Comprehensive unit tests for Station 07: Field AI Deployer (FDE) engine & tasks
 */

import { describe, it, expect } from "vitest";
import {
  INITIAL_FDE_STATE,
  makeDiscoveryChoice,
  connectLegacyApi,
  configureAuthToken,
  connectAgentNode,
  configureRag,
  toggleSecurityCheck,
  submitRunbook,
} from "../runtime/fdeContext";
import { FDE_TASKS } from "../runtime/tasks-fde";

describe("Field AI Deployer Engine (Station 07)", () => {
  describe("Dialogue System & Stakeholder Alignment", () => {
    it("should initialize state with default baseline", () => {
      expect(INITIAL_FDE_STATE.clientTrustScore).toBe(40);
      expect(INITIAL_FDE_STATE.legacyApiConnected).toBe(false);
      expect(INITIAL_FDE_STATE.securityPosture).toBe("critical");
    });

    it("should update trust and record dialogue history upon making choice", () => {
      const res = makeDiscoveryChoice(
        INITIAL_FDE_STATE,
        "task-1-c1",
        true,
        15,
        "fde.dialogue.task1.reactionGood"
      );

      expect(res.newState.clientTrustScore).toBe(55);
      expect(res.newState.correctChoicesMade).toBe(1);
      expect(res.trustDelta).toBe(15);
      expect(res.xpGained).toBe(15);
    });

    it("should penalize trust when choosing incorrect stakeholder approach", () => {
      const res = makeDiscoveryChoice(
        INITIAL_FDE_STATE,
        "task-1-c2",
        false,
        15,
        "fde.dialogue.task1.reactionBad"
      );

      expect(res.newState.clientTrustScore).toBe(30);
      expect(res.trustDelta).toBe(-10);
      expect(res.xpGained).toBe(0);
    });
  });

  describe("Legacy Integration Engine", () => {
    it("should reject non-HTTPS legacy endpoint and record 401 error", () => {
      const res = connectLegacyApi(INITIAL_FDE_STATE, "http://legacy.corp.internal/api");
      expect(res.success).toBe(false);
      expect(res.output).toContain("ERROR 401");
      expect(res.newState.integrationErrors.length).toBeGreaterThan(0);
    });

    it("should successfully connect valid HTTPS legacy endpoint", () => {
      const res = connectLegacyApi(INITIAL_FDE_STATE, "https://legacy.corp.internal/api");
      expect(res.success).toBe(true);
      expect(res.newState.legacyApiConnected).toBe(true);
      expect(res.newState.integrationLogs.some((l) => l.includes("handshake: OK"))).toBe(true);
    });

    it("should validate Bearer auth token length", () => {
      const tooShort = configureAuthToken(INITIAL_FDE_STATE, "token_123");
      expect(tooShort.success).toBe(false);

      const valid = configureAuthToken(INITIAL_FDE_STATE, "bearer_sec_token_99341_enterprise");
      expect(valid.success).toBe(true);
      expect(valid.newState.authTokenConfigured).toBe(true);
    });
  });

  describe("Agent Pipeline & Enterprise RAG", () => {
    it("should connect agent nodes and validate pipeline requirements", () => {
      let state = INITIAL_FDE_STATE;
      const nodesToConnect = ["planner", "responder", "validator"];

      for (const id of nodesToConnect) {
        const res = connectAgentNode(state, id);
        state = res.newState;
      }

      expect(state.agentPipeline.isValid).toBe(true);
      expect(state.agentPipeline.validationErrors.length).toBe(0);
    });

    it("should fail pipeline validation if required nodes are missing", () => {
      const res = connectAgentNode(INITIAL_FDE_STATE, "planner");
      expect(res.newState.agentPipeline.isValid).toBe(false);
      expect(res.newState.agentPipeline.validationErrors).toContain("Responder node is required");
    });

    it("should configure enterprise RAG with valid chunk size and HTTPS vector DB", () => {
      const invalid = configureRag(INITIAL_FDE_STATE, 50, "https://qdrant.internal");
      expect(invalid.success).toBe(false);
      expect(invalid.output).toContain("Chunk size");

      const valid = configureRag(INITIAL_FDE_STATE, 512, "https://qdrant.internal");
      expect(valid.success).toBe(true);
      expect(valid.newState.ragConfigured).toBe(true);
      expect(valid.newState.vectorDbConnected).toBe(true);
    });
  });

  describe("Security Posture & Runbook Handoff", () => {
    it("should advance security posture from critical to moderate/hardened", () => {
      let state = INITIAL_FDE_STATE;
      const checkIds = [
        "iam-least-privilege",
        "prompt-injection",
        "data-residency",
        "pii-masking",
        "audit-logging",
      ];

      for (const id of checkIds) {
        state = toggleSecurityCheck(state, id).newState;
      }

      expect(state.promptInjectionDefended).toBe(true);
      expect(state.securityPosture).toBe("hardened");
    });

    it("should evaluate comprehensive markdown runbook and approve handoff", () => {
      const comprehensiveRunbook = `
# Enterprise AI System Production Runbook and Architecture Operations

## Architecture Overview
The pipeline consists of a multi-agent system wired through Vertex AI and legacy ERP connectors.
Data flow travels through encrypted VPC Peering channels with strict RBAC access policies.

## Incident Operations Runbook
1. Check gateway status: curl https://agent.corp/health
2. Inspect connection pool saturation in Grafana
3. If error rates spike above 5%, trigger rolling restart: kubectl rollout restart deploy/agent
4. Fall back to cached replica if timeout persists.

## Troubleshooting Guide
- Error 401: Verify rotated secret in HashiCorp Vault.
- Error 503: Check network latency on legacy database link.
- Hallucination spike: Increase temperature down to 0.1 and check RAG retrieval relevance.
      `.repeat(3); // Ensure word count >= 200

      const res = submitRunbook(
        { ...INITIAL_FDE_STATE, securityPosture: "hardened" },
        comprehensiveRunbook
      );

      expect(res.success).toBe(true);
      expect(res.score).toBeGreaterThanOrEqual(70);
      expect(res.newState.runbookWritten).toBe(true);
      expect(res.newState.handoffComplete).toBe(true);
    });
  });

  describe("Curriculum Tasks Validation (15 Tasks)", () => {
    it("should have 15 structured tasks across 5 rounds", () => {
      expect(FDE_TASKS.length).toBe(15);
      const rounds = new Set(FDE_TASKS.map((t) => t.round));
      expect(rounds.size).toBe(5);
    });

    it("task-fde-1: should validate initial meeting dialogue", () => {
      const task = FDE_TASKS[0];
      const before = INITIAL_FDE_STATE;
      const goodChoice = makeDiscoveryChoice(before, "choice-1", true, 30, "fde.dialogue.task1.consequence1b");
      const validation = task.validate(before, goodChoice.newState, goodChoice);
      expect(validation.passed).toBe(true);
    });

    it("task-fde-4: should validate legacy API connection", () => {
      const task = FDE_TASKS[3];
      const before = INITIAL_FDE_STATE;
      const valid = connectLegacyApi(before, "https://legacy-erp.internal/api/v1/invoices/9821");
      const validation = task.validate(before, valid.newState, valid);
      expect(validation.passed).toBe(true);
    });

    it("task-fde-8: should validate RAG configuration", () => {
      const task = FDE_TASKS[7];
      const before = INITIAL_FDE_STATE;
      const valid = configureRag(before, 512, "https://vectordb.internal:6333");
      const validation = task.validate(before, valid.newState, valid);
      expect(validation.passed).toBe(true);
    });

    it("task-fde-10: should validate prompt injection defense", () => {
      const task = FDE_TASKS[9];
      const before = INITIAL_FDE_STATE;
      const res = toggleSecurityCheck(before, "prompt-injection");
      const validation = task.validate(before, res.newState, res);
      expect(validation.passed).toBe(true);
    });
  });
});
