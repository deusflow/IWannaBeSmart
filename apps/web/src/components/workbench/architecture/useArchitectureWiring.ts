import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  type IsValidConnection,
  type NodeChange,
  type NodeRemoveChange,
} from "@xyflow/react";
import { audioFx } from "../../../utils/audioFx";
import { toast } from "../../../store/toastStore";
import { PROJECT_FILES } from "./projectData";
import { createInitialNodes } from "./initialGraph";
import {
  validatePortConnection,
  getPortName,
  getNodeName,
} from "./connectionRules";
import type {
  ArchitectureNodeData,
  InjectedDependencyInfo,
  TerminalLogEntry,
  PortType,
} from "./types";
import type { ArchitectureEdgeData } from "./ArchitectureEdge";
import type { MentorPhase } from "../../../store/types";

interface UseArchitectureWiringParams {
  storedNodes: Node<ArchitectureNodeData>[];
  storedEdges: Edge<ArchitectureEdgeData>[];
  setArchNodes: (nodes: Node<ArchitectureNodeData>[]) => void;
  setArchEdges: (edges: Edge<ArchitectureEdgeData>[]) => void;
  diMode: "WITH_DI" | "WITHOUT_DI";
  mentorPhase: MentorPhase;
  setMentorPhase: (phase: MentorPhase) => void;
  setArchitecturePowerWired: (wired: boolean) => void;
  screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number };
  fitView: (options?: { padding?: number; duration?: number }) => void;
  setCenter: (x: number, y: number, options?: { zoom?: number; duration?: number }) => void;
  getNode: (id: string) => Node | undefined;
  addLog: (entry: Omit<TerminalLogEntry, "id" | "timestamp">) => void;
  clearLogs: () => void;
  onOpenHotSwapInsight: () => void;
}

