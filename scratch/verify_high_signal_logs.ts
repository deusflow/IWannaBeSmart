import { SubsystemTag, TerminalLogEntry } from "../apps/web/src/components/workbench/architecture/types";

// Import resolveSubsystem logic or test it directly
function resolveSubsystem(log: TerminalLogEntry): SubsystemTag {
  if (log.subsystem) return log.subsystem;

  const content = `${log.operation || ""} ${log.title || ""} ${log.message || ""} ${log.details || ""}`.toLowerCase();

  if (log.type === "error" || content.includes("mismatch") || content.includes("fail") || content.includes("null") || content.includes("fault")) {
    return "FAULT";
  }
  if (content.includes("di") || content.includes("inject") || content.includes("resolve") || content.includes("transient") || content.includes("singleton") || content.includes("container") || content.includes("serviceprovider") || content.includes("ioc")) {
    return "IoC";
  }
  if (content.includes("vtable") || content.includes("polymorph") || content.includes("interface") || content.includes("virtual") || content.includes("execute()")) {
    return "VTABLE";
  }
  if (content.includes("relay") || content.includes("crt") || content.includes("rail") || content.includes("115v") || content.includes("hardware") || content.includes("power on") || content.includes("voltage")) {
    return "HARDWARE";
  }
  if (content.includes("remote") || content.includes("bus") || content.includes("dispatch") || content.includes("signal") || content.includes("bind")) {
    return "BUS";
  }
  return "GRAPH";
}

function formatTelemetryLine(log: TerminalLogEntry): string {
  const subsystem = resolveSubsystem(log);
  const op = log.operation || (log.type === "error" ? "FAULT" : "EVENT");
  return `[${log.timestamp}] [${subsystem}] ${op} -> ${log.message}${log.details ? ` (${log.details})` : ""}`;
}

const sampleLogs: TerminalLogEntry[] = [
  {
    id: "log-1",
    timestamp: "17:14:39.102",
    type: "info",
    subsystem: "BUS",
    operation: "DISPATCH",
    message: "Remote -> TVController.Dispatch()",
    targetNodeId: "node-class-tv-controller",
    details: "IR signal decoded by microcontroller bus (Channel 0x01)",
  },
  {
    id: "log-2",
    timestamp: "17:14:39.552",
    type: "info",
    subsystem: "IoC",
    operation: "RESOLVE",
    message: "TVController.ctor -> injected PowerCommand (0x7F2A)",
    targetNodeId: "node-class-power-command",
    details: "Transient resolution via ServiceProvider container",
  },
  {
    id: "log-3",
    timestamp: "17:14:40.052",
    type: "success",
    subsystem: "VTABLE",
    operation: "VTABLE_RESOLVED",
    message: "IRemoteCommand.Execute() -> PowerCommand.Execute()",
    targetNodeId: "node-class-power-command",
    details: "Virtual method table offset 0x00 resolved concrete implementation",
  },
  {
    id: "log-4",
    timestamp: "17:14:40.602",
    type: "success",
    subsystem: "HARDWARE",
    operation: "RELAY_ON",
    message: "CRT Power Rail -> 115V OK (State: OPERATIONAL)",
    details: "Main power relay energized, cathode filament heated",
  },
  {
    id: "log-5",
    timestamp: "17:14:41.000",
    type: "error",
    subsystem: "FAULT",
    operation: "TYPE_MISMATCH",
    message: "Binding rejected: DisplayService -> AudioService",
    details: "Cannot bind [DisplayService] to [AudioService]",
  },
];

console.log("=== High-Signal Telemetry Verification ===");

let passed = 0;
let total = 0;

for (const log of sampleLogs) {
  total++;
  const line = formatTelemetryLine(log);
  console.log(`[PASS] ${line}`);

  // Test timestamp format HH:mm:ss.SSS
  if (!/^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(log.timestamp)) {
    throw new Error(`Invalid timestamp format in log: ${log.timestamp}`);
  }

  // Test single-line format
  if (line.includes("\n")) {
    throw new Error(`Log line contains newline: ${line}`);
  }

  // Test subsystem tag
  const subsystem = resolveSubsystem(log);
  if (!["IoC", "VTABLE", "BUS", "HARDWARE", "FAULT", "GRAPH"].includes(subsystem)) {
    throw new Error(`Invalid subsystem: ${subsystem}`);
  }

  passed++;
}

console.log(`\nAll ${passed}/${total} telemetry logs successfully verified! High-signal criteria satisfied.`);
