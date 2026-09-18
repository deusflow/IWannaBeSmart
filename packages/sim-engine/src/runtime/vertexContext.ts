/**
 * @file packages/sim-engine/src/runtime/vertexContext.ts
 * @description Virtual Vertex AI simulation context for Station 06: Vertex AI Architect.
 * Models an ML pipeline on Google Cloud: data ingestion → training → serving → monitoring.
 */

export type VertexPipelineStatus =
  | "idle"
  | "ingesting"
  | "preprocessing"
  | "training"
  | "evaluating"
  | "serving"
  | "monitoring"
  | "failed";

export type VertexHardwareType =
  | "n1-standard-4"
  | "n1-highmem-8"
  | "a2-highgpu-1g"
  | "tpu-v4-8";

export type VertexAuthPolicy = "open" | "service-account" | "iam-restricted";

export interface VertexEndpointConfig {
  minReplicas: number;
  maxReplicas: number;
  trafficSplitPercent: number; // 0-100 to new model
  autoscalingEnabled: boolean;
}

export interface VertexMonitoringConfig {
  driftThreshold: number; // 0.0 - 1.0
  latencySloMs: number;
  alertEmail: string;
  retrainingTriggerEnabled: boolean;
}

export interface VertexIamConfig {
  vpcPeeringEnabled: boolean;
  serviceAccountEmail: string;
  deniedRoles: string[];
  dataResidencyRegion: "us-central1" | "eu-west1" | "asia-east1";
}

export interface VirtualVertexState {
  pipelineStatus: VertexPipelineStatus;
  hardwareType: VertexHardwareType;
  batchSize: number;
  learningRate: number;
  gcsBucket: string | null;
  preprocessingStep: "none" | "normalize" | "augment" | "both";
  modelVersion: number;
  accuracy: number; // 0.0 - 1.0
  latencyMs: number;
  driftScore: number; // 0.0 - 1.0
  endpointConfig: VertexEndpointConfig;
  monitoringConfig: VertexMonitoringConfig;
  iamConfig: VertexIamConfig;
  authPolicy: VertexAuthPolicy;
  deploymentLogs: string[];
  alerts: string[];
  costPerHour: number; // USD
}

export const INITIAL_VERTEX_STATE: VirtualVertexState = {
  pipelineStatus: "idle",
  hardwareType: "n1-standard-4",
  batchSize: 32,
  learningRate: 0.001,
  gcsBucket: null,
  preprocessingStep: "none",
  modelVersion: 0,
  accuracy: 0,
  latencyMs: 0,
  driftScore: 0,
  endpointConfig: {
    minReplicas: 1,
    maxReplicas: 1,
    trafficSplitPercent: 0,
    autoscalingEnabled: false,
  },
  monitoringConfig: {
    driftThreshold: 0.15,
    latencySloMs: 200,
    alertEmail: "",
    retrainingTriggerEnabled: false,
  },
  iamConfig: {
    vpcPeeringEnabled: false,
    serviceAccountEmail: "",
    deniedRoles: [],
    dataResidencyRegion: "us-central1",
  },
  authPolicy: "open",
  deploymentLogs: [],
  alerts: [],
  costPerHour: 0.19,
};

export interface VertexCommandResult {
  success: boolean;
  newState: VirtualVertexState;
  output: string;
  logs: string[];
}

const HARDWARE_COSTS: Record<VertexHardwareType, number> = {
  "n1-standard-4": 0.19,
  "n1-highmem-8": 0.47,
  "a2-highgpu-1g": 3.67,
  "tpu-v4-8": 12.88,
};

const HARDWARE_ACCURACY_BOOST: Record<VertexHardwareType, number> = {
  "n1-standard-4": 0.0,
  "n1-highmem-8": 0.03,
  "a2-highgpu-1g": 0.07,
  "tpu-v4-8": 0.10,
};

/**
 * Simulate connecting a GCS bucket data source.
 */
export function connectGcsBucket(
  state: VirtualVertexState,
  bucketUri: string
): VertexCommandResult {
  if (!bucketUri.startsWith("gs://")) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Invalid GCS URI '${bucketUri}'. Must start with gs://`,
      logs: [`[GCS] Connection refused: invalid URI format`],
    };
  }
  const newState: VirtualVertexState = {
    ...state,
    gcsBucket: bucketUri,
    pipelineStatus: "ingesting",
    deploymentLogs: [
      ...state.deploymentLogs,
      `[GCS] Connected to ${bucketUri}`,
      `[GCS] Metadata scan: 42,000 samples found`,
    ],
  };
  return {
    success: true,
    newState,
    output: `✓ Bucket ${bucketUri} mounted. 42,000 training samples available.`,
    logs: newState.deploymentLogs.slice(-2),
  };
}

