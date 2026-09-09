/**
 * @file apps/web/src/hooks/useGuideSpotlight.ts
 * @description Activates/deactivates pulsing accent ring on hardware device nodes
 *   via [data-guide] attributes, keyed to the active task ID.
 */

import { useEffect, useCallback } from "react";

const TASK_GUIDE_MAP: Record<string, string> = {
  "task-1-assignment": "tv-power-btn",
  "task-2-branching": "remote-pwr",
  "task-3-increment": "remote-ch-up",
  "task-4-guard": "remote-ch-up",
  "task-5-loop": "tv-screen",
  "task-6-function": "remote-vol-down",
  "task-7-switch": "tv-screen",
  "task-8-interface": "tv-ir-port",
  "task-9-di-container": "tv-power-plug",
  "task-10-command-registry": "tv-screen",
  "task-pos-guard-clause": "pos-lcd",
  "task-pos-fee-calculation": "pos-lcd",
  "task-pos-pin-lockout": "pos-chip",
  "task-pos-batch-settlement": "pos-printer",
  "task-pos-gateway-interface": "pos-net",
  "task-pos-di-registration": "pos-net",
};

export function useGuideSpotlight(activeTaskId: string) {
  const activate = useCallback((guideTarget: string) => {
    document
      .querySelectorAll("[data-guide].guide-spotlight")
      .forEach((el) => el.classList.remove("guide-spotlight"));
    const target = document.querySelector(`[data-guide="${guideTarget}"]`);
    if (target) target.classList.add("guide-spotlight");
  }, []);

  const clear = useCallback(() => {
    document
      .querySelectorAll("[data-guide].guide-spotlight")
      .forEach((el) => el.classList.remove("guide-spotlight"));
  }, []);

  useEffect(() => {
    const guideKey = TASK_GUIDE_MAP[activeTaskId];
    if (guideKey) {
      const timer = setTimeout(() => activate(guideKey), 200);
      return () => { clearTimeout(timer); clear(); };
    } else {
      clear();
    }
  }, [activeTaskId, activate, clear]);

  return { activate, clear };
}
