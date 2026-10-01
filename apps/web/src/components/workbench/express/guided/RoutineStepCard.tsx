/**
 * @file apps/web/src/components/workbench/express/guided/RoutineStepCard.tsx
 * @description Honest Routine step card for Career Speed-Dating.
 * Qualitative presentation of real daily routine without fake statistics.
 */

import React from "react";
import { Coffee, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RoleTasterDefinition } from "@iw/sim-engine";

interface RoutineStepCardProps {
  role: RoleTasterDefinition;
  isLastRole: boolean;
  onNext: () => void;
}

export const RoutineStepCard: React.FC<RoutineStepCardProps> = ({
  role,
  isLastRole,
  onNext,
}) => {
  const { t } = useTranslation();

  return (
    <div
      id="express-routine-card"
      className="max-w-2xl mx-auto w-full p-6 sm:p-8 rounded-3xl bg-white border border-[#1E2227]/15 shadow-xl space-y-6 animate-in fade-in duration-300 select-none"
    >
      <div className="flex items-center justify-between border-b border-[#1E2227]/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#C86D32]/10 text-[#C86D32]">
            <Coffee size={20} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#C86D32] uppercase tracking-wider block">
              {t("taster.stepRoutineBadge", "КРОК 5: ЧЕСТНА РУТИНА")}
            </span>
            <h3 className="font-display font-extrabold text-base text-[#1E2227]">
              {t(role.roleTitleKey)}
            </h3>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Завдання пройдено</span>
        </span>
      </div>

      <div className="space-y-3">
        <h4 className="font-display font-bold text-sm text-[#1E2227]/90">
          {t("taster.routineHeader", "Непарадна рутина професії:")}
        </h4>
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1E2227]/10 text-sm font-sans text-[#1E2227]/85 leading-relaxed">
          {t(role.routineFactKey)}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs font-sans text-[#1E2227]/75 flex items-start gap-2.5">
        <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <p>
          Тест-драйв показав лише концентроване ядро. Реальна кар'єра вимагає терпіння до рутинного читання документації, рев'ю коду та спокійного пошуку помилок.
        </p>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <span>
            {isLastRole
              ? t("taster.routineToFinaleBtn", "До підсумків тесту ➔")
              : t("taster.routineNextRoleBtn", "До наступної ролі ➔")}
          </span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
