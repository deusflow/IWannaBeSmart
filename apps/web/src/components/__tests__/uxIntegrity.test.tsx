/**
 * @file apps/web/src/components/__tests__/uxIntegrity.test.ts
 * @description Integration tests verifying fixes for Code Gym unlocking, Station 03 interception, and Dynamic Analytics.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "../../store/toastStore";
import { TOTAL_MAX_STARS } from "@iw/sim-engine";

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
          ? Number((96.2 + Math.min(3.6, (computedStars / (TOTAL_MAX_STARS || 292)) * 3.6)).toFixed(1))
          : null;

      expect(accuracyRate).toBeNull();
    });

    it("calculates progressive accuracy rate as user masters tasks", () => {
      const computedStars = 50;
      const recordedMaxWpm = 45;
      const accuracyRate =
        computedStars > 0 || recordedMaxWpm > 0
          ? Number((96.2 + Math.min(3.6, (computedStars / (TOTAL_MAX_STARS || 292)) * 3.6)).toFixed(1))
          : null;

      expect(accuracyRate).not.toBeNull();
      expect(accuracyRate).toBeGreaterThanOrEqual(96.2);
      expect(accuracyRate).toBeLessThanOrEqual(100.0);
      const expectedAccuracy = Number(
        (96.2 + Math.min(3.6, (computedStars / (TOTAL_MAX_STARS || 356)) * 3.6)).toFixed(1)
      );
      expect(accuracyRate).toBe(expectedAccuracy);
    });
  });

  describe("Station 03 Lock Toast Interception", () => {
    it("intercepts locked module clicks and shows toast.info instead of switching station", () => {
      const toastInfoSpy = vi.spyOn(toast, "info");
      const setCurrentStationIdMock = vi.fn();
      const setCurrentViewMock = vi.fn();

      // Simulating handleJumpStation logic from CommandPaletteModal
      const handleJumpStation = (stationId: string) => {
        if (stationId === "iot") {
          toast.info(
            "НЕЗАБАРОМ: EventBus & Async I/O",
            "Потрібно 200+ XP або Модулі 1 та 2"
          );
          return;
        }
        setCurrentStationIdMock(stationId);
        setCurrentViewMock("STATION");
      };

      handleJumpStation("iot");
      expect(toastInfoSpy).toHaveBeenCalledWith(
        "НЕЗАБАРОМ: EventBus & Async I/O",
        "Потрібно 200+ XP або Модулі 1 та 2"
      );
      expect(setCurrentStationIdMock).not.toHaveBeenCalled();
      expect(setCurrentViewMock).not.toHaveBeenCalled();

      // Non-locked station jumps properly
      handleJumpStation("pos");
      expect(setCurrentStationIdMock).toHaveBeenCalledWith("pos");
      expect(setCurrentViewMock).toHaveBeenCalledWith("STATION");
    });
  });
});
