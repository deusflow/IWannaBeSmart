/**
 * @file apps/web/src/components/workbench/FdeStationVictoryModal.tsx
 * @description Station 08: Field AI Deployer Victory Modal & Forward Deployed AI Engineer Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  Copy,
  X,
  Users,
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
import { FDE_TASKS } from "@iw/sim-engine";

interface FdeStationVictoryModalProps {
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

const FDE_SKILLS: SkillItem[] = [
  {
    id: "stakeholder-discovery",
    nameKey: "fde.skills.stakeholderAlignment",
    codeExample: 'align_requirements(stakeholders=["CISO", "Head of Compliance"], kpi="80% manual audit reduction")',
    category: "Executive Discovery & Value Realization Framework",
  },
  {
    id: "legacy-integration",
    nameKey: "fde.skills.legacyIntegration",
    codeExample: 'async with httpx.AsyncClient(verify="/certs/ca.pem") as client: resp = await client.get(legacy_endpoint)',
    category: "Reverse-Engineering & Resilient Adapter Pattern",
  },
  {
    id: "agentic-orchestration",
    nameKey: "fde.skills.agentOrchestration",
    codeExample: 'workflow = StateGraph(AgentState); workflow.add_node("rag_indexer", rag_retriever); workflow.compile()',
    category: "Deterministic Multi-Agent Graphs & Hybrid RAG",
  },
  {
    id: "zero-trust-hardening",
    nameKey: "fde.skills.zeroTrustSecurity",
    codeExample: "guardrails.intercept_jailbreak(input_text); audit_log.append(hashlib.sha256(pii).hexdigest())",
    category: "Prompt Injection Interception & Cryptographic PII Masking",
  },
  {
    id: "sre-handoff",
    nameKey: "fde.skills.clientRunbook",
    codeExample: "execute_gameday_simulation(failover_test=True); signoff_certificate(status='GRADUATED_TO_PRODUCTION')",
    category: "Incident Runbook, Operational Enablement & Client Sign-off",
  },
];

export const FdeStationVictoryModal: React.FC<FdeStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentStars = FDE_TASKS.reduce(
    (acc, task) => acc + (taskMasteryStars[task.id] || 0),
    0
  );
  const maxStars = FDE_TASKS.length * 4;

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
      stationCode: "FDE",
      stationTitle: "Forward Deployed AI Engineering & Field Ops",
      credentialTitle: "Certified Forward Deployed AI Engineer (FDE)",
      callsign: callsign || "Operator",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "Executive Stakeholder Discovery & Consensus",
        "Air-Gapped Legacy API Reverse-Engineering",
        "Deterministic Multi-Agent Graphs & Hybrid RAG",
        "Zero Trust Scope Guardrails & SOC2 PII Masking",
        "SRE Incident Runbook & Production Client Sign-off",
      ],
      themeColor: "#A855F7",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText =
      `INTERACTIVE WORKBENCH CERTIFICATE: FORWARD DEPLOYED AI ENGINEER (FDE)\n` +
      `Engineer: ${callsign || "Field Operator"}\n` +
      `Mastery: ${currentStars} / ${maxStars} Stars (Enterprise Field Grade)\n` +
      `Experience Awarded: +${xp} XP\n` +
      `Field Proven Systems:\n` +
      `- C-Suite Stakeholder Value Consensus Framework\n` +
      `- Air-Gapped Legacy HTTP Adapter Interception\n` +
      `- StateGraph Deterministic Multi-Agent RAG Orchestration\n` +
      `- Jailbreak Defense & Cryptographic PII Redaction\n` +
      `- Operational Production Signoff & Day-2 SRE Enablement\n` +
      `Status: ACCREDITED FORWARD DEPLOYED AI ENGINEER`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury p-6 sm:p-8 space-y-6">
        {/* Modal Top Header */}
        <button
          onClick={() => {
            audioFx.playRelayClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          title={t("common.close", "Закрити")}
        >
          <X size={18} />
        </button>

        {/* Modal Title & Badges */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>{currentStars} / {maxStars} ★ • 4-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight">
            {t("fde.victory.title", "Сертифікований Forward Deployed AI Engineer")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "fde.victory.desc",
              "Ви успішно розгорнули автономну агентну RAG-систему, інтегрували ізольовану legacy-інфраструктуру та передали бойові runbook замовнику!"
            )}
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
                {currentStars} / {maxStars} ★
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-black/[0.08] font-mono text-xs font-bold text-obsidian shadow-2xs">
              <Users size={14} className="text-purple-600" />
              <span>FIELD DEPLOYED</span>
            </div>
          </div>
        </div>

        {/* Modal Content / Competencies */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("fde.victory.competencies", "Підтверджені компетенції інженера впровадження AI (5/5):")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {FDE_SKILLS.length} / {FDE_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="space-y-2">
            {FDE_SKILLS.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              return (
                <div
                  key={skill.id}
                  className="border border-black/[0.06] bg-slate-50/70 rounded-xl overflow-hidden transition-colors shadow-2xs hover:border-black/[0.12]"
                >
                  <button
                    onClick={() =>
                      setExpandedSkillId(isExpanded ? null : skill.id)
                    }
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-white cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-obsidian">
                          {t(skill.nameKey)}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {skill.category}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-black/[0.06] bg-white">
                      <pre className="text-[11px] font-mono text-purple-900 overflow-x-auto p-2 rounded-lg bg-purple-50/70 border border-purple-600/20">
                        <code>{skill.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D24] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleCopyCertificate}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
              title={t("common.copyCert", "Скопіювати сертифікат")}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline text-emerald-700">{t("common.copiedCert", "Скопійовано")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{t("common.copy", "Копіювати")}</span>
                </>
              )}
            </button>
          </div>

          <StationTrackNavigator currentStationId="fde" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
