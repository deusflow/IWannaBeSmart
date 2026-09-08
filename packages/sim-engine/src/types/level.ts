/**
 * @file packages/sim-engine/src/types/level.ts
 * @description Strongly-typed schemas for station levels, device states, and blueprints
 */

export interface TVState {
  power: boolean;
  channel: number;
  maxChannels: number;
  channelNames: Record<number, string>;
  volume: number; // 0 - 30
  isMuted: boolean;
  irSignalPulse: boolean;
}

export interface HardwareNodeMeta {
  id: string;
  name: string;
  role: string;
  nominalVoltage: string;
  status: "nominal" | "fault" | "standby" | "active";
  chipModel: string;
  testPoint: string;
}

export interface CodeSnippet {
  csharp: string;
  go: string;
  explanation: string;
}

export interface StationLevel {
  id: string;
  stationId: string;
  stationTitle: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  objective: string;
  briefing: string;
  tvInitialState: TVState;
  hardwareNodes: HardwareNodeMeta[];
  codeSnippet: CodeSnippet;
  untranslatedTerms: string[];
}
