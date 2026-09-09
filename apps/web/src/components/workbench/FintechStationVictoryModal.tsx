/**
 * @file apps/web/src/components/workbench/FintechStationVictoryModal.tsx
 * @description Fintech POS Terminal Module 2 Victory Modal with Commercial Skill Matrix
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Award,
  Download,
  ArrowRight,
  X,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Check,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";

interface FintechStationVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
}

interface SkillItem {
  id: string;
  nameKey: string;
  codeExample: string;
  category: string;
}

const FINTECH_SKILLS: SkillItem[] = [
  {
    id: "guard-clauses",
    nameKey: "fintechVictoryModal.skills.guardClauses",
    codeExample: 'if (amount > balance) { status = "DECLINED"; return; }',
    category: "Security & Guarding",
  },
  {
    id: "pin-lockout",
    nameKey: "fintechVictoryModal.skills.pinLockout",
    codeExample: 'if (failedAttempts >= 3) { isLocked = true; status = "BLOCKED"; }',
    category: "State Machine & Defense",
  },
  {
    id: "batch-settlement",
    nameKey: "fintechVictoryModal.skills.batchSettlement",
    codeExample: "for (int i = 0; i < transactions.Length; i++) { ... }",
    category: "Batch Processing & Settlement",
  },
  {
    id: "gateway-interface",
    nameKey: "fintechVictoryModal.skills.gatewayInterface",
    codeExample: "bool approved = gateway.Charge(totalAmount);",
    category: "Polymorphism & Contracts",
  },
  {
    id: "dependency-injection",
    nameKey: "fintechVictoryModal.skills.dependencyInjection",
    codeExample: "services.AddScoped<IPaymentGateway, DankortGateway>();",
    category: "Inversion of Control & DI",
  },
];

export const FintechStationVictoryModal: React.FC<FintechStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const { setCurrentStationId } = useWorkbenchStore();
  const [displayXp, setDisplayXp] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    audioFx.playSuccessFanfare();

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
  INTERACTIVE WORKBENCH: FINTECH ENGINEERING CERTIFICATE
  МОДУЛЬ 2: ФІНТЕХ POS-ТЕРМІНАЛ — УСПІШНО ЗАВЕРШЕНО!
═══════════════════════════════════════════════════════

Загальний досвід: ${xp} XP
Освоєні комерційні архітектурні патерни:
  1. [✓] Guard Clauses & Balance Protection
  2. [✓] State Locking & Anti-Bruteforce PIN Counter
  3. [✓] Batch Settlement Loops (Length / len)
  4. [✓] Gateway Interface Decoupling (IPaymentGateway.Charge)
  5. [✓] Provider Injection & IoC Container (services.AddScoped)

Кваліфікація: CERTIFIED FINTECH PROCESSOR ARCHITECT GRADE I
═══════════════════════════════════════════════════════`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReturnToStations = () => {
    audioFx.playRelayClick();
    onClose();
    setCurrentStationId("tv");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-[#EFE9DC] text-[#1A1D20] rounded-3xl border-2 border-[#1A1D20]/30 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1A1D20]/10 hover:bg-[#1A1D20]/20 text-[#1A1D20] transition-colors cursor-pointer"
          aria-label="Закрити"
        >
          <X size={18} />
        </button>

        {/* Blueprint Victory Stamp Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-600/30 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>3-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1A1D20] tracking-tight">
            {t("fintechVictoryModal.title")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-[#1A1D20]/80 max-w-lg mx-auto">
            {t("fintechVictoryModal.subtitle")}
          </p>
        </div>

        {/* XP Counter Banner */}
        <div className="p-4 rounded-2xl bg-[#E6DEC9] border border-[#1A1D20]/20 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-700">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-[#1A1D20]/70">
                {t("fintechVictoryModal.xpEarned")}
              </div>
              <div className="font-display font-extrabold text-xl text-[#1A1D20] flex items-center gap-1">
                <span>+{displayXp}</span>
                <span className="text-xs font-mono font-bold text-amber-700">XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAF8F2] border border-[#1A1D20]/20 font-mono text-xs font-bold text-[#1A1D20]">
            <CreditCard size={14} className="text-emerald-600" />
            <span>EMV / DANKORT READY</span>
          </div>
        </div>

        {/* Commercial Skill Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#1A1D20]/20 pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-[#1A1D20] flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" />
              <span>{t("fintechVictoryModal.matrixTitle")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-[#1A1D20]/70">5 / 5 Освоєно</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FINTECH_SKILLS.map((skill) => (
              <div
                key={skill.id}
                className="p-3 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-1 hover:border-[#1A1D20]/30 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold text-emerald-800 uppercase px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-600/30">
                    {skill.category}
                  </span>
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                </div>
                <div className="font-display font-bold text-xs text-[#1A1D20]">
                  {t(skill.nameKey)}
                </div>
                <div className="font-mono text-[10px] text-[#1A1D20]/70 truncate bg-[#EFE9DC] px-2 py-0.5 rounded border border-[#1A1D20]/10">
                  {skill.codeExample}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1A1D20]/20">
          <button
            onClick={handleExportSummary}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FAF8F2] hover:bg-white border border-[#1A1D20]/30 text-[#1A1D20] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-sm"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Download size={14} />}
            <span>
              {copied ? t("fintechVictoryModal.copiedBtn") : t("fintechVictoryModal.copyCertBtn")}
            </span>
          </button>

          <button
            onClick={handleReturnToStations}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1E2024] hover:bg-black text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            <span>{t("fintechVictoryModal.switchStationBtn")}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
