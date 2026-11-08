/**
 * @file apps/web/src/components/workbench/IotStationVictoryModal.tsx
 * @description Station 03: Embedded Hardware & IoT Victory Modal with EventBus & Hardware Safety Skill Matrix
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Download,
  Copy,
  X,
  Radio,
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
import { IOT_TASKS } from "@iw/sim-engine";

interface IotStationVictoryModalProps {
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

const IOT_SKILLS: SkillItem[] = [
  {
    id: "eventbus-pubsub",
    nameKey: "iotStation.victory.skills.eventbus",
    codeExample: 'eventBus.Subscribe("OBSTACLE_DETECTED", (e) => { gate.EmergencyStop(); });',
    category: "Event-Driven Architecture",
  },
  {
    id: "safety-interlock",
    nameKey: "iotStation.victory.skills.safetyInterlock",
    codeExample: "gate.EmergencyStop(); relay.PowerOff(); // Safety Interlock",
    category: "Hardware Safety Interlock",
  },
  {
    id: "fsm-states",
    nameKey: "iotStation.victory.skills.fsmStates",
    codeExample: "doorState: CLOSING -> STOPPED (Obstacle Trip & Halt)",
    category: "Finite State Machine (FSM)",
  },
  {
    id: "relay-actuator",
    nameKey: "iotStation.victory.skills.relayActuator",
    codeExample: "relay.PowerOn(); relay.PowerOff(); // Dual-Pole Actuator Switching",
    category: "Actuator & Relay Protection",
  },
];

export const IotStationVictoryModal: React.FC<IotStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);
  const [copied, setCopied] = useState(false);
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  const currentIotStars = IOT_TASKS.reduce(
    (acc, task) => acc + (taskMasteryStars[task.id] || 0),
    0
  );
  const maxIotStars = IOT_TASKS.length * 4;

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

  const handleDownloadCertificate = () => {
    audioFx.playRelayClick();
    downloadCertificateSvg({
      stationCode: "iot",
      stationTitle: t("hub.stations.iot.title", "Station 03: Embedded Hardware & IoT"),
      credentialTitle: "Embedded Hardware & IoT Systems Specialist",
      callsign: callsign || "Cadet Engineer",
      stars: currentIotStars,
      maxStars: maxIotStars,
      xp,
      competencies: [
        "Event-Driven Architecture (EventBus Pub/Sub)",
        "Hardware Safety Interlocks & Emergency Halt",
        "Finite State Machine (FSM Door State Engine)",
        "Relay Actuator Control & Anti-Collision Protocols",
      ],
      themeColor: "#F59E0B",
    });
  };

  const handleCopyAscii = async () => {
    audioFx.playKeyClick();
    const ascii = `
╔══════════════════════════════════════════════════════════════════════╗
║               IWANNABESMART ENGINEERING CERTIFICATE                 ║
║               STATION 03: EMBEDDED HARDWARE & IOT                   ║
╠══════════════════════════════════════════════════════════════════════╣
║ Engineer:     ${(callsign || "Cadet Engineer").padEnd(54)} ║
║ Specialism:   Embedded Hardware & IoT Systems Specialist             ║
║ Mastery:      ★ ${currentIotStars} / ${maxIotStars} Stars${" ".repeat(46 - String(currentIotStars).length - String(maxIotStars).length)}║
║ Total XP:     ${xp} Engineering XP${" ".repeat(49 - String(xp).length)}║
╠══════════════════════════════════════════════════════════════════════╣
║ Core Competencies Verified:                                          ║
║ • EventBus Publish/Subscribe Architecture & Async Signal Bus         ║
║ • Hardware Safety Interlocks & Immediate Emergency Motor Halt        ║
║ • Finite State Machine (FSM) Door Motion Trajectories                ║
║ • Dual-Pole Relay Actuators & Power Management                       ║
╚══════════════════════════════════════════════════════════════════════╝
    `.trim();

    try {
      await navigator.clipboard.writeText(ascii);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Safe catch for clipboard permissions
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury p-6 sm:p-8 space-y-6">
        {/* Close button */}
        <button
          type="button"
          id="btn-close-iot-victory-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label={t("common.close", "Закрити")}
        >
          <X size={18} />
        </button>

        {/* Blueprint Victory Stamp Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>{currentIotStars} / {maxIotStars} ★ • 4-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight">
            {t("iotStation.victory.title", "Станція 03: Embedded Hardware & IoT завершено!")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "iotStation.victory.subtitle",
              "Ви на практиці опанували асинхронні події, захисні реле та реакцію на апаратні сенсори без затримок циклу."
            )}
          </p>
        </div>

        {/* XP Counter Banner */}
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
                {currentIotStars} / {maxIotStars} ★
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-black/[0.08] font-mono text-xs font-bold text-obsidian shadow-2xs">
              <Radio size={14} className="text-amber-600" />
              <span>IOT BUS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Skill Matrix */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("iotStation.victory.skillsTitle", "Апаратна матриця компетенцій")}</span>
            </h3>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-600/20 px-2 py-0.5 rounded-md">
              {IOT_SKILLS.length} / {IOT_SKILLS.length} {t("common.mastered", "Освоєно")}
            </span>
          </div>

          <div className="space-y-2">
            {IOT_SKILLS.map((skill) => {
              const isExpanded = expandedSkillId === skill.id;
              return (
                <div
                  key={skill.id}
                  className="rounded-xl border border-black/[0.06] bg-slate-50/70 overflow-hidden shadow-2xs transition-all hover:border-black/[0.12]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedSkillId(isExpanded ? null : skill.id)
                    }
                    className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-mono font-bold text-obsidian truncate">
                        {t(skill.nameKey, skill.category)}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3.5 pb-3 pt-1 border-t border-black/[0.06] bg-white">
                      <code className="text-[11px] font-mono text-amber-900 bg-amber-500/10 px-2.5 py-1.5 rounded-lg block overflow-x-auto border border-amber-600/20">
                        {skill.codeExample}
                      </code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/[0.06]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-download-iot-cert-svg"
              onClick={handleDownloadCertificate}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              <span>
                {t(
                  "iotStation.victory.downloadCert",
                  "Завантажити SVG сертифікат"
                )}
              </span>
            </button>
            <button
              type="button"
              id="btn-copy-iot-cert-ascii"
              onClick={handleCopyAscii}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs shrink-0"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span>{t("iotStation.victory.copied", "Скопійовано!")}</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>
                    {t("iotStation.victory.copyAscii", "Скопіювати ASCII")}
                  </span>
                </>
              )}
            </button>
          </div>

          <StationTrackNavigator
            currentStationId="iot"
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
};
