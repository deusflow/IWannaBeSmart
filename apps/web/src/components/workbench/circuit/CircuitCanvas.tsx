import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { HardwareNode, type HardwareNodeData } from "./HardwareNode";
import { CircuitEdge, type CircuitEdgeData } from "./CircuitEdge";
import { RotateCcw, Cpu } from "lucide-react";
import { Badge } from "@iw/ui";

const nodeTypes = {
  hardwareNode: HardwareNode,
};

const edgeTypes = {
  circuitEdge: CircuitEdge,
};

export const CircuitCanvas: React.FC = () => {
  const {
    power,
    circuitEdges,
    resetCircuit,
    isEdgeBroken,
    irSignalPulse,
  } = useWorkbenchStore(
    useShallow((s) => ({
      power: s.power,
      circuitEdges: s.circuitEdges,
      resetCircuit: s.resetCircuit,
      isEdgeBroken: s.isEdgeBroken,
      irSignalPulse: s.irSignalPulse,
    }))
  );

  const brokenCount = Object.values(circuitEdges).filter((e) => e.isBroken).length;

  const isPsuMcuBroken = isEdgeBroken("edge-psu-mcu");
  const isPsuIrBroken = isEdgeBroken("edge-psu-ir");
  const isIrMcuBroken = isEdgeBroken("edge-ir-mcu");
  const isMcuDisplayBroken = isEdgeBroken("edge-mcu-display");
  const isMcuAudioBroken = isEdgeBroken("edge-mcu-audio");
  const isMcuLedBroken = isEdgeBroken("edge-mcu-led");
  const isMcuEepromBroken = isEdgeBroken("edge-mcu-eeprom");

  // Dynamic node status mapping
  const mcuHasPower = !isPsuMcuBroken;
  const irHasPower = !isPsuIrBroken;
  const displayHasSignal = mcuHasPower && !isMcuDisplayBroken && power;
  const audioHasSignal = mcuHasPower && !isMcuAudioBroken && power;
  const ledHasSignal = mcuHasPower && !isMcuLedBroken;
  const eepromHasSignal = mcuHasPower && !isMcuEepromBroken;

  const nodes: Node<HardwareNodeData>[] = useMemo(
    () => [
      // 1. PSU (Power Supply Unit)
      {
        id: "node-psu",
        type: "hardwareNode",
        position: { x: 20, y: 30 },
        data: {
          id: "node-psu",
          nodeType: "psu",
          name: "PSU",
          chipModel: "LM7805",
          role: "Лінійний стабілізатор +5V",
          nominalVoltage: "5.02 V",
          voltage: "5.02 V",
          hasSignal: true,
          isFault: false,
        },
      },
      // 2. IR RX (Infrared Receiver)
      {
        id: "node-ir",
        type: "hardwareNode",
        position: { x: 20, y: 200 },
        data: {
          id: "node-ir",
          nodeType: "ir",
          name: "IR RX",
          chipModel: "TSOP38238",
          role: "Демодулятор 38 kHz",
          nominalVoltage: "3.31 V",
          voltage: irHasPower ? (irSignalPulse ? "0.80 V" : "3.31 V") : "0.00 V",
          hasSignal: irHasPower,
          isFault: isPsuIrBroken || isIrMcuBroken,
        },
      },
      // 3. MCU (Microcontroller Core)
      {
        id: "node-mcu",
        type: "hardwareNode",
        position: { x: 260, y: 110 },
        data: {
          id: "node-mcu",
          nodeType: "mcu",
          name: "MCU",
          chipModel: "ATmega328P",
          role: "Центральний процесор",
          nominalVoltage: "5.00 V",
          voltage: mcuHasPower ? "5.00 V" : "0.00 V",
          hasSignal: mcuHasPower,
          isFault: !mcuHasPower,
        },
      },
      // 4. EEPROM (Non-volatile memory)
      {
        id: "node-eeprom",
        type: "hardwareNode",
        position: { x: 260, y: 280 },
        data: {
          id: "node-eeprom",
          nodeType: "eeprom",
          name: "EEPROM",
          chipModel: "24C08",
          role: "Пам'ять каналів I2C",
          nominalVoltage: "5.00 V",
          voltage: eepromHasSignal ? "5.00 V" : "0.00 V",
          hasSignal: eepromHasSignal,
          isFault: isMcuEepromBroken || !mcuHasPower,
        },
      },
      // 5. Display Driver
      {
        id: "node-display",
        type: "hardwareNode",
        position: { x: 500, y: 30 },
        data: {
          id: "node-display",
          nodeType: "display",
          name: "Display Driver",
          chipModel: "TDA9351",
          role: "Контролер матриці/розгортки",
          nominalVoltage: "12.0 V",
          voltage: displayHasSignal ? "12.0 V" : "0.00 V",
          hasSignal: displayHasSignal,
          isFault: isMcuDisplayBroken,
        },
      },
      // 6. Audio Amp
      {
        id: "node-audio",
        type: "hardwareNode",
        position: { x: 500, y: 155 },
        data: {
          id: "node-audio",
          nodeType: "audio",
          name: "Audio Amp",
          chipModel: "LM386",
          role: "Підсилювач звукового тракту",
          nominalVoltage: "5.00 V",
          voltage: audioHasSignal ? "5.00 V" : "0.00 V",
          hasSignal: audioHasSignal,
          isFault: isMcuAudioBroken,
        },
      },
      // 7. LED Driver
      {
        id: "node-led",
        type: "hardwareNode",
        position: { x: 500, y: 280 },
        data: {
          id: "node-led",
          nodeType: "led",
          name: "LED Driver",
          chipModel: "SMD-LED",
          role: "Індикатор чергового режиму",
          nominalVoltage: "2.10 V",
          voltage: ledHasSignal ? "2.10 V" : "0.00 V",
          hasSignal: ledHasSignal,
          isFault: isMcuLedBroken || !mcuHasPower,
        },
      },
    ],
    [
      mcuHasPower,
      irHasPower,
      irSignalPulse,
      isPsuIrBroken,
      isIrMcuBroken,
      isMcuDisplayBroken,
      isMcuAudioBroken,
      isMcuLedBroken,
      isMcuEepromBroken,
      displayHasSignal,
      audioHasSignal,
      ledHasSignal,
      eepromHasSignal,
    ]
  );

  const edges: Edge<CircuitEdgeData>[] = useMemo(
    () => [
      {
        id: "edge-psu-mcu",
        source: "node-psu",
        target: "node-mcu",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-psu-mcu"]?.isBroken ?? false,
          label: "VCC (+5V)",
          signalType: "Головне живлення процесора",
        },
      },
      {
        id: "edge-psu-ir",
        source: "node-psu",
        target: "node-ir",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-psu-ir"]?.isBroken ?? false,
          label: "VCC (+5V)",
          signalType: "Живлення фотоприймача",
        },
      },
      {
        id: "edge-ir-mcu",
        source: "node-ir",
        target: "node-mcu",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-ir-mcu"]?.isBroken ?? false,
          label: "IR_DATA",
          signalType: "Переривання INT0",
        },
      },
      {
        id: "edge-mcu-display",
        source: "node-mcu",
        target: "node-display",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-mcu-display"]?.isBroken ?? false,
          label: "LVDS / Video",
          signalType: "Кадрова розгортка",
        },
      },
      {
        id: "edge-mcu-audio",
        source: "node-mcu",
        target: "node-audio",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-mcu-audio"]?.isBroken ?? false,
          label: "Audio PWM",
          signalType: "Звуковий тракт",
        },
      },
      {
        id: "edge-mcu-led",
        source: "node-mcu",
        target: "node-led",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-mcu-led"]?.isBroken ?? false,
          label: "GPIO LED",
          signalType: "Світлодіод стану",
        },
      },
      {
        id: "edge-mcu-eeprom",
        source: "node-mcu",
        target: "node-eeprom",
        type: "circuitEdge",
        data: {
          isBroken: circuitEdges["edge-mcu-eeprom"]?.isBroken ?? false,
          label: "I2C Bus",
          signalType: "SDA / SCL пам'ять",
        },
      },
    ],
    [circuitEdges]
  );

  return (
    <div className="flex flex-col w-full rounded-2xl overflow-hidden border border-paper-border bg-paper-subtle shadow-paper-sm">
      {/* Board Top Toolbar */}
      <div className="px-3.5 py-2.5 bg-paper border-b border-paper-border flex items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-accent-blue-light text-accent-blue flex items-center justify-center">
            <Cpu size={14} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xs text-ink">
                Принципова схема шасі (PCB Schematic)
              </span>
              <Badge
                variant={brokenCount > 0 ? "broken" : "ok"}
                size="sm"
                className="font-balsamiq text-[10px]"
              >
                {brokenCount > 0 ? `${brokenCount} обрив(и)` : "Всі ланцюги замкнені"}
              </Badge>
            </div>
            <p className="font-balsamiq text-[10px] text-ink-muted">
              Клікніть на будь-яку доріжку для моделювання фізичного обриву зв&apos;язку
            </p>
          </div>
        </div>

        {/* Reset Circuit Button */}
        <button
          onClick={resetCircuit}
          title="Скинути всі обриви та відновити доріжки до стану OK"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-paper-subtle hover:bg-paper border border-paper-border hover:border-accent-blue/40 text-ink text-xs font-balsamiq font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-95"
        >
          <RotateCcw size={12} className="text-accent-blue" />
          <span>Скинути схему</span>
        </button>
      </div>

      {/* Interactive Circuit Canvas Surface with explicit 460px height */}
      <div className="w-full h-[470px] relative bg-paper-subtle">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          className="bg-notebook-grid w-full h-full"
        >
          <Background color="rgba(29, 32, 35, 0.08)" gap={16} size={1} />
          <Controls
            showInteractive={false}
            className="!bg-paper !border-paper-border !rounded-lg !shadow-paper-sm [&>button]:!bg-paper [&>button]:!border-paper-border [&>button]:!text-ink-muted hover:[&>button]:!text-ink"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
