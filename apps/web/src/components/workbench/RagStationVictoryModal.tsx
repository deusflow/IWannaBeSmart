/**
 * @file apps/web/src/components/workbench/RagStationVictoryModal.tsx
 * @description Station 09: IBM RAG & Agentic AI Systems Architect Victory Modal & Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  Copy,
  X,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { StationTrackNavigator } from "./career/StationTrackNavigator";
import { RAG_TASKS } from "@iw/sim-engine";

interface RagStationVictoryModalProps {
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

const RAG_SKILLS: SkillItem[] = [
  {
    id: "vector-embeddings",
    nameKey: "rag.skills.vectorMath",
    codeExample: "sim = dot_product(u, v) / (norm(u) * norm(v)); vector_store.search(q, top_k=5)",
    category: "Dense Vector Search & Normalization (R^8)",
  },
  {
    id: "rrf-hybrid",
    nameKey: "rag.skills.hybridFusion",
    codeExample: "rrf_score = sum(1.0 / (60 + rank_d) for rank_d in [bm25_rank, vector_rank])",
    category: "Multi-Index Hybrid Retrieval (k=60 Constant)",
  },
  {
    id: "react-stategraph",
    nameKey: "rag.skills.reactAgent",
    codeExample: 'graph.add_node("agent", react_node); graph.add_conditional_edges("agent", should_continue)',
    category: "Cyclic Reasoning: Thought -> Action -> Observation -> Final Answer",
  },
  {
    id: "structured-tools",
    nameKey: "rag.skills.toolCalling",
    codeExample: '@tool("calculator") def calc(expr: str) -> float: return evaluate_safe(expr)',
    category: "Structured JSON Schema & Deterministic Function Execution",
  },
  {
    id: "ragas-guardrails",
    nameKey: "rag.skills.guardrails",
    codeExample: "ragas = evaluate_ragas(answer, context); if ragas.faithfulness < 0.7: rollback()",
    category: "Context Precision, Faithfulness >= 0.70 & Adversarial Filtering",
  },
];

export const RagStationVictoryModal: React.FC<RagStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentStars = RAG_TASKS.reduce(
    (acc, task) => acc + (taskMasteryStars[task.id] || 0),
    0
  );
  const maxStars = RAG_TASKS.length * 4;

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
      stationCode: "IBM-RAG",
      stationTitle: "IBM RAG & Agentic AI Systems Architect",
      credentialTitle: "Certified IBM RAG & Agentic AI Specialist",
      callsign: callsign || "Operator",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "Vector Embeddings & Cosine Similarity Geometry",
        "Reciprocal Rank Fusion (RRF) Hybrid Search Engine",
        "Deterministic ReAct StateGraph Agentic Workflow",
        "Multi-Tool Calling & Structured Output Schemas",
        "RAGAS Anti-Hallucination & Jailbreak Defense Guardrails",
      ],
      themeColor: "#06B6D4",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `=== IBM RAG & AGENTIC AI ARCHITECT CERTIFICATE ===\n` +
      `Role: RAG & Autonomous Agent Systems Specialist\n` +
      `Domain: Enterprise Retrieval-Augmented Generation & Multi-Agent Swarms\n` +
      `Score: ${currentStars}/${maxStars} Mastery Stars | XP: ${xp}\n` +
      `Verified Competencies (5/5):\n` +
      `- Vector Embeddings & Cosine Similarity Geometry (R^8)\n` +
      `- Reciprocal Rank Fusion (RRF) Hybrid Search Engine (k=60)\n` +
      `- Deterministic ReAct StateGraph Cyclic Reasoning\n` +
      `- Multi-Tool Calling & Structured JSON Schemas\n` +
      `- RAGAS Anti-Hallucination & Jailbreak Defense Guardrails\n` +
      `Status: ACCREDITED AGENTIC AI SPECIALIST`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border-2 border-cyan-500/60 bg-[#0B0E14] shadow-[0_0_60px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-slate-100 isolate">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161D27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Station 09 Accredited
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStars}/{maxStars} ⭐
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 mt-0.5">
                {t("rag.victory.title", "Сертифікований IBM RAG & Agentic AI Спеціаліст")}
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
          <p className="text-slate-300 text-xs sm:text-sm bg-cyan-950/20 border border-cyan-800/40 p-3.5 rounded-xl">
            {t(
              "rag.victory.desc",
              "Ви успішно спроєктували багаторівневий RAG-конвеєр: векторне розбиття, RRF-гібридний пошук, ReAct агентні графи та анти-галюцинаційні RAGAS метрики!"
            )}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              {t("rag.victory.competencies", "Підтверджені компетенції RAG & AI Агента (5/5):")}
            </h4>

            <div className="space-y-2">
              {RAG_SKILLS.map((skill) => {
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
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-xs text-slate-200">
                            {t(skill.nameKey, skill.id)}
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
                        <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto p-2 rounded bg-[#0A0E17] border border-cyan-950">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-[#161D27]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-md shadow-cyan-600/30 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleCopyCertificate}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 transition-colors cursor-pointer shadow-sm"
              title={t("common.copyCert", "Скопіювати сертифікат")}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">{t("common.copiedCert", "Скопійовано")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">{t("common.copy", "Копіювати")}</span>
                </>
              )}
            </button>
          </div>

          <StationTrackNavigator currentStationId="rag" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
