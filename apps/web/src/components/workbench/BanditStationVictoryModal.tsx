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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-[#070B12] border-2 border-emerald-500/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-slate-100 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Station 06 Cleared
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentBanditStars}/{maxBanditStars} ⭐
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide mt-0.5">
              {t("bandit.victory.title", "Cyber Defense Architect Certified")}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          <p className="text-slate-300 text-xs sm:text-sm bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl">
            {t(
              "bandit.victory.desc",
              "You have successfully identified attack vectors, patched cryptographic flaws, and architected defense-in-depth security perimeter!"
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BANDIT_SKILLS.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              return (
                <div
                  key={skill.id}
                  onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                  className="bg-slate-900/70 border border-slate-800 rounded-lg p-2.5 hover:border-emerald-700/60 transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{skill.category}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  {isExpanded && (
                    <pre className="bg-[#05080E] p-2 rounded text-[10px] text-emerald-300 overflow-x-auto border border-emerald-950 mt-1">
                      {skill.codeExample}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleExportAscii}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              title={t("common.copyCert", "Copy Certificate")}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">{t("common.copiedCert", "Certificate Copied!")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
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
