import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkbenchStore } from "../../../store/workbenchStore";
import { ArchitectureNode } from "./ArchitectureNode";
import { ArchitectureEdge, type ArchitectureEdgeData } from "./ArchitectureEdge";
import { ProjectExplorer } from "./ProjectExplorer";
import { ArchitectureTerminal } from "./ArchitectureTerminal";
import { PROJECT_FILES } from "./projectData";
import type { ArchitectureNodeData, TerminalLogEntry, PortType } from "./types";
import { Badge } from "@iw/ui";
import {
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Cable,
  Maximize2,
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

// ── Port Type Compatibility Matrix ──
// Defines which output portType can connect to which input portType
const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  IRemoteCommand: ["IRemoteCommand"],
  ITVReceiver: ["ITVReceiver"],
  DisplayService: ["DisplayService"],
  AudioService: ["AudioService"],
  void: [],
  event: ["event"],
  hardware: ["hardware"],
};

// ── Lookup helpers ──
function findPortType(
  nodeId: string,
  handleId: string | null | undefined,
  direction: "input" | "output",
  nodes: Node<ArchitectureNodeData>[]
): PortType | null {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const ports = direction === "output" ? node.data.outputs : node.data.inputs;
  const port = ports.find((p) => p.id === handleId);
  return port?.portType ?? null;
}

function getPortName(
  nodeId: string,
  handleId: string | null | undefined,
  direction: "input" | "output",
  nodes: Node<ArchitectureNodeData>[]
): string {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return "?";
  const ports = direction === "output" ? node.data.outputs : node.data.inputs;
  const port = ports.find((p) => p.id === handleId);
  return port?.name ?? "?";
}

function getNodeName(nodeId: string, nodes: Node<ArchitectureNodeData>[]): string {
  const node = nodes.find((n) => n.id === nodeId);
  return node?.data.name ?? "?";
}

// ── Code Generation ──
function generateCodePreview(edges: Edge[], nodes: Node<ArchitectureNodeData>[]) {
  const connections = edges.map((e) => ({
    source: getNodeName(e.source, nodes),
    sourcePort: getPortName(e.source, e.sourceHandle, "output", nodes),
    target: getNodeName(e.target, nodes),
    targetPort: getPortName(e.target, e.targetHandle, "input", nodes),
  }));

  if (connections.length === 0) {
    return {
      csharp: "// Немає з'єднань — перетягніть провід між портами нод",
      go: "// Немає з'єднань — перетягніть провід між портами нод",
    };
  }

  const csharpLines = [
    "// === Auto-Generated DI Configuration ===",
    "using Microsoft.Extensions.DependencyInjection;",
    "",
    "var services = new ServiceCollection();",
    "",
  ];
  const goLines = [
    "// === Auto-Generated Wiring ===",
    'package main',
    "",
    "func wireUp() {",
  ];

  connections.forEach((c) => {
    csharpLines.push(
      `// ${c.source}.${c.sourcePort} → ${c.target}.${c.targetPort}`
    );
    csharpLines.push(
      `services.AddTransient<${c.targetPort}>(sp => new ${c.source.replace(".cs", "")}());`
    );
    csharpLines.push("");

    goLines.push(
      `    // ${c.source}.${c.sourcePort} → ${c.target}.${c.targetPort}`
    );
    goLines.push(
      `    controller.Set${c.targetPort}(New${c.source.replace(".cs", "")}())`
    );
  });

  goLines.push("}");

  return {
    csharp: csharpLines.join("\n"),
    go: goLines.join("\n"),
  };
}

