/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedArchitectureLayer.tsx
 * @description Layer 4: Architecture map, interfaces, implementations, and canvas integration.
 */

import React from "react";
import { Network } from "lucide-react";
import type { TFunction } from "i18next";
import type { TaskDidacticInfo } from "../taskDidacticContext";

export interface GuidedArchitectureLayerProps {
  didactic?: TaskDidacticInfo;
  t: TFunction;
  onOpenArchitectureStudio?: () => void;
}

export const GuidedArchitectureLayer: React.FC<GuidedArchitectureLayerProps> = ({
  didactic,
  t,
  onOpenArchitectureStudio,
}) => {
  if (!didactic?.architectureMap) return null;

  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-600/10 border border-purple-600/25">
        <Network size={11} className="text-purple-800" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-purple-900">
          {t("guide.architectureMapTitle", "Архітектурна карта зв'язків (Architecture Map)")}
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/20 space-y-2.5">
        <div className="font-display font-bold text-xs text-[#1A1D20]">
          {didactic.architectureMap.architectureHint}
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          {didactic.architectureMap.contractFile && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
              <span className="text-purple-700 font-bold">📄 {t("architecture.interfaceLabel", "Інтерфейс")}:</span>
              <code className="text-[#1A1D20]">{didactic.architectureMap.contractFile}</code>
            </div>
          )}
          {didactic.architectureMap.implementationFile && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
              <span className="text-emerald-700 font-bold">⚙️ {t("architecture.implementationLabel", "Реалізація")}:</span>
              <code className="text-[#1A1D20]">{didactic.architectureMap.implementationFile}</code>
            </div>
          )}
          {didactic.architectureMap.clientFile && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#EBE5D8] border border-[#1A1D20]/15">
              <span className="text-blue-700 font-bold">🔌 {t("architecture.dispatcherLabel", "Диспетчер")}:</span>
              <code className="text-[#1A1D20]">{didactic.architectureMap.clientFile}</code>
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-600/25 text-[11px] font-mono text-purple-950">
          <strong>{t("architecture.canvasNodeLabel", "Нода на полотні")}:</strong> {didactic.architectureMap.canvasWiring}
        </div>

        {onOpenArchitectureStudio && (
          <button
            onClick={onOpenArchitectureStudio}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1A1D20] text-white font-display font-bold text-xs hover:bg-black transition-colors cursor-pointer shadow-sm"
          >
            <Network size={13} />
            <span>{t("guide.switchStudioBtn", "Перейти до Architecture Studio")}</span>
          </button>
        )}
      </div>
    </div>
  );
};
