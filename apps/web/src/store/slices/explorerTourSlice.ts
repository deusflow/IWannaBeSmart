/**
 * @file apps/web/src/store/slices/explorerTourSlice.ts
 * @description Express Guided Tasting Route (Інженерний тест-драйв / Спробувати все).
 * Replaces passive 9-station choice paralysis with an active 3-step scaffolding tour:
 * Step 1: Backend & DI (Station 01 — TV & DI wire connection)
 * Step 2: AI & RAG (Station 09 — IBM RAG chunking & vector calculation)
 * Step 3: Cybersecurity (Station 10 — Google Cybersecurity firewall IP block)
 * Finale: Victory fanfare, verdict & career focus track selection.
 */

import type { StateCreator } from "zustand";
import type { WorkbenchStore, ExplorerTourSlice, CareerTrack } from "../types";
import { audioFx } from "../../utils/audioFx";

export const createExplorerTourSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  ExplorerTourSlice
> = (set, get) => ({
  isExplorerTourActive: false,
  explorerStep: 1,
  isTourStepModalOpen: false,
  isTourFinaleModalOpen: false,
  tourStepJustCompleted: null,

  startExplorerTour: () => {
    audioFx.playRelayClick();
    set({
      isExplorerTourActive: true,
      explorerStep: 1,
      isTourStepModalOpen: false,
      isTourFinaleModalOpen: false,
      tourStepJustCompleted: null,
      isCareerModalOpen: false,
      currentStationId: "tv",
      currentView: "STATION",
      power: false,
      isArchitecturePowerWired: false,
    });
  },

  completeExplorerStep: (step: 1 | 2 | 3) => {
    const { isExplorerTourActive, explorerStep, tourStepJustCompleted } = get();
    if (!isExplorerTourActive || explorerStep !== step) return;
    if (tourStepJustCompleted === step) return;

    if (step === 1) {
      audioFx.playRelayClick();
      set({
        power: true,
        isArchitecturePowerWired: true,
        tourStepJustCompleted: 1,
        isTourStepModalOpen: true,
      });
      setTimeout(() => {
        audioFx.playSuccessFanfare();
      }, 150);
    } else if (step === 2) {
      set({
        tourStepJustCompleted: 2,
        isTourStepModalOpen: true,
      });
      get().setRagChunkConfig(128, 32);
      if (!get().ragQueryInput) {
        get().setRagQueryInput("What is our enterprise SLA uptime and failover policy?");
        get().executeRagQueryAction("What is our enterprise SLA uptime and failover policy?");
      }
      audioFx.playSuccessFanfare();
    } else if (step === 3) {
      set({
        tourStepJustCompleted: 3,
        isTourStepModalOpen: false,
        isTourFinaleModalOpen: true,
      });
      get().executeContainmentAction("BLOCK_IP");
      audioFx.playSuccessFanfare();
    }
  },

  nextExplorerStep: () => {
    const currentStep = get().explorerStep;
    audioFx.playRelayClick();

    if (currentStep === 1) {
      set({
        explorerStep: 2,
        isTourStepModalOpen: false,
        tourStepJustCompleted: null,
        currentStationId: "rag",
        currentView: "STATION",
      });
      get().setRagActiveTabAction("chunking");
    } else if (currentStep === 2) {
      set({
        explorerStep: 3,
        isTourStepModalOpen: false,
        tourStepJustCompleted: null,
        currentStationId: "cyber",
        currentView: "STATION",
      });
      get().setCyberActiveTab("wireshark");
    }
  },

  finishExplorerTour: (selectedTrack: CareerTrack) => {
    audioFx.playSuccessFanfare();
    get().setUserTrack(selectedTrack);
    set({
      isExplorerTourActive: false,
      isTourFinaleModalOpen: false,
      isTourStepModalOpen: false,
      currentView: "HUB",
    });
  },

  exitExplorerTour: () => {
    audioFx.playRelayClick();
    get().setUserTrack("explorer");
    set({
      isExplorerTourActive: false,
      isTourStepModalOpen: false,
      isTourFinaleModalOpen: false,
      currentView: "HUB",
    });
  },

  setTourStepModalOpen: (open: boolean) => set({ isTourStepModalOpen: open }),
  setTourFinaleModalOpen: (open: boolean) => set({ isTourFinaleModalOpen: open }),
});