/**
 * Set preprocessing pipeline step.
 */
export function setPreprocessingStep(
  state: VirtualVertexState,
  step: VirtualVertexState["preprocessingStep"]
): VertexCommandResult {
  if (state.gcsBucket === null) {
    return {
      success: false,
      newState: state,
      output: "ERROR: No data source connected. Connect a GCS bucket first.",
      logs: [`[PIPELINE] Preprocessing step rejected: no data source`],
    };
  }
  const newState: VirtualVertexState = {
    ...state,
    preprocessingStep: step,
    pipelineStatus: "preprocessing",
    deploymentLogs: [
      ...state.deploymentLogs,
      `[PIPELINE] Preprocessing step set: ${step}`,
    ],
  };
  return {
    success: true,
    newState,
    output: `✓ Preprocessing step '${step}' configured.`,
    logs: newState.deploymentLogs.slice(-1),
  };
}

/**
 * Configure training hardware and hyperparameters, then simulate training.
 */
export function runTraining(
  state: VirtualVertexState,
  hardware: VertexHardwareType,
  batchSize: number,
  learningRate: number
): VertexCommandResult {
  if (state.gcsBucket === null) {
    return {
      success: false,
      newState: state,
      output: "ERROR: No data source connected.",
      logs: [`[TRAINING] Job rejected: no GCS bucket`],
    };
  }
  if (batchSize < 8 || batchSize > 2048) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Invalid batch size ${batchSize}. Must be between 8 and 2048.`,
      logs: [`[TRAINING] Hyperparameter validation failed: batchSize=${batchSize}`],
    };
  }
  if (learningRate <= 0 || learningRate > 0.1) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Learning rate ${learningRate} out of range. Use 0.00001–0.1.`,
      logs: [`[TRAINING] Hyperparameter validation failed: lr=${learningRate}`],
    };
  }

  // Simulate accuracy based on hardware + hyperparams
  const baseAccuracy = 0.74 + HARDWARE_ACCURACY_BOOST[hardware];
  const batchBoost = batchSize >= 64 && batchSize <= 256 ? 0.02 : 0;
  const lrBoost =
    learningRate >= 0.0001 && learningRate <= 0.01 ? 0.02 : -0.01;
  const accuracy = Math.min(0.98, baseAccuracy + batchBoost + lrBoost);

  const latencyMs =
    hardware === "tpu-v4-8"
      ? 18
      : hardware === "a2-highgpu-1g"
      ? 32
      : hardware === "n1-highmem-8"
      ? 68
      : 120;

  const newState: VirtualVertexState = {
    ...state,
    hardwareType: hardware,
    batchSize,
    learningRate,
    pipelineStatus: "evaluating",
    modelVersion: state.modelVersion + 1,
    accuracy,
    latencyMs,
    costPerHour: HARDWARE_COSTS[hardware],
    deploymentLogs: [
      ...state.deploymentLogs,
      `[TRAINING] Started on ${hardware}, batch=${batchSize}, lr=${learningRate}`,
      `[TRAINING] Epoch 10/10 — loss: 0.142 — val_acc: ${accuracy.toFixed(3)}`,
      `[EVAL] Model v${state.modelVersion + 1} registered in Vertex Model Registry`,
    ],
  };

  return {
    success: true,
    newState,
    output: `✓ Training complete. Model v${newState.modelVersion}: accuracy=${accuracy.toFixed(3)}, latency=${latencyMs}ms, cost=$${HARDWARE_COSTS[hardware]}/hr`,
    logs: newState.deploymentLogs.slice(-3),
  };
}

/**
 * Configure serving endpoint with autoscaling.
 */
