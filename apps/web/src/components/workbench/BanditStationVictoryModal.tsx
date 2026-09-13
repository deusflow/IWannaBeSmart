/**
 * @file apps/web/src/components/workbench/BanditStationVictoryModal.tsx
 * @description Station 06: Cyber Bandit Lab Victory Modal with Ethical Hacker & Defense Architect Skill Matrix
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  X,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";

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
    id: "unix-recon-perms",
    nameKey: "bandit.skills.unixRecon",
    codeExample: "chmod 0600 .secret_pass && cat .env",
    category: "UNIX Recon & Safe Config Storage",
  },
  {
    id: "csprng-token",
    nameKey: "bandit.skills.csprngToken",
    codeExample: "RandomNumberGenerator.Fill(buffer); // Non-deterministic CSPRNG",
    category: "Cryptographic Entropy vs Obfuscation",
  },
  {
    id: "hmac-integrity",
    nameKey: "bandit.skills.hmacIntegrity",
    codeExample: 'using var hmac = new HMACSHA256(key); hmac.ComputeHash(payload);',
    category: "Man-In-The-Middle & HMAC-SHA256 Signatures",
  },
  {
    id: "sql-prepared-statements",
    nameKey: "bandit.skills.sqlPrepared",
    codeExample: 'cmd.Parameters.AddWithValue("@username", userInput);',
    category: "SQL Injection Neutralization (Parameterized Queries)",
  },
  {
    id: "token-bucket-rate-limit",
    nameKey: "bandit.skills.rateLimit",
    codeExample: 'context.Response.StatusCode = StatusCodes.Status429TooManyRequests;',
    category: "Token Bucket Rate Limiter & Brute-Force Shield",
  },
  {
    id: "defense-in-depth",
    nameKey: "bandit.skills.defenseInDepth",
    codeExample: 'app.UseHttpsRedirection(); app.UseRateLimiter(); app.UseAuthentication();',
    category: "Defense in Depth & Fortified Reverse Proxy",
  },
];

export const BanditStationVictoryModal: React.FC<BanditStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const setCurrentView = useWorkbenchStore((s) => s.setCurrentView);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReturnToHub = () => {
    audioFx.playRelayClick();
    onClose();
    setCurrentView("HUB");
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

        {/* Header Ribbon */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.6)]">
            <Shield className="w-9 h-9 animate-bounce" />
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              STATION 06 // LAB CONQUERED
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {t("bandit.victory.title", "Certified Ethical Hacker & Defense Architect")}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t(
                "bandit.victory.desc",
                "You have breached simulated vulnerabilities, tampered with transit wire packets, and engineered bulletproof Blue Team defensive shields."
              )}
            </p>
          </div>
        </div>

        {/* XP Badge */}
        <div className="flex items-center justify-around bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-3">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">STATION STARS</span>
            <div className="text-lg font-bold text-amber-400">18 / 18 ★</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">TOTAL XP EARNED</span>
            <div className="text-lg font-bold text-emerald-400">+{xp} XP</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">DEFCON SHIELD</span>
            <div className="text-lg font-bold text-cyan-400">LEVEL 5</div>
          </div>
        </div>

        {/* Competencies Matrix */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t("bandit.victory.competencies", "Mastered Cyber Defense Competencies:")}</span>
          </h3>

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
          <button
            onClick={handleExportAscii}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4" />}
            <span>{copied ? "Copied Certificate!" : "Export ASCII Certificate"}</span>
          </button>

          <button
            onClick={handleReturnToHub}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
          >
            <span>{t("bandit.victory.returnHub", "Return to Workshop Hub")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
