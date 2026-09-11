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

export interface InjectedDependencyInfo {
  name: string;
  address: string;
  commandType: "power" | "volume" | "other";
}

export interface ArchitectureNodeData extends Record<string, unknown> {
  fileId: string;
  name: string;
  path: string;
  entityType: EntityType;
  role: string;
  implementsInterface?: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  /** Injected dependency instance pointer inside constructor (Memory X-Ray) */
  injectedDependency?: InjectedDependencyInfo | null;
  /** Active NullReference crash animation on memory slot */
  isMemoryCrashing?: boolean;
  /** Temporary 1s flash when camera focuses an already-placed node */
  isFlashing?: boolean;
  /** Active live signal execution pulse */
  isPulsing?: boolean;
  /** VTable resolved target branch */
  isVTableTarget?: boolean;
  /** @deprecated use isFlashing instead — kept for type compatibility */
  isHighlighted?: boolean;
  /** Interactive Journey Trace callbacks & flags */
  isJourneyActive?: boolean;
  isJourneyStepTarget?: boolean;
  isJourneyDimmed?: boolean;
  onInspectInterface?: (interfaceName: string) => void;
  onInspectDi?: () => void;
}

export type JourneyType = "INTERFACE" | "DI";

export interface ActiveJourneyState {
  type: JourneyType;
  interfaceId: string;
  activeStep: number;
  activeCommand: "PowerCommand" | "VolumeUpCommand";
}

export type LogType = "success" | "error" | "info" | "warning";

export type SubsystemTag = "IoC" | "VTABLE" | "BUS" | "HARDWARE" | "FAULT" | "GRAPH";

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  subsystem?: SubsystemTag;
  operation?: string;
  message: string;
  targetNodeId?: string;
  details?: string;
  title?: string;
  codeContext?: string;
}


