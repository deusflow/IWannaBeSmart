/**
 * @file apps/web/src/components/__tests__/careerQualificationAndDeepDive.test.ts
 * @description Comprehensive validation of:
 * 1. Career Qualification Ladder (L1–L4) graduation invariants and War Room gating.
 * 2. Deep Dive Curated Primary Sources integrity across all stations.
 * 3. High-DPI Certificate SVG generation with automated and explicit career qualifications.
 */

import { describe, it, expect } from "vitest";
import { CODING_TASKS } from "@iw/sim-engine";
import {
  calculateCareerRank,
  countCompletedStations,
} from "../../utils/careerRank";
import { TASK_DIDACTIC_MAP } from "../workbench/playground/taskDidacticContext";
import { generateCertificateSvg } from "../../utils/certificateSvg";

describe("Career Qualification Ladder (L1–L4)", () => {
  it("starts new cadets at L1 (Code Apprentice) with 0 XP and 0 stations", () => {
    const rank = calculateCareerRank(0, 0, 0);
    expect(rank.grade).toBe("L1");
    expect(rank.tier).toBe(1);
    expect(rank.codeName).toBe("Code Apprentice");
    expect(rank.nextGrade).toBe("L2");
    expect(rank.nextRequirements).toEqual({ minXp: 100, minStations: 2, minWarRoom: 0 });
    expect(rank.progressPercent).toBe(0);
    expect(rank.requirementsMet.xp).toBe(false);
    expect(rank.requirementsMet.stations).toBe(false);
    expect(rank.remainingToNext.xp).toBe(100);
    expect(rank.remainingToNext.stations).toBe(2);
  });

  it("calculates partial progress within L1 bracket", () => {
    const rank = calculateCareerRank(50, 1, 0);
    expect(rank.grade).toBe("L1");
    // 50/100 = 0.5, 1/2 = 0.5 -> average 50%
    expect(rank.progressPercent).toBe(50);
    expect(rank.remainingToNext.xp).toBe(50);
    expect(rank.remainingToNext.stations).toBe(1);
  });

  it("promotes to L2 (Junior Implementer) upon meeting 100 XP and 2 completed stations", () => {
    const rank = calculateCareerRank(100, 2, 0);
    expect(rank.grade).toBe("L2");
    expect(rank.tier).toBe(2);
    expect(rank.codeName).toBe("Junior Implementer");
    expect(rank.nextGrade).toBe("L3");
    expect(rank.nextRequirements).toEqual({ minXp: 350, minStations: 4, minWarRoom: 0 });
    expect(rank.progressPercent).toBe(0);
  });

  it("promotes to L3 (Systems Specialist) upon meeting 350 XP and 4 completed stations", () => {
    const rank = calculateCareerRank(350, 4, 0);
    expect(rank.grade).toBe("L3");
    expect(rank.tier).toBe(3);
    expect(rank.codeName).toBe("Systems Specialist");
    expect(rank.nextGrade).toBe("L4");
    expect(rank.nextRequirements).toEqual({ minXp: 700, minStations: 7, minWarRoom: 1 });
    expect(rank.requirementsMet.warRoom).toBe(false);
  });

  it("STRICT GATING: keeps engineer at L3 if War Room SEV-1 incident is not resolved, even with 800 XP and 8 stations", () => {
    const rank = calculateCareerRank(800, 8, 0);
    expect(rank.grade).toBe("L3");
    expect(rank.requirementsMet.xp).toBe(true);
    expect(rank.requirementsMet.stations).toBe(true);
    expect(rank.requirementsMet.warRoom).toBe(false);
    expect(rank.remainingToNext.warRoom).toBe(1);
  });

  it("promotes to L4 (Solutions Architect) when XP >= 700, stations >= 7, AND at least 1 War Room incident resolved", () => {
    const rank = calculateCareerRank(700, 7, 1);
    expect(rank.grade).toBe("L4");
    expect(rank.tier).toBe(4);
    expect(rank.codeName).toBe("Solutions Architect");
    expect(rank.nextGrade).toBeNull();
    expect(rank.nextRequirements).toBeNull();
    expect(rank.progressPercent).toBe(100);
    expect(rank.requirementsMet).toEqual({ xp: true, stations: true, warRoom: true });
    expect(rank.remainingToNext).toEqual({ xp: 0, stations: 0, warRoom: 0 });
  });

  it("accurately counts completed stations using countCompletedStations", () => {
    // Empty progress
    expect(countCompletedStations({}, {})).toBe(0);

    // Station 01 (TV) completed
    const mockStars: Record<string, number> = {};
    for (const task of CODING_TASKS) {
      mockStars[task.id] = 2;
    }

    const count = countCompletedStations(mockStars, {});
    expect(count).toBe(1);
  });
});

