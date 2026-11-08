/**
 * @file apps/web/src/components/workbench/GitStationVictoryModal.tsx
 * @description Station 05: Git Time Machine Victory Modal with Git & DevOps Architect Skill Matrix
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Award,
  Download,
  Copy,
  X,
  GitBranch,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { StationTrackNavigator } from "./career/StationTrackNavigator";
import { GIT_TASKS } from "@iw/sim-engine";

interface GitStationVictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  xp: number;
}

interface SkillItem {
  id: string;
  nameKey: string;
  codeExample: string;
  category: string;
}

const GIT_SKILLS: SkillItem[] = [
  {
    id: "genesis-dag",
    nameKey: "git.skills.genesisDag",
    codeExample: 'git commit -m "feat: init immutable DAG commit"',
    category: "DAG Structure & Commits",
  },
  {
    id: "branching-pointers",
    nameKey: "git.skills.branchingPointers",
    codeExample: "git checkout -b feature/telemetry-sensor",
    category: "Lightweight Branch References & HEAD",
  },
  {
    id: "fast-forward-3way",
    nameKey: "git.skills.fastForward3Way",
    codeExample: "git merge feature/telemetry-sensor",
    category: "Fast-Forward & 3-Way Merges",
  },
  {
    id: "conflict-resolver",
    nameKey: "git.skills.conflictResolver",
    codeExample: "<<<<<<< HEAD\nport=8080\n=======\nport=9090\n>>>>>>> dev",
    category: "3-Way Conflict Detection & Resolution",
  },
  {
    id: "linear-rebase",
    nameKey: "git.skills.linearRebase",
    codeExample: "git rebase main // linear history restoration",
    category: "History Rewriting & Rebase",
  },
  {
    id: "github-pr-flow",
    nameKey: "git.skills.githubPrFlow",
    codeExample: "git push origin feature && gh pr create --fill",
    category: "GitHub Flow, CI Gates & Pull Requests",
  },
];

export const GitStationVictoryModal: React.FC<GitStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string>(GIT_SKILLS[0].id);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState<boolean>(true);

  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);

  const currentGitStars = GIT_TASKS.reduce((acc, t) => acc + (taskMasteryStars[t.id] || 0), 0);
  const maxGitStars = GIT_TASKS.length * 4;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadSvg = () => {
    audioFx.playRelayClick();
    downloadCertificateSvg({
      stationCode: "GIT",
      stationTitle: "Station 05: Git Time Machine — Version Control Engine",
      credentialTitle: "Certified Git & DevOps Architect",
      callsign: callsign || "Cadet Engineer",
      stars: currentGitStars,
      maxStars: maxGitStars,
      xp,
      competencies: [
        "DAG Directed Acyclic Graph Commit Topology",
        "Branch Pointers & HEAD Reference Manipulation",
        "Fast-Forward vs 3-Way Merge Resolution",
        "Conflict Detection & Clean Working Tree Restoration",
        "Linear History Rebase & Commits Replay",
        "GitHub Flow & Pull Request CI Gates",
      ],
      themeColor: "#8B5CF6",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `
================================================================================
  INTERACTIVE WORKBENCH: GIT & DEVOPS ARCHITECT CERTIFICATE
  STATION 05: GIT TIME MACHINE — COMPLETED WITH HONORS!
================================================================================

Candidate:    ${callsign || "Cadet Engineer"}
Mastery:      ${currentGitStars} / ${maxGitStars} Stars (DAG Engine Verified)
Total XP:     +${xp} XP

Verified Competencies:
  [✓] DAG Directed Acyclic Graph Commit Topology
  [✓] Branch Pointers, Reference Updates & Detached HEAD
  [✓] Fast-Forward vs 3-Way Merge Resolution
  [✓] 3-Way Conflict Triaging & Clean State Restoration
  [✓] Linear History Rebase & Commits Replay
  [✓] GitHub Flow, Pull Request Automation & CI Protection

Verification Hash: IW-GIT-MASTER-${Math.random().toString(36).substring(2, 9).toUpperCase()}
================================================================================
    `.trim();

    navigator.clipboard?.writeText(certText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          title={t("common.close", "Закрити")}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>{currentGitStars} / {maxGitStars} ★ • 4-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight">
            {t("git.victoryTitle", "Git & DevOps Architect Certificate")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t("git.victorySubtitle", "You have mastered Git DAG graphs, branch pointers, merge conflicts, and rebase!")}
          </p>
        </div>

        {/* XP & Stars Summary Banner */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-black/[0.06] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-600/25 flex items-center justify-center text-amber-700">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500">
                {t("fintechVictoryModal.xpEarned", "Зароблений XP")}
              </div>
              <div className="font-display font-extrabold text-xl text-obsidian flex items-center gap-1">
                <span>+{xp}</span>
                <span className="text-xs font-mono font-bold text-[#C5A059]">XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500">
                {t("hub.stationStars", "STATION STARS")}
              </div>
              <div className="text-base font-display font-extrabold text-[#C5A059]">
                {currentGitStars} / {maxGitStars} ★
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-black/[0.08] font-mono text-xs font-bold text-obsidian shadow-2xs">
              <GitBranch size={14} className="text-purple-600" />
              <span>DAG ENGINE SYNC</span>
            </div>
          </div>
        </div>

        {/* Scrollable Skill Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("git.matrixTitle", "Verified Version Control Competencies (6/6)")}</span>
            </h3>
            <button
              onClick={() => setIsMatrixExpanded((p) => !p)}
              className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 hover:text-obsidian px-2 py-0.5 rounded-md bg-white border border-black/[0.08] shadow-2xs cursor-pointer transition-colors"
            >
              <span>{isMatrixExpanded ? t("common.collapse", "Згорнути") : t("common.showAll", `Всі (${GIT_SKILLS.length})`)}</span>
              {isMatrixExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {isMatrixExpanded && (
            <div className="space-y-2 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GIT_SKILLS.map((skill) => {
                  const isActive = activeSkillId === skill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setActiveSkillId(skill.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                        isActive
                          ? "bg-slate-50 border-purple-500/50 shadow-2xs"
                          : "bg-slate-50/50 hover:bg-slate-50 border-black/[0.06] text-obsidian"
                      }`}
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono font-bold text-obsidian truncate">
                          {skill.category}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 truncate">
                          {t(skill.nameKey, skill.category)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeSkillId && (
                <div className="p-3 rounded-xl bg-[#1A1D24] text-white font-mono text-[11px] border border-black/[0.1] mt-2">
                  <div className="text-[9px] text-slate-400 uppercase mb-1">
                    PRODUCTION GIT WORKFLOW:
                  </div>
                  <pre className="text-purple-300 overflow-x-auto py-1">
                    {GIT_SKILLS.find((s) => s.id === activeSkillId)?.codeExample}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleCopyCertificate}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
              title={t("git.copyCert", "Copy ASCII Certificate")}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-600">{t("git.certCopied", "Certificate Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden sm:inline">{t("common.copy", "Copy")}</span>
                </>
              )}
            </button>
          </div>

          <StationTrackNavigator currentStationId="git" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
