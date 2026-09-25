/**
 * @file apps/web/src/store/types.ts
 * @description Centralized types and slice interfaces for WorkbenchStore
 */

import type { Node, Edge } from "@xyflow/react";
import type {
  VirtualPosState,
  VirtualApiState,
  HttpMethod,
  HttpResponse,
  GitRepoState,
  GitCommandResult,
  BanditState,
  DefenseStatus,
  SqlInjectionResult,
  RateLimitResult,
  VirtualVertexState,
  VertexCommandResult,
  VertexHardwareType,
  VertexEndpointConfig,
  VertexIamConfig,
  VertexAuthPolicy,
  VertexMonitoringConfig,
  FdeState,
  DiscoveryResult,
  IntegrationResult,
  PipelineResult,
  SecurityResult,
  HandoffResult,
} from "@iw/sim-engine";

/**
 * Physical animation & transmission timings
 */
export const TIMINGS = {
  BUTTON_PRESS_MS: 120,
  IR_BEAM_FLIGHT_MS: 200,
  SCREEN_REACTION_MS: 150,
} as const;

export type HardwarePointKey = "VCC" | "GND" | "IR_DATA" | "DISPLAY_BUS";

export interface HardwarePoint {
  id: HardwarePointKey;
  name: string;
  voltage: "0V" | "5V";
  hasSignal: boolean;
  nominalVoltage: string;
  role: string;
  testPoint: string;
}

export type CircuitEdgeId =
  | "edge-psu-mcu"
  | "edge-psu-ir"
  | "edge-ir-mcu"
  | "edge-mcu-display"
  | "edge-mcu-audio"
  | "edge-mcu-led"
  | "edge-mcu-eeprom";

export interface CircuitEdgeState {
  id: CircuitEdgeId;
  source: string;
  target: string;
  label: string;
  signalType: string;
  isBroken: boolean;
}

export interface CircuitSlice {
  circuitEdges: Record<CircuitEdgeId, CircuitEdgeState>;
  toggleCircuitEdge: (edgeId: CircuitEdgeId) => void;
  resetCircuit: () => void;
  isEdgeBroken: (edgeId: CircuitEdgeId) => boolean;
}

export interface ArchitectureSlice {
  /** Is PowerCommand.Execute -> TVController.CommandHandler wired? */
  isArchitecturePowerWired: boolean;
  setArchitecturePowerWired: (wired: boolean) => void;

  /**
   * Persistent graph state — the single source of truth.
   * ArchitectureCanvas reads these on mount and writes on every change.
   * Navigating away and back never resets the board.
   */
  archNodes: Node<Record<string, unknown>>[];
  archEdges: Edge<Record<string, unknown>>[];
  setArchNodes: (nodes: Node<Record<string, unknown>>[]) => void;
  setArchEdges: (edges: Edge<Record<string, unknown>>[]) => void;

  // Trace-Chain Node System State
  selectedTraceEntityId: string;
  setSelectedTraceEntityId: (id: string) => void;
  bypassedTraceNodes: string[];
  toggleTraceBypass: (nodeId: string) => void;
  resetBypasses: () => void;
  isTraceBroken: boolean;
  setIsTraceBroken: (broken: boolean) => void;
  traceFaultReason?: string;
  setTraceFaultReason: (reason?: string) => void;
  resetLevelForPractice: () => void;
  completeLevel: () => void;
}

export type MentorPhase = "GUIDED" | "VERIFY" | "PRACTICE" | "COMPLETED";

export interface MentorSlice {
  mentorPhase: MentorPhase;
  guidedStep: 1 | 2 | 3;
  isHintActive: boolean;
  isStationVictoryModalOpen: boolean;
  xp: number;
  completedCodingTasks: Record<string, boolean>;
  completeCodingTask: (taskId: string) => boolean;
  isCodingTaskCompleted: (taskId: string) => boolean;
  setStationVictoryModalOpen: (open: boolean) => void;
  setMentorPhase: (phase: MentorPhase) => void;
  setGuidedStep: (step: 1 | 2 | 3) => void;
  triggerHint: () => void;
  addXp: (amount: number) => void;
  // Code Gym Mastery Stars & Fintech Station
  taskMasteryStars: Record<string, number>;
  taskBestWpm: Record<string, number>;
  setTaskMastery: (taskId: string, stars: number, bestWpm?: number) => void;
  saveTaskProgress: (taskId: string, stars: number, bestWpm?: number) => void;
  getTaskMastery: (taskId: string) => number;
  syncCloudProgress: (userId: string) => Promise<void>;
  currentStationId: string;
  setCurrentStationId: (id: string) => void;
  currentView: "HUB" | "STATION" | "WAR_ROOM";
  setCurrentView: (view: "HUB" | "STATION" | "WAR_ROOM") => void;
  targetTaskId: string | null;
  setTargetTaskId: (taskId: string | null) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  userTrack: CareerTrack | null;
  hasCompletedOnboarding: boolean;
  isCareerModalOpen: boolean;
  setUserTrack: (track: CareerTrack | null) => void;
  setIsCareerModalOpen: (open: boolean) => void;
}

