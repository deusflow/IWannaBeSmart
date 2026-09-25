import { describe, it, expect } from "vitest";
import {
  calculateCareerRank,
  countCompletedStations,
} from "../careerRank";
import { CODING_TASKS, FINTECH_TASKS } from "@iw/sim-engine";

describe("careerRank utility (L1-L4 Qualification Ladder)", () => {
  it("should classify cadet as L1 (Code Apprentice) by default", () => {
    const rank = calculateCareerRank(0, 0, 0);
    expect(rank.grade).toBe("L1");
    expect(rank.tier).toBe(1);
    expect(rank.codeName).toBe("Code Apprentice");
    expect(rank.nextGrade).toBe("L2");
    expect(rank.remainingToNext.xp).toBe(100);
    expect(rank.remainingToNext.stations).toBe(2);
    expect(rank.progressPercent).toBe(0);
  });

  it("should advance to L2 (Junior Implementer) when reaching 100 XP and 2 completed stations", () => {
    const rank = calculateCareerRank(120, 2, 0);
    expect(rank.grade).toBe("L2");
    expect(rank.tier).toBe(2);
    expect(rank.codeName).toBe("Junior Implementer");
    expect(rank.nextGrade).toBe("L3");
    expect(rank.remainingToNext.xp).toBe(230); // 350 - 120
    expect(rank.remainingToNext.stations).toBe(2); // 4 - 2
  });

  it("should not advance to L2 if only XP is met but stations count is below 2", () => {
    const rank = calculateCareerRank(300, 1, 0);
    expect(rank.grade).toBe("L1");
    expect(rank.remainingToNext.stations).toBe(1);
  });

  it("should advance to L3 (Systems Specialist) at 350 XP and 4 completed stations", () => {
    const rank = calculateCareerRank(450, 5, 0);
    expect(rank.grade).toBe("L3");
    expect(rank.tier).toBe(3);
    expect(rank.codeName).toBe("Systems Specialist");
    expect(rank.nextGrade).toBe("L4");
  });

  it("should hold candidate at L3 if 700+ XP and 7 stations are met but 0 War Room incidents solved", () => {
    const rank = calculateCareerRank(850, 8, 0);
    expect(rank.grade).toBe("L3");
    expect(rank.nextGrade).toBe("L4");
    expect(rank.requirementsMet.warRoom).toBe(false);
    expect(rank.remainingToNext.warRoom).toBe(1);
    expect(rank.remainingToNext.xp).toBe(0);
    expect(rank.remainingToNext.stations).toBe(0);
  });

  it("should advance to L4 (Solutions Architect) when all criteria are met including War Room", () => {
    const rank = calculateCareerRank(900, 7, 1);
    expect(rank.grade).toBe("L4");
    expect(rank.tier).toBe(4);
    expect(rank.codeName).toBe("Solutions Architect");
    expect(rank.nextGrade).toBeNull();
    expect(rank.progressPercent).toBe(100);
    expect(rank.requirementsMet).toEqual({
      xp: true,
      stations: true,
      warRoom: true,
    });
  });

  it("should accurately count completed stations via countCompletedStations", () => {
    const mastery: Record<string, number> = {};
    const completed: Record<string, boolean> = {};

    expect(countCompletedStations(mastery, completed)).toBe(0);

    // Complete TV station
    for (const t of CODING_TASKS) {
      mastery[t.id] = 1;
    }
    expect(countCompletedStations(mastery, completed)).toBe(1);

    // Complete POS station
    for (const t of FINTECH_TASKS) {
      completed[t.id] = true;
    }
    expect(countCompletedStations(mastery, completed)).toBe(2);
  });
});
