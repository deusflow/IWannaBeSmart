import React, { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkbenchStore } from "../../../store/workbenchStore";
import { ArchitectureNode } from "./ArchitectureNode";
import { ArchitectureEdge, type ArchitectureEdgeData } from "./ArchitectureEdge";
import { ProjectExplorer } from "./ProjectExplorer";
import { PROJECT_FILES } from "./projectData";
import type { ArchitectureNodeData } from "./types";
import { Badge } from "@iw/ui";
import {
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Cable,
  Maximize2,
  ArrowLeft,
} from "lucide-react";

interface ArchitectureCanvasProps {
  onBackToTv?: () => void;
}

const nodeTypes = {
  architectureNode: ArchitectureNode,
};

const edgeTypes = {
  architectureEdge: ArchitectureEdge,
};

// Initial nodes for Level 1 mission: PowerCommand & TVController
const createInitialNodes = (): Node<ArchitectureNodeData>[] => {
  const powerCommand = PROJECT_FILES.find((f) => f.id === "class-power-command")!;
  const tvController = PROJECT_FILES.find((f) => f.id === "class-tv-controller")!;

  return [
    {
      id: "node-class-power-command",
      type: "architectureNode",
      position: { x: 50, y: 120 },
      data: {
        fileId: powerCommand.id,
        name: powerCommand.name,
        path: powerCommand.path,
        entityType: powerCommand.entityType,
        role: powerCommand.role,
        inputs: powerCommand.inputs,
        outputs: powerCommand.outputs,
        isHighlighted: true,
      },
    },
    {
      id: "node-class-tv-controller",
      type: "architectureNode",
      position: { x: 440, y: 90 },
      data: {
        fileId: tvController.id,
        name: tvController.name,
        path: tvController.path,
        entityType: tvController.entityType,
        role: tvController.role,
        inputs: tvController.inputs,
        outputs: tvController.outputs,
        isHighlighted: true,
      },
    },
  ];
};

