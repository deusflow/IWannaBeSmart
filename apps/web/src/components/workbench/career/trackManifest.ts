/**
 * @file apps/web/src/components/workbench/career/trackManifest.ts
 * @description Central declarative registry of career track station questlines.
 * Zero-hardcode single source of truth for engineering curriculum progression.
 */

import type { CareerTrack } from "../../../store/types";

export interface StationMeta {
  id: string;
  titleKey: string;
  defaultTitle: string;
  shortName: string;
  icon: string;
}

export const TRACK_SEQUENCES: Record<Exclude<CareerTrack, "explorer">, string[]> = {
  backend: ["tv", "pos", "iot", "api", "git"],
  ai: ["vertex", "fde", "rag"],
  security: ["bandit", "cyber"],
};

export const ALL_STATIONS_SEQUENCE: string[] = [
  "tv",
  "pos",
  "iot",
  "api",
  "git",
  "bandit",
  "vertex",
  "fde",
  "rag",
  "cyber",
];

export const STATION_DIRECTORY: Record<string, StationMeta> = {
  tv: {
    id: "tv",
    titleKey: "hub.stations.tv.title",
    defaultTitle: "TV & Circuit Lab (DI & IoC)",
    shortName: "TV & DI",
    icon: "🖥️",
  },
  pos: {
    id: "pos",
    titleKey: "hub.stations.pos.title",
    defaultTitle: "POS Terminal (State Machine & Crypto)",
    shortName: "POS Terminal",
    icon: "💳",
  },
  iot: {
    id: "iot",
    titleKey: "hub.stations.iot.title",
    defaultTitle: "IoT Garage Gate (EventBus & Sensors)",
    shortName: "IoT Gate",
    icon: "🚪",
  },
  api: {
    id: "api",
    titleKey: "hub.stations.api.title",
    defaultTitle: "API Forge & Gateway",
    shortName: "API Forge",
    icon: "🌐",
  },
  git: {
    id: "git",
    titleKey: "hub.stations.git.title",
    defaultTitle: "Git Time Machine & Conflicts",
    shortName: "Git Time Machine",
    icon: "🌲",
  },
  bandit: {
    id: "bandit",
    titleKey: "hub.stations.bandit.title",
    defaultTitle: "Cyber Bandit & WAF Lab",
    shortName: "Cyber Bandit",
    icon: "🏴‍☠️",
  },
  vertex: {
    id: "vertex",
    titleKey: "hub.stations.vertex.title",
    defaultTitle: "Google Cloud Vertex AI",
    shortName: "Vertex AI",
    icon: "🧠",
  },
  fde: {
    id: "fde",
    titleKey: "hub.stations.fde.title",
    defaultTitle: "Field AI Deployer & Microservices",
    shortName: "Field AI Deployer",
    icon: "🚀",
  },
  rag: {
    id: "rag",
    titleKey: "hub.stations.rag.title",
    defaultTitle: "IBM RAG & Neural Vectors",
    shortName: "IBM RAG",
    icon: "🤖",
  },
  cyber: {
    id: "cyber",
    titleKey: "hub.stations.cyber.title",
    defaultTitle: "Google Cybersecurity & Wireshark",
    shortName: "Google Cybersecurity",
    icon: "🛡️",
  },
};

export interface NextStationResult {
  nextStationId: string | null;
  isLast: boolean;
  progressPercent: number;
  currentIndex: number;
  totalStations: number;
  nextStationTitleKey?: string;
  nextStationDefaultTitle?: string;
  nextStationShortName?: string;
}

/**
 * Pure helper function returning next station in the student's active track.
 */
export function getNextStationInTrack(
  currentStationId: string,
  track: CareerTrack | null
): NextStationResult {
  const sequence =
    track && track !== "explorer" && TRACK_SEQUENCES[track]
      ? TRACK_SEQUENCES[track]
      : ALL_STATIONS_SEQUENCE;

  const totalStations = sequence.length;
  const currentIndex = sequence.indexOf(currentStationId);

  // If station is not in active track, guide to beginning of the active track
  if (currentIndex === -1) {
    const nextId = sequence[0] || null;
    const meta = nextId ? STATION_DIRECTORY[nextId] : undefined;
    return {
      nextStationId: nextId,
      isLast: false,
      progressPercent: 0,
      currentIndex: -1,
      totalStations,
      nextStationTitleKey: meta?.titleKey,
      nextStationDefaultTitle: meta?.defaultTitle,
      nextStationShortName: meta?.shortName,
    };
  }

  const isLast = currentIndex === totalStations - 1;
  const nextStationId = isLast ? null : sequence[currentIndex + 1];
  const progressPercent = Math.round(((currentIndex + 1) / totalStations) * 100);
  const nextMeta = nextStationId ? STATION_DIRECTORY[nextStationId] : undefined;

  return {
    nextStationId,
    isLast,
    progressPercent,
    currentIndex,
    totalStations,
    nextStationTitleKey: nextMeta?.titleKey,
    nextStationDefaultTitle: nextMeta?.defaultTitle,
    nextStationShortName: nextMeta?.shortName,
  };
}

/**
 * Computes overall track station completion progress given task mastery & completed coding tasks
 */
export function getTrackCompletionStats(
  track: CareerTrack | null,
  isStationCompleted: (stationId: string) => boolean
): { completedCount: number; totalCount: number; percent: number; stationIds: string[] } {
  const sequence =
    track && track !== "explorer" && TRACK_SEQUENCES[track]
      ? TRACK_SEQUENCES[track]
      : ALL_STATIONS_SEQUENCE;

  const completedCount = sequence.filter((id) => isStationCompleted(id)).length;
  const totalCount = sequence.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    percent,
    stationIds: sequence,
  };
}
