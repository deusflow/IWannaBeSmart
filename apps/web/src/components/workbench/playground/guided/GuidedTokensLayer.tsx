/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedTokensLayer.tsx
 * @description Layer 5: Token anatomy and syntax decomposition.
 */

import React from "react";
import { Layers } from "lucide-react";

export interface GuidedTokensLayerProps {
  tokens: Array<{ token: string; role: string; explanation: string }>;
  t: (key: string, defaultVal?: any) => string;
}

export const GuidedTokensLayer: React.FC<GuidedTokensLayerProps> = ({
  tokens,
  t,
}) => {
  if (!tokens || tokens.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1A1D20]/8 border border-[#1A1D20]/15">
        <Layers size={11} className="text-[#1A1D20]/70" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#1A1D20]/70">
          {t("theory.tokensTitle", "Анатомія по токенах (Token Breakdown)")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {tokens.map((tok, idx) => (
          <div
            key={idx}
            className="p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-0.5 shadow-2xs"
          >
            <div className="flex items-center justify-between gap-1">
              <code className="px-1.5 py-0.2 rounded bg-[#181A1E] text-emerald-400 font-mono text-[11px] font-bold">
                {tok.token}
              </code>
              <span className="text-[9px] font-mono font-bold uppercase text-[#1A1D20]/60 truncate">
                {tok.role}
              </span>
            </div>
            <p className="text-[11px] font-sans text-[#1A1D20]/85 leading-snug">
              {tok.explanation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
