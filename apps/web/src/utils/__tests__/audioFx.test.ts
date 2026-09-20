import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { audioFx } from "../audioFx";

describe("audioFx sound engine", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
    const storageMock = {
      getItem: vi.fn((k: string) => mockStorage[k] ?? null),
      setItem: vi.fn((k: string, v: string) => {
        mockStorage[k] = v;
      }),
      removeItem: vi.fn((k: string) => {
        delete mockStorage[k];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
    };

    vi.stubGlobal("window", {
      localStorage: storageMock,
      AudioContext: undefined,
    });
    vi.stubGlobal("localStorage", storageMock);

    audioFx.setMuted(false);
    audioFx.setVolume(0.7);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should initialize with default volume and mute states", () => {
    expect(audioFx.getVolume()).toBe(0.7);
    expect(audioFx.isMuted()).toBe(false);
  });

  it("should toggle and set mute state, updating localStorage", () => {
    expect(audioFx.toggleMute()).toBe(true);
    expect(audioFx.isMuted()).toBe(true);
    expect(mockStorage["iw_audio_muted"]).toBe("true");

    audioFx.setMuted(false);
    expect(audioFx.isMuted()).toBe(false);
    expect(mockStorage["iw_audio_muted"]).toBe("false");
  });

  it("should set and clamp master volume within [0, 1] range", () => {
    audioFx.setVolume(0.5);
    expect(audioFx.getVolume()).toBe(0.5);
    expect(mockStorage["iw_audio_volume"]).toBe("0.5");

    // Clamping checks
    audioFx.setVolume(1.8);
    expect(audioFx.getVolume()).toBe(1.0);

    audioFx.setVolume(-0.3);
    expect(audioFx.getVolume()).toBe(0.0);
  });

  it("should safely invoke sound effects without uncaught exceptions", () => {
    expect(() => {
      audioFx.playRelayClick();
      audioFx.playKeyClick();
      audioFx.playRemoteBeep();
      audioFx.playCrtHum();
      audioFx.playSuccessFanfare();
      audioFx.playErrorBuzz();
      audioFx.playPrinterSound();
      audioFx.playAlarmSound();
    }).not.toThrow();
  });
});

