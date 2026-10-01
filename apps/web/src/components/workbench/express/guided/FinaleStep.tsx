/**
 * @file apps/web/src/components/workbench/express/guided/FinaleStep.tsx
 * @description Finale summary screen for Career Speed-Dating.
 * Objective platform signals, subjective 1-5 self-assessments, and track routing.
 */

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROLE_TASTER_REGISTRY } from "@iw/sim-engine";
import { useWorkbenchStore } from "../../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { audioFx } from "../../../../utils/audioFx";
import type { CareerTrack } from "../../../../store/types";

export interface RoleSessionTelemetry {
  timeSec: number;
  attempts: number;
  hintsUsedCount: number;
  solutionRevealed: boolean;
  passedIndependently: boolean;
  continueRating?: number;
  boringRating?: number;
}

interface FinaleStepProps {
  selectedRoleIds: string[];
  telemetry: Record<string, RoleSessionTelemetry>;
  onUpdateRating: (roleId: string, key: "continueRating" | "boringRating", value: number) => void;
  onClose: () => void;
}

export const FinaleStep: React.FC<FinaleStepProps> = ({
  selectedRoleIds,
  telemetry,
  onUpdateRating,
  onClose,
}) => {
  const { t } = useTranslation();
  const { setUserTrack, setCurrentStationId, setCurrentView } = useWorkbenchStore(
    useShallow((s) => ({
      setUserTrack: s.setUserTrack,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
    }))
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2227] flex flex-col font-sans select-none p-4 sm:p-8">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#1E2227]/15">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#1E2227]/20 font-mono font-bold text-xs hover:bg-[#FAF8F2] active:scale-95 transition-all shadow-paper-xs"
        >
          <ArrowLeft size={14} className="text-[#C86D32]" />
          <span>{t("taster.exitToHub", "До верстака / Hub")}</span>
        </button>
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
          {selectedRoleIds.length} OF {selectedRoleIds.length} COMPLETED
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1E2227]">
            {t("taster.finale.title", "Підсумки Career Speed-Dating")}
          </h1>
          <p className="text-sm text-[#1E2227]/75 max-w-xl mx-auto">
            {t("taster.finale.subtitle", "Об'єктивні сигнали та спостереження за твоєю роботою.")}
          </p>
        </div>

        {/* Results Summary per Role */}
        <div className="space-y-4">
          {selectedRoleIds.map((roleId) => {
            const rDef = ROLE_TASTER_REGISTRY.find((r) => r.id === roleId);
            const data = telemetry[roleId] || {
              timeSec: 45,
              attempts: 1,
              hintsUsedCount: 0,
              solutionRevealed: false,
              passedIndependently: true,
            };
            if (!rDef) return null;

            return (
              <div
                key={roleId}
                className="p-5 rounded-2xl bg-white border border-[#1E2227]/15 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1E2227]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[#1E2227]">
                      {t(rDef.roleTitleKey)}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        data.passedIndependently
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {data.passedIndependently
                        ? t("taster.solSelfBadge", "Пройдено самостійно")
                        : t("taster.solAssistedBadge", "Використано розв'язок")}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#1E2227]/70">
                    <span>
                      {t("taster.finale.metricTime", "Час")}:{" "}
                      <strong>
                        {Math.floor(data.timeSec / 60)}хв {data.timeSec % 60}с
                      </strong>
                    </span>
                    <span>
                      {t("taster.finale.metricAttempts", "Спроб")}: <strong>{data.attempts}</strong>
                    </span>
                    <span>
                      {t("taster.finale.metricHints", "Підказок")}: <strong>{data.hintsUsedCount}/3</strong>
                    </span>
                  </div>
                </div>

                {/* Objective Signal */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#1E2227]/10 text-xs font-sans text-[#1E2227]/85 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#C86D32] uppercase">
                    {t("taster.finale.signalHeading", "Об'єктивний сигнал платформи:")}
                  </span>
                  <p>
                    {data.passedIndependently && data.attempts === 1
                      ? "Завдання вирішено з першої спроби без відкриття готового рішення. Ти впевнено відчуваєш базову логіку цієї дисципліни."
                      : data.passedIndependently
                      ? "Завдання вирішено самостійно, знадобилося кілька спроб для вирівнювання крайових умов."
                      : "Використано підказку з розв'язком — це нормально для першого знайомства з незвичним синтаксисом або форматом логів."}
                  </p>
                </div>

                {/* Self Assessment (1-5) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#1E2227]/80 block font-sans">
                      {t("taster.finale.questionContinue", "Хотілося продовжувати цю задачу?")}
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => onUpdateRating(roleId, "continueRating", score)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                            data.continueRating === score
                              ? "bg-[#C86D32] text-white shadow-xs"
                              : "bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 hover:bg-white"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[#1E2227]/80 block font-sans">
                      {t("taster.finale.questionBoring", "Було нудно або втомливо?")}
                    </label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => onUpdateRating(roleId, "boringRating", score)}
                          className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-all ${
                            data.boringRating === score
                              ? "bg-[#1E2227] text-white shadow-xs"
                              : "bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 hover:bg-white"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Career Track Destination CTA */}
                <div className="pt-3 border-t border-[#1E2227]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#1E2227]/60 block font-mono">
                      {t("taster.finale.readyToStartTrack", "Рекомендований стартовий трек:")}
                    </span>
                    <strong className="text-xs text-[#1E2227] font-mono">
                      {rDef.targetTrack.toUpperCase()} TRACK
                    </strong>
                  </div>

                  {rDef.targetStationId !== null ? (
                    <button
                      type="button"
                      onClick={() => {
                        audioFx.playSuccessFanfare();
                        setUserTrack(rDef.targetTrack as CareerTrack);
                        setCurrentStationId(rDef.targetStationId as string);
                        setCurrentView("STATION");
                      }}
                      className="px-5 py-2 rounded-xl bg-[#1E2227] hover:bg-black text-white font-mono font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{t("taster.finale.startTrackBtn", "Перейти до треку станцій ➔")}</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-bold">
                        {t("taster.finale.comingSoonBadge", "Трек у розробці (незабаром)")}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          audioFx.playRelayClick();
                          setUserTrack("explorer");
                          setCurrentView("HUB");
                        }}
                        className="px-4 py-1.5 rounded-xl bg-white border border-[#1E2227]/20 text-xs font-mono font-bold text-[#1E2227] hover:bg-[#FAF8F2] active:scale-95 transition-all cursor-pointer"
                      >
                        {t("taster.finale.exploreOtherBtn", "Переглянути всі станції (Explorer) ➔")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              audioFx.playRelayClick();
              setCurrentView("HUB");
            }}
            className="px-6 py-2.5 rounded-xl border border-[#1E2227]/25 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs"
          >
            {t("taster.exitToHub", "До верстака / Hub")}
          </button>
        </div>
      </main>
    </div>
  );
};
