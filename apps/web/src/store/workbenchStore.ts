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

  // TV Chassis Buttons (Immediate physical contact without IR delay)
  chassisTogglePower: () => void;
  chassisNextChannel: () => void;
  chassisPrevChannel: () => void;

  // Core physical pipeline dispatcher
  dispatchRemoteCommand: (
    commandName: string,
    execute: (state: TVStateSlice & ConnectionsSlice) => {
      tvUpdates?: Partial<TVStateSlice>;
      connectionUpdates?: Partial<Record<HardwarePointKey, Partial<HardwarePoint>>>;
    }
  ) => void;
}

export type WorkbenchStore = TVStateSlice & ConnectionsSlice & IRSigSlice & WorkbenchActions;

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
        const { tvUpdates, connectionUpdates } = execute(state);

        set({
          isIrEmitting: false,
          isBeamFlying: false,
          irSignalPulse: true,
          screenReactionPulse: true,
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

    // Remote Actions
    pressPower: () => {
      get().dispatchRemoteCommand("Живлення (Power)", (state) => {
        const nextPower = !state.power;
        return {
          tvUpdates: {
            power: nextPower,
            osdMessage: nextPower
              ? `Канал ${state.channel}: ${state.channelNames[state.channel]}`
              : "Телевізор у режимі очікування",
          },
          connectionUpdates: {
            DISPLAY_BUS: {
              voltage: nextPower ? "5V" : "0V",
              hasSignal: nextPower,
            },
          },
        };
      });
    },

    pressChannelUp: () => {
      get().dispatchRemoteCommand("Наступний канал", (state) => {
        if (!state.power) return {};
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
        if (!state.power) return {};
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
        if (!state.power) return {};
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
        if (!state.power) return {};
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
        if (!state.power) return {};
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
        if (!state.power) return {};
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
      set((state) => {
        const nextPower = !state.power;
        return {
          power: nextPower,
          osdMessage: nextPower
            ? `Канал ${state.channel}: ${state.channelNames[state.channel]}`
            : "Телевізор у режимі очікування",
          connections: {
            ...state.connections,
            DISPLAY_BUS: {
              ...state.connections.DISPLAY_BUS,
              voltage: nextPower ? "5V" : "0V",
              hasSignal: nextPower,
            },
          },
        };
      });
    },

    chassisNextChannel: () => {
      set((state) => {
        if (!state.power) return state;
        const nextChannel = state.channel >= state.maxChannels ? 1 : state.channel + 1;
        return {
          channel: nextChannel,
          osdMessage: `Канал ${nextChannel}: ${state.channelNames[nextChannel]}`,
        };
      });
    },

    chassisPrevChannel: () => {
      set((state) => {
        if (!state.power) return state;
        const prevChannel = state.channel <= 1 ? state.maxChannels : state.channel - 1;
        return {
          channel: prevChannel,
          osdMessage: `Канал ${prevChannel}: ${state.channelNames[prevChannel]}`,
        };
      });
    },
  };
});
