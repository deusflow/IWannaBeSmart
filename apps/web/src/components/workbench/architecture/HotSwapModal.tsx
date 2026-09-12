import React from "react";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#18191D] border border-purple-500/60 rounded-2xl max-w-lg w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(168,85,247,0.25)] relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                {t("architecture.polymorphismInAction", "Поліморфізм у дії")}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-100 mt-0.5">
              {t("architecture.hotSwapTitle", "💡 Фокус Поліморфізму (The Hot Swap)")}
            </h3>
          </div>
        </div>

        <div className="space-y-3 font-sans text-xs text-gray-300 leading-relaxed">
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
            <p className="font-bold text-purple-100 text-sm mb-1">
              ⚡ {t("architecture.hotSwapInsight", "У файлі TVController.cs НЕ ЗМІНИЛОСЯ ЖОДНОГО СИМВОЛУ!")}
            </p>
            <p className="text-[11.5px] text-purple-200/90">
              {t("architecture.hotSwapSubtitle", "Підміна реалізації через єдиний контракт")}: {t("architecture.hotSwapDesc", "ми замінили деталь на нову (VolumeUpCommand замість PowerCommand), а телевізор продовжує працювати без перекомпіляції.")}
            </p>
          </div>

          <div className="rounded-lg bg-black/60 border border-white/10 p-3 font-mono text-[11px] text-gray-300">
            <div className="text-gray-500 text-[10px] pb-1 border-b border-white/10 mb-2 flex justify-between">
              <span>{t("architecture.codeUnchanged", "TVController.cs — Код залишився незмінним:")}</span>
              <span className="text-emerald-400">{t("architecture.zeroChanges", "0 змін")}</span>
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

          <p className="text-[11.5px] text-gray-400">
            {t("architecture.hotSwapSummary", "Тепер при натисканні кнопки на пульті телевізор змінює гучність замість вимикання. Ось чому інтерфейси та Dependency Injection дають свободу: ви змінюєте поведінку системи на льоту, не чіпаючи класи, які її використовують.")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onClose();
              onTriggerTrace();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer transition-all active:scale-95"
          >
            <Zap size={13} className="fill-black" />
            {t("architecture.testCall", "⚡ Трасувати виклик")}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 font-mono text-xs cursor-pointer transition-colors"
          >
            {t("architecture.gotIt", "Зрозуміло!")}
          </button>
        </div>
      </div>
    </div>
  );
};
