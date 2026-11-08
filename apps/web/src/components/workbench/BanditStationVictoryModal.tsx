/**
 * @file apps/web/src/components/workbench/BanditStationVictoryModal.tsx
 * @description Station 06: Cyber Bandit Lab Victory Modal with Ethical Hacker & Defense Architect Skill Matrix
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Download,
  Copy,
  X,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  Sparkles,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { StationTrackNavigator } from "./career/StationTrackNavigator";
import { BANDIT_TASKS } from "@iw/sim-engine";

interface BanditStationVictoryModalProps {
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

const BANDIT_SKILLS: SkillItem[] = [
  {
    id: "fs-permissions",
    nameKey: "bandit.skills.unixRecon",
    codeExample: "find / -user bandit7 -group bandit6 -size 33c 2>/dev/null",
    category: "File Recon & Permissions (chmod 0600)",
  },
  {
    id: "entropy-csprng",
    nameKey: "bandit.skills.csprngToken",
    codeExample: "RandomNumberGenerator.Fill(buffer); // Non-deterministic CSPRNG",
    category: "Cryptographic Entropy vs Obfuscation",
  },
  {
    id: "hmac-transit",
    nameKey: "bandit.skills.hmacIntegrity",
    codeExample: "using var hmac = new HMACSHA256(key); hmac.ComputeHash(payload);",
    category: "HMAC-SHA256 Anti-Tamper & Signatures",
  },
  {
    id: "sqli-prepared",
    nameKey: "bandit.skills.sqlPrepared",
    codeExample: "cmd.Parameters.AddWithValue('@username', userInput);",
    category: "Prepared Statements (SQLi Defeated)",
  },
  {
    id: "rate-limiting",
    nameKey: "bandit.skills.rateLimit",
    codeExample: "tokenBucket.consume(ip, cost=1) ? next() : res.status(429)",
    category: "Token Bucket Rate Limiting (Brute-Force Guard)",
  },
  {
    id: "defense-in-depth",
    nameKey: "bandit.skills.defenseInDepth",
    codeExample: "nginx.conf: rate_limit + proxy_hide_header Server + waf_filter",
    category: "Defense-in-Depth Reverse Proxy Shield",
  },
];

export const BanditStationVictoryModal: React.FC<BanditStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentBanditStars = BANDIT_TASKS.reduce((acc, task) => acc + (taskMasteryStars[task.id] || 0), 0);
  const maxBanditStars = BANDIT_TASKS.length * 4;

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
      stationCode: "BANDIT",
      stationTitle: "Cyber Bandit Lab & Blue Team Shield",
      credentialTitle: "Certified Ethical Hacker & Defense Architect",
      callsign: callsign || "Operator",
      stars: currentBanditStars,
      maxStars: maxBanditStars,
      xp,
      competencies: [
        "UNIX File Permissions & Secret Discovery (0600)",
        "Cryptographic CSPRNG Entropy Tokens",
        "HMAC-SHA256 Anti-Tamper Message Integrity",
        "Parameterized Prepared Statements (SQLi Defeated)",
        "Token Bucket Rate Limiting & Reverse Proxy Defense",
      ],
      themeColor: "#10B981",
    });
  };

  const handleExportAscii = () => {
    const cert = `
================================================================================
                    OFFICIAL CERTIFICATE OF COMPLETION
              CYBER BANDIT LAB: ETHICAL HACKING & BLUE TEAM SHIELD
================================================================================

This certifies that the engineering operator has mastered Station 06:
  - Discovered hidden credentials and secured UNIX file permissions (0600)
  - Neutralized obfuscation weaknesses via Cryptographic CSPRNG tokens
  - Protected API transit wires with HMAC-SHA256 anti-tamper signatures
  - Defended relational databases from SQL Injection using Prepared Statements
  - Throttled brute-force password and PIN bursts via Token Bucket Rate Limiting
  - Composed an ironclad Defense-in-Depth Reverse Proxy Gateway

OPERATOR XP AWARDED: ${xp} XP
STATUS: CERTIFIED ETHICAL HACKER & DEFENSE ARCHITECT
DATE: ${new Date().toLocaleDateString()}
================================================================================
`.trim();

    navigator.clipboard.writeText(cert);
    setCopied(true);
    audioFx.playKeyClick();
    setTimeout(() => setCopied(false), 3000);
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
            <span>{currentBanditStars} / {maxBanditStars} ★ • 4-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight">
            {t("bandit.victory.title", "Cyber Defense Architect Certified")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "bandit.victory.desc",
              "You have successfully identified attack vectors, patched cryptographic flaws, and architected defense-in-depth security perimeter!"
            )}
          </p>
        </div>

        {/* XP Counter Banner */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-black/[0.06] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-600/25 flex items-center justify-center text-amber-700">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500">
                {t("fintechVictoryModal.xpEarned", "XP НАГОРОДА")}
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
                {currentBanditStars} / {maxBanditStars} ★
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-black/[0.08] font-mono text-xs font-bold text-obsidian shadow-2xs">
              <Shield size={14} className="text-emerald-600" />
              <span>SOC DEFENDER</span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("bandit.victory.skillsTitle", "Security & Defense Matrix (6/6)")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {BANDIT_SKILLS.length} / {BANDIT_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BANDIT_SKILLS.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              return (
                <div
                  key={skill.id}
                  onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                  className="bg-slate-50/70 border border-black/[0.06] rounded-xl p-3 hover:border-black/[0.14] transition-colors cursor-pointer text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-obsidian">{skill.category}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {t(skill.nameKey, skill.category)}
                  </div>
                  {isExpanded && (
                    <pre className="bg-white p-2 rounded-lg text-[10px] text-obsidian overflow-x-auto border border-black/[0.06] mt-1 font-mono">
                      {skill.codeExample}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleExportAscii}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
              title={t("common.copyCert", "Copy Certificate")}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">{t("common.copiedCert", "Certificate Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{t("common.copy", "Copy")}</span>
                </>
              )}
            </button>
          </div>

          <StationTrackNavigator currentStationId="bandit" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
