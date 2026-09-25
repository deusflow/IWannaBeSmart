/**
 * @file packages/sim-engine/src/__tests__/warRoomEngine.test.ts
 * @description Unit tests for Incident War Room Simulation Engine.
 */

import { describe, it, expect } from "vitest";
import {
  INCIDENT_SCENARIOS,
  calculateIncidentTelemetry,
  generatePostMortemReport,
} from "../runtime/warRoomEngine";

describe("warRoomEngine (SRE Incident Commander Simulator)", () => {
  it("should define 5 distinct, production-grade SEV-1 incident scenarios", () => {
    expect(INCIDENT_SCENARIOS).toHaveLength(5);
    const ids = INCIDENT_SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(5);

    for (const incident of INCIDENT_SCENARIOS) {
      expect(incident.severity).toBe("SEV-1");
      expect(incident.timeLimitSec).toBeGreaterThanOrEqual(180);
      expect(incident.baseFinancialLossRatePerMin).toBeGreaterThan(10000);
      expect(incident.slackMessages.length).toBeGreaterThanOrEqual(3);
      expect(incident.affectedComponents.length).toBeGreaterThanOrEqual(2);
      expect(incident.hotfixTask.validationTests.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("should correctly compute dynamic incident telemetry during active state", () => {
    const incident = INCIDENT_SCENARIOS[0];
    const telemetry = calculateIncidentTelemetry(
      60, // 1 min elapsed
      incident.timeLimitSec,
      false, // still active
      incident.baseFinancialLossRatePerMin,
      incident.initialErrorRate,
      incident.initialLatencyMs
    );

    expect(telemetry.elapsedSec).toBe(60);
    expect(telemetry.timeRemainingSec).toBe(incident.timeLimitSec - 60);
    expect(telemetry.accumulatedFinancialLossUsd).toBe(incident.baseFinancialLossRatePerMin);
    expect(telemetry.errorRatePercent).toBeGreaterThanOrEqual(incident.initialErrorRate);
    expect(telemetry.p99LatencyMs).toBeGreaterThan(incident.initialLatencyMs);
    expect(["CRITICAL", "DEGRADED"]).toContain(telemetry.systemHealthStatus);
  });

  it("should immediately normalize telemetry when incident is resolved", () => {
    const incident = INCIDENT_SCENARIOS[0];
    const telemetry = calculateIncidentTelemetry(
      45,
      incident.timeLimitSec,
      true, // RESOLVED!
      incident.baseFinancialLossRatePerMin,
      incident.initialErrorRate,
      incident.initialLatencyMs
    );

    expect(telemetry.errorRatePercent).toBe(0.05);
    expect(telemetry.p99LatencyMs).toBe(38);
    expect(telemetry.systemHealthStatus).toBe("OPERATIONAL");
  });

  it("should fail validation on broken initial code for all 5 scenarios", () => {
    for (const incident of INCIDENT_SCENARIOS) {
      const tsResult = incident.hotfixTask.validateHotfix(
        incident.hotfixTask.initialBrokenCode.typescript,
        "typescript"
      );
      expect(tsResult.passed).toBe(false);

      const pyResult = incident.hotfixTask.validateHotfix(
        incident.hotfixTask.initialBrokenCode.python,
        "python"
      );
      expect(pyResult.passed).toBe(false);
    }
  });

  it("should pass validation on solution code for all 5 scenarios", () => {
    for (const incident of INCIDENT_SCENARIOS) {
      const tsResult = incident.hotfixTask.validateHotfix(
        incident.hotfixTask.solutionCode.typescript,
        "typescript"
      );
      expect(tsResult.passed).toBe(true);

      const pyResult = incident.hotfixTask.validateHotfix(
        incident.hotfixTask.solutionCode.python,
        "python"
      );
      expect(pyResult.passed).toBe(true);
    }
  });

  it("should generate a comprehensive executive post-mortem report", () => {
    const incident = INCIDENT_SCENARIOS[0];
    const report = generatePostMortemReport(incident, 125, true);

    expect(report).toContain(incident.title);
    expect(report).toContain("RESOLVED (SLA MET)");
    expect(report).toContain("2m 5s");
    expect(report).toContain("Root Cause Analysis (RCA)");
    expect(report).toContain("Preventative Action Items");
  });
});