// ── Timestamp ──
function now(): string {
  return new Date().toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

let logCounter = 0;
function nextLogId(): string {
  return `log-${++logCounter}-${Date.now()}`;
}

// ── Initial Nodes (Level 1) ──
const createInitialNodes = (): Node<ArchitectureNodeData>[] => {
  const powerCommand = PROJECT_FILES.find((f) => f.id === "class-power-command")!;
  const tvController = PROJECT_FILES.find((f) => f.id === "class-tv-controller")!;

  return [
    {
      id: "node-class-power-command",
      type: "architectureNode",
      position: { x: 60, y: 100 },
      width: 260,
      height: 230,
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
      position: { x: 440, y: 80 },
      width: 260,
      height: 230,
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

// ═══════════════════════════════════════════════
//  Inner Canvas Component
// ═══════════════════════════════════════════════
const InnerArchitectureCanvas: React.FC<ArchitectureCanvasProps> = () => {
  const { t } = useTranslation();
  const { setArchitecturePowerWired } = useWorkbenchStore();
  const { screenToFlowPosition, fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState(createInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<ArchitectureEdgeData>>([]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);

  // ── Add log helper ──
  const addLog = useCallback((entry: Omit<TerminalLogEntry, "id" | "timestamp">) => {
    setTerminalLogs((prev) => [
      ...prev,
      { ...entry, id: nextLogId(), timestamp: now() },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setTerminalLogs([]);
  }, []);

  // ── Check power wire ──
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

  useEffect(() => {
    setArchitecturePowerWired(isPowerWired);
  }, [isPowerWired, setArchitecturePowerWired]);

  // ── Code preview derived from edges ──
  const codePreview = useMemo(
    () => generateCodePreview(edges, nodes),
    [edges, nodes]
  );

  // ── Active file set for sidebar highlighting ──
  const activeFileIds = useMemo(
    () => new Set(nodes.map((n) => n.data.fileId)),
    [nodes]
  );

  // ── Delete edge ──
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      addLog({
        type: "info",
        title: "Від'єднано провід",
        message: "З'єднання було розірвано вручну. Ноди більше не зв'язані.",
      });
    },
    [setEdges, addLog]
  );

  // ══════════════════════════════════════
  //  isValidConnection — STRICT PORT TYPE CHECK
  // ══════════════════════════════════════
  const isValidConnection: IsValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const sourceType = findPortType(
        connection.source ?? "",
        connection.sourceHandle,
        "output",
        nodes
      );
      const targetType = findPortType(
        connection.target ?? "",
        connection.targetHandle,
        "input",
        nodes
      );

      if (!sourceType || !targetType) return false;

      const compatible = PORT_COMPATIBILITY[sourceType];
      const isValid = compatible?.includes(targetType) ?? false;

      if (!isValid) {
        const srcNodeName = getNodeName(connection.source ?? "", nodes);
        const tgtNodeName = getNodeName(connection.target ?? "", nodes);
        const srcPortName = getPortName(
          connection.source ?? "",
          connection.sourceHandle,
          "output",
          nodes
        );
        const tgtPortName = getPortName(
          connection.target ?? "",
          connection.targetHandle,
          "input",
          nodes
        );

        addLog({
          type: "error",
          title: `✗ Помилка типів (Type Mismatch)`,
          message: `Неможливо підключити вихід «${srcPortName}» (тип: ${sourceType}) з «${srcNodeName}» до входу «${tgtPortName}» (тип: ${targetType}) на «${tgtNodeName}». Причина: контракт інтерфейсу не збігається — ${sourceType} ≠ ${targetType}. У Dependency Injection порт-приймач має точно відповідати типу, який надає провайдер.`,
          codeContext: `// ✗ Невалідний зв'язок:\n// ${srcNodeName}.${srcPortName} [${sourceType}]\n//   → ${tgtNodeName}.${tgtPortName} [${targetType}]\n// Рішення: знайдіть порт із типом «${targetType}»`,
        });
      }

      return isValid;
    },
    [nodes, addLog]
  );

  // ══════════════════════════════════════
  //  onConnect — educational logging
  // ══════════════════════════════════════
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const isTargetPowerWire =
        params.source === "node-class-power-command" &&
        params.sourceHandle === "out-execute" &&
        params.target === "node-class-tv-controller" &&
        params.targetHandle === "in-command-handler";

      const srcNodeName = getNodeName(params.source ?? "", nodes);
      const tgtNodeName = getNodeName(params.target ?? "", nodes);
      const srcPortName = getPortName(
        params.source ?? "",
        params.sourceHandle,
        "output",
        nodes
      );
      const tgtPortName = getPortName(
        params.target ?? "",
        params.targetHandle,
        "input",
        nodes
      );

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

      // Educational log
      if (isTargetPowerWire) {
        addLog({
          type: "success",
          title: "✓ Dependency Injection виконано!",
          message: `Ви успішно підключили «${srcNodeName}.${srcPortName}» до «${tgtNodeName}.${tgtPortName}». Це реалізація патерну Command: контролер отримує команду через інтерфейс IRemoteCommand, не знаючи конкретної реалізації. Це забезпечує Loose Coupling — слабку зв'язаність компонентів.`,
          codeContext: `// Dependency Injection (Constructor Injection):\npublic class TVController {\n    private readonly IRemoteCommand _cmd;\n    public TVController(IRemoteCommand cmd) {\n        _cmd = cmd; // ← Ваш провід!\n    }\n}`,
        });
      } else {
        addLog({
          type: "success",
          title: `✓ З'єднання встановлено`,
          message: `${srcNodeName}.${srcPortName} → ${tgtNodeName}.${tgtPortName}. Залежність успішно впроваджена через інтерфейсний контракт.`,
        });
      }
    },
    [handleDeleteEdge, setEdges, nodes, addLog]
  );

  // ── Add node by file ID ──
  const addNodeByFileId = useCallback(
    (fileId: string, position?: { x: number; y: number }) => {
      const file = PROJECT_FILES.find((f) => f.id === fileId);
      if (!file) return;

      const nodeId = `node-${file.id}`;

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

      const targetPos = position || {
        x: 80 + (nodes.length % 5) * 50,
        y: 100 + (nodes.length % 4) * 60,
      };

      const newNode: Node<ArchitectureNodeData> = {
        id: nodeId,
        type: "architectureNode",
        position: targetPos,
        width: 260,
        height: 230,
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

      addLog({
        type: "info",
        title: `Додано: ${file.name}`,
        message: `Клас/інтерфейс «${file.name}» розміщено на полотні. Роль: ${file.role}.`,
      });
    },
    [nodes, setNodes, addLog]
  );

  // ── Drag & Drop ──
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

  // ── Auto-Wire ──
  const handleAutoWire = useCallback(() => {
    addNodeByFileId("class-power-command", { x: 60, y: 100 });
    addNodeByFileId("class-tv-controller", { x: 440, y: 80 });

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

    addLog({
      type: "success",
      title: "✓ Auto-Wire: PowerCommand → TVController",
      message:
        "Автоматичне з'єднання встановлено. Патерн Command реалізовано: PowerCommand.Execute() тепер підключено до TVController.CommandHandler через інтерфейс IRemoteCommand.",
      codeContext:
        "services.AddTransient<IRemoteCommand, PowerCommand>();\n// TVController отримає PowerCommand через DI",
    });
  }, [addNodeByFileId, handleDeleteEdge, setEdges, addLog]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setNodes(createInitialNodes());
    setEdges([]);
    clearLogs();
    addLog({
      type: "info",
      title: "Полотно скинуто",
      message: "Архітектура повернута до початкового стану. Усі з'єднання видалено.",
    });
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  }, [fitView, setEdges, setNodes, clearLogs, addLog]);

  // ── Fit view on mount ──
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 120);
    return () => clearTimeout(timer);
  }, [fitView]);

  // ── Initial log on mount ──
  useEffect(() => {
    addLog({
      type: "info",
      title: "🎯 Місія Level 1",
      message:
        "Реалізуйте патерн Command для кнопки живлення телевізора. Перетягніть провід від PowerCommand.Execute() до TVController.CommandHandler.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col w-full h-full overflow-hidden" style={{ background: "#1E1E20" }}>
      {/* Top Mission Callout Bar */}
      <div
        className={`px-4 py-2.5 border-b transition-colors duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none shrink-0 ${
          isPowerWired
            ? "bg-emerald-950/40 border-emerald-800/60"
            : "bg-amber-950/40 border-amber-800/60"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
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
              <span className="font-display font-bold text-xs sm:text-sm text-gray-100">
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
            <p className="font-balsamiq text-[10.5px] sm:text-xs text-gray-400 leading-tight">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2A2B2F] hover:bg-[#353640] border border-[#3E3F45] hover:border-blue-500/60 text-gray-200 text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles size={13} className="text-blue-400" />
            <span>{t("architecture.autoWire")}</span>
          </button>

          <button
            onClick={handleReset}
            title="Скинути полотно до початкового стану"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#2A2B2F] hover:bg-[#353640] border border-[#3E3F45] text-gray-400 hover:text-gray-200 text-xs font-balsamiq font-bold transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw size={13} />
            <span>{t("architecture.reset")}</span>
          </button>

          <button
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            title={t("architecture.centerView")}
            className="p-1.5 rounded-xl bg-[#2A2B2F] hover:bg-[#353640] border border-[#3E3F45] text-gray-400 hover:text-gray-200 cursor-pointer shadow-sm"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Editor Body: Project Explorer + ReactFlow Canvas */}
      <div className="flex-1 flex flex-row w-full h-full min-h-0 relative overflow-hidden">
        <ProjectExplorer onAddNode={addNodeByFileId} activeFileIds={activeFileIds} />

        {/* ReactFlow Canvas with dark theme */}
        <div
          className="flex-1 min-w-0 relative"
          style={{
            height: "calc(100vh - 7.5rem)",
            minHeight: "450px",
            background: "#1E1E20",
          }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.25}
            maxZoom={1.8}
            connectionLineStyle={{ stroke: "#FBBF24", strokeWidth: 2.5 }}
            proOptions={{ hideAttribution: true }}
            style={{ background: "#1E1E20" }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              color="#3E3F45"
              gap={20}
              size={1.5}
            />
            <Controls
              showInteractive={false}
              className="!bg-[#26272B] !border-[#3E3F45] !rounded-xl !shadow-lg [&>button]:!bg-[#26272B] [&>button]:!border-[#3E3F45] [&>button]:!text-gray-400 hover:[&>button]:!text-gray-100 [&>button]:!fill-gray-400 hover:[&>button]:!fill-gray-100"
            />
          </ReactFlow>

          {/* Educational Terminal (overlaid at bottom) */}
          <ArchitectureTerminal
            logs={terminalLogs}
            onClearLogs={clearLogs}
            currentMission={t("architecture.missionInstructions")}
            codePreview={codePreview}
          />
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
