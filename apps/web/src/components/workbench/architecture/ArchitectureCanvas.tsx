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
import type { ArchitectureNodeData, TerminalLogEntry, PortType, InjectedDependencyInfo } from "./types";
import { CheckCircle2, Sparkles, RotateCcw, Cable, Maximize2, Zap, X } from "lucide-react";
import { audioFx } from "../../../utils/audioFx";

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
  const d = new Date();
  const time = d.toTimeString().slice(0, 8);
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}`;
}

let _lid = 0;
const lid = () => `log-${++_lid}-${Date.now()}`;

// ────────────────────────────────────────────────
//  Initial nodes (Level 1)
// ────────────────────────────────────────────────
const createInitialNodes = (): Node<ArchitectureNodeData>[] => {
  const pc = PROJECT_FILES.find((f) => f.id === "class-power-command")!;
  const vol = PROJECT_FILES.find((f) => f.id === "class-volume-up-command")!;
  const tv = PROJECT_FILES.find((f) => f.id === "class-tv-controller")!;
  return [
    {
      id: "node-class-power-command",
      type: "architectureNode",
      position: { x: 60, y: 60 },
      width: 290,
      data: {
        fileId: pc.id, name: pc.name, path: pc.path,
        entityType: pc.entityType, role: pc.role,
        inputs: pc.inputs, outputs: pc.outputs,
        implementsInterface: pc.implementsInterface,
      },
    },
    {
      id: "node-class-volume-up-command",
      type: "architectureNode",
      position: { x: 60, y: 300 },
      width: 290,
      data: {
        fileId: vol.id, name: vol.name, path: vol.path,
        entityType: vol.entityType, role: vol.role,
        inputs: vol.inputs, outputs: vol.outputs,
        implementsInterface: vol.implementsInterface,
      },
    },
    {
      id: "node-class-tv-controller",
      type: "architectureNode",
      position: { x: 450, y: 110 },
      width: 290,
      data: {
        fileId: tv.id, name: tv.name, path: tv.path,
        entityType: tv.entityType, role: tv.role,
        inputs: tv.inputs, outputs: tv.outputs,
        implementsInterface: tv.implementsInterface,
        injectedDependency: null,
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
  const [isHotSwapInsightOpen, setIsHotSwapInsightOpen] = useState(false);
  const [diMode, setDiMode] = useState<"WITH_DI" | "WITHOUT_DI">("WITH_DI");
  const [currentTraceStep, setCurrentTraceStep] = useState<number>(0);
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  // Debounce ref for store sync
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleDiMode = useCallback((mode: "WITH_DI" | "WITHOUT_DI") => {
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
  }, [setEdges]);

  // Synchronize TVController._cmd memory slot with connected edge
  useEffect(() => {
    const activeEdge = edges.find(
      (e) =>
        e.target.includes("tv-controller") &&
        e.targetHandle === "in-command-handler"
    );

    let dep: InjectedDependencyInfo | null = null;
    if (activeEdge) {
      if (activeEdge.source.includes("power-command")) {
        dep = { name: "PowerCommand", address: "0x7F2A", commandType: "power" };
      } else if (activeEdge.source.includes("volume")) {
        dep = { name: "VolumeUpCommand", address: "0x9B1C", commandType: "volume" };
      } else {
        dep = { name: "CustomCommand", address: "0x4A10", commandType: "other" };
      }
    }

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === "node-class-tv-controller") {
          const currentDep = n.data.injectedDependency;
          if (currentDep?.name === dep?.name && currentDep?.address === dep?.address) {
            return n;
          }
          return {
            ...n,
            data: {
              ...n.data,
              injectedDependency: dep,
            },
          };
        }
        return n;
      })
    );
  }, [edges, setNodes]);

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

  const isVolumeWired = useMemo(
    () =>
      edges.some(
        (e) =>
          e.source.includes("volume") &&
          e.sourceHandle === "out-execute" &&
          e.target.includes("tv-controller") &&
          e.targetHandle === "in-command-handler"
      ),
    [edges]
  );

  const isAnyCommandWired = isPowerWired || isVolumeWired;

  useEffect(() => {
    setArchitecturePowerWired(isAnyCommandWired);
  }, [isAnyCommandWired, setArchitecturePowerWired]);

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
          subsystem: "GRAPH",
          operation: "UNREGISTER",
          message: "Component detached from canvas container",
          details: "Removed node and all incident edges",
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
        subsystem: "IoC",
        operation: "DISCONNECT",
        message: "Binding severed manually",
        details: `Edge ${edgeId} unlinked from dependency graph`,
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
          addLog({
            type: "info",
            subsystem: "GRAPH",
            operation: "UNREGISTER",
            message: "Selected component(s) removed via [DEL]",
            details: "Dependency graph updated",
          });
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
          const cx = rfNode.position.x + (rfNode.width ?? 276) / 2;
          const cy = rfNode.position.y + (rfNode.measured?.height ?? 200) / 2;
          setCenter(cx, cy, { zoom: 1, duration: 420 });
        }
        flashNode(nodeId);
        setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
        addLog({
          type: "info",
          subsystem: "GRAPH",
          operation: "FOCUS",
          message: `Target ${file.name} located on canvas`,
          targetNodeId: nodeId,
          details: `Camera centered at (0x${file.id.slice(-4).toUpperCase()})`,
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
        width: 290,
        data: {
          fileId: file.id, name: file.name, path: file.path,
          entityType: file.entityType, role: file.role,
          inputs: file.inputs, outputs: file.outputs,
          implementsInterface: file.implementsInterface,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addLog({
        type: "info",
        subsystem: "IoC",
        operation: "DISCOVER",
        message: `Component registered: ${file.name}`,
        targetNodeId: nodeId,
        details: `${file.role} | Path: ${file.path}`,
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
          subsystem: "FAULT",
          operation: "TYPE_MISMATCH",
          message: `Binding rejected: ${srcNodeName}.${srcPortName} -> ${tgtNodeName}.${tgtPortName}`,
          targetNodeId: connection.target ?? undefined,
          details: `Cannot bind [${srcType}] to [${tgtType}]`,
          codeContext: `// ✗ Type Mismatch:\n// ${srcNodeName}.${srcPortName} [${srcType}]\n//   → ${tgtNodeName}.${tgtPortName} [${tgtType}]\n// Expected port type: «${tgtType}»`,
        });
      }

      return valid;
    },
    [nodes, addLog]
  );

  // ── onConnect ───────────────────────────────
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const isTargetTvCtor =
        Boolean(params.target?.includes("tv-controller")) &&
        params.targetHandle === "in-command-handler";

      const isPowerSource =
        Boolean(params.source?.includes("power-command")) &&
        params.sourceHandle === "out-execute";

      const isVolumeSource =
        Boolean(params.source?.includes("volume")) &&
        params.sourceHandle === "out-execute";

      const isPowerWire = isPowerSource && isTargetTvCtor;
      const isVolumeWire = isVolumeSource && isTargetTvCtor;
      const isCommandWire = isPowerWire || isVolumeWire;
      const commandName = isVolumeWire
        ? "VolumeUpCommand"
        : isPowerWire
        ? "PowerCommand"
        : undefined;

      const srcNode = getNodeName(params.source ?? "", nodes);
      const tgtNode = getNodeName(params.target ?? "", nodes);
      const srcPort = getPortName(params.source ?? "", params.sourceHandle, "output", nodes);
      const tgtPort = getPortName(params.target ?? "", params.targetHandle, "input", nodes);

      const newEdge: Edge<ArchitectureEdgeData> = {
        ...params,
        id: `ae-${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        type: "architectureEdge",
        data: {
          isValidPowerWire: isCommandWire,
          commandName,
          diMode,
          onDelete: handleDeleteEdge,
        },
      };

      // Single-slot rule: If connecting to tv-controller ctor, remove any existing command wire!
      setEdges((eds) => {
        const filtered = isTargetTvCtor
          ? eds.filter(
              (e) =>
                !(
                  e.target.includes("tv-controller") &&
                  e.targetHandle === "in-command-handler"
                )
            )
          : eds;
        return addEdge(newEdge, filtered);
      });

      if (isVolumeWire) {
        audioFx.playRelayClick();
        setIsHotSwapInsightOpen(true);
        addLog({
          type: "success",
          subsystem: "IoC",
          operation: "HOT_SWAP",
          message: `${tgtNode}.${tgtPort} -> hot-swapped with ${srcNode} (0x9B1C)`,
          targetNodeId: params.target ?? undefined,
          details: "Поліморфізм у дії: TVController.cs не змінено жодним рядком!",
          codeContext: `// Hot Swap Polymorphism:\nservices.AddTransient<IRemoteCommand, VolumeUpCommand>();\n// TVController._cmd.Execute() тепер змінює гучність!`,
        });
      } else if (isPowerWire) {
        audioFx.playRelayClick();
        if (mentorPhase === "GUIDED") {
          setMentorPhase("VERIFY");
          addLog({
            type: "success",
            subsystem: "IoC",
            operation: "RESOLVE",
            message: `${tgtNode}.${tgtPort} -> injected ${srcNode} (0x7F2A)`,
            targetNodeId: params.target ?? undefined,
            details: "Interface IRemoteCommand resolved to concrete instance",
            codeContext: `// Constructor Injection:\npublic class TVController {\n    private readonly IRemoteCommand _cmd;\n    public TVController(IRemoteCommand cmd) {\n        _cmd = cmd; // ← Handled by mentor!\n    }\n    public void Dispatch() => _cmd.Execute();\n}`,
          });
        } else if (mentorPhase === "PRACTICE") {
          addLog({
            type: "success",
            subsystem: "IoC",
            operation: "REGISTER",
            message: "Контракт IRemoteCommand підключено до TVController!",
            targetNodeId: params.target ?? undefined,
            details: "Підтвердіть реєстрацію services.AddTransient<IRemoteCommand, PowerCommand>() на панелі ментора нижче.",
            codeContext: "services.AddTransient<IRemoteCommand, PowerCommand>();\nservices.AddSingleton<TVController>();",
          });
        } else {
          addLog({
            type: "success",
            subsystem: "IoC",
            operation: "RESOLVE",
            message: `${tgtNode}.${tgtPort} -> injected ${srcNode} (0x7F2A)`,
            targetNodeId: params.target ?? undefined,
            details: "Contract IRemoteCommand satisfied by concrete implementation",
            codeContext: `// Constructor Injection:\npublic class TVController {\n    private readonly IRemoteCommand _cmd;\n    public TVController(IRemoteCommand cmd) {\n        _cmd = cmd;\n    }\n    public void Dispatch() => _cmd.Execute();\n}`,
          });
        }
      } else {
        addLog({
          type: "success",
          subsystem: "BUS",
          operation: "BIND",
          message: `${srcNode}.${srcPort} -> ${tgtNode}.${tgtPort}`,
          targetNodeId: params.target ?? undefined,
          details: "Signal channel established",
        });
      }
    },
    [nodes, handleDeleteEdge, setEdges, addLog, mentorPhase, setMentorPhase, diMode]
  );

  // ── Hot Swap: Toggle between PowerCommand & VolumeUpCommand ──
  const handleHotSwap = useCallback(() => {
    // If currently volume is wired, swap to power; otherwise swap to volume
    const targetSource = isVolumeWired ? "node-class-power-command" : "node-class-volume-up-command";
    const commandName = isVolumeWired ? "PowerCommand" : "VolumeUpCommand";
    const addr = isVolumeWired ? "0x7F2A" : "0x9B1C";

    // Ensure target node is on canvas
    if (isVolumeWired) {
      addNodeByFileId("class-power-command", { x: 60, y: 60 });
    } else {
      addNodeByFileId("class-volume-up-command", { x: 60, y: 300 });
    }
    addNodeByFileId("class-tv-controller", { x: 450, y: 110 });

    const newEdge: Edge<ArchitectureEdgeData> = {
      id: `ae-hotswap-${targetSource}`,
      source: targetSource,
      sourceHandle: "out-execute",
      target: "node-class-tv-controller",
      targetHandle: "in-command-handler",
      type: "architectureEdge",
      data: {
        isValidPowerWire: true,
        commandName,
        diMode,
        onDelete: handleDeleteEdge,
      },
    };

    setEdges((eds) => {
      const filtered = eds.filter(
        (e) =>
          !(e.target.includes("tv-controller") && e.targetHandle === "in-command-handler")
      );
      return [...filtered, newEdge];
    });

    audioFx.playRelayClick();
    setIsHotSwapInsightOpen(true);

    addLog({
      type: "success",
      subsystem: "IoC",
      operation: "HOT_SWAP",
      message: `HOT SWAP ➔ Injected ${commandName} (${addr}) into TVController`,
      targetNodeId: "node-class-tv-controller",
      details: "Поліморфізм: TVController.cs не змінився! Змінено лише прив'язку DI-контейнера.",
      codeContext: `// IoC Container configuration update:\nservices.AddTransient<IRemoteCommand, ${commandName}>();\n// TVController._cmd.Execute() тепер виконує ${commandName}!`,
    });
  }, [isVolumeWired, addNodeByFileId, handleDeleteEdge, setEdges, diMode, addLog]);

  // ── Auto-Wire ────────────────────────────────
  const handleAutoWire = useCallback(() => {
    addNodeByFileId("class-power-command", { x: 60, y: 60 });
    addNodeByFileId("class-tv-controller", { x: 480, y: 120 });

    const autoEdge: Edge<ArchitectureEdgeData> = {
      id: "ae-auto-power",
      source: "node-class-power-command",
      sourceHandle: "out-execute",
      target: "node-class-tv-controller",
      targetHandle: "in-command-handler",
      type: "architectureEdge",
      data: { isValidPowerWire: true, commandName: "PowerCommand", diMode, onDelete: handleDeleteEdge },
    };

    setEdges((eds) => {
      const filtered = eds.filter(
        (e) =>
          !(e.target.includes("tv-controller") &&
            e.targetHandle === "in-command-handler")
      );
      return [...filtered, autoEdge];
    });

    addLog({
      type: "success",
      subsystem: "IoC",
      operation: "REGISTER",
      message: "Transient<IRemoteCommand, PowerCommand> -> TVController.ctor (0x7F2A)",
      targetNodeId: "node-class-tv-controller",
      details: "Auto-Wire executed: Constructor injection binding verified",
      codeContext: "services.AddTransient<IRemoteCommand, PowerCommand>();",
    });
  }, [addNodeByFileId, handleDeleteEdge, setEdges, addLog, diMode]);

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
        subsystem: "GRAPH",
        operation: "RESET",
        message: "Canvas state restored to default",
        details: "Awaiting dependency binding: IRemoteCommand -> TVController",
      }),
      60
    );
  }, [fitView, setEdges, setNodes, setArchNodes, setArchEdges, clearLogs, addLog]);

  // ── handle focus node from terminal ─────────
  const handleFocusNode = useCallback(
    (nodeId: string) => {
      const rfNode = getNode(nodeId);
      if (rfNode) {
        const cx = rfNode.position.x + (rfNode.width ?? 276) / 2;
        const cy = rfNode.position.y + (rfNode.measured?.height ?? 200) / 2;
        setCenter(cx, cy, { zoom: 1.15, duration: 400 });
      }
      flashNode(nodeId);
    },
    [getNode, setCenter, flashNode]
  );

  // ── Live Call-Flow Tracing ──────────────────
  const [isTracing, setIsTracing] = useState(false);
  const traceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      traceTimers.current.forEach((t) => clearTimeout(t));
      traceTimers.current = [];
    };
  }, []);

  const triggerCallFlowTrace = useCallback(() => {
    if (isTracing) return;

    if (!isAnyCommandWired) {
      audioFx.playErrorBuzz();
      // Trigger Red Memory Crash Shake on TVController
      setNodes((nds) =>
        nds.map((n) =>
          n.id === "node-class-tv-controller"
            ? { ...n, data: { ...n.data, isMemoryCrashing: true } }
            : n
        )
      );
      setTimeout(() => {
        setNodes((nds) =>
          nds.map((n) =>
            n.id === "node-class-tv-controller"
              ? { ...n, data: { ...n.data, isMemoryCrashing: false } }
              : n
          )
        );
      }, 1400);

      addLog({
        type: "error",
        subsystem: "FAULT",
        operation: "NULL_REF",
        message: "NullReferenceException: TVController._cmd is null ⚠️",
        targetNodeId: "node-class-tv-controller",
        details: "Object reference not set to an instance of an object at TVController.Dispatch()",
        codeContext: "// Runtime Crash (NullReferenceException):\n// TVController._cmd == null!\n// Dependency injection contract is unfulfilled.\n// Підключіть PowerCommand або VolumeUpCommand до TVController.ctor!",
      });
      return;
    }

    const isVol = isVolumeWired;
    const targetCmdNodeId = isVol ? "node-class-volume-up-command" : "node-class-power-command";
    const cmdName = isVol ? "VolumeUpCommand" : "PowerCommand";
    const cmdAddr = isVol ? "0x9B1C" : "0x7F2A";

    setIsTracing(true);
    setCurrentTraceStep(1);
    traceTimers.current.forEach((t) => clearTimeout(t));
    traceTimers.current = [];

    // Stage 1 (t = 0ms): Remote dispatch -> TVController
    addLog({
      type: "info",
      subsystem: "BUS",
      operation: "DISPATCH",
      message: `Remote -> TVController.Dispatch() [Target: ${cmdName}]`,
      targetNodeId: "node-class-tv-controller",
      details: "IR signal decoded by microcontroller bus (Channel 0x01)",
    });
    audioFx.playRemoteBeep();

    const tvNode = getNode("node-class-tv-controller");
    if (tvNode) {
      setCenter(
        tvNode.position.x + (tvNode.width ?? 290) / 2,
        tvNode.position.y + (tvNode.measured?.height ?? 200) / 2,
        { zoom: 1.1, duration: 350 }
      );
    }

    setNodes((nds) =>
      nds.map((n) =>
        n.id === "node-class-tv-controller"
          ? { ...n, data: { ...n.data, isPulsing: true } }
          : n
      )
    );

    // Stage 2 (t = 450ms): Signal travels along DI edge
    const t1 = setTimeout(() => {
      setCurrentTraceStep(2);
      setEdges((eds) =>
        eds.map((e) =>
          (e.source.includes("power-command") || e.source.includes("volume")) &&
          e.target.includes("tv-controller")
            ? { ...e, data: { ...e.data, isPulsing: true, pulseLabel: "IRemoteCommand.Execute()" } }
            : e
        )
      );
      addLog({
        type: "info",
        subsystem: "IoC",
        operation: "RESOLVE",
        message: `TVController.ctor -> resolved ${cmdName} (${cmdAddr})`,
        targetNodeId: targetCmdNodeId,
        details: "Transient resolution via ServiceProvider container",
      });
    }, 450);
    traceTimers.current.push(t1);

    // Stage 3 (t = 950ms): VTable resolution on active command node
    const t2 = setTimeout(() => {
      setCurrentTraceStep(3);
      const cmdNode = getNode(targetCmdNodeId);
      if (cmdNode) {
        setCenter(
          cmdNode.position.x + (cmdNode.width ?? 290) / 2,
          cmdNode.position.y + (cmdNode.measured?.height ?? 200) / 2,
          { zoom: 1.1, duration: 350 }
        );
      }
      setNodes((nds) =>
        nds.map((n) =>
          n.id === targetCmdNodeId
            ? { ...n, data: { ...n.data, isPulsing: true, isVTableTarget: true } }
            : n
        )
      );
      addLog({
        type: "success",
        subsystem: "VTABLE",
        operation: "VTABLE_RESOLVED",
        message: `IRemoteCommand.Execute() -> ${cmdName}.Execute()`,
        targetNodeId: targetCmdNodeId,
        details: "Virtual method table offset 0x00 resolved concrete implementation",
        codeContext: `// Dynamic Polymorphism:\n// vtable[0] -> ${cmdName}.Execute()\n// Код TVController залишився абсолютно незмінним!`,
      });
    }, 950);
    traceTimers.current.push(t2);

    // Stage 4 (t = 1500ms): Hardware relay or DSP volume execution
    const t3 = setTimeout(() => {
      setCurrentTraceStep(4);
      if (isVol) {
        const store = useWorkbenchStore.getState();
        if (!store.power) {
          store.togglePower();
        }
        store.changeVolume(10);
        audioFx.playRemoteBeep();
        const updatedVol = useWorkbenchStore.getState().volume;
        addLog({
          type: "success",
          subsystem: "HARDWARE",
          operation: "VOLUME_INC",
          message: `DSP Audio Amplifier -> Gain +10% (Рівень: ${updatedVol}%)`,
          details: "Гучність телевізора збільшено! TVController.cs виконав новий алгоритм без переписування коду.",
        });
      } else {
        const currentPower = useWorkbenchStore.getState().power;
        useWorkbenchStore.getState().togglePower();
        const nextPower = !currentPower;
        addLog({
          type: "success",
          subsystem: "HARDWARE",
          operation: nextPower ? "RELAY_ON" : "STANDBY",
          message: nextPower
            ? "CRT Power Rail -> 115V OK (State: OPERATIONAL)"
            : "CRT Power Rail -> 0V (State: STANDBY)",
          details: nextPower
            ? "Main power relay energized, cathode filament heated"
            : "Main power relay disengaged, high voltage discharged",
        });
      }
    }, 1500);
    traceTimers.current.push(t3);

    // Stage 5 (t = 2400ms): Clear pulse highlights & reset tracing state
    const t4 = setTimeout(() => {
      setCurrentTraceStep(0);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isPulsing: false, isVTableTarget: false },
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          data: { ...e.data, isPulsing: false, pulseLabel: undefined },
        }))
      );
      setIsTracing(false);
      if (isVol) {
        setIsHotSwapInsightOpen(true);
      }
    }, 2400);
    traceTimers.current.push(t4);
  }, [isTracing, isAnyCommandWired, isVolumeWired, addLog, getNode, setCenter, setNodes, setEdges]);

  // ── Fit view on mount ────────────────────────
  useEffect(() => {
    const t2 = setTimeout(() => fitView({ padding: 0.25, duration: 400 }), 120);
    return () => clearTimeout(t2);
  }, [fitView]);

  // ── Initial log on mount ─────────────────────
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
        className={`px-4 py-2 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none shrink-0 transition-colors duration-200 ${
          isAnyCommandWired
            ? "bg-[#1A1E1C] border-emerald-900/40"
            : "bg-[#1B1C20] border-white/[0.06]"
        }`}
      >
        {/* Left: Mission status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isAnyCommandWired
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse"
            }`}
          >
            {isAnyCommandWired ? <CheckCircle2 size={15} /> : <Cable size={15} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[12px] text-gray-200 truncate">
                TVController ➔ IRemoteCommand
              </span>
              <span
                className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                  isAnyCommandWired
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                }`}
              >
                {isAnyCommandWired
                  ? isVolumeWired
                    ? "VolumeUpCommand (0x9B1C)"
                    : "PowerCommand (0x7F2A)"
                  : t("architecture.waitingConnection", "Очікує з'єднання")}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Mode Toggle */}
          <div className="flex items-center bg-[#151619] p-0.5 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => handleToggleDiMode("WITH_DI")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                diMode === "WITH_DI"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("architecture.withDi", "З DI")}
            </button>
            <button
              onClick={() => handleToggleDiMode("WITHOUT_DI")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                diMode === "WITHOUT_DI"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t("architecture.withoutDi", "Без DI")}
            </button>
          </div>

          {/* Hot Swap Quick-Action Button */}
          <button
            onClick={handleHotSwap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 text-[11px] font-mono font-semibold transition-all cursor-pointer active:scale-95"
            title={t("architecture.hotSwapBtn", "Швидка заміна (Hot Swap)")}
          >
            <RotateCcw size={12} className="text-purple-400" />
            <span>{isVolumeWired ? "Hot Swap: Power" : "Hot Swap: Volume"}</span>
          </button>

          {/* Trace Button */}
          <button
            onClick={triggerCallFlowTrace}
            disabled={isTracing}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-mono font-semibold transition-all cursor-pointer active:scale-95 ${
              isTracing
                ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse cursor-wait"
                : isAnyCommandWired
                ? "bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-200"
                : "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-300"
            }`}
          >
            <Zap
              size={12}
              className={
                isTracing
                  ? "animate-spin text-amber-400"
                  : isAnyCommandWired
                  ? "text-amber-400"
                  : "text-red-400"
              }
            />
            <span>{isTracing ? t("architecture.tracing", "Трасування...") : t("architecture.testCall", "⚡ Тест виклику")}</span>
          </button>

          {/* Auto-wire */}
          <button
            onClick={handleAutoWire}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-300 text-[11px] font-mono transition-all cursor-pointer active:scale-95"
            title={t("architecture.autoWire")}
          >
            <Sparkles size={12} className="text-blue-400" />
            <span>{t("architecture.autoWire")}</span>
          </button>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
            title={t("architecture.reset")}
          >
            <RotateCcw size={12} />
          </button>

          {/* Fit View */}
          <button
            onClick={() => fitView({ padding: 0.2, duration: 400 })}
            title={t("architecture.centerView")}
            className="p-1.5 rounded-lg bg-[#27282D] hover:bg-[#32333A] border border-white/[0.06] text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>

      {/* Educational Hint for Tight Coupling vs Dependency Injection */}
      {diMode === "WITHOUT_DI" && (
        <div className="px-4 py-1.5 bg-[#2A1417] border-b border-red-900/50 flex items-center justify-between text-[11px] font-sans text-red-200 select-none shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2 truncate">
            <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono font-bold shrink-0">
              {t("architecture.antiPatternBadge", "АНТИПАТЕРН")}
            </span>
            <span className="truncate">
              <strong>{t("architecture.tightCouplingHint", "Жорстка зв'язаність: new PowerCommand() вшито в TVController. Заміна деталі неможлива без редагування коду.")}</strong>
            </span>
          </div>
          <button
            onClick={() => handleToggleDiMode("WITH_DI")}
            className="text-red-300 hover:text-white underline font-mono text-[10px] shrink-0 ml-3 cursor-pointer"
          >
            {t("architecture.enableDi", "Увімкнути DI →")}
          </button>
        </div>
      )}

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
            {/* Live Call-Flow Step Trace HUD */}
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
                    {t("architecture.stepRemote", "1. IR Пульт")}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 2 ? "text-amber-300 font-bold" : currentTraceStep > 2 ? "text-emerald-400" : "text-gray-500"}>
                    2. TVController
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 3 ? "text-amber-300 font-bold" : currentTraceStep > 3 ? "text-emerald-400" : "text-gray-500"}>
                    3. IRemoteCommand
                  </span>
                  <span className="text-gray-600">→</span>
                  <span className={currentTraceStep === 4 ? "text-amber-300 font-bold" : "text-gray-500"}>
                    {isVolumeWired ? t("architecture.stepVolume", "4. Volume +10%") : t("architecture.stepPower", "4. Power Relay")}
                  </span>
                </div>
              </div>
            )}

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
              onFocusNode={handleFocusNode}
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

      {/* ── Hot Swap Polymorphic Insight Modal ── */}
      {isHotSwapInsightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
          <div className="bg-[#18191D] border border-purple-500/60 rounded-2xl max-w-lg w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(168,85,247,0.25)] relative text-white">
            <button
              onClick={() => setIsHotSwapInsightOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                    {t("architecture.polymorphismInAction", "Поліморфізм у дії")}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-100 mt-0.5">
                  {t("architecture.hotSwapTitle", "💡 Фокус Поліморфізму (The Hot Swap)")}
                </h3>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs text-gray-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
                <p className="font-bold text-purple-100 text-sm mb-1">
                  ⚡ {t("architecture.hotSwapInsight", "У файлі TVController.cs НЕ ЗМІНИЛОСЯ ЖОДНОГО СИМВОЛУ!")}
                </p>
                <p className="text-[11.5px] text-purple-200/90">
                  {t("architecture.hotSwapSubtitle", "Підміна реалізації через єдиний контракт")}: {t("architecture.hotSwapDesc", "ми замінили деталь на нову (VolumeUpCommand замість PowerCommand), а телевізор продовжує працювати без перекомпіляції.")}
                </p>
              </div>

              <div className="rounded-lg bg-black/60 border border-white/10 p-3 font-mono text-[11px] text-gray-300">
                <div className="text-gray-500 text-[10px] pb-1 border-b border-white/10 mb-2 flex justify-between">
                  <span>{t("architecture.codeUnchanged", "TVController.cs — Код залишився незмінним:")}</span>
                  <span className="text-emerald-400">{t("architecture.zeroChanges", "0 змін")}</span>
                </div>
                <pre className="text-emerald-300">
{`public class TVController {
    private readonly IRemoteCommand _cmd;

    // Конструктор приймає будь-яку деталь цього типу:
    public TVController(IRemoteCommand cmd) => _cmd = cmd;

    public void Dispatch() {
        _cmd.Execute(); // ➔ Виклик поліморфного методу!
    }
}`}
                </pre>
              </div>

              <p className="text-[11.5px] text-gray-400">
                {t("architecture.hotSwapSummary", "Тепер при натисканні кнопки на пульті телевізор змінює гучність замість вимикання. Ось чому інтерфейси та Dependency Injection дають свободу: ви змінюєте поведінку системи на льоту, не чіпаючи класи, які її використовують.")}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setIsHotSwapInsightOpen(false);
                  triggerCallFlowTrace();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-all active:scale-95"
              >
                <Zap size={13} className="fill-black" />
                {t("architecture.testCall", "⚡ Трасувати виклик")}
              </button>
              <button
                onClick={() => setIsHotSwapInsightOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 font-mono text-xs cursor-pointer transition-colors"
              >
                {t("architecture.gotIt", "Зрозуміло!")}
              </button>
            </div>
          </div>
        </div>
      )}
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
