import React, { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  GraduationCap,
  Sparkles,
  HelpCircle,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Tv,
  ArrowRight,
  Lightbulb,
  Info,
} from "lucide-react";
import { useWorkbenchStore, type MentorPhase } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

interface MentorBarProps {
  onGoToTv?: () => void;
}

export const MentorBar: React.FC<MentorBarProps> = ({ onGoToTv }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTheory, setShowTheory] = useState(false);

  const {
    mentorPhase,
    guidedStep,
    isHintActive,
    triggerHint,
    resetLevelForPractice,
    completeLevel,
    isArchitecturePowerWired: isPowerWired,
    power,
  } = useWorkbenchStore(
    useShallow((s) => ({
      mentorPhase: s.mentorPhase,
      guidedStep: s.guidedStep,
      isHintActive: s.isHintActive,
      triggerHint: s.triggerHint,
      resetLevelForPractice: s.resetLevelForPractice,
      completeLevel: s.completeLevel,
      isArchitecturePowerWired: s.isArchitecturePowerWired,
      power: s.power,
    }))
  );

  const toggleExpand = useCallback(() => setIsExpanded((prev) => !prev), []);
  const toggleTheory = useCallback(() => setShowTheory((prev) => !prev), []);

  const getPhaseBadgeColor = (phase: MentorPhase): { bg: string; text: string; border: string } => {
    switch (phase) {
      case "GUIDED":
        return { bg: "bg-purple-950/60", text: "text-purple-300", border: "border-purple-600/40" };
      case "VERIFY":
        return { bg: "bg-blue-950/60", text: "text-blue-300", border: "border-blue-600/40" };
      case "PRACTICE":
        return { bg: "bg-amber-950/60", text: "text-amber-300", border: "border-amber-600/40" };
      case "COMPLETED":
        return { bg: "bg-emerald-950/60", text: "text-emerald-300", border: "border-emerald-600/40" };
    }
  };

  const badgeColor = getPhaseBadgeColor(mentorPhase);

  const getPhaseTitle = (phase: MentorPhase): string => {
    switch (phase) {
      case "GUIDED":
        return t("mentor.phaseGuided");
      case "VERIFY":
        return t("mentor.phaseVerify");
      case "PRACTICE":
        return t("mentor.phasePractice");
      case "COMPLETED":
        return t("mentor.phaseCompleted");
    }
  };

  // ── Collapsed View ──────────────────────────────────────────
  if (!isExpanded) {
    return (
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between px-4 py-2 bg-[#1A1B1E]/95 border-t border-[#2F3136] backdrop-blur-md cursor-pointer hover:bg-[#222428] transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-xs">
            <GraduationCap size={14} />
          </div>
          <span className="font-balsamiq font-bold text-xs text-white">
            {t("mentor.title")}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border}`}
          >
            {getPhaseTitle(mentorPhase)}
          </span>
          {mentorPhase === "GUIDED" && (
            <span className="text-[11px] font-mono text-[#9CA3AF]">
              {t("mentor.stepCounter", { current: guidedStep, total: 3 })}
            </span>
          )}
        </div>

        <button
          title={t("architecture.expand")}
          className="p-1 rounded text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
        >
          <Maximize2 size={13} />
        </button>
      </div>
    );
  }

  // ── Expanded View ────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-[#1A1B1E]/95 border-t border-[#2F3136] backdrop-blur-md transition-all select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2C30]">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
              <GraduationCap size={15} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1A1B1E] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-balsamiq font-bold text-xs text-white tracking-wide">
                {t("mentor.title")}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border}`}
              >
                {getPhaseTitle(mentorPhase)}
              </span>
              {mentorPhase === "GUIDED" && (
                <span className="text-[11px] font-mono text-[#9CA3AF]">
                  {t("mentor.stepCounter", { current: guidedStep, total: 3 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheory}
            className={`px-2.5 py-1 rounded-md text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTheory
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/50"
                : "bg-white/5 text-[#9CA3AF] hover:text-white hover:bg-white/10 border border-white/5"
            }`}
            title={t("mentor.whyArchTitle")}
          >
            <Lightbulb size={12} className={showTheory ? "text-amber-400" : "text-[#9CA3AF]"} />
            <span>{t("mentor.whyArchTitle")}</span>
          </button>

          <button
            onClick={toggleExpand}
            className="p-1 rounded text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={t("architecture.collapse")}
          >
            <Minimize2 size={13} />
          </button>
        </div>
      </div>

      {/* Expandable Architectural "Why not new?" callout */}
      {showTheory && (
        <div className="px-4 py-2.5 bg-[#22242A] border-b border-[#2F3136] flex items-start gap-2.5 animate-fadeIn">
          <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-[#E5E7EB] leading-relaxed">
            <span className="font-bold text-amber-300 block mb-0.5">
              {t("mentor.whyArchTitle")}
            </span>
            {t("mentor.whyArchText")}
          </div>
        </div>
      )}

      {/* Main Dialogue & Action Row */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Dialogue Bubble */}
        <div className="flex-1 flex items-center gap-3">
          <div className="w-1.5 h-10 rounded-full bg-purple-500 shrink-0" />
          <div className="text-xs sm:text-sm text-[#F3F4F6] font-sans leading-relaxed">
            {mentorPhase === "GUIDED" && (
              <>
                {guidedStep === 1 && t("mentor.step1")}
                {guidedStep === 2 && t("mentor.step2")}
                {guidedStep === 3 && t("mentor.step3")}
              </>
            )}

            {mentorPhase === "VERIFY" && (
              <>
                {power ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 size={15} className="shrink-0" />
                    {t("mentor.verifySuccess")}
                  </span>
                ) : (
                  <span>{t("mentor.verifyMsg")}</span>
                )}
              </>
            )}

            {mentorPhase === "PRACTICE" && (
              <>
                {isPowerWired ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5 shrink-0">
                      <Sparkles size={14} className="text-amber-400" />
                      {t("mentor.activeRecallTitle")}:
                    </span>
                    <span className="text-gray-300 shrink-0">
                      {t("mentor.activeRecallPrompt")}
                    </span>
                    <code className="px-2 py-0.5 rounded bg-black/60 border border-emerald-500/40 text-emerald-400 font-mono text-[11px]">
                      services.AddTransient&lt;IRemoteCommand, PowerCommand&gt;();
                    </code>
                  </div>
                ) : isHintActive ? (
                  <span className="text-amber-300 font-medium flex items-center gap-1.5">
                    <Sparkles size={14} className="shrink-0 animate-spin" />
                    {t("mentor.hintActiveMsg")}
                  </span>
                ) : (
                  <span>{t("mentor.practiceMsg")}</span>
                )}
              </>
            )}

            {mentorPhase === "COMPLETED" && (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={15} className="shrink-0" />
                {t("mentor.completedTitle")}
              </span>
            )}
          </div>
        </div>

        {/* Phase Contextual Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {mentorPhase === "VERIFY" && !power && onGoToTv && (
            <button
              onClick={onGoToTv}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-sans font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Tv size={13} />
              <span>{t("workbench.backToTv")}</span>
            </button>
          )}

          {mentorPhase === "VERIFY" && power && (
            <button
              onClick={resetLevelForPractice}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-sans font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
            >
              <span>{t("mentor.startPracticeBtn")}</span>
              <ArrowRight size={13} />
            </button>
          )}

          {mentorPhase === "PRACTICE" && isPowerWired && (
            <button
              onClick={completeLevel}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-sans font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all cursor-pointer animate-pulse"
            >
              <span>{t("mentor.confirmDiRegistrationBtn")}</span>
              <ArrowRight size={13} />
            </button>
          )}

          {mentorPhase === "PRACTICE" && !isPowerWired && (
            <button
              onClick={triggerHint}
              disabled={isHintActive}
              className={`px-3 py-1.5 rounded-lg font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isHintActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default"
                  : "bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/10 shadow-xs"
              }`}
            >
              <HelpCircle size={13} className={isHintActive ? "text-amber-400" : "text-amber-300"} />
              <span>{t("mentor.needHintBtn")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
