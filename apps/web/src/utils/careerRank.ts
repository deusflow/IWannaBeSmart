/**
 * @file apps/web/src/utils/careerRank.ts
 * @description Career Qualification Ladder (L1–L4):
 *   - L1: Code Apprentice (Freshman / Cadet)
 *   - L2: Junior Implementer (Junior Engineer / Algorithmic & Transaction Mastery)
 *   - L3: Systems Specialist (Middle Engineer / Multi-Station Systems & Contracts)
 *   - L4: Solutions Architect (Senior Architect / SRE Incident Commander)
 *
 * Linked directly to: Current XP, Completed Stations count, and SEV-1 War Room resolutions.
 */

import {
  CODING_TASKS,
  FINTECH_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  VERTEX_TASKS,
  FDE_TASKS,
  RAG_TASKS,
  CYBER_TASKS,
} from "@iw/sim-engine";

export type CareerRankGrade = "L1" | "L2" | "L3" | "L4";

export interface CareerRankRequirements {
  minXp: number;
  minStations: number;
  minWarRoom: number;
}

export interface CareerRank {
  grade: CareerRankGrade;
  tier: number;
  codeName: string;
  titleKey: string;
  defaultTitle: string;
  color: string;
  badgeColorHex: string;
  requirements: CareerRankRequirements;
  nextGrade: CareerRankGrade | null;
  nextRequirements: CareerRankRequirements | null;
  progressPercent: number;
  requirementsMet: {
    xp: boolean;
    stations: boolean;
    warRoom: boolean;
  };
  remainingToNext: {
    xp: number;
    stations: number;
    warRoom: number;
  };
}

export const CAREER_RANKS_CONFIG: Record<
  CareerRankGrade,
  {
    tier: number;
    codeName: string;
    titleKey: string;
    defaultTitle: string;
    color: string;
    badgeColorHex: string;
    requirements: CareerRankRequirements;
  }
> = {
  L1: {
    tier: 1,
    codeName: "Code Apprentice",
    titleKey: "careerRank.L1.title",
    defaultTitle: "Code Apprentice",
    color: "text-amber-800 border-amber-600/30 bg-amber-500/15",
    badgeColorHex: "#F59E0B",
    requirements: { minXp: 0, minStations: 0, minWarRoom: 0 },
  },
  L2: {
    tier: 2,
    codeName: "Junior Implementer",
    titleKey: "careerRank.L2.title",
    defaultTitle: "Junior Implementer",
    color: "text-emerald-800 border-emerald-600/30 bg-emerald-500/15",
    badgeColorHex: "#10B981",
    requirements: { minXp: 100, minStations: 2, minWarRoom: 0 },
  },
  L3: {
    tier: 3,
    codeName: "Systems Specialist",
    titleKey: "careerRank.L3.title",
    defaultTitle: "Systems Specialist",
    color: "text-blue-800 border-blue-600/30 bg-blue-500/15",
    badgeColorHex: "#3B82F6",
    requirements: { minXp: 350, minStations: 4, minWarRoom: 0 },
  },
  L4: {
    tier: 4,
    codeName: "Solutions Architect",
    titleKey: "careerRank.L4.title",
    defaultTitle: "Solutions Architect",
    color: "text-purple-800 border-purple-600/30 bg-purple-500/15",
    badgeColorHex: "#A855F7",
    requirements: { minXp: 700, minStations: 7, minWarRoom: 1 },
  },
};

/**
 * Counts fully certified stations based on task stars or completion flags.
 */
