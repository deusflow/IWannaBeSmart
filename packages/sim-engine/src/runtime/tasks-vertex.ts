/**
 * @file packages/sim-engine/src/runtime/tasks-vertex.ts
 * @description Educational curriculum tasks for Station 06: Vertex AI Architect.
 * 15 tasks across 5 rounds: Data Pipeline → Training → Serving → IAM → Monitoring.
 * Target role: AI/ML Software Engineer (Cloud) @ Google Cloud.
 */

import type { WorkedExample } from "./types";
import type {
  VirtualVertexState,
  VertexCommandResult,
  VertexHardwareType,
  VertexAuthPolicy,
} from "./vertexContext";
import { INITIAL_VERTEX_STATE } from "./vertexContext";
import { WORKED_EXAMPLES } from "./workedExamplesData";

export interface VertexTask {
  id: string;
  order: number;
  round: 1 | 2 | 3 | 4 | 5;
  roundNameKey: string;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  simpleExplanationKey?: string;
  engineeringKey?: string;
  workedExample?: WorkedExample;
  successKey: string;
  targetCode: {
    python: string;
    yaml: string;
  };
  clozeTemplate: {
    python: string;
    yaml: string;
  };
  initialState: VirtualVertexState;
  validate: (
    before: VirtualVertexState,
    after: VirtualVertexState,
    result: VertexCommandResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const VERTEX_TASKS: VertexTask[] = [
  // ══════════════════════════════════════════════════════
  // ROUND 1: DATA PIPELINE (Tasks 1–3)
  // ══════════════════════════════════════════════════════

  {
    id: "task-vertex-1-gcs-connect",
    order: 1,
    round: 1,
    roundNameKey: "vertex.rounds.dataPipeline",
    titleKey: "vertex.tasks.task1.title",
    conceptKey: "vertex.tasks.task1.concept",
    descKey: "vertex.tasks.task1.desc",
    hintKey: "vertex.tasks.task1.hint",
    simpleExplanationKey: "vertex.tasks.task1.simple",
    engineeringKey: "vertex.tasks.task1.engineering",
    successKey: "vertex.tasks.task1.success",
    workedExample: WORKED_EXAMPLES["task-vertex-1-gcs-connect"],
    targetCode: {
      python: `from google.cloud import storage\n\nclient = storage.Client(project="ml-prod-project")\nbucket = client.bucket("gs://retail-training-data")\nblob = bucket.blob("dataset/features.csv")\nblob.download_to_filename("/tmp/features.csv")\nprint("Data downloaded:", blob.size, "bytes")`,
      yaml: `dataSource:\n  type: gcs\n  uri: gs://retail-training-data\n  path: dataset/features.csv\n  format: csv`,
    },
    clozeTemplate: {
      python: `from google.cloud import storage\n\nclient = storage.Client(project="ml-prod-project")\nbucket = client.bucket("gs://___")\nblob = bucket.blob("___/features.csv")\nblob.download_to_filename("/tmp/features.csv")`,
      yaml: `dataSource:\n  type: ___\n  uri: ___://retail-training-data\n  path: dataset/features.csv`,
    },
    initialState: INITIAL_VERTEX_STATE,
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasGcs =
        c.includes("gs://") || c.includes("gcs") || c.includes("storage");
      const passed = after.gcsBucket !== null || hasGcs;
      return {
        passed,
        messageKey: passed
          ? "vertex.tasks.task1.success"
          : "vertex.tasks.task1.hint",
      };
    },
  },

  {
    id: "task-vertex-2-preprocessing",
    order: 2,
    round: 1,
    roundNameKey: "vertex.rounds.dataPipeline",
    titleKey: "vertex.tasks.task2.title",
    conceptKey: "vertex.tasks.task2.concept",
    descKey: "vertex.tasks.task2.desc",
    hintKey: "vertex.tasks.task2.hint",
    simpleExplanationKey: "vertex.tasks.task2.simple",
    engineeringKey: "vertex.tasks.task2.engineering",
    successKey: "vertex.tasks.task2.success",
    workedExample: WORKED_EXAMPLES["task-vertex-2-preprocessing"],
    targetCode: {
      python: `from sklearn.preprocessing import StandardScaler\nimport pandas as pd\n\ndf = pd.read_csv("/tmp/features.csv")\nscaler = StandardScaler()\ndf[numeric_cols] = scaler.fit_transform(df[numeric_cols])\ndf.to_csv("/tmp/features_normalized.csv", index=False)\nprint("Preprocessing done:", df.shape)`,
      yaml: `preprocessing:\n  steps:\n    - type: normalize\n      columns: all_numeric\n    - type: fillna\n      strategy: median`,
    },
    clozeTemplate: {
      python: `from sklearn.preprocessing import ___\n\nscaler = ___()\ndf[numeric_cols] = scaler.fit_transform(df[numeric_cols])`,
      yaml: `preprocessing:\n  steps:\n    - type: ___\n      columns: all_numeric`,
    },
    initialState: { ...INITIAL_VERTEX_STATE, gcsBucket: "gs://retail-training-data", pipelineStatus: "ingesting" },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasPrep =
        c.includes("normalize") ||
        c.includes("standardscaler") ||
        c.includes("preprocessing") ||
        after.preprocessingStep !== "none";
      return {
        passed: hasPrep,
        messageKey: hasPrep ? "vertex.tasks.task2.success" : "vertex.tasks.task2.hint",
      };
    },
  },

