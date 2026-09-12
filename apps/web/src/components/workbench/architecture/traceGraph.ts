/**
 * @file apps/web/src/components/workbench/architecture/traceGraph.ts
 * @description Universal TraceGraph builder, hierarchical fan-out layout, and real-code/bypass evaluator.
 */

import type { TraceGraph, TraceNode, TraceEdge } from "./types";

/**
 * Predefined trace graph templates for TV Station entities.
 */
export const TV_TRACE_ENTITIES: Record<string, { entityName: string; description: string }> = {
  IRemoteCommand: {
    entityName: "IRemoteCommand",
    description: "Інтерфейс поліморфних команд пульта телевізора",
  },
  PowerCommand: {
    entityName: "PowerCommand",
    description: "Команда увімкнення/вимкнення живлення телевізора",
  },
  TVController: {
    entityName: "TVController",
    description: "Центральний диспетчер та приймач команд ТВ",
  },
  ITVReceiver: {
    entityName: "ITVReceiver",
    description: "Контракт пристрою-отримувача стану телевізора",
  },
  Mute: {
    entityName: "Mute()",
    description: "Окрема функція швидкого вимкнення звуку",
  },
};

/**
 * Builds the canonical blueprint TraceGraph for a given entity.
 */
export function buildRawTraceGraph(entityId: string = "IRemoteCommand"): TraceGraph {
  if (entityId === "Mute") {
    // 2. Function trace: Declaration -> CallSite -> Effect (3 nodes, 2 edges)
    const nodes: TraceNode[] = [
      {
        id: "node-mute-decl",
        type: "Declaration",
        filePath: "controllers/TVFunctions.cs",
        lineRange: [14, 18],
        label: "void Mute()",
        description: "Оголошення функції прямого вимкнення звуку",
        codeSnippet: "void Mute() {\n    tv.Volume = 0;\n}",
        rank: 0,
        branchIndex: 0,
        totalBranches: 1,
      },
      {
        id: "node-mute-call",
        type: "CallSite",
        filePath: "Program.cs",
        lineRange: [32, 34],
        label: "Mute()",
        description: "Точка виклику функції в основному циклі подій",
        codeSnippet: "// Виклик без інтерфейсу\nMute();",
        rank: 1,
        branchIndex: 0,
        totalBranches: 1,
      },
      {
        id: "node-mute-effect",
        type: "Effect",
        filePath: "services/AudioService.cs",
        lineRange: [88, 92],
        label: "Audio Muted (0%)",
        description: "Ампліфікатор LM386 заземлює аудіовиходи, звук 0%",
        codeSnippet: "amplifier.Mute(); // 0 dB output",
        rank: 2,
        branchIndex: 0,
        totalBranches: 1,
      },
    ];

    const edges: TraceEdge[] = [
      {
        id: "edge-mute-1",
        from: "node-mute-decl",
        to: "node-mute-call",
        kind: "calls",
        status: "active",
      },
      {
        id: "edge-mute-2",
        from: "node-mute-call",
        to: "node-mute-effect",
        kind: "produces",
        status: "active",
      },
    ];

    return {
      rootEntityId: "Mute",
      entityName: "Mute()",
      nodes,
      edges,
      isBroken: false,
    };
  }

  // Default: IRemoteCommand / PowerCommand (6-step interface & DI acceptance scenario)
  const nodes: TraceNode[] = [
    {
      id: "node-trace-decl",
      type: "Declaration",
      filePath: "interfaces/IRemoteCommand.cs",
      lineRange: [1, 5],
      label: "IRemoteCommand (interface)",
      description: "Контракт інкапсуляції дії пульта",
      codeSnippet: "public interface IRemoteCommand {\n    void Execute(TVReceiver receiver);\n}",
      rank: 0,
      branchIndex: 0,
      totalBranches: 1,
    },
    // Rank 1: Fan-out implementations (PowerCommand and VolumeUpCommand)
    {
      id: "node-trace-impl-power",
      type: "Implementation",
      filePath: "commands/PowerCommand.cs",
      lineRange: [6, 12],
      label: "PowerCommand : IRemoteCommand",
      description: "Реалізація перемикання живлення",
      codeSnippet: "public class PowerCommand : IRemoteCommand {\n    public void Execute(TVReceiver r) => r.TogglePowerState();\n}",
      rank: 1,
      branchIndex: 0,
      totalBranches: 2,
    },
    {
      id: "node-trace-impl-volume",
      type: "Implementation",
      filePath: "commands/VolumeUpCommand.cs",
      lineRange: [6, 12],
      label: "VolumeUpCommand : IRemoteCommand",
      description: "Реалізація збільшення гучності",
      codeSnippet: "public class VolumeUpCommand : IRemoteCommand {\n    public void Execute(TVReceiver r) => r.SetVolume(r.Volume + 10);\n}",
      rank: 1,
      branchIndex: 1,
      totalBranches: 2,
    },
    // Rank 2: DI Container Registration
    {
      id: "node-trace-di-reg",
      type: "Registration",
      filePath: "ProjectSetup.cs",
      lineRange: [18, 22],
      label: "services.AddSingleton<IRemoteCommand, PowerCommand>()",
      description: "Реєстрація зв'язування контракту з реалізацією в DI-контейнері",
      codeSnippet: "// Реєстрація в IoC\nservices.AddSingleton<IRemoteCommand, PowerCommand>();",
      rank: 2,
      branchIndex: 0,
      totalBranches: 1,
    },
    // Rank 3: Constructor Injection Point
    {
      id: "node-trace-ctor-inj",
      type: "InjectionPoint",
      filePath: "controllers/TVController.cs",
      lineRange: [12, 17],
      label: "TVController(IRemoteCommand cmd)",
      description: "Слот конструктора: контейнер передає об'єкт через інтерфейс",
      codeSnippet: "public TVController(IRemoteCommand command) {\n    _command = command ?? throw new ArgumentNullException();\n}",
      rank: 3,
      branchIndex: 0,
      totalBranches: 1,
    },
    // Rank 4: Call Site
    {
      id: "node-trace-callsite",
      type: "CallSite",
      filePath: "controllers/TVController.cs",
      lineRange: [25, 29],
      label: "TVController.PowerOn() -> _cmd.Execute()",
      description: "Контролер делегує дію через виклик інтерфейсного методу Execute()",
      codeSnippet: "public void PowerOn() {\n    _command.Execute(_receiver);\n}",
      rank: 4,
      branchIndex: 0,
      totalBranches: 1,
    },
    // Rank 5: Final Observed Effect
    {
      id: "node-trace-effect",
      type: "Effect",
      filePath: "devices/TVBlueprintDevice.tsx",
      lineRange: [110, 115],
      label: "CRT Screen: Power ON (5V / 12V)",
      description: "Екран телевізора перемикається у стан «увімкнено», подається напруга на анод",
      codeSnippet: "receiver.TogglePowerState(); // CRT Anode: 12.0V Active",
      rank: 5,
      branchIndex: 0,
      totalBranches: 1,
    },
  ];

  const edges: TraceEdge[] = [
    // 0 -> 1 (Declaration declares implementations)
    {
      id: "edge-decl-power",
      from: "node-trace-decl",
      to: "node-trace-impl-power",
      kind: "implements",
      status: "active",
    },
    {
      id: "edge-decl-vol",
      from: "node-trace-decl",
      to: "node-trace-impl-volume",
      kind: "implements",
      status: "active",
    },
    // 1 -> 2 (Implementations registered in DI)
    {
      id: "edge-impl-reg",
      from: "node-trace-impl-power",
      to: "node-trace-di-reg",
      kind: "registers",
      status: "active",
    },
    // 2 -> 3 (DI injects into TVController ctor)
    {
      id: "edge-reg-inj",
      from: "node-trace-di-reg",
      to: "node-trace-ctor-inj",
      kind: "injects",
      status: "active",
    },
    // 3 -> 4 (TVController calls _command.Execute)
    {
      id: "edge-inj-call",
      from: "node-trace-ctor-inj",
      to: "node-trace-callsite",
      kind: "calls",
      status: "active",
    },
    // 4 -> 5 (Call produces hardware reaction)
    {
      id: "edge-call-effect",
      from: "node-trace-callsite",
      to: "node-trace-effect",
      kind: "produces",
      status: "active",
    },
  ];

  return {
    rootEntityId: "IRemoteCommand",
    entityName: "IRemoteCommand",
    nodes,
    edges,
    isBroken: false,
  };
}

