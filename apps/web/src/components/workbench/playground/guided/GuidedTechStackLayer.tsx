/**
 * @file apps/web/src/components/workbench/playground/guided/GuidedTechStackLayer.tsx
 * @description Dedicated real-world technology comparison layer for GuidedStepBar:
 * displays production protocols, architecture patterns, alternatives, and trade-offs.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  Cpu,
  Radio,
  Workflow,
  ShieldCheck,
  Database,
  Cloud,
  Network,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import type { TechnologyInsight, TechCategory } from "@iw/sim-engine";

interface GuidedTechStackLayerProps {
  insight: TechnologyInsight;
  currentLang?: "ua" | "en" | "da";
}

const getCategoryBadge = (category: TechCategory, t: (key: string, fallback: string) => string) => {
  switch (category) {
    case "protocol":
      return {
        label: t("guide.categoryProtocol", "Протокол зв'язку"),
        icon: Radio,
        style: "bg-blue-500/15 text-blue-900 border-blue-600/30",
      };
    case "pattern":
      return {
        label: t("guide.categoryPattern", "Інженерний патерн"),
        icon: Workflow,
        style: "bg-amber-500/15 text-amber-900 border-amber-600/30",
      };
    case "architecture":
      return {
        label: t("guide.categoryArchitecture", "Архітектурний підхід"),
        icon: Cpu,
        style: "bg-purple-500/15 text-purple-900 border-purple-600/30",
      };
    case "security":
      return {
        label: t("guide.categorySecurity", "Кібербезпека & Захист"),
        icon: ShieldCheck,
        style: "bg-rose-500/15 text-rose-900 border-rose-600/30",
      };
    case "database":
      return {
        label: t("guide.categoryDatabase", "Бази даних & Зберігання"),
        icon: Database,
        style: "bg-emerald-500/15 text-emerald-900 border-emerald-600/30",
      };
    case "network":
      return {
        label: t("guide.categoryNetwork", "Мережевий стек"),
        icon: Network,
        style: "bg-cyan-500/15 text-cyan-900 border-cyan-600/30",
      };
    case "cloud":
      return {
        label: t("guide.categoryCloud", "Хмарна інфраструктура"),
        icon: Cloud,
        style: "bg-indigo-500/15 text-indigo-900 border-indigo-600/30",
      };
    case "hardware":
      return {
        label: t("guide.categoryHardware", "Апаратний рівень"),
        icon: Wrench,
        style: "bg-orange-500/15 text-orange-950 border-orange-600/30",
      };
    default:
      return {
        label: t("guide.categoryGeneral", "Технологія"),
        icon: Cpu,
        style: "bg-[#1A1D20]/10 text-[#1A1D20] border-[#1A1D20]/20",
      };
  }
};

export const GuidedTechStackLayer: React.FC<GuidedTechStackLayerProps> = ({
  insight,
  currentLang = "ua",
}) => {
  const { t } = useTranslation();

  const whatIsIt = insight.whatIsIt[currentLang] || insight.whatIsIt.ua;
  const whyHere = insight.whyHere[currentLang] || insight.whyHere.ua;
  const altTradeoff = insight.alternative.tradeoff[currentLang] || insight.alternative.tradeoff.ua;
  const advantages = insight.advantages[currentLang] || insight.advantages.ua;

  const categoryBadge = getCategoryBadge(insight.category, t);
  const CategoryIcon = categoryBadge.icon;

  return (
    <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150 font-sans text-[#1A1D20]">
      {/* ── Top Header Banner: Primary Tech & Category Badge ── */}
      <div className="p-4 rounded-xl bg-[#EFE9DC] border border-[#1A1D20]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A1D20] text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <CategoryIcon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryBadge.style}`}
              >
                {categoryBadge.label}
              </span>
              <span className="text-[10px] font-mono text-[#1A1D20]/60">
                {t("guide.realWorldStandard", "Промисловий стандарт")}
              </span>
            </div>
            <h3 className="font-display font-black text-sm sm:text-base text-[#1A1D20] mt-1 leading-snug">
              {insight.primaryTech}
            </h3>
          </div>
        </div>
      </div>

      {/* ── Grid: What It Is (Working Principle) & Why In Production ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Card 1: What is it and how it works */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-accent-blue mb-1">
              <Cpu size={13} className="shrink-0" />
              <span>{t("guide.whatIsItTitle", "Що це таке і принцип роботи")}</span>
            </div>
            <p className="text-xs text-[#1A1D20]/85 leading-relaxed font-sans">
              {whatIsIt}
            </p>
          </div>
        </div>

        {/* Card 2: Why it is used here */}
        <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/15 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 mb-1">
              <Zap size={13} className="shrink-0 text-emerald-700" />
              <span>{t("guide.whyHereTitle", "Чому використовується тут")}</span>
            </div>
            <p className="text-xs text-[#1A1D20]/85 leading-relaxed font-sans">
              {whyHere}
            </p>
          </div>
        </div>
      </div>

      {/* ── Card 3: Alternative & Trade-Offs (Why it is worse) ── */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-600/30 text-xs space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-950">
            <AlertTriangle size={14} className="text-amber-700 shrink-0" />
            <span>{t("guide.alternativeTitle", "Альтернатива та компроміси (Trade-offs)")}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-600/35 text-amber-950 font-bold">
            {insight.alternative.name}
          </span>
        </div>

        <div className="text-amber-950/90 leading-relaxed pt-0.5">
          <span className="font-bold text-rose-900 block sm:inline mr-1">
            {t("guide.whyWorseLabel", "Чому це гірше / які ризики:")}
          </span>
          <span>{altTradeoff}</span>
        </div>
      </div>

      {/* ── Card 4: Key Engineering Advantages (Pills) ── */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1A1D20]/60">
          {t("guide.advantagesTitle", "Ключові інженерні переваги:")}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {advantages.map((adv, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EFE9DC] border border-[#1A1D20]/20 text-[11px] font-mono font-bold text-[#1A1D20] shadow-2xs"
            >
              <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
              <span>{adv}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
