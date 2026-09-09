import React, { useCallback, useMemo, useEffect, useState, useRef } from "react";
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
  type NodeChange,
  type NodeRemoveChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkbenchStore } from "../../../store/workbenchStore";
import { ArchitectureNode } from "./ArchitectureNode";
import { ArchitectureEdge, type ArchitectureEdgeData } from "./ArchitectureEdge";
import { ProjectExplorer } from "./ProjectExplorer";
import { ArchitectureTerminal } from "./ArchitectureTerminal";
import { MentorBar } from "./MentorBar";
import { CompletionModal } from "./CompletionModal";
import { PROJECT_FILES } from "./projectData";
import type { ArchitectureNodeData, TerminalLogEntry, PortType } from "./types";
import { Badge } from "@iw/ui";
import { CheckCircle2, Sparkles, RotateCcw, Cable, Maximize2 } from "lucide-react";

interface ArchitectureCanvasProps {
  onBackToTv?: () => void;
}

// ────────────────────────────────────────────────
//  Port type compatibility matrix
// ────────────────────────────────────────────────
const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  IRemoteCommand: ["IRemoteCommand"],
  ITVReceiver: ["ITVReceiver"],
  DisplayService: ["DisplayService"],
  AudioService: ["AudioService"],
  void: [],
  event: ["event"],
  hardware: ["hardware"],
};

// ────────────────────────────────────────────────
//  Helpers
// ────────────────────────────────────────────────
function findPortType(
  nodeId: string,
  handleId: string | null | undefined,
  direction: "input" | "output",
  nodes: Node<ArchitectureNodeData>[]
): PortType | null {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;
  const ports = direction === "output" ? node.data.outputs : node.data.inputs;
  return ports.find((p) => p.id === handleId)?.portType ?? null;
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
  return ports.find((p) => p.id === handleId)?.name ?? "?";
}

function getNodeName(nodeId: string, nodes: Node<ArchitectureNodeData>[]): string {
  return nodes.find((n) => n.id === nodeId)?.data.name ?? "?";
}

// ────────────────────────────────────────────────
//  Code preview generation
// ────────────────────────────────────────────────
function generateCodePreview(
  edges: Edge[],
  nodes: Node<ArchitectureNodeData>[]
): { csharp: string; go: string } {
  if (edges.length === 0) {
    return {
      csharp: "// Немає з'єднань — перетягніть провід між портами нод",
      go: "// Немає з'єднань — перетягніть провід між портами нод",
    };
  }

  const csLines: string[] = [
    "// === Конфігурація DI (auto-generated) ===",
    "using Microsoft.Extensions.DependencyInjection;",
    "",
    "var services = new ServiceCollection();",
    "",
  ];
  const goLines: string[] = ["// === Ініціалізація залежностей ===", "func wireUp() {"];

  edges.forEach((e) => {
    const srcName = getNodeName(e.source, nodes);
    const srcPort = getPortName(e.source, e.sourceHandle, "output", nodes);
    const tgtName = getNodeName(e.target, nodes);
    const tgtPort = getPortName(e.target, e.targetHandle, "input", nodes);

    csLines.push(`// ${srcName}.${srcPort} → ${tgtName}.${tgtPort}`);
    csLines.push(
      `services.AddTransient<I${tgtPort.replace("(DI)", "").trim()}>(sp => new ${srcName.replace(".cs", "")}());`
    );
    csLines.push("");
    goLines.push(`  // ${srcName}.${srcPort} → ${tgtName}.${tgtPort}`);
    goLines.push(
      `  controller.Set${tgtPort.replace("(DI)", "").trim()}(New${srcName.replace(".cs", "")}())`
    );
  });

  goLines.push("}");
  return { csharp: csLines.join("\n"), go: goLines.join("\n") };
}

