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
  ShieldCheck,
  Award,
  Sparkles,
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
      stationCode: "RAG",
      stationTitle: "Enterprise RAG & Agentic Systems Architect",
      credentialTitle: "Certified Enterprise RAG & Agentic Systems Architect",
      callsign: callsign || "AI Systems Operator",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "Dense Embedding Cosine Distance & Normalization",
        "Multi-Index RRF Hybrid Fusion (BM25 + Semantic)",
        "Cyclic ReAct Agent State Graphs & Self-Correction",
        "Deterministic Function Calling & Schema Validation",
        "RAGAS Automated Faithfulness & Hallucination Guardrails",
      ],
      themeColor: "#0284C7",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText =
      `INTERACTIVE WORKBENCH CERTIFICATE: ENTERPRISE RAG & AGENTIC ARCHITECT\n` +
      `Candidate: ${callsign || "AI Systems Operator"}\n` +
      `Mastery: ${currentStars} / ${maxStars} Stars (IBM/LangGraph Level 4)\n` +
      `Experience Awarded: +${xp} XP\n` +
      `Verified Implementations:\n` +
      `- Cosine Distance Vector Search Space Normalization\n` +
      `- Reciprocal Rank Fusion Hybrid Semantic Retrieval\n` +
      `- ReAct Cognitive Loop & Tool Call Serialization\n` +
      `- Anti-Hallucination Guardrails (Faithfulness >= 0.70)\n` +
      `Status: ACCREDITED AGENTIC AI ARCHITECT`;

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
            {t("rag.victory.title", "Сертифікований IBM RAG & Agentic AI Спеціаліст")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "rag.victory.desc",
              "Ви успішно спроєктували багаторівневий RAG-конвеєр: векторне розбиття, RRF-гібридний пошук, ReAct агентні графи та анти-галюцинаційні RAGAS метрики!"
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
              <Bot size={14} className="text-cyan-600" />
              <span>AGENTIC GRAPH</span>
            </div>
          </div>
        </div>

        {/* Modal Content / Competencies */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("rag.victory.competencies", "Підтверджені компетенції RAG & AI Агента (5/5):")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {RAG_SKILLS.length} / {RAG_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="space-y-2">
            {RAG_SKILLS.map((skill) => {
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
                          {t(skill.nameKey, skill.id)}
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
                      <pre className="text-[11px] font-mono text-cyan-900 overflow-x-auto p-2 rounded-lg bg-cyan-50/70 border border-cyan-600/20">
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
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
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

          <StationTrackNavigator currentStationId="rag" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
