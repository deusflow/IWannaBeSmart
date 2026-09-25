/**
 * @file apps/web/src/components/profile/UserProfileModal.tsx
 * @description Blueprint Engineer Profile modal decomposed into modular tabs:
 *              - ProfileIdentityTab (callsign, avatars, custom URL)
 *              - ProfileAnalyticsTab (WPM, stars, telemetry strengths/growth)
 *              - ProfileAchievementsTab (skill badges, station certifications)
 */

import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  User,
  ShieldCheck,
  Award,
  TrendingUp,
  Tv,
  CreditCard,
  Server,
  GitBranch,
  ShieldAlert,
  Zap,
  Layers,
  Cloud,
  Briefcase,
  Bot,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import {
  CODING_TASKS,
  FINTECH_TASKS,
  API_FORGE_TASKS,
  GIT_TASKS,
  BANDIT_TASKS,
  VERTEX_TASKS,
  FDE_TASKS,
  RAG_TASKS,
  CYBER_TASKS,
  TOTAL_MAX_STARS,
} from "@iw/sim-engine";
import { ProfileIdentityTab } from "./tabs/ProfileIdentityTab";
import { ProfileAnalyticsTab } from "./tabs/ProfileAnalyticsTab";
import {
  ProfileAchievementsTab,
  ProfileCertCard,
  ProfileBadge,
} from "./tabs/ProfileAchievementsTab";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "identity" | "analytics" | "achievements";
}

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
    taskBestWpm,
    completedCodingTasks,
    setCurrentStationId,
    setCurrentView,
    setStationVictoryModalOpen,
    setPosVictoryModalOpen,
    setApiVictoryModalOpen,
    setGitVictoryModalOpen,
    setBanditVictoryModalOpen,
    setVertexVictoryModalOpen,
    setFdeVictoryModalOpen,
    setRagVictoryModalOpen,
    setCyberVictoryModalOpen,
    setTargetTaskId,
  } = useWorkbenchStore(
    useShallow((s) => ({
      xp: s.xp,
      taskMasteryStars: s.taskMasteryStars,
      taskBestWpm: s.taskBestWpm,
      completedCodingTasks: s.completedCodingTasks,
      setCurrentStationId: s.setCurrentStationId,
      setCurrentView: s.setCurrentView,
      setStationVictoryModalOpen: s.setStationVictoryModalOpen,
      setPosVictoryModalOpen: s.setPosVictoryModalOpen,
      setApiVictoryModalOpen: s.setApiVictoryModalOpen,
      setGitVictoryModalOpen: s.setGitVictoryModalOpen,
      setBanditVictoryModalOpen: s.setBanditVictoryModalOpen,
      setVertexVictoryModalOpen: s.setVertexVictoryModalOpen,
      setFdeVictoryModalOpen: s.setFdeVictoryModalOpen,
      setRagVictoryModalOpen: s.setRagVictoryModalOpen,
      setCyberVictoryModalOpen: s.setCyberVictoryModalOpen,
      setTargetTaskId: s.setTargetTaskId,
    }))
  );

  const [activeTab, setActiveTab] = useState<"identity" | "analytics" | "achievements">(initialTab);

  // Form states
  const [callsign, setCallsign] = useState(profile?.callsign || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Sync profile values when profile changes
  useEffect(() => {
    if (profile?.callsign) setCallsign(profile.callsign);
    if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);
  }, [profile?.callsign, profile?.avatar_url]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Google avatar fallback
  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  // Rank title computation
  const rank = useMemo(() => {
    if (xp >= 600) return { title: t("profile.rankLead", "Головний системний архітектор"), level: "Level 4", color: "text-purple-800 border-purple-600/30 bg-purple-500/15" };
    if (xp >= 300) return { title: t("profile.rankSenior", "Провідний архітектор мікросервісів"), level: "Level 3", color: "text-blue-800 border-blue-600/30 bg-blue-500/15" };
    if (xp >= 100) return { title: t("profile.rankMid", "Системний інженер верстака"), level: "Level 2", color: "text-emerald-800 border-emerald-600/30 bg-emerald-500/15" };
    return { title: t("profile.rankJunior", "Молодший інженер-дослідник"), level: "Level 1", color: "text-amber-800 border-amber-600/30 bg-amber-500/15" };
  }, [xp, t]);

  // Telemetry: strengths & growth areas computation across all 5 stations
  const { strengths, growthAreas, totalMasteryStars, maxWpmRecord, accuracyRate } = useMemo(() => {
    const starValues = Object.values(taskMasteryStars);
    const starSum = starValues.reduce((acc, s) => acc + (s || 0), 0);

    const strongList: Array<{ id: string; title: string; stars: number; station: string }> = [];
    const growthList: Array<{ id: string; title: string; stars: number; stationId: string; stationName: string }> = [];

    const stationGroups = [
      { tasks: CODING_TASKS, stationId: "tv", stationName: "Smart TV" },
      { tasks: FINTECH_TASKS, stationId: "pos", stationName: "POS Terminal" },
      { tasks: API_FORGE_TASKS, stationId: "api", stationName: "API Forge" },
      { tasks: GIT_TASKS, stationId: "git", stationName: "Git Time Machine" },
      { tasks: BANDIT_TASKS, stationId: "bandit", stationName: "Cyber Bandit" },
      { tasks: VERTEX_TASKS, stationId: "vertex", stationName: "Vertex AI" },
      { tasks: FDE_TASKS, stationId: "fde", stationName: "Field AI Deployer" },
      { tasks: RAG_TASKS, stationId: "rag", stationName: "IBM RAG & Agentic AI" },
      { tasks: CYBER_TASKS, stationId: "cyber", stationName: "Google Cybersecurity" },
    ];

    for (const group of stationGroups) {
      for (const task of group.tasks) {
        const rawStars = taskMasteryStars[task.id] || 0;
        const isDone = Boolean(completedCodingTasks[task.id]);
        const effectiveStars = rawStars > 0 ? rawStars : isDone ? 1 : 0;
        const title = t(task.titleKey, task.id);

        if (effectiveStars >= 2) {
          strongList.push({ id: task.id, title, stars: effectiveStars, station: group.stationName });
        } else {
          growthList.push({
            id: task.id,
            title,
            stars: effectiveStars,
            stationId: group.stationId,
            stationName: group.stationName,
          });
        }
      }
    }

    // Prioritize growth areas: in-progress tasks first (stars === 1), then unattempted
    growthList.sort((a, b) => {
      if (a.stars !== b.stars) return b.stars - a.stars;
      return 0;
    });

    const wpmValues = Object.values(taskBestWpm || {});
    const recordedMaxWpm = wpmValues.length > 0 ? Math.max(...wpmValues) : 0;
    const computedStars = Math.max(starSum, profile?.total_stars || 0);
    const accuracyRate =
      computedStars > 0 || recordedMaxWpm > 0
        ? Number((96.2 + Math.min(3.6, (computedStars / (TOTAL_MAX_STARS || 292)) * 3.6)).toFixed(1))
        : null;

    return {
      strengths: strongList,
      growthAreas: growthList,
      totalMasteryStars: computedStars,
      maxWpmRecord: recordedMaxWpm,
      accuracyRate,
    };
  }, [taskMasteryStars, taskBestWpm, completedCodingTasks, profile?.total_stars, t]);

  // Dynamic station certificates verification across all 5 modules
  const certCards: ProfileCertCard[] = useMemo(() => {
    const checkCert = (tasks: Array<{ id: string }>) => {
      const completedCount = tasks.filter(
        (task) => (taskMasteryStars[task.id] || 0) >= 1 || completedCodingTasks[task.id]
      ).length;
      const isEligible = completedCount === tasks.length;
      return { completedCount, total: tasks.length, isEligible };
    };

    const tvStatus = checkCert(CODING_TASKS);
    const posStatus = checkCert(FINTECH_TASKS);
    const apiStatus = checkCert(API_FORGE_TASKS);
    const gitStatus = checkCert(GIT_TASKS);
    const banditStatus = checkCert(BANDIT_TASKS);
    const vertexStatus = checkCert(VERTEX_TASKS);
    const fdeStatus = checkCert(FDE_TASKS);
    const ragStatus = checkCert(RAG_TASKS);
    const cyberStatus = checkCert(CYBER_TASKS);

    return [
      {
        id: "tv",
        title: t("profile.badgeCertStation1", "Сертифікат Станції 01"),
        spec: t("profile.tasksCount", { completed: tvStatus.completedCount, total: tvStatus.total, defaultValue: `${tvStatus.completedCount} / ${tvStatus.total} tasks` }),
        icon: Tv,
        iconColor: "text-accent-blue",
        status: tvStatus,
        onViewCert: () => {
          onClose();
          setStationVictoryModalOpen(true);
        },
      },
      {
        id: "pos",
        title: t("profile.badgeCertStation2", "Сертифікат Станції 02"),
        spec: t("profile.tasksCount", { completed: posStatus.completedCount, total: posStatus.total, defaultValue: `${posStatus.completedCount} / ${posStatus.total} tasks` }),
        icon: CreditCard,
        iconColor: "text-emerald-700",
        status: posStatus,
        onViewCert: () => {
          onClose();
          setPosVictoryModalOpen(true);
        },
      },
      {
        id: "api",
        title: t("profile.badgeCertStation4", "Сертифікат Станції 04 (API Forge)"),
        spec: t("profile.tasksCount", { completed: apiStatus.completedCount, total: apiStatus.total, defaultValue: `${apiStatus.completedCount} / ${apiStatus.total} tasks` }),
        icon: Server,
        iconColor: "text-cyan-700",
        status: apiStatus,
        onViewCert: () => {
          onClose();
          setApiVictoryModalOpen(true);
        },
      },
      {
        id: "git",
        title: t("profile.badgeCertStation5", "Сертифікат Станції 05 (Git)"),
        spec: t("profile.tasksCount", { completed: gitStatus.completedCount, total: gitStatus.total, defaultValue: `${gitStatus.completedCount} / ${gitStatus.total} tasks` }),
        icon: GitBranch,
        iconColor: "text-purple-700",
        status: gitStatus,
        onViewCert: () => {
          onClose();
          setGitVictoryModalOpen(true);
        },
      },
      {
        id: "bandit",
        title: t("profile.badgeCertStation6", "Сертифікат Станції 06 (Cyber Bandit)"),
        spec: t("profile.tasksCount", { completed: banditStatus.completedCount, total: banditStatus.total, defaultValue: `${banditStatus.completedCount} / ${banditStatus.total} tasks` }),
        icon: ShieldAlert,
        iconColor: "text-rose-700",
        status: banditStatus,
        onViewCert: () => {
          onClose();
          setBanditVictoryModalOpen(true);
        },
      },
      {
        id: "vertex",
        title: t("profile.badgeCertStation7", "Сертифікат Станції 07 (Vertex AI)"),
        spec: t("profile.tasksCount", { completed: vertexStatus.completedCount, total: vertexStatus.total, defaultValue: `${vertexStatus.completedCount} / ${vertexStatus.total} tasks` }),
        icon: Cloud,
        iconColor: "text-blue-600",
        status: vertexStatus,
        onViewCert: () => {
          onClose();
          setVertexVictoryModalOpen(true);
        },
      },
      {
        id: "fde",
        title: t("profile.badgeCertStation8", "Сертифікат Станції 08 (Field AI Deployer)"),
        spec: t("profile.tasksCount", { completed: fdeStatus.completedCount, total: fdeStatus.total, defaultValue: `${fdeStatus.completedCount} / ${fdeStatus.total} tasks` }),
        icon: Briefcase,
        iconColor: "text-purple-600",
        status: fdeStatus,
        onViewCert: () => {
          onClose();
          setFdeVictoryModalOpen(true);
        },
      },
      {
        id: "rag",
        title: t("profile.badgeCertStation9", "Сертифікат Станції 09 (IBM RAG & Agentic AI)"),
        spec: t("profile.tasksCount", { completed: ragStatus.completedCount, total: ragStatus.total, defaultValue: `${ragStatus.completedCount} / ${ragStatus.total} tasks` }),
        icon: Bot,
        iconColor: "text-cyan-600",
        status: ragStatus,
        onViewCert: () => {
          onClose();
          setRagVictoryModalOpen(true);
        },
      },
      {
        id: "cyber",
        title: t("profile.badgeCertStation10", "Сертифікат Станції 10 (Google Cybersecurity)"),
        spec: t("profile.tasksCount", { completed: cyberStatus.completedCount, total: cyberStatus.total, defaultValue: `${cyberStatus.completedCount} / ${cyberStatus.total} tasks` }),
        icon: ShieldCheck,
        iconColor: "text-emerald-600",
        status: cyberStatus,
        onViewCert: () => {
          onClose();
          setCyberVictoryModalOpen(true);
        },
      },
    ];
  }, [
    taskMasteryStars,
    completedCodingTasks,
    t,
    onClose,
    setStationVictoryModalOpen,
    setPosVictoryModalOpen,
    setApiVictoryModalOpen,
    setGitVictoryModalOpen,
    setBanditVictoryModalOpen,
    setVertexVictoryModalOpen,
    setFdeVictoryModalOpen,
    setRagVictoryModalOpen,
    setCyberVictoryModalOpen,
  ]);

  const badges: ProfileBadge[] = useMemo(() => {
    const patternsCount = [
      Boolean(
        completedCodingTasks["task-2-branching"] ||
        (taskMasteryStars["task-2-branching"] || 0) >= 1 ||
        completedCodingTasks["task-pos-pin-lockout"] ||
        (taskMasteryStars["task-pos-pin-lockout"] || 0) >= 1
      ),
      Boolean(
        completedCodingTasks["task-boundary-guard"] ||
        (taskMasteryStars["task-boundary-guard"] || 0) >= 1 ||
        completedCodingTasks["task-pos-guard-clause"] ||
        (taskMasteryStars["task-pos-guard-clause"] || 0) >= 1
      ),
      Boolean(
        completedCodingTasks["task-interface-polymorphism"] ||
        (taskMasteryStars["task-interface-polymorphism"] || 0) >= 1 ||
        completedCodingTasks["task-pos-interface-polymorphism"] ||
        (taskMasteryStars["task-pos-interface-polymorphism"] || 0) >= 1
      ),
      Boolean(
        completedCodingTasks["task-di-container"] ||
        (taskMasteryStars["task-di-container"] || 0) >= 1 ||
        completedCodingTasks["task-pos-dependency-injection"] ||
        (taskMasteryStars["task-pos-dependency-injection"] || 0) >= 1
      ),
      Boolean(
        completedCodingTasks["task-command-registry"] ||
        (taskMasteryStars["task-command-registry"] || 0) >= 1
      ),
    ].filter(Boolean).length;

    return [
      {
        id: "speed-demon",
        title: t("profile.badgeSpeedDemon", "Спринтер алгоритмів"),
        desc: t("profile.badgeSpeedDemonDesc", "Досягнуто швидкість понад 60 слів/хв у Code Gym"),
        icon: Zap,
        iconColor: "text-amber-800",
        bgColor: "bg-amber-500/20 border-amber-600/40",
        isUnlocked: maxWpmRecord >= 60,
        progressText: `${maxWpmRecord} / 60 WPM`,
      },
      {
        id: "architecture-master",
        title: t("profile.badgeArchitectureMaster", "Майстер архітектури"),
        desc: t("profile.badgeArchitectureMasterDesc", "Успішно зібрано DI контейнер та з'єднано шину викликів"),
        icon: Layers,
        iconColor: "text-accent-blue",
        bgColor: "bg-accent-blue/15 border-accent-blue/30",
        isUnlocked: Boolean(
          completedCodingTasks["task-di-container"] ||
          (taskMasteryStars["task-di-container"] || 0) >= 1 ||
          completedCodingTasks["task-interface-polymorphism"] ||
          (taskMasteryStars["task-interface-polymorphism"] || 0) >= 1
        ),
      },
      {
        id: "fintech-shield",
        title: t("profile.badgeFintechShield", "Вартовий транзакцій"),
        desc: t("profile.badgeFintechShieldDesc", "Захищено банківський POS-термінал від збоїв та блокувань"),
        icon: CreditCard,
        iconColor: "text-emerald-800",
        bgColor: "bg-emerald-500/20 border-emerald-600/40",
        isUnlocked: Boolean(
          (completedCodingTasks["task-pos-pin-lockout"] || (taskMasteryStars["task-pos-pin-lockout"] || 0) >= 1) &&
          (completedCodingTasks["task-pos-guard-clause"] || (taskMasteryStars["task-pos-guard-clause"] || 0) >= 1)
        ),
      },
      {
        id: "pattern-collector",
        title: t("profile.badgePatternCollector", "Колекціонер патернів"),
        desc: t("profile.badgePatternCollectorDesc", "Освоєно понад 5 ключових патернів проєктування"),
        icon: Award,
        iconColor: "text-purple-800",
        bgColor: "bg-purple-500/20 border-purple-600/40",
        isUnlocked: patternsCount >= 5,
        progressText: `${patternsCount} / 5`,
      },
    ];
  }, [maxWpmRecord, completedCodingTasks, taskMasteryStars, t]);

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

  const handleJumpToTask = (stationId: string, taskId?: string) => {
    setCurrentStationId(stationId);
    setCurrentView("STATION");
    if (taskId) {
      setTargetTaskId(taskId);
    }
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
          {activeTab === "identity" && (
            <ProfileIdentityTab
              callsign={callsign}
              setCallsign={setCallsign}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              googleAvatar={googleAvatar}
              rank={rank}
              email={user?.email}
              isSaving={isSaving}
              savedNotice={savedNotice}
              onSubmit={handleSaveProfile}
              onResetToGoogle={handleResetToGoogle}
            />
          )}

          {activeTab === "analytics" && (
            <ProfileAnalyticsTab
              maxWpmRecord={maxWpmRecord}
              totalMasteryStars={totalMasteryStars}
              xp={xp}
              accuracyRate={accuracyRate}
              strengths={strengths}
              growthAreas={growthAreas}
              onJumpToTask={handleJumpToTask}
            />
          )}

          {activeTab === "achievements" && (
            <ProfileAchievementsTab
              certCards={certCards}
              badges={badges}
              onJumpToTask={handleJumpToTask}
            />
          )}
        </div>
      </div>
    </div>
  );
};
