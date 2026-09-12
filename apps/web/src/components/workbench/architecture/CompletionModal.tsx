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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#1E2024] border border-[#373A40] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Celebration Banner */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-purple-950/40 via-purple-900/10 to-transparent flex items-center justify-between border-b border-[#2C2F36]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
              <Trophy size={24} className="animate-bounce" />
              <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-200" />
            </div>
            <div>
              <h2 className="font-balsamiq font-extrabold text-lg text-white">
                {t("mentor.completedTitle")}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 font-mono font-bold text-xs text-amber-400">
                  <Cpu size={12} />
                  +50 XP ({xp} XP)
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {t("architecture.missionSuccess")}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            title={t("common.cancel")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Architectural Takeaway */}
          <div className="p-3.5 rounded-xl bg-[#26282E] border border-[#34373E] flex items-start gap-3">
            <Layers size={18} className="text-purple-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed font-sans">
              <span className="font-bold text-purple-300 block mb-0.5">
                {t("mentor.whyArchTitle")}
              </span>
              {t("mentor.summaryExplanation")}
            </div>
          </div>

          {/* Code Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#9CA3AF] flex items-center gap-1.5">
                <Code2 size={13} />
                {t("mentor.summaryTitle")}
              </span>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-[#141517] rounded-lg border border-[#2B2D33]">
                <button
                  onClick={() => setLangTab("csharp")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    langTab === "csharp"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  C# (.NET DI)
                </button>
                <button
                  onClick={() => setLangTab("go")}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    langTab === "go"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-[#9CA3AF] hover:text-white"
                  }`}
                >
                  Go (Interfaces)
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="p-3.5 bg-[#141517] border border-[#2B2D33] rounded-xl font-mono text-xs text-[#E5E7EB] overflow-x-auto leading-relaxed">
              {langTab === "csharp" ? (
                <pre className="space-y-0.5">
                  <span className="text-[#6B7280]">// 1. Реєструємо реалізацію під контрактом IRemoteCommand</span>
                  {"\n"}
                  <span className="text-[#93C5FD]">services</span>
                  <span className="text-white">.AddTransient&lt;</span>
                  <span className="text-[#C4B5FD] font-bold">IRemoteCommand</span>
                  <span className="text-white">, </span>
                  <span className="text-[#93C5FD] font-bold">PowerCommand</span>
                  <span className="text-white">&gt;();</span>
                  {"\n\n"}
                  <span className="text-[#6B7280]">// 2. Контролер телевізора автоматично отримує інтерфейс через конструктор</span>
                  {"\n"}
                  <span className="text-[#93C5FD]">services</span>
                  <span className="text-white">.AddSingleton&lt;</span>
                  <span className="text-[#FCD34D] font-bold">TVController</span>
                  <span className="text-white">&gt;();</span>
                </pre>
              ) : (
                <pre className="space-y-0.5">
                  <span className="text-[#6B7280]">// 1. Створюємо команду, що задовольняє IRemoteCommand interface</span>
                  {"\n"}
                  <span className="text-[#93C5FD]">powerCmd</span>
                  <span className="text-white"> := commands.</span>
                  <span className="text-[#93C5FD] font-bold">NewPowerCommand</span>
                  <span className="text-white">(receiver)</span>
                  {"\n\n"}
                  <span className="text-[#6B7280]">// 2. Впроваджуємо команду у контролер</span>
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
        <div className="px-6 py-4 bg-[#18191C] border-t border-[#2C2F36] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-sans font-medium text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {t("mentor.closeModal")}
          </button>
          <button
            onClick={() => {
              if (onNextTask) onNextTask();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-sans font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <span>{t("mentor.nextTaskBtn")}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