  {
    id: "task-vertex-3-pipeline-yaml",
    order: 3,
    round: 1,
    roundNameKey: "vertex.rounds.dataPipeline",
    titleKey: "vertex.tasks.task3.title",
    conceptKey: "vertex.tasks.task3.concept",
    descKey: "vertex.tasks.task3.desc",
    hintKey: "vertex.tasks.task3.hint",
    simpleExplanationKey: "vertex.tasks.task3.simple",
    engineeringKey: "vertex.tasks.task3.engineering",
    successKey: "vertex.tasks.task3.success",
    workedExample: WORKED_EXAMPLES["task-vertex-3-pipeline-yaml"],
    targetCode: {
      python: `from google.cloud import aiplatform\n\naiplatform.init(project="ml-prod-project", location="us-central1")\njob = aiplatform.CustomTrainingJob(\n    display_name="retail-classifier-v2",\n    script_path="train.py",\n    container_uri="us-docker.pkg.dev/vertex-ai/training/pytorch-gpu.1-13:latest",\n)`,
      yaml: `pipeline:\n  name: retail-data-pipeline\n  components:\n    - name: ingest\n      type: gcs-reader\n      output: raw_dataset\n    - name: preprocess\n      type: normalize\n      input: raw_dataset\n      output: clean_dataset\n    - name: split\n      type: train-test-split\n      ratio: 0.8\n      input: clean_dataset`,
    },
    clozeTemplate: {
      python: `from google.cloud import aiplatform\n\naiplatform.init(project="___", location="___")\njob = aiplatform.CustomTrainingJob(\n    display_name="retail-classifier-v2",\n    script_path="train.py",\n    container_uri="___",\n)`,
      yaml: `pipeline:\n  name: retail-data-pipeline\n  components:\n    - name: ingest\n      type: ___\n    - name: preprocess\n      type: ___\n    - name: split\n      type: train-test-split\n      ratio: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      preprocessingStep: "normalize",
      pipelineStatus: "preprocessing",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasVertex =
        c.includes("aiplatform") || c.includes("vertex") || c.includes("pipeline");
      const hasPipeline =
        c.includes("pipeline") || c.includes("components") || after.pipelineStatus !== "idle";
      const passed = hasVertex && hasPipeline;
      return {
        passed,
        messageKey: passed ? "vertex.tasks.task3.success" : "vertex.tasks.task3.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 2: TRAINING CONFIG (Tasks 4–6)
  // ══════════════════════════════════════════════════════

  {
    id: "task-vertex-4-hardware-selection",
    order: 4,
    round: 2,
    roundNameKey: "vertex.rounds.trainingConfig",
    titleKey: "vertex.tasks.task4.title",
    conceptKey: "vertex.tasks.task4.concept",
    descKey: "vertex.tasks.task4.desc",
    hintKey: "vertex.tasks.task4.hint",
    simpleExplanationKey: "vertex.tasks.task4.simple",
    engineeringKey: "vertex.tasks.task4.engineering",
    successKey: "vertex.tasks.task4.success",
    workedExample: WORKED_EXAMPLES["task-vertex-4-hardware-selection"],
    targetCode: {
      python: `# Cost-optimized: A100 GPU for image classification\nworker_pool_specs = [{\n    "machine_spec": {\n        "machine_type": "a2-highgpu-1g",\n        "accelerator_type": "NVIDIA_TESLA_A100",\n        "accelerator_count": 1,\n    },\n    "replica_count": 1,\n    "container_spec": {"image_uri": container_uri},\n}]`,
      yaml: `training:\n  machineType: a2-highgpu-1g\n  accelerator:\n    type: NVIDIA_TESLA_A100\n    count: 1\n  replicaCount: 1`,
    },
    clozeTemplate: {
      python: `worker_pool_specs = [{\n    "machine_spec": {\n        "machine_type": "___",\n        "accelerator_type": "___",\n        "accelerator_count": ___,\n    },\n}]`,
      yaml: `training:\n  machineType: ___\n  accelerator:\n    type: ___\n    count: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      preprocessingStep: "normalize",
      pipelineStatus: "preprocessing",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasHardware =
        c.includes("machine_type") ||
        c.includes("machinetype") ||
        c.includes("accelerator") ||
        c.includes("a2-highgpu") ||
        c.includes("tpu");
      const passed = hasHardware || after.hardwareType !== "n1-standard-4";
      return {
        passed,
        messageKey: passed ? "vertex.tasks.task4.success" : "vertex.tasks.task4.hint",
      };
    },
  },

  {
    id: "task-vertex-5-hyperparams",
    order: 5,
    round: 2,
    roundNameKey: "vertex.rounds.trainingConfig",
    titleKey: "vertex.tasks.task5.title",
    conceptKey: "vertex.tasks.task5.concept",
    descKey: "vertex.tasks.task5.desc",
    hintKey: "vertex.tasks.task5.hint",
    simpleExplanationKey: "vertex.tasks.task5.simple",
    engineeringKey: "vertex.tasks.task5.engineering",
    successKey: "vertex.tasks.task5.success",
    workedExample: WORKED_EXAMPLES["task-vertex-5-hyperparams"],
    targetCode: {
      python: `from google.cloud.aiplatform import HyperparameterTuningJob\n\nhp_job = HyperparameterTuningJob(\n    display_name="retail-hp-search",\n    custom_job=custom_job,\n    metric_spec={"val_accuracy": "maximize"},\n    parameter_spec={\n        "learning_rate": aiplatform.hyperparameter_tuning.DoubleParameterSpec(min=1e-4, max=1e-1, scale="log"),\n        "batch_size": aiplatform.hyperparameter_tuning.DiscreteParameterSpec(values=[32, 64, 128, 256]),\n    },\n    max_trial_count=20,\n    parallel_trial_count=4,\n)`,
      yaml: `hyperparameterTuning:\n  metric: val_accuracy\n  goal: maximize\n  trials: 20\n  parallel: 4\n  parameters:\n    learning_rate:\n      type: double\n      min: 0.0001\n      max: 0.1\n      scale: log\n    batch_size:\n      type: discrete\n      values: [32, 64, 128, 256]`,
    },
    clozeTemplate: {
      python: `hp_job = HyperparameterTuningJob(\n    metric_spec={"val_accuracy": "___"},\n    parameter_spec={\n        "learning_rate": aiplatform.hyperparameter_tuning.DoubleParameterSpec(min=___, max=___, scale="___"),\n        "batch_size": aiplatform.hyperparameter_tuning.DiscreteParameterSpec(values=[___]),\n    },\n)`,
      yaml: `hyperparameterTuning:\n  metric: val_accuracy\n  goal: ___\n  parameters:\n    learning_rate:\n      min: ___\n      max: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      preprocessingStep: "normalize",
      hardwareType: "a2-highgpu-1g" as VertexHardwareType,
      pipelineStatus: "preprocessing",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasHp =
        c.includes("learning_rate") ||
        c.includes("batch_size") ||
        c.includes("hyperparameter") ||
        (after.learningRate > 0 && after.batchSize > 0);
      return {
        passed: hasHp,
        messageKey: hasHp ? "vertex.tasks.task5.success" : "vertex.tasks.task5.hint",
      };
    },
  },

