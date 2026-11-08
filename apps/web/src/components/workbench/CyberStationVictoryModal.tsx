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
  X,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { StationTrackNavigator } from "./career/StationTrackNavigator";
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

  const handleDownloadSvg = () => {
    audioFx.playSuccessFanfare();
    downloadCertificateSvg({
      stationCode: "CYBER",
      stationTitle: "Google Cybersecurity & SOC Threat Defense",
      credentialTitle: "Certified Google Cybersecurity & SOC Analyst",
      callsign: callsign || "Security Analyst",
      stars: currentStars,
      maxStars: maxStars,
      xp,
      competencies: [
        "RFC 5424 Syslog Pipeline & Structured SIEM Normalization",
        "Chronicle / KQL Telemetry Threat Hunting & Indicator Triaging",
        "Wireshark Multi-Layer Packet Dissection & Hex Decoding",
        "Heuristic SYN Flood & Cryptographic Cleartext Leak Detection",
        "NIST CSF 2.0 Incident Lifecycle: Triage, Containment & Recovery",
      ],
      themeColor: "#059669",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText =
      `INTERACTIVE WORKBENCH CERTIFICATE: GOOGLE CYBERSECURITY & SOC ANALYST\n` +
      `Candidate: ${callsign || "Security Analyst"}\n` +
      `Mastery: ${currentStars} / ${maxStars} Stars (Google SOC Standard)\n` +
      `Experience Awarded: +${xp} XP\n` +
      `Proven Defense Implementations:\n` +
      `- Normalized Multi-Source Syslog Streams into Ingestion Pipeline\n` +
      `- Executed Threat Hunting Queries via Chronicle SIEM Patterns\n` +
      `- Dissected Network TCP/IP Payloads via Live Packet Inspections\n` +
      `- Contained MITRE ATT&CK Incursions using iptables & EDR Isolation\n` +
      `- Executed End-to-End NIST Incident Handling Playbook\n` +
      `Status: ACCREDITED CYBERSECURITY SOC ANALYST`;

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
            {t("cyber.victory.title", "Сертифікований Google Cybersecurity & SOC Аналітик")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "cyber.victory.desc",
              "Ви успішно захистили корпоративний периметр: нормалізували Syslog-потоки, провели розслідування у Chronicle SIEM, локалізували мережеві аномалії у Wireshark та відбили атаку за стандартом NIST CSF 2.0!"
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
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>SOC TIER 1 READY</span>
            </div>
          </div>
        </div>

        {/* Modal Content / Competencies */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("cyber.victory.competencies", "Підтверджені компетенції кіберзахисника SOC (5/5):")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {CYBER_SKILLS.length} / {CYBER_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="space-y-2">
            {CYBER_SKILLS.map((skill) => {
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
                      <pre className="text-[11px] font-mono text-emerald-900 overflow-x-auto p-2 rounded-lg bg-emerald-50/70 border border-emerald-600/20">
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

          <StationTrackNavigator currentStationId="cyber" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
