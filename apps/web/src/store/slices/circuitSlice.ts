/**
 * @file apps/web/src/store/slices/circuitSlice.ts
 * @description Circuit board hardware edge fault injection slice
 */

import type { StateCreator } from "zustand";
import { i18n } from "@iw/i18n";
import type {
  WorkbenchStore,
  CircuitSlice,
  CircuitEdgeId,
  CircuitEdgeState,
} from "../types";

export const createInitialCircuitEdges = (): Record<CircuitEdgeId, CircuitEdgeState> => ({
  "edge-psu-mcu": {
    id: "edge-psu-mcu",
    source: "node-psu",
    target: "node-mcu",
    label: "VCC (+5V)",
    signalType: i18n.t("workbench.sigMainPsu", "Головне живлення процесора"),
    isBroken: false,
  },
  "edge-psu-ir": {
    id: "edge-psu-ir",
    source: "node-psu",
    target: "node-ir",
    label: "VCC (+5V)",
    signalType: i18n.t("workbench.sigPsuIr", "Живлення фотоприймача"),
    isBroken: false,
  },
  "edge-ir-mcu": {
    id: "edge-ir-mcu",
    source: "node-ir",
    target: "node-mcu",
    label: "IR_DATA (INT0)",
    signalType: i18n.t("workbench.sigIrMcu", "Шина переривань декодера"),
    isBroken: false,
  },
  "edge-mcu-display": {
    id: "edge-mcu-display",
    source: "node-mcu",
    target: "node-display",
    label: "LVDS / Video Bus",
    signalType: i18n.t("workbench.sigMcuDisplay", "Кадрова розгортка та пікселі"),
    isBroken: false,
  },
  "edge-mcu-audio": {
    id: "edge-mcu-audio",
    source: "node-mcu",
    target: "node-audio",
    label: "Audio PWM",
    signalType: i18n.t("workbench.sigMcuAudio", "Шина звукового тракту"),
    isBroken: false,
  },
  "edge-mcu-led": {
    id: "edge-mcu-led",
    source: "node-mcu",
    target: "node-led",
    label: "GPIO Status",
    signalType: i18n.t("workbench.sigMcuLed", "Індикатор чергового режиму"),
    isBroken: false,
  },
  "edge-mcu-eeprom": {
    id: "edge-mcu-eeprom",
    source: "node-mcu",
    target: "node-eeprom",
    label: "I2C (SDA/SCL)",
    signalType: i18n.t("workbench.sigMcuEeprom", "Енергонезалежна пам'ять"),
    isBroken: false,
  },
});

export const createCircuitSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  CircuitSlice
> = (set, get) => ({
  circuitEdges: createInitialCircuitEdges(),

  isEdgeBroken: (edgeId: CircuitEdgeId) => {
    return Boolean(get().circuitEdges[edgeId]?.isBroken);
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
          osdMessage: i18n.t("workbench.powerErrorPsuMcu", "Помилка живлення: обрив лінії PSU -> MCU"),
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
          osdMessage: i18n.t("workbench.tvStandby", "Телевізор у режимі очікування"),
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
        ? i18n.t("workbench.channelInfo", {
            channel: state.channel,
            name: state.channelNames[state.channel],
            defaultValue: `Канал ${state.channel}: ${state.channelNames[state.channel]}`,
          })
        : i18n.t("workbench.tvStandby", "Телевізор у режимі очікування"),
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
});
