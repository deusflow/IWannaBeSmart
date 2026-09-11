/**
 * @file apps/web/src/store/workbenchStore.ts
 * @description Centralized Zustand store for Interactive Workbench (Block F, Items 51–56)
 *
 * Implements:
 * - tvSlice: power, channel (1-based), volume (0..100), isMuted, osdMessage, irSignalPulse
 * - connectionsSlice: hardware test points (VCC, GND, IR_DATA, DISPLAY_BUS) with 0V/5V & hasSignal
 * - Physical IR packet pipeline: Button Press (120ms) -> Beam Flight (200ms) -> TV Sensor & Screen Reaction (150ms)
 * - ArchitectureSlice: persistent graph state (nodes + edges) for Architecture Studio
 */

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import { CODING_TASKS, type VirtualPosState } from "@iw/sim-engine";
import { audioFx } from "../utils/audioFx";

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
  resetLevelForPractice: () => void;
  completeLevel: () => void;
  // Code Gym Mastery Stars & Fintech Station
  taskMasteryStars: Record<string, number>;
  setTaskMastery: (taskId: string, stars: number) => void;
  getTaskMastery: (taskId: string) => number;
  currentStationId: string;
  setCurrentStationId: (id: string) => void;
  currentView: "HUB" | "STATION";
  setCurrentView: (view: "HUB" | "STATION") => void;
  posState: VirtualPosState;
  applyPosExecution: (updates: Partial<VirtualPosState>) => void;
  resetPosState: (customState?: Partial<VirtualPosState>) => void;
  isPosVictoryModalOpen: boolean;
  setPosVictoryModalOpen: (open: boolean) => void;
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
  IRSigSlice &
  CalculatorSlice &
  WorkbenchActions;

// Helper to calculate initial connection points
const createInitialConnections = (): Record<HardwarePointKey, HardwarePoint> => ({
  VCC: {
    id: "VCC",
    name: "VCC (+5V Power Rail)",
    voltage: "5V",
    hasSignal: true,
    nominalVoltage: "5.02 V",
    role: "Головна шина живлення +5V (PSU)",
    testPoint: "Контрольна точка: VCC (+5V)",
  },
  GND: {
    id: "GND",
    name: "GND (Ground Plane)",
    voltage: "0V",
    hasSignal: true,
    nominalVoltage: "0.00 V",
    role: "Опорний нульовий потенціал схеми",
    testPoint: "Контрольна точка: GND (0V)",
  },
  IR_DATA: {
    id: "IR_DATA",
    name: "IR_DATA (TSOP38238)",
    voltage: "0V",
    hasSignal: false,
    nominalVoltage: "3.31 V",
    role: "Демодульований потік імпульсів фотоприймача",
    testPoint: "Контрольна точка: PIN 2 (INT0)",
  },
  DISPLAY_BUS: {
    id: "DISPLAY_BUS",
    name: "DISPLAY_BUS (RGB/Sync)",
    voltage: "0V",
    hasSignal: false,
    nominalVoltage: "12.0 V",
    role: "Шина кадрової розгортки та матриці дисплея",
    testPoint: "Контрольна точка: H_SYNC",
  },
});

