/**
 * @file apps/web/src/store/slices/tvSlice.ts
 * @description Virtual TV core state slice (power, channels, volume, OSD)
 */

import type { StateCreator } from "zustand";
import { i18n } from "@iw/i18n";
import { audioFx } from "../../utils/audioFx";
import type {
  WorkbenchStore,
  TVStateSlice,
} from "../types";

export const createTvSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  TVStateSlice & {
    chassisTogglePower: () => void;
    chassisNextChannel: () => void;
    chassisPrevChannel: () => void;
    applyCodeExecution: (updates: {
      power?: boolean;
      channel?: number;
      volume?: number;
      osdMessage?: string;
      label?: string;
    }) => void;
  }
> = (set, get) => ({
  power: false,
  channel: 1,
  maxChannels: 4,
  channelNames: {
    1: "Boot Kernel",
    2: "Transaction Feed",
    3: "Event Bus",
    4: "Memory Buffer",
  },
  volume: 45,
  isMuted: false,
  osdMessage: i18n.t("workbench.tvStandby", "Телевізор у режимі очікування"),
  irSignalPulse: false,
  screenReactionPulse: false,

  setVolume: (vol: number) => {
    if (!get().power) return;
    const nextVol = Math.max(0, Math.min(100, vol));
    set({
      volume: nextVol,
      isMuted: false,
      osdMessage: i18n.t("workbench.volumeLevel", {
        volume: nextVol,
        defaultValue: `Гучність: ${nextVol} / 100`,
      }),
    });
  },

  changeVolume: (delta: number) => {
    if (!get().power) return;
    const nextVol = Math.max(0, Math.min(100, get().volume + delta));
    set({
      volume: nextVol,
      isMuted: false,
      osdMessage: i18n.t("workbench.volumeLevel", {
        volume: nextVol,
        defaultValue: `Гучність: ${nextVol} / 100`,
      }),
    });
  },

  setChannel: (targetChannel: number) => {
    if (!get().power) return;
    const state = get();
    const ch = Math.max(1, Math.min(state.maxChannels, targetChannel));
    set({
      channel: ch,
      osdMessage: i18n.t("workbench.channelInfo", {
        channel: ch,
        name: state.channelNames[ch],
        defaultValue: `Канал ${ch}: ${state.channelNames[ch]}`,
      }),
    });
  },

  nextChannel: () => {
    if (!get().power) return;
    const state = get();
    const next = state.channel >= state.maxChannels ? 1 : state.channel + 1;
    set({
      channel: next,
      osdMessage: i18n.t("workbench.channelInfo", {
        channel: next,
        name: state.channelNames[next],
        defaultValue: `Канал ${next}: ${state.channelNames[next]}`,
      }),
    });
  },

  prevChannel: () => {
    if (!get().power) return;
    const state = get();
    const prev = state.channel <= 1 ? state.maxChannels : state.channel - 1;
    set({
      channel: prev,
      osdMessage: i18n.t("workbench.channelInfo", {
        channel: prev,
        name: state.channelNames[prev],
        defaultValue: `Канал ${prev}: ${state.channelNames[prev]}`,
      }),
    });
  },

  toggleMute: () => {
    if (!get().power) return;
    const state = get();
    const nextMute = !state.isMuted;
    set({
      isMuted: nextMute,
      osdMessage: nextMute
        ? i18n.t("workbench.soundMuted", "Звук вимкнено")
        : i18n.t("workbench.volumeLevel", {
            volume: state.volume,
            defaultValue: `Гучність: ${state.volume} / 100`,
          }),
    });
  },

  togglePower: () => {
    audioFx.playRelayClick();
    // Hardware fault guard: If PSU -> MCU is broken, MCU has no VCC power rail!
    if (get().isEdgeBroken("edge-psu-mcu")) {
      set({
        power: false,
        osdMessage: i18n.t("workbench.powerErrorPsuMcu", "Помилка живлення: обрив лінії PSU -> MCU"),
      });
      return;
    }
    // Architecture fault guard: If IRemoteCommand/DI is broken or bypassed
    if (get().isTraceBroken) {
      set({
        power: false,
        osdMessage:
          get().traceFaultReason ||
          i18n.t("workbench.traceErrorNullRef", "Помилка ланцюга: IRemoteCommand має розрив (NullReference)"),
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
        ? i18n.t("workbench.channelInfo", {
            channel: state.channel,
            name: state.channelNames[state.channel],
            defaultValue: `Канал ${state.channel}: ${state.channelNames[state.channel]}`,
          })
        : i18n.t("workbench.tvStandby", "Телевізор у режимі очікування"),
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

  chassisTogglePower: () => {
    get().togglePower();
  },

  chassisNextChannel: () => {
    get().nextChannel();
  },

  chassisPrevChannel: () => {
    get().prevChannel();
  },

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

    setTimeout(() => {
      set({ screenReactionPulse: false });
    }, 400);
  },
});