export function useArchitectureWiring({
  storedNodes,
  storedEdges,
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
  onOpenHotSwapInsight,
}: UseArchitectureWiringParams) {
  const initialNodes = storedNodes.length > 0 ? storedNodes : createInitialNodes();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<ArchitectureEdgeData>>(storedEdges);
  const { t } = useTranslation();
  const [pendingSourcePort, setPendingSourcePort] = useState<{
    nodeId: string;
    portId: string;
    portType: PortType;
    name: string;
  } | null>(null);
  const lastMismatchAlertTime = useRef<number>(0);
  const mistakeCountRef = useRef<number>(0);

  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // If edges were cleared in store for practice, sync local edges
  useEffect(() => {
    if (mentorPhase === "PRACTICE" && storedEdges.length === 0 && edges.length > 0) {
      setEdges([]);
      mistakeCountRef.current = 0;
    }
  }, [mentorPhase, storedEdges.length, edges.length, setEdges]);

  // Command wire states
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

  // Persist graph to store
  useEffect(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      setArchNodes(nodes);
      setArchEdges(edges);
    }, 50);
  }, [nodes, edges, setArchNodes, setArchEdges]);

  useEffect(() => {
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, []);

  const activeFileIds = useMemo(
    () => new Set(nodes.map((n) => n.data.fileId)),
    [nodes]
  );

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

  // Keyboard Delete / Backspace
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

  const flashNode = useCallback(
    (nodeId: string) => {
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

  const formatMismatch = useCallback(
    (
      srcType: string | null,
      tgtType: string | null,
      srcPort: string,
      tgtPort: string
    ) => {
      if (srcType === "IRemoteCommand" && tgtType === "ITVReceiver") {
        return t(
          "architecture.mismatchCmdToReceiver",
          "Цей дріт передає команду (IRemoteCommand), а гніздо очікує отримувача телевізора (ITVReceiver)."
        );
      }
      if (srcType === "ITVReceiver" && tgtType === "IRemoteCommand") {
        return t(
          "architecture.mismatchReceiverToCmd",
          "Цей порт надає керування телевізором (ITVReceiver), а гніздо очікує команду пульта (IRemoteCommand)."
        );
      }
      return t(
        "architecture.mismatchGeneric",
        "Цей порт передає {{srcType}}, а гніздо очікує {{tgtType}}. З'єднайте однакові типи сигналів!",
        { srcType: srcType || srcPort, tgtType: tgtType || tgtPort }
      );
    },
    [t]
  );

  const addNodeByFileId = useCallback(
    (fileId: string, position?: { x: number; y: number }) => {
      const file = PROJECT_FILES.find((f) => f.id === fileId);
      if (!file) return;

      const nodeId = `node-${file.id}`;
      const existing = nodes.find((n) => n.id === nodeId);

      if (existing) {
        const rfNode = getNode(nodeId);
        if (rfNode) {
          const cx = rfNode.position.x + (rfNode.width ?? 340) / 2;
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

      const targetPos = position || {
        x: 80 + (nodes.length % 4) * 360,
        y: 80 + Math.floor(nodes.length / 4) * 220,
      };

      const newNode: Node<ArchitectureNodeData> = {
        id: nodeId,
        type: "architectureNode",
        position: targetPos,
        width: 340,
        data: {
          fileId: file.id, name: file.name, path: file.path,
          entityType: file.entityType, role: file.role,
          inputs: file.inputs, outputs: file.outputs,
          implementsInterface: file.implementsInterface,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      audioFx.playRelayClick();
      toast.success(
        t("architecture.nodeAddedTitle", "Модуль додано"),
        t("architecture.nodeAddedDesc", {
          name: file.name,
          defaultValue: `${file.name} розміщено на полотні`,
        })
      );
      setTimeout(() => {
        setCenter(targetPos.x + 170, targetPos.y + 110, { zoom: 1, duration: 420 });
        flashNode(nodeId);
      }, 60);

      addLog({
        type: "info",
        subsystem: "IoC",
        operation: "DISCOVER",
        message: `Component registered: ${file.name}`,
        targetNodeId: nodeId,
        details: `${file.role} | Path: ${file.path}`,
      });
    },
    [nodes, setNodes, getNode, setCenter, flashNode, addLog, t]
  );

  // Drag & Drop
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

  // Connection validation & Connect
  const isValidConnection: IsValidConnection = useCallback(
    (connection: Edge | Connection) => {
      const res = validatePortConnection(connection, nodes);
      if (!res.isValid && res.srcType && res.tgtType) {
        mistakeCountRef.current += 1;
        addLog({
          type: "error",
          subsystem: "FAULT",
          operation: "TYPE_MISMATCH",
          message: `Binding rejected: ${res.srcNodeName}.${res.srcPortName} -> ${res.tgtNodeName}.${res.tgtPortName}`,
          targetNodeId: connection.target ?? undefined,
          details: `Cannot bind [${res.srcType}] to [${res.tgtType}]`,
          codeContext: `// ✗ Type Mismatch:\n// ${res.srcNodeName}.${res.srcPortName} [${res.srcType}]\n//   → ${res.tgtNodeName}.${res.tgtPortName} [${res.tgtType}]\n// Expected port type: «${res.tgtType}»`,
        });

        const now = Date.now();
        if (now - lastMismatchAlertTime.current > 1500) {
          lastMismatchAlertTime.current = now;
          audioFx.playRelayClick();
          toast.warning(
            t("architecture.typeMismatchTitle", "Несумісні порти"),
            formatMismatch(res.srcType, res.tgtType, res.srcPortName, res.tgtPortName)
          );
        }
      }

      return res.isValid;
    },
    [nodes, addLog, formatMismatch, t]
  );

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

      const triggerSuccessAudioAndNudge = () => {
        if (mistakeCountRef.current === 0) {
          audioFx.playSuccessFanfare();
          toast.success(
            t("architecture.flawlessAssemblyTitle", "Ідеальна збірка з першого разу"),
            t("architecture.flawlessAssemblyDesc", "Контур замкнено без жодної помилки. Бездоганне інженерне рішення!")
          );
        } else {
          audioFx.playRelayClick();
        }
      };

      if (isVolumeWire) {
        triggerSuccessAudioAndNudge();
        onOpenHotSwapInsight();
        addLog({
          type: "success",
          subsystem: "IoC",
          operation: "HOT_SWAP",
          message: `${tgtNode}.${tgtPort} -> hot-swapped with ${srcNode} (0x9B1C)`,
          targetNodeId: params.target ?? undefined,
          details: t("architecture.hotSwapLogDetail", "Поліморфізм у дії: TVController.cs не змінено жодним рядком!"),
          codeContext: `// Hot Swap Polymorphism:\nservices.AddTransient<IRemoteCommand, VolumeUpCommand>();\n// TVController._cmd.Execute() тепер змінює гучність!`,
        });
      } else if (isPowerWire) {
        triggerSuccessAudioAndNudge();
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
            message: t("architecture.practiceSuccessLog", "Контракт IRemoteCommand підключено до TVController!"),
            targetNodeId: params.target ?? undefined,
            details: t("architecture.practiceConfirmLog", "Підтвердіть реєстрацію services.AddTransient<IRemoteCommand, PowerCommand>() на панелі ментора нижче."),
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
    [nodes, handleDeleteEdge, setEdges, addLog, mentorPhase, setMentorPhase, diMode, onOpenHotSwapInsight, t]
  );

  const cancelPendingConnection = useCallback(() => {
    setPendingSourcePort(null);
  }, []);

  const handlePortClick = useCallback(
    (nodeId: string, portId: string, direction: "input" | "output") => {
      if (direction === "output") {
        const node = nodes.find((n) => n.id === nodeId);
        const port = node?.data.outputs.find((p) => p.id === portId);
        if (!port) return;

        if (pendingSourcePort?.nodeId === nodeId && pendingSourcePort?.portId === portId) {
          setPendingSourcePort(null);
          toast.info(t("architecture.connectCancelled", "Вибір порту скасовано"));
          return;
        }

        setPendingSourcePort({
          nodeId,
          portId,
          portType: port.portType,
          name: port.name.replace(/^[A-Za-z0-9_]+\./, ""),
        });
        audioFx.playRelayClick();
        toast.info(
          t("architecture.plugSelected", "Вихід вибрано"),
          t(
            "architecture.clickTargetSocket",
            "Тепер клікніть на сумісний вхід (гніздо), щоб з'єднати їх проводом."
          )
        );
        return;
      }

      // direction === "input"
      if (!pendingSourcePort) {
        audioFx.playRelayClick();
        toast.info(
          t("architecture.selectSourceFirstTitle", "Спочатку виберіть вихід"),
          t(
            "architecture.selectSourceFirstDesc",
            "Клікніть на порт виходу (праворуч на блоці команди), щоб протягнути дріт до цього гнізда."
          )
        );
        return;
      }

      // User clicked target input while pendingSourcePort is active
      const connection: Connection = {
        source: pendingSourcePort.nodeId,
        sourceHandle: pendingSourcePort.portId,
        target: nodeId,
        targetHandle: portId,
      };

      const res = validatePortConnection(connection, nodes);
      if (res.isValid) {
        onConnect(connection);
        setPendingSourcePort(null);
        audioFx.playRelayClick();
        toast.success(
          t("architecture.wireConnectedTitle", "З'єднання встановлено!"),
          t("architecture.wireConnectedDesc", {
            src: pendingSourcePort.name,
            tgt: res.tgtPortName,
            defaultValue: `${pendingSourcePort.name} успішно підключено до ${res.tgtPortName}`,
          })
        );
      } else {
        audioFx.playRelayClick();
        toast.warning(
          t("architecture.typeMismatchTitle", "Несумісні порти"),
          formatMismatch(pendingSourcePort.portType, res.tgtType, pendingSourcePort.name, res.tgtPortName)
        );
        addLog({
          type: "error",
          subsystem: "FAULT",
          operation: "TYPE_MISMATCH",
          message: `Binding rejected: ${pendingSourcePort.name} -> ${res.tgtNodeName}.${res.tgtPortName}`,
          targetNodeId: nodeId,
          details: `Cannot bind [${pendingSourcePort.portType}] to [${res.tgtType}]`,
          codeContext: `// ✗ Type Mismatch:\n// Source: ${pendingSourcePort.name} [${pendingSourcePort.portType}]\n// Target: ${res.tgtNodeName}.${res.tgtPortName} [${res.tgtType}]\n// Expected port type: «${res.tgtType}»`,
        });
      }
    },
    [nodes, pendingSourcePort, onConnect, formatMismatch, addLog, t]
  );

  const handleHotSwap = useCallback(() => {
    const targetSource = isVolumeWired ? "node-class-power-command" : "node-class-volume-up-command";
    const commandName = isVolumeWired ? "PowerCommand" : "VolumeUpCommand";
    const addr = isVolumeWired ? "0x7F2A" : "0x9B1C";

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
    onOpenHotSwapInsight();

    addLog({
      type: "success",
      subsystem: "IoC",
      operation: "HOT_SWAP",
      message: `HOT SWAP ➔ Injected ${commandName} (${addr}) into TVController`,
      targetNodeId: "node-class-tv-controller",
      details: t("architecture.hotSwapManualLogDetail", "Поліморфізм: TVController.cs не змінився! Змінено лише прив'язку DI-контейнера."),
      codeContext: `// IoC Container configuration update:\nservices.AddTransient<IRemoteCommand, ${commandName}>();\n// TVController._cmd.Execute() тепер виконує ${commandName}!`,
    });
  }, [isVolumeWired, addNodeByFileId, handleDeleteEdge, setEdges, diMode, addLog, onOpenHotSwapInsight]);

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

  const handleReset = useCallback(() => {
    flashTimers.current.forEach((t) => clearTimeout(t));
    flashTimers.current.clear();
    mistakeCountRef.current = 0;
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

  useEffect(() => {
    const timers = flashTimers.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    activeFileIds,
    isPowerWired,
    isVolumeWired,
    isAnyCommandWired,
    handleNodesChange,
    onEdgesChange,
    handleDeleteEdge,
    flashNode,
    addNodeByFileId,
    onDragOver,
    onDrop,
    isValidConnection,
    onConnect,
    handleHotSwap,
    handleAutoWire,
    handleReset,
    handleFocusNode,
    pendingSourcePort,
    handlePortClick,
    cancelPendingConnection,
  };
}
