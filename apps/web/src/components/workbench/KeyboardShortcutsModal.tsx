/**
 * @file apps/web/src/components/workbench/KeyboardShortcutsModal.tsx
 * @description 2026 Developer Keyboard Shortcuts Modal Cheatsheet (triggered by '?' or header button)
 */

import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, X, Terminal, Compass, Volume2, Monitor } from "lucide-react";
import { audioFx } from "../../utils/audioFx";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierKey = isMac ? "⌘" : "Ctrl";

  const groups: ShortcutGroup[] = [
    {
      title: t("shortcuts.groupNav", "Навігація та пошук"),
      icon: <Compass size={15} className="text-accent-blue" />,
      shortcuts: [
        {
          keys: [modifierKey, "K"],
          description: t("shortcuts.cmdK", "Командна палітра та глобальний пошук по станціях"),
        },
        {
          keys: ["?"],
          description: t("shortcuts.help", "Довідка по гарячих клавішах"),
        },
        {
          keys: ["Esc"],
          description: t("shortcuts.esc", "Закрити активне модальне вікно або шухляду"),
        },
      ],
    },
    {
      title: t("shortcuts.groupEditor", "Редактор коду Code Gym"),
      icon: <Terminal size={15} className="text-emerald-500" />,
      shortcuts: [
        {
          keys: [modifierKey, "Enter"],
          description: t("shortcuts.runCode", "Виконати перевірку коду / завершити спринт"),
        },
        {
          keys: ["Enter", "↵"],
          description: t("shortcuts.advance", "Швидкий перехід до наступного раунду при успіху"),
        },
        {
          keys: ["Wrap"],
          description: t("shortcuts.wrap", "Перемикання м'якого переносу довгих рядків коду"),
        },
        {
          keys: ["A-", "A+"],
          description: t("shortcuts.zoom", "Зміна розміру шрифту коду (11px – 18px)"),
        },
      ],
    },
    {
      title: t("shortcuts.groupAudio", "Аудіосинтезатор"),
      icon: <Volume2 size={15} className="text-amber-500" />,
      shortcuts: [
        {
          keys: ["VOL"],
          description: t("shortcuts.volWidget", "Відкрити мікшер Master Gain зі швидкими пресетами"),
        },
        {
          keys: ["Mute"],
          description: t("shortcuts.muteKey", "Миттєве безклацанкове вимкнення звуку"),
        },
      ],
    },
    {
      title: t("shortcuts.groupHardware", "Віртуальне залізо & Smart TV"),
      icon: <Monitor size={15} className="text-purple-400" />,
      shortcuts: [
        {
          keys: ["PWR"],
          description: t("shortcuts.pwr", "Увімкнення / вимкнення живлення телевізора"),
        },
        {
          keys: ["1", "2", "3", "4"],
          description: t("shortcuts.channels", "Прямий вибір каналу на віртуальному пульті"),
        },
      ],
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("shortcuts.title", "Гарячі клавіші")}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioFx.playRelayClick();
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-2xl bg-[#14161B]/95 border border-white/15 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-blue/20 border border-accent-blue/40 flex items-center justify-center text-accent-blue">
              <Keyboard size={16} />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">
                {t("shortcuts.title", "Гарячі клавіші")}
              </h3>
              <p className="font-sans text-[11px] text-gray-400 leading-tight">
                {t("shortcuts.subtitle", "Швидка ергономічна взаємодія з верстаком")}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t("common.close", "Закрити")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {groups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-300 uppercase tracking-wider">
                {group.icon}
                <span>{group.title}</span>
              </div>

              <div className="space-y-1.5">
                {group.shortcuts.map((sc, scIdx) => (
                  <div
                    key={scIdx}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="font-sans text-xs text-gray-200">
                      {sc.description}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {sc.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-[11px] font-bold shadow-xs">
                            {k}
                          </kbd>
                          {kIdx < sc.keys.length - 1 && (
                            <span className="text-gray-500 text-xs font-mono">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] font-mono text-gray-400">
          <span>{t("shortcuts.footerHint", "Натисніть Esc для повернення до верстака")}</span>
          <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/20 text-white text-[10px] font-bold">
            Esc
          </kbd>
        </div>
      </div>
    </div>
  );
};
