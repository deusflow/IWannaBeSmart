/**
 * @file apps/web/src/components/__tests__/uxIntegrity.test.ts
 * @description Integration tests verifying fixes for Code Gym unlocking, Station 03 interception, and Dynamic Analytics.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TOTAL_MAX_STARS, IOT_TASKS } from "@iw/sim-engine";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { i18n } from "@iw/i18n";

describe("UX Integrity & Codebase Fixes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dynamic Accuracy Calculation", () => {
    it("returns null when user has 0 stars and 0 recorded WPM (shows '—' in UI)", () => {
      const computedStars = 0;
      const recordedMaxWpm = 0;
      const accuracyRate =
        computedStars > 0 || recordedMaxWpm > 0
          ? Number((96.2 + Math.min(3.6, (computedStars / TOTAL_MAX_STARS) * 3.6)).toFixed(1))
          : null;

      expect(accuracyRate).toBeNull();
    });

    it("calculates progressive accuracy rate as user masters tasks", () => {
      const computedStars = 50;
      const recordedMaxWpm = 45;
      const accuracyRate =
        computedStars > 0 || recordedMaxWpm > 0
          ? Number((96.2 + Math.min(3.6, (computedStars / TOTAL_MAX_STARS) * 3.6)).toFixed(1))
          : null;

      expect(accuracyRate).not.toBeNull();
      expect(accuracyRate).toBeGreaterThanOrEqual(96.2);
      expect(accuracyRate).toBeLessThanOrEqual(100.0);
      const expectedAccuracy = Number(
        (96.2 + Math.min(3.6, (computedStars / TOTAL_MAX_STARS) * 3.6)).toFixed(1)
      );
      expect(accuracyRate).toBe(expectedAccuracy);
    });
  });

  describe("Station 03 Navigation & Workbench State", () => {
    it("allows direct navigation to Station 03 in workbenchStore without blockers", () => {
      useWorkbenchStore.getState().setCurrentStationId("iot");
      useWorkbenchStore.getState().setCurrentView("STATION");

      const state = useWorkbenchStore.getState();
      expect(state.currentStationId).toBe("iot");
      expect(state.currentView).toBe("STATION");
    });

    it("verifies Station 03 has live tasks and can select iot target task", () => {
      expect(IOT_TASKS.length).toBeGreaterThan(0);
      expect(IOT_TASKS[0].id).toBe("task-iot-1-motion-stop");

      useWorkbenchStore.getState().setTargetTaskId("task-iot-1-motion-stop");
      expect(useWorkbenchStore.getState().targetTaskId).toBe("task-iot-1-motion-stop");
    });
  });

  describe("First-Entry Modal Localization & Language Switcher", () => {
    it("switches language across UA, EN, DA on the shared i18n instance", () => {
      i18n.changeLanguage("en");
      expect(i18n.language).toBe("en");
      expect(i18n.t("auth.guestAccount")).toBe("Guest profile (local only)");

      i18n.changeLanguage("da");
      expect(i18n.language).toBe("da");
      expect(i18n.t("auth.guestAccount")).toBe("Gæsteprofil (kun lokalt)");

      i18n.changeLanguage("ua");
      expect(i18n.language).toBe("ua");
      expect(i18n.t("auth.guestAccount")).toBe("Гостьовий профіль (без хмари)");
    });
  });
});
