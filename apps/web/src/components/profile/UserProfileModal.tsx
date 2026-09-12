/**
 * @file apps/web/src/components/profile/UserProfileModal.tsx
 * @description Blueprint Engineer Profile modal with Callsign/Avatar customization, Learning Analytics, and Achievements.
 */

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  User,
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Layers,
  ArrowRight,
  Tv,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import { FINTECH_TASKS } from "@iw/sim-engine";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "identity" | "analytics" | "achievements";
}

// 8 curated high-tech engineer avatar seeds
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

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = "identity",
}) => {
  const { t } = useTranslation();
  const { user, profile, updateProfile } = useAuthStore();
  const {
    xp,
    taskMasteryStars,
    setCurrentStationId,
    setCurrentView,
  } = useWorkbenchStore(
    useShallow((s) => ({
      xp: s.xp,
      taskMasteryStars: s.taskMasteryStars,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
    }))
  );

  const [activeTab, setActiveTab] = useState<"identity" | "analytics" | "achievements">(initialTab);

  // Form states
  const [callsign, setCallsign] = useState(profile?.callsign || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Google avatar fallback
  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Rank title computation
  const rank = useMemo(() => {
    if (xp >= 600) return { title: t("profile.rankLead", "Головний системний архітектор"), level: "Level 4", color: "text-purple-800 border-purple-600/30 bg-purple-500/15" };
    if (xp >= 300) return { title: t("profile.rankSenior", "Провідний архітектор мікросервісів"), level: "Level 3", color: "text-blue-800 border-blue-600/30 bg-blue-500/15" };
    if (xp >= 100) return { title: t("profile.rankMid", "Системний інженер верстака"), level: "Level 2", color: "text-emerald-800 border-emerald-600/30 bg-emerald-500/15" };
    return { title: t("profile.rankJunior", "Молодший інженер-дослідник"), level: "Level 1", color: "text-amber-800 border-amber-600/30 bg-amber-500/15" };
  }, [xp, t]);

  // Telemetry: strengths & growth areas computation
  const { strengths, growthAreas, totalMasteryStars, maxWpmRecord } = useMemo(() => {
    const starValues = Object.values(taskMasteryStars);
    const starSum = starValues.reduce((acc, s) => acc + (s || 0), 0);

    // Filter fintech tasks into strengths (>= 2 stars) vs growth areas (< 2 stars or unattempted)
    const strongList: Array<{ id: string; title: string; stars: number; station: string }> = [];
    const growthList: Array<{ id: string; title: string; stars: number; stationId: string }> = [];

    // Evaluate Fintech Tasks
    for (const task of FINTECH_TASKS) {
      const stars = taskMasteryStars[task.id] || 0;
      const title = t(task.titleKey, task.id);
      if (stars >= 2) {
        strongList.push({ id: task.id, title, stars, station: "POS Terminal" });
      } else {
        growthList.push({ id: task.id, title, stars, stationId: "pos" });
      }
    }

    return {
      strengths: strongList,
      growthAreas: growthList,
      totalMasteryStars: Math.max(starSum, profile?.total_stars || 0),
      maxWpmRecord: 72, // Benchmark record
    };
  }, [taskMasteryStars, profile?.total_stars, t]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedNotice(false);

    const { error } = await updateProfile({
      callsign: callsign.trim() || "Engineer",
      avatar_url: avatarUrl.trim() || null,
    });

    setIsSaving(false);
    if (!error) {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  const handleResetToGoogle = () => {
    if (googleAvatar) {
      setAvatarUrl(googleAvatar);
    }
  };

  const handleJumpToTask = (stationId: string) => {
    setCurrentStationId(stationId);
    setCurrentView("STATION");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-[#FAF8F2] text-[#1A1D20] border-2 border-[#1A1D20]/30 shadow-2xl flex flex-col overflow-hidden font-sans animate-in zoom-in-95 duration-200">
        {/* Subtle engineering vellum grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(26,29,32,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(26,29,32,0.05)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* ── Modal Header ── */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4.5 border-b border-[#1A1D20]/15 bg-[#EFE9DC]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-blue/15 border-2 border-accent-blue/30 text-accent-blue flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent-blue font-bold">
                ENGINEERING CREDENTIALS
              </div>
              <h2 className="text-base sm:text-lg font-display font-extrabold text-[#1A1D20] tracking-tight">
                {t("profile.modalTitle", "Профіль та аналітика інженера")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#1A1D20]/5 hover:bg-[#1A1D20]/15 border border-[#1A1D20]/20 flex items-center justify-center text-[#1A1D20] transition-all cursor-pointer"
            title={t("common.close", "Закрити")}
          >
            <X size={16} strokeWidth={2.4} />
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="relative z-10 px-6 pt-2 border-b border-[#1A1D20]/15 bg-[#E6DEC9] flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === "identity"
                ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
                : "border-transparent text-[#1A1D20]/60 hover:text-[#1A1D20]"
            }`}
          >
            <User size={14} strokeWidth={2.2} />
            <span>{t("profile.tabIdentity", "Профіль")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
                : "border-transparent text-[#1A1D20]/60 hover:text-[#1A1D20]"
            }`}
          >
            <TrendingUp size={14} strokeWidth={2.2} />
            <span>{t("profile.tabAnalytics", "Аналітика")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-display font-bold transition-all cursor-pointer ${
              activeTab === "achievements"
                ? "border-[#1E3A8A] text-[#1E3A8A] font-extrabold"
                : "border-transparent text-[#1A1D20]/60 hover:text-[#1A1D20]"
            }`}
          >
            <Award size={14} strokeWidth={2.2} />
            <span>{t("profile.tabAchievements", "Досягнення")}</span>
          </button>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {/* ══════════════ TAB 1: PROFILE & IDENTITY ══════════════ */}
          {activeTab === "identity" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
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
                      {callsign || profile?.callsign || "Engineer"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${rank.color}`}>
                      {rank.level}
                    </span>
                  </div>
                  <div className="text-xs text-[#1A1D20]/75 mt-0.5 font-mono font-bold">
                    {rank.title}
                  </div>
                  <div className="text-[11px] text-[#1A1D20]/50 font-mono truncate mt-0.5">
                    {user?.email || "Offline / Guest session"}
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
                      onClick={handleResetToGoogle}
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
          )}

          {/* ══════════════ TAB 2: LEARNING ANALYTICS & DIAGNOSTICS ══════════════ */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 shadow-paper-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-800 font-bold">
                    <Zap size={13} className="text-amber-700" />
                    <span>{t("profile.bestWpmLabel", "Рекордна швидкість")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-[#1A1D20] flex items-baseline gap-1">
                    <span>{maxWpmRecord}</span>
                    <span className="text-xs font-mono text-[#1A1D20]/60 font-normal">WPM</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 shadow-paper-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-blue-900 font-bold">
                    <Sparkles size={13} className="text-accent-blue" />
                    <span>{t("profile.masteredStarsLabel", "Освоєно зірок")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-[#1A1D20]">
                    ★ {totalMasteryStars} / 57
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 shadow-paper-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-800 font-bold">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>{t("profile.accuracyLabel", "Точність синтаксису")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-[#1A1D20]">
                    98.4%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 shadow-paper-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-purple-900 font-bold">
                    <Award size={13} className="text-purple-700" />
                    <span>Досвід (XP)</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-[#1A1D20]">
                    {xp} XP
                  </div>
                </div>
              </div>

              {/* SECTION: Strengths (What went well) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1D20] uppercase tracking-wider font-mono">
                      {t("profile.strengthsTitle", "Сильні сторони (Що виходить відмінно)")}
                    </h4>
                    <p className="text-[11px] text-[#1A1D20]/70">
                      {t("profile.strengthsSubtitle", "Освоєні навички та високі показники телеметрії")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {strengths.length > 0 ? (
                    strengths.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-600/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-emerald-800 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-600/30">
                            {item.station}
                          </span>
                          <span className="font-display font-bold text-[#1A1D20]">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 font-mono font-bold">
                          {"★".repeat(item.stars)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-[#EBE5D8] border border-[#1A1D20]/15 text-[#1A1D20]/70 text-xs font-mono">
                      Виконайте кілька завдань на 2 або 3 зірки, щоб зафіксувати свої сильні сторони.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Growth Areas (What needs improvement) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1D20] uppercase tracking-wider font-mono">
                      {t("profile.growthAreasTitle", "Точки зростання (Над чим попрацювати)")}
                    </h4>
                    <p className="text-[11px] text-[#1A1D20]/70">
                      {t("profile.growthAreasSubtitle", "Завдання, які потребують повторення або покращення темпу")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {growthAreas.length > 0 ? (
                    growthAreas.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-600/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-amber-900 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-600/30">
                            {item.stars === 0 ? "UNATTEMPTED" : `${item.stars} ★`}
                          </span>
                          <span className="font-display font-bold text-[#1A1D20]">{item.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJumpToTask(item.stationId)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-900 border border-amber-600/40 text-[11px] font-display font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 shadow-2xs"
                        >
                          <span>{t("profile.practiceTaskBtn", "Практикувати")}</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-600/30 text-emerald-900 text-xs font-mono">
                      {t("profile.noGrowthAreas", "Всі відкриті завдання виконано на високому рівні! Відмінна робота.")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════ TAB 3: ACHIEVEMENTS & CERTIFICATES ══════════════ */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <div className="text-xs text-[#1A1D20]/70 font-mono font-bold">
                {t("profile.achievementsSubtitle", "Сертифікати та досягнення у вирішенні завдань")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Badge 1: Speed Demon */}
                <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-600/40 text-amber-800 flex items-center justify-center shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xs text-[#1A1D20]">
                      {t("profile.badgeSpeedDemon", "Спринтер алгоритмів")}
                    </div>
                    <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
                      {t("profile.badgeSpeedDemonDesc", "Досягнуто швидкість понад 60 слів/хв у Code Gym")}
                    </div>
                  </div>
                </div>

                {/* Badge 2: Architecture Master */}
                <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
                  <div className="w-9 h-9 rounded-xl bg-accent-blue/15 border border-accent-blue/30 text-accent-blue flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xs text-[#1A1D20]">
                      {t("profile.badgeArchitectureMaster", "Майстер архітектури")}
                    </div>
                    <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
                      {t("profile.badgeArchitectureMasterDesc", "Успішно зібрано DI контейнер та з'єднано шину викликів")}
                    </div>
                  </div>
                </div>

                {/* Badge 3: Fintech Shield */}
                <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-600/40 text-emerald-800 flex items-center justify-center shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xs text-[#1A1D20]">
                      {t("profile.badgeFintechShield", "Вартовий транзакцій")}
                    </div>
                    <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
                      {t("profile.badgeFintechShieldDesc", "Захищено банківський POS-термінал від збоїв та блокувань")}
                    </div>
                  </div>
                </div>

                {/* Badge 4: Pattern Collector */}
                <div className="p-4 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 flex items-start gap-3 shadow-paper-xs">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-600/40 text-purple-800 flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="font-display font-extrabold text-xs text-[#1A1D20]">
                      {t("profile.badgePatternCollector", "Колекціонер патернів")}
                    </div>
                    <div className="text-[11px] text-[#1A1D20]/70 mt-0.5">
                      {t("profile.badgePatternCollectorDesc", "Освоєно понад 5 ключових патернів проєктування")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Station Certificates Showcase */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-mono uppercase font-bold text-[#1A1D20]/70">
                  Доступні сертифікати інженера
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border-2 border-[#1A1D20]/20 flex items-center justify-between shadow-paper-xs">
                    <div className="flex items-center gap-2.5">
                      <Tv size={16} className="text-accent-blue" />
                      <div>
                        <div className="text-xs font-display font-extrabold text-[#1A1D20]">
                          {t("profile.badgeCertStation1", "Сертифікат Станції 01")}
                        </div>
                        <div className="text-[10px] text-[#1A1D20]/60 font-mono">13 / 13 завдань</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30">
                      ЗДОБУТО
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF8F2] border-2 border-[#1A1D20]/20 flex items-center justify-between shadow-paper-xs">
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={16} className="text-emerald-700" />
                      <div>
                        <div className="text-xs font-display font-extrabold text-[#1A1D20]">
                          {t("profile.badgeCertStation2", "Сертифікат Станції 02")}
                        </div>
                        <div className="text-[10px] text-[#1A1D20]/60 font-mono">Fintech Code Gym</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-600/30">
                      ЗДОБУТО
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
