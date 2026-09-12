import { useState, useCallback, useMemo } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { ArchitectureNodeData, ActiveJourneyState, TerminalLogEntry } from "./types";
import type { ArchitectureEdgeData } from "./ArchitectureEdge";

interface UseInterfaceJourneyParams {
  nodes: Node<ArchitectureNodeData>[];
  edges: Edge<ArchitectureEdgeData>[];
  isVolumeWired: boolean;
  getNode: (id: string) => Node | undefined;
  addNodeByFileId: (fileId: string, position?: { x: number; y: number }) => void;
  fitView: (options?: { nodes?: { id: string }[]; padding?: number; duration?: number }) => void;
  setCenter: (x: number, y: number, options?: { zoom?: number; duration?: number }) => void;
  addLog: (entry: Omit<TerminalLogEntry, "id" | "timestamp">) => void;
  t: (key: string, defaultValue?: any) => string;
}

export function useInterfaceJourney({
  nodes,
  edges,
  isVolumeWired,
  getNode,
  addNodeByFileId,
  fitView,
  setCenter,
  addLog,
  t,
}: UseInterfaceJourneyParams) {
  const [activeJourney, setActiveJourney] = useState<ActiveJourneyState | null>(null);

  const handleFitAll = useCallback(() => {
    const isVol = activeJourney?.activeCommand === "VolumeUpCommand";
    const targetCmd = isVol ? "node-class-volume-up-command" : "node-class-power-command";
    fitView({
      nodes: [
        { id: "node-interface-remote-command" },
        { id: targetCmd },
        { id: "node-class-tv-controller" },
      ],
      padding: 0.22,
      duration: 450,
    });
  }, [activeJourney, fitView]);

  const handleInspectInterface = useCallback(
    (ifaceId: string) => {
      const initialCmd: "PowerCommand" | "VolumeUpCommand" = isVolumeWired
        ? "VolumeUpCommand"
        : "PowerCommand";
      setActiveJourney({
        type: "INTERFACE",
        interfaceId: ifaceId || "IRemoteCommand",
        activeStep: 1,
        activeCommand: initialCmd,
      });

      const ifaceNode = getNode("node-interface-remote-command");
      if (!ifaceNode) {
        addNodeByFileId("interface-remote-command", { x: 30, y: 150 });
      }

      setTimeout(() => {
        const targetCmd =
          initialCmd === "VolumeUpCommand"
            ? "node-class-volume-up-command"
            : "node-class-power-command";
        fitView({
          nodes: [
            { id: "node-interface-remote-command" },
            { id: targetCmd },
            { id: "node-class-tv-controller" },
          ],
          padding: 0.22,
          duration: 450,
        });
      }, 50);

      addLog({
        type: "info",
        subsystem: "VTABLE",
        operation: "INSPECT_INTERFACE",
        message: `⬡ Повний шлях контракту: ${ifaceId || "IRemoteCommand"}`,
        targetNodeId: "node-interface-remote-command",
        details:
          "Оголошення контракту -> Реалізація класом -> Впровадження в TVController -> Виклик",
        codeContext:
          "public interface IRemoteCommand {\n    void Execute(); // Загальний контракт для всіх кнопок\n}",
      });
    },
    [isVolumeWired, getNode, addNodeByFileId, fitView, addLog]
  );

  const handleInspectDi = useCallback(() => {
    const initialCmd: "PowerCommand" | "VolumeUpCommand" = isVolumeWired
      ? "VolumeUpCommand"
      : "PowerCommand";
    setActiveJourney({
      type: "DI",
      interfaceId: "IRemoteCommand",
      activeStep: 2,
      activeCommand: initialCmd,
    });

    const targetCmd =
      initialCmd === "VolumeUpCommand"
        ? "node-class-volume-up-command"
        : "node-class-power-command";
    setTimeout(() => {
      fitView({
        nodes: [{ id: targetCmd }, { id: "node-class-tv-controller" }],
        padding: 0.25,
        duration: 450,
      });
    }, 50);

    addLog({
      type: "info",
      subsystem: "IoC",
      operation: "INSPECT_DI",
      message: "⚡ Повний шлях Dependency Injection: зовні -> конструктор -> RAM -> Dispatch",
      targetNodeId: "node-class-tv-controller",
      details: "Створення деталі зовні та передача в TVController.ctor(IRemoteCommand cmd)",
      codeContext:
        "public TVController(IRemoteCommand cmd) {\n    _cmd = cmd; // Збереження переданого об'єкта в пам'ять\n}",
    });
  }, [isVolumeWired, fitView, addLog]);

  const handleChangeJourneyStep = useCallback(
    (step: number, targetNodeId: string) => {
      setActiveJourney((prev) => (prev ? { ...prev, activeStep: step } : null));

      const node = getNode(targetNodeId);
      if (!node && targetNodeId === "node-interface-remote-command") {
        addNodeByFileId("interface-remote-command", { x: 30, y: 150 });
        setTimeout(() => {
          const n = getNode("node-interface-remote-command");
          if (n) {
            setCenter(n.position.x + 145, n.position.y + 100, { zoom: 1.15, duration: 350 });
          }
        }, 60);
        return;
      }

      if (node) {
        setCenter(node.position.x + (node.width ?? 290) / 2, node.position.y + 100, {
          zoom: 1.15,
          duration: 350,
        });
      }
    },
    [getNode, addNodeByFileId, setCenter]
  );

  const handleChangeJourneyCommand = useCallback(
    (command: "PowerCommand" | "VolumeUpCommand") => {
      setActiveJourney((prev) => {
        if (!prev) return null;
        return { ...prev, activeCommand: command };
      });

      const targetId =
        command === "VolumeUpCommand"
          ? "node-class-volume-up-command"
          : "node-class-power-command";
      setTimeout(() => {
        fitView({
          nodes: [
            { id: "node-interface-remote-command" },
            { id: targetId },
            { id: "node-class-tv-controller" },
          ],
          padding: 0.22,
          duration: 450,
        });
      }, 50);

      addLog({
        type: "info",
        subsystem: "IoC",
        operation: "HOT_SWAP_SELECTION",
        message: `Поліморфне перемикання на ${command}`,
        targetNodeId: targetId,
        details: "Контракт IRemoteCommand та TVController не змінено! Змінено лише реалізацію.",
      });
    },
    [fitView, addLog]
  );

  const handleCloseJourney = useCallback(() => {
    setActiveJourney(null);
  }, []);

  const processedNodes = useMemo(() => {
    if (!activeJourney) {
      return nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isJourneyActive: false,
          isJourneyStepTarget: false,
          isJourneyDimmed: false,
          journeyBadge: undefined,
          onInspectInterface: handleInspectInterface,
          onInspectDi: handleInspectDi,
        },
      }));
    }

    const { type, activeStep, activeCommand } = activeJourney;
    const isVol = activeCommand === "VolumeUpCommand";
    const activeCmdNodeId = isVol ? "node-class-volume-up-command" : "node-class-power-command";

    let targetNodeId = "";
    if (type === "INTERFACE") {
      if (activeStep === 1) targetNodeId = "node-interface-remote-command";
      else if (activeStep === 2) targetNodeId = activeCmdNodeId;
      else if (activeStep === 3) targetNodeId = "node-class-tv-controller";
      else if (activeStep === 4) targetNodeId = "node-class-tv-controller";
    } else {
      if (activeStep === 1) targetNodeId = activeCmdNodeId;
      else if (activeStep === 2) targetNodeId = "node-class-tv-controller";
      else if (activeStep === 3) targetNodeId = "node-class-tv-controller";
      else if (activeStep === 4) targetNodeId = "node-class-tv-controller";
    }

    const participatingNodeIds = new Set([
      "node-interface-remote-command",
      "node-class-power-command",
      "node-class-volume-up-command",
      "node-class-tv-controller",
    ]);

    return nodes.map((n) => {
      const isTarget = n.id === targetNodeId;
      const isParticipating = participatingNodeIds.has(n.id);

      let badge: string | undefined = undefined;
      if (n.id === "node-interface-remote-command") {
        badge = t("journey.badgeStation1", "📍 1. ЗВІДКИ БЕРЕТЬСЯ (Контракт)");
      } else if (n.id === activeCmdNodeId) {
        badge = t("journey.badgeStation2", "📍 2. ХТО РЕАЛІЗУЄ (:IRemoteCommand)");
      } else if (n.id === "node-class-tv-controller") {
        badge = t("journey.badgeStation34", "📍 3. ВПРОВАДЖЕННЯ (DI) ➔ 4. ВИКОРИСТАННЯ");
      }

      return {
        ...n,
        data: {
          ...n.data,
          isJourneyActive: true,
          isJourneyStepTarget: isTarget,
          isJourneyDimmed: !isParticipating,
          journeyBadge: badge,
          onInspectInterface: handleInspectInterface,
          onInspectDi: handleInspectDi,
        },
      };
    });
  }, [nodes, activeJourney, handleInspectInterface, handleInspectDi, t]);

  const processedEdges = useMemo(() => {
    if (!activeJourney) {
      return edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          isJourneyActive: false,
          onInspectDi: handleInspectDi,
        },
      }));
    }

    const { activeCommand } = activeJourney;
    const isVol = activeCommand === "VolumeUpCommand";
    const activeCmdNodeId = isVol ? "node-class-volume-up-command" : "node-class-power-command";

    const contractEdge: Edge<ArchitectureEdgeData> = {
      id: "journey-edge-contract",
      type: "architectureEdge",
      source: "node-interface-remote-command",
      sourceHandle: "out-execute",
      target: activeCmdNodeId,
      targetHandle: "in-contract",
      data: {
        isJourneyActive: true,
        commandName: ":IRemoteCommand (Контракт)",
        onInspectDi: handleInspectDi,
      },
    };

    const diEdge: Edge<ArchitectureEdgeData> = {
      id: "journey-edge-di",
      type: "architectureEdge",
      source: activeCmdNodeId,
      sourceHandle: "out-execute",
      target: "node-class-tv-controller",
      targetHandle: "in-command-handler",
      data: {
        isJourneyActive: true,
        isPowerWire: true,
        commandName: isVol ? "DI: VolumeUpCommand" : "DI: PowerCommand",
        onInspectDi: handleInspectDi,
      },
    };

    const otherEdges = edges
      .filter((e) => !(e.source === activeCmdNodeId && e.target === "node-class-tv-controller"))
      .map((e) => ({
        ...e,
        data: {
          ...e.data,
          isJourneyActive: false,
          onInspectDi: handleInspectDi,
        },
      }));

    return [contractEdge, diEdge, ...otherEdges];
  }, [edges, activeJourney, handleInspectDi]);

  return {
    activeJourney,
    handleInspectInterface,
    handleInspectDi,
    handleChangeJourneyStep,
    handleChangeJourneyCommand,
    handleCloseJourney,
    handleFitAll,
    processedNodes,
    processedEdges,
  };
}
