import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkbenchStore } from "../../../store/workbenchStore";
import { ArchitectureNode } from "./ArchitectureNode";
import { ArchitectureEdge, type ArchitectureEdgeData } from "./ArchitectureEdge";
import { ArchitectureTreePanel } from "./ArchitectureTreePanel";
import { TraceGraphNode } from "./TraceGraphNode";
import { CounterfactualPanel } from "./CounterfactualPanel";
import { evaluateTraceGraph, computeTraceNodePosition } from "./traceGraph";
import { ArchitectureTerminal } from "./ArchitectureTerminal";
import { MentorBar } from "./MentorBar";
import { CompletionModal } from "./CompletionModal";
import { InterfaceJourneyHUD } from "./InterfaceJourneyHUD";
import { HotSwapModal } from "./HotSwapModal";
import { MissionBar } from "./MissionBar";
import { useCallFlowTrace } from "./useCallFlowTrace";
import { useInterfaceJourney } from "./useInterfaceJourney";
import { useArchitectureWiring } from "./useArchitectureWiring";
import { generateCodePreview } from "./codeGenerator";
import type { ArchitectureNodeData, TerminalLogEntry, TraceGraph } from "./types";
import { Zap } from "lucide-react";
import { audioFx } from "../../../utils/audioFx";

interface ArchitectureCanvasProps {
  onBackToTv?: () => void;
}

const nodeTypes = {
  architectureNode: ArchitectureNode,
  traceNode: TraceGraphNode,
};
const edgeTypes = { architectureEdge: ArchitectureEdge };

