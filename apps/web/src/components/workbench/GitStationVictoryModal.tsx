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
  Check,
  ChevronDown,
  ChevronUp,
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
    audioFx.playSuccessFanfare();
    downloadCertificateSvg({
      stationCode: "GIT",
      stationTitle: "Git Time Machine & Version Control",
      credentialTitle: "Certified Git & DevOps Architect",
      callsign: callsign || "Operator",
      stars: currentGitStars,
      maxStars: maxGitStars,
      xp,
      competencies: [
        "DAG Directed Acyclic Graph Commit Topology",
        "Branch Pointers, Reference Updates & Detached HEAD",
        "Fast-Forward vs 3-Way Merge Resolution",
        "3-Way Conflict Triaging & Clean State Restoration",
        "Linear History Rebase & Pull Request CI Gates",
      ],
      themeColor: "#8B5CF6",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playRelayClick();
    const certText = `
================================================================================
          IWANNABESMART • CERTIFICATE OF ENGINEERING EXCELLENCE
================================================================================
Recipient:         Workshop Engineer
Designation:       DevOps & Git Version Control Architect
Station Completed: Station 05 • Git Time Machine
Total XP Earned:   ${xp} XP
Date of Issue:     ${new Date().toLocaleDateString()}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0D1117] border-2 border-purple-500/40 rounded-3xl p-6 md:p-8 text-[#C9D1D9] shadow-2xl space-y-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Neon decorative background blur */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#161B22] hover:bg-[#21262D] text-stone-400 hover:text-stone-100 transition-colors cursor-pointer border border-[#30363D]"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_#A855F7]/30 shrink-0">
            <Award size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {t("git.certBadge", "Station 05 Completed")}
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {currentGitStars} / {maxGitStars} ★
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                +{xp} Total XP
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mt-1">
              {t("git.victoryTitle", "Git & DevOps Architect Certificate")}
            </h2>
            <p className="text-xs font-mono text-stone-400 mt-0.5">
              {t("git.victorySubtitle", "You have mastered Git DAG graphs, branch pointers, merge conflicts, and rebase!")}
            </p>
          </div>
        </div>

        {/* Scrollable Skill Matrix */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <div className="rounded-2xl bg-[#161B22] border border-[#30363D] overflow-hidden">
            <button
              onClick={() => setIsMatrixExpanded((p) => !p)}
              className="w-full px-4 py-3 bg-[#1F242C] flex items-center justify-between text-xs font-mono font-bold text-purple-300 cursor-pointer border-b border-[#30363D]"
            >
              <span className="flex items-center gap-2">
                <GitBranch size={15} />
                <span>{t("git.matrixTitle", "Verified Version Control Competencies (6/6)")}</span>
              </span>
              {isMatrixExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {isMatrixExpanded && (
              <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {GIT_SKILLS.map((skill) => {
                  const isActive = activeSkillId === skill.id;
                  return (
                    <div
                      key={skill.id}
                      onClick={() => setActiveSkillId(skill.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-purple-950/40 border-purple-500/60 shadow-[0_0_8px_#A855F7]/20"
                          : "bg-[#0D1117] border-[#30363D] hover:border-purple-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-stone-200">
                          {t(skill.nameKey, skill.category)}
                        </span>
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                      </div>
                      <code className="mt-1.5 block text-[10px] font-mono text-purple-300 bg-[#090D13] p-1.5 rounded border border-[#21262D] truncate">
                        {skill.codeExample}
                      </code>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-[#30363D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-purple-600/25"
            >
              <Download size={14} />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleCopyCertificate}
              className="px-3.5 py-2.5 rounded-xl bg-[#161B22] hover:bg-[#21262D] border border-[#30363D] text-stone-200 font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              title={t("git.copyCert", "Copy ASCII Certificate")}
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="hidden sm:inline text-emerald-400">{t("git.certCopied", "Certificate Copied!")}</span>
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
