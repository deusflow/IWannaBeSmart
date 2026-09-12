/**
 * @file apps/web/src/components/workbench/architecture/connectionRules.ts
 * @description Connection validation rules and port type compatibility matrix for architecture wiring.
 */

import type { Connection, Edge, Node } from "@xyflow/react";
import type { ArchitectureNodeData, PortType } from "./types";

export const PORT_COMPATIBILITY: Record<PortType, PortType[]> = {
  IRemoteCommand: ["IRemoteCommand"],
  ITVReceiver: ["ITVReceiver"],
  DisplayService: ["DisplayService"],
  AudioService: ["AudioService"],
  void: [],
  event: ["event"],
  hardware: ["hardware"],
};

export function findPortType(
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

export function getPortName(
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

export function getNodeName(nodeId: string, nodes: Node<ArchitectureNodeData>[]): string {
  return nodes.find((n) => n.id === nodeId)?.data.name ?? "?";
}

export function validatePortConnection(
  connection: Edge | Connection,
  nodes: Node<ArchitectureNodeData>[]
): {
  isValid: boolean;
  srcType: PortType | null;
  tgtType: PortType | null;
  srcNodeName: string;
  tgtNodeName: string;
  srcPortName: string;
  tgtPortName: string;
} {
  const srcType = findPortType(connection.source ?? "", connection.sourceHandle, "output", nodes);
  const tgtType = findPortType(connection.target ?? "", connection.targetHandle, "input", nodes);
  const srcNodeName = getNodeName(connection.source ?? "", nodes);
  const tgtNodeName = getNodeName(connection.target ?? "", nodes);
  const srcPortName = getPortName(connection.source ?? "", connection.sourceHandle, "output", nodes);
  const tgtPortName = getPortName(connection.target ?? "", connection.targetHandle, "input", nodes);

  if (!srcType || !tgtType) {
    return {
      isValid: false,
      srcType,
      tgtType,
      srcNodeName,
      tgtNodeName,
      srcPortName,
      tgtPortName,
    };
  }

  const isValid = PORT_COMPATIBILITY[srcType]?.includes(tgtType) ?? false;
  return {
    isValid,
    srcType,
    tgtType,
    srcNodeName,
    tgtNodeName,
    srcPortName,
    tgtPortName,
  };
}
