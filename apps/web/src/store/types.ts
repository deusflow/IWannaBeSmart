/**
 * @file apps/web/src/store/types.ts
 * @description Centralized types and slice interfaces for WorkbenchStore
 */

import type { Node, Edge } from "@xyflow/react";
import type { VirtualPosState } from "@iw/sim-engine";

/**
 * Physical animation & transmission timings (Item 56)
 */
export const TIMINGS = {
  BUTTON_PRESS_MS: 120,
  IR_BEAM_FLIGHT_MS: 200,
  SCREEN_REACTION_MS: 150,
} as const;

export type HardwarePointKey = "VCC" | "GND" | "IR_DATA" | "DISPLAY_BUS";

export interface HardwarePoint {
  id: HardwarePointKey;
  name: string;
  voltage: "0V" | "5V";
  hasSignal: boolean;
  nominalVoltage: string;
  role: string;
  testPoint: string;
}

export type CircuitEdgeId =
  | "edge-psu-mcu"
  | "edge-psu-ir"
  | "edge-ir-mcu"
  | "edge-mcu-display"
  | "edge-mcu-audio"
  | "edge-mcu-led"
  | "edge-mcu-eeprom";

export interface CircuitEdgeState {
  id: CircuitEdgeId;
  source: string;
  target: string;
  label: string;
  signalType: string;
  isBroken: boolean;
}

export interface CircuitSlice {
  circuitEdges: Record<CircuitEdgeId, CircuitEdgeState>;
  toggleCircuitEdge: (edgeId: CircuitEdgeId) => void;
  resetCircuit: () => void;
  isEdgeBroken: (edgeId: CircuitEdgeId) => boolean;
}

export interface ArchitectureSlice {
  /** Is PowerCommand.Execute -> TVController.CommandHandler wired? */
  isArchitecturePowerWired: boolean;
  setArchitecturePowerWired: (wired: boolean) => void;

  /**
   * Persistent graph state — the single source of truth.
   * ArchitectureCanvas reads these on mount and writes on every change.
   * Navigating away and back never resets the board.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  archNodes: Node<Record<string, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  archEdges: Edge<Record<string, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setArchNodes: (nodes: Node<Record<string, any>>[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setArchEdges: (edges: Edge<Record<string, any>>[]) => void;

  // Trace-Chain Node System State (Items 0-5)
  selectedTraceEntityId: string;
  setSelectedTraceEntityId: (id: string) => void;
  bypassedTraceNodes: string[];
  toggleTraceBypass: (nodeId: string) => void;
  resetBypasses: () => void;
  isTraceBroken: boolean;
  setIsTraceBroken: (broken: boolean) => void;
  traceFaultReason?: string;
  setTraceFaultReason: (reason?: string) => void;
  resetLevelForPractice: () => void;
  completeLevel: () => void;
}

export type MentorPhase = "GUIDED" | "VERIFY" | "PRACTICE" | "COMPLETED";

export interface MentorSlice {
  mentorPhase: MentorPhase;
  guidedStep: 1 | 2 | 3;
  isHintActive: boolean;
  isStationVictoryModalOpen: boolean;
  xp: number;
  completedCodingTasks: Record<string, boolean>;
  completeCodingTask: (taskId: string) => boolean;
  isCodingTaskCompleted: (taskId: string) => boolean;
  setStationVictoryModalOpen: (open: boolean) => void;
  setMentorPhase: (phase: MentorPhase) => void;
  setGuidedStep: (step: 1 | 2 | 3) => void;
  triggerHint: () => void;
  addXp: (amount: number) => void;
  // Code Gym Mastery Stars & Fintech Station
  taskMasteryStars: Record<string, number>;
  setTaskMastery: (taskId: string, stars: number, bestWpm?: number) => void;
  saveTaskProgress: (taskId: string, stars: number, bestWpm?: number) => void;
  getTaskMastery: (taskId: string) => number;
  syncCloudProgress: (userId: string) => Promise<void>;
  currentStationId: string;
  setCurrentStationId: (id: string) => void;
  currentView: "HUB" | "STATION";
  setCurrentView: (view: "HUB" | "STATION") => void;
}

export interface PosSlice {
  posState: VirtualPosState;
  applyPosExecution: (updates: Partial<VirtualPosState>) => void;
  resetPosState: (customState?: Partial<VirtualPosState>) => void;
  isPosVictoryModalOpen: boolean;
  setPosVictoryModalOpen: (open: boolean) => void;
  posManualPin: string;
  posIsCardInserted: boolean;
  posKeypadInput: (key: string) => void;
  posTapNfc: () => void;
  posInsertChip: () => void;
  posEjectCard: () => void;
}

export interface TVStateSlice {
  power: boolean;
  channel: number;
  maxChannels: number;
  channelNames: Record<number, string>;
  volume: number; // 0..100
  isMuted: boolean;
  osdMessage: string;
  irSignalPulse: boolean;
  screenReactionPulse: boolean;

  // Direct Programmatic Actions with FSM Guards (Blocked when !power)
  setVolume: (vol: number) => void;
  changeVolume: (delta: number) => void;
  setChannel: (channel: number) => void;
  nextChannel: () => void;
  prevChannel: () => void;
  toggleMute: () => void;
  togglePower: () => void;
}

export interface ConnectionsSlice {
  connections: Record<HardwarePointKey, HardwarePoint>;
  setConnectionSignal: (key: HardwarePointKey, voltage: "0V" | "5V", hasSignal: boolean) => void;
}

export interface IRSigSlice {
  isIrEmitting: boolean;
  isBeamFlying: boolean;
  lastOpcode: string;
}

export interface WorkbenchActions {
  // Remote Buttons (Trigger physical IR pipeline)
  pressPower: () => void;
  pressChannelUp: () => void;
  pressChannelDown: () => void;
  pressSelectChannel: (channel: number) => void;
  pressVolumeUp: () => void;
  pressVolumeDown: () => void;
  pressMuteToggle: () => void;

  // TV Chassis Buttons (Direct physical contact without IR delay)
  chassisTogglePower: () => void;
  chassisNextChannel: () => void;
  chassisPrevChannel: () => void;

  // Code Playground Runtime Dispatcher
  applyCodeExecution: (updates: {
    power?: boolean;
    channel?: number;
    volume?: number;
    osdMessage?: string;
    label?: string;
  }) => void;

  // Core physical pipeline dispatcher
  dispatchRemoteCommand: (
    commandName: string,
    execute: (state: TVStateSlice & ConnectionsSlice & CircuitSlice & ArchitectureSlice) => {
      tvUpdates?: Partial<TVStateSlice>;
      connectionUpdates?: Partial<Record<HardwarePointKey, Partial<HardwarePoint>>>;
    }
  ) => void;
}

export interface CalculatorSlice {
  calcDisplay: string;
  calcPrevValue: number | null;
  calcOperation: "+" | "-" | null;
  calcClearOnNext: boolean;
  calcInputDigit: (digit: number) => void;
  calcSetOperation: (op: "+" | "-") => void;
  calcEvaluate: () => void;
  calcClear: () => void;
}

export type WorkbenchStore = TVStateSlice &
  ConnectionsSlice &
  CircuitSlice &
  ArchitectureSlice &
  MentorSlice &
  PosSlice &
  IRSigSlice &
  CalculatorSlice &
  WorkbenchActions;
