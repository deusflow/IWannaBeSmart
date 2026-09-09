/**
 * @file apps/web/src/utils/audioFx.ts
 * @description Procedural Web Audio API sound synthesizer for tactile feedback
 * Zero external audio files — synthesized live with Web Audio API oscillators, noise bursts, and biquad filters.
 */

class AudioFxEngine {
  private ctx: AudioContext | null = null;
  private _isMuted: boolean = false;

  constructor() {
    // Read persisted sound setting if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("iw_audio_muted");
      this._isMuted = saved === "true";
    }
  }

  /**
   * Lazily initialize AudioContext on user interaction to comply with browser autoplay policies
   */
  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {
        // Safe catch if still blocked
      });
    }

    return this.ctx;
  }

  public getMuted(): boolean {
    return this._isMuted;
  }

  public isMuted(): boolean {
    return this.getMuted();
  }

  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("iw_audio_muted", String(muted));
    }
  }

  public toggleMuted(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  public toggleMute(): boolean {
    return this.toggleMuted();
  }

  /**
   * Sharp metallic relay switch click (Power Toggle / Relay trip)
   */
  public playRelayClick(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 1. Initial mechanical high-frequency metallic transient (15ms)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.025);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.03);

    // 2. Low-frequency thud of the armature latching (60Hz mechanical thump)
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(95, t + 0.005);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.045);

    thudGain.gain.setValueAtTime(0.4, t + 0.005);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(t + 0.005);
    thud.stop(t + 0.055);
  }

  /**
   * Low-frequency kinescope CRT degauss surge & 50Hz capacitor charge
   */
  public playCrtHum(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Degauss coil surge: 60Hz down to 40Hz with rich harmonic content
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(75, t);
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.35);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(90, t + 0.35);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  /**
   * Subtle IR Remote 38 kHz chirp (subtle pleasant high-pitch digital blip)
   */
  public playRemoteBeep(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(2800, t + 0.03);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  /**
   * Delightful major chord fanfare on task/level completion (C5 - E5 - G5 - C6)
   */
  public playSuccessFanfare(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    // C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.075;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.42);
    });
  }

  /**
   * Muted error buzz for syntax errors or runtime NullReferenceException
   */
  public playErrorBuzz(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.setValueAtTime(110, t + 0.07);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Procedural thermal printer line-feed sound (stepper motor + thermal pin pulses)
   */
  public playPrinterSound(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const pulses = 10;
    const stepInterval = 0.07; // 70ms per line feed

    for (let i = 0; i < pulses; i++) {
      const startTime = t + i * stepInterval;

      // 1. Stepper motor step transient
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(620 + (i % 3) * 40, startTime);
      osc.frequency.exponentialRampToValueAtTime(180, startTime + 0.035);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, startTime);
      filter.Q.setValueAtTime(3.0, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.045);
    }
  }

  /**
   * Procedural emergency lockout alarm (two-tone warning siren)
   */
  public playAlarmSound(): void {
    if (this._isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const tones = [880, 587, 880, 587, 880, 587];

    tones.forEach((freq, idx) => {
      const startTime = t + idx * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.16, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.135);
    });
  }
}

export const audioFx = new AudioFxEngine();
