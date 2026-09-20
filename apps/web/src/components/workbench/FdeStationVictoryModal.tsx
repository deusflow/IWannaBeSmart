/**
 * @file apps/web/src/components/workbench/FdeStationVictoryModal.tsx
 * @description Station 08: Field AI Deployer Victory Modal & Forward Deployed AI Engineer Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  X,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
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
  const setCurrentView = useWorkbenchStore((s) => s.setCurrentView);
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
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

  const handleReturnToHub = () => {
    audioFx.playRelayClick();
    onClose();
    setCurrentView("HUB");
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `=== APPLIED AI & FORWARD DEPLOYED ENGINEER CERTIFICATE ===\n` +
      `Role: Forward Deployed AI Engineer (FDE)\n` +
      `Domain: Applied AI, Legacy Modernization & Agentic Systems\n` +
      `Score: ${currentStars}/${maxStars} Mastery Stars | XP: ${xp}\n` +
      `Verified Competencies (5/5):\n` +
      `- Executive Stakeholder Discovery & Consensus\n` +
      `- Air-Gapped Legacy API Reverse-Engineering\n` +
      `- Production Hybrid RAG & Multi-Agent Graph Orchestration\n` +
      `- Zero Trust Scope Guardrails & SOC2 PII Masking\n` +
      `- SRE Emergency Runbook & Operational Client Enablement\n` +
      `Status: GRADUATED FIELD-READY AI SPECIALIST`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border-2 border-purple-500/60 bg-[#0B0E14] shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden text-slate-100 isolate">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161D27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Station 08 Accredited
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStars}/{maxStars} ⭐
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 mt-0.5">
                {t("fde.victory.title", "Сертифікований Forward Deployed Engineer (Applied AI)")}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              audioFx.playRelayClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm leading-relaxed text-slate-300">
          <p className="text-slate-300 text-xs sm:text-sm bg-purple-950/20 border border-purple-800/40 p-3.5 rounded-xl">
            {t(
              "fde.victory.desc",
              "Ви успішно закрили повний життєвий цикл впровадження ШІ: від першого дзвінка до захищеного бойового релізу та підписання акту!"
            )}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
              {t("fde.victory.competencies", "Підтверджені компетенції інженера впровадження (5/5):")}
            </h4>

            <div className="space-y-2">
              {FDE_SKILLS.map((skill) => {
                const isExpanded = expandedSkillId === skill.id;
                return (
                  <div
                    key={skill.id}
                    className="border border-slate-800 bg-[#06090E] rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() =>
                        setExpandedSkillId(isExpanded ? null : skill.id)
                      }
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/40 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-xs text-slate-200">
                            {t(skill.nameKey)}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {skill.category}
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 bg-black/40">
                        <pre className="text-[11px] font-mono text-purple-300 overflow-x-auto p-2 rounded bg-[#0A0E17] border border-purple-950">
                          <code>{skill.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#161D27]">
          <button
            onClick={handleCopyCertificate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors cursor-pointer shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-purple-400" />
                <span>{t("common.copiedCert", "Сертифікат скопійовано!")}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-400" />
                <span>{t("common.copyCert", "Скопіювати сертифікат")}</span>
              </>
            )}
          </button>

          <button
            onClick={handleReturnToHub}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-mono font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-purple-600/30 active:scale-95"
          >
            <span>{t("fde.victory.returnHub", "Повернутися до Хабу")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