// Helper to calculate initial circuit traces (Block G, Items 59-64)
export const createInitialCircuitEdges = (): Record<CircuitEdgeId, CircuitEdgeState> => ({
  "edge-psu-mcu": {
    id: "edge-psu-mcu",
    source: "node-psu",
    target: "node-mcu",
    label: "VCC (+5V)",
    signalType: "Головне живлення процесора",
    isBroken: false,
  },
  "edge-psu-ir": {
    id: "edge-psu-ir",
    source: "node-psu",
    target: "node-ir",
    label: "VCC (+5V)",
    signalType: "Живлення фотоприймача",
    isBroken: false,
  },
  "edge-ir-mcu": {
    id: "edge-ir-mcu",
    source: "node-ir",
    target: "node-mcu",
    label: "IR_DATA (INT0)",
    signalType: "Шина переривань декодера",
    isBroken: false,
  },
  "edge-mcu-display": {
    id: "edge-mcu-display",
    source: "node-mcu",
    target: "node-display",
    label: "LVDS / Video Bus",
    signalType: "Кадрова розгортка та пікселі",
    isBroken: false,
  },
  "edge-mcu-audio": {
    id: "edge-mcu-audio",
    source: "node-mcu",
    target: "node-audio",
    label: "Audio PWM",
    signalType: "Шина звукового тракту",
    isBroken: false,
  },
  "edge-mcu-led": {
    id: "edge-mcu-led",
    source: "node-mcu",
    target: "node-led",
    label: "GPIO Status",
    signalType: "Індикатор чергового режиму",
    isBroken: false,
  },
  "edge-mcu-eeprom": {
    id: "edge-mcu-eeprom",
    source: "node-mcu",
    target: "node-eeprom",
    label: "I2C (SDA/SCL)",
    signalType: "Енергонезалежна пам'ять",
    isBroken: false,
  },
});

