export type EntityType = "interface" | "class" | "controller" | "service";

export type PortType =
  | "IRemoteCommand"
  | "ITVReceiver"
  | "DisplayService"
  | "AudioService"
  | "void"
  | "event"
  | "hardware";

export interface PortDefinition {
  id: string;
  name: string;
  portType: PortType;
  typeAnnotation?: string;
  description?: string;
  color?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  folder: "interfaces" | "commands" | "controllers" | "services";
  path: string;
  entityType: EntityType;
  role: string;
  implementsInterface?: string;
  inputs: PortDefinition[]; // DI dependencies (Position.Left)
  outputs: PortDefinition[]; // Methods & Events (Position.Right)
}

export interface ArchitectureNodeData extends Record<string, unknown> {
  fileId: string;
  name: string;
  path: string;
  entityType: EntityType;
  role: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  isHighlighted?: boolean;
}

export type LogType = "success" | "error" | "info" | "warning";

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  title: string;
  message: string;
  codeContext?: string;
}

