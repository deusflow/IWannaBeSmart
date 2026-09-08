/**
 * @file packages/sim-engine/src/data/tv-level-01.ts
 * @description Data manifest for TV Station Level 01 (Items 3, 89–92)
 */

import type { StationLevel } from "../types/level";

export const tvLevel01: StationLevel = {
  id: "tv-01",
  stationId: "tv",
  stationTitle: "Television Station",
  levelNumber: 1,
  title: "Power Rail & Signal Initiation",
  subtitle: "Hardware Signal Flow to Software Contract",
  objective:
    "Verify the 5V power bus, observe incoming 38 kHz infrared packets, and trace signal dispatch to the controller interface.",
  briefing:
    "An interactive TV set operates on physical voltage lines that translate into discrete software commands. Before implementing loose coupling or Dependency Injection, inspect the baseline signal pipeline: Remote → IR Photodiode → MCU GPIO Interrupt → Command Dispatch.",
  tvInitialState: {
    power: false,
    channel: 1,
    maxChannels: 4,
    channelNames: {
      1: "SYS-01 // BOOT KERNEL",
      2: "FINTECH // TRANSACTION FEED",
      3: "DISTRIBUTED // EVENT BUS",
      4: "MEM-TRACE // BUFFER STREAM",
    },
    volume: 14,
    isMuted: false,
    irSignalPulse: false,
  },
  hardwareNodes: [
    {
      id: "node-psu",
      name: "Power Supply Unit (PSU)",
      role: "Linear 5.0V Regulation",
      nominalVoltage: "5.02 V",
      status: "nominal",
      chipModel: "LM7805",
      testPoint: "TP-01 (VCC)",
    },
    {
      id: "node-mcu",
      name: "Microcontroller (MCU)",
      role: "GPIO Interrupt Handler",
      nominalVoltage: "5.00 V",
      status: "nominal",
      chipModel: "ATmega328P",
      testPoint: "TP-02 (PIN 2 / INT0)",
    },
    {
      id: "node-ir",
      name: "Infrared Receiver (IR RX)",
      role: "38 kHz Carrier Demodulation",
      nominalVoltage: "3.31 V",
      status: "active",
      chipModel: "TSOP38238",
      testPoint: "TP-03 (SIG_OUT)",
    },
    {
      id: "node-crt",
      name: "CRT Display Controller",
      role: "Raster Scan & Video Signal",
      nominalVoltage: "12.0 V",
      status: "nominal",
      chipModel: "TDA9351",
      testPoint: "TP-04 (H_SYNC)",
    },
    {
      id: "node-audio",
      name: "Audio Amplifier",
      role: "Analog Gain & Volume Control",
      nominalVoltage: "5.00 V",
      status: "standby",
      chipModel: "LM386",
      testPoint: "TP-05 (SPK_OUT)",
    },
  ],
  codeSnippet: {
    csharp: `// C# Architecture: Command Pattern & Physical Dispatch
public interface IRemoteCommand
{
    void Execute(TVReceiver receiver);
}

public class PowerToggleCommand : IRemoteCommand
{
    public void Execute(TVReceiver receiver)
    {
        receiver.TogglePowerState();
    }
}

public class ChannelChangeCommand : IRemoteCommand
{
    private readonly int _targetChannel;
    public ChannelChangeCommand(int channel) => _targetChannel = channel;

    public void Execute(TVReceiver receiver)
    {
        if (!receiver.IsPoweredOn)
            throw new HardwareFaultException("CRT Deflection coil unpowered.");

        receiver.TuneChannel(_targetChannel);
    }
}`,
    go: `// Go Architecture: Interface & Implicit Contracts
package television

import "errors"

type RemoteCommand interface {
    Execute(receiver *TVReceiver) error
}

type PowerToggleCommand struct{}

func (c PowerToggleCommand) Execute(r *TVReceiver) error {
    r.PowerState = !r.PowerState
    return nil
}

type ChannelChangeCommand struct {
    TargetChannel int
}

func (c ChannelChangeCommand) Execute(r *TVReceiver) error {
    if !r.PowerState {
        return errors.New("hardware fault: CRT deflection unpowered")
    }
    r.CurrentChannel = c.TargetChannel
    return nil
}`,
    explanation:
      "When a remote button triggers an IR pulse, hardware interrupts in the MCU deserialize the NEC protocol into a discrete opcode. In software, this is modeled as an IRemoteCommand, isolating the physical signal from high-level state mutations.",
  },
  untranslatedTerms: [
    "Dependency Injection",
    "IRemoteCommand",
    "HardwareFaultException",
    "Interrupt Service Routine",
    "Interface",
    "State Machine",
  ],
};
