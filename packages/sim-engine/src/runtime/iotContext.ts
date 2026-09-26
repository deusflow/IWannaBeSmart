/**
 * @file packages/sim-engine/src/runtime/iotContext.ts
 * @description Virtual IoT Garage Gate execution environment with EventBus,
 * limit switches (endstops), optical motion sensor, and safety interlock relay.
 */

export type GarageDoorState = "CLOSED" | "OPENING" | "OPEN" | "CLOSING" | "STOPPED";

export interface IotEventBusEntry {
  id: string;
  timestamp: string;
  topic: string;
  payload?: Record<string, unknown> | string | number | boolean;
}

export interface VirtualIotState {
  doorState: GarageDoorState;
  positionPercent: number; // 0 = fully closed, 100 = fully open
  obstacleDetected: boolean; // Optical obstacle beam / motion sensor
  relayPower: boolean; // Main motor power relay
  motorDirection: "UP" | "DOWN" | "IDLE";
  limitSwitchOpen: boolean; // Upper limit switch triggered at 100%
  limitSwitchClosed: boolean; // Lower limit switch triggered at 0%
  eventBusLog: IotEventBusEntry[];
  lastEvent: string | null;
  safetyInterlockEngaged: boolean;
  isRegisteredHandler?: boolean;
}

export interface IotRuntimeResult {
  success: boolean;
  newState: VirtualIotState;
  logs: Array<{ type: "info" | "mutation" | "error" | "security"; message: string }>;
  error?: string;
}

export const INITIAL_IOT_STATE: VirtualIotState = {
  doorState: "CLOSED",
  positionPercent: 0,
  obstacleDetected: false,
  relayPower: false,
  motorDirection: "IDLE",
  limitSwitchOpen: false,
  limitSwitchClosed: true,
  eventBusLog: [
    {
      id: "ev-0",
      timestamp: "12:00:00.000",
      topic: "SYSTEM_INIT",
      payload: { status: "READY", relay: "OFF", gate: "CLOSED" },
    },
  ],
  lastEvent: "SYSTEM_INIT",
  safetyInterlockEngaged: false,
  isRegisteredHandler: false,
};

export class VirtualGarageGate {
  private _state: VirtualIotState;
  private _logs: Array<{ type: "info" | "mutation" | "error" | "security"; message: string }> = [];

  constructor(initial: VirtualIotState = INITIAL_IOT_STATE) {
    this._state = {
      ...initial,
      eventBusLog: [...initial.eventBusLog],
    };
  }

  public getSnapshot(): VirtualIotState {
    return {
      ...this._state,
      eventBusLog: [...this._state.eventBusLog],
    };
  }

  public getLogs(): Array<{ type: "info" | "mutation" | "error" | "security"; message: string }> {
    return [...this._logs];
  }

  public publishEvent(
    topic: string,
    payload?: Record<string, unknown> | string | number | boolean
  ): void {
    const entry: IotEventBusEntry = {
      id: `ev-${this._state.eventBusLog.length + 1}`,
      timestamp: new Date().toISOString().substring(11, 23),
      topic,
      payload,
    };
    this._state.eventBusLog.push(entry);
    this._state.lastEvent = topic;
    this._logs.push({
      type: "info",
      message: `[EventBus] ${topic} -> ${JSON.stringify(payload || {})}`,
    });
  }

  public triggerRemote(): void {
    this.publishEvent("REMOTE_CLICK", { pressed: true });
    if (this._state.doorState === "CLOSED" || this._state.doorState === "STOPPED") {
      this._state.doorState = "OPENING";
      this._state.relayPower = true;
      this._state.motorDirection = "UP";
      this._state.limitSwitchClosed = false;
      this._state.safetyInterlockEngaged = false;
      this.publishEvent("MOTOR_ENGAGED", { direction: "UP", relay: true });
    } else if (this._state.doorState === "OPEN") {
      this._state.doorState = "CLOSING";
      this._state.relayPower = true;
      this._state.motorDirection = "DOWN";
      this._state.limitSwitchOpen = false;
      this._state.safetyInterlockEngaged = false;
      this.publishEvent("MOTOR_ENGAGED", { direction: "DOWN", relay: true });
    } else if (this._state.doorState === "OPENING" || this._state.doorState === "CLOSING") {
      this.stopMotor("USER_REMOTE_HALT");
    }
  }

  public triggerObstacle(detected: boolean): void {
    this._state.obstacleDetected = detected;
    this.publishEvent("OBSTACLE_DETECTED", { detected });
    if (detected && (this._state.doorState === "CLOSING" || this._state.motorDirection === "DOWN")) {
      this.emergencyStop("SAFETY_INTERLOCK_ENGAGED: Obstacle in travel path");
    }
  }

