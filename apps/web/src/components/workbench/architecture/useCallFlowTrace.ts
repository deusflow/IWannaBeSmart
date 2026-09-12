import { useState, useRef, useEffect, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { audioFx } from "../../../utils/audioFx";
import type { ArchitectureNodeData, TerminalLogEntry, TraceGraph } from "./types";
import type { ArchitectureEdgeData } from "./ArchitectureEdge";

interface UseCallFlowTraceParams {
  canvasMode: "TRACE" | "WIRING";
  evaluatedTraceGraph: TraceGraph;
  selectedTraceEntityId: string | null;
  isAnyCommandWired: boolean;
  isVolumeWired: boolean;
  addLog: (entry: Omit<TerminalLogEntry, "id" | "timestamp">) => void;
  getNode: (id: string) => Node | undefined;
  setCenter: (x: number, y: number, options?: { zoom?: number; duration?: number }) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node<ArchitectureNodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<ArchitectureEdgeData>[]>>;
  onHotSwapInsight?: () => void;
}

export function useCallFlowTrace({
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
  onHotSwapInsight,
}: UseCallFlowTraceParams) {
  const [isTracing, setIsTracing] = useState(false);
  const [currentTraceStep, setCurrentTraceStep] = useState<number>(0);
  const traceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      traceTimers.current.forEach((t) => clearTimeout(t));
      traceTimers.current = [];
    };
  }, []);

  const triggerCallFlowTrace = useCallback(() => {
    if (isTracing) return;

    if (canvasMode === "TRACE") {
      if (evaluatedTraceGraph.isBroken) {
        audioFx.playErrorBuzz();
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
        return;
      }

      setIsTracing(true);
      setCurrentTraceStep(1);
      audioFx.playRemoteBeep();
      addLog({
        type: "info",
        subsystem: "IoC",
        message: `[TRACE 1/5] Declaration contract validated: ${selectedTraceEntityId}`,
      });

      const t1 = setTimeout(() => {
        setCurrentTraceStep(2);
        addLog({
          type: "info",
          subsystem: "IoC",
          message: "[TRACE 2/5] Concrete implementation resolved: PowerCommand",
        });
      }, 350);

      const t2 = setTimeout(() => {
        setCurrentTraceStep(3);
        addLog({
          type: "info",
          subsystem: "IoC",
          message: "[TRACE 3/5] DI IoC Container injected: services.AddSingleton()",
        });
      }, 700);

      const t3 = setTimeout(() => {
        setCurrentTraceStep(4);
        addLog({
          type: "info",
          subsystem: "BUS",
          message: "[TRACE 4/5] TVController constructor initialized with dependency",
        });
      }, 1050);

      const t4 = setTimeout(() => {
        setCurrentTraceStep(5);
        const store = useWorkbenchStore.getState();
        store.togglePower();
        addLog({
          type: "success",
          subsystem: "HARDWARE",
          message: "[TRACE 5/5] TV CRT Anode energized: 12.0V operational",
        });
        setIsTracing(false);
        setTimeout(() => setCurrentTraceStep(0), 1200);
      }, 1400);

      traceTimers.current.push(t1, t2, t3, t4);
      return;
    }

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
        codeContext:
          "// Runtime Crash (NullReferenceException):\n// TVController._cmd == null!\n// Dependency injection contract is unfulfilled.\n// Підключіть PowerCommand або VolumeUpCommand до TVController.ctor!",
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
        n.id === "node-class-tv-controller" ? { ...n, data: { ...n.data, isPulsing: true } } : n
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
          details:
            "Гучність телевізора збільшено! TVController.cs виконав новий алгоритм без переписування коду.",
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
      if (isVol && onHotSwapInsight) {
        onHotSwapInsight();
      }
    }, 2400);
    traceTimers.current.push(t4);
  }, [
    isTracing,
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
    onHotSwapInsight,
  ]);

  return {
    isTracing,
    currentTraceStep,
    triggerCallFlowTrace,
  };
}