const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({ onBackToTv }) => {
  const { t } = useTranslation();
  const { setArchitecturePowerWired } = useWorkbenchStore();
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<ArchitectureEdgeData>>([]);

  // Check if target wire exists: PowerCommand.Execute -> TVController.CommandHandler
  const isPowerWired = useMemo(() => {
    return edges.some((edge) => {
      const isPowerSource =
        edge.source === "node-class-power-command" &&
        (edge.sourceHandle === "out-execute" || !edge.sourceHandle);
      const isControllerTarget =
        edge.target === "node-class-tv-controller" &&
        (edge.targetHandle === "in-command-handler" || !edge.targetHandle);

      return isPowerSource && isControllerTarget;
    });
  }, [edges]);

  // Sync with workbenchStore
  useEffect(() => {
    setArchitecturePowerWired(isPowerWired);
  }, [isPowerWired, setArchitecturePowerWired]);

  // Set of file IDs currently on canvas
  const activeFileIds = useMemo(() => {
    return new Set(nodes.map((n) => n.data.fileId));
  }, [nodes]);

  // Handle edge delete callback
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    },
    [setEdges]
  );

  // Connection handler with validation and styling
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const isTargetPowerWire =
        params.source === "node-class-power-command" &&
        params.target === "node-class-tv-controller";

      const newEdge: Edge<ArchitectureEdgeData> = {
        ...params,
        id: `arch-edge-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        type: "architectureEdge",
        data: {
          isValidPowerWire: isTargetPowerWire,
          onDelete: handleDeleteEdge,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [handleDeleteEdge, setEdges]
  );

  // Add a node by file ID (via click or drag drop)
  const addNodeByFileId = useCallback(
    (fileId: string, position?: { x: number; y: number }) => {
      const file = PROJECT_FILES.find((f) => f.id === fileId);
      if (!file) return;

      const nodeId = `node-${file.id}`;

      // If node already exists on canvas, highlight and bring to attention
      const existingNode = nodes.find((n) => n.id === nodeId);
      if (existingNode) {
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === nodeId,
          }))
        );
        return;
      }

      // Default cascade position if no drag coordinates
      const targetPos = position || {
        x: 80 + (nodes.length % 5) * 50,
        y: 100 + (nodes.length % 4) * 60,
      };

      const newNode: Node<ArchitectureNodeData> = {
        id: nodeId,
        type: "architectureNode",
        position: targetPos,
        data: {
          fileId: file.id,
          name: file.name,
          path: file.path,
          entityType: file.entityType,
          role: file.role,
          inputs: file.inputs,
          outputs: file.outputs,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes]
  );

  // Drag and Drop over canvas
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fileId = e.dataTransfer.getData("application/reactflow");
      if (!fileId) return;

      const position = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      addNodeByFileId(fileId, position);
    },
    [screenToFlowPosition, addNodeByFileId]
  );

  // Quick Action: Auto-Wire Level 1
  const handleAutoWire = useCallback(() => {
    // Ensure both PowerCommand and TVController are on the board
    addNodeByFileId("class-power-command", { x: 50, y: 120 });
    addNodeByFileId("class-tv-controller", { x: 440, y: 90 });

    const wireId = "arch-edge-power-command-execute-controller";
    const autoEdge: Edge<ArchitectureEdgeData> = {
      id: wireId,
      source: "node-class-power-command",
      sourceHandle: "out-execute",
      target: "node-class-tv-controller",
      targetHandle: "in-command-handler",
      type: "architectureEdge",
      data: {
        isValidPowerWire: true,
        onDelete: handleDeleteEdge,
      },
    };

    setEdges((eds) => {
      const filtered = eds.filter(
        (e) =>
          !(
            e.source === "node-class-power-command" &&
            e.target === "node-class-tv-controller"
          )
      );
      return [...filtered, autoEdge];
    });
  }, [addNodeByFileId, handleDeleteEdge, setEdges]);

  // Quick Action: Reset Architecture
  const handleReset = useCallback(() => {
    setNodes(createInitialNodes());
    setEdges([]);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [fitView, setEdges, setNodes]);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-paper-subtle">
      {/* Top Mission Callout Bar (Level 1: Wiring the Power Command) */}
      <div
        className={`px-4 py-2.5 border-b transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0 ${
          isPowerWired
            ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60"
            : "bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Back to TV Navigation Button */}
          {onBackToTv && (
            <button
              onClick={onBackToTv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-accent-blue/50 text-ink font-balsamiq font-bold text-xs shadow-paper-sm transition-all cursor-pointer active:scale-95 shrink-0"
              title={t("workbench.backToTv")}
            >
              <ArrowLeft size={14} className="text-accent-blue" />
              <span>{t("workbench.backToTv")}</span>
            </button>
          )}

          <div
            className={`p-1.5 rounded-xl shrink-0 ${
              isPowerWired
                ? "bg-emerald-500 text-white shadow-xs"
                : "bg-amber-500 text-white animate-pulse"
            }`}
          >
            {isPowerWired ? <CheckCircle2 size={16} /> : <Cable size={16} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm text-ink">
                {t("architecture.level1Title")}
              </span>
              <Badge
                variant={isPowerWired ? "ok" : "accent"}
                size="sm"
                className="font-balsamiq text-[10px]"
              >
                {isPowerWired
                  ? t("architecture.connectionActive")
                  : t("architecture.waitingConnection")}
              </Badge>
            </div>
            <p className="font-balsamiq text-[10.5px] sm:text-xs text-ink-muted leading-tight">
              {isPowerWired
                ? t("architecture.missionSuccess")
                : t("architecture.missionInstructions")}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handleAutoWire}
            title="Автоматично підключити провід Execute -> CommandHandler"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border hover:border-accent-blue text-ink text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-paper-sm active:scale-95"
          >
            <Sparkles size={13} className="text-accent-blue" />
            <span>{t("architecture.autoWire")}</span>
          </button>

          <button
            onClick={handleReset}
            title="Скинути полотно до початкового стану"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border text-ink-muted hover:text-ink text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-paper-sm"
          >
            <RotateCcw size={13} />
            <span>{t("architecture.reset")}</span>
          </button>

          <button
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            title={t("architecture.centerView")}
            className="p-1.5 rounded-xl bg-paper hover:bg-paper-muted border border-paper-border text-ink-muted hover:text-ink cursor-pointer shadow-paper-sm"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor Fullscreen Body: Left Project Explorer (Full height) + Right ReactFlow Canvas */}
      <div className="flex-1 flex w-full h-full relative overflow-hidden bg-paper-subtle">
        {/* Full-Height Project Explorer Tree */}
        <ProjectExplorer
          onAddNode={addNodeByFileId}
          activeFileIds={activeFileIds}
        />

        {/* Full-Screen ReactFlow Visual Canvas */}
        <div
          className="flex-1 h-full relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
            className="bg-notebook-grid w-full h-full"
          >
            <Background color="rgba(29, 32, 35, 0.08)" gap={18} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-paper !border-paper-border !rounded-xl !shadow-paper-md [&>button]:!bg-paper [&>button]:!border-paper-border [&>button]:!text-ink-muted hover:[&>button]:!text-ink"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <InnerArchitectureCanvas {...props} />
    </ReactFlowProvider>
  );
};
