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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#FAF8F2] text-[#1A1D20] rounded-3xl border-2 border-[#1A1D20]/30 shadow-2xl overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-200 max-h-[92vh]">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-[#1A1D20]/15 bg-[#EFE9DC]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border-2 border-amber-600/40 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
              <Radio size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-700">
                MODULE 03 • EMBEDDED HARDWARE & IOT
              </div>
              <h2 className="text-lg font-display font-extrabold text-[#1A1D20] tracking-tight">
                {t(
                  "iotStation.victory.title",
                  "Станція 03: Embedded Hardware & IoT завершено!"
                )}
              </h2>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-iot-victory-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          <p className="text-xs text-[#1A1D20]/80 leading-relaxed font-sans">
            {t(
              "iotStation.victory.subtitle",
              "Ви на практиці опанували асинхронні події, захисні реле та реакцію на апаратні сенсори без затримок циклу."
            )}
          </p>

          {/* Skill Matrix */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1A1D20]/70">
              {t("iotStation.victory.skillsTitle", "Апаратна матриця компетенцій")}
            </h3>
            <div className="space-y-2">
              {IOT_SKILLS.map((skill) => {
                const isExpanded = expandedSkillId === skill.id;
                return (
                  <div
                    key={skill.id}
                    className="rounded-xl border border-[#1A1D20]/15 bg-white/70 overflow-hidden shadow-2xs transition-all"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSkillId(isExpanded ? null : skill.id)
                      }
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-xs font-mono font-bold text-[#1A1D20] truncate">
                          {t(skill.nameKey, skill.category)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-[#1A1D20]/50 shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-[#1A1D20]/50 shrink-0" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3.5 pb-3 pt-1 border-t border-[#1A1D20]/10 bg-black/[0.02]">
                        <code className="text-[11px] font-mono text-amber-900 bg-amber-500/10 px-2 py-1 rounded block overflow-x-auto">
                          {skill.codeExample}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Certificate Download & Copy Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              id="btn-download-iot-cert-svg"
              onClick={handleDownloadCertificate}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-mono font-bold text-xs shadow-paper-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>
                {t(
                  "iotStation.victory.downloadCert",
                  "Завантажити векторний SVG сертифікат"
                )}
              </span>
            </button>
            <button
              type="button"
              id="btn-copy-iot-cert-ascii"
              onClick={handleCopyAscii}
              className="py-3 px-4 rounded-xl bg-white hover:bg-[#F0EDE6] active:scale-95 text-[#1A1D20] border border-[#1A1D20]/20 font-mono font-bold text-xs shadow-paper-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check size={15} className="text-emerald-600" />
                  <span>{t("iotStation.victory.copied", "Сертифікат скопійовано!")}</span>
                </>
              ) : (
                <>
                  <Copy size={15} />
                  <span>
                    {t("iotStation.victory.copyAscii", "Скопіювати сертифікат (ASCII)")}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer / Track Navigator */}
        <div className="px-6 py-4 border-t border-[#1A1D20]/15 bg-[#EFE9DC] flex items-center justify-between">
          <StationTrackNavigator
            currentStationId="iot"
            onClose={onClose}
            accentClassName="bg-amber-700 hover:bg-amber-800 text-white"
          />
        </div>
      </div>
    </div>
  );
};
