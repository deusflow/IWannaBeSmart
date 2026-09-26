/**
 * @file apps/web/src/components/workbench/career/__tests__/trackManifest.test.ts
 * @description Unit tests for trackManifest sequences, getNextStationInTrack, and getTrackCompletionStats
 */

import { describe, it, expect } from "vitest";
import {
  TRACK_SEQUENCES,
  ALL_STATIONS_SEQUENCE,
  STATION_DIRECTORY,
  getNextStationInTrack,
  getTrackCompletionStats,
} from "../trackManifest";

describe("trackManifest Registry", () => {
  it("enforces strict sequences for all career tracks", () => {
    expect(TRACK_SEQUENCES.backend).toEqual(["tv", "pos", "iot", "api", "git"]);
    expect(TRACK_SEQUENCES.ai).toEqual(["vertex", "fde", "rag"]);
    expect(TRACK_SEQUENCES.security).toEqual(["bandit", "cyber"]);
  });

  it("contains valid metadata for all stations in directory", () => {
    for (const stationId of ALL_STATIONS_SEQUENCE) {
      const meta = STATION_DIRECTORY[stationId];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(stationId);
      expect(meta.titleKey).toBeTruthy();
      expect(meta.shortName).toBeTruthy();
      expect(meta.icon).toBeTruthy();
    }
  });
});

describe("getNextStationInTrack", () => {
  describe("Backend Track Sequence: tv -> pos -> iot -> api -> git", () => {
    it("transitions from tv to pos", () => {
      const res = getNextStationInTrack("tv", "backend");
      expect(res.nextStationId).toBe("pos");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(20);
      expect(res.nextStationShortName).toBe("POS Terminal");
    });

    it("transitions from pos to iot", () => {
      const res = getNextStationInTrack("pos", "backend");
      expect(res.nextStationId).toBe("iot");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(40);
      expect(res.nextStationShortName).toBe("IoT Gate");
    });

    it("transitions from iot to api", () => {
      const res = getNextStationInTrack("iot", "backend");
      expect(res.nextStationId).toBe("api");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(60);
      expect(res.nextStationShortName).toBe("API Forge");
    });

    it("transitions from api to git", () => {
      const res = getNextStationInTrack("api", "backend");
      expect(res.nextStationId).toBe("git");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(80);
      expect(res.nextStationShortName).toBe("Git Time Machine");
    });

    it("marks git as the last station in backend track", () => {
      const res = getNextStationInTrack("git", "backend");
      expect(res.nextStationId).toBeNull();
      expect(res.isLast).toBe(true);
      expect(res.progressPercent).toBe(100);
    });
  });

  describe("AI Track Sequence: vertex -> fde -> rag", () => {
    it("transitions from vertex to fde", () => {
      const res = getNextStationInTrack("vertex", "ai");
      expect(res.nextStationId).toBe("fde");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(33);
      expect(res.nextStationShortName).toBe("Field AI Deployer");
    });

    it("transitions from fde to rag", () => {
      const res = getNextStationInTrack("fde", "ai");
      expect(res.nextStationId).toBe("rag");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(67);
      expect(res.nextStationShortName).toBe("IBM RAG");
    });

    it("marks rag as the last station in ai track", () => {
      const res = getNextStationInTrack("rag", "ai");
      expect(res.nextStationId).toBeNull();
      expect(res.isLast).toBe(true);
      expect(res.progressPercent).toBe(100);
    });
  });

  describe("Security Track Sequence: bandit -> cyber", () => {
    it("transitions from bandit to cyber", () => {
      const res = getNextStationInTrack("bandit", "security");
      expect(res.nextStationId).toBe("cyber");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(50);
      expect(res.nextStationShortName).toBe("Google Cybersecurity");
    });

    it("marks cyber as the last station in security track", () => {
      const res = getNextStationInTrack("cyber", "security");
      expect(res.nextStationId).toBeNull();
      expect(res.isLast).toBe(true);
      expect(res.progressPercent).toBe(100);
    });
  });

  describe("Explorer and Unregistered Stations", () => {
    it("falls back to ALL_STATIONS_SEQUENCE when track is explorer or null", () => {
      const res = getNextStationInTrack("tv", "explorer");
      expect(res.nextStationId).toBe("pos");
      expect(res.totalStations).toBe(ALL_STATIONS_SEQUENCE.length);
    });

    it("guides user to the first station of the track if current station is not in sequence", () => {
      const res = getNextStationInTrack("vertex", "backend");
      expect(res.nextStationId).toBe("tv");
      expect(res.isLast).toBe(false);
      expect(res.progressPercent).toBe(0);
    });
  });
});

describe("getTrackCompletionStats", () => {
  it("calculates progress correctly for backend track", () => {
    const completedSet = new Set(["tv", "pos"]);
    const isCompleted = (id: string) => completedSet.has(id);

    const stats = getTrackCompletionStats("backend", isCompleted);
    expect(stats.completedCount).toBe(2);
    expect(stats.totalCount).toBe(5);
    expect(stats.percent).toBe(40);
    expect(stats.stationIds).toEqual(["tv", "pos", "iot", "api", "git"]);
  });

  it("handles 100% completion", () => {
    const isCompleted = () => true;
    const stats = getTrackCompletionStats("security", isCompleted);
    expect(stats.completedCount).toBe(2);
    expect(stats.totalCount).toBe(2);
    expect(stats.percent).toBe(100);
  });

  it("handles 0% completion", () => {
    const isCompleted = () => false;
    const stats = getTrackCompletionStats("ai", isCompleted);
    expect(stats.completedCount).toBe(0);
    expect(stats.totalCount).toBe(3);
    expect(stats.percent).toBe(0);
  });
});
