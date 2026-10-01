/**
 * @file apps/web/src/components/workbench/express/guided/CatalogStep.tsx
 * @description Catalog screen for choosing roles in Career Speed-Dating.
 */

import React from "react";
import { ArrowLeft, CheckCircle2, Cpu, Shield, Swords } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROLE_TASTER_REGISTRY } from "@iw/sim-engine";

interface CatalogStepProps {
  selectedRoleIds: string[];
  onToggleRole: (roleId: string) => void;
  onSelectContrasting: () => void;
  onStart: () => void;
  onClose: () => void;
}

export const CatalogStep: React.FC<CatalogStepProps> = ({
  selectedRoleIds,
  onToggleRole,
  onSelectContrasting,
  onStart,
  onClose,
}) => {
  const { t } = useTranslation();

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
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-[#C86D32]/15 text-[#C86D32] border border-[#C86D32]/30 uppercase">
          {t("taster.badge", "CAREER SCOUT")}
        </span>
      </header>

      <main className="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#1E2227]">
            {t("taster.catalogTitle", "Обери до 3 професій для тест-драйву")}
          </h1>
          <p className="text-sm text-[#1E2227]/75 max-w-xl mx-auto">
            {t("taster.catalogSubtitle", "Спробуй ядро кожної ролі на реальних мікро-задачах за 15 хвилин.")}
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {ROLE_TASTER_REGISTRY.map((role) => {
            const isSelected = selectedRoleIds.includes(role.id);
            const categoryLabel =
              role.category === "build"
                ? t("taster.categoryBuild", "Будуєш")
                : role.category === "investigate"
                ? t("taster.categoryInvestigate", "Шукаєш і захищаєш")
                : t("taster.categoryBalance", "Налаштовуєш");

            return (
              <div
                key={role.id}
                onClick={() => onToggleRole(role.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                  isSelected
                    ? "bg-white border-[#C86D32] shadow-md ring-2 ring-[#C86D32]/20"
                    : "bg-white/70 border-[#1E2227]/15 hover:border-[#1E2227]/40 hover:bg-white"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FAF8F2] border border-[#1E2227]/15 text-[#1E2227]/70 uppercase">
                      {categoryLabel}
                    </span>
                    {isSelected && <CheckCircle2 size={18} className="text-[#C86D32]" />}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {role.id === "role-backend" && <Cpu size={22} className="text-[#C86D32]" />}
                    {role.id === "role-cyber" && <Shield size={22} className="text-emerald-700" />}
                    {role.id === "role-gamedesign" && <Swords size={22} className="text-purple-700" />}
                    <h3 className="font-display font-bold text-sm text-[#1E2227]">
                      {t(role.roleTitleKey)}
                    </h3>
                  </div>

                  <p className="text-xs text-[#1E2227]/70 line-clamp-3">
                    {t(role.mentorIntroKey)}
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#1E2227]/10 mt-3 text-[11px] font-mono">
                  <span className="text-[#1E2227]/50">~4,5 хв</span>
                  <span className={`font-bold ${isSelected ? "text-[#C86D32]" : "text-[#1E2227]/60"}`}>
                    {isSelected ? "Обрано" : "Обрати +"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E2227]/15">
          <button
            type="button"
            onClick={onSelectContrasting}
            className="px-4 py-2.5 rounded-xl border border-[#1E2227]/25 bg-white hover:bg-[#FAF8F2] text-xs font-mono font-bold text-[#1E2227] transition-all cursor-pointer shadow-paper-xs"
          >
            {t("taster.dontKnowBtn", "Не знаю (Дати 3 контрастні ролі)")}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#1E2227]/60">
              {t("taster.selectedCount", { count: selectedRoleIds.length })}
            </span>
            <button
              type="button"
              onClick={onStart}
              disabled={selectedRoleIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-[#C86D32] hover:bg-[#B35E28] active:scale-95 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t("taster.startTastingBtn", "Розпочати Speed-Dating →")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
