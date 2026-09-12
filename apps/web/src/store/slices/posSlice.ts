/**
 * @file apps/web/src/store/slices/posSlice.ts
 * @description Fintech POS terminal simulation slice
 */

import type { StateCreator } from "zustand";
import type { VirtualPosState } from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type {
  WorkbenchStore,
  PosSlice,
} from "../types";

export const createPosSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  PosSlice
> = (set, get) => ({
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

  posManualPin: "",
  posIsCardInserted: false,

  posKeypadInput: (key: string) => {
    const state = get();
    if (state.posState.isLocked || state.posState.status === "BLOCKED") {
      audioFx.playErrorBuzz();
      return;
    }

    if (key === "CLR") {
      audioFx.playRelayClick();
      set({ posManualPin: "" });
      return;
    }

    if (key === "CNCL") {
      audioFx.playRelayClick();
      set({
        posManualPin: "",
        posIsCardInserted: false,
        posState: { ...state.posState, status: "IDLE" },
      });
      return;
    }

    if (key === "ENTR") {
      if (state.posManualPin.length === 0) {
        audioFx.playErrorBuzz();
        return;
      }
      audioFx.playRelayClick();
      const enteredNumber = parseInt(state.posManualPin, 10);
      if (enteredNumber === state.posState.pin) {
        if (state.posState.balance >= state.posState.transactionAmount) {
          audioFx.playSuccessFanfare();
          set({
            posManualPin: "",
            posState: {
              ...state.posState,
              status: "APPROVED",
              failedAttempts: 0,
              enteredPin: enteredNumber,
            },
          });
        } else {
          audioFx.playErrorBuzz();
          set({
            posManualPin: "",
            posState: {
              ...state.posState,
              status: "DECLINED",
              failedAttempts: 0,
              enteredPin: enteredNumber,
            },
          });
        }
      } else {
        audioFx.playErrorBuzz();
        const nextAttempts = (state.posState.failedAttempts || 0) + 1;
        if (nextAttempts >= 3) {
          audioFx.playAlarmSound();
          set({
            posManualPin: "",
            posState: {
              ...state.posState,
              status: "BLOCKED",
              isLocked: true,
              failedAttempts: nextAttempts,
            },
          });
        } else {
          set({
            posManualPin: "",
            posState: {
              ...state.posState,
              failedAttempts: nextAttempts,
            },
          });
        }
      }
      return;
    }

    if (key >= "0" && key <= "9") {
      if (state.posManualPin.length < 4) {
        audioFx.playKeyClick();
        set({ posManualPin: state.posManualPin + key });
      }
    }
  },

  posTapNfc: () => {
    const state = get();
    if (state.posState.isLocked || state.posState.status === "BLOCKED") {
      audioFx.playErrorBuzz();
      return;
    }
    audioFx.playRelayClick();
    if (state.posState.transactionAmount <= 500) {
      if (state.posState.balance >= state.posState.transactionAmount) {
        audioFx.playSuccessFanfare();
        set({
          posState: { ...state.posState, status: "APPROVED" },
        });
      } else {
        audioFx.playErrorBuzz();
        set({
          posState: { ...state.posState, status: "DECLINED" },
        });
      }
    } else {
      audioFx.playRemoteBeep();
      set({
        posState: { ...state.posState, status: "IDLE" },
      });
    }
  },

  posInsertChip: () => {
    const state = get();
    if (state.posState.isLocked || state.posState.status === "BLOCKED") {
      audioFx.playErrorBuzz();
      return;
    }
    audioFx.playRelayClick();
    set({
      posIsCardInserted: true,
      posManualPin: "",
    });
  },

  posEjectCard: () => {
    audioFx.playRelayClick();
    set({
      posIsCardInserted: false,
      posManualPin: "",
    });
  },

  resetPosState: (customState?: Partial<VirtualPosState>) => {
    set({
      posManualPin: "",
      posIsCardInserted: false,
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
});
