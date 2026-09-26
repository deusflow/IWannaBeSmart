/**
 * @file packages/sim-engine/src/runtime/tasks-iot.ts
 * @description Educational curriculum tasks for Station 03: IoT Garage Gate (C# & Go)
 * Event-Driven Architecture, EventBus subscriptions, and safety interlocks.
 */

import {
  type VirtualIotState,
  type IotRuntimeResult,
  INITIAL_IOT_STATE,
} from "./iotContext";

export interface IotTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: VirtualIotState;
  validate: (
    before: VirtualIotState,
    after: VirtualIotState,
    result: IotRuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const IOT_TASKS: IotTask[] = [
  // ── Task 1: Motion Sensor Detection & Safe Gate Stop ──────────────
  {
    id: "task-iot-1-motion-stop",
    order: 1,
    titleKey: "iotStation.tasks.task1.title",
    conceptKey: "iotStation.tasks.task1.concept",
    descKey: "iotStation.tasks.task1.desc",
    hintKey: "iotStation.tasks.task1.hint",
    successKey: "iotStation.tasks.task1.success",
    targetCode: {
      csharp: `eventBus.Subscribe("OBSTACLE_DETECTED", (e) => {
    gate.EmergencyStop();
    relay.PowerOff();
});`,
      go: `eventBus.Subscribe("OBSTACLE_DETECTED", func(e Event) {
    gate.EmergencyStop()
    relay.PowerOff()
})`,
    },
    clozeTemplate: {
      csharp: `eventBus.Subscribe("OBSTACLE_DETECTED", (e) => {
    /*__BLANK_1__*/.EmergencyStop();
    relay./*__BLANK_2__*/();
});`,
      go: `eventBus.Subscribe("OBSTACLE_DETECTED", func(e Event) {
    /*__BLANK_1__*/.EmergencyStop()
    relay./*__BLANK_2__*/()
})`,
    },
    initialState: {
      ...INITIAL_IOT_STATE,
      doorState: "CLOSING",
      positionPercent: 50,
      relayPower: true,
      motorDirection: "DOWN",
    },
    validate: (_before, after, result) => {
      if (!result.success) {
        return { passed: false, messageKey: "iotStation.validation.fail" };
      }
      const safetyHalt =
        after.doorState === "STOPPED" &&
        after.relayPower === false &&
        after.safetyInterlockEngaged === true;

      return {
        passed: safetyHalt,
        messageKey: safetyHalt
          ? "iotStation.validation.success"
          : "iotStation.validation.motorStillRunning",
      };
    },
  },
];
