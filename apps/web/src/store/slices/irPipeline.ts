/**
 * @file apps/web/src/store/slices/irPipeline.ts
 * @description Physical IR packet pipeline and remote control button dispatchers
 */

import type { StateCreator } from "zustand";
import { i18n } from "@iw/i18n";
import { audioFx } from "../../utils/audioFx";
import {
  TIMINGS,
  type WorkbenchStore,
  type IRSigSlice,
  type WorkbenchActions,
  type TVStateSlice,
  type ConnectionsSlice,
  type CircuitSlice,
  type ArchitectureSlice,
  type HardwarePointKey,
  type HardwarePoint,
} from "../types";

let flightTimer: ReturnType<typeof setTimeout> | null = null;
let arrivalTimer: ReturnType<typeof setTimeout> | null = null;
let reactionTimer: ReturnType<typeof setTimeout> | null = null;

export const createIrPipelineSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  IRSigSlice & Pick<
    WorkbenchActions,
    | "dispatchRemoteCommand"
    | "pressPower"
    | "pressChannelUp"
    | "pressChannelDown"
    | "pressSelectChannel"
    | "pressVolumeUp"
    | "pressVolumeDown"
    | "pressMuteToggle"
  >
> = (set, get) => ({
  isIrEmitting: false,
  isBeamFlying: false,
  lastOpcode: i18n.t("workbench.readyToReceive", "Готовий до прийому"),

  dispatchRemoteCommand: (
    commandName: string,
    execute: (state: TVStateSlice & ConnectionsSlice & CircuitSlice & ArchitectureSlice) => {
      tvUpdates?: Partial<TVStateSlice>;
      connectionUpdates?: Partial<Record<HardwarePointKey, Partial<HardwarePoint>>>;
    }
  ) => {
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
          ? { lastOpcode: i18n.t("workbench.irRxMcuBreak", "Обрив IR RX -> MCU: команда не дійшла") }
          : isPsuMcuBroken
          ? { lastOpcode: i18n.t("workbench.psuMcuBreak", "Обрив PSU -> MCU: процесор знеструмлений") }
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

  pressPower: () => {
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdPower", "Живлення (Power)"),
      (state) => {
      // Architecture Guard: Level 1 Wiring check
      if (!state.isArchitecturePowerWired) {
        return {
          tvUpdates: {
            osdMessage: i18n.t(
              "workbench.archErrorUnwired",
              "Архітектурна помилка: PowerCommand не зв'язано з TVController (вкладка Architecture)"
            ),
          },
        };
      }
      if (state.isEdgeBroken("edge-psu-mcu")) {
        return {
          tvUpdates: {
            power: false,
            osdMessage: i18n.t("workbench.powerErrorPsuMcu", "Помилка живлення: обрив лінії PSU -> MCU"),
          },
        };
      }
      const nextPower = !state.power;
      const isDisplayBroken = state.isEdgeBroken("edge-mcu-display");
      return {
        tvUpdates: {
          power: nextPower,
          osdMessage: nextPower
            ? i18n.t("workbench.channelInfo", {
                channel: state.channel,
                name: state.channelNames[state.channel],
                defaultValue: `Канал ${state.channel}: ${state.channelNames[state.channel]}`,
              })
            : i18n.t("workbench.tvStandby", "Телевізор у режимі очікування"),
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
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdNextChannel", "Наступний канал"),
      (state) => {
      // FSM Guard: If TV is unpowered, MCU ignores channel changes
      if (!state.power) {
        return {};
      }
      const nextChannel = state.channel >= state.maxChannels ? 1 : state.channel + 1;
      return {
        tvUpdates: {
          channel: nextChannel,
          osdMessage: i18n.t("workbench.channelInfo", {
            channel: nextChannel,
            name: state.channelNames[nextChannel],
            defaultValue: `Канал ${nextChannel}: ${state.channelNames[nextChannel]}`,
          }),
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
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdPrevChannel", "Попередній канал"),
      (state) => {
      // FSM Guard: If TV is unpowered, MCU ignores channel changes
      if (!state.power) {
        return {};
      }
      const prevChannel = state.channel <= 1 ? state.maxChannels : state.channel - 1;
      return {
        tvUpdates: {
          channel: prevChannel,
          osdMessage: i18n.t("workbench.channelInfo", {
            channel: prevChannel,
            name: state.channelNames[prevChannel],
            defaultValue: `Канал ${prevChannel}: ${state.channelNames[prevChannel]}`,
          }),
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
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdSelectChannel", {
        channel: targetChannel,
        defaultValue: `Канал ${targetChannel}`,
      }),
      (state) => {
      // FSM Guard: If TV is unpowered, MCU ignores channel keypad
      if (!state.power) {
        return {};
      }
      const ch = Math.max(1, Math.min(state.maxChannels, targetChannel));
      return {
        tvUpdates: {
          channel: ch,
          osdMessage: i18n.t("workbench.channelInfo", {
            channel: ch,
            name: state.channelNames[ch],
            defaultValue: `Канал ${ch}: ${state.channelNames[ch]}`,
          }),
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
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdVolUp", "Гучність +"),
      (state) => {
      // FSM Guard: If TV is unpowered, volume amplifier remains off
      if (!state.power) {
        return {};
      }
      const nextVol = Math.min(100, state.volume + 5);
      return {
        tvUpdates: {
          volume: nextVol,
          isMuted: false,
          osdMessage: i18n.t("workbench.volumeLevel", {
            volume: nextVol,
            defaultValue: `Гучність: ${nextVol} / 100`,
          }),
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
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdVolDown", "Гучність -"),
      (state) => {
      // FSM Guard: If TV is unpowered, volume amplifier remains off
      if (!state.power) {
        return {};
      }
      const nextVol = Math.max(0, state.volume - 5);
      return {
        tvUpdates: {
          volume: nextVol,
          osdMessage: i18n.t("workbench.volumeLevel", {
            volume: nextVol,
            defaultValue: `Гучність: ${nextVol} / 100`,
          }),
        },
      };
    });
  },

  pressMuteToggle: () => {
    get().dispatchRemoteCommand(
      i18n.t("workbench.cmdMute", "Вимкнути звук (Mute)"),
      (state) => {
      // FSM Guard: If TV is unpowered, mute relay remains unchanged
      if (!state.power) {
        return {};
      }
      const nextMute = !state.isMuted;
      return {
        tvUpdates: {
          isMuted: nextMute,
          osdMessage: nextMute
            ? i18n.t("workbench.soundMuted", "Звук вимкнено")
            : i18n.t("workbench.volumeLevel", {
                volume: state.volume,
                defaultValue: `Гучність: ${state.volume} / 100`,
              }),
        },
      };
    });
  },
});