function nowStr(): string {
  const d = new Date();
  const time = d.toTimeString().slice(0, 8);
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}`;
}

let _lid = 0;
const lid = () => `log-${++_lid}-${Date.now()}`;

// ════════════════════════════════════════════════
//  Inner Canvas
// ════════════════════════════════════════════════
const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({ onBackToTv }) => {
  const { t } = useTranslation();
  const {
    setArchitecturePowerWired,
    archNodes: storedNodes,
    archEdges: storedEdges,
    setArchNodes,
    setArchEdges,
    mentorPhase,
    setMentorPhase,
    selectedTraceEntityId,
    setSelectedTraceEntityId,
    bypassedTraceNodes,
    toggleTraceBypass,
    resetBypasses,
    setIsTraceBroken,
    setTraceFaultReason,
  } = useWorkbenchStore();
  const { screenToFlowPosition, fitView, setCenter, getNode } = useReactFlow();

  const [canvasMode, setCanvasMode] = useState<"TRACE" | "WIRING">("TRACE");
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isHotSwapInsightOpen, setIsHotSwapInsightOpen] = useState(false);
  const [diMode, setDiMode] = useState<"WITH_DI" | "WITHOUT_DI">("WITH_DI");

  const addLog = useCallback((entry: Omit<TerminalLogEntry, "id" | "timestamp">) => {
    setTerminalLogs((prev) => [...prev, { ...entry, id: lid(), timestamp: nowStr() }]);
  }, []);

  const clearLogs = useCallback(() => setTerminalLogs([]), []);

  // ── Wiring Subsystem ──
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    activeFileIds,
    isVolumeWired,
    isAnyCommandWired,
    handleNodesChange,
    onEdgesChange,
    addNodeByFileId,
    onDragOver,
    onDrop,
    isValidConnection,
    onConnect,
    handleHotSwap,
    handleAutoWire,
    handleReset,
    handleFocusNode,
  } = useArchitectureWiring({
    storedNodes: storedNodes as unknown as Node<ArchitectureNodeData>[],
    storedEdges: storedEdges as unknown as Edge<ArchitectureEdgeData>[],
    setArchNodes,
    setArchEdges,
    diMode,
    mentorPhase,
    setMentorPhase,
    setArchitecturePowerWired,
    screenToFlowPosition,
    fitView,
    setCenter,
    getNode,
    addLog,
    clearLogs,
    onOpenHotSwapInsight: () => setIsHotSwapInsightOpen(true),
  });

  const handleToggleDiMode = useCallback(
    (mode: "WITH_DI" | "WITHOUT_DI") => {
      setDiMode(mode);
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          data: {
            ...e.data,
            diMode: mode,
          },
        }))
      );
    },
    [setEdges]
  );

  useEffect(() => {
    if (mentorPhase === "COMPLETED") {
      setIsCompletionModalOpen(true);
    }
  }, [mentorPhase]);

  // ── Trace-Chain Evaluation ──
  const evaluatedTraceGraph: TraceGraph = useMemo(() => {
    return evaluateTraceGraph(
      selectedTraceEntityId || "IRemoteCommand",
      undefined,
      new Set(bypassedTraceNodes)
    );
  }, [selectedTraceEntityId, bypassedTraceNodes]);

  const handleToggleTraceBypass = useCallback(
    (nodeId: string) => {
      audioFx.playRelayClick();
      toggleTraceBypass(nodeId);
    },
    [toggleTraceBypass]
  );

  useEffect(() => {
    setIsTraceBroken(evaluatedTraceGraph.isBroken);
    setTraceFaultReason(evaluatedTraceGraph.brokenReason);
    if (canvasMode === "TRACE") {
      setArchitecturePowerWired(!evaluatedTraceGraph.isBroken);
    }

    if (evaluatedTraceGraph.isBroken) {
      addLog({
        type: "error",
        subsystem: "FAULT",
        message: `[FAULT] Dependency unresolved: ${selectedTraceEntityId} has no active binding`,
      });
      addLog({
        type: "error",
        subsystem: "HARDWARE",
        message: "[HARDWARE] TV CRT Anode: Power supply interrupted (0V)",
      });
    }
  }, [
    evaluatedTraceGraph.isBroken,
    evaluatedTraceGraph.brokenReason,
    selectedTraceEntityId,
    canvasMode,
    setIsTraceBroken,
    setTraceFaultReason,
    setArchitecturePowerWired,
    addLog,
  ]);

  const traceFlowNodes: Node[] = useMemo(() => {
    return evaluatedTraceGraph.nodes.map((node) => {
      const position = computeTraceNodePosition(node, 40, 180, 290, 160);
      return {
        id: node.id,
        type: "traceNode",
        position,
        data: {
          ...node,
          onToggleBypass: handleToggleTraceBypass,
          isSelectedEntity: node.label.includes(selectedTraceEntityId || "IRemoteCommand"),
        },
      };
    });
  }, [evaluatedTraceGraph, selectedTraceEntityId, handleToggleTraceBypass]);

  const traceFlowEdges: Edge[] = useMemo(() => {
    return evaluatedTraceGraph.edges.map((edge) => {
      const isBroken = edge.status === "broken";
      return {
        id: edge.id,
        source: edge.from,
        target: edge.to,
        sourceHandle: "out",
        targetHandle: "in",
        type: "default",
        animated: !isBroken,
        style: {
          stroke: isBroken ? "#EF4444" : "#10B981",
          strokeWidth: isBroken ? 2.5 : 2,
          strokeDasharray: isBroken ? "6,6" : undefined,
        },
      };
    });
  }, [evaluatedTraceGraph]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedTraceEntityId, canvasMode, fitView]);

  const codePreview = useMemo(() => generateCodePreview(edges, nodes), [edges, nodes]);

  // ── Journey Hook ──
  const {
    activeJourney,
    handleInspectInterface,
    handleChangeJourneyStep,
    handleChangeJourneyCommand,
    handleCloseJourney,
    handleFitAll,
    processedNodes,
    processedEdges,
  } = useInterfaceJourney({
    nodes,
    edges,
    isVolumeWired,
    getNode,
    addNodeByFileId,
    fitView,
    setCenter,
    addLog,
    t,
  });

  // ── Call Flow Trace Hook ──
  const { isTracing, currentTraceStep, triggerCallFlowTrace } = useCallFlowTrace({
    canvasMode,
    evaluatedTraceGraph,
    selectedTraceEntityId,
    isAnyCommandWired,
    isVolumeWired,
    addLog,
    getNode,
    setCenter,
    setNodes,
    setEdges,
    onHotSwapInsight: () => setIsHotSwapInsightOpen(true),
  });

  useEffect(() => {
    const t2 = setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 120);
    return () => clearTimeout(t2);
  }, [fitView]);

  useEffect(() => {
    addLog({
      type: "info",
      subsystem: "GRAPH",
      operation: "BOOT",
      message: "Architecture runtime initialized [DI Container ready]",
      details: "Awaiting dependency binding: IRemoteCommand -> TVController",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: "#1E1E22" }}
    >
      <MissionBar
        canvasMode={canvasMode}
        onSetCanvasMode={(mode) => {
          setCanvasMode(mode);
          setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
        }}
        selectedTraceEntityId={selectedTraceEntityId}
        isTraceBroken={evaluatedTraceGraph.isBroken}
        isAnyCommandWired={isAnyCommandWired}
        isVolumeWired={isVolumeWired}
        diMode={diMode}
        onToggleDiMode={handleToggleDiMode}
        onHotSwap={handleHotSwap}
        activeJourney={activeJourney}
        onToggleJourney={() =>
          activeJourney ? handleCloseJourney() : handleInspectInterface("IRemoteCommand")
        }
        isTracing={isTracing}
        onTriggerTrace={triggerCallFlowTrace}
        onAutoWire={handleAutoWire}
        onReset={handleReset}
        onFitView={() => fitView({ padding: 0.2, duration: 400 })}
      />

      {/* Body: sidebar + canvas */}
      <div className="flex-1 flex flex-row w-full min-h-0 relative overflow-hidden">
        <ArchitectureTreePanel
          onAddNode={addNodeByFileId}
          activeFileIds={activeFileIds}
          selectedEntityId={selectedTraceEntityId}
          onSelectEntity={(entityId) => {
            setSelectedTraceEntityId(entityId);
            setCanvasMode("TRACE");
          }}
        />

        <div
          className="flex-1 relative min-w-0 flex flex-col h-full"
          style={{ background: "#1E1E22" }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex-1 relative min-h-0 w-full h-full">
            {(isTracing || currentTraceStep > 0) && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#141518]/95 border border-amber-500/40 rounded-full px-3 py-1 shadow-2xl backdrop-blur-md flex items-center gap-2 select-none pointer-events-none animate-fadeIn max-w-[95%] overflow-x-auto">
                <div className="flex items-center gap-1.5 pr-2 border-r border-white/10 shrink-0">
                  <Zap size={11} className="text-amber-400 animate-spin" />
                  <span className="font-mono text-[9px] font-bold text-amber-300">
                    {t("architecture.callChain", "Ланцюг")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono shrink-0">
                  <span className={currentTraceStep === 1 ? "text-amber-300 font-bold" : currentTraceStep > 1 ? "text-emerald-400" : "text-gray-500"}>
                    {t("architecture.stepRemote", "1. Declaration")}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 2 ? "text-amber-300 font-bold" : currentTraceStep > 2 ? "text-emerald-400" : "text-gray-500"}>
                    2. Implementation
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 3 ? "text-amber-300 font-bold" : currentTraceStep > 3 ? "text-emerald-400" : "text-gray-500"}>
                    3. Registration (DI)
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 4 ? "text-amber-300 font-bold" : currentTraceStep > 4 ? "text-emerald-400" : "text-gray-500"}>
                    4. InjectionPoint
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 5 ? "text-amber-300 font-bold" : "text-gray-500"}>
                    5. CallSite → Effect
                  </span>
                </div>
              </div>
            )}

            <ReactFlow
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              nodes={(canvasMode === "TRACE" ? traceFlowNodes : processedNodes) as Node<any>[]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              edges={(canvasMode === "TRACE" ? traceFlowEdges : processedEdges) as Edge<any>[]}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              deleteKeyCode={null}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.2}
              maxZoom={2}
              connectionLineStyle={{ stroke: "#FBBF24", strokeWidth: 2 }}
              proOptions={{ hideAttribution: true }}
              style={{ background: "#1E1E22" }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                color="#3E3F47"
                gap={22}
                size={1.2}
              />
              <Controls
                showInteractive={false}
                className="!bg-[#26272C] !border-[#3A3B42] !rounded-xl !shadow-lg [&>button]:!bg-[#26272C] [&>button]:!border-[#3A3B42] [&>button]:!text-gray-500 hover:[&>button]:!text-gray-100 [&>button]:!fill-gray-500 hover:[&>button]:!fill-gray-100"
              />
            </ReactFlow>

            {canvasMode === "TRACE" && (
              <CounterfactualPanel
                graph={evaluatedTraceGraph}
                bypassedNodeIds={bypassedTraceNodes}
                onToggleBypass={handleToggleTraceBypass}
                onResetBypasses={resetBypasses}
              />
            )}

            <ArchitectureTerminal
              logs={terminalLogs}
              onClearLogs={clearLogs}
              currentMission={t("architecture.missionInstructions")}
              codePreview={codePreview}
              onFocusNode={handleFocusNode}
            />

            {activeJourney && (
              <InterfaceJourneyHUD
                journeyState={activeJourney}
                onChangeStep={handleChangeJourneyStep}
                onChangeCommand={handleChangeJourneyCommand}
                onClose={handleCloseJourney}
                onTriggerTrace={triggerCallFlowTrace}
                onFitAll={handleFitAll}
                isTracing={isTracing}
              />
            )}
          </div>

          <MentorBar onGoToTv={onBackToTv} />
        </div>
      </div>

      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onNextTask={() => {
          setIsCompletionModalOpen(false);
          if (onBackToTv) onBackToTv();
        }}
      />

      <HotSwapModal
        isOpen={isHotSwapInsightOpen}
        onClose={() => setIsHotSwapInsightOpen(false)}
        onTriggerTrace={triggerCallFlowTrace}
      />
    </div>
  );
};

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = (props) => (
  <ReactFlowProvider>
    <InnerArchitectureCanvas {...props} />
  </ReactFlowProvider>
);
