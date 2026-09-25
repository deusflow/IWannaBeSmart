/**
 * @file apps/web/src/components/profile/tabs/ProfileIdentityTab.tsx
 * @description Callsign, avatar customizer, preset picker, and profile save form.
 */

import React from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Check,
} from "lucide-react";

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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
  );
};
