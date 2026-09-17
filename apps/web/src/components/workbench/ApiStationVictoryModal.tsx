/**
 * @file apps/web/src/components/workbench/ApiStationVictoryModal.tsx
 * @description Station 04: API Forge Victory Modal with Backend & API Architect Skill Matrix
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  Award,
  Download,
  ArrowRight,
  X,
  Server,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { API_FORGE_TASKS } from "@iw/sim-engine";

interface ApiStationVictoryModalProps {
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

const API_SKILLS: SkillItem[] = [
  {
    id: "healthcheck",
    nameKey: "apiForge.skills.healthcheck",
    codeExample: 'app.MapGet("/health", () => Results.Ok(new { status = "UP" }))',
    category: "Monitoring & Healthchecks",
  },
  {
    id: "path-params-404",
    nameKey: "apiForge.skills.pathParams",
    codeExample: "repo.Find(id) != null ? Results.Ok(d) : Results.NotFound()",
    category: "RESTful Routing & 404 Guarding",
  },
  {
    id: "dto-validation-201",
    nameKey: "apiForge.skills.dtoValidation",
    codeExample: "if (dto.Quantity <= 0) return Results.BadRequest(); return Results.Created()",
    category: "DTO Validation & 201 Created",
  },
  {
    id: "bearer-token-auth",
    nameKey: "apiForge.skills.bearerAuth",
    codeExample: 'if (!auth.StartsWith("Bearer ")) return Results.Unauthorized()',
    category: "Authentication & Security Headers",
  },
  {
    id: "client-consumer",
    nameKey: "apiForge.skills.clientConsumer",
    codeExample: "await client.GetAsync(url); response.EnsureSuccessStatusCode()",
    category: "API Client Integration & Parsing",
  },
  {
    id: "retry-resiliency",
    nameKey: "apiForge.skills.retryResiliency",
    codeExample: "for (int a = 1; a <= 3; a++) { ... await Task.Delay(100 * a); }",
    category: "Resilience & Timeout Fault Tolerance",
  },
];

export const ApiStationVictoryModal: React.FC<ApiStationVictoryModalProps> = ({
  isOpen,
  onClose,
  xp,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string>(API_SKILLS[0].id);
  const [isMatrixExpanded, setIsMatrixExpanded] = useState<boolean>(true);

  const setCurrentView = useWorkbenchStore((s) => s.setCurrentView);
  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);

  const currentApiStars = API_FORGE_TASKS.reduce((acc, t) => acc + (taskMasteryStars[t.id] || 0), 0);
  const maxApiStars = API_FORGE_TASKS.length * 4;

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

  const handleCopyCertificate = () => {
    audioFx.playRelayClick();
    const certText = `
╔════════════════════════════════════════════════════════════════════════════╗
║                   IWANNABESMART • ENGINEERING CERTIFICATE                  ║
║                      MODULE 4: BACKEND & API ARCHITECT                     ║
╠════════════════════════════════════════════════════════════════════════════╣
║ This certifies that the engineer has mastered commercial API engineering  ║
║ across modern C# (.NET Minimal APIs) and Go (net/http).                    ║
║                                                                            ║
║ Verified Competencies:                                                     ║
║  [✓] 1. Heartbeat & Healthcheck Endpoints (HTTP 200 OK)                    ║
║  [✓] 2. RESTful Resource Routing & 404 Guard Clauses                       ║
║  [✓] 3. DTO Schema Validation & HTTP 201 Created Semantics                 ║
║  [✓] 4. Bearer Token Authentication & 401 Unauthorized Protection          ║
║  [✓] 5. High-Throughput HTTP Client Consumer & Deserialization             ║
║  [✓] 6. Network Cable Fault Injection, 504 Timeout & Exponential Retries   ║
║                                                                            ║
║ Total Experience Earned: ${xp} XP                                           ║
║ Issued: ${new Date().toISOString().split("T")[0]}                                          ║
╚════════════════════════════════════════════════════════════════════════════╝
    `.trim();

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSwitchToHub = () => {
    audioFx.playRelayClick();
    onClose();
    setCurrentView("HUB");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#FAF8F2] border-2 border-[#1A1D20] shadow-paper-lg p-5 sm:p-7 space-y-6 text-[#1A1D20] select-none font-sans">
        {/* Close Button */}
        <button
          onClick={() => {
            audioFx.playRelayClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[#1A1D20]/10 text-[#1A1D20]/60 hover:text-[#1A1D20] transition-colors cursor-pointer"
          title={t("common.close", "Закрити")}
        >
          <X size={18} />
        </button>

        {/* ── Modal Header: Trophy & Badges ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border-2 border-cyan-600/40 flex items-center justify-center text-cyan-600 shrink-0 shadow-paper-sm">
            <Server size={30} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-600/30 text-cyan-800">
                STATION 04 • API FORGE
              </span>
              <span className="text-[10px] font-mono font-bold text-[#1A1D20]/60">
                100% COMPLETE
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#1A1D20] tracking-tight mt-0.5">
              {t("apiForge.victoryModal.title", "Модуль 4: API Forge завершено!")}
            </h2>
            <p className="text-xs sm:text-sm font-balsamiq text-[#1A1D20]/70 mt-0.5 leading-relaxed">
              {t(
                "apiForge.victoryModal.subtitle",
                "Ви побудували повний стек API: від Heartbeat та DTO валідації до Bearer токенів, клієнтських споживачів та повторних спроб при 504 Timeout."
              )}
            </p>
          </div>
        </div>

        {/* ── XP & Stars Summary Banner ── */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-600/30 flex items-center justify-center text-amber-800 font-bold text-base">
              ★
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-[#1A1D20]/60">
                {t("hub.stationStars", "STATION STARS")}
              </div>
              <div className="text-base font-display font-extrabold text-[#1A1D20]">
                {currentApiStars} / {maxApiStars} ★
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-600/30 flex items-center justify-center text-cyan-800 font-bold text-base">
              <Award size={18} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-[#1A1D20]/60">
                {t("fintechVictoryModal.xpEarned", "Зароблений XP")}
              </div>
              <div className="text-base font-display font-extrabold text-[#1A1D20]">
                {xp} XP
              </div>
            </div>
          </div>
        </div>

        {/* ── Backend Architecture Competency Matrix (Expandable) ── */}
        <div className="rounded-2xl bg-[#EBE5D8] border border-[#1A1D20]/20 overflow-hidden">
          <button
            onClick={() => {
              audioFx.playRelayClick();
              setIsMatrixExpanded((p) => !p);
            }}
            className="w-full p-3 px-4 flex items-center justify-between bg-[#E4DDD0] border-b border-[#1A1D20]/15 hover:bg-[#DDD5C6] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-800" />
              <span className="font-display font-bold text-xs uppercase tracking-wider text-[#1A1D20]">
                {t("apiForge.victoryModal.matrixTitle", "Матриця компетенцій Backend & API Architect (6 патернів)")}
              </span>
            </div>
            {isMatrixExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isMatrixExpanded && (
            <div className="p-3 sm:p-4 space-y-2 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {API_SKILLS.map((skill) => {
                  const isSelected = activeSkillId === skill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => {
                        audioFx.playRelayClick();
                        setActiveSkillId(skill.id);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                        isSelected
                          ? "bg-[#FAF8F2] border-cyan-600/50 shadow-paper-xs"
                          : "bg-[#DFD7C5]/40 hover:bg-[#FAF8F2]/60 border-[#1A1D20]/15 text-[#1A1D20]/80"
                      }`}
                    >
                      <CheckCircle2 size={14} className="text-cyan-700 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono font-bold text-[#1A1D20] truncate">
                          {skill.category}
                        </div>
                        <div className="text-[9px] font-mono text-[#1A1D20]/60 truncate">
                          {t(skill.nameKey, skill.id)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Code Snippet Card for Active Skill */}
              {activeSkillId && (
                <div className="p-2.5 rounded-xl bg-[#141518] text-white font-mono text-[11px] border border-[#2C3038] mt-2">
                  <div className="text-[9px] text-gray-400 uppercase mb-1">
                    PRODUCTION CODE PATTERN:
                  </div>
                  <pre className="text-cyan-300 overflow-x-auto py-1">
                    {API_SKILLS.find((s) => s.id === activeSkillId)?.codeExample}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopyCertificate}
            className={`w-full sm:w-auto py-2.5 px-4 rounded-xl border font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-[#EBE5D8] hover:bg-[#E2DBCB] text-[#1A1D20] border-[#1A1D20]/25 shadow-paper-xs"
            }`}
          >
            {copied ? <Check size={14} /> : <Download size={14} />}
            <span>
              {copied
                ? t("fintechVictoryModal.copiedBtn", "Сертифікат скопійовано!")
                : t("fintechVictoryModal.copyCertBtn", "Скопіювати сертифікат (ASCII)")}
            </span>
          </button>

          <button
            onClick={handleSwitchToHub}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#1A1D20] hover:bg-black text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-paper-sm"
          >
            <span>{t("fintechVictoryModal.switchStationBtn", "Повернутися до станцій")}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