export const useWorkbenchStore = create<WorkbenchStore>((set, get) => {
  // Store timers for sequence cleanup
  let flightTimer: ReturnType<typeof setTimeout> | null = null;
  let arrivalTimer: ReturnType<typeof setTimeout> | null = null;
  let reactionTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    // 1. TV Slice (Items 52, 54)
    power: false,
    channel: 1,
    maxChannels: 4,
    channelNames: {
      1: "Boot Kernel",
      2: "Transaction Feed",
      3: "Event Bus",
      4: "Memory Buffer",
    },
    volume: 45, // 0..100
    isMuted: false,
    osdMessage: "Телевізор у режимі очікування",
    irSignalPulse: false,
    screenReactionPulse: false,

    // Direct Programmatic Actions with FSM Guards (!power -> blocked)
    setVolume: (vol: number) => {
      if (!get().power) return;
      const nextVol = Math.max(0, Math.min(100, vol));
      set({
        volume: nextVol,
        isMuted: false,
        osdMessage: `Гучність: ${nextVol} / 100`,
      });
    },

    changeVolume: (delta: number) => {
      if (!get().power) return;
      const nextVol = Math.max(0, Math.min(100, get().volume + delta));
      set({
        volume: nextVol,
        isMuted: false,
        osdMessage: `Гучність: ${nextVol} / 100`,
      });
    },

    setChannel: (targetChannel: number) => {
      if (!get().power) return;
      const state = get();
      const ch = Math.max(1, Math.min(state.maxChannels, targetChannel));
      set({
        channel: ch,
        osdMessage: `Канал ${ch}: ${state.channelNames[ch]}`,
      });
    },

    nextChannel: () => {
      if (!get().power) return;
      const state = get();
      const next = state.channel >= state.maxChannels ? 1 : state.channel + 1;
      set({
        channel: next,
        osdMessage: `Канал ${next}: ${state.channelNames[next]}`,
      });
    },

    prevChannel: () => {
      if (!get().power) return;
      const state = get();
      const prev = state.channel <= 1 ? state.maxChannels : state.channel - 1;
      set({
        channel: prev,
        osdMessage: `Канал ${prev}: ${state.channelNames[prev]}`,
      });
    },

    toggleMute: () => {
      if (!get().power) return;
      const state = get();
      const nextMute = !state.isMuted;
      set({
        isMuted: nextMute,
        osdMessage: nextMute ? "Звук вимкнено" : `Гучність: ${state.volume} / 100`,
      });
    },

    togglePower: () => {
      audioFx.playRelayClick();
      // Hardware fault guard: If PSU -> MCU is broken, MCU has no VCC power rail!
      if (get().isEdgeBroken("edge-psu-mcu")) {
        set({
          power: false,
          osdMessage: "Помилка живлення: обрив лінії PSU -> MCU",
        });
        return;
      }
      const state = get();
      const nextPower = !state.power;
      if (nextPower) {
        audioFx.playCrtHum();
      }
      const isDisplayBroken = state.isEdgeBroken("edge-mcu-display");
      set({
        power: nextPower,
        osdMessage: nextPower
          ? `Канал ${state.channel}: ${state.channelNames[state.channel]}`
          : "Телевізор у режимі очікування",
        connections: {
          ...state.connections,
          DISPLAY_BUS: {
            ...state.connections.DISPLAY_BUS,
            voltage: nextPower && !isDisplayBroken ? "5V" : "0V",
            hasSignal: nextPower && !isDisplayBroken,
          },
        },
      });
    },

    // 2. Connections Slice (Item 53)
    connections: createInitialConnections(),
    setConnectionSignal: (key, voltage, hasSignal) =>
      set((state) => ({
        connections: {
          ...state.connections,
          [key]: {
            ...state.connections[key],
            voltage,
            hasSignal,
          },
        },
      })),

    // 2b. Circuit Board Traces Slice (Block G, Items 59-64)
    circuitEdges: createInitialCircuitEdges(),

    isEdgeBroken: (edgeId: CircuitEdgeId) => {
      return !!get().circuitEdges[edgeId]?.isBroken;
    },

    toggleCircuitEdge: (edgeId: CircuitEdgeId) => {
      const state = get();
      const currentEdge = state.circuitEdges[edgeId];
      if (!currentEdge) return;

      const nextBroken = !currentEdge.isBroken;
      const updatedEdges = {
        ...state.circuitEdges,
        [edgeId]: {
          ...currentEdge,
          isBroken: nextBroken,
        },
      };

      // Fault Injection Rule 1: PSU -> MCU line broken
      if (edgeId === "edge-psu-mcu") {
        if (nextBroken) {
          // MCU loses VCC completely: TV turns off immediately, DISPLAY_BUS drops to 0V
          set({
            circuitEdges: updatedEdges,
            power: false,
            osdMessage: "Помилка живлення: обрив лінії PSU -> MCU",
            connections: {
              ...state.connections,
              VCC: {
                ...state.connections.VCC,
                voltage: "0V",
                hasSignal: false,
              },
              DISPLAY_BUS: {
                ...state.connections.DISPLAY_BUS,
                voltage: "0V",
                hasSignal: false,
              },
            },
          });
          return;
        } else {
          // PSU -> MCU restored
          set({
            circuitEdges: updatedEdges,
            osdMessage: "Телевізор у режимі очікування",
            connections: {
              ...state.connections,
              VCC: {
                ...state.connections.VCC,
                voltage: "5V",
                hasSignal: true,
              },
            },
          });
          return;
        }
      }

      // Fault Injection Rule 2: MCU -> Display Driver broken
      if (edgeId === "edge-mcu-display") {
        set({
          circuitEdges: updatedEdges,
          connections: {
            ...state.connections,
            DISPLAY_BUS: {
              ...state.connections.DISPLAY_BUS,
              voltage: !nextBroken && state.power ? "5V" : "0V",
              hasSignal: !nextBroken && state.power,
            },
          },
        });
        return;
      }

      set({ circuitEdges: updatedEdges });
    },

    resetCircuit: () => {
      const state = get();
      const resetEdges = createInitialCircuitEdges();
      set({
        circuitEdges: resetEdges,
        osdMessage: state.power
          ? `Канал ${state.channel}: ${state.channelNames[state.channel]}`
          : "Телевізор у режимі очікування",
        connections: {
          ...state.connections,
          VCC: {
            ...state.connections.VCC,
            voltage: "5V",
            hasSignal: true,
          },
          DISPLAY_BUS: {
            ...state.connections.DISPLAY_BUS,
            voltage: state.power ? "5V" : "0V",
            hasSignal: state.power,
          },
        },
      });
    },

    // 2c. Architecture Visual Editor Slice (Block H, Level 1 Wiring)
    isArchitecturePowerWired: false,
    setArchitecturePowerWired: (wired: boolean) => set({ isArchitecturePowerWired: wired }),

    // Persistent graph state — never reset on navigation
    archNodes: [],
    archEdges: [],
    setArchNodes: (nodes) => set({ archNodes: nodes }),
    setArchEdges: (edges) => set({ archEdges: edges }),

    // 2d. Interactive Mentor Walkthrough Slice
    mentorPhase: "GUIDED",
    guidedStep: 1,
    isHintActive: false,
    isStationVictoryModalOpen: false,
    xp: (() => {
      try {
        return typeof window !== "undefined"
          ? parseInt(localStorage.getItem("iw_user_xp") || "0", 10) || 0
          : 0;
      } catch {
        return 0;
      }
    })(),
    completedCodingTasks: (() => {
      try {
        return typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("iw_completed_tasks") || "{}")
          : {};
      } catch {
        return {};
      }
    })(),
    setStationVictoryModalOpen: (open) => set({ isStationVictoryModalOpen: open }),
    completeCodingTask: (taskId: string) => {
      const alreadyCompleted = Boolean(get().completedCodingTasks[taskId]);
      if (!alreadyCompleted) {
        const xpGain = taskId === "task-command-registry" ? 50 : 25;
        const nextCompleted = { ...get().completedCodingTasks, [taskId]: true };
        const tvTaskIds = CODING_TASKS.map((t) => t.id);
        const allTvCompleted = tvTaskIds.every((id) => nextCompleted[id]);
        const nextXp = get().xp + xpGain;

        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("iw_completed_tasks", JSON.stringify(nextCompleted));
            localStorage.setItem("iw_user_xp", String(nextXp));
          }
        } catch {
          // Safe catch
        }

        set((s) => ({
          completedCodingTasks: nextCompleted,
          xp: nextXp,
          isStationVictoryModalOpen: allTvCompleted ? true : s.isStationVictoryModalOpen,
        }));
        return true;
      }
      return false;
    },
    isCodingTaskCompleted: (taskId: string) => {
      return Boolean(get().completedCodingTasks[taskId]);
    },
    setMentorPhase: (phase) => set({ mentorPhase: phase }),
    setGuidedStep: (step) => set({ guidedStep: step }),
    triggerHint: () => {
      set({ isHintActive: true });
      setTimeout(() => {
        set({ isHintActive: false });
      }, 4000);
    },
    addXp: (amount) =>
      set((s) => {
        const nextXp = s.xp + amount;
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem("iw_user_xp", String(nextXp));
          }
        } catch {
          // Safe catch
        }
        return { xp: nextXp };
      }),

    // Code Gym Mastery Stars & Fintech Station
    taskMasteryStars: (() => {
      try {
        return typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("iw_mastery_stars") || "{}")
          : {};
      } catch {
        return {};
      }
    })(),
    setTaskMastery: (taskId: string, stars: number) => {
      const current = get().taskMasteryStars[taskId] || 0;
      const nextStars = Math.max(current, stars);
      const nextMap = { ...get().taskMasteryStars, [taskId]: nextStars };
      set({ taskMasteryStars: nextMap });
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("iw_mastery_stars", JSON.stringify(nextMap));
        }
      } catch {
        // Safe catch
      }
    },
    getTaskMastery: (taskId: string) => get().taskMasteryStars[taskId] || 0,

    currentStationId: "tv",
    setCurrentStationId: (id: string) => set({ currentStationId: id }),
    currentView: "HUB",
    setCurrentView: (view: "HUB" | "STATION") => set({ currentView: view }),

    isPosVictoryModalOpen: false,
    setPosVictoryModalOpen: (open: boolean) => set({ isPosVictoryModalOpen: open }),

    posState: {
      balance: 500.0,
      transactionAmount: 750.0,
      status: "IDLE",
      terminalId: "POS-MAIN-01",
      accountHolder: "Олена Коваль",
      totalAmount: 0.0,
      fee: 0.0,
      failedAttempts: 0,
      isLocked: false,
      pin: 1234,
      enteredPin: 1234,
      transactions: [120, 45, 300, 85],
      dailyTotal: 0.0,
      receiptLines: [],
      activeGateway: "DankortGateway",
      isGatewayRegistered: true,
      gatewayApproved: true,
    },
    applyPosExecution: (updates: Partial<VirtualPosState>) => {
      set((s) => ({
        posState: {
          ...s.posState,
          ...updates,
        },
      }));
    },
    resetPosState: (customState?: Partial<VirtualPosState>) => {
      set({
        posState: {
          balance: 500.0,
          transactionAmount: 750.0,
          status: "IDLE",
          terminalId: "POS-MAIN-01",
          accountHolder: "Олена Коваль",
          totalAmount: 0.0,
          fee: 0.0,
          failedAttempts: 0,
          isLocked: false,
          pin: 1234,
          enteredPin: 1234,
          transactions: [120, 45, 300, 85],
          dailyTotal: 0.0,
          receiptLines: [],
          activeGateway: "DankortGateway",
          isGatewayRegistered: true,
          gatewayApproved: true,
          ...customState,
        },
      });
    },
    resetLevelForPractice: () => {
      // Clear wire PowerCommand -> TVController
      const currentEdges = get().archEdges;
      const nonPowerEdges = currentEdges.filter(
        (e) => !(e.source === "node-power-cmd" || e.target === "node-tv-controller")
      );
      set({
        archEdges: nonPowerEdges,
        isArchitecturePowerWired: false,
        mentorPhase: "PRACTICE",
        isHintActive: false,
      });
    },
    completeLevel: () => {
      if (get().mentorPhase !== "COMPLETED") {
        set((s) => ({
          mentorPhase: "COMPLETED",
          xp: s.xp + 50,
          isArchitecturePowerWired: true,
        }));
      }
    },

    // 2e. Calculator State & Actions
    calcDisplay: "0",
    calcPrevValue: null,
    calcOperation: null,
    calcClearOnNext: false,

    calcInputDigit: (digit: number) => {
      set((s) => {
        let nextDisp = s.calcDisplay;
        if (s.calcClearOnNext || nextDisp === "0") {
          nextDisp = String(digit);
        } else {
          nextDisp = (nextDisp + digit).slice(0, 10);
        }
        return {
          calcDisplay: nextDisp,
          calcClearOnNext: false,
        };
      });
    },

    calcSetOperation: (op: "+" | "-") => {
      set((s) => {
        const curVal = parseFloat(s.calcDisplay) || 0;
        let prev = s.calcPrevValue;
        if (prev !== null && s.calcOperation && !s.calcClearOnNext) {
          prev = s.calcOperation === "+" ? prev + curVal : prev - curVal;
        } else {
          prev = curVal;
        }
        return {
          calcPrevValue: prev,
          calcDisplay: String(prev),
          calcOperation: op,
          calcClearOnNext: true,
        };
      });
    },

    calcEvaluate: () => {
      set((s) => {
        if (s.calcPrevValue === null || !s.calcOperation) {
          return {};
        }
        const curVal = parseFloat(s.calcDisplay) || 0;
        const result = s.calcOperation === "+" ? s.calcPrevValue + curVal : s.calcPrevValue - curVal;
        return {
          calcDisplay: String(result),
          calcPrevValue: null,
          calcOperation: null,
          calcClearOnNext: true,
        };
      });
    },

    calcClear: () => {
      set({
        calcDisplay: "0",
        calcPrevValue: null,
        calcOperation: null,
        calcClearOnNext: false,
      });
    },

    // 3. Physical IR Transmission Slice (Item 55)
    isIrEmitting: false,
    isBeamFlying: false,
    lastOpcode: "Готовий до прийому",

    // Code Playground Live Execution Action
    applyCodeExecution: (updates) => {
      set((state) => {
        const nextPower = updates.power !== undefined ? updates.power : state.power;
        const nextChannel = updates.channel !== undefined ? updates.channel : state.channel;
        const nextVolume = updates.volume !== undefined ? updates.volume : state.volume;
        const nextChannelNames = updates.label
          ? { ...state.channelNames, [nextChannel]: updates.label }
          : state.channelNames;
        const isDisplayBroken = state.isEdgeBroken("edge-mcu-display");

        let osd = updates.osdMessage;
        if (!osd) {
          if (updates.label) {
            osd = updates.label;
          } else if (nextPower !== state.power) {
            osd = nextPower ? "POWER ON" : "STANDBY";
          } else if (nextChannel !== state.channel) {
            osd = `CH ${nextChannel}`;
          } else if (nextVolume !== state.volume) {
            osd = `VOL ${nextVolume}`;
          } else {
            osd = state.osdMessage;
          }
        }

        let isPowerWired = state.isArchitecturePowerWired;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let nextArchEdges = state.archEdges as any[];

        if (osd === "CALC_MODE" || (osd && osd.includes("CALC"))) {
          isPowerWired = true;
          // Ensure edges contain power-command -> tv-controller
          const hasCmdEdge = nextArchEdges.some(
            (e) =>
              e.source?.includes("power-command") &&
              e.sourceHandle === "out-execute" &&
              e.target?.includes("tv-controller") &&
              e.targetHandle === "in-command-handler"
          );
          if (!hasCmdEdge) {
            nextArchEdges = [
              ...nextArchEdges,
              {
                id: "edge-power-to-tv-controller",
                source: "node-class-power-command",
                sourceHandle: "out-execute",
                target: "node-class-tv-controller",
                targetHandle: "in-command-handler",
                type: "architectureEdge",
                data: {
                  sourceLabel: "Execute",
                  targetLabel: "CommandHandler",
                  portType: "IRemoteCommand",
                  isHighlighted: true,
                  lastInvokedAt: Date.now(),
                },
              },
            ];
          }
        }

        return {
          power: nextPower,
          channel: nextChannel,
          volume: nextVolume,
          osdMessage: osd,
          channelNames: nextChannelNames,
          isArchitecturePowerWired: isPowerWired,
          archEdges: nextArchEdges,
          screenReactionPulse: nextPower,
          connections: {
            ...state.connections,
            DISPLAY_BUS: {
              ...state.connections.DISPLAY_BUS,
              voltage: nextPower && !isDisplayBroken ? "5V" : "0V",
              hasSignal: nextPower && !isDisplayBroken,
            },
          },
        };
      });

      // Reset phosphor reaction pulse after 400ms
      setTimeout(() => {
        set({ screenReactionPulse: false });
      }, 400);
    },

    // Core Physical IR Dispatcher with precise timings (Items 55, 56)
    dispatchRemoteCommand: (commandName, execute) => {
      // Clear any pending sequence timers
      if (flightTimer) clearTimeout(flightTimer);
      if (arrivalTimer) clearTimeout(arrivalTimer);
      if (reactionTimer) clearTimeout(reactionTimer);

      // STAGE 1 (T=0): Remote Button Click -> Emitter LED lights up + IR_DATA active
      audioFx.playRemoteBeep();
      set((state) => ({
        isIrEmitting: true,
        lastOpcode: commandName,
        connections: {
          ...state.connections,
          IR_DATA: {
            ...state.connections.IR_DATA,
            voltage: "5V",
            hasSignal: true,
          },
        },
      }));

      // STAGE 2 (T = BUTTON_PRESS_MS, 120ms): IR Beam takes flight across the line
      flightTimer = setTimeout(() => {
        set({ isBeamFlying: true });
      }, TIMINGS.BUTTON_PRESS_MS);

      // STAGE 3 (T = BUTTON_PRESS_MS + IR_BEAM_FLIGHT_MS, 320ms): Beam hits the TV photodiode
      arrivalTimer = setTimeout(() => {
        const state = get();
        const isIrMcuBroken = state.isEdgeBroken("edge-ir-mcu");
        const isPsuMcuBroken = state.isEdgeBroken("edge-psu-mcu");

        // Fault Injection Guard:
        // - If IR RX -> MCU is broken: TSOP detects light, but MCU interrupt never triggers!
        // - If PSU -> MCU is broken: MCU has no power, command is completely dropped!
        const { tvUpdates, connectionUpdates } =
          isIrMcuBroken || isPsuMcuBroken
            ? { tvUpdates: {}, connectionUpdates: undefined }
            : execute(state);

        if (tvUpdates?.power !== undefined) {
          audioFx.playRelayClick();
          if (tvUpdates.power) {
            audioFx.playCrtHum();
          }
        }

        // FSM Guard: Screen phosphor excitation (flare) ONLY occurs if TV is currently powered
        // or transitioning into powered state (PowerToggle ON)
        const willBePowered = tvUpdates?.power !== undefined ? tvUpdates.power : state.power;
        const shouldScreenReact =
          willBePowered && tvUpdates !== undefined && Object.keys(tvUpdates).length > 0;

        set({
          isIrEmitting: false,
          isBeamFlying: false,
          irSignalPulse: !state.isEdgeBroken("edge-psu-ir"), // TSOP receives if photodiode has power
          screenReactionPulse: shouldScreenReact,
          ...(isIrMcuBroken
            ? { lastOpcode: "Обрив IR RX -> MCU: команда не дійшла" }
            : isPsuMcuBroken
            ? { lastOpcode: "Обрив PSU -> MCU: процесор знеструмлений" }
            : {}),
          ...tvUpdates,
          ...(connectionUpdates
            ? {
                connections: {
                  ...state.connections,
                  ...(connectionUpdates.VCC ? { VCC: { ...state.connections.VCC, ...connectionUpdates.VCC } } : {}),
                  ...(connectionUpdates.GND ? { GND: { ...state.connections.GND, ...connectionUpdates.GND } } : {}),
                  ...(connectionUpdates.IR_DATA ? { IR_DATA: { ...state.connections.IR_DATA, ...connectionUpdates.IR_DATA } } : {}),
                  ...(connectionUpdates.DISPLAY_BUS ? { DISPLAY_BUS: { ...state.connections.DISPLAY_BUS, ...connectionUpdates.DISPLAY_BUS } } : {}),
                },
              }
            : {}),
        });

        // STAGE 4 (T = 320ms + SCREEN_REACTION_MS, 470ms): TV sensor & kinescope settle
        reactionTimer = setTimeout(() => {
          set((s) => ({
            irSignalPulse: false,
            screenReactionPulse: false,
            connections: {
              ...s.connections,
              IR_DATA: {
                ...s.connections.IR_DATA,
                voltage: "0V",
                hasSignal: false,
              },
            },
          }));
        }, TIMINGS.SCREEN_REACTION_MS);
      }, TIMINGS.BUTTON_PRESS_MS + TIMINGS.IR_BEAM_FLIGHT_MS);
    },

    // Remote Actions with strict FSM State Guards
    pressPower: () => {
      get().dispatchRemoteCommand("Живлення (Power)", (state) => {
        // Architecture Guard: Level 1 Wiring check
        if (!state.isArchitecturePowerWired) {
          return {
            tvUpdates: {
              osdMessage: "Архітектурна помилка: PowerCommand не зв'язано з TVController (вкладка Architecture)",
            },
          };
        }
        if (state.isEdgeBroken("edge-psu-mcu")) {
          return {
            tvUpdates: {
              power: false,
              osdMessage: "Помилка живлення: обрив лінії PSU -> MCU",
            },
          };
        }
        const nextPower = !state.power;
        const isDisplayBroken = state.isEdgeBroken("edge-mcu-display");
        return {
          tvUpdates: {
            power: nextPower,
            osdMessage: nextPower
              ? `Канал ${state.channel}: ${state.channelNames[state.channel]}`
              : "Телевізор у режимі очікування",
          },
          connectionUpdates: {
            DISPLAY_BUS: {
              voltage: nextPower && !isDisplayBroken ? "5V" : "0V",
              hasSignal: nextPower && !isDisplayBroken,
            },
          },
        };
      });
    },

    pressChannelUp: () => {
      if (get().osdMessage === "CALC_MODE") {
        get().dispatchRemoteCommand("CALC [=]", () => ({}));
        get().calcEvaluate();
        return;
      }
      get().dispatchRemoteCommand("Наступний канал", (state) => {
        // FSM Guard: If TV is unpowered, MCU ignores channel changes
        if (!state.power) {
          return {};
        }
        const nextChannel = state.channel >= state.maxChannels ? 1 : state.channel + 1;
        return {
          tvUpdates: {
            channel: nextChannel,
            osdMessage: `Канал ${nextChannel}: ${state.channelNames[nextChannel]}`,
          },
        };
      });
    },

    pressChannelDown: () => {
      if (get().osdMessage === "CALC_MODE") {
        get().dispatchRemoteCommand("CALC [C]", () => ({}));
        get().calcClear();
        return;
      }
      get().dispatchRemoteCommand("Попередній канал", (state) => {
        // FSM Guard: If TV is unpowered, MCU ignores channel changes
        if (!state.power) {
          return {};
        }
        const prevChannel = state.channel <= 1 ? state.maxChannels : state.channel - 1;
        return {
          tvUpdates: {
            channel: prevChannel,
            osdMessage: `Канал ${prevChannel}: ${state.channelNames[prevChannel]}`,
          },
        };
      });
    },

    pressSelectChannel: (targetChannel: number) => {
      if (get().osdMessage === "CALC_MODE") {
        get().dispatchRemoteCommand(`CALC [${targetChannel}]`, () => ({}));
        get().calcInputDigit(targetChannel);
        return;
      }
      get().dispatchRemoteCommand(`Канал ${targetChannel}`, (state) => {
        // FSM Guard: If TV is unpowered, MCU ignores channel keypad
        if (!state.power) {
          return {};
        }
        const ch = Math.max(1, Math.min(state.maxChannels, targetChannel));
        return {
          tvUpdates: {
            channel: ch,
            osdMessage: `Канал ${ch}: ${state.channelNames[ch]}`,
          },
        };
      });
    },

    pressVolumeUp: () => {
      if (get().osdMessage === "CALC_MODE") {
        get().dispatchRemoteCommand("CALC [+]", () => ({}));
        get().calcSetOperation("+");
        return;
      }
      get().dispatchRemoteCommand("Гучність +", (state) => {
        // FSM Guard: If TV is unpowered, volume amplifier remains off
        if (!state.power) {
          return {};
        }
        const nextVol = Math.min(100, state.volume + 5);
        return {
          tvUpdates: {
            volume: nextVol,
            isMuted: false,
            osdMessage: `Гучність: ${nextVol} / 100`,
          },
        };
      });
    },

    pressVolumeDown: () => {
      if (get().osdMessage === "CALC_MODE") {
        get().dispatchRemoteCommand("CALC [-]", () => ({}));
        get().calcSetOperation("-");
        return;
      }
      get().dispatchRemoteCommand("Гучність -", (state) => {
        // FSM Guard: If TV is unpowered, volume amplifier remains off
        if (!state.power) {
          return {};
        }
        const nextVol = Math.max(0, state.volume - 5);
        return {
          tvUpdates: {
            volume: nextVol,
            osdMessage: `Гучність: ${nextVol} / 100`,
          },
        };
      });
    },

    pressMuteToggle: () => {
      get().dispatchRemoteCommand("Вимкнути звук (Mute)", (state) => {
        // FSM Guard: If TV is unpowered, mute relay remains unchanged
        if (!state.power) {
          return {};
        }
        const nextMute = !state.isMuted;
        return {
          tvUpdates: {
            isMuted: nextMute,
            osdMessage: nextMute ? "Звук вимкнено" : `Гучність: ${state.volume} / 100`,
          },
        };
      });
    },

    // TV Chassis Buttons (Direct physical contact, no IR delay)
    chassisTogglePower: () => {
      get().togglePower();
    },

    chassisNextChannel: () => {
      get().nextChannel();
    },

    chassisPrevChannel: () => {
      get().prevChannel();
    },
  };
});

