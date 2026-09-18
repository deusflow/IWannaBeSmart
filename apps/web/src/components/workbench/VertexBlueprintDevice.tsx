/**
 * @file apps/web/src/components/workbench/VertexBlueprintDevice.tsx
 * @description Station 06: Vertex AI Architect & MLOps Studio Blueprint Device.
 * Interactive cloud ML pipeline studio: GCS data lake, distributed training compute,
 * low-latency autoscaling prediction endpoint, VPC peering, and model drift telemetry.
 */

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  Database,
  Cloud,
  Layers,
  Activity,
  Shield,
  Play,
  RotateCcw,
  CheckCircle2,
  Server,
  DollarSign,
  Terminal,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import type { VertexHardwareType } from "@iw/sim-engine";

export const VertexBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    vertexState,
    connectVertexGcsBucketAction,
    setVertexPreprocessingStepAction,
    runVertexTrainingAction,
    configureVertexEndpointAction,
    configureVertexIamAction,
    checkVertexMonitoringAction,
    resetVertexState,
  } = useWorkbenchStore(
    useShallow((s) => ({
      vertexState: s.vertexState,
      connectVertexGcsBucketAction: s.connectVertexGcsBucketAction,
      setVertexPreprocessingStepAction: s.setVertexPreprocessingStepAction,
      runVertexTrainingAction: s.runVertexTrainingAction,
      configureVertexEndpointAction: s.configureVertexEndpointAction,
      configureVertexIamAction: s.configureVertexIamAction,
      checkVertexMonitoringAction: s.checkVertexMonitoringAction,
      resetVertexState: s.resetVertexState,
    }))
  );

  const [bucketInput, setBucketInput] = useState("gs://retail-training-data");
  const [selectedHardware, setSelectedHardware] = useState<VertexHardwareType>("a2-highgpu-1g");
  const [batchSize, setBatchSize] = useState(64);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [minReplicas, setMinReplicas] = useState(2);
  const [maxReplicas, setMaxReplicas] = useState(8);
  const [trafficSplit, setTrafficSplit] = useState(100);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [vertexState.deploymentLogs]);

  const handleConnectBucket = (e: React.FormEvent) => {
    e.preventDefault();
    const res = connectVertexGcsBucketAction(bucketInput.trim());
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleTrain = () => {
    const res = runVertexTrainingAction(selectedHardware, batchSize, learningRate);
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleDeployEndpoint = () => {
    const res = configureVertexEndpointAction({
      minReplicas,
      maxReplicas,
      trafficSplitPercent: trafficSplit,
      autoscalingEnabled: true,
    });
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleToggleVpc = () => {
    const nextState = !vertexState.iamConfig.vpcPeeringEnabled;
    const res = configureVertexIamAction(
      {
        ...vertexState.iamConfig,
        vpcPeeringEnabled: nextState,
        serviceAccountEmail: "sa-ml-vertex-runner@ml-prod-project.iam.gserviceaccount.com",
        dataResidencyRegion: "eu-west1",
      },
      "service-account"
    );
    setFeedback({ text: res.output, isError: !res.success });
  };

  const handleRunMonitoring = () => {
    const res = checkVertexMonitoringAction({
      driftThreshold: 0.15,
      latencySloMs: 150,
      alertEmail: "sre-ml-oncall@enterprise.corp",
      retrainingTriggerEnabled: true,
    });
    setFeedback({ text: res.output, isError: !res.success });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-3 sm:p-4 rounded-xl border border-sky-900/40 shadow-2xl font-mono overflow-y-auto space-y-4">
      {/* ── Top Header Bar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-900/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Cloud className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-sky-400 font-bold">
                STATION 06 // VERTEX AI ARCHITECT
              </span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-sky-900/50 text-sky-300 border border-sky-700/50">
                GCP CLOUD MLOPS
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-200">
              {t("vertex.ui.title", "Production ML Pipeline, GPU Autoscaling & Drift Telemetry")}
            </h2>
          </div>
        </div>

        {/* Live System State Chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-slate-500">STATUS:</span>
            <span className="font-bold uppercase text-sky-300">{vertexState.pipelineStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-slate-500">COST:</span>
            <span className="font-bold text-amber-300">${vertexState.costPerHour.toFixed(2)}/hr</span>
          </div>

          <button
            onClick={() => resetVertexState()}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Feedback Banner ───────────────────────────────────────────── */}
      {feedback && (
        <div
          className={`px-3 py-2 rounded text-xs border flex items-center justify-between ${
            feedback.isError
              ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
              : "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-200 ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Pipeline DAG Visual Strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
        <div
          className={`p-2.5 rounded-lg border transition ${
            vertexState.gcsBucket
              ? "bg-sky-950/40 border-sky-500/50 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">1. DATA LAKE</span>
            {vertexState.gcsBucket ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Database className="w-3.5 h-3.5 text-slate-600" />
            )}
          </div>
          <div className="truncate font-mono text-[10px]">
            {vertexState.gcsBucket ? vertexState.gcsBucket : "No bucket linked"}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            vertexState.preprocessingStep !== "none"
              ? "bg-sky-950/40 border-sky-500/50 text-sky-200 shadow-[0_0_10px_rgba(14,165,233,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">2. PREPROCESS</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="capitalize font-mono text-[10px]">
            {vertexState.preprocessingStep === "none" ? "Unprocessed" : vertexState.preprocessingStep}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            vertexState.modelVersion > 0
              ? "bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">3. MODEL REGISTRY</span>
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {vertexState.modelVersion > 0
              ? `v${vertexState.modelVersion} (acc: ${(vertexState.accuracy * 100).toFixed(1)}%)`
              : "No model trained"}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            vertexState.pipelineStatus === "serving"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">4. SERVING ENDPOINT</span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {vertexState.pipelineStatus === "serving"
              ? `${vertexState.endpointConfig.minReplicas}-${vertexState.endpointConfig.maxReplicas} nodes (${vertexState.latencyMs}ms)`
              : "Offline"}
          </div>
        </div>

        <div
          className={`p-2.5 rounded-lg border transition ${
            vertexState.alerts.length > 0
              ? "bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              : "bg-slate-900/40 border-slate-800 text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[11px] text-slate-400">5. DRIFT SENTINEL</span>
            <Activity className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="font-mono text-[10px]">
            {vertexState.alerts.length > 0
              ? `⚠ ${vertexState.alerts.length} alert(s)`
              : `Healthy (drift: ${vertexState.driftScore.toFixed(2)})`}
          </div>
        </div>
      </div>

      {/* ── Main Interactive Cockpit Panels ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-[360px]">
        {/* Panel 1: Data & Training Controls */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              STAGE 1 & 2 // INGEST & TRAIN
            </span>
          </div>

          {/* GCS Bucket Connector Form */}
          <form onSubmit={handleConnectBucket} className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Cloud Storage Bucket URI:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bucketInput}
                onChange={(e) => setBucketInput(e.target.value)}
                placeholder="gs://..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-sky-300 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="submit"
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-slate-950 font-bold text-xs rounded transition"
              >
                Mount
              </button>
            </div>
          </form>

          {/* Preprocessing Selection */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Feature Engineering Pipeline:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["normalize", "augment", "both"] as const).map((step) => (
                <button
                  key={step}
                  onClick={() => setVertexPreprocessingStepAction(step)}
                  className={`px-2 py-1 text-xs rounded border capitalize transition ${
                    vertexState.preprocessingStep === step
                      ? "bg-sky-950 border-sky-500 text-sky-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
          </div>

          {/* Accelerator Hardware Sizing */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Compute Accelerator:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: "n1-standard-4", label: "CPU 4x", cost: "$0.19" },
                  { id: "n1-highmem-8", label: "CPU 8x HighMem", cost: "$0.47" },
                  { id: "a2-highgpu-1g", label: "NVIDIA A100", cost: "$3.67" },
                  { id: "tpu-v4-8", label: "Google TPU v4", cost: "$12.88" },
                ] as const
              ).map((hw) => (
                <button
                  key={hw.id}
                  onClick={() => setSelectedHardware(hw.id as VertexHardwareType)}
                  className={`p-1.5 text-left rounded border transition ${
                    selectedHardware === hw.id
                      ? "bg-sky-950 border-sky-500 text-sky-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="text-[11px] font-bold">{hw.label}</div>
                  <div className="text-[9px] text-slate-500">{hw.cost}/hr</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hyperparameters */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500">BATCH SIZE:</span>
              <input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 font-mono text-xs text-slate-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">LEARNING RATE:</span>
              <input
                type="number"
                step="0.00005"
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-0.5 font-mono text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Run Training CTA */}
          <button
            onClick={handleTrain}
            className="w-full py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-lg shadow-sky-900/30"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Dispatch Training Job
          </button>
        </div>

        {/* Panel 2: Endpoint Serving & Networking Controls */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              STAGE 3 & 4 // SERVING & INFRA
            </span>
          </div>

          {/* Replicas Autoscaler Config */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Replicas Range (Min - Max):</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={minReplicas}
                min={1}
                max={10}
                onChange={(e) => setMinReplicas(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
              />
              <span className="text-slate-500">—</span>
              <input
                type="number"
                value={maxReplicas}
                min={1}
                max={20}
                onChange={(e) => setMaxReplicas(Number(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-mono text-center"
              />
              <span className="text-[10px] text-slate-500">instances</span>
            </div>
          </div>

          {/* Traffic Split Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Canary Traffic Split:</span>
              <span className="text-emerald-400 font-bold">{trafficSplit}% new model</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={trafficSplit}
              onChange={(e) => setTrafficSplit(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800"
            />
          </div>

          {/* VPC Peering & Security */}
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                VPC Private Service Connect:
              </span>
              <button
                onClick={handleToggleVpc}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  vertexState.iamConfig.vpcPeeringEnabled
                    ? "bg-emerald-900 text-emerald-300 border border-emerald-700"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {vertexState.iamConfig.vpcPeeringEnabled ? "PEERED (mTLS)" : "PUBLIC IP"}
              </button>
            </div>
            <div className="text-[10px] text-slate-500">
              Region: <span className="text-slate-300">{vertexState.iamConfig.dataResidencyRegion}</span> (EU GDPR compliant)
            </div>
          </div>

          {/* Deploy Endpoint CTA */}
          <button
            onClick={handleDeployEndpoint}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <Server className="w-3.5 h-3.5" />
            Apply Serving Autoscaling
          </button>

          {/* Drift Check CTA */}
          <button
            onClick={handleRunMonitoring}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded transition flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            Trigger Drift Sentinel Scan
          </button>
        </div>

        {/* Panel 3: Cloud Deployment Log Stream */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              CLOUD OPERATIONS LOGS
            </span>
            <span className="text-[10px] text-slate-600">LIVE FEED</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 text-[11px] font-mono pr-1 text-slate-400">
            {vertexState.deploymentLogs.length === 0 && (
              <div className="text-slate-600 italic">No cloud events recorded yet. Connect storage or dispatch training to view telemetry.</div>
            )}
            {vertexState.deploymentLogs.map((log, idx) => {
              const isAlert = log.includes("ALERT") || log.includes("ERROR");
              const isSuccess = log.includes("✓") || log.includes("OK");
              return (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    isAlert
                      ? "text-rose-400 font-semibold"
                      : isSuccess
                      ? "text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {log}
                </div>
              );
            })}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
