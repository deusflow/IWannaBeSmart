export type EntityType = "interface" | "class" | "controller" | "service";

export interface PortDefinition {
  id: string;
  name: string;
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
