/**
 * @file apps/web/src/store/__tests__/explorerTour.test.ts
 * @description Unit tests for Express Guided Tasting Route (explorerTourSlice)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useWorkbenchStore } from "../workbenchStore";

const getStore = () => useWorkbenchStore.getState();

describe("explorerTourSlice (Express Guided Tasting Route)", () => {
  beforeEach(() => {
    const store = getStore();
    store.exitExplorerTour();
    if (store.power) {
      store.togglePower();
    }
    store.setArchitecturePowerWired(false);
  });

  it("should initialize with tour inactive", () => {
    const state = getStore();
    expect(state.isExplorerTourActive).toBe(false);
    expect(state.explorerStep).toBe(1);
    expect(state.isTourStepModalOpen).toBe(false);
    expect(state.isTourFinaleModalOpen).toBe(false);
  });

  it("should start explorer tour and navigate directly to Station 01 (TV & DI)", () => {
    getStore().startExplorerTour();

    const state = getStore();
    expect(state.isExplorerTourActive).toBe(true);
    expect(state.explorerStep).toBe(1);
    expect(state.currentStationId).toBe("tv");
    expect(state.currentView).toBe("STATION");
    expect(state.isCareerModalOpen).toBe(false);
    expect(state.isTourStepModalOpen).toBe(false);
    expect(state.isTourFinaleModalOpen).toBe(false);
  });

  describe("Step 1: Backend & DI (Station 01)", () => {
    it("should complete Step 1 when power circuit is closed", () => {
      getStore().startExplorerTour();
      expect(getStore().explorerStep).toBe(1);

      getStore().completeExplorerStep(1);

      const state = getStore();
      expect(state.power).toBe(true);
      expect(state.isArchitecturePowerWired).toBe(true);
      expect(state.tourStepJustCompleted).toBe(1);
      expect(state.isTourStepModalOpen).toBe(true);
    });

    it("should automatically complete Step 1 when architecture power wire is connected in canvas", () => {
      getStore().startExplorerTour();
      expect(getStore().isExplorerTourActive).toBe(true);
      expect(getStore().explorerStep).toBe(1);

      // Student connects the wire
      getStore().setArchitecturePowerWired(true);

      const state = getStore();
      expect(state.tourStepJustCompleted).toBe(1);
      expect(state.isTourStepModalOpen).toBe(true);
    });

    it("should progress from Step 1 to Step 2 (Station 09 IBM RAG)", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);

      getStore().nextExplorerStep();

      const state = getStore();
      expect(state.explorerStep).toBe(2);
      expect(state.isTourStepModalOpen).toBe(false);
      expect(state.currentStationId).toBe("rag");
      expect(state.currentView).toBe("STATION");
      expect(state.ragActiveTab).toBe("chunking");
    });
  });

  describe("Step 2: Artificial Intelligence & RAG (Station 09)", () => {
    it("should complete Step 2 and show transition modal", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();

      expect(getStore().explorerStep).toBe(2);

      getStore().completeExplorerStep(2);

      const state = getStore();
      expect(state.tourStepJustCompleted).toBe(2);
      expect(state.isTourStepModalOpen).toBe(true);
    });

    it("should automatically complete Step 2 when user adjusts chunk slider in RAG device", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();

      expect(getStore().explorerStep).toBe(2);

      // Student moves slider
      getStore().setRagChunkConfig(128, 32);

      const state = getStore();
      expect(state.tourStepJustCompleted).toBe(2);
      expect(state.isTourStepModalOpen).toBe(true);
    });

    it("should progress from Step 2 to Step 3 (Station 10 Google Cybersecurity)", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();
      getStore().completeExplorerStep(2);

      getStore().nextExplorerStep();

      const state = getStore();
      expect(state.explorerStep).toBe(3);
      expect(state.isTourStepModalOpen).toBe(false);
      expect(state.currentStationId).toBe("cyber");
      expect(state.currentView).toBe("STATION");
      expect(state.cyberActiveTab).toBe("wireshark");
    });
  });

  describe("Step 3: Cybersecurity (Station 10)", () => {
    it("should complete Step 3 and open finale modal", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();
      getStore().completeExplorerStep(2);
      getStore().nextExplorerStep();

      expect(getStore().explorerStep).toBe(3);

      getStore().completeExplorerStep(3);

      const state = getStore();
      expect(state.tourStepJustCompleted).toBe(3);
      expect(state.isTourStepModalOpen).toBe(false);
      expect(state.isTourFinaleModalOpen).toBe(true);
    });

    it("should automatically complete Step 3 when firewall IP block action is executed", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();
      getStore().completeExplorerStep(2);
      getStore().nextExplorerStep();

      expect(getStore().explorerStep).toBe(3);

      // Student clicks Block IP
      getStore().executeContainmentAction("BLOCK_IP");

      const state = getStore();
      expect(state.tourStepJustCompleted).toBe(3);
      expect(state.isTourFinaleModalOpen).toBe(true);
    });
  });

  describe("Finale: Verdict & Career Track Selection", () => {
    it("should activate Backend track on selection and return to Hub", () => {
      getStore().startExplorerTour();
      getStore().completeExplorerStep(1);
      getStore().nextExplorerStep();
      getStore().completeExplorerStep(2);
      getStore().nextExplorerStep();
      getStore().completeExplorerStep(3);

      expect(getStore().isTourFinaleModalOpen).toBe(true);

      getStore().finishExplorerTour("backend");

      const state = getStore();
      expect(state.userTrack).toBe("backend");
      expect(state.isExplorerTourActive).toBe(false);
      expect(state.isTourFinaleModalOpen).toBe(false);
      expect(state.currentView).toBe("HUB");
    });

    it("should activate AI track on selection", () => {
      getStore().startExplorerTour();
      getStore().finishExplorerTour("ai");

      const state = getStore();
      expect(state.userTrack).toBe("ai");
      expect(state.isExplorerTourActive).toBe(false);
      expect(state.currentView).toBe("HUB");
    });

    it("should activate Cybersecurity track on selection", () => {
      getStore().startExplorerTour();
      getStore().finishExplorerTour("security");

      const state = getStore();
      expect(state.userTrack).toBe("security");
      expect(state.isExplorerTourActive).toBe(false);
      expect(state.currentView).toBe("HUB");
    });

    it("should allow keeping free explorer mode", () => {
      getStore().startExplorerTour();
      getStore().finishExplorerTour("explorer");

      const state = getStore();
      expect(state.userTrack).toBe("explorer");
      expect(state.isExplorerTourActive).toBe(false);
      expect(state.currentView).toBe("HUB");
    });

    it("should gracefully exit tour when user clicks exit button", () => {
      getStore().startExplorerTour();
      expect(getStore().isExplorerTourActive).toBe(true);

      getStore().exitExplorerTour();

      const state = getStore();
      expect(state.isExplorerTourActive).toBe(false);
      expect(state.isTourStepModalOpen).toBe(false);
      expect(state.isTourFinaleModalOpen).toBe(false);
      expect(state.userTrack).toBe("explorer");
      expect(state.currentView).toBe("HUB");
    });
  });
});
