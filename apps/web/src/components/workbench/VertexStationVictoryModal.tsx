/**
 * @file apps/web/src/components/workbench/VertexStationVictoryModal.tsx
 * @description Station 06: Vertex AI Architect Victory Modal & Google Cloud MLOps Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  Copy,
  X,
  Cloud,
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
import { VERTEX_TASKS } from "@iw/sim-engine";

interface VertexStationVictoryModalProps {
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

const VERTEX_SKILLS: SkillItem[] = [
  {
    id: "gcs-data-lake",
    nameKey: "vertex.skills.gcsDataLake",
    codeExample: "storage_client = storage.Client(); bucket = storage_client.bucket('gs://retail-training-data')",
    category: "Cloud Object Ingestion & Lineage Tracking",
  },
  {
    id: "distributed-compute",
    nameKey: "vertex.skills.distributedCompute",
    codeExample: "CustomTrainingJob(machine_type='a2-highgpu-1g', accelerator_type='NVIDIA_TESLA_A100').run()",
    category: "Hardware Sizing & A100/TPU Cluster Orchestration",
  },
  {
    id: "autoscaling-serving",
    nameKey: "vertex.skills.autoscalingServing",
    codeExample: "endpoint.deploy(model=model, min_replica_count=2, max_replica_count=10, traffic_percentage=100)",
    category: "Production Serving & Zero-Downtime Traffic Splitting",
  },
  {
    id: "vpc-security",
    nameKey: "vertex.skills.vpcSecurity",
    codeExample: "VpcServiceControls.bind(peering_network='projects/123/global/networks/mlops-vpc')",
    category: "VPC Peering, IAM Least Privilege & Data Perimeter",
  },
  {
    id: "drift-sentinel",
    nameKey: "vertex.skills.driftSentinel",
    codeExample: "ModelDeploymentMonitoringJob(alert_config={'email': 'sre@corp.com'}, drift_threshold=0.10)",
    category: "Continuous Drift Detection & Autonomous Retraining",
  },
];

export const VertexStationVictoryModal: React.FC<VertexStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentStars = VERTEX_TASKS.reduce(
    (acc, task) => acc + (taskMasteryStars[task.id] || 0),
    0
  );
  const maxStars = VERTEX_TASKS.length * 4;

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
      stationCode: "VERTEX",
      stationTitle: "Vertex AI & Google Cloud MLOps Platform",
      credentialTitle: "Certified Cloud MLOps & AI Platform Architect",
      callsign: callsign || "Cloud Engineer",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "Cloud Storage Data Lake & Audit Lineage (GCS)",
        "A100/TPU Distributed Cluster Sizing & Cost Optim",
        "Autoscaling Vertex Endpoints & Canary Traffic Routing",
        "Zero Trust VPC Service Controls & IAM Security",
        "Continuous Feature Drift Sentinel & Automated Retraining",
      ],
      themeColor: "#2563EB",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText =
      `INTERACTIVE WORKBENCH CERTIFICATE: VERTEX AI & CLOUD MLOPS ARCHITECT\n` +
      `Candidate: ${callsign || "Cloud Engineer"}\n` +
      `Mastery: ${currentStars} / ${maxStars} Stars (Google Cloud Standard)\n` +
      `Experience Awarded: +${xp} XP\n` +
      `Core Architectural Proofs:\n` +
      `- Scalable Cloud Ingestion (GCS Data Lake)\n` +
      `- High-Performance Compute Pipelines (A100 GPU Clusters)\n` +
      `- Zero-Downtime Model Deployment & Canary Splitting\n` +
      `- Zero Trust VPC Service Controls & IAM Least Privilege\n` +
      `- Continuous Feature Drift Sentinel & Automated Retraining\n` +
      `Status: ACCREDITED GOOGLE-GRADE CLOUD ML ARCHITECT`;

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
            {t("vertex.victory.title", "Сертифікований архітектор Vertex AI & Cloud MLOps")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "vertex.victory.desc",
              "Ви спроєктували автономну хмарну ML-платформу з нульовою довірою, автоскейлінгом та автоматичним усуненням дрейфу даних!"
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
              <Cloud size={14} className="text-blue-600" />
              <span>GCP MLOPS READY</span>
            </div>
          </div>
        </div>

        {/* Modal Content / Competencies */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("vertex.victory.competencies", "Підтверджені компетенції хмарного ML-інженера (5/5):")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {VERTEX_SKILLS.length} / {VERTEX_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="space-y-2">
            {VERTEX_SKILLS.map((skill) => {
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
                      <pre className="text-[11px] font-mono text-blue-900 overflow-x-auto p-2 rounded-lg bg-blue-50/70 border border-blue-600/20">
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

          <StationTrackNavigator currentStationId="vertex" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