export type CareerTrack = "backend" | "ai" | "security" | "explorer";


export interface PosSlice {
  posState: VirtualPosState;
  applyPosExecution: (updates: Partial<VirtualPosState>) => void;
  resetPosState: (customState?: Partial<VirtualPosState>) => void;
  isPosVictoryModalOpen: boolean;
  setPosVictoryModalOpen: (open: boolean) => void;
  posManualPin: string;
  posIsCardInserted: boolean;
  posKeypadInput: (key: string) => void;
  posTapNfc: () => void;
  posInsertChip: () => void;
  posEjectCard: () => void;
}

export interface TVStateSlice {
  power: boolean;
  channel: number;
  maxChannels: number;
  channelNames: Record<number, string>;
  volume: number; // 0..100
  isMuted: boolean;
  osdMessage: string;
  irSignalPulse: boolean;
  screenReactionPulse: boolean;

  // Direct Programmatic Actions with FSM Guards (Blocked when !power)
  setVolume: (vol: number) => void;
  changeVolume: (delta: number) => void;
  setChannel: (channel: number) => void;
  nextChannel: () => void;
  prevChannel: () => void;
  toggleMute: () => void;
  togglePower: () => void;
}

export interface ConnectionsSlice {
  connections: Record<HardwarePointKey, HardwarePoint>;
  setConnectionSignal: (key: HardwarePointKey, voltage: "0V" | "5V", hasSignal: boolean) => void;
}

export interface IRSigSlice {
  isIrEmitting: boolean;
  isBeamFlying: boolean;
  lastOpcode: string;
}

export interface WorkbenchActions {
  // Remote Buttons (Trigger physical IR pipeline)
  pressPower: () => void;
  pressChannelUp: () => void;
  pressChannelDown: () => void;
  pressSelectChannel: (channel: number) => void;
  pressVolumeUp: () => void;
  pressVolumeDown: () => void;
  pressMuteToggle: () => void;

  // TV Chassis Buttons (Direct physical contact without IR delay)
  chassisTogglePower: () => void;
  chassisNextChannel: () => void;
  chassisPrevChannel: () => void;

  // Code Playground Runtime Dispatcher
  applyCodeExecution: (updates: {
    power?: boolean;
    channel?: number;
    volume?: number;
    osdMessage?: string;
    label?: string;
  }) => void;

  // Core physical pipeline dispatcher
  dispatchRemoteCommand: (
    commandName: string,
    execute: (state: TVStateSlice & ConnectionsSlice & CircuitSlice & ArchitectureSlice) => {
      tvUpdates?: Partial<TVStateSlice>;
      connectionUpdates?: Partial<Record<HardwarePointKey, Partial<HardwarePoint>>>;
    }
  ) => void;
}

export interface CalculatorSlice {
  calcDisplay: string;
  calcPrevValue: number | null;
  calcOperation: "+" | "-" | null;
  calcClearOnNext: boolean;
  calcInputDigit: (digit: number) => void;
  calcSetOperation: (op: "+" | "-") => void;
  calcEvaluate: () => void;
  calcClear: () => void;
}

export interface ApiForgeSlice {
  clientDraftMethod: HttpMethod;
  clientDraftPath: string;
  clientDraftHeaders: Record<string, string>;
  clientDraftBody: string;
  isPacketInFlight: boolean;
  packetProgress: number;
  packetDirection: "CLIENT_TO_SERVER" | "SERVER_TO_CLIENT";
  apiState: VirtualApiState;
  lastApiResponse: HttpResponse | null;
  isApiVictoryModalOpen: boolean;

