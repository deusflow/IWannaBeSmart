/**
 * @file packages/sim-engine/src/runtime/fdeContext.ts
 * @description Simulation context for Station 07: Field AI Deployer (Forward Deployed Engineer).
 * Simulates the lifecycle of an enterprise AI deployment:
 * Discovery → Integration → Agent Design → Security → Handoff.
 */

// ── Dialogue System ──────────────────────────────────────────────────────────

export interface DialogueChoice {
  id: string;
  textKey: string; // i18n key for the choice text
  isCorrect: boolean;
  consequenceKey: string; // i18n key for client reaction
  xpGain: number;
}

export interface DialogueNode {
  id: string;
  speakerKey: "client" | "fde"; // who is speaking
  textKey: string; // i18n key for what they say
  choices?: DialogueChoice[]; // if present, player must choose
}

// ── Agent Pipeline System ────────────────────────────────────────────────────

export type AgentNodeType =
  | "planner"
  | "retriever"
  | "tool-caller"
  | "validator"
  | "responder";

export interface AgentNode {
  id: string;
  type: AgentNodeType;
  label: string;
  connected: boolean;
}

export interface AgentPipeline {
  nodes: AgentNode[];
  isValid: boolean;
  validationErrors: string[];
}

// ── Security System ──────────────────────────────────────────────────────────

export interface SecurityCheck {
  id: string;
  labelKey: string;
  passed: boolean;
  required: boolean;
}

export type SecurityPosture = "critical" | "moderate" | "hardened";

// ── Integration State ────────────────────────────────────────────────────────

export interface LegacyApiError {
  code: number;
  message: string;
  hint: string;
}

export interface FdeState {
  // Discovery phase
  discoveryComplete: boolean;
  clientPainPointIdentified: boolean;
  correctChoicesMade: number;
  totalChoicesAvailable: number;
  clientTrustScore: number; // 0–100
  lastClientReactionKey: string | null;

  // Integration phase
  legacyApiConnected: boolean;
  authTokenConfigured: boolean;
  integrationErrors: LegacyApiError[];
  integrationLogs: string[];

  // Agent Design phase
  agentPipeline: AgentPipeline;
  ragConfigured: boolean;
  vectorDbConnected: boolean;

  // Security phase
  securityChecks: SecurityCheck[];
  securityPosture: SecurityPosture;
  promptInjectionDefended: boolean;

  // Handoff phase
  runbookWritten: boolean;
  documentationScore: number; // 0–100
  handoffComplete: boolean;

  // Global
  deploymentLogs: string[];
  xpEarned: number;
}

const INITIAL_SECURITY_CHECKS: SecurityCheck[] = [
  { id: "iam-least-privilege", labelKey: "fde.security.iamLeastPrivilege", passed: false, required: true },
  { id: "prompt-injection", labelKey: "fde.security.promptInjection", passed: false, required: true },
  { id: "data-residency", labelKey: "fde.security.dataResidency", passed: false, required: true },
  { id: "pii-masking", labelKey: "fde.security.piiMasking", passed: false, required: true },
  { id: "rate-limiting", labelKey: "fde.security.rateLimiting", passed: false, required: false },
  { id: "audit-logging", labelKey: "fde.security.auditLogging", passed: false, required: false },
];

export const INITIAL_FDE_STATE: FdeState = {
  discoveryComplete: false,
  clientPainPointIdentified: false,
  correctChoicesMade: 0,
  totalChoicesAvailable: 4,
  clientTrustScore: 40,
  lastClientReactionKey: null,

  legacyApiConnected: false,
  authTokenConfigured: false,
  integrationErrors: [],
  integrationLogs: [],

  agentPipeline: {
    nodes: [
      { id: "planner", type: "planner", label: "Planner", connected: false },
      { id: "retriever", type: "retriever", label: "RAG Retriever", connected: false },
      { id: "tool-caller", type: "tool-caller", label: "Tool Caller", connected: false },
      { id: "validator", type: "validator", label: "Output Validator", connected: false },
      { id: "responder", type: "responder", label: "Responder", connected: false },
    ],
    isValid: false,
    validationErrors: [],
  },
  ragConfigured: false,
  vectorDbConnected: false,

  securityChecks: INITIAL_SECURITY_CHECKS,
  securityPosture: "critical",
  promptInjectionDefended: false,

  runbookWritten: false,
  documentationScore: 0,
  handoffComplete: false,

  deploymentLogs: [],
  xpEarned: 0,
};

// ── Discovery Engine ──────────────────────────────────────────────────────────

export interface DiscoveryResult {
  newState: FdeState;
  clientReactionKey: string;
  xpGained: number;
  trustDelta: number;
}