  {
    id: "task-vertex-6-run-training",
    order: 6,
    round: 2,
    roundNameKey: "vertex.rounds.trainingConfig",
    titleKey: "vertex.tasks.task6.title",
    conceptKey: "vertex.tasks.task6.concept",
    descKey: "vertex.tasks.task6.desc",
    hintKey: "vertex.tasks.task6.hint",
    simpleExplanationKey: "vertex.tasks.task6.simple",
    engineeringKey: "vertex.tasks.task6.engineering",
    successKey: "vertex.tasks.task6.success",
    workedExample: WORKED_EXAMPLES["task-vertex-6-run-training"],
    targetCode: {
      python: `job.run(\n    dataset=training_dataset,\n    target_column="purchase_intent",\n    training_fraction_split=0.8,\n    validation_fraction_split=0.1,\n    test_fraction_split=0.1,\n    machine_type="a2-highgpu-1g",\n    replica_count=1,\n    model_display_name="retail-classifier-v2",\n)`,
      yaml: `run:\n  dataset: training_dataset\n  targetColumn: purchase_intent\n  split:\n    train: 0.8\n    validation: 0.1\n    test: 0.1\n  hardware: a2-highgpu-1g`,
    },
    clozeTemplate: {
      python: `job.run(\n    dataset=training_dataset,\n    target_column="___",\n    training_fraction_split=___,\n    validation_fraction_split=___,\n    machine_type="___",\n)`,
      yaml: `run:\n  targetColumn: ___\n  split:\n    train: ___\n    validation: ___\n  hardware: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      preprocessingStep: "normalize",
      hardwareType: "a2-highgpu-1g" as VertexHardwareType,
      batchSize: 128,
      learningRate: 0.001,
      pipelineStatus: "preprocessing",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasRun =
        c.includes(".run(") || c.includes("job.run") || c.includes("execute");
      const trained = after.modelVersion > 0 || hasRun;
      return {
        passed: trained,
        messageKey: trained ? "vertex.tasks.task6.success" : "vertex.tasks.task6.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 3: SERVING ENDPOINT (Tasks 7–9)
  // ══════════════════════════════════════════════════════

  {
    id: "task-vertex-7-deploy-endpoint",
    order: 7,
    round: 3,
    roundNameKey: "vertex.rounds.servingEndpoint",
    titleKey: "vertex.tasks.task7.title",
    conceptKey: "vertex.tasks.task7.concept",
    descKey: "vertex.tasks.task7.desc",
    hintKey: "vertex.tasks.task7.hint",
    simpleExplanationKey: "vertex.tasks.task7.simple",
    engineeringKey: "vertex.tasks.task7.engineering",
    successKey: "vertex.tasks.task7.success",
    workedExample: WORKED_EXAMPLES["task-vertex-7-deploy-endpoint"],
    targetCode: {
      python: `endpoint = aiplatform.Endpoint.create(\n    display_name="retail-classifier-endpoint",\n    project="ml-prod-project",\n    location="us-central1",\n)\n\nmodel.deploy(\n    endpoint=endpoint,\n    dedicated_resources_machine_type="n1-standard-4",\n    dedicated_resources_min_replica_count=1,\n    dedicated_resources_max_replica_count=5,\n    traffic_percentage=100,\n)`,
      yaml: `endpoint:\n  displayName: retail-classifier-endpoint\n  model: retail-classifier-v2\n  traffic: 100\n  replicas:\n    min: 1\n    max: 5\n  machineType: n1-standard-4`,
    },
    clozeTemplate: {
      python: `endpoint = aiplatform.Endpoint.create(\n    display_name="retail-classifier-endpoint",\n)\n\nmodel.deploy(\n    endpoint=endpoint,\n    dedicated_resources_min_replica_count=___,\n    dedicated_resources_max_replica_count=___,\n    traffic_percentage=___,\n)`,
      yaml: `endpoint:\n  traffic: ___\n  replicas:\n    min: ___\n    max: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      modelVersion: 1,
      accuracy: 0.91,
      latencyMs: 32,
      pipelineStatus: "evaluating",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasDeploy =
        c.includes("deploy") || c.includes("endpoint") || c.includes("serving");
      const passed = after.pipelineStatus === "serving" || hasDeploy;
      return {
        passed,
        messageKey: passed ? "vertex.tasks.task7.success" : "vertex.tasks.task7.hint",
      };
    },
  },