  setClientDraftMethod: (m: HttpMethod) => void;
  setClientDraftPath: (p: string) => void;
  setClientDraftHeaders: (h: Record<string, string>) => void;
  setClientDraftBody: (b: string) => void;
  toggleNetworkCable: () => void;
  sendClientRequest: () => Promise<HttpResponse>;
  applyApiExecution: (updates: Partial<VirtualApiState>) => void;
  resetApiState: (custom?: Partial<VirtualApiState>) => void;
  setApiVictoryModalOpen: (open: boolean) => void;
}

export interface GitSlice {
  gitRepoState: GitRepoState;
  gitCliInput: string;
  gitCliHistory: string[];
  gitTerminalLogs: string[];
  isGitVictoryModalOpen: boolean;
  selectedCommitId: string | null;

  setGitCliInput: (cmd: string) => void;
  runGitCommand: (cmd: string) => GitCommandResult;
  resolveActiveConflict: (strategy: "ours" | "theirs" | "both") => void;
  setSelectedCommitId: (id: string | null) => void;
  resetGitRepo: (customState?: Partial<GitRepoState>) => void;
  setGitVictoryModalOpen: (open: boolean) => void;
}

export interface BanditSlice {
  banditState: BanditState;
  banditCliInput: string;
  isBanditVictoryModalOpen: boolean;
  sqlQueryInput: string;
  sqlQueryResult: SqlInjectionResult | null;
  rateLimitStatus: RateLimitResult | null;

  setBanditCliInput: (cmd: string) => void;
  runBanditCommand: (cmd: string) => { output: string; flagCaptured?: string };
  submitFlagDirect: (flag: string) => boolean;
  setTamperJson: (json: string) => void;
  forwardTransitPacketAction: () => { responseStatus: number; message: string };
  dropTransitPacketAction: () => void;
  toggleBanditDefenseAction: (key: keyof DefenseStatus) => void;
  setSqlQueryInput: (input: string) => void;
  runSqlQueryAction: (input: string) => SqlInjectionResult;
  simulateRateLimitAction: () => RateLimitResult;
  resetBanditStationToLevel: (level: number) => void;
  setBanditVictoryModalOpen: (open: boolean) => void;
}

export interface VertexSlice {
  vertexState: VirtualVertexState;
  isVertexVictoryModalOpen: boolean;
  connectVertexGcsBucketAction: (bucketUri: string) => VertexCommandResult;
  setVertexPreprocessingStepAction: (step: VirtualVertexState["preprocessingStep"]) => VertexCommandResult;
  runVertexTrainingAction: (hardware: VertexHardwareType, batchSize: number, learningRate: number) => VertexCommandResult;
  configureVertexEndpointAction: (config: VertexEndpointConfig) => VertexCommandResult;
  configureVertexIamAction: (iamConfig: VertexIamConfig, authPolicy: VertexAuthPolicy) => VertexCommandResult;
  checkVertexMonitoringAction: (monitoringConfig: VertexMonitoringConfig) => VertexCommandResult;
  resetVertexState: (custom?: Partial<VirtualVertexState>) => void;
  setVertexVictoryModalOpen: (open: boolean) => void;
}

export interface FdeSlice {
  fdeState: FdeState;
  isFdeVictoryModalOpen: boolean;
  makeFdeDiscoveryChoiceAction: (choiceId: string, isCorrect: boolean, xpGain: number, consequenceKey: string) => DiscoveryResult;
  connectFdeLegacyApiAction: (endpointUrl: string) => IntegrationResult;
  configureFdeAuthTokenAction: (token: string) => IntegrationResult;
  connectFdeAgentNodeAction: (nodeId: string) => PipelineResult;
  configureFdeRagAction: (chunkSize: number, vectorDbUrl: string) => PipelineResult;
  toggleFdeSecurityCheckAction: (checkId: string) => SecurityResult;
  submitFdeRunbookAction: (markdownContent: string) => HandoffResult;
  resetFdeState: (custom?: Partial<FdeState>) => void;
  setFdeVictoryModalOpen: (open: boolean) => void;
}

