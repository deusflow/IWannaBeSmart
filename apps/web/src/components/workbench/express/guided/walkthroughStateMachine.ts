/**
 * @file apps/web/src/components/workbench/express/guided/walkthroughStateMachine.ts
 * @description Pure state definitions and transitions for the Guided Walkthrough ("Career Speed-Dating").
 * Guarantees atomic steps: 1 highlighted element, 1 imperative sentence, 1 action per screen.
 */

export type RoleId = "role-backend" | "role-cyber" | "role-gamedesign";

export type GuidedSubStepId =
  // Backend
  | "backend-scene"
  | "backend-ido"
  | "backend-wedo"
  | "backend-youdo-cond"
  | "backend-routine"
  // Cyber
  | "cyber-scene"
  | "cyber-ido"
  | "cyber-wedo-filter"
  | "cyber-wedo-block"
  | "cyber-youdo"
  | "cyber-routine"
  // Game Design
  | "gamedesign-scene"
  | "gamedesign-ido"
  | "gamedesign-wedo-armor"
  | "gamedesign-wedo-sim"
  | "gamedesign-youdo"
  | "gamedesign-routine";

export interface GuidedStepDefinition {
  id: GuidedSubStepId;
  roleId: RoleId;
  targetId: string;
  badgeKey: string;
  stepNumber: number;
  totalSubSteps: number;
  actionType: "next" | "type" | "run" | "multi-run" | "select";
  typingTarget?: string;
  canShowSolutionAfterFails: boolean;
}

export const GUIDED_STEPS_BY_ROLE: Record<RoleId, GuidedStepDefinition[]> = {
  "role-backend": [
    {
      id: "backend-scene",
      roleId: "role-backend",
      targetId: "express-shop-stand",
      badgeKey: "taster.stepPacingBadge",
      stepNumber: 1,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "backend-ido",
      roleId: "role-backend",
      targetId: "express-backend-code-snippet",
      badgeKey: "taster.stepIDoBadge",
      stepNumber: 2,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "backend-wedo",
      roleId: "role-backend",
      targetId: "express-backend-wedo-box",
      badgeKey: "taster.stepWeDoBadge",
      stepNumber: 3,
      totalSubSteps: 5,
      actionType: "run",
      typingTarget: ">=",
      canShowSolutionAfterFails: true,
    },
    {
      id: "backend-youdo-cond",
      roleId: "role-backend",
      targetId: "express-backend-youdo-cond-box",
      badgeKey: "taster.stepYouDoBadge",
      stepNumber: 4,
      totalSubSteps: 5,
      actionType: "run",
      typingTarget: "return purchasesCount >= 5;",
      canShowSolutionAfterFails: false,
    },
    {
      id: "backend-routine",
      roleId: "role-backend",
      targetId: "express-routine-card",
      badgeKey: "taster.stepRoutineBadge",
      stepNumber: 5,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
  ],
  "role-cyber": [
    {
      id: "cyber-scene",
      roleId: "role-cyber",
      targetId: "express-traffic-stand",
      badgeKey: "taster.stepPacingBadge",
      stepNumber: 1,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "cyber-ido",
      roleId: "role-cyber",
      targetId: "express-cyber-ido-highlight",
      badgeKey: "taster.stepIDoBadge",
      stepNumber: 2,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "cyber-wedo-filter",
      roleId: "role-cyber",
      targetId: "express-cyber-wedo-terminal",
      badgeKey: "taster.stepWeDoBadge",
      stepNumber: 3,
      totalSubSteps: 5,
      actionType: "type",
      typingTarget: "status=401",
      canShowSolutionAfterFails: true,
    },
    {
      id: "cyber-wedo-block",
      roleId: "role-cyber",
      targetId: "express-cyber-wedo-terminal",
      badgeKey: "taster.stepWeDoBadge",
      stepNumber: 3,
      totalSubSteps: 5,
      actionType: "run",
      typingTarget: "block 203.0.113.77",
      canShowSolutionAfterFails: true,
    },
    {
      id: "cyber-youdo",
      roleId: "role-cyber",
      targetId: "express-cyber-youdo-box",
      badgeKey: "taster.stepYouDoBadge",
      stepNumber: 4,
      totalSubSteps: 5,
      actionType: "run",
      typingTarget: "192.0.2.144",
      canShowSolutionAfterFails: true,
    },
    {
      id: "cyber-routine",
      roleId: "role-cyber",
      targetId: "express-routine-card",
      badgeKey: "taster.stepRoutineBadge",
      stepNumber: 5,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
  ],
  "role-gamedesign": [
    {
      id: "gamedesign-scene",
      roleId: "role-gamedesign",
      targetId: "express-duel-arena-stand",
      badgeKey: "taster.stepPacingBadge",
      stepNumber: 1,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "gamedesign-ido",
      roleId: "role-gamedesign",
      targetId: "express-duel-ido-box",
      badgeKey: "taster.stepIDoBadge",
      stepNumber: 2,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
    {
      id: "gamedesign-wedo-armor",
      roleId: "role-gamedesign",
      targetId: "express-gd-armor-slider-box",
      badgeKey: "taster.stepWeDoBadge",
      stepNumber: 3,
      totalSubSteps: 5,
      actionType: "select",
      canShowSolutionAfterFails: true,
    },
    {
      id: "gamedesign-wedo-sim",
      roleId: "role-gamedesign",
      targetId: "express-gd-wedo-run-box",
      badgeKey: "taster.stepWeDoBadge",
      stepNumber: 3,
      totalSubSteps: 5,
      actionType: "run",
      canShowSolutionAfterFails: true,
    },
    {
      id: "gamedesign-youdo",
      roleId: "role-gamedesign",
      targetId: "express-gd-youdo-box",
      badgeKey: "taster.stepYouDoBadge",
      stepNumber: 4,
      totalSubSteps: 5,
      actionType: "multi-run",
      canShowSolutionAfterFails: true,
    },
    {
      id: "gamedesign-routine",
      roleId: "role-gamedesign",
      targetId: "express-routine-card",
      badgeKey: "taster.stepRoutineBadge",
      stepNumber: 5,
      totalSubSteps: 5,
      actionType: "next",
      canShowSolutionAfterFails: false,
    },
  ],
};
