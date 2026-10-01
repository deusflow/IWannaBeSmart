import React from "react";
import { ShieldAlert, Activity, Server, CheckCircle2 } from "lucide-react";
import type { RawLogLine } from "@iw/sim-engine";

interface TrafficStandProps {
  logs: RawLogLine[];
  selectedIp: string;
  blockedIp: string | null;
  isFalsePositive: boolean;
  onSelectIp: (ip: string) => void;
}

export const TrafficStand: React.FC<TrafficStandProps> = ({
  logs,
  selectedIp,
  blockedIp,
  isFalsePositive,
  onSelectIp,
}) => {
  // Compute basic stats
  const totalRequests = logs.length;
  const count401 = logs.filter((l) => l.statusCode === 401).length;
  const count200 = logs.filter((l) => l.statusCode === 200).length;

  return (
    <div className="w-full rounded-2xl bg-[#0D1017] border border-[#202636] p-4 text-white font-mono flex flex-col gap-3 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#202636] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
          <Activity size={15} />
          <span>SOC LIVE INGRESS TRAFFIC MONITOR</span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-zinc-400">100% INGRESS</span>
        </div>
      </div>

      {/* Traffic Summary Badges */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-[#141923] border border-[#252E40]">
          <span className="block text-[10px] text-zinc-400">Total Packets</span>
          <span className="font-bold text-white text-sm">{totalRequests}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#141923] border border-[#252E40]">
          <span className="block text-[10px] text-emerald-400">200 OK</span>
          <span className="font-bold text-emerald-400 text-sm">{count200}</span>
        </div>
        <div className="p-2 rounded-xl bg-[#141923] border border-[#252E40]">
          <span className="block text-[10px] text-rose-400">401 Auth Storm</span>
          <span className="font-bold text-rose-400 text-sm">{count401}</span>
        </div>
      </div>

      {/* Raw Log Terminal (Strictly uncolored, raw industrial look without clue highlights) */}
      <div className="space-y-1">
        <div className="text-[10px] text-zinc-400 flex justify-between items-center px-1">
          <span>RAW SYSLOG STREAM (Click row to target IP)</span>
          <span>HTTP STATUS</span>
        </div>
        <div className="h-48 overflow-y-auto rounded-xl bg-[#07090D] border border-[#1A202C] p-2 space-y-1 text-[11px] select-none">
          {logs.map((log) => {
            const isRowSelected = selectedIp === log.sourceIp;
            const isRowBlocked = blockedIp === log.sourceIp;

            return (
              <div
                key={log.id}
                onClick={() => onSelectIp(log.sourceIp)}
                className={`p-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-all ${
                  isRowBlocked
                    ? "bg-rose-950/40 border border-rose-500/50 line-through text-zinc-500"
                    : isRowSelected
                    ? "bg-blue-950/80 border border-blue-500 text-white shadow-xs"
                    : "hover:bg-white/5 border border-transparent text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-zinc-500 text-[10px]">{log.timestamp}</span>
                  <span className="text-zinc-400 font-bold">{log.method}</span>
                  <span className="text-zinc-300 truncate">{log.uri}</span>
                  <span className="text-zinc-200 font-bold">[{log.sourceIp}]</span>
                </div>
                <span className="font-bold shrink-0 pl-2">
                  {log.statusCode}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Target Status Bar */}
      <div className="p-2.5 rounded-xl bg-[#121620] border border-[#202737] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-zinc-400" />
          <span className="text-zinc-400">Target IP:</span>
          <span className="text-white font-bold">{selectedIp || "None selected"}</span>
        </div>

        {blockedIp && (
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
              isFalsePositive
                ? "bg-rose-950 text-rose-300 border border-rose-500"
                : "bg-emerald-950 text-emerald-300 border border-emerald-500"
            }`}
          >
            {isFalsePositive ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
            <span>{isFalsePositive ? "FALSE POSITIVE (SLA PENALTY)" : "FIREWALL BLOCKED"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
