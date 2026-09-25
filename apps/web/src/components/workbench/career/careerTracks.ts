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
      accentBorder: "border-sky-500/50 hover:border-sky-500",
      accentBg: "bg-sky-500/10",
      accentText: "text-sky-800",
      ringColor: "ring-sky-500/30",
      cardBorder: "border-sky-600/40",
      glowShadow: "shadow-sky-500/10",
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
      accentBorder: "border-purple-500/50 hover:border-purple-500",
      accentBg: "bg-purple-500/10",
      accentText: "text-purple-800",
      ringColor: "ring-purple-500/30",
      cardBorder: "border-purple-600/40",
      glowShadow: "shadow-purple-500/10",
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
      accentBorder: "border-emerald-500/50 hover:border-emerald-500",
      accentBg: "bg-emerald-500/10",
      accentText: "text-emerald-800",
      ringColor: "ring-emerald-500/30",
      cardBorder: "border-emerald-600/40",
      glowShadow: "shadow-emerald-500/10",
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
      accentBorder: "border-amber-500/50 hover:border-amber-500",
      accentBg: "bg-amber-500/10",
      accentText: "text-amber-900",
      ringColor: "ring-amber-500/30",
      cardBorder: "border-amber-600/40",
      glowShadow: "shadow-amber-500/10",
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
