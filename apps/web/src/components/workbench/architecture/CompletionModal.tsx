import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  Code2,
  ArrowRight,
  X,
  Layers,
  Cpu,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextTask?: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  isOpen,
  onClose,
  onNextTask,
}) => {
  const { t } = useTranslation();
  const [langTab, setLangTab] = useState<"csharp" | "go">("csharp");
  const xp = useWorkbenchStore((s) => s.xp);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white border border-black/[0.08] rounded-2xl shadow-luxury overflow-hidden flex flex-col text-obsidian font-sans">
        {/* Top Celebration Banner */}
        <div className="relative px-6 pt-6 pb-4 bg-slate-50/70 flex items-center justify-between border-b border-black/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
              <Trophy size={22} className="text-[#C5A059]" />
              <Sparkles size={13} className="absolute -top-1 -right-1 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-lg text-obsidian">
                {t("mentor.completedTitle")}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 font-mono font-bold text-xs text-amber-900">
                  <Cpu size={12} />
                  +50 XP ({xp} XP)
                </span>
                <span className="text-xs text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  {t("architecture.missionSuccess")}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-obsidian hover:bg-slate-100 transition-colors cursor-pointer"
            title={t("common.cancel")}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Architectural Takeaway */}
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-black/[0.06] flex items-start gap-3 shadow-2xs">
            <Layers size={18} className="text-[#252932] shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              <span className="font-bold text-obsidian block mb-0.5">
                {t("mentor.whyArchTitle")}
              </span>
              {t("mentor.summaryExplanation")}
            </div>
          </div>

          {/* Code Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1.5">
                <Code2 size={13} />
                {t("mentor.summaryTitle")}
              </span>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-black/[0.06]">
                <button
                  onClick={() => setLangTab("csharp")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    langTab === "csharp"
                      ? "bg-[#252932] text-white shadow-2xs"
                      : "text-slate-600 hover:text-obsidian"
                  }`}
                >
                  C# (.NET DI)
                </button>
                <button
                  onClick={() => setLangTab("go")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    langTab === "go"
                      ? "bg-[#252932] text-white shadow-2xs"
                      : "text-slate-600 hover:text-obsidian"
                  }`}
                >
                  Go (Interfaces)
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="p-3.5 bg-[#1E2229] border border-black/[0.08] rounded-xl font-mono text-xs text-[#E5E7EB] overflow-x-auto leading-relaxed shadow-inner">
              {langTab === "csharp" ? (
                <pre className="space-y-0.5">
                  <span className="text-[#9CA3AF]">
                    {t("architecture.csharpComment1", "// 1. Register implementation under IRemoteCommand contract")}
                  </span>
                  {"\n"}
                  <span className="text-[#93C5FD]">services</span>
                  <span className="text-white">.AddTransient&lt;</span>
                  <span className="text-[#C4B5FD] font-bold">IRemoteCommand</span>
                  <span className="text-white">, </span>
                  <span className="text-[#93C5FD] font-bold">PowerCommand</span>
                  <span className="text-white">&gt;();</span>
                  {"\n\n"}
                  <span className="text-[#9CA3AF]">
                    {t("architecture.csharpComment2", "// 2. TV controller automatically receives interface via constructor injection")}
                  </span>
                  {"\n"}
                  <span className="text-[#93C5FD]">services</span>
                  <span className="text-white">.AddSingleton&lt;</span>
                  <span className="text-[#FCD34D] font-bold">TVController</span>
                  <span className="text-white">&gt;();</span>
                </pre>
              ) : (
                <pre className="space-y-0.5">
                  <span className="text-[#9CA3AF]">
                    {t("architecture.goComment1", "// 1. Instantiate command implementing IRemoteCommand interface")}
                  </span>
                  {"\n"}
                  <span className="text-[#93C5FD]">powerCmd</span>
                  <span className="text-white"> := commands.</span>
                  <span className="text-[#93C5FD] font-bold">NewPowerCommand</span>
                  <span className="text-white">(receiver)</span>
                  {"\n\n"}
                  <span className="text-[#9CA3AF]">
                    {t("architecture.goComment2", "// 2. Inject command into controller")}
                  </span>
                  {"\n"}
                  <span className="text-[#FCD34D]">controller</span>
                  <span className="text-white"> := controllers.</span>
                  <span className="text-[#FCD34D] font-bold">NewTVController</span>
                  <span className="text-white">(powerCmd)</span>
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-black/[0.06] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-600 hover:text-obsidian hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {t("mentor.closeModal")}
          </button>
          <button
            onClick={() => {
              if (onNextTask) onNextTask();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-[#252932] hover:bg-[#1A1D24] active:scale-95 text-white font-mono font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <span>{t("mentor.nextTaskBtn")}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