/**
 * Calculates (x, y) coordinates for a TraceNode using rank and fan-out branch index.
 */
export function computeTraceNodePosition(
  node: TraceNode,
  originX = 40,
  originY = 200,
  spacingX = 280,
  spacingY = 160
): { x: number; y: number } {
  const rank = node.rank ?? 0;
  const branchIndex = node.branchIndex ?? 0;
  const totalBranches = node.totalBranches ?? 1;

  const x = originX + rank * spacingX;
  const y = originY + (branchIndex - (totalBranches - 1) / 2) * spacingY;

  return { x, y };
}

/**
 * Evaluates the TraceGraph with live student code and bypasses.
 * Propagates 'broken' status downstream through graph edges.
 */
export function evaluateTraceGraph(
  entityId: string = "IRemoteCommand",
  studentCode?: string,
  bypassedNodeIds: Set<string> = new Set()
): TraceGraph {
  const base = buildRawTraceGraph(entityId);
  const bypassSet = new Set(bypassedNodeIds);

  // If student code is provided and breaks essential patterns, auto-bypass/break
  if (studentCode && studentCode.trim().length > 0) {
    const isCsOrGo = studentCode;
    // Check if DI is missing in a DI task
    if (
      entityId === "IRemoteCommand" &&
      isCsOrGo.includes("services.") &&
      !/(?:AddTransient|AddSingleton|AddScoped)\s*<\s*IRemoteCommand/i.test(isCsOrGo) &&
      !/Register\s*\(\s*["'](?:calc|power|info)["']/i.test(isCsOrGo)
    ) {
      bypassSet.add("node-trace-di-reg");
    }
  }

  const nodes = base.nodes.map((n) => ({
    ...n,
    isBypassed: bypassSet.has(n.id),
    isBroken: false,
  }));

  // Identify all broken source nodes
  const brokenNodeIds = new Set<string>();
  nodes.forEach((n) => {
    if (n.isBypassed) {
      brokenNodeIds.add(n.id);
    }
  });

  // Iteratively propagate broken status downstream through directed edges
  let newlyBroken = true;
  const edges = base.edges.map((e) => ({ ...e }));

  while (newlyBroken) {
    newlyBroken = false;
    for (const edge of edges) {
      if (brokenNodeIds.has(edge.from)) {
        if (edge.status !== "broken") {
          edge.status = "broken";
          edge.breakReason = "Зв'язок розірвано: вищестоящий вузол відключено або обійдено (Bypass)";
          if (!brokenNodeIds.has(edge.to)) {
            brokenNodeIds.add(edge.to);
            newlyBroken = true;
          }
        }
      }
    }
  }

  // Mark all downstream nodes as broken
  nodes.forEach((n) => {
    if (brokenNodeIds.has(n.id)) {
      n.isBroken = true;
    }
  });

  const isBroken = brokenNodeIds.size > 0;
  let brokenReason: string | undefined;

  if (brokenNodeIds.has("node-trace-di-reg") || bypassSet.has("node-trace-di-reg")) {
    brokenReason =
      "Dependency unresolved: IRemoteCommand has no active binding in container. TVController received null. TV CRT Anode: Power supply interrupted (0V).";
  } else if (brokenNodeIds.has("node-trace-decl") || bypassSet.has("node-trace-decl")) {
    brokenReason =
      "Interface contract missing: Implementation classes cannot bind to unresolvable declaration.";
  } else if (brokenNodeIds.has("node-trace-impl-power") || bypassSet.has("node-trace-impl-power")) {
    brokenReason =
      "PowerCommand bypassed: No concrete implementation available to service Execute() request.";
  } else if (isBroken) {
    brokenReason = "Signal path broken: Target hardware effect will not trigger.";
  }

  return {
    ...base,
    nodes,
    edges,
    isBroken,
    brokenReason,
  };
}
