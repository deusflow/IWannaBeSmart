import React, { useCallback, useMemo, useEffect } from "react";
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
} from "lucide-react";

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
      position: { x: 40, y: 70 },
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
      position: { x: 380, y: 50 },
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

const InnerArchitectureCanvas: React.FC = () => {
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
        x: 60 + (nodes.length % 5) * 40,
        y: 80 + (nodes.length % 4) * 50,
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
    addNodeByFileId("class-power-command", { x: 40, y: 70 });
    addNodeByFileId("class-tv-controller", { x: 380, y: 50 });

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
      fitView({ padding: 0.15, duration: 400 });
    }, 50);
  }, [fitView, setEdges, setNodes]);

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-paper-border bg-paper-subtle shadow-paper-sm">
      {/* Top Mission Callout Bar (Level 1: Wiring the Power Command) */}
      <div
        className={`px-3.5 py-2.5 border-b transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none ${
          isPowerWired
            ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60"
            : "bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/60"
        }`}
      >
        <div className="flex items-start sm:items-center gap-2 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isPowerWired
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white animate-pulse"
            }`}
          >
            {isPowerWired ? <CheckCircle2 size={16} /> : <Cable size={16} />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs text-ink">
                Рівень 1: Архітектурне підключення команди Power
              </span>
              <Badge
                variant={isPowerWired ? "ok" : "accent"}
                size="sm"
                className="font-balsamiq text-[10px]"
              >
                {isPowerWired ? "✓ Зв'язок активний" : "Очікує з'єднання"}
              </Badge>
            </div>
            <p className="font-balsamiq text-[10.5px] text-ink-muted leading-tight">
              {isPowerWired
                ? "Контракт виконано! Метод Execute класу PowerCommand зв'язано з TVController. Кнопка Power на пульті активна."
                : "З'єднайте вихідний порт Execute класу PowerCommand із вхідним портом CommandHandler контролера TVController."}
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleAutoWire}
            title="Автоматично підключити провід Execute -> CommandHandler"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-paper hover:bg-paper-muted border border-paper-border hover:border-accent-blue text-ink text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Sparkles size={12} className="text-accent-blue" />
            <span>Авто-з&apos;єднання</span>
          </button>

          <button
            onClick={handleReset}
            title="Скинути полотно до початкового стану"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-paper hover:bg-paper-muted border border-paper-border text-ink-muted hover:text-ink text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw size={12} />
            <span>Скинути</span>
          </button>

          <button
            onClick={() => fitView({ padding: 0.15, duration: 400 })}
            title="Центрувати схему"
            className="p-1 rounded-lg bg-paper hover:bg-paper-muted border border-paper-border text-ink-muted hover:text-ink cursor-pointer"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Editor Body: Left Project Explorer + Right ReactFlow Canvas */}
      <div className="flex w-full h-[480px] relative bg-paper-subtle">
        {/* Project Explorer Tree */}
        <ProjectExplorer
          onAddNode={addNodeByFileId}
          activeFileIds={activeFileIds}
        />

        {/* ReactFlow Visual Canvas */}
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
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.35}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
            className="bg-notebook-grid w-full h-full"
          >
            <Background color="rgba(29, 32, 35, 0.08)" gap={16} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-paper !border-paper-border !rounded-lg !shadow-paper-sm [&>button]:!bg-paper [&>button]:!border-paper-border [&>button]:!text-ink-muted hover:[&>button]:!text-ink"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export const ArchitectureCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <InnerArchitectureCanvas />
    </ReactFlowProvider>
  );
};
