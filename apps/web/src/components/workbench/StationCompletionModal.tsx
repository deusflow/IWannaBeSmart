/**
 * @file apps/web/src/components/workbench/StationCompletionModal.tsx
 * @description Station Victory Modal & Engineering Skill Mastery Matrix for Module 1
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Award, Download, ArrowRight, X, Sparkles, Layers } from "lucide-react";
import { audioFx } from "../../utils/audioFx";

interface StationCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
}

interface SkillItem {
  id: string;
  nameKey: string;
  codeExample: string;
  categoryKey: string;
}

const SKILL_MATRIX: SkillItem[] = [
  {
    id: "method-invocation",
    nameKey: "victoryModal.skills.methodInvocation",
    codeExample: "tv.PowerOn();",
    categoryKey: "victoryModal.categories.fundamentals",
  },
  {
    id: "type-signatures",
    nameKey: "victoryModal.skills.typeSignatures",
    codeExample: 'tv.SetChannel(1); tv.SetLabel("NEWS");',
    categoryKey: "victoryModal.categories.fundamentals",
  },
  {
    id: "sequential-flow",
    nameKey: "victoryModal.skills.sequentialFlow",
    codeExample: "tv.PowerOn(); tv.SetChannel(1);",
    categoryKey: "victoryModal.categories.fundamentals",
  },
  {
    id: "state-mutation",
    nameKey: "victoryModal.skills.stateMutation",
    codeExample: "tv.IsOn = true; tv.Channel++;",
    categoryKey: "victoryModal.categories.fundamentals",
  },
  {
    id: "control-flow",
    nameKey: "victoryModal.skills.controlFlow",
    codeExample: "if (ch <= 4) { tv.Channel = ch; }",
    categoryKey: "victoryModal.categories.controlFlow",
  },
  {
    id: "async-loops",
    nameKey: "victoryModal.skills.asyncLoops",
    codeExample: "for (int i = 1; i <= 4; i++)",
    categoryKey: "victoryModal.categories.controlFlow",
  },
  {
    id: "encapsulation",
    nameKey: "victoryModal.skills.encapsulation",
    codeExample: "void Mute() { tv.Volume = 0; }",
    categoryKey: "victoryModal.categories.architecture",
  },
  {
    id: "anti-pattern",
    nameKey: "victoryModal.skills.antiPattern",
    codeExample: "Refactored: Monolithic God Switch",
    categoryKey: "victoryModal.categories.architecture",
  },
  {
    id: "polymorphism",
    nameKey: "victoryModal.skills.polymorphism",
    codeExample: "IRemoteCommand.Execute()",
    categoryKey: "victoryModal.categories.architecture",
  },
  {
    id: "ioc-di",
    nameKey: "victoryModal.skills.iocDi",
    codeExample: "services.AddTransient<IRemoteCommand, ...>()",
    categoryKey: "victoryModal.categories.advanced",
  },
  {
    id: "command-registry",
    nameKey: "victoryModal.skills.commandRegistry",
    codeExample: "registry[button].Execute() // Open/Closed",
    categoryKey: "victoryModal.categories.advanced",
  },
];

export const StationCompletionModal: React.FC<StationCompletionModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const [displayXp, setDisplayXp] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    audioFx.playSuccessFanfare();

    // Animated count up for XP
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = Math.ceil(xp / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= xp) {
        setDisplayXp(xp);
        clearInterval(timer);
      } else {
        setDisplayXp(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isOpen, xp]);

  if (!isOpen) return null;

  const handleExportSummary = () => {
    const summaryText = `═══════════════════════════════════════════════════════
  INTERACTIVE WORKBENCH: ENGINEERING CERTIFICATE
  МОДУЛЬ 1: ТЕЛЕВІЗІЙНА СТАНЦІЯ — УСПІШНО ЗАВЕРШЕНО!
═══════════════════════════════════════════════════════

Загальний досвід: ${xp} XP
Виконано: 13/13 завдань (3 Ранги: Основи, Логіка, Архітектура)
Освоєні архітектурні патерни (11/11):
  1. [✓] Method Invocation & Direct Calling (tv.PowerOn())
  2. [✓] Type Contracts & Signatures (int vs string)
  3. [✓] Sequential Execution Flow (Power → Channel → Volume)
  4. [✓] State & Mutation (tv.IsOn, tv.Channel)
  5. [✓] Control Flow & Guard Clauses (if/else, boundary checks)
  6. [✓] Asynchronous Execution & Loops (for scanning, async/await)
  7. [✓] Encapsulation & Functions (void Mute() / func Mute())
  8. [✓] Anti-pattern Diagnosis (God Switch / OCP Violation)
  9. [✓] Polymorphism & Contracts (IRemoteCommand.Execute())
  10. [✓] Inversion of Control & DI Container (services.AddTransient)
  11. [✓] Command Registry & Extensibility (registry[button].Execute())

Статус: CERTIFIED ARCHITECT GRADE I
═══════════════════════════════════════════════════════`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#EFE9DC] text-[#1A1D20] rounded-3xl border-2 border-[#1A1D20]/30 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1A1D20]/10 hover:bg-[#1A1D20]/20 text-[#1A1D20] transition-colors cursor-pointer"
          aria-label="Закрити"
        >
          <X size={18} />
        </button>

        {/* Top Blueprint Victory Stamp */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/15 border-2 border-emerald-700/40 text-emerald-800 font-mono font-extrabold text-xs uppercase tracking-widest shadow-xs">
            <Sparkles size={14} className="animate-spin" />
            <span>{t("victoryModal.stampBadge", "СТАНЦІЮ ЗАВЕРШЕНО • ВСІ 13 ЗАВДАНЬ ВИКОНАНО")}</span>
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            {t("victoryModal.title", "МОДУЛЬ 1: ТЕЛЕВІЗІЙНА СТАНЦІЯ")}
          </h2>

          <p className="font-balsamiq text-xs sm:text-sm text-[#1A1D20]/80 max-w-md mx-auto leading-relaxed">
            {t(
              "victoryModal.subtitle",
              "Ви успішно пройшли шлях від процедурного коду до архітектури інтерфейсів, контейнера залежностей та реєстру команд!"
            )}
          </p>
        </div>

        {/* XP Total Highlight Box */}
        <div className="p-4 rounded-2xl bg-[#E6DFCE] border border-[#1A1D20]/20 flex items-center justify-between gap-4 shadow-paper-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-700">
              <Award size={24} />
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#1A1D20]/60 uppercase font-bold">
                {t("victoryModal.totalXpLabel", "Загальний баланс досвіду")}
              </div>
              <div className="font-display font-black text-2xl sm:text-3xl text-[#1A1D20]">
                +{displayXp} XP
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 justify-end">
              <CheckCircle2 size={13} />
              100% Автоматизм
            </span>
            <span className="text-[10px] font-mono text-[#1A1D20]/50">
              Модуль 1 атестовано
            </span>
          </div>
        </div>

        {/* Skill Mastery Matrix (8 Core Competencies) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#1A1D20]/15 pb-1.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1A1D20]">
              <Layers size={14} />
              <span>{t("victoryModal.matrixTitle", "Інженерна матриця навичок (Skill Mastery Matrix)")}</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">
              8 / 8 Освоєно
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SKILL_MATRIX.map((skill) => (
              <div
                key={skill.id}
                className="p-2.5 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-2.5 shadow-xs"
              >
                <div className="w-5 h-5 rounded-md bg-emerald-600/20 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-xs text-[#1A1D20] truncate">
                    {t(skill.nameKey)}
                  </div>
                  <div className="font-mono text-[10px] text-[#1A1D20]/60 font-semibold truncate">
                    {skill.codeExample}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleExportSummary}
            className="px-4 py-2.5 rounded-xl bg-[#E2DAC8] hover:bg-[#D8CEB8] active:scale-95 text-[#1A1D20] border border-[#1A1D20]/30 font-display font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>
              {copied
                ? t("victoryModal.copiedBtn", "✓ Сертифікат скопійовано!")
                : t("victoryModal.exportSummaryBtn", "Експортувати підсумок")}
            </span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#1A1D20] hover:bg-black active:scale-95 text-white font-display font-bold text-xs flex items-center gap-2 shadow-lg shadow-black/25 transition-all cursor-pointer"
          >
            <span>{t("victoryModal.continueBtn", "Завершити модуль")}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