export function configureEndpoint(
  state: VirtualVertexState,
  config: VertexEndpointConfig
): VertexCommandResult {
  if (state.modelVersion === 0) {
    return {
      success: false,
      newState: state,
      output: "ERROR: No trained model available. Run training first.",
      logs: [`[ENDPOINT] Deploy rejected: no model in registry`],
    };
  }
  if (config.minReplicas < 1 || config.maxReplicas > 20) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Replicas must be min≥1, max≤20.`,
      logs: [`[ENDPOINT] Invalid replica config: min=${config.minReplicas}, max=${config.maxReplicas}`],
    };
  }
  if (config.trafficSplitPercent < 0 || config.trafficSplitPercent > 100) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Traffic split must be 0–100%.`,
      logs: [`[ENDPOINT] Invalid traffic split: ${config.trafficSplitPercent}%`],
    };
  }

  const newState: VirtualVertexState = {
    ...state,
    endpointConfig: config,
    pipelineStatus: "serving",
    deploymentLogs: [
      ...state.deploymentLogs,
      `[ENDPOINT] Deployed model v${state.modelVersion} to prediction endpoint`,
      `[ENDPOINT] Autoscaling: ${config.autoscalingEnabled ? "ON" : "OFF"}, replicas: ${config.minReplicas}–${config.maxReplicas}`,
      `[ENDPOINT] Traffic split: ${config.trafficSplitPercent}% to new model`,
    ],
  };

  return {
    success: true,
    newState,
    output: `✓ Endpoint live. Serving model v${state.modelVersion} with ${config.minReplicas}–${config.maxReplicas} replicas.`,
    logs: newState.deploymentLogs.slice(-3),
  };
}

/**
 * Configure IAM and VPC for the ML endpoint.
 */
export function configureIam(
  state: VirtualVertexState,
  iamConfig: VertexIamConfig,
  authPolicy: VertexAuthPolicy
): VertexCommandResult {
  if (
    authPolicy === "service-account" &&
    !iamConfig.serviceAccountEmail.includes("@")
  ) {
    return {
      success: false,
      newState: state,
      output: `ERROR: Service account email '${iamConfig.serviceAccountEmail}' is invalid.`,
      logs: [`[IAM] Service account validation failed`],
    };
  }

  const newState: VirtualVertexState = {
    ...state,
    iamConfig,
    authPolicy,
    deploymentLogs: [
      ...state.deploymentLogs,
      `[IAM] Auth policy: ${authPolicy}`,
      `[IAM] VPC Peering: ${iamConfig.vpcPeeringEnabled ? "ENABLED" : "DISABLED"}`,
      `[IAM] Data residency locked to ${iamConfig.dataResidencyRegion}`,
    ],
  };

  return {
    success: true,
    newState,
    output: `✓ IAM configured. Auth: ${authPolicy}, VPC peering: ${iamConfig.vpcPeeringEnabled}.`,
    logs: newState.deploymentLogs.slice(-3),
  };
}

/**
 * Simulate time passing and drift accumulation, then evaluate monitoring response.
 */
export function checkMonitoring(
  state: VirtualVertexState,
  monitoringConfig: VertexMonitoringConfig
): VertexCommandResult {
  if (state.pipelineStatus !== "serving") {
    return {
      success: false,
      newState: state,
      output: "ERROR: Endpoint is not serving. Deploy a model first.",
      logs: [`[MONITORING] Cannot monitor: endpoint not active`],
    };
  }

  // Simulate drift over time
  const simulatedDrift = 0.22; // 22% drift detected
  const driftAlert =
    simulatedDrift > monitoringConfig.driftThreshold
      ? `ALERT: Feature drift ${simulatedDrift.toFixed(2)} > threshold ${monitoringConfig.driftThreshold}`
      : null;

  const latencyAlert =
    state.latencyMs > monitoringConfig.latencySloMs
      ? `ALERT: P99 latency ${state.latencyMs}ms exceeds SLO ${monitoringConfig.latencySloMs}ms`
      : null;

  const alerts: string[] = [];
  if (driftAlert) alerts.push(driftAlert);
  if (latencyAlert) alerts.push(latencyAlert);

  const newState: VirtualVertexState = {
    ...state,
    driftScore: simulatedDrift,
    monitoringConfig,
    pipelineStatus:
      driftAlert && monitoringConfig.retrainingTriggerEnabled
        ? "idle"
        : "monitoring",
    alerts: [...state.alerts, ...alerts],
    deploymentLogs: [
      ...state.deploymentLogs,
      `[MONITORING] Drift scan completed: score=${simulatedDrift.toFixed(3)}`,
      ...alerts,
      monitoringConfig.retrainingTriggerEnabled && driftAlert
        ? `[MONITORING] Auto-retraining triggered`
        : `[MONITORING] No automatic action taken`,
    ],
  };

  return {
    success: alerts.length === 0 || monitoringConfig.retrainingTriggerEnabled,
    newState,
    output:
      alerts.length > 0
        ? `⚠ ${alerts.length} alert(s) detected. ${monitoringConfig.retrainingTriggerEnabled ? "Auto-retraining triggered." : "Manual action required."}`
        : `✓ All metrics within SLO. No drift detected.`,
    logs: newState.deploymentLogs.slice(-3),
  };
}
