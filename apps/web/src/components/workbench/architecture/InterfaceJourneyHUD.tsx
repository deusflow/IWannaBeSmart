import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Zap, Code2, Sparkles, Eye, ChevronUp, ChevronDown } from "lucide-react";
import type { ActiveJourneyState } from "./types";

interface InterfaceJourneyHUDProps {
  journeyState: ActiveJourneyState;
  onChangeStep: (step: number, targetNodeId: string) => void;
  onChangeCommand: (command: "PowerCommand" | "VolumeUpCommand") => void;
  onClose: () => void;
  onTriggerTrace: () => void;
  onFitAll?: () => void;
  isTracing: boolean;
}

export const InterfaceJourneyHUD: React.FC<InterfaceJourneyHUDProps> = ({
  journeyState,
  onChangeStep,
  onChangeCommand,
  onClose,
  onTriggerTrace,
  onFitAll,
  isTracing,
}) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const isInterfaceMode = journeyState.type === "INTERFACE";
  const isVolume = journeyState.activeCommand === "VolumeUpCommand";

  // ── Step definitions for Interface mode ──
  const interfaceSteps = [
    {
      step: 1,
      question: t("journey.q1", "Звідки береться"),
      stationTitle: t("journey.ifaceStep1Title", "1. Оголошення"),
      stationSubtitle: "IRemoteCommand.cs",
      nodeId: "node-interface-remote-command",
      code: `public interface IRemoteCommand {\n    void Execute(); // Загальний контракт для будь-якої кнопки\n}`,
      desc: t(
        "journey.ifaceStep1Desc",
        "«Форма розетки». Визначає правила, які зобов'язані виконати всі команди пульта."
      ),
    },
    {
      step: 2,
      question: t("journey.q2", "Хто реалізує"),
      stationTitle: t("journey.ifaceStep2Title", "2. Реалізація"),
      stationSubtitle: isVolume ? "VolumeUpCommand.cs" : "PowerCommand.cs",
      nodeId: isVolume ? "node-class-volume-up-command" : "node-class-power-command",
      code: isVolume
        ? `public class VolumeUpCommand : IRemoteCommand {\n    public void Execute() => _tv.SetVolume(+10); // Додає звук\n}`
        : `public class PowerCommand : IRemoteCommand {\n    public void Execute() => _tv.TogglePower(); // Вмикає реле живлення\n}`,
      desc: isVolume
        ? t("journey.ifaceStep2DescVol", "Штекер гучності. Реалізує той самий метод Execute(), але регулює звук.")
        : t("journey.ifaceStep2DescPwr", "Штекер живлення. Реалізує той самий метод Execute(), але керує реле 220V."),
    },
    {
      step: 3,
      question: t("journey.q3", "Куди впроваджується (DI)"),
      stationTitle: t("journey.ifaceStep3Title", "3. Впровадження (DI)"),
      stationSubtitle: "TVController.cs",
      nodeId: "node-class-tv-controller",
      code: `public class TVController {\n    private readonly IRemoteCommand _cmd;\n    // Конструктор приймає будь-що, що відповідає контракту:\n    public TVController(IRemoteCommand cmd) => _cmd = cmd;\n}`,
      desc: t(
        "journey.ifaceStep3Desc",
        "Слот прийому. Телевізор не знає про Power чи Volume, він чекає контракт IRemoteCommand."
      ),
    },
    {
      step: 4,
      question: t("journey.q4", "Де викликається"),
      stationTitle: t("journey.ifaceStep4Title", "4. Використання"),
      stationSubtitle: "TVController.Dispatch()",
      nodeId: "node-class-tv-controller",
      code: `public void Dispatch() {\n    _cmd.Execute(); // Поліморфний виклик через інтерфейс!\n}`,
      desc: t(
        "journey.ifaceStep4Desc",
        "Точка виклику: контролер просто викликає .Execute(), а що саме станеться — залежить від вставленої деталі!"
      ),
    },
  ];

  // ── Step definitions for DI mode ──
  const diSteps = [
    {
      step: 1,
      question: t("journey.diQ1", "Звідки береться"),
      stationTitle: t("journey.diStep1Title", "1. Створення зовні"),
      stationSubtitle: isVolume ? "new VolumeUpCommand()" : "new PowerCommand()",
      nodeId: isVolume ? "node-class-volume-up-command" : "node-class-power-command",
      code: isVolume
        ? `// Створюємо екземпляр команди гучності окремо від телевізора:\nvar cmd = new VolumeUpCommand();`
        : `// Створюємо екземпляр команди живлення окремо від телевізора:\nvar cmd = new PowerCommand();`,
      desc: t("journey.diStep1Desc", "Деталь створюється ззовні — телевізор НЕ створює її через new PowerCommand()."),
    },
    {
      step: 2,
      question: t("journey.diQ2", "Куди передається"),
      stationTitle: t("journey.diStep2Title", "2. Впорскування (DI)"),
      stationSubtitle: "ctor(IRemoteCommand)",
      nodeId: "node-class-tv-controller",
      code: `// Впорскуємо створену деталь у конструктор телевізора:\nvar tv = new TVController(cmd);`,
      desc: t("journey.diStep2Desc", "Готова деталь передається в конструктор через дріт залежності."),
    },
    {
      step: 3,
      question: t("journey.diQ3", "Де зберігається"),
      stationTitle: t("journey.diStep3Title", "3. Запис у RAM"),
      stationSubtitle: "TVController._cmd",
      nodeId: "node-class-tv-controller",
      code: `// Внутрішнє поле контролера запам'ятовує посилання:\n_cmd = cmd; // [0x7F2A: ${isVolume ? "VolumeUpCommand" : "PowerCommand"}]`,
      desc: t("journey.diStep3Desc", "Телевізор зберігає посилання у своє приватне поле _cmd для подальшого використання."),
    },
    {
      step: 4,
      question: t("journey.diQ4", "Де працює"),
      stationTitle: t("journey.diStep4Title", "4. Виклик у роботі"),
      stationSubtitle: "tv.Dispatch()",
      nodeId: "node-class-tv-controller",
      code: `// При натисканні пульта сигнал іде через збережене поле:\npublic void Dispatch() => _cmd.Execute();`,
      desc: isVolume
        ? t("journey.diStep4DescVol", "Звуковий підсилювач збільшує гучність на +10%!")
        : t("journey.diStep4DescPwr", "Головне реле телевізора перемикає живлення (115V CRT Rail)!"),
    },
  ];

  const steps = isInterfaceMode ? interfaceSteps : diSteps;
  const currentStepData = steps.find((s) => s.step === journeyState.activeStep) || steps[0];

  // ── Minimized floating pill ──
  if (isMinimized) {
    return (
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-[#15161A]/95 border border-purple-500/50 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md px-3 py-1.5 flex items-center gap-3 select-none animate-fadeIn text-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
            <Sparkles size={11} />
          </div>
          <span className="font-mono font-bold text-[11px] text-white">
            {isInterfaceMode
              ? t("journey.interfaceTitle", "⬡ Шлях контракту: IRemoteCommand")
              : t("journey.diTitle", "⚡ Шлях впровадження залежності (DI)")}
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold">
            {t("journey.stepBadge", { current: journeyState.activeStep, total: 4 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-white/10 pl-2">
          {onFitAll && (
            <button
              onClick={onFitAll}
              title={t("journey.showAllPath", "👁 Весь шлях на дошці")}
              className="p-1 rounded-md hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
            >
              <Eye size={13} />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(false)}
            title={t("journey.maximize", "Розгорнути")}
            className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onClose}
            title={t("journey.close", "Закрити дослідження")}
            className="p-1 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ── Expanded Roadmap HUD ──
  return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[96%] bg-[#15161A]/95 border border-purple-500/50 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.85),0_0_24px_rgba(168,85,247,0.25)] backdrop-blur-md p-3.5 select-none animate-fadeIn text-gray-200">
      {/* ── Top Bar: Title + Overview + Command Switcher + Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <Sparkles size={13} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs text-white">
                {isInterfaceMode
                  ? t("journey.interfaceTitle", "⬡ Шлях контракту: IRemoteCommand")
                  : t("journey.diTitle", "⚡ Шлях впровадження залежності (DI)")}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold">
                {t("journey.stepBadge", { current: journeyState.activeStep, total: 4 })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {/* Fit all nodes button */}
          {onFitAll && (
            <button
              onClick={onFitAll}
              title={t("journey.showAllPath", "Показати весь шлях на дошці")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-purple-200 text-[10px] font-mono transition-colors cursor-pointer"
            >
              <Eye size={12} className="text-purple-300" />
              <span>{t("journey.showAllPath", "Весь шлях")}</span>
            </button>
          )}

          {/* Real-time implementation switcher: Power vs Volume */}
          <div className="flex items-center bg-[#101114] p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => onChangeCommand("PowerCommand")}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer font-bold ${
                !isVolume
                  ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              PowerCommand
            </button>
            <button
              onClick={() => onChangeCommand("VolumeUpCommand")}
              className={`px-2 py-0.8 rounded-md transition-all cursor-pointer font-bold ${
                isVolume
                  ? "bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-xs"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              VolumeUpCommand
            </button>
          </div>

          {/* Minimize / Expand */}
          <button
            onClick={() => setIsMinimized(true)}
            title={t("journey.minimize", "Згорнути")}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronUp size={14} />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            title={t("journey.close", "Закрити дослідження")}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── 4 Interactive Stations (Breadcrumb Track answering "Звідки -> Куди -> До куди -> Де викликається") ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-2.5">
        {steps.map((st) => {
          const isSelected = st.step === journeyState.activeStep;
          return (
            <button
              key={st.step}
              onClick={() => onChangeStep(st.step, st.nodeId)}
              className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? "bg-purple-600/25 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.35)] ring-1 ring-purple-400/60"
                  : "bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/20"
              }`}
            >
              <div className="text-[9px] font-mono uppercase tracking-wider text-purple-300/80 font-bold mb-0.5">
                {st.question}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10.5px] font-mono font-bold ${
                    isSelected ? "text-white" : "text-gray-300"
                  }`}
                >
                  {st.stationTitle}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                )}
              </div>
              <span className="font-mono text-[9px] text-gray-400 block truncate mt-0.5">
                {st.stationSubtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active Step Details: Code + Pedagogical Insight ── */}
      <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-purple-300 font-bold mb-1">
            <Code2 size={12} />
            <span>{currentStepData.stationSubtitle}</span>
            <span className="text-gray-500">—</span>
            <span className="text-purple-200">{currentStepData.question}</span>
          </div>
          <pre className="font-mono text-[10px] text-emerald-300 bg-black/40 p-2 rounded-lg border border-white/5 overflow-x-auto leading-relaxed">
            {currentStepData.code}
          </pre>
          <p className="text-[10.5px] text-gray-300 mt-1.5 leading-snug">
            💡 <strong>{t("journey.insightTitle", "Що це означає")}:</strong> {currentStepData.desc}
          </p>
        </div>

        {/* Action button inside HUD */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={onTriggerTrace}
            disabled={isTracing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-[11px] shadow-[0_0_14px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Zap size={13} className={isTracing ? "animate-spin" : "fill-stone-950"} />
            <span>{isTracing ? t("architecture.tracing", "Трасування...") : t("journey.testPulse", "⚡ Перевірити струм")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
