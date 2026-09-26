/**
 * @file packages/sim-engine/src/__tests__/iotEngine.test.ts
 * @description Vitest test suite for Station 03: IoT Garage Gate & EventBus Interlocks
 */

import { describe, it, expect } from "vitest";
import {
  VirtualGarageGate,
  executeIotScript,
  IOT_TASKS,
} from "../index";

describe("Station 03: IoT Garage Gate & EventBus Engine", () => {
  it("should contain at least 1 validated IoT curriculum task", () => {
    expect(IOT_TASKS.length).toBeGreaterThanOrEqual(1);
    const task1 = IOT_TASKS[0];
    expect(task1.id).toBe("task-iot-1-motion-stop");
    expect(task1.targetCode.csharp).toContain("EmergencyStop");
    expect(task1.targetCode.go).toContain("EmergencyStop");
  });

  describe("VirtualGarageGate Mechanics & Sensor Interlocks", () => {
    it("should initialize in closed state with relay powered off", () => {
      const gate = new VirtualGarageGate();
      const snap = gate.getSnapshot();
      expect(snap.doorState).toBe("CLOSED");
      expect(snap.positionPercent).toBe(0);
      expect(snap.relayPower).toBe(false);
      expect(snap.limitSwitchClosed).toBe(true);
      expect(snap.limitSwitchOpen).toBe(false);
    });

    it("should transition from closed to opening upon remote click", () => {
      const gate = new VirtualGarageGate();
      gate.triggerRemote();
      const snap = gate.getSnapshot();
      expect(snap.doorState).toBe("OPENING");
      expect(snap.motorDirection).toBe("UP");
      expect(snap.relayPower).toBe(true);
      expect(snap.limitSwitchClosed).toBe(false);
      expect(snap.lastEvent).toBe("MOTOR_ENGAGED");
    });

    it("should trigger limit switch and auto-stop when reaching 100% position", () => {
      const gate = new VirtualGarageGate();
      gate.triggerRemote(); // opening
      gate.setPosition(100);
      const snap = gate.getSnapshot();
      expect(snap.doorState).toBe("OPEN");
      expect(snap.relayPower).toBe(false);
      expect(snap.limitSwitchOpen).toBe(true);
      expect(snap.lastEvent).toBe("LIMIT_SWITCH_TRIPPED");
    });

    it("should engage safety emergency stop when obstacle is detected during closing", () => {
      const gate = new VirtualGarageGate();
      gate.setPosition(100);
      gate.triggerRemote(); // closing
      expect(gate.getSnapshot().doorState).toBe("CLOSING");
      expect(gate.getSnapshot().relayPower).toBe(true);

      // Optical beam tripped
      gate.triggerObstacle(true);
      const snap = gate.getSnapshot();
      expect(snap.doorState).toBe("STOPPED");
      expect(snap.relayPower).toBe(false);
      expect(snap.safetyInterlockEngaged).toBe(true);
      expect(snap.obstacleDetected).toBe(true);
      expect(snap.lastEvent).toBe("SAFETY_INTERLOCK_ENGAGED");
    });
  });

  describe("executeIotScript Validation", () => {
    it("should pass Task 1 with valid C# safety stop code", () => {
      const task = IOT_TASKS[0];
      const res = executeIotScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.doorState).toBe("STOPPED");
      expect(res.newState.relayPower).toBe(false);
      expect(res.newState.safetyInterlockEngaged).toBe(true);

      const validation = task.validate(task.initialState, res.newState, res);
      expect(validation.passed).toBe(true);
    });

    it("should pass Task 1 with valid Go safety stop code", () => {
      const task = IOT_TASKS[0];
      const res = executeIotScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.doorState).toBe("STOPPED");
      expect(res.newState.relayPower).toBe(false);

      const validation = task.validate(task.initialState, res.newState, res);
      expect(validation.passed).toBe(true);
    });

    it("should fail validation if code does not subscribe to obstacle or stop the motor", () => {
      const task = IOT_TASKS[0];
      const res = executeIotScript(`Console.WriteLine("Hello world");`, task.initialState);
      expect(res.success).toBe(false);
      const validation = task.validate(task.initialState, res.newState, res);
      expect(validation.passed).toBe(false);
    });
  });
});
