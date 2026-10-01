import React from "react";
import { Swords, Heart, Shield, Timer, Trophy } from "lucide-react";
import type { DuelParams, DuelSimulationSummary } from "@iw/sim-engine";

interface DuelArenaStandProps {
  params: DuelParams;
  lastSimResult: DuelSimulationSummary | null;
}

export const DuelArenaStand: React.FC<DuelArenaStandProps> = ({
  params,
  lastSimResult,
}) => {
  const winRatePercent = lastSimResult
    ? Math.round(lastSimResult.winRate * 100)
    : 0;

  return (
    <div className="w-full rounded-2xl bg-[#13111C] border border-[#2D2640] p-4 text-white font-mono flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#2D2640] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
          <Swords size={15} />
          <span>COMBAT BALANCE & TTK SIMULATOR</span>
        </div>
        <span className="text-[10px] text-zinc-400 bg-[#1D192B] px-2 py-0.5 rounded">
          DEVSPEC ARENA
        </span>
      </div>

      {/* Duel Combatants Display */}
      <div className="grid grid-cols-2 gap-3">
        {/* Player Box */}
        <div className="p-3 rounded-xl bg-[#1A1626] border border-[#372E50] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-sky-300">
            <span>HERO (PLAYER)</span>
            <Heart size={14} className="text-rose-500 fill-rose-500" />
          </div>
          <div className="text-[11px] space-y-1 text-zinc-300">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="font-bold text-white">150</span>
            </div>
            <div className="flex justify-between">
              <span>Armor:</span>
              <span className="font-bold text-sky-400">{params.playerArmor ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Potions:</span>
              <span className="font-bold text-amber-300">
                {params.potionCount}x (+{params.potionHeal} HP)
              </span>
            </div>
          </div>
        </div>

        {/* Boss Box */}
        <div className="p-3 rounded-xl bg-[#22151B] border border-[#4D2635] space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-rose-300">
            <span>RAID BOSS</span>
            <Shield size={14} className="text-rose-500" />
          </div>
          <div className="text-[11px] space-y-1 text-zinc-300">
            <div className="flex justify-between">
              <span>HP:</span>
              <span className="font-bold text-white">300</span>
            </div>
            <div className="flex justify-between">
              <span>Damage:</span>
              <span className="font-bold text-rose-400">{params.bossDamage}</span>
            </div>
            <div className="flex justify-between">
              <span>Cooldown:</span>
              <span className="font-bold text-zinc-400">{params.bossCooldownSec}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Automated Simulation Metrics Dashboard */}
      {lastSimResult && (
        <div className="p-3 rounded-xl bg-[#0E0C14] border border-[#262035] space-y-2">
          <div className="text-[10px] text-zinc-400 uppercase tracking-wider flex justify-between">
            <span>SIMULATION RESULTS ({lastSimResult.totalBattles} BATTLES)</span>
            <span className={lastSimResult.passed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {lastSimResult.passed ? "✓ TARGET ACHIEVED" : "⚠ OUT OF BALANCE"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Win Rate */}
            <div className="p-2 rounded-lg bg-[#181424] border border-[#2F2745] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy size={14} className={winRatePercent >= 45 && winRatePercent <= 55 ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-zinc-300 text-[11px]">Win Rate:</span>
              </div>
              <span
                className={`font-bold ${
                  winRatePercent >= 45 && winRatePercent <= 55 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {winRatePercent}% <span className="text-[9px] text-zinc-500">(45-55%)</span>
              </span>
            </div>

            {/* Average TTK Duration */}
            <div className="p-2 rounded-lg bg-[#181424] border border-[#2F2745] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Timer size={14} className={lastSimResult.avgBattleDurationSec >= 10 && lastSimResult.avgBattleDurationSec <= 15 ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-zinc-300 text-[11px]">Avg TTK:</span>
              </div>
              <span
                className={`font-bold ${
                  lastSimResult.avgBattleDurationSec >= 10 && lastSimResult.avgBattleDurationSec <= 15
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {lastSimResult.avgBattleDurationSec}s <span className="text-[9px] text-zinc-500">(10-15s)</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