export function makeDiscoveryChoice(
  state: FdeState,
  choiceId: string,
  isCorrect: boolean,
  xpGain: number,
  consequenceKey: string
): DiscoveryResult {
  const trustDelta = isCorrect ? 15 : -10;
  const newTrust = Math.max(0, Math.min(100, state.clientTrustScore + trustDelta));
  const newCorrect = isCorrect
    ? state.correctChoicesMade + 1
    : state.correctChoicesMade;

  const allCorrectDone = newCorrect >= state.totalChoicesAvailable;

  const newState: FdeState = {
    ...state,
    correctChoicesMade: newCorrect,
    clientTrustScore: newTrust,
    clientPainPointIdentified: allCorrectDone,
    discoveryComplete: allCorrectDone,
    lastClientReactionKey: consequenceKey,
    xpEarned: state.xpEarned + (isCorrect ? xpGain : 0),
    deploymentLogs: [
      ...state.deploymentLogs,
      isCorrect
        ? `[DISCOVERY] Correct approach: +${xpGain}xp, trust+${trustDelta}`
        : `[DISCOVERY] Wrong approach: trust${trustDelta}`,
    ],
  };

  return {
    newState,
    clientReactionKey: consequenceKey,
    xpGained: isCorrect ? xpGain : 0,
    trustDelta,
  };
}

// ── Integration Engine ────────────────────────────────────────────────────────

export interface IntegrationResult {
  success: boolean;
  newState: FdeState;
  output: string;
  errorFixed?: boolean;
}

const LEGACY_ERRORS: LegacyApiError[] = [
  { code: 401, message: "Unauthorized: Missing Bearer token", hint: "fde.integration.hint401" },
  { code: 404, message: "Not Found: endpoint /api/v1/compliance", hint: "fde.integration.hint404" },
  { code: 503, message: "Service Unavailable: legacy SOAP bridge timeout", hint: "fde.integration.hint503" },
];

export function connectLegacyApi(
  state: FdeState,
  endpointUrl: string
): IntegrationResult {
  if (!endpointUrl.startsWith("https://")) {
    return {
      success: false,
      newState: {
        ...state,
        integrationErrors: [...state.integrationErrors, LEGACY_ERRORS[0]],
        integrationLogs: [
          ...state.integrationLogs,
          `[INTEGRATION] Connection attempt to ${endpointUrl}`,
          `[INTEGRATION] ERROR 401: ${LEGACY_ERRORS[0].message}`,
        ],
      },
      output: `ERROR 401: ${LEGACY_ERRORS[0].message}. Add Bearer token in Authorization header.`,
    };
  }
  return {
    success: true,
    newState: {
      ...state,
      legacyApiConnected: true,
      integrationLogs: [
        ...state.integrationLogs,
        `[INTEGRATION] Connected to ${endpointUrl}`,
        `[INTEGRATION] Legacy API handshake: OK`,
      ],
    },
    output: `✓ Legacy API connected at ${endpointUrl}`,
  };
}

export function configureAuthToken(
  state: FdeState,
  token: string
): IntegrationResult {
  if (!token || token.length < 16) {
    return {
      success: false,
      newState: state,
      output: "ERROR: Token is too short. Use a proper Bearer token (≥16 chars).",
    };
  }
  return {
    success: true,
    newState: {
      ...state,
      authTokenConfigured: true,
      integrationLogs: [
        ...state.integrationLogs,
        `[AUTH] Bearer token configured: ${token.slice(0, 4)}****`,
        `[AUTH] Token validated against OAuth2 endpoint`,
      ],
    },
    output: `✓ Bearer token set. Authorization header configured.`,
  };
}

// ── Agent Pipeline Engine ─────────────────────────────────────────────────────

export interface PipelineResult {
  success: boolean;
  newState: FdeState;
  output: string;
}