describe("Deep Dive Curated Primary Sources Integrity", () => {
  it("has authentic curated resources for key tasks across stations", () => {
    const tasksWithResources = Object.entries(TASK_DIDACTIC_MAP).filter(
      ([, ctx]) => ctx.curatedResources && ctx.curatedResources.length > 0
    );

    // We populated resources for at least 15+ key station tasks
    expect(tasksWithResources.length).toBeGreaterThanOrEqual(15);

    const validAuthorities = [
      "Microsoft Learn",
      "Go.dev",
      "Google Cloud",
      "IBM Granite",
      "ByteByteGo",
      "NIST",
      "RFC",
      "OWASP",
      "Computerphile",
      "MIT OCW",
    ];

    for (const [, ctx] of tasksWithResources) {
      for (const res of ctx.curatedResources!) {
        // Valid URL
        expect(res.url).toMatch(/^https:\/\//);

        // Valid recognized authority
        expect(validAuthorities).toContain(res.source);

        // Non-empty descriptive title
        expect(res.title.trim().length).toBeGreaterThan(5);

        // Multilingual whyRead (UA & EN mandatory)
        expect(res.whyRead.ua.trim().length).toBeGreaterThan(10);
        expect(res.whyRead.en.trim().length).toBeGreaterThan(10);

        // Reasonable reading time
        expect(res.estimatedMinutes).toBeGreaterThanOrEqual(3);
        expect(res.estimatedMinutes).toBeLessThanOrEqual(60);

        // Valid target qualification grade
        expect(["Junior", "Middle", "Senior", "Architect"]).toContain(res.targetGrade);
      }
    }
  });
});

describe("Certificate SVG Automated Career Qualification Badge", () => {
  it("renders explicit career qualification when passed in options", () => {
    const svg = generateCertificateSvg({
      stationCode: "API",
      stationTitle: "Backend & API Forge Architecture",
      credentialTitle: "Certified Backend & API Architect",
      callsign: "AdaLovelace",
      stars: 12,
      maxStars: 15,
      xp: 450,
      careerRank: "L3: Systems Specialist",
      competencies: ["RESTful Routing", "Bearer Auth"],
      themeColor: "#0EA5E9",
    });

    expect(svg).toContain("CAREER QUALIFICATION: L3: SYSTEMS SPECIALIST");
    expect(svg).toContain("ADALOVELACE");
    expect(svg).toContain("450 TOTAL XP");
  });

  it("automatically calculates career qualification from XP when omitted in options", () => {
    const svg = generateCertificateSvg({
      stationCode: "POS",
      stationTitle: "Fintech POS Architecture",
      credentialTitle: "Certified Fintech Security Engineer",
      callsign: "AlanTuring",
      stars: 10,
      maxStars: 10,
      xp: 750,
      competencies: ["PIN Lockout", "Double Deduction Prevention"],
      themeColor: "#10B981",
    });

    // 750 XP + 1 station completion defaults to L2 (or higher if 2+ stations)
    expect(svg).toContain("CAREER QUALIFICATION:");
    expect(svg).toContain("ALANTURING");
    expect(svg).toContain("750 TOTAL XP");
  });
});
