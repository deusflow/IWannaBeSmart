/**
 * @file apps/web/src/components/workbench/career/careerTracks.ts
 * @description Career track configurations, station mappings, and didactic metadata.
 */

import { Server, Cpu, ShieldCheck, Compass, type LucideIcon } from "lucide-react";
import type { CareerTrack } from "../../../store/types";

export interface CareerTrackItem {
  id: CareerTrack;
  titleKey: string;
  shortBadgeKey: string;
  roleBadgeKey: string;
  audienceKey: string;
  rolesKey: string;
  stationsKey: string;
  mottoKey?: string;
  icon: LucideIcon;
  stationIds: string[];
  theme: {
    accentBorder: string;
    accentBg: string;
    accentText: string;
    ringColor: string;
    cardBorder: string;
    glowShadow: string;
    leftBarColor: string;
    pillBg: string;
    tagBorder: string;
  };
}

export const CAREER_TRACKS: CareerTrackItem[] = [
  {
    id: "backend",
    titleKey: "career.tracks.backend.title",
    shortBadgeKey: "career.tracks.backend.shortBadge",
    roleBadgeKey: "career.tracks.backend.roleBadge",
    audienceKey: "career.tracks.backend.audience",
    rolesKey: "career.tracks.backend.roles",
    stationsKey: "career.tracks.backend.stations",
    icon: Server,
    stationIds: ["tv", "pos", "api", "git"],
    theme: {
      accentBorder: "border-[#3B6B88]",
      accentBg: "bg-[#EAF0F4]",
      accentText: "text-[#3B6B88]",
      ringColor: "ring-[#3B6B88]/25",
      cardBorder: "border-[#3B6B88]/30",
      glowShadow: "shadow-sm",
      leftBarColor: "border-[#3B6B88]",
      pillBg: "bg-[#EAF0F4]",
      tagBorder: "border-[#3B6B88]/30",
    },
  },
  {
    id: "ai",
    titleKey: "career.tracks.ai.title",
    shortBadgeKey: "career.tracks.ai.shortBadge",
    roleBadgeKey: "career.tracks.ai.roleBadge",
    audienceKey: "career.tracks.ai.audience",
    rolesKey: "career.tracks.ai.roles",
    stationsKey: "career.tracks.ai.stations",
    icon: Cpu,
    stationIds: ["vertex", "fde", "rag"],
    theme: {
      accentBorder: "border-[#635380]",
      accentBg: "bg-[#F0EDF6]",
      accentText: "text-[#635380]",
      ringColor: "ring-[#635380]/25",
      cardBorder: "border-[#635380]/30",
      glowShadow: "shadow-sm",
      leftBarColor: "border-[#635380]",
      pillBg: "bg-[#F0EDF6]",
      tagBorder: "border-[#635380]/30",
    },
  },
  {
    id: "security",
    titleKey: "career.tracks.security.title",
    shortBadgeKey: "career.tracks.security.shortBadge",
    roleBadgeKey: "career.tracks.security.roleBadge",
    audienceKey: "career.tracks.security.audience",
    rolesKey: "career.tracks.security.roles",
    stationsKey: "career.tracks.security.stations",
    icon: ShieldCheck,
    stationIds: ["bandit", "cyber"],
    theme: {
      accentBorder: "border-[#3E7A5E]",
      accentBg: "bg-[#EAF3EE]",
      accentText: "text-[#3E7A5E]",
      ringColor: "ring-[#3E7A5E]/25",
      cardBorder: "border-[#3E7A5E]/30",
      glowShadow: "shadow-sm",
      leftBarColor: "border-[#3E7A5E]",
      pillBg: "bg-[#EAF3EE]",
      tagBorder: "border-[#3E7A5E]/30",
    },
  },
  {
    id: "explorer",
    titleKey: "career.tracks.explorer.title",
    shortBadgeKey: "career.tracks.explorer.shortBadge",
    roleBadgeKey: "career.tracks.explorer.roleBadge",
    audienceKey: "career.tracks.explorer.audience",
    rolesKey: "career.tracks.explorer.roles",
    stationsKey: "career.tracks.explorer.stations",
    mottoKey: "career.tracks.explorer.motto",
    icon: Compass,
    stationIds: ["tv", "pos", "api", "git", "bandit", "vertex", "fde", "rag", "cyber"],
    theme: {
      accentBorder: "border-[#C86D32]",
      accentBg: "bg-[#F5EDE6]",
      accentText: "text-[#C86D32]",
      ringColor: "ring-[#C86D32]/25",
      cardBorder: "border-[#C86D32]/30",
      glowShadow: "shadow-sm",
      leftBarColor: "border-[#C86D32]",
      pillBg: "bg-[#F5EDE6]",
      tagBorder: "border-[#C86D32]/30",
    },
  },
];

/**
 * Checks whether a given stationId belongs to the student's active track.
 */
export function isStationInTrack(stationId: string, track: CareerTrack | null): boolean {
  if (!track) return false;
  if (track === "explorer") {
    return ["tv", "pos", "api", "git", "bandit", "vertex", "fde", "rag", "cyber"].includes(stationId);
  }
  const config = CAREER_TRACKS.find((c) => c.id === track);
  return config ? config.stationIds.includes(stationId) : false;
}

/**
 * Tasting set introductory tasks for Explorer mode.
 */
export const EXPLORER_INTRO_TASKS: Record<string, string> = {
  tv: "task-1-command",
  pos: "task-pos-1",
  api: "task-api-1",
  git: "task-git-1",
  bandit: "task-bandit-1",
  vertex: "task-vertex-1",
  fde: "task-fde-1",
  rag: "task-rag-1",
  cyber: "task-cyber-1",
};
