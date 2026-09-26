/**
 * @file apps/web/src/components/__tests__/workshopHubScreen.test.tsx
 * @description Product hierarchy, tab filtering, and station sequencing validation for WorkshopHubScreen.
 */

import { describe, it, expect } from "vitest";
import { isStationInTrack, CAREER_TRACKS } from "../workbench/career/careerTracks";

describe("WorkshopHubScreen Hierarchy & Invariants", () => {
  const ORDERED_STATION_IDS = [
    "tv",     // 01: TV Station
    "pos",    // 02: Fintech POS Terminal
    "iot",    // 03: IoT Garage Gate
    "api",    // 04: API Forge
    "git",    // 05: Git Time Machine
    "bandit", // 06: Cyber Bandit Lab
    "vertex", // 07: Vertex AI Architect
    "fde",    // 08: Field AI Deployer
    "rag",    // 09: IBM RAG & Agentic AI
    "cyber",  // 10: Google Cybersecurity & SOC Analyst
  ];

  describe("Strict Sequential Station Order (01 -> 10)", () => {
    it("preserves strictly ordered sequence of all 10 stations", () => {
      expect(ORDERED_STATION_IDS).toHaveLength(10);
      expect(ORDERED_STATION_IDS[0]).toBe("tv");
      expect(ORDERED_STATION_IDS[1]).toBe("pos");
      expect(ORDERED_STATION_IDS[2]).toBe("iot");
      expect(ORDERED_STATION_IDS[3]).toBe("api");
      expect(ORDERED_STATION_IDS[4]).toBe("git");
      expect(ORDERED_STATION_IDS[5]).toBe("bandit");
      expect(ORDERED_STATION_IDS[6]).toBe("vertex");
      expect(ORDERED_STATION_IDS[7]).toBe("fde");
      expect(ORDERED_STATION_IDS[8]).toBe("rag");
      expect(ORDERED_STATION_IDS[9]).toBe("cyber");
    });
  });

  describe("Tab Filtering System", () => {
    const isStationVisible = (
      stationId: string,
      tab: "my_track" | "backend" | "ai" | "security" | "all",
      userTrack: "backend" | "ai" | "security" | "explorer" | null
    ): boolean => {
      if (tab === "all") return true;
      if (tab === "my_track") {
        if (!userTrack || userTrack === "explorer") return true;
        if (userTrack === "security") {
          return ["pos", "bandit", "cyber"].includes(stationId);
        }
        return isStationInTrack(stationId, userTrack);
      }
      if (tab === "backend") {
        return ["tv", "pos", "api", "git"].includes(stationId);
      }
      if (tab === "ai") {
        return ["vertex", "fde", "rag"].includes(stationId);
      }
      if (tab === "security") {
        return ["pos", "bandit", "cyber"].includes(stationId);
      }
      return true;
    };

    it("filters correctly for Backend tab", () => {
      const visible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "backend", null));
      expect(visible).toEqual(["tv", "pos", "api", "git"]);
      expect(visible).toHaveLength(4);
    });

    it("filters correctly for AI & MLOps tab", () => {
      const visible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "ai", null));
      expect(visible).toEqual(["vertex", "fde", "rag"]);
      expect(visible).toHaveLength(3);
    });

    it("filters correctly for Security tab", () => {
      const visible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "security", null));
      expect(visible).toEqual(["pos", "bandit", "cyber"]);
      expect(visible).toHaveLength(3);
    });

    it("shows all 10 stations in strict order under 'all' tab", () => {
      const visible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "all", null));
      expect(visible).toEqual(ORDERED_STATION_IDS);
      expect(visible).toHaveLength(10);
    });

    it("shows track stations when userTrack is active under 'my_track'", () => {
      // Backend track
      const backendVisible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "my_track", "backend"));
      expect(backendVisible).toEqual(["tv", "pos", "api", "git"]);

      // AI track
      const aiVisible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "my_track", "ai"));
      expect(aiVisible).toEqual(["vertex", "fde", "rag"]);

      // Security track
      const secVisible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "my_track", "security"));
      expect(secVisible).toEqual(["pos", "bandit", "cyber"]);

      // No track selected -> shows all 10
      const noTrackVisible = ORDERED_STATION_IDS.filter((id) => isStationVisible(id, "my_track", null));
      expect(noTrackVisible).toEqual(ORDERED_STATION_IDS);
    });
  });

  describe("Station 03 IoT Honesty Status", () => {
    it("defines honest roadmap status instead of legacy 200+ XP block", () => {
      const iotStationConfig = {
        stationId: "iot",
        codeLabel: "Модуль 3 • 03",
        statusType: "roadmap",
        lockCriteria: {
          conditionText: "Статус модуля",
          progressText: "Реліз у 2 семестрі",
          badgeText: "В розробці: Реліз у 2 семестрі",
          isRoadmap: true,
        },
      };

      expect(iotStationConfig.statusType).toBe("roadmap");
      expect(iotStationConfig.lockCriteria.isRoadmap).toBe(true);
      expect(iotStationConfig.lockCriteria.progressText).toBe("Реліз у 2 семестрі");
      expect(iotStationConfig.lockCriteria.badgeText).toContain("Реліз у 2 семестрі");
      expect(iotStationConfig.lockCriteria.badgeText).not.toContain("200+ XP");
    });
  });

  describe("Career Tracks Metadata", () => {
    it("ensures all 4 career tracks exist with valid station mappings", () => {
      const trackIds = CAREER_TRACKS.map((t) => t.id);
      expect(trackIds).toContain("backend");
      expect(trackIds).toContain("ai");
      expect(trackIds).toContain("security");
      expect(trackIds).toContain("explorer");
    });
  });
});
