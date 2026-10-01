/**
 * @file packages/sim-engine/src/runtime/tasterRegistry.ts
 * @description Central declarative registry of Career Speed-Dating roles.
 * Zero-hardcode source of truth for taste-testing IT professions.
 */

export type RoleCategory = "build" | "investigate" | "balance" | "operate";

export interface RoleTasterDefinition {
  id: string;
  roleTitleKey: string;
  category: RoleCategory;
  mentorIntroKey: string;
  routineFactKey: string;
  targetStationId: string | null; // Real ID from trackManifest ('tv', 'bandit', etc.) or null if track is coming soon
  targetTrack: string;            // 'backend' | 'security' | 'ai' | 'explorer'
  isComingSoon?: boolean;         // true for Game Design / tracks in development
  iDoStep: {
    problemDescKey: string;
    explanationKey: string;
    initialSnippet: string;
    fixedSnippet: string;
  };
  weDoStep: {
    instructionKey: string;
    targetSnippet: string;
    verificationKey: string;
    expectedAssert: string;
  };
  youDoStep: {
    requirementTextKey: string;
    initialCode: string;
    hintsKeys: [string, string, string]; // [Look at, Rule, Solution]
    solutionCode: string;
  };
}

export const ROLE_TASTER_REGISTRY: RoleTasterDefinition[] = [
  {
    id: "role-backend",
    roleTitleKey: "taster.backend.roleTitle",
    category: "build",
    mentorIntroKey: "taster.backend.mentorIntro",
    routineFactKey: "taster.backend.routineFact",
    targetStationId: "tv",
    targetTrack: "backend",
    iDoStep: {
      problemDescKey: "taster.backend.iDo.problemDesc",
      explanationKey: "taster.backend.iDo.explanation",
      initialSnippet: "if (cartTotal > 1000) { applyDiscount(0.10); }",
      fixedSnippet: "if (cartTotal >= 1000) { applyDiscount(0.10); }",
    },
    weDoStep: {
      instructionKey: "taster.backend.weDo.instruction",
      targetSnippet: "cartTotal >= 500",
      verificationKey: "taster.backend.weDo.verification",
      expectedAssert: "Assert.Equal(true, hasFreeShipping(500))",
    },
    youDoStep: {
      requirementTextKey: "taster.backend.youDo.requirement",
      initialCode: "purchasesCount > 5",
      hintsKeys: [
        "taster.backend.youDo.hint1",
        "taster.backend.youDo.hint2",
        "taster.backend.youDo.hint3Solution",
      ],
      solutionCode: "purchasesCount >= 5",
    },
  },
  {
    id: "role-cyber",
    roleTitleKey: "taster.cyber.roleTitle",
    category: "investigate",
    mentorIntroKey: "taster.cyber.mentorIntro",
    routineFactKey: "taster.cyber.routineFact",
    targetStationId: "bandit",
    targetTrack: "security",
    iDoStep: {
      problemDescKey: "taster.cyber.iDo.problemDesc",
      explanationKey: "taster.cyber.iDo.explanation",
      initialSnippet: "AUTH_SERVER_LOAD: 98% | Analyzing raw ingress stream...",
      fixedSnippet: "Identified anomaly: 198.51.100.42 (47 failed POST /login requests) -> Blocked.",
    },
    weDoStep: {
      instructionKey: "taster.cyber.weDo.instruction",
      targetSnippet: "203.0.113.77",
      verificationKey: "taster.cyber.weDo.verification",
      expectedAssert: "VERIFY: 200 OK responses preserved for legitimate traffic",
    },
    youDoStep: {
      requirementTextKey: "taster.cyber.youDo.requirement",
      initialCode: "",
      hintsKeys: [
        "taster.cyber.youDo.hint1",
        "taster.cyber.youDo.hint2",
        "taster.cyber.youDo.hint3Solution",
      ],
      solutionCode: "192.0.2.144",
    },
  },
  {
    id: "role-gamedesign",
    roleTitleKey: "taster.gamedesign.roleTitle",
    category: "balance",
    mentorIntroKey: "taster.gamedesign.mentorIntro",
    routineFactKey: "taster.gamedesign.routineFact",
    targetStationId: null, // No dedicated station yet -> routes to hub/explorer with "coming soon" badge
    targetTrack: "explorer",
    isComingSoon: true,
    iDoStep: {
      problemDescKey: "taster.gamedesign.iDo.problemDesc",
      explanationKey: "taster.gamedesign.iDo.explanation",
      initialSnippet: "bossDamage = 120, bossCooldownSec = 0.5 // Time-to-Kill: 1.5s",
      fixedSnippet: "bossDamage = 45, bossCooldownSec = 1.8 // Time-to-Kill: 11.2s",
    },
    weDoStep: {
      instructionKey: "taster.gamedesign.weDo.instruction",
      targetSnippet: "playerArmor = 20",
      verificationKey: "taster.gamedesign.weDo.verification",
      expectedAssert: "100_SIM_RUNS: avg_duration = 11.1s (TARGET: 10-12s)",
    },
    youDoStep: {
      requirementTextKey: "taster.gamedesign.youDo.requirement",
      initialCode: "bossDamage = 80\npotionHeal = 20\npotionCount = 1",
      hintsKeys: [
        "taster.gamedesign.youDo.hint1",
        "taster.gamedesign.youDo.hint2",
        "taster.gamedesign.youDo.hint3Solution",
      ],
      solutionCode: "bossDamage = 40\npotionHeal = 45\npotionCount = 2",
    },
  },
];
