/**
 * @file apps/web/src/store/slices/connectionsSlice.ts
 * @description Hardware test point connections slice
 */

import type { StateCreator } from "zustand";
import { i18n } from "@iw/i18n";
import type {
  WorkbenchStore,
  ConnectionsSlice,
  HardwarePointKey,
  HardwarePoint,
} from "../types";

export const createInitialConnections = (): Record<HardwarePointKey, HardwarePoint> => ({
  VCC: {
    id: "VCC",
    name: "VCC (+5V Power Rail)",
    voltage: "5V",
    hasSignal: true,
    nominalVoltage: "5.02 V",
    role: i18n.t("workbench.vccRole", "Головна шина живлення +5V (PSU)"),
    testPoint: i18n.t("workbench.vccTestPoint", "Контрольна точка: VCC (+5V)"),
  },
  GND: {
    id: "GND",
    name: "GND (Ground Plane)",
    voltage: "0V",
    hasSignal: true,
    nominalVoltage: "0.00 V",
    role: i18n.t("workbench.gndRole", "Опорний нульовий потенціал схеми"),
    testPoint: i18n.t("workbench.gndTestPoint", "Контрольна точка: GND (0V)"),
  },
  IR_DATA: {
    id: "IR_DATA",
    name: "IR_DATA (Pin 2 / TSOP)",
    voltage: "0V",
    hasSignal: false,
    nominalVoltage: "38 kHz demodulated",
    role: i18n.t("workbench.irDataRole", "Демодульований потік імпульсів фотоприймача"),
    testPoint: i18n.t("workbench.irDataTestPoint", "Контрольна точка: PIN 2 (INT0)"),
  },
  DISPLAY_BUS: {
    id: "DISPLAY_BUS",
    name: "DISPLAY_BUS (8-bit)",
    voltage: "0V",
    hasSignal: false,
    nominalVoltage: "15.625 kHz / 50 Hz",
    role: i18n.t("workbench.displayBusRole", "Шина кадрової розгортки та матриці дисплея"),
    testPoint: i18n.t("workbench.displayBusTestPoint", "Контрольна точка: H_SYNC"),
  },
});

export const createConnectionsSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  ConnectionsSlice
> = (set) => ({
  connections: createInitialConnections(),

  setConnectionSignal: (key: HardwarePointKey, voltage: "0V" | "5V", hasSignal: boolean) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [key]: {
          ...state.connections[key],
          voltage,
          hasSignal,
        },
      },
    }));
  },
});