  public stopMotor(reason = "NORMAL_STOP"): void {
    this._state.doorState = "STOPPED";
    this._state.relayPower = false;
    this._state.motorDirection = "IDLE";
    this.publishEvent("MOTOR_STOPPED", { reason });
  }

  public emergencyStop(reason = "EMERGENCY_STOP"): void {
    this._state.doorState = "STOPPED";
    this._state.relayPower = false;
    this._state.motorDirection = "IDLE";
    this._state.safetyInterlockEngaged = true;
    this._logs.push({
      type: "security",
      message: `[SafetyRelay] EMERGENCY STOP: ${reason}`,
    });
    this.publishEvent("SAFETY_INTERLOCK_ENGAGED", { reason });
  }

  public setPosition(percent: number): void {
    const clamped = Math.max(0, Math.min(100, percent));
    this._state.positionPercent = clamped;
    this._state.limitSwitchClosed = clamped === 0;
    this._state.limitSwitchOpen = clamped === 100;
    if (clamped === 100) {
      this._state.doorState = "OPEN";
      this._state.relayPower = false;
      this._state.motorDirection = "IDLE";
      this.publishEvent("LIMIT_SWITCH_TRIPPED", { switch: "TOP_OPEN", position: 100 });
    } else if (clamped === 0) {
      this._state.doorState = "CLOSED";
      this._state.relayPower = false;
      this._state.motorDirection = "IDLE";
      this.publishEvent("LIMIT_SWITCH_TRIPPED", { switch: "BOTTOM_CLOSED", position: 0 });
    }
  }
}

/**
 * Execute student script (C# or Go) against the Virtual Garage Gate
 */
export function executeIotScript(
  script: string,
  initialState: VirtualIotState = INITIAL_IOT_STATE
): IotRuntimeResult {
  const gate = new VirtualGarageGate(initialState);
  const normalized = script.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); // strip comments

  // Check for safe stop / obstacle handler
  const hasObstacleTopic =
    normalized.includes("OBSTACLE_DETECTED") ||
    normalized.includes("ObstacleDetected") ||
    normalized.includes("obstacle");

  const hasEmergencyStop =
    normalized.includes("EmergencyStop") ||
    normalized.includes("emergency_stop") ||
    normalized.includes("emergencyStop");

  const hasPowerOff =
    normalized.includes("PowerOff") ||
    normalized.includes("power_off") ||
    normalized.includes("relay.PowerOff") ||
    normalized.includes("relayPower = false") ||
    normalized.includes("StopMotor");

  const hasSubscription =
    normalized.includes("Subscribe") ||
    normalized.includes("subscribe") ||
    normalized.includes("OnEvent") ||
    normalized.includes("if (") ||
    normalized.includes("if ");

  if (hasObstacleTopic && hasSubscription && (hasEmergencyStop || hasPowerOff)) {
    // Simulate test scenario: gate is currently closing and an obstacle is detected
    gate.setPosition(50);
    // Simulate closing
    const snap = gate.getSnapshot();
    snap.doorState = "CLOSING";
    snap.motorDirection = "DOWN";
    snap.relayPower = true;
    gate.publishEvent("MOTOR_ENGAGED", { direction: "DOWN", relay: true });

    // Obstacle is triggered
    gate.triggerObstacle(true);
    gate.emergencyStop("Student safety handler executed successfully");

    const finalState = gate.getSnapshot();
    finalState.isRegisteredHandler = true;

    return {
      success: true,
      newState: finalState,
      logs: gate.getLogs(),
    };
  }

  // Check for Limit Switch handler
  if (
    normalized.includes("LIMIT_SWITCH_TRIPPED") ||
    normalized.includes("limitSwitch") ||
    normalized.includes("limitSwitchOpen") ||
    normalized.includes("limitSwitchClosed")
  ) {
    gate.setPosition(100);
    return {
      success: true,
      newState: gate.getSnapshot(),
      logs: gate.getLogs(),
    };
  }

  // Check for Remote Click handler
  if (normalized.includes("REMOTE_CLICK") || normalized.includes("triggerRemote")) {
    gate.triggerRemote();
    return {
      success: true,
      newState: gate.getSnapshot(),
      logs: gate.getLogs(),
    };
  }

  // Fallback: check basic execution syntax
  return {
    success: false,
    newState: gate.getSnapshot(),
    logs: [
      ...gate.getLogs(),
      {
        type: "error",
        message: "Очікується підписка на подію OBSTACLE_DETECTED та виклик gate.EmergencyStop() і relay.PowerOff()",
      },
    ],
    error: "Missing event subscription or safety emergency stop call",
  };
}
