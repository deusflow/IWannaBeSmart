/**
 * @file apps/web/src/store/slices/calculatorSlice.ts
 * @description Virtual TV embedded calculator slice
 */

import type { StateCreator } from "zustand";
import type {
  WorkbenchStore,
  CalculatorSlice,
} from "../types";

export const createCalculatorSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  CalculatorSlice
> = (set) => ({
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
});
