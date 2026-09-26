/**
 * @file apps/web/src/components/profile/tabs/ProfileIdentityTab.tsx
 * @description Callsign, avatar customizer, architectural patterns dossier, and developer shortcuts.
 */

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Check,
  ShieldCheck,
  Lock,
  Command,
} from "lucide-react";
import { useWorkbenchStore } from "../../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";

const PRESET_AVATARS = [
  { id: "kernel", label: "Kernel-01", url: "https://api.dicebear.com/7.x/bottts/svg?seed=kernel&backgroundColor=1e293b" },
  { id: "cyber", label: "Cyber-99", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cyber&backgroundColor=0f172a" },
  { id: "shield", label: "Guardian", url: "https://api.dicebear.com/7.x/bottts/svg?seed=shield&backgroundColor=1e1b4b" },
  { id: "architect", label: "Architect", url: "https://api.dicebear.com/7.x/bottts/svg?seed=architect&backgroundColor=022c22" },
  { id: "hardware", label: "Circuit", url: "https://api.dicebear.com/7.x/bottts/svg?seed=hardware&backgroundColor=3b0764" },
  { id: "explorer", label: "Telemetry", url: "https://api.dicebear.com/7.x/bottts/svg?seed=explorer&backgroundColor=172554" },
  { id: "neural", label: "Synapse", url: "https://api.dicebear.com/7.x/bottts/svg?seed=neural&backgroundColor=450a0a" },
  { id: "hacker", label: "Firmware", url: "https://api.dicebear.com/7.x/bottts/svg?seed=hacker&backgroundColor=1c1917" },
];

export interface ProfileIdentityTabProps {
  callsign: string;
  setCallsign: (value: string) => void;
  avatarUrl: string;
  setAvatarUrl: (value: string) => void;
  googleAvatar: string | null;
  rank: { title: string; level: string; color: string };
  email?: string;
  isSaving: boolean;
  savedNotice: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResetToGoogle: () => void;
}

export const ProfileIdentityTab: React.FC<ProfileIdentityTabProps> = ({
  callsign,
  setCallsign,
  avatarUrl,
  setAvatarUrl,
  googleAvatar,
  rank,
  email,
  isSaving,
  savedNotice,
  onSubmit,
  onResetToGoogle,
}) => {
  const { t } = useTranslation();
  const { completedCodingTasks, taskMasteryStars } = useWorkbenchStore(
    useShallow((s) => ({
      completedCodingTasks: s.completedCodingTasks,
      taskMasteryStars: s.taskMasteryStars,
    }))
  );

  // 5 Core Architectural Patterns
  const patterns = useMemo(() => [
    {
      id: "state-machine",
      name: "State Machine",
      desc: "Станція 01/02 • Детерміновані переходи станів",
      unlocked: Boolean(
        completedCodingTasks["task-2-branching"] ||
        (taskMasteryStars["task-2-branching"] || 0) >= 1 ||
        completedCodingTasks["task-pos-pin-lockout"] ||
        (taskMasteryStars["task-pos-pin-lockout"] || 0) >= 1
      ),
    },
    {
      id: "guard-clauses",
      name: "Guard Clauses",
      desc: "Станція 01/02 • Раннє повернення помилки, плоска структура",
      unlocked: Boolean(
        completedCodingTasks["task-boundary-guard"] ||
        (taskMasteryStars["task-boundary-guard"] || 0) >= 1 ||
        completedCodingTasks["task-pos-guard-clause"] ||
        (taskMasteryStars["task-pos-guard-clause"] || 0) >= 1
      ),
    },
    {
      id: "polymorphism",
      name: "Polymorphism",
      desc: "Станція 02 • Взаємозамінні платіжні провайдери",
      unlocked: Boolean(
        completedCodingTasks["task-interface-polymorphism"] ||
        (taskMasteryStars["task-interface-polymorphism"] || 0) >= 1 ||
        completedCodingTasks["task-pos-interface-polymorphism"] ||
        (taskMasteryStars["task-pos-interface-polymorphism"] || 0) >= 1
      ),
    },
    {
      id: "dependency-injection",
      name: "Dependency Injection",
      desc: "Станція 02 • Інверсія контролю та DI-контейнер",
      unlocked: Boolean(
        completedCodingTasks["task-di-container"] ||
        (taskMasteryStars["task-di-container"] || 0) >= 1 ||
        completedCodingTasks["task-pos-dependency-injection"] ||
        (taskMasteryStars["task-pos-dependency-injection"] || 0) >= 1
      ),
    },
    {
      id: "open-closed",
      name: "Open-Closed Principle",
      desc: "Станція 01 • Реєстр команд без модифікації ядра",
      unlocked: Boolean(
        completedCodingTasks["task-command-registry"] ||
        (taskMasteryStars["task-command-registry"] || 0) >= 1
      ),
    },
  ], [completedCodingTasks, taskMasteryStars]);

  const unlockedPatternsCount = patterns.filter((p) => p.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Profile Card Header with Live Avatar Preview */}
      <div className="p-4.5 rounded-2xl bg-[#EBE5D8] border-2 border-[#1A1D20]/15 flex items-center gap-4 shadow-paper-xs">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-[#1A1D20]/25 shadow-xs flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={callsign}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
              }}
            />
          ) : (
            <span className="text-xl font-mono font-black text-[#1A1D20]">
              {(callsign || "E").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-display font-extrabold text-[#1A1D20] truncate">
              {callsign || "Engineer"}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${rank.color}`}>
              {rank.level}
            </span>
          </div>
          <div className="text-xs text-[#1A1D20]/75 mt-0.5 font-mono font-bold">
            {rank.title}
          </div>
          <div className="text-[11px] text-[#1A1D20]/50 font-mono truncate mt-0.5">
            {email || "Offline / Guest session"}
          </div>
        </div>
      </div>

      {/* ── Architectural Patterns Dossier (Moved from Workshop Hub) ── */}
      <div className="p-4.5 rounded-2xl bg-[#EBE5D8] border-2 border-[#1A1D20]/15 space-y-3 shadow-paper-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-800 shrink-0" />
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#1A1D20]">
              {t("profile.dossierPatternsTitle", "Досьє архітектурних патернів")}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#1A1D20]/15 font-mono text-[10px] font-bold text-emerald-800">
            {unlockedPatternsCount} / {patterns.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                pattern.unlocked
                  ? "bg-[#FAF8F2] border-emerald-600/40 text-emerald-950 shadow-2xs"
                  : "bg-[#DFD7C5]/40 border-[#1A1D20]/10 text-[#1A1D20]/45"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {pattern.unlocked ? (
                  <CheckCircle2 size={15} className="text-emerald-600" />
                ) : (
                  <Lock size={15} className="text-[#1A1D20]/30" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold flex items-center justify-between gap-1">
                  <span className="truncate">{pattern.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                      pattern.unlocked
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                        : "bg-[#1A1D20]/5 text-[#1A1D20]/40"
                    }`}
                  >
                    {pattern.unlocked ? "✓ Active" : "Locked"}
                  </span>
                </div>
                <div className="text-[10px] text-[#1A1D20]/60 mt-0.5 line-clamp-1">
                  {pattern.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Developer Keyboard Shortcuts Reference (Moved from Header) ── */}
      <div className="p-4.5 rounded-2xl bg-[#EBE5D8] border-2 border-[#1A1D20]/15 space-y-3 shadow-paper-xs">
        <div className="flex items-center gap-2">
          <Command size={16} className="text-accent-blue shrink-0" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#1A1D20]">
            {t("profile.shortcutsTitle", "Гарячі клавіші розробника")}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/10">
            <span className="text-[11px] text-[#1A1D20]/75">{t("shortcuts.cmdK", "Командна палітра")}</span>
            <kbd className="px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 font-bold text-[10px]">⌘K / Ctrl+K</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/10">
            <span className="text-[11px] text-[#1A1D20]/75">{t("shortcuts.runCode", "Виконати перевірку коду")}</span>
            <kbd className="px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 font-bold text-[10px]">Ctrl+Enter</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/10">
            <span className="text-[11px] text-[#1A1D20]/75">{t("shortcuts.esc", "Закрити активне вікно")}</span>
            <kbd className="px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 font-bold text-[10px]">Esc</kbd>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF8F2] border border-[#1A1D20]/10">
            <span className="text-[11px] text-[#1A1D20]/75">{t("shortcuts.muteKey", "Вимкнення звуку")}</span>
            <kbd className="px-2 py-0.5 rounded bg-[#1A1D20]/10 border border-[#1A1D20]/20 font-bold text-[10px]">M</kbd>
          </div>
        </div>
      </div>

      {/* ── Profile Customization Form ── */}
      <form onSubmit={onSubmit} className="space-y-5 pt-1">
        {/* Callsign Input Field */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/75 font-bold mb-1.5">
            {t("profile.callsignLabel", "Позивний інженера (Callsign)")}
          </label>
          <div className="relative flex items-center">
            <User size={15} className="absolute left-3.5 text-[#1A1D20]/40 pointer-events-none" />
            <input
              type="text"
              value={callsign}
              onChange={(e) => setCallsign(e.target.value)}
              placeholder={t("profile.callsignPlaceholder", "Введіть ваш позивний")}
              required
              className="w-full bg-white border-2 border-[#1A1D20]/20 hover:border-[#1A1D20]/40 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1A1D20] placeholder-[#1A1D20]/40 font-mono transition-all outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Preset Avatars Selection */}
        <div>
          <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/75 font-bold mb-2">
            {t("profile.avatarPresetLabel", "Швидкі аватари")}
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = avatarUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setAvatarUrl(preset.url)}
                  className={`group relative p-1 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    isSelected
                      ? "bg-accent-blue/15 border-accent-blue shadow-paper-xs ring-2 ring-accent-blue/30"
                      : "bg-white border-[#1A1D20]/15 hover:border-[#1A1D20]/40 hover:bg-[#FAF8F2]"
                  }`}
                  title={preset.label}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="text-[9px] font-mono text-[#1A1D20]/70 truncate w-full text-center font-bold">
                    {preset.label}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent-blue flex items-center justify-center text-white text-[8px] font-bold">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Avatar URL input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-mono uppercase text-[#1A1D20]/75 font-bold">
              {t("profile.avatarCustomUrlLabel", "Або вкажіть URL власного зображення")}
            </label>
            {googleAvatar && (
              <button
                type="button"
                onClick={onResetToGoogle}
                className="text-[10px] font-mono font-bold text-accent-blue hover:text-accent-blue-hover hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={10} />
                <span>{t("profile.useGoogleAvatar", "Скинути до аватара Google")}</span>
              </button>
            )}
          </div>
          <div className="relative flex items-center">
            <ImageIcon size={15} className="absolute left-3.5 text-[#1A1D20]/40 pointer-events-none" />
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder={t("profile.avatarCustomPlaceholder", "https://example.com/my-avatar.png")}
              className="w-full bg-white border-2 border-[#1A1D20]/20 hover:border-[#1A1D20]/40 focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1A1D20] placeholder-[#1A1D20]/40 font-mono transition-all outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Save Status Banner */}
        {savedNotice && (
          <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in font-display font-bold">
            <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
            <span>{t("profile.savedSuccess", "Профіль успішно оновлено!")}</span>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.99] text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-paper border border-[#1E3A8A] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t("profile.saving", "Збереження...")}</span>
            </>
          ) : (
            <>
              <Check size={16} strokeWidth={2.4} />
              <span>{t("profile.saveChanges", "Зберегти зміни")}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