  {
    id: "task-vertex-8-autoscaling",
    order: 8,
    round: 3,
    roundNameKey: "vertex.rounds.servingEndpoint",
    titleKey: "vertex.tasks.task8.title",
    conceptKey: "vertex.tasks.task8.concept",
    descKey: "vertex.tasks.task8.desc",
    hintKey: "vertex.tasks.task8.hint",
    simpleExplanationKey: "vertex.tasks.task8.simple",
    engineeringKey: "vertex.tasks.task8.engineering",
    successKey: "vertex.tasks.task8.success",
    workedExample: WORKED_EXAMPLES["task-vertex-8-autoscaling"],
    targetCode: {
      python: `# Autoscaling configuration for prediction endpoint\nendpoint.update(\n    machine_type="n1-standard-4",\n    min_replica_count=2,\n    max_replica_count=10,\n    autoscaling_target_requests_per_second=50,\n)`,
      yaml: `autoscaling:\n  enabled: true\n  minReplicas: 2\n  maxReplicas: 10\n  targetRPS: 50\n  cooldownPeriodSeconds: 120`,
    },
    clozeTemplate: {
      python: `endpoint.update(\n    min_replica_count=___,\n    max_replica_count=___,\n    autoscaling_target_requests_per_second=___,\n)`,
      yaml: `autoscaling:\n  enabled: ___\n  minReplicas: ___\n  maxReplicas: ___\n  targetRPS: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      modelVersion: 1,
      accuracy: 0.91,
      latencyMs: 32,
      pipelineStatus: "serving",
      endpointConfig: {
        minReplicas: 1,
        maxReplicas: 1,
        trafficSplitPercent: 100,
        autoscalingEnabled: false,
      },
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasAutoscale =
        c.includes("autoscal") ||
        c.includes("max_replica") ||
        c.includes("maxreplicas") ||
        after.endpointConfig.autoscalingEnabled ||
        after.endpointConfig.maxReplicas > 1;
      return {
        passed: hasAutoscale,
        messageKey: hasAutoscale ? "vertex.tasks.task8.success" : "vertex.tasks.task8.hint",
      };
    },
  },

  {
    id: "task-vertex-9-ab-traffic",
    order: 9,
    round: 3,
    roundNameKey: "vertex.rounds.servingEndpoint",
    titleKey: "vertex.tasks.task9.title",
    conceptKey: "vertex.tasks.task9.concept",
    descKey: "vertex.tasks.task9.desc",
    hintKey: "vertex.tasks.task9.hint",
    simpleExplanationKey: "vertex.tasks.task9.simple",
    engineeringKey: "vertex.tasks.task9.engineering",
    successKey: "vertex.tasks.task9.success",
    workedExample: WORKED_EXAMPLES["task-vertex-9-ab-traffic"],
    targetCode: {
      python: `# A/B traffic split: 90% stable model, 10% new candidate\nendpoint.deploy(\n    model=new_model,\n    traffic_split={\n        existing_deployed_model_id: 90,\n        new_model.resource_name: 10,\n    },\n)`,
      yaml: `trafficSplit:\n  stableModel:\n    percentage: 90\n    modelVersion: v2\n  candidateModel:\n    percentage: 10\n    modelVersion: v3`,
    },
    clozeTemplate: {
      python: `endpoint.deploy(\n    model=new_model,\n    traffic_split={\n        existing_deployed_model_id: ___,\n        new_model.resource_name: ___,\n    },\n)`,
      yaml: `trafficSplit:\n  stableModel:\n    percentage: ___\n  candidateModel:\n    percentage: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      gcsBucket: "gs://retail-training-data",
      modelVersion: 2,
      accuracy: 0.93,
      latencyMs: 28,
      pipelineStatus: "serving",
      endpointConfig: {
        minReplicas: 2,
        maxReplicas: 10,
        trafficSplitPercent: 100,
        autoscalingEnabled: true,
      },
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasTrafficSplit =
        c.includes("traffic_split") ||
        c.includes("trafficsplit") ||
        c.includes("percentage") ||
        (after.endpointConfig.trafficSplitPercent > 0 &&
          after.endpointConfig.trafficSplitPercent < 100);
      return {
        passed: hasTrafficSplit,
        messageKey: hasTrafficSplit
          ? "vertex.tasks.task9.success"
          : "vertex.tasks.task9.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 4: IAM & NETWORKING (Tasks 10–12)
  // ══════════════════════════════════════════════════════

  {
    id: "task-vertex-10-service-account",
    order: 10,
    round: 4,
    roundNameKey: "vertex.rounds.iamNetworking",
    titleKey: "vertex.tasks.task10.title",
    conceptKey: "vertex.tasks.task10.concept",
    descKey: "vertex.tasks.task10.desc",
    hintKey: "vertex.tasks.task10.hint",
    simpleExplanationKey: "vertex.tasks.task10.simple",
    engineeringKey: "vertex.tasks.task10.engineering",
    successKey: "vertex.tasks.task10.success",
    workedExample: WORKED_EXAMPLES["task-vertex-10-service-account"],
    targetCode: {
      python: `# Principle of least privilege: custom SA with minimal roles\nfrom google.cloud import iam_v1\n\nsa_email = "vertex-predictor@ml-prod-project.iam.gserviceaccount.com"\n# Grant only required roles\nbindings = [\n    "roles/aiplatform.user",\n    "roles/storage.objectViewer",  # Read training data\n]\n# Explicitly deny admin roles\ndeny_policy = iam_v1.DenyRule(\n    denied_principals=["serviceAccount:" + sa_email],\n    denied_permissions=["aiplatform.models.delete", "storage.buckets.delete"],\n)`,
      yaml: `serviceAccount:\n  email: vertex-predictor@ml-prod-project.iam.gserviceaccount.com\n  roles:\n    - roles/aiplatform.user\n    - roles/storage.objectViewer\n  deniedPermissions:\n    - aiplatform.models.delete\n    - storage.buckets.delete`,
    },
    clozeTemplate: {
      python: `sa_email = "vertex-predictor@ml-prod-project.iam.gserviceaccount.com"\nbindings = [\n    "roles/aiplatform.___",\n    "roles/storage.___",\n]\ndeny_policy = iam_v1.DenyRule(\n    denied_permissions=["aiplatform.models.___", "storage.buckets.___"],\n)`,
      yaml: `serviceAccount:\n  roles:\n    - roles/aiplatform.___\n    - roles/storage.___\n  deniedPermissions:\n    - aiplatform.models.___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      pipelineStatus: "serving",
      endpointConfig: { minReplicas: 2, maxReplicas: 10, trafficSplitPercent: 10, autoscalingEnabled: true },
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasIam =
        c.includes("serviceaccount") ||
        c.includes("service_account") ||
        c.includes("roles/aiplatform") ||
        c.includes("deny") ||
        after.iamConfig.serviceAccountEmail.length > 0;
      return {
        passed: hasIam,
        messageKey: hasIam ? "vertex.tasks.task10.success" : "vertex.tasks.task10.hint",
      };
    },
  },

  {
    id: "task-vertex-11-vpc-peering",
    order: 11,
    round: 4,
    roundNameKey: "vertex.rounds.iamNetworking",
    titleKey: "vertex.tasks.task11.title",
    conceptKey: "vertex.tasks.task11.concept",
    descKey: "vertex.tasks.task11.desc",
    hintKey: "vertex.tasks.task11.hint",
    simpleExplanationKey: "vertex.tasks.task11.simple",
    engineeringKey: "vertex.tasks.task11.engineering",
    successKey: "vertex.tasks.task11.success",
    workedExample: WORKED_EXAMPLES["task-vertex-11-vpc-peering"],
    targetCode: {
      python: `# VPC peering: private connectivity without public internet\nfrom google.cloud import compute_v1\n\nnetwork = "projects/ml-prod-project/global/networks/ml-vpc"\naiplatform.init(\n    project="ml-prod-project",\n    location="us-central1",\n    network=network,  # ← enables VPC peering\n)\n# All Vertex AI traffic stays within private network\nprint("VPC peering enabled — no public IPs exposed")`,
      yaml: `networking:\n  vpcPeering:\n    enabled: true\n    network: ml-vpc\n    project: ml-prod-project\n  publicEndpoint: false\n  privateServiceConnect: true`,
    },
    clozeTemplate: {
      python: `network = "projects/ml-prod-project/global/networks/___"\naiplatform.init(\n    project="ml-prod-project",\n    network=___,\n)`,
      yaml: `networking:\n  vpcPeering:\n    enabled: ___\n    network: ___\n  publicEndpoint: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      pipelineStatus: "serving",
      iamConfig: {
        vpcPeeringEnabled: false,
        serviceAccountEmail: "vertex-predictor@ml-prod-project.iam.gserviceaccount.com",
        deniedRoles: ["aiplatform.admin"],
        dataResidencyRegion: "us-central1",
      },
      authPolicy: "service-account" as VertexAuthPolicy,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasVpc =
        c.includes("vpc") || c.includes("network") || c.includes("peering") ||
        after.iamConfig.vpcPeeringEnabled;
      return {
        passed: hasVpc,
        messageKey: hasVpc ? "vertex.tasks.task11.success" : "vertex.tasks.task11.hint",
      };
    },
  },

  {
    id: "task-vertex-12-data-residency",
    order: 12,
    round: 4,
    roundNameKey: "vertex.rounds.iamNetworking",
    titleKey: "vertex.tasks.task12.title",
    conceptKey: "vertex.tasks.task12.concept",
    descKey: "vertex.tasks.task12.desc",
    hintKey: "vertex.tasks.task12.hint",
    simpleExplanationKey: "vertex.tasks.task12.simple",
    engineeringKey: "vertex.tasks.task12.engineering",
    successKey: "vertex.tasks.task12.success",
    workedExample: WORKED_EXAMPLES["task-vertex-12-data-residency"],
    targetCode: {
      python: `# GDPR compliance: EU data residency enforcement\naiplatform.init(\n    project="ml-prod-project",\n    location="eu-west1",  # ← EU region only\n)\n# Ensure GCS bucket is also in EU\nbucket_region = storage_client.get_bucket("retail-training-eu").location\nassert bucket_region == "EU", f"Bucket must be in EU, got: {bucket_region}"\nprint("Data residency: EU-WEST1 enforced")`,
      yaml: `compliance:\n  dataResidency:\n    region: eu-west1\n    enforce: true\n  gdpr: true\n  dataClassification: PII`,
    },
    clozeTemplate: {
      python: `aiplatform.init(\n    project="ml-prod-project",\n    location="___",  # EU region\n)\nassert bucket_region == "___", "Must be in EU"`,
      yaml: `compliance:\n  dataResidency:\n    region: ___\n    enforce: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      pipelineStatus: "serving",
      iamConfig: {
        vpcPeeringEnabled: true,
        serviceAccountEmail: "vertex-predictor@ml-prod-project.iam.gserviceaccount.com",
        deniedRoles: ["aiplatform.admin"],
        dataResidencyRegion: "us-central1",
      },
      authPolicy: "iam-restricted" as VertexAuthPolicy,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasResidency =
        c.includes("eu-west") || c.includes("europe") || c.includes("gdpr") ||
        c.includes("data_residency") || c.includes("location") ||
        after.iamConfig.dataResidencyRegion !== "us-central1";
      return {
        passed: hasResidency,
        messageKey: hasResidency
          ? "vertex.tasks.task12.success"
          : "vertex.tasks.task12.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 5: MONITORING (Tasks 13–15)
  // ══════════════════════════════════════════════════════

  {
    id: "task-vertex-13-drift-detection",
    order: 13,
    round: 5,
    roundNameKey: "vertex.rounds.monitoring",
    titleKey: "vertex.tasks.task13.title",
    conceptKey: "vertex.tasks.task13.concept",
    descKey: "vertex.tasks.task13.desc",
    hintKey: "vertex.tasks.task13.hint",
    simpleExplanationKey: "vertex.tasks.task13.simple",
    engineeringKey: "vertex.tasks.task13.engineering",
    successKey: "vertex.tasks.task13.success",
    workedExample: WORKED_EXAMPLES["task-vertex-13-drift-detection"],
    targetCode: {
      python: `from google.cloud.aiplatform import ModelMonitoringJob\n\nmonitoring_job = ModelMonitoringJob.create(\n    endpoint=endpoint,\n    feature_drift_threshold={"default": 0.15},  # Alert if PSI > 0.15\n    prediction_drift_threshold={"default": 0.20},\n    emails=["ml-oncall@company.com"],\n    monitoring_interval_hours=1,\n)`,
      yaml: `monitoring:\n  featureDrift:\n    threshold: 0.15\n    metric: PSI\n  predictionDrift:\n    threshold: 0.20\n  alerts:\n    email: ml-oncall@company.com\n  intervalHours: 1`,
    },
    clozeTemplate: {
      python: `monitoring_job = ModelMonitoringJob.create(\n    endpoint=endpoint,\n    feature_drift_threshold={"default": ___},\n    prediction_drift_threshold={"default": ___},\n    emails=["___"],\n)`,
      yaml: `monitoring:\n  featureDrift:\n    threshold: ___\n  alerts:\n    email: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      accuracy: 0.91,
      latencyMs: 32,
      pipelineStatus: "serving",
      iamConfig: {
        vpcPeeringEnabled: true,
        serviceAccountEmail: "vertex-predictor@ml-prod-project.iam.gserviceaccount.com",
        deniedRoles: ["aiplatform.admin"],
        dataResidencyRegion: "eu-west1",
      },
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasDrift =
        c.includes("drift") || c.includes("monitor") || c.includes("threshold") ||
        after.monitoringConfig.driftThreshold < 0.5;
      return {
        passed: hasDrift,
        messageKey: hasDrift ? "vertex.tasks.task13.success" : "vertex.tasks.task13.hint",
      };
    },
  },

  {
    id: "task-vertex-14-latency-slo",
    order: 14,
    round: 5,
    roundNameKey: "vertex.rounds.monitoring",
    titleKey: "vertex.tasks.task14.title",
    conceptKey: "vertex.tasks.task14.concept",
    descKey: "vertex.tasks.task14.desc",
    hintKey: "vertex.tasks.task14.hint",
    simpleExplanationKey: "vertex.tasks.task14.simple",
    engineeringKey: "vertex.tasks.task14.engineering",
    successKey: "vertex.tasks.task14.success",
    workedExample: WORKED_EXAMPLES["task-vertex-14-latency-slo"],
    targetCode: {
      python: `from google.cloud import monitoring_v3\n\nclient = monitoring_v3.AlertPolicyServiceClient()\nalert_policy = monitoring_v3.AlertPolicy(\n    display_name="Vertex Endpoint P99 Latency SLO",\n    conditions=[\n        monitoring_v3.AlertPolicy.Condition(\n            display_name="P99 > 200ms",\n            condition_threshold=monitoring_v3.AlertPolicy.Condition.MetricThreshold(\n                filter='metric.type="aiplatform.googleapis.com/prediction/latency"',\n                comparison=monitoring_v3.ComparisonType.COMPARISON_GT,\n                threshold_value=200,  # milliseconds\n                duration={"seconds": 300},  # sustained for 5 min\n            ),\n        )\n    ],\n)`,
      yaml: `slo:\n  metric: prediction_latency\n  percentile: P99\n  threshold: 200ms\n  window: 5min\n  burnRate:\n    fast: 10x\n    slow: 2x`,
    },
    clozeTemplate: {
      python: `alert_policy = monitoring_v3.AlertPolicy(\n    conditions=[\n        monitoring_v3.AlertPolicy.Condition(\n            condition_threshold=monitoring_v3.AlertPolicy.Condition.MetricThreshold(\n                threshold_value=___,  # ms SLO\n                duration={"seconds": ___},\n            ),\n        )\n    ],\n)`,
      yaml: `slo:\n  threshold: ___\n  window: ___\n  percentile: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      accuracy: 0.91,
      latencyMs: 240, // deliberately over SLO to trigger alert scenario
      pipelineStatus: "serving",
      monitoringConfig: {
        driftThreshold: 0.15,
        latencySloMs: 200,
        alertEmail: "ml-oncall@company.com",
        retrainingTriggerEnabled: false,
      },
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasSlo =
        c.includes("latency") || c.includes("slo") || c.includes("p99") ||
        c.includes("threshold_value") || c.includes("threshold") ||
        after.monitoringConfig.latencySloMs < 500;
      return {
        passed: hasSlo,
        messageKey: hasSlo ? "vertex.tasks.task14.success" : "vertex.tasks.task14.hint",
      };
    },
  },

  {
    id: "task-vertex-15-retraining-trigger",
    order: 15,
    round: 5,
    roundNameKey: "vertex.rounds.monitoring",
    titleKey: "vertex.tasks.task15.title",
    conceptKey: "vertex.tasks.task15.concept",
    descKey: "vertex.tasks.task15.desc",
    hintKey: "vertex.tasks.task15.hint",
    simpleExplanationKey: "vertex.tasks.task15.simple",
    engineeringKey: "vertex.tasks.task15.engineering",
    successKey: "vertex.tasks.task15.success",
    workedExample: WORKED_EXAMPLES["task-vertex-15-retraining-trigger"],
    targetCode: {
      python: `from google.cloud import aiplatform, pubsub_v1\n\n# Triggered by Cloud Monitoring alert → Pub/Sub → Cloud Function\ndef auto_retrain(event, context):\n    \"\"\"Cloud Function triggered when drift alert fires.\"\"\"\n    aiplatform.init(project="ml-prod-project", location="us-central1")\n    job = aiplatform.AutoMLTabularTrainingJob(\n        display_name="auto-retrain-drift-triggered",\n        optimization_prediction_type="classification",\n    )\n    job.run(\n        dataset=latest_dataset,\n        target_column="purchase_intent",\n        budget_milli_node_hours=1000,\n    )\n    print("Auto-retraining triggered by drift alert")`,
      yaml: `retraining:\n  trigger:\n    type: drift-alert\n    threshold: 0.15\n  automation:\n    enabled: true\n    jobName: auto-retrain-pipeline\n    budgetMilliNodeHours: 1000\n  notification:\n    slack: "#ml-alerts"\n    email: ml-oncall@company.com`,
    },
    clozeTemplate: {
      python: `def auto_retrain(event, context):\n    job = aiplatform.AutoMLTabularTrainingJob(\n        display_name="auto-retrain-___",\n        optimization_prediction_type="___",\n    )\n    job.run(\n        dataset=latest_dataset,\n        budget_milli_node_hours=___,\n    )`,
      yaml: `retraining:\n  trigger:\n    type: ___\n    threshold: ___\n  automation:\n    enabled: ___`,
    },
    initialState: {
      ...INITIAL_VERTEX_STATE,
      modelVersion: 2,
      accuracy: 0.91,
      latencyMs: 32,
      driftScore: 0.22,
      pipelineStatus: "serving",
      monitoringConfig: {
        driftThreshold: 0.15,
        latencySloMs: 200,
        alertEmail: "ml-oncall@company.com",
        retrainingTriggerEnabled: false,
      },
      alerts: ["ALERT: Feature drift 0.22 > threshold 0.15"],
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasRetrain =
        c.includes("retrain") || c.includes("auto_retrain") || c.includes("trigger") ||
        c.includes("drift") || after.monitoringConfig.retrainingTriggerEnabled;
      return {
        passed: hasRetrain,
        messageKey: hasRetrain
          ? "vertex.tasks.task15.success"
          : "vertex.tasks.task15.hint",
      };
    },
  },
];