function validatePipeline(nodes: AgentNode[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const connectedTypes = nodes
    .filter((n) => n.connected)
    .map((n) => n.type);

  if (!connectedTypes.includes("planner"))
    errors.push("Planner node is required");
  if (!connectedTypes.includes("responder"))
    errors.push("Responder node is required");
  if (
    connectedTypes.includes("retriever") &&
    !connectedTypes.includes("tool-caller")
  ) {
    errors.push("RAG Retriever requires a Tool Caller node");
  }
  if (!connectedTypes.includes("validator"))
    errors.push("Output Validator node is required for production safety");

  return { isValid: errors.length === 0, errors };
}

export function connectAgentNode(
  state: FdeState,
  nodeId: string
): PipelineResult {
  const updatedNodes = state.agentPipeline.nodes.map((n) =>
    n.id === nodeId ? { ...n, connected: true } : n
  );
  const { isValid, errors } = validatePipeline(updatedNodes);

  const newState: FdeState = {
    ...state,
    agentPipeline: {
      nodes: updatedNodes,
      isValid,
      validationErrors: errors,
    },
    deploymentLogs: [
      ...state.deploymentLogs,
      `[AGENT] Node '${nodeId}' connected to pipeline`,
    ],
  };

  return {
    success: true,
    newState,
    output: isValid
      ? `✓ Pipeline valid. All required nodes connected.`
      : `Node '${nodeId}' added. Remaining: ${errors.join(", ")}`,
  };
}

export function configureRag(
  state: FdeState,
  chunkSize: number,
  vectorDbUrl: string
): PipelineResult {
  if (chunkSize < 128 || chunkSize > 2048) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Chunk size ${chunkSize} out of range. Use 128–2048 tokens.`,
    };
  }
  if (!vectorDbUrl.startsWith("https://")) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Vector DB URL must use HTTPS.`,
    };
  }

  return {
    success: true,
    newState: {
      ...state,
      ragConfigured: true,
      vectorDbConnected: true,
      deploymentLogs: [
        ...state.deploymentLogs,
        `[RAG] Chunk size: ${chunkSize} tokens`,
        `[RAG] Vector DB connected: ${vectorDbUrl}`,
        `[RAG] Embedding model: text-embedding-004`,
      ],
    },
    output: `✓ RAG configured. Chunk size=${chunkSize}, DB connected at ${vectorDbUrl}.`,
  };
}

// ── Security Engine ───────────────────────────────────────────────────────────

export interface SecurityResult {
  newState: FdeState;
  output: string;
  posture: SecurityPosture;
}

export function toggleSecurityCheck(
  state: FdeState,
  checkId: string
): SecurityResult {
  const updatedChecks = state.securityChecks.map((c) =>
    c.id === checkId ? { ...c, passed: !c.passed } : c
  );

  const requiredPassed = updatedChecks
    .filter((c) => c.required)
    .every((c) => c.passed);
  const totalPassed = updatedChecks.filter((c) => c.passed).length;
  const posture: SecurityPosture =
    requiredPassed && totalPassed >= 5
      ? "hardened"
      : requiredPassed
      ? "moderate"
      : "critical";

  const promptInjection = updatedChecks.find(
    (c) => c.id === "prompt-injection"
  )?.passed ?? false;

  const newState: FdeState = {
    ...state,
    securityChecks: updatedChecks,
    securityPosture: posture,
    promptInjectionDefended: promptInjection,
    deploymentLogs: [
      ...state.deploymentLogs,
      `[SECURITY] Check '${checkId}': ${updatedChecks.find((c) => c.id === checkId)?.passed ? "PASS" : "FAIL"}`,
      `[SECURITY] Posture updated: ${posture}`,
    ],
  };

  return {
    newState,
    output: `Security posture: ${posture.toUpperCase()}. ${totalPassed}/${updatedChecks.length} checks passed.`,
    posture,
  };
}

// ── Handoff Engine ────────────────────────────────────────────────────────────

export interface HandoffResult {
  success: boolean;
  newState: FdeState;
  score: number;
  output: string;
}

export function submitRunbook(
  state: FdeState,
  markdownContent: string
): HandoffResult {
  const wordCount = markdownContent.trim().split(/\s+/).length;
  const hasArchitecture =
    markdownContent.toLowerCase().includes("architecture") ||
    markdownContent.toLowerCase().includes("pipeline");
  const hasRunbook =
    markdownContent.toLowerCase().includes("runbook") ||
    markdownContent.toLowerCase().includes("operations");
  const hasTroubleshooting =
    markdownContent.toLowerCase().includes("troubleshoot") ||
    markdownContent.toLowerCase().includes("error");

  let score = 0;
  if (wordCount >= 100) score += 25;
  if (wordCount >= 200) score += 25;
  if (hasArchitecture) score += 20;
  if (hasRunbook) score += 15;
  if (hasTroubleshooting) score += 15;

  const passed = score >= 70;
  const newState: FdeState = {
    ...state,
    runbookWritten: passed,
    documentationScore: score,
    handoffComplete: passed && state.securityPosture !== "critical",
    deploymentLogs: [
      ...state.deploymentLogs,
      `[HANDOFF] Runbook submitted: ${wordCount} words`,
      `[HANDOFF] Documentation score: ${score}/100`,
      passed
        ? `[HANDOFF] ✓ Runbook approved — handoff complete`
        : `[HANDOFF] ✗ Runbook incomplete — improve coverage`,
    ],
  };

  return {
    success: passed,
    newState,
    score,
    output: passed
      ? `✓ Runbook accepted (score: ${score}/100). Handoff complete!`
      : `✗ Runbook score ${score}/100. Need ≥70. Add: ${[
          !hasArchitecture ? "architecture section" : null,
          !hasRunbook ? "operations runbook" : null,
          !hasTroubleshooting ? "troubleshooting guide" : null,
        ]
          .filter(Boolean)
          .join(", ")}`,
  };
}
