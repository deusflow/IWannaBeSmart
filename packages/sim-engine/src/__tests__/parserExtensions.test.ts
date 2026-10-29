/**
 * @file packages/sim-engine/src/__tests__/parserExtensions.test.ts
 * @description Vitest suite for Parser enhancements (compound conditions, return, else-if, for-loop scope, elvis calls)
 */

import { describe, it, expect } from "vitest";
import { VirtualTV } from "../runtime/tvContext";
import { evaluateCondition, interpretScript } from "../runtime/parser";
import type { VirtualTvState } from "../runtime/types";

function createTv(partial?: Partial<VirtualTvState>): VirtualTV {
  return new VirtualTV({
    isOn: false,
    channel: 1,
    volume: 10,
    ...partial,
  });
}

describe("Parser Enhancements", () => {
  describe("evaluateCondition with && and ||", () => {
    it("should evaluate && conditions correctly", () => {
      const tv = createTv();
      tv.PowerOn();
      tv.SetChannel(5);

      expect(evaluateCondition("tv.IsOn && tv.Channel > 4", tv)).toBe(true);
      expect(evaluateCondition("tv.IsOn && tv.Channel < 3", tv)).toBe(false);
      expect(evaluateCondition("!tv.IsOn && tv.Channel == 5", tv)).toBe(false);
    });

    it("should evaluate || conditions correctly", () => {
      const tv = createTv();
      tv.PowerOff();
      tv.SetVolume(20);

      expect(evaluateCondition("tv.IsOn || tv.Volume == 20", tv)).toBe(true);
      expect(evaluateCondition("tv.IsOn || tv.Volume < 10", tv)).toBe(false);
    });

    it("should evaluate nested parenthesized conditions correctly", () => {
      const tv = createTv();
      tv.PowerOn();
      tv.SetChannel(2);
      tv.SetVolume(30);

      expect(
        evaluateCondition("(tv.IsOn && tv.Channel == 2) || tv.Volume == 10", tv)
      ).toBe(true);
      expect(
        evaluateCondition("tv.IsOn && (tv.Channel == 9 || tv.Volume == 30)", tv)
      ).toBe(true);
      expect(
        evaluateCondition("!(tv.Channel == 9 || tv.Volume == 10)", tv)
      ).toBe(true);
    });
  });

  describe("return; statement", () => {
    it("should exit script early on return", () => {
      const tv = createTv();
      const script = `
        tv.PowerOn();
        tv.SetChannel(3);
        return;
        tv.SetChannel(7);
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.IsOn).toBe(true);
      expect(tv.Channel).toBe(3);
    });

    it("should exit inside if branch on return", () => {
      const tv = createTv();
      tv.PowerOn();
      const script = `
        if (tv.IsOn) {
          tv.SetChannel(4);
          return;
        }
        tv.SetChannel(8);
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.Channel).toBe(4);
    });
  });

  describe("else if chains", () => {
    it("should execute matching else-if branch", () => {
      const tv = createTv();
      tv.PowerOn();
      tv.SetChannel(2);
      const script = `
        if (tv.Channel == 1) {
          tv.SetVolume(10);
        } else if (tv.Channel == 2) {
          tv.SetVolume(45);
        } else if (tv.Channel == 3) {
          tv.SetVolume(60);
        } else {
          tv.SetVolume(90);
        }
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.Volume).toBe(45);
    });

    it("should fall through to else if no branches match", () => {
      const tv = createTv();
      tv.PowerOn();
      tv.SetChannel(5);
      const script = `
        if (tv.Channel == 1) {
          tv.SetVolume(10);
        } else if (tv.Channel == 2) {
          tv.SetVolume(20);
        } else {
          tv.SetVolume(88);
        }
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.Volume).toBe(88);
    });
  });

  describe("for loop scope mutations", () => {
    it("should preserve outer variable mutations across iterations", () => {
      const tv = createTv();
      tv.PowerOn();
      const script = `
        int sum = 0;
        for (int i = 1; i <= 3; i++) {
          sum = sum + 10;
        }
        tv.SetVolume(sum);
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.Volume).toBe(30);
    });
  });

  describe("safeCall elvis operator for SetChannel and SetVolume", () => {
    it("should invoke SetChannel and SetVolume on valid instances", () => {
      const tv = createTv();
      tv.PowerOn();
      const script = `
        var myTv = new TV();
        myTv?.SetChannel(4);
        myTv?.SetVolume(35);
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.Channel).toBe(4);
      expect(tv.Volume).toBe(35);
    });

    it("should trigger safeguard and not crash on null instances", () => {
      const tv = createTv();
      tv.PowerOn();
      const script = `
        TV broken = null;
        broken?.SetChannel(4);
        broken?.SetVolume(35);
      `;
      const res = interpretScript(script, tv);
      expect(res.success).toBe(true);
      expect(tv.isSafeGuardActive()).toBe(true);
      expect(tv.Channel).toBe(1);
    });
  });
});
