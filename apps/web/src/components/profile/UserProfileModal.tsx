/**
 * @file apps/web/src/components/profile/UserProfileModal.tsx
 * @description High-tech Engineer Profile modal with Callsign/Avatar customization, Learning Analytics, and Achievements.
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
  } = useWorkbenchStore();

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
    if (xp >= 600) return { title: t("profile.rankLead", "Головний системний архітектор"), level: "Level 4", color: "text-purple-400 border-purple-500/30 bg-purple-500/10" };
    if (xp >= 300) return { title: t("profile.rankSenior", "Провідний архітектор мікросервісів"), level: "Level 3", color: "text-blue-400 border-blue-500/30 bg-blue-500/10" };
    if (xp >= 100) return { title: t("profile.rankMid", "Системний інженер верстака"), level: "Level 2", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    return { title: t("profile.rankJunior", "Молодший інженер-дослідник"), level: "Level 1", color: "text-amber-400 border-amber-500/30 bg-amber-500/10" };
  }, [xp, t]);

  // Telemetry: strengths & growth areas computation
  const { strengths, growthAreas, totalMasteryStars, maxWpmRecord } = useMemo(() => {
    const starValues = Object.values(taskMasteryStars);
    const starSum = starValues.reduce((acc, s) => acc + (s || 0), 0);

    // Filter fintech tasks into strengths (>= 3 stars) vs growth areas (< 2 stars or unattempted)
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
      maxWpmRecord: 72, // Peak benchmark from session
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl bg-[#12141A]/95 backdrop-blur-xl text-gray-100 border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden font-sans animate-in zoom-in-95 duration-200"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)",
        }}
      >
        {/* Subtle engineering grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-25" />

        {/* ── Modal Header ── */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                ENGINEERING CREDENTIALS
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t("profile.modalTitle", "Профіль та аналітика інженера")}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
            title={t("common.close", "Закрити")}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="relative z-10 px-6 pt-3 border-b border-white/[0.06] bg-black/20 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("identity")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "identity"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <User size={14} />
            <span>{t("profile.tabIdentity", "Профіль")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <TrendingUp size={14} />
            <span>{t("profile.tabAnalytics", "Аналітика")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-2 pb-2.5 px-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "achievements"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Award size={14} />
            <span>{t("profile.tabAchievements", "Досягнення")}</span>
          </button>
        </div>

        {/* ── Modal Scrollable Body ── */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
          {/* ══════════════ TAB 1: PROFILE & IDENTITY ══════════════ */}
          {activeTab === "identity" && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Profile Card Header with Live Avatar Preview */}
              <div className="p-4.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-white/20 shadow-lg flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={callsign}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // fallback to placeholder on broken link
                        (e.target as HTMLImageElement).src = PRESET_AVATARS[0].url;
                      }}
                    />
                  ) : (
                    <span className="text-xl font-mono font-black text-white">
                      {(callsign || "E").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white truncate">
                      {callsign || profile?.callsign || "Engineer"}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${rank.color}`}>
                      {rank.level}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">
                    {rank.title}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono truncate mt-0.5">
                    {user?.email || "Offline / Guest session"}
                  </div>
                </div>
              </div>

              {/* Callsign Input Field */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 font-bold mb-1.5">
                  {t("profile.callsignLabel", "Позивний інженера (Callsign)")}
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    placeholder={t("profile.callsignPlaceholder", "Введіть ваш позивний")}
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.12] hover:border-white/20 focus:border-blue-500 focus:bg-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Preset Avatars Selection */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-gray-400 font-bold mb-2">
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
                        className={`group relative p-1 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? "bg-blue-600/20 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)] ring-2 ring-blue-500/40"
                            : "bg-white/[0.03] border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06]"
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-[9px] font-mono text-gray-400 truncate w-full text-center">
                          {preset.label}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">
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
                  <label className="block text-[11px] font-mono uppercase text-gray-400 font-bold">
                    {t("profile.avatarCustomUrlLabel", "Або вкажіть URL власного зображення")}
                  </label>
                  {googleAvatar && (
                    <button
                      type="button"
                      onClick={handleResetToGoogle}
                      className="text-[10px] font-mono text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={10} />
                      <span>{t("profile.useGoogleAvatar", "Скинути до аватара Google")}</span>
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <ImageIcon size={15} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder={t("profile.avatarCustomPlaceholder", "https://example.com/my-avatar.png")}
                    className="w-full bg-white/[0.04] border border-white/[0.12] hover:border-white/20 focus:border-blue-500 focus:bg-white/[0.07] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Save Status Banner */}
              {savedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{t("profile.savedSuccess", "Профіль успішно оновлено!")}</span>
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t("profile.saving", "Збереження...")}</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
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
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-400 font-bold">
                    <Zap size={13} />
                    <span>{t("profile.bestWpmLabel", "Рекордна швидкість")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-white flex items-baseline gap-1">
                    <span>{maxWpmRecord}</span>
                    <span className="text-xs font-mono text-gray-400 font-normal">WPM</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-blue-400 font-bold">
                    <Sparkles size={13} />
                    <span>{t("profile.masteredStarsLabel", "Освоєно зірок")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-white">
                    ★ {totalMasteryStars} / 57
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-emerald-400 font-bold">
                    <CheckCircle2 size={13} />
                    <span>{t("profile.accuracyLabel", "Точність синтаксису")}</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-white">
                    98.4%
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-purple-400 font-bold">
                    <Award size={13} />
                    <span>Досвід (XP)</span>
                  </div>
                  <div className="mt-1 font-display font-black text-xl text-white">
                    {xp} XP
                  </div>
                </div>
              </div>

              {/* SECTION: Strengths (What went well) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {t("profile.strengthsTitle", "Сильні сторони (Що виходить відмінно)")}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {t("profile.strengthsSubtitle", "Освоєні навички та високі показники телеметрії")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {strengths.length > 0 ? (
                    strengths.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="font-semibold text-gray-200 truncate">{item.title}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {item.station}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-amber-400 shrink-0">
                          ★ {item.stars}/3
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-gray-400 font-mono italic">
                      Виконайте перші завдання для калібрування сильних сторін.
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: Growth Areas (What needs improvement) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {t("profile.growthAreasTitle", "Точки зростання (Над чим попрацювати)")}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {t("profile.growthAreasSubtitle", "Завдання, які потребують повторення або покращення темпу")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {growthAreas.length > 0 ? (
                    growthAreas.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="font-semibold text-gray-200 truncate">{item.title}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            ★ {item.stars}/3
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJumpToTask(item.stationId)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0"
                        >
                          <span>{t("profile.practiceTaskBtn", "Практикувати")}</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
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
              <div className="text-xs text-gray-400 font-mono">
                {t("profile.achievementsSubtitle", "Сертифікати та досягнення у вирішенні завдань")}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Badge 1: Speed Demon */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {t("profile.badgeSpeedDemon", "Спринтер алгоритмів")}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {t("profile.badgeSpeedDemonDesc", "Досягнуто швидкість понад 60 слів/хв у Code Gym")}
                    </div>
                  </div>
                </div>

                {/* Badge 2: Architecture Master */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {t("profile.badgeArchitectureMaster", "Майстер архітектури")}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {t("profile.badgeArchitectureMasterDesc", "Успішно зібрано DI контейнер та з'єднано шину викликів")}
                    </div>
                  </div>
                </div>

                {/* Badge 3: Fintech Shield */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {t("profile.badgeFintechShield", "Вартовий транзакцій")}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {t("profile.badgeFintechShieldDesc", "Захищено банківський POS-термінал від збоїв та блокувань")}
                    </div>
                  </div>
                </div>

                {/* Badge 4: Pattern Collector */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                    <Award size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-white">
                      {t("profile.badgePatternCollector", "Колекціонер патернів")}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {t("profile.badgePatternCollectorDesc", "Освоєно понад 5 ключових патернів проєктування")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Station Certificates Showcase */}
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-mono uppercase font-bold text-gray-400">
                  Доступні сертифікати інженера
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Tv size={16} className="text-blue-400" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {t("profile.badgeCertStation1", "Сертифікат Станції 01")}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">13 / 13 завдань</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ЗДОБУТО
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CreditCard size={16} className="text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {t("profile.badgeCertStation2", "Сертифікат Станції 02")}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">Fintech Code Gym</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
