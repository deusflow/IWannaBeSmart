/**
 * @file apps/web/src/components/workbench/architecture/initialGraph.ts
 * @description Initial node configuration for Architecture Canvas (Level 1).
 */

import type { Node } from "@xyflow/react";
import { PROJECT_FILES } from "./projectData";
import type { ArchitectureNodeData } from "./types";

export const createInitialNodes = (): Node<ArchitectureNodeData>[] => {
  const iface = PROJECT_FILES.find((f) => f.id === "interface-remote-command")!;
  const pc = PROJECT_FILES.find((f) => f.id === "class-power-command")!;
  const vol = PROJECT_FILES.find((f) => f.id === "class-volume-up-command")!;
  const tv = PROJECT_FILES.find((f) => f.id === "class-tv-controller")!;
  return [
    {
      id: "node-interface-remote-command",
      type: "architectureNode",
      position: { x: 30, y: 150 },
      width: 290,
      data: {
        fileId: iface.id,
        name: iface.name,
        path: iface.path,
        entityType: iface.entityType,
        role: iface.role,
        inputs: iface.inputs,
        outputs: iface.outputs,
        implementsInterface: iface.implementsInterface,
      },
    },
    {
      id: "node-class-power-command",
      type: "architectureNode",
      position: { x: 390, y: 50 },
      width: 290,
      data: {
        fileId: pc.id,
        name: pc.name,
        path: pc.path,
        entityType: pc.entityType,
        role: pc.role,
        inputs: pc.inputs,
        outputs: pc.outputs,
        implementsInterface: pc.implementsInterface,
      },
    },
    {
      id: "node-class-volume-up-command",
      type: "architectureNode",
      position: { x: 390, y: 350 },
      width: 290,
      data: {
        fileId: vol.id,
        name: vol.name,
        path: vol.path,
        entityType: vol.entityType,
        role: vol.role,
        inputs: vol.inputs,
        outputs: vol.outputs,
        implementsInterface: vol.implementsInterface,
      },
    },
    {
      id: "node-class-tv-controller",
      type: "architectureNode",
      position: { x: 750, y: 140 },
      width: 290,
      data: {
        fileId: tv.id,
        name: tv.name,
        path: tv.path,
        entityType: tv.entityType,
        role: tv.role,
        inputs: tv.inputs,
        outputs: tv.outputs,
        implementsInterface: tv.implementsInterface,
        injectedDependency: null,
      },
    },
  ];
};