export function countCompletedStations(
  taskMasteryStars: Record<string, number> = {},
  completedCodingTasks: Record<string, boolean> = {}
): number {
  const allStationTasks = [
    CODING_TASKS,
    FINTECH_TASKS,
    API_FORGE_TASKS,
    GIT_TASKS,
    BANDIT_TASKS,
    VERTEX_TASKS,
    FDE_TASKS,
    RAG_TASKS,
    CYBER_TASKS,
  ];

  return allStationTasks.filter((tasks) => {
    if (!tasks || tasks.length === 0) return false;
    return tasks.every(
      (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
    );
  }).length;
}

/**
 * Evaluates career qualification ladder grade (L1–L4) according to strict production invariants.
 */
export function calculateCareerRank(
  xp: number,
  completedStationsCount: number,
  resolvedWarRoomCount: number
): CareerRank {
  const safeXp = Math.max(0, xp || 0);
  const safeStations = Math.max(0, completedStationsCount || 0);
  const safeWarRoom = Math.max(0, resolvedWarRoomCount || 0);

  // Check L4: Solutions Architect
  if (
    safeXp >= CAREER_RANKS_CONFIG.L4.requirements.minXp &&
    safeStations >= CAREER_RANKS_CONFIG.L4.requirements.minStations &&
    safeWarRoom >= CAREER_RANKS_CONFIG.L4.requirements.minWarRoom
  ) {
    const config = CAREER_RANKS_CONFIG.L4;
    return {
      grade: "L4",
      tier: config.tier,
      codeName: config.codeName,
      titleKey: config.titleKey,
      defaultTitle: config.defaultTitle,
      color: config.color,
      badgeColorHex: config.badgeColorHex,
      requirements: config.requirements,
      nextGrade: null,
      nextRequirements: null,
      progressPercent: 100,
      requirementsMet: { xp: true, stations: true, warRoom: true },
      remainingToNext: { xp: 0, stations: 0, warRoom: 0 },
    };
  }

  // Check L3: Systems Specialist
  if (
    safeXp >= CAREER_RANKS_CONFIG.L3.requirements.minXp &&
    safeStations >= CAREER_RANKS_CONFIG.L3.requirements.minStations
  ) {
    const config = CAREER_RANKS_CONFIG.L3;
    const target = CAREER_RANKS_CONFIG.L4.requirements;

    const remainingXp = Math.max(0, target.minXp - safeXp);
    const remainingStations = Math.max(0, target.minStations - safeStations);
    const remainingWarRoom = Math.max(0, target.minWarRoom - safeWarRoom);

    // Progress within L3 bracket (from 350 to 700 XP, 4 to 7 stations, 0 to 1 war room)
    const xpSpan = target.minXp - config.requirements.minXp;
    const stationsSpan = target.minStations - config.requirements.minStations;
    const warRoomSpan = target.minWarRoom;

    const xpRatio = Math.min(1, (safeXp - config.requirements.minXp) / xpSpan);
    const stationsRatio = Math.min(
      1,
      (safeStations - config.requirements.minStations) / stationsSpan
    );
    const warRoomRatio = Math.min(1, safeWarRoom / warRoomSpan);

    const progressPercent = Math.round(
      ((xpRatio + stationsRatio + warRoomRatio) / 3) * 100
    );

    return {
      grade: "L3",
      tier: config.tier,
      codeName: config.codeName,
      titleKey: config.titleKey,
      defaultTitle: config.defaultTitle,
      color: config.color,
      badgeColorHex: config.badgeColorHex,
      requirements: config.requirements,
      nextGrade: "L4",
      nextRequirements: target,
      progressPercent: Math.min(99, Math.max(0, progressPercent)),
      requirementsMet: {
        xp: remainingXp === 0,
        stations: remainingStations === 0,
        warRoom: remainingWarRoom === 0,
      },
      remainingToNext: {
        xp: remainingXp,
        stations: remainingStations,
        warRoom: remainingWarRoom,
      },
    };
  }

  // Check L2: Junior Implementer
  if (
    safeXp >= CAREER_RANKS_CONFIG.L2.requirements.minXp &&
    safeStations >= CAREER_RANKS_CONFIG.L2.requirements.minStations
  ) {
    const config = CAREER_RANKS_CONFIG.L2;
    const target = CAREER_RANKS_CONFIG.L3.requirements;

    const remainingXp = Math.max(0, target.minXp - safeXp);
    const remainingStations = Math.max(0, target.minStations - safeStations);

    const xpSpan = target.minXp - config.requirements.minXp;
    const stationsSpan = target.minStations - config.requirements.minStations;

    const xpRatio = Math.min(1, (safeXp - config.requirements.minXp) / xpSpan);
    const stationsRatio = Math.min(
      1,
      (safeStations - config.requirements.minStations) / stationsSpan
    );

    const progressPercent = Math.round(((xpRatio + stationsRatio) / 2) * 100);

    return {
      grade: "L2",
      tier: config.tier,
      codeName: config.codeName,
      titleKey: config.titleKey,
      defaultTitle: config.defaultTitle,
      color: config.color,
      badgeColorHex: config.badgeColorHex,
      requirements: config.requirements,
      nextGrade: "L3",
      nextRequirements: target,
      progressPercent: Math.min(99, Math.max(0, progressPercent)),
      requirementsMet: {
        xp: remainingXp === 0,
        stations: remainingStations === 0,
        warRoom: true,
      },
      remainingToNext: {
        xp: remainingXp,
        stations: remainingStations,
        warRoom: 0,
      },
    };
  }

  // Base L1: Code Apprentice
  const config = CAREER_RANKS_CONFIG.L1;
  const target = CAREER_RANKS_CONFIG.L2.requirements;

  const remainingXp = Math.max(0, target.minXp - safeXp);
  const remainingStations = Math.max(0, target.minStations - safeStations);

  const xpRatio = Math.min(1, safeXp / target.minXp);
  const stationsRatio = Math.min(1, safeStations / target.minStations);
  const progressPercent = Math.round(((xpRatio + stationsRatio) / 2) * 100);

  return {
    grade: "L1",
    tier: config.tier,
    codeName: config.codeName,
    titleKey: config.titleKey,
    defaultTitle: config.defaultTitle,
    color: config.color,
    badgeColorHex: config.badgeColorHex,
    requirements: config.requirements,
    nextGrade: "L2",
    nextRequirements: target,
    progressPercent: Math.min(99, Math.max(0, progressPercent)),
    requirementsMet: {
      xp: remainingXp === 0,
      stations: remainingStations === 0,
      warRoom: true,
    },
    remainingToNext: {
      xp: remainingXp,
      stations: remainingStations,
      warRoom: 0,
    },
  };
}