export interface RagAgentSlice {
  ragDocuments: Array<{ id: string; title: string; text: string }>;
  ragChunkSize: number;
  ragChunkOverlap: number;
  ragActiveChunks: import("@iw/sim-engine").DocumentChunk[];
  ragQueryInput: string;
  ragSearchResults: import("@iw/sim-engine").HybridSearchResult[];
  ragActiveTab: "chunking" | "react" | "ragas";
  reActSteps: import("@iw/sim-engine").ReActTraceStep[];
  isReActRunning: boolean;
  reActFinalAnswer: string;
  ragasEvaluation: import("@iw/sim-engine").RagasEvaluation | null;
  guardrailAlert: string | null;
  isRagVictoryModalOpen: boolean;

  setRagChunkConfig: (chunkSize: number, chunkOverlap: number) => void;
  setRagQueryInput: (query: string) => void;
  executeRagQueryAction: (query: string, topK?: number) => import("@iw/sim-engine").HybridSearchResult[];
  runReActAgentAction: (query: string) => Promise<import("@iw/sim-engine").ReActExecutionResult>;
  resetReActAgentAction: () => void;
  setRagActiveTabAction: (tab: "chunking" | "react" | "ragas") => void;
  setRagVictoryModalOpen: (open: boolean) => void;
  resetRagState: () => void;
}

export interface CyberSlice {
  cyberLogs: import("@iw/sim-engine").CyberSecurityLogEntry[];
  cyberLogQuery: string;
  cyberFilteredLogs: import("@iw/sim-engine").CyberSecurityLogEntry[];
  cyberPackets: import("@iw/sim-engine").NetworkPacket[];
  cyberSelectedPacketId: number | null;
  cyberActiveTab: "siem" | "wireshark" | "nist";
  nistIncident: import("@iw/sim-engine").IncidentState;
  containmentAuditLog: string[];
  isCyberVictoryModalOpen: boolean;

  setCyberActiveTab: (tab: "siem" | "wireshark" | "nist") => void;
  setCyberLogQuery: (query: string) => void;
  executeCyberLogQueryAction: () => void;
  selectCyberPacketAction: (frameNumber: number | null) => void;
  executeContainmentAction: (actionType: "ISOLATE_HOST" | "BLOCK_IP" | "REVOKE_TOKEN") => void;
  advanceNistStageAction: () => void;
  setCyberVictoryModalOpen: (open: boolean) => void;
  resetCyberState: () => void;
}

export interface WarRoomSlice {
  activeIncidentId: string | null;
  warRoomStatus: "STANDBY" | "IN_PROGRESS" | "RESOLVED" | "FAILED";
  warRoomElapsedSec: number;
  warRoomTimeRemainingSec: number;
  warRoomAccumulatedLoss: number;
  warRoomErrorRate: number;
  warRoomLatencyMs: number;
  warRoomHealthStatus: "CRITICAL" | "DEGRADED" | "STABILIZING" | "OPERATIONAL";
  warRoomActiveTab: "feed" | "diagnostics" | "hotfix";
  warRoomChatMessages: import("@iw/sim-engine").IncidentSlackMessage[];
  warRoomHotfixCode: Record<"typescript" | "python", string>;
  warRoomHotfixLanguage: "typescript" | "python";
  warRoomHotfixLogs: string[];
  warRoomHotfixError: string | null;
  isWarRoomAudioEnabled: boolean;
  isWarRoomVictoryModalOpen: boolean;
  isWarRoomFailureModalOpen: boolean;
  resolvedIncidentIds: string[];

  startIncidentDrill: (incidentId: string) => void;
  abortIncidentDrill: () => void;
  tickWarRoomTimer: () => void;
  setWarRoomActiveTab: (tab: "feed" | "diagnostics" | "hotfix") => void;
  setWarRoomHotfixCode: (code: string) => void;
  setWarRoomHotfixLanguage: (lang: "typescript" | "python") => void;
  runWarRoomHotfixAction: () => boolean;
  toggleWarRoomAudio: () => void;
  setWarRoomVictoryModalOpen: (open: boolean) => void;
  setWarRoomFailureModalOpen: (open: boolean) => void;
  resetWarRoomState: () => void;
}

export type WorkbenchStore = TVStateSlice &
  ConnectionsSlice &
  CircuitSlice &
  ArchitectureSlice &
  MentorSlice &
  PosSlice &
  IRSigSlice &
  CalculatorSlice &
  ApiForgeSlice &
  GitSlice &
  BanditSlice &
  VertexSlice &
  FdeSlice &
  RagAgentSlice &
  CyberSlice &
  WarRoomSlice &
  WorkbenchActions;

