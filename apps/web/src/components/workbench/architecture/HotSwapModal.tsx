import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Sparkles, Zap } from "lucide-react";

interface HotSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTrace: () => void;
}

export const HotSwapModal: React.FC<HotSwapModalProps> = ({
  isOpen,
  onClose,
  onTriggerTrace,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn select-none">
      <div className="bg-white border border-black/[0.08] rounded-2xl max-w-lg w-full p-6 shadow-luxury relative text-obsidian">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-obsidian p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-black/[0.06] flex items-center justify-center text-[#252932] shadow-2xs">
            <Sparkles size={20} className="text-[#C5A059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#C5A059]/15 text-amber-900 font-bold border border-[#C5A059]/30">
                {t("architecture.polymorphismInAction", "Поліморфізм у дії")}
              </span>
            </div>
            <h3 className="text-base font-display font-bold text-obsidian mt-0.5">
              {t("architecture.hotSwapTitle", "Фокус Поліморфізму (The Hot Swap)")}
            </h3>
          </div>
        </div>

        <div className="space-y-3 font-sans text-xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-xl bg-slate-50/80 border border-black/[0.06] text-slate-700 shadow-2xs">
            <p className="font-bold text-obsidian text-sm mb-1">
              {t("architecture.hotSwapInsight", "У файлі TVController.cs НЕ ЗМІНИЛОСЯ ЖОДНОГО СИМВОЛУ!")}
            </p>
            <p className="text-[11.5px] text-slate-600">
              {t("architecture.hotSwapSubtitle", "Підміна реалізації через єдиний контракт")}: {t("architecture.hotSwapDesc", "ми замінили деталь на нову (VolumeUpCommand замість PowerCommand), а телевізор продовжує працювати без перекомпіляції.")}
            </p>
          </div>

          <div className="rounded-xl bg-[#1E2229] border border-black/[0.08] p-3 font-mono text-[11px] text-gray-200 shadow-inner">
            <div className="text-gray-400 text-[10px] pb-1 border-b border-white/10 mb-2 flex justify-between">
              <span>{t("architecture.codeUnchanged", "TVController.cs — Код залишився незмінним:")}</span>
              <span className="text-emerald-400 font-bold">{t("architecture.zeroChanges", "0 змін")}</span>
            </div>
            <pre className="text-emerald-300">
{`public class TVController {
    private readonly IRemoteCommand _cmd;

    // Конструктор приймає будь-яку деталь цього типу:
    public TVController(IRemoteCommand cmd) => _cmd = cmd;

    public void Dispatch() {
        _cmd.Execute(); // ➔ Виклик поліморфного методу!
    }
}`}
            </pre>
          </div>

          <p className="text-[11.5px] text-slate-500">
            {t("architecture.hotSwapSummary", "Тепер при натисканні кнопки на пульті телевізор змінює гучність замість вимикання. Ось чому інтерфейси та Dependency Injection дають свободу: ви змінюєте поведінку системи на льоту, не чіпаючи класи, які її використовують.")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-black/[0.06]">
          <button
            onClick={() => {
              onClose();
              onTriggerTrace();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-white font-mono font-bold text-xs shadow-2xs cursor-pointer transition-all active:scale-95"
          >
            <Zap size={13} className="text-[#C5A059]" />
            {t("architecture.testCall", "Трасувати виклик")}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-obsidian border border-black/[0.08] font-mono text-xs shadow-2xs cursor-pointer transition-colors"
          >
            {t("architecture.gotIt", "Зрозуміло!")}
          </button>
        </div>
      </div>
    </div>
  );
};
