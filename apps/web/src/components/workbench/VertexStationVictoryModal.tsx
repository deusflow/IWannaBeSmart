/**
 * @file apps/web/src/components/workbench/VertexStationVictoryModal.tsx
 * @description Station 06: Vertex AI Architect Victory Modal & Google Cloud MLOps Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  ArrowRight,
  X,
  Cloud,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
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
  const setCurrentView = useWorkbenchStore((s) => s.setCurrentView);
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
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

  const handleReturnToHub = () => {
    audioFx.playRelayClick();
    onClose();
    setCurrentView("HUB");
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `=== GOOGLE VERTEX AI ARCHITECT CERTIFICATE ===\n` +
      `Role: AI/ML Software Engineer (Cloud)\n` +
      `Platform: Google Cloud Vertex AI & Kubeflow MLOps\n` +
      `Score: ${currentStars}/${maxStars} Mastery Stars | XP: ${xp}\n` +
      `Verified Competencies (5/5):\n` +
      `- Cloud Object Ingestion & Lineage (GCS)\n` +
      `- Accelerator Cluster Sizing (NVIDIA A100 / TPU v4)\n` +
      `- Real-Time Autoscaling Serving (P99 < 150ms)\n` +
      `- Zero Trust VPC Service Controls & IAM Least Privilege\n` +
      `- Continuous Feature Drift Sentinel & Automated Retraining\n` +
      `Status: ACCREDITED GOOGLE-GRADE CLOUD ML ARCHITECT`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border-2 border-blue-500/60 bg-[#0B0E14] shadow-[0_0_60px_rgba(59,130,246,0.3)] flex flex-col overflow-hidden text-slate-100 isolate">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161D27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                  Station 07 Accredited
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStars}/{maxStars} ⭐
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 mt-0.5">
                {t("vertex.victory.title", "Сертифікований архітектор Vertex AI & Cloud MLOps")}
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
          <p className="text-slate-300 text-xs sm:text-sm bg-blue-950/20 border border-blue-800/40 p-3.5 rounded-xl">
            {t(
              "vertex.victory.desc",
              "Ви спроєктували автономну хмарну ML-платформу з нульовою довірою, автоскейлінгом та автоматичним усуненням дрейфу даних!"
            )}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              {t("vertex.victory.competencies", "Підтверджені компетенції хмарного ML-інженера (5/5):")}
            </h4>

            <div className="space-y-2">
              {VERTEX_SKILLS.map((skill) => {
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
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
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
                        <pre className="text-[11px] font-mono text-blue-300 overflow-x-auto p-2 rounded bg-[#0A0E17] border border-blue-950">
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
                <Check className="w-4 h-4 text-blue-400" />
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
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-mono font-bold text-slate-950 transition-all cursor-pointer shadow-md shadow-blue-600/30 active:scale-95"
          >
            <span>{t("vertex.victory.returnHub", "Повернутися до Хабу")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
