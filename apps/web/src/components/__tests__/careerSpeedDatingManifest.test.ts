/**
 * @file apps/web/src/components/__tests__/careerSpeedDatingManifest.test.ts
 * @description Verifies that every targetStationId and targetTrack from ROLE_TASTER_REGISTRY exists in web trackManifest.
 */

import { describe, it, expect } from "vitest";
import { ROLE_TASTER_REGISTRY } from "@iw/sim-engine";
import {
  STATION_DIRECTORY,
  TRACK_SEQUENCES,
} from "../workbench/career/trackManifest";

describe("Career Speed-Dating & Track Manifest Cross-Package Integrity", () => {
  it("every targetStationId in ROLE_TASTER_REGISTRY is either null (coming soon) or registered in STATION_DIRECTORY", () => {
    for (const role of ROLE_TASTER_REGISTRY) {
      if (role.targetStationId !== null) {
        expect(
          STATION_DIRECTORY[role.targetStationId],
          `Station ${role.targetStationId} for role ${role.id} must exist in STATION_DIRECTORY`
        ).toBeDefined();
      } else {
        expect(
          role.isComingSoon,
          `Role ${role.id} with targetStationId = null must be marked as isComingSoon`
        ).toBe(true);
      }
    }
  });

  it("every targetTrack in ROLE_TASTER_REGISTRY is either explorer or a valid sequence in TRACK_SEQUENCES", () => {
    const validTracks = ["explorer", ...Object.keys(TRACK_SEQUENCES)];
    for (const role of ROLE_TASTER_REGISTRY) {
      expect(
        validTracks,
        `Track ${role.targetTrack} for role ${role.id} must exist in TRACK_SEQUENCES or be explorer`
      ).toContain(role.targetTrack);
    }
  });
});
