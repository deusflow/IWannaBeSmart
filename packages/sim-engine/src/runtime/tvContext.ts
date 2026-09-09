/**
 * @file packages/sim-engine/src/runtime/tvContext.ts
 * @description Virtual TV Execution Environment with tracked mutations and idiomatic C#/Go APIs
 */

import type { VirtualTvState, RuntimeLogEntry } from "./types";

export class VirtualTV {
  private _isOn: boolean;
  private _channel: number;
  private _volume: number;
  private _osdMessage?: string;
  private _logs: RuntimeLogEntry[] = [];
  private _mutationsCount = 0;

  constructor(initial: VirtualTvState) {
    this._isOn = initial.isOn;
    this._channel = initial.channel;
    this._volume = initial.volume;
    this._osdMessage = initial.osdMessage;
  }

  // ── Property: IsOn ──────────────────────────────────────────
  get IsOn(): boolean {
    return this._isOn;
  }
  set IsOn(val: boolean) {
    if (this._isOn !== val) {
      this._isOn = Boolean(val);
      this._mutationsCount++;
      this._logs.push({
        type: "mutation",
        message: `tv.IsOn = ${this._isOn ? "true" : "false"}`,
      });
      this._osdMessage = this._isOn ? "POWER ON" : "STANDBY";
    }
  }

  get isOn(): boolean {
    return this.IsOn;
  }
  set isOn(val: boolean) {
    this.IsOn = val;
  }

  // ── Property: Channel ───────────────────────────────────────
  get Channel(): number {
    return this._channel;
  }
  set Channel(val: number) {
    const num = Math.max(1, Math.min(99, Math.floor(Number(val))));
    if (this._channel !== num) {
      this._channel = num;
      this._mutationsCount++;
      this._logs.push({
        type: "mutation",
        message: `tv.Channel = ${this._channel}`,
      });
      this._osdMessage = `CH ${this._channel}`;
    }
  }

  get channel(): number {
    return this.Channel;
  }
  set channel(val: number) {
    this.Channel = val;
  }

  // ── Property: Volume ────────────────────────────────────────
  get Volume(): number {
    return this._volume;
  }
  set Volume(val: number) {
    const num = Math.max(0, Math.min(100, Math.floor(Number(val))));
    if (this._volume !== num) {
      this._volume = num;
      this._mutationsCount++;
      this._logs.push({
        type: "mutation",
        message: `tv.Volume = ${this._volume}`,
      });
      this._osdMessage = `VOL ${this._volume}`;
    }
  }

  get volume(): number {
    return this.Volume;
  }
  set volume(val: number) {
    this.Volume = val;
  }

  // ── Methods ────────────────────────────────────────────────
  public PowerOn(): void {
    this.IsOn = true;
  }

  public powerOn(): void {
    this.PowerOn();
  }

  public PowerOff(): void {
    this.IsOn = false;
  }

  public powerOff(): void {
    this.PowerOff();
  }

  public TogglePower(): void {
    this.IsOn = !this._isOn;
  }

  public togglePower(): void {
    this.TogglePower();
  }

  public SetChannel(ch: number): void {
    this.Channel = ch;
  }

  public setChannel(ch: number): void {
    this.SetChannel(ch);
  }

  public SetVolume(vol: number): void {
    this.Volume = vol;
  }

  public setVolume(vol: number): void {
    this.SetVolume(vol);
  }

  // ── Diagnostics & Snapshot ─────────────────────────────────
  public getSnapshot(): VirtualTvState {
    return {
      isOn: this._isOn,
      channel: this._channel,
      volume: this._volume,
      osdMessage: this._osdMessage,
    };
  }

  public getLogs(): RuntimeLogEntry[] {
    return [...this._logs];
  }

  public getMutationsCount(): number {
    return this._mutationsCount;
  }
}