// ────────────────────────────────────────────────
//  Timestamp & log id
// ────────────────────────────────────────────────
function nowStr(): string {
  return new Date().toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

let _lid = 0;
const lid = () => `log-${++_lid}-${Date.now()}`;

// ────────────────────────────────────────────────
//  Initial nodes (Level 1)
// ────────────────────────────────────────────────
const createInitialNodes = (): Node<ArchitectureNodeData>[] => {
  const pc = PROJECT_FILES.find((f) => f.id === "class-power-command")!;
  const tv = PROJECT_FILES.find((f) => f.id === "class-tv-controller")!;
  return [
    {
      id: "node-class-power-command",
      type: "architectureNode",
      position: { x: 60, y: 100 },
      width: 268,
      data: {
        fileId: pc.id, name: pc.name, path: pc.path,
        entityType: pc.entityType, role: pc.role,
        inputs: pc.inputs, outputs: pc.outputs,
      },
    },
    {
      id: "node-class-tv-controller",
      type: "architectureNode",
      position: { x: 440, y: 80 },
      width: 268,
      data: {
        fileId: tv.id, name: tv.name, path: tv.path,
        entityType: tv.entityType, role: tv.role,
        inputs: tv.inputs, outputs: tv.outputs,
      },
    },
  ];
};

const nodeTypes = { architectureNode: ArchitectureNode };
const edgeTypes = { architectureEdge: ArchitectureEdge };

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
    completeLevel,
  } = useWorkbenchStore();
  const { screenToFlowPosition, fitView, setCenter, getNode } = useReactFlow();

  // Restore from store if we have saved state, otherwise use initial
  const initialNodes = storedNodes.length > 0
    ? (storedNodes as Node<ArchitectureNodeData>[])
    : createInitialNodes();
  const initialEdges = storedEdges as Edge<ArchitectureEdgeData>[];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<ArchitectureEdgeData>>(initialEdges);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>([]);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Debounce ref for store sync
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync completion modal with store
  useEffect(() => {
    if (mentorPhase === "COMPLETED") {
      setIsCompletionModalOpen(true);
    }
  }, [mentorPhase]);

  // If edges were cleared in store for practice, sync local edges
  useEffect(() => {
    if (mentorPhase === "PRACTICE" && storedEdges.length === 0 && edges.length > 0) {
      setEdges([]);
    }
  }, [mentorPhase, storedEdges.length, edges.length, setEdges]);

  // ── log helper ──────────────────────────────
  const addLog = useCallback((entry: Omit<TerminalLogEntry, "id" | "timestamp">) => {
    setTerminalLogs((prev) => [...prev, { ...entry, id: lid(), timestamp: nowStr() }]);
  }, []);

  const clearLogs = useCallback(() => setTerminalLogs([]), []);

  // ── is power wire active? ──────────────────
  const isPowerWired = useMemo(
    () =>
      edges.some(
        (e) =>
          e.source.includes("power-command") &&
          e.sourceHandle === "out-execute" &&
          e.target.includes("tv-controller") &&
          e.targetHandle === "in-command-handler"
      ),
    [edges]
  );

  useEffect(() => {
    setArchitecturePowerWired(isPowerWired);
  }, [isPowerWired, setArchitecturePowerWired]);

  // ── Persist graph to store (debounced 50ms) ──
  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      setArchNodes(nodes);
      setArchEdges(edges);
    }, 50);
  }, [nodes, edges, setArchNodes, setArchEdges]);

  // cleanup persist timer on unmount
  useEffect(() => {
    return () => { if (persistTimer.current) clearTimeout(persistTimer.current); };
  }, []);

  // ── code preview ────────────────────────────
  const codePreview = useMemo(() => generateCodePreview(edges, nodes), [edges, nodes]);

  // ── active file ids ─────────────────────────
  const activeFileIds = useMemo(
    () => new Set(nodes.map((n) => n.data.fileId)),
    [nodes]
  );

  // ── delete edges for a removed node ────────
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<ArchitectureNodeData>>[]) => {
      const removedIds = changes
        .filter((c): c is NodeRemoveChange => c.type === "remove")
        .map((c) => c.id);

      if (removedIds.length > 0) {
        setEdges((eds) =>
          eds.filter(
            (e) => !removedIds.includes(e.source) && !removedIds.includes(e.target)
          )
        );
        addLog({
          type: "info",
          title: "Ноду видалено",
          message: "Компонент та всі його з'єднання знято з полотна.",
        });
      }

      onNodesChange(changes);
    },
    [onNodesChange, setEdges, addLog]
  );

  // ── delete edge ─────────────────────────────
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      addLog({
        type: "info",
        title: "Провід відключено",
        message: "Залежність розірвана вручну.",
      });
    },
    [setEdges, addLog]
  );

  // ── keyboard Delete / Backspace ─────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      setNodes((nds) => {
        const toRemove = nds.filter((n) => n.selected).map((n) => n.id);
        if (toRemove.length > 0) {
          setEdges((eds) =>
            eds.filter((e) => !toRemove.includes(e.source) && !toRemove.includes(e.target))
          );
          addLog({ type: "info", title: "Ноду видалено (Delete)", message: "Обраний компонент знято з полотна." });
        }
        return nds.filter((n) => !n.selected);
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setNodes, setEdges, addLog]);

  // ── flash helper (1 s outline pulse) ────────
  const flashNode = useCallback(
    (nodeId: string) => {
      // Clear old timer for this node
      const old = flashTimers.current.get(nodeId);
      if (old) clearTimeout(old);

      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, isFlashing: true } } : n
        )
      );
      const t2 = setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, isFlashing: false } } : n
          )
        );
        flashTimers.current.delete(nodeId);
      }, 900);
      flashTimers.current.set(nodeId, t2);
    },
    [setNodes]
  );

  // ── add node by file ID ──────────────────────
  const addNodeByFileId = useCallback(
    (fileId: string, position?: { x: number; y: number }) => {
      const file = PROJECT_FILES.find((f) => f.id === fileId);
      if (!file) return;

      const nodeId = `node-${file.id}`;
      const existing = nodes.find((n) => n.id === nodeId);

      // ── Already on board → focus & flash ──
      if (existing) {
        const rfNode = getNode(nodeId);
        if (rfNode) {
          const cx = rfNode.position.x + (rfNode.width ?? 268) / 2;
          const cy = rfNode.position.y + (rfNode.measured?.height ?? 200) / 2;
          setCenter(cx, cy, { zoom: 1, duration: 420 });
        }
        flashNode(nodeId);
        setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
        addLog({
          type: "info",
          title: `${file.name} вже на дошці`,
          message: "Камеру центровано на наявній ноді.",
        });
        return;
      }

      // ── New node ──
      const targetPos = position || {
        x: 80 + (nodes.length % 5) * 60,
        y: 100 + Math.floor(nodes.length / 5) * 80,
      };

      const newNode: Node<ArchitectureNodeData> = {
        id: nodeId,
        type: "architectureNode",
        position: targetPos,
        width: 268,
        data: {
          fileId: file.id, name: file.name, path: file.path,
          entityType: file.entityType, role: file.role,
          inputs: file.inputs, outputs: file.outputs,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addLog({
        type: "info",
        title: `Додано: ${file.name}`,
        message: `${file.role}`,
      });
    },
    [nodes, setNodes, getNode, setCenter, flashNode, addLog]
  );

  // ── Drag & Drop ─────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fileId = e.dataTransfer.getData("application/reactflow");
      if (!fileId) return;
      addNodeByFileId(fileId, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [screenToFlowPosition, addNodeByFileId]
  );

  // ── isValidConnection (strict portType check) ──
  const isValidConnection: IsValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const srcType = findPortType(connection.source ?? "", connection.sourceHandle, "output", nodes);
      const tgtType = findPortType(connection.target ?? "", connection.targetHandle, "input", nodes);

      if (!srcType || !tgtType) return false;
      const valid = PORT_COMPATIBILITY[srcType]?.includes(tgtType) ?? false;

      if (!valid) {
        const srcNodeName = getNodeName(connection.source ?? "", nodes);
        const tgtNodeName = getNodeName(connection.target ?? "", nodes);
        const srcPortName = getPortName(connection.source ?? "", connection.sourceHandle, "output", nodes);
        const tgtPortName = getPortName(connection.target ?? "", connection.targetHandle, "input", nodes);

        addLog({
          type: "error",
          title: `✗ ${t("architecture.typeMismatch")}`,
          message: t("architecture.typeMismatchDetail", {
            sourceType: srcType,
            targetType: tgtType,
          }),
          codeContext: `// ✗ Type Mismatch:\n// ${srcNodeName}.${srcPortName} [${srcType}]\n//   → ${tgtNodeName}.${tgtPortName} [${tgtType}]\n// Expected port type: «${tgtType}»`,
        });
      }

      return valid;
    },
    [nodes, addLog, t]
  );

  // ── onConnect ───────────────────────────────
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const isPowerWire =
        Boolean(params.source?.includes("power-command")) &&
        params.sourceHandle === "out-execute" &&
        Boolean(params.target?.includes("tv-controller")) &&
        params.targetHandle === "in-command-handler";

      const srcNode = getNodeName(params.source ?? "", nodes);
      const tgtNode = getNodeName(params.target ?? "", nodes);
      const srcPort = getPortName(params.source ?? "", params.sourceHandle, "output", nodes);
      const tgtPort = getPortName(params.target ?? "", params.targetHandle, "input", nodes);

      const newEdge: Edge<ArchitectureEdgeData> = {
        ...params,
        id: `ae-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        type: "architectureEdge",
        data: { isValidPowerWire: isPowerWire, onDelete: handleDeleteEdge },
      };

      setEdges((eds) => addEdge(newEdge, eds));

      if (isPowerWire) {
        if (mentorPhase === "GUIDED") {
          setMentorPhase("VERIFY");
          addLog({
            type: "success",
            title: `✓ ${t("architecture.diSuccessTitle")}`,
            message: `${t("architecture.diSuccessDetail", {
              sourceClass: srcNode,
              sourcePort: srcPort,
              targetClass: tgtNode,
              targetPort: tgtPort,
              interfaceType: "IRemoteCommand",
            })} ${t("mentor.verifyMsg")}`,
            codeContext: `// Constructor Injection:\npublic class TVController {\n    private readonly IRemoteCommand _cmd;\n    public TVController(IRemoteCommand cmd) {\n        _cmd = cmd; // ← Handled by mentor!\n    }\n    public void Dispatch() => _cmd.Execute();\n}`,
          });
        } else if (mentorPhase === "PRACTICE") {
          completeLevel();
          setIsCompletionModalOpen(true);
          addLog({
            type: "success",
            title: `✓ ${t("mentor.completedTitle")}`,
            message: `${t("mentor.reward")} ${t("mentor.summaryExplanation")}`,
            codeContext: `services.AddTransient<IRemoteCommand, PowerCommand>();\nservices.AddSingleton<TVController>();`,
          });
        } else {
          addLog({
            type: "success",
            title: `✓ ${t("architecture.diSuccessTitle")}`,
            message: t("architecture.diSuccessDetail", {
              sourceClass: srcNode,
              sourcePort: srcPort,
              targetClass: tgtNode,
              targetPort: tgtPort,
              interfaceType: "IRemoteCommand",
            }),
            codeContext: `// Constructor Injection:\npublic class TVController {\n    private readonly IRemoteCommand _cmd;\n    public TVController(IRemoteCommand cmd) {\n        _cmd = cmd;\n    }\n    public void Dispatch() => _cmd.Execute();\n}`,
          });
        }
      } else {
        addLog({
          type: "success",
          title: `✓ ${srcNode} → ${tgtNode}`,
          message: `${srcPort} → ${tgtPort}`,
        });
      }
    },
    [nodes, handleDeleteEdge, setEdges, addLog, mentorPhase, setMentorPhase, completeLevel, t]
  );

  // ── Auto-Wire ────────────────────────────────
  const handleAutoWire = useCallback(() => {
    addNodeByFileId("class-power-command", { x: 60, y: 100 });
    addNodeByFileId("class-tv-controller", { x: 440, y: 80 });

    const autoEdge: Edge<ArchitectureEdgeData> = {
      id: "ae-auto-power",
      source: "node-class-power-command",
      sourceHandle: "out-execute",
      target: "node-class-tv-controller",
      targetHandle: "in-command-handler",
      type: "architectureEdge",
      data: { isValidPowerWire: true, onDelete: handleDeleteEdge },
    };

    setEdges((eds) => {
      const filtered = eds.filter(
        (e) =>
          !(e.source === "node-class-power-command" &&
            e.target === "node-class-tv-controller")
      );
      return [...filtered, autoEdge];
    });

    addLog({
      type: "success",
      title: "✓ Auto-Wire: PowerCommand → TVController",
      message:
        "Dependency Injection виконано автоматично. PowerCommand.Execute() підключено до TVController.CommandHandler через інтерфейс IRemoteCommand.",
      codeContext: "services.AddTransient<IRemoteCommand, PowerCommand>();",
    });
  }, [addNodeByFileId, handleDeleteEdge, setEdges, addLog]);

  // ── Reset ────────────────────────────────────
  const handleReset = useCallback(() => {
    flashTimers.current.forEach((t) => clearTimeout(t));
    flashTimers.current.clear();
    const fresh = createInitialNodes();
    setNodes(fresh);
    setEdges([]);
    setArchNodes(fresh);
    setArchEdges([]);
    clearLogs();
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    setTimeout(() =>
      addLog({
        type: "info",
        title: "🎯 Місія Level 1",
        message:
          "Реалізуйте патерн Command для кнопки живлення телевізора. З'єднайте вихідний порт Execute класу PowerCommand із вхідним портом CommandHandler контролера TVController.",
      })
    , 60);
  }, [fitView, setEdges, setNodes, setArchNodes, setArchEdges, clearLogs, addLog]);

  // ── Fit view on mount ────────────────────────
  useEffect(() => {
    const t2 = setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 120);
    return () => clearTimeout(t2);
  }, [fitView]);

  // ── Initial log on mount ─────────────────────
  useEffect(() => {
    addLog({
      type: "info",
      title: "🎯 Місія Level 1",
      message:
        "Чому пульт не вмикає телевізор? Контролер очікує команду через інтерфейс IRemoteCommand. З'єднайте вихідний порт Execute класу PowerCommand із вхідним портом CommandHandler контролера TVController.",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── cleanup flash timers on unmount ─────────
  useEffect(() => {
    const timers = flashTimers.current;
    return () => { timers.forEach((t) => clearTimeout(t)); timers.clear(); };
  }, []);

  // ════════════════════════════════════════════
  //  Render
  // ════════════════════════════════════════════
  return (
    <div
      className="flex flex-col w-full h-full overflow-hidden"
      style={{ background: "#1E1E22" }}
    >
      {/* ── Mission bar ── */}
      <div
        className={`px-4 py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none shrink-0 transition-colors duration-300 ${
          isPowerWired
            ? "bg-emerald-950/40 border-emerald-800/50"
            : "bg-[#242428] border-[#2E2E32]"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isPowerWired ? "bg-emerald-500 text-white" : "bg-amber-500/80 text-white animate-pulse"
            }`}
          >
            {isPowerWired ? <CheckCircle2 size={15} /> : <Cable size={15} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[11px] text-gray-200">
                {t("architecture.level1Title")}
              </span>
              <Badge variant={isPowerWired ? "ok" : "accent"} size="sm" className="text-[9px]">
                {isPowerWired
                  ? t("architecture.connectionActive")
                  : t("architecture.waitingConnection")}
              </Badge>
            </div>
            <p className="font-balsamiq text-[9.5px] text-gray-500 leading-tight">
              {isPowerWired
                ? t("architecture.missionSuccess")
                : t("architecture.missionInstructions")}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          <button
            onClick={handleAutoWire}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2E2F36] hover:bg-[#383A44] border border-white/[0.07] text-gray-300 text-[11px] font-mono font-bold transition-all cursor-pointer active:scale-95"
          >
            <Sparkles size={12} className="text-blue-400" />
            {t("architecture.autoWire")}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2E2F36] hover:bg-[#383A44] border border-white/[0.07] text-gray-400 hover:text-gray-200 text-[11px] font-mono font-bold transition-all cursor-pointer"
          >
            <RotateCcw size={12} />
            {t("architecture.reset")}
          </button>
          <button
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            title={t("architecture.centerView")}
            className="p-1.5 rounded-lg bg-[#2E2F36] hover:bg-[#383A44] border border-white/[0.07] text-gray-500 hover:text-gray-200 cursor-pointer"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Body: sidebar + canvas ── */}
      <div className="flex-1 flex flex-row w-full min-h-0 relative overflow-hidden">
        <ProjectExplorer onAddNode={addNodeByFileId} activeFileIds={activeFileIds} />

        {/* ReactFlow canvas */}
        <div
          className="flex-1 relative min-w-0 flex flex-col h-full"
          style={{ background: "#1E1E22" }}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="flex-1 relative min-h-0 w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              deleteKeyCode={null}        // handled manually
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

            {/* Terminal overlay */}
            <ArchitectureTerminal
              logs={terminalLogs}
              onClearLogs={clearLogs}
              currentMission={t("architecture.missionInstructions")}
              codePreview={codePreview}
            />
          </div>

          {/* Interactive Mentor Bar */}
          <MentorBar onGoToTv={onBackToTv} />
        </div>
      </div>

      {/* Completion Celebration Modal */}
      <CompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onNextTask={() => {
          setIsCompletionModalOpen(false);
          if (onBackToTv) onBackToTv();
        }}
      />
    </div>
  );
};

// ════════════════════════════════════════════════
//  Public export (wrapped in ReactFlowProvider)
// ════════════════════════════════════════════════
export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = (props) => (
  <ReactFlowProvider>
    <InnerArchitectureCanvas {...props} />
  </ReactFlowProvider>
);
