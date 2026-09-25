/**
 * @file apps/web/src/components/workbench/CyberStationVictoryModal.tsx
 * @description Station 10: Google Cybersecurity & SOC Analyst Operations Victory Modal & Certification
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Download,
  Copy,
  ArrowRight,
  X,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { CYBER_TASKS } from "@iw/sim-engine";

interface CyberStationVictoryModalProps {
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

const CYBER_SKILLS: SkillItem[] = [
  {
    id: "syslog-siem",
    nameKey: "cyber.skills.syslogNorm",
    codeExample: "parsed = parse_syslog(raw_line); siem.ingest(timestamp, host, pri, event_name)",
    category: "RFC 5424/3164 Syslog Ingestion & SIEM Normalization",
  },
  {
    id: "chronicle-hunting",
    nameKey: "cyber.skills.chronicleQuery",
    codeExample: 'results = chronicle.hunt("severity:CRITICAL and event:LOGIN_FAILURE and host:srv*")',
    category: "Google Chronicle / KQL Threat Hunting & IoC Extraction",
  },
  {
    id: "wireshark-hex",
    nameKey: "cyber.skills.packetDissection",
    codeExample: "frame = dissect_packet(raw_bytes); if frame.tcp.syn and not frame.tcp.ack: track_syn()",
    category: "OSI Layer 2-7 Packet Dissection & Live Hex Dump Analysis",
  },
  {
    id: "anomaly-heuristics",
    nameKey: "cyber.skills.anomalyDetection",
    codeExample: 'if syn_rate > 500: trigger_alert("MITRE T1498: Denial of Service (SYN Flood)")',
    category: "Heuristic Anomaly Detection: SYN Flood, ARP Spoofing, Plaintext Sniffing",
  },
  {
    id: "nist-containment",
    nameKey: "cyber.skills.nistContainment",
    codeExample: 'iptables.drop(attacker_ip); edr.isolate_host(compromised_node); nist.advance_stage("RECOVER")',
    category: "NIST CSF 2.0 Incident Containment & iptables Hardening",
  },
];

export const CyberStationVictoryModal: React.FC<CyberStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const setCurrentView = useWorkbenchStore((s) => s.setCurrentView);
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentStars = CYBER_TASKS.reduce(
    (acc, task) => acc + (taskMasteryStars[task.id] || 0),
    0
  );
  const maxStars = CYBER_TASKS.length * 4;

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

  const handleDownloadSvg = () => {
    audioFx.playSuccessFanfare();
    downloadCertificateSvg({
      stationCode: "CYBER",
      stationTitle: "Google Cybersecurity & SOC Analyst Operations",
      credentialTitle: "Certified Google SOC Security Analyst",
      callsign: callsign || "Operator",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "RFC 5424/3164 Syslog Ingestion & SIEM Normalization",
        "Chronicle / Splunk KQL Threat Hunting & IoC Querying",
        "Web-Wireshark 3-Pane Packet Dissection & Hex Analysis",
        "Heuristic Network Anomaly Detection (SYN Flood, ARP Spoofing)",
        "NIST CSF 2.0 Incident Containment & iptables Hardening",
      ],
      themeColor: "#10B981",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `=== GOOGLE CYBERSECURITY & SOC ANALYST CERTIFICATE ===\n` +
      `Role: Security Operations Center (SOC) Defense Analyst\n` +
      `Domain: Threat Hunting, Packet Inspection & Incident Containment\n` +
      `Score: ${currentStars}/${maxStars} Mastery Stars | XP: ${xp}\n` +
      `Verified Competencies (5/5):\n` +
      `- RFC 5424/3164 Syslog Ingestion & SIEM Normalization\n` +
      `- Chronicle / Splunk KQL Threat Hunting & IoC Querying\n` +
      `- Web-Wireshark 3-Pane Packet Dissection & ASCII Hex Dump\n` +
      `- Heuristic Anomaly Detection (SYN Flood, ARP Poisoning, Sniffing)\n` +
      `- NIST CSF 2.0 Incident Response & Automated iptables Defense\n` +
      `Status: ACCREDITED GOOGLE SOC DEFENSE ANALYST`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#030712]/90 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl border-2 border-emerald-500/60 bg-[#0B0E14] shadow-[0_0_60px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-slate-100 isolate">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#161D27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Station 10 Accredited
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentStars}/{maxStars} ⭐
                </span>
              </div>
              <h3 className="font-mono text-base font-bold text-slate-100 mt-0.5">
                {t("cyber.victory.title", "Сертифікований Google Cybersecurity & SOC Аналітик")}
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
          <p className="text-slate-300 text-xs sm:text-sm bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl">
            {t(
              "cyber.victory.desc",
              "Ви успішно захистили корпоративний периметр: нормалізували Syslog-потоки, провели розслідування у Chronicle SIEM, локалізували мережеві аномалії у Wireshark та відбили атаку за стандартом NIST CSF 2.0!"
            )}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              {t("cyber.victory.competencies", "Підтверджені компетенції кіберзахисника SOC (5/5):")}
            </h4>

            <div className="space-y-2">
              {CYBER_SKILLS.map((skill) => {
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
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
                        <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-2 rounded bg-[#0A0E17] border border-emerald-950">
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
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95"
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
                  <Check className="w-4 h-4 text-emerald-400" />
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

          <button
            onClick={handleReturnToHub}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <span>{t("cyber.victory.returnHub", "Повернутися до Хабу")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
