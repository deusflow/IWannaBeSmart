/**
 * @file apps/web/src/store/workbenchStore.ts
 * @description Centralized Zustand store for Interactive Workbench (Block F, Items 51–56)
 *
 * Implements:
 * - tvSlice: power, channel (1-based), volume (0..100), isMuted, osdMessage, irSignalPulse
 * - connectionsSlice: hardware test points (VCC, GND, IR_DATA, DISPLAY_BUS) with 0V/5V & hasSignal
 * - Physical IR packet pipeline: Button Press (120ms) -> Beam Flight (200ms) -> TV Sensor & Screen Reaction (150ms)
 */

import { create } from "zustand";

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
  isArchitecturePowerWired: boolean;
  setArchitecturePowerWired: (wired: boolean) => void;
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

  // Core physical pipeline dispatcher
  dispatchRemoteCommand: (
    commandName: string,
    execute: (state: TVStateSlice & ConnectionsSlice & CircuitSlice & ArchitectureSlice) => {
      tvUpdates?: Partial<TVStateSlice>;
      connectionUpdates?: Partial<Record<HardwarePointKey, Partial<HardwarePoint>>>;
    }
  ) => void;
}

export type WorkbenchStore = TVStateSlice &
  ConnectionsSlice &
  CircuitSlice &
  ArchitectureSlice &
  IRSigSlice &
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

    // 3. Physical IR Transmission Slice (Item 55)
    isIrEmitting: false,
    isBeamFlying: false,
    lastOpcode: "Готовий до прийому",

    // Core Physical IR Dispatcher with precise timings (Items 55, 56)
    dispatchRemoteCommand: (commandName, execute) => {
      // Clear any pending sequence timers
      if (flightTimer) clearTimeout(flightTimer);
      if (arrivalTimer) clearTimeout(arrivalTimer);
      if (reactionTimer) clearTimeout(reactionTimer);

      // STAGE 1 (T=0): Remote Button Click -> Emitter LED lights up + IR_DATA active
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

