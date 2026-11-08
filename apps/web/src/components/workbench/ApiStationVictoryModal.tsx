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
  Copy,
  X,
  Server,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { audioFx } from "../../utils/audioFx";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useAuthStore } from "../../store/authStore";
import { downloadCertificateSvg } from "../../utils/certificateSvg";
import { StationTrackNavigator } from "./career/StationTrackNavigator";
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
    codeExample: "app.MapGet('/healthz', () => Results.Ok(new { status: 'alive' }));",
    category: "Liveness & Health Probes",
  },
  {
    id: "rest-routes",
    nameKey: "apiForge.skills.restRoutes",
    codeExample: "app.MapGet('/api/v1/users/{id}', (int id) => user is null ? Results.NotFound() : Results.Ok(user));",
    category: "RESTful Routing & Guard Clauses",
  },
  {
    id: "dto-validation",
    nameKey: "apiForge.skills.dtoValidation",
    codeExample: "if (string.IsNullOrWhiteSpace(dto.Name)) return Results.BadRequest(); return Results.Created($'/api/v1/orders/{id}', order);",
    category: "Schema Validation & HTTP 201 Semantics",
  },
  {
    id: "bearer-auth",
    nameKey: "apiForge.skills.bearerAuth",
    codeExample: "if (!authHeader.StartsWith('Bearer ')) return Results.Unauthorized();",
    category: "Bearer Tokens & 401 Unauthorized Protection",
  },
  {
    id: "http-client",
    nameKey: "apiForge.skills.httpClient",
    codeExample: "var response = await httpClient.GetFromJsonAsync<WeatherDto>(url);",
    category: "High-Throughput HTTP Consumers & JSON Deserialization",
  },
  {
    id: "fault-tolerance",
    nameKey: "apiForge.skills.faultTolerance",
    codeExample: "Policy.Handle<HttpRequestException>().WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));",
    category: "Fault Injection, 504 Gateway Timeouts & Exponential Backoff",
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

  const taskMasteryStars = useWorkbenchStore((s) => s.taskMasteryStars);
  const callsign = useAuthStore((s) => s.profile?.callsign);

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

  const handleDownloadSvg = () => {
    audioFx.playRelayClick();
    downloadCertificateSvg({
      stationCode: "API",
      stationTitle: "Station 04: API Forge — Backend & Microservices",
      credentialTitle: "Certified Backend & API Architect",
      callsign: callsign || "Cadet Engineer",
      stars: currentApiStars,
      maxStars: maxApiStars,
      xp,
      competencies: [
        "Liveness & Health Probes (MapGet /healthz)",
        "RESTful Endpoints & HTTP Status Code Guard Clauses",
        "Schema Validation & HTTP 201 Created Semantics",
        "Bearer Token Authentication & 401 Unauthorized Defense",
        "HTTP Client Resiliency & Exponential Backoff Retry Policy",
      ],
      themeColor: "#0284C7",
    });
  };

  const handleCopyCertificate = () => {
    audioFx.playKeyClick();
    const certText = `═══════════════════════════════════════════════════════
  INTERACTIVE WORKBENCH: BACKEND & API FORGE CERTIFICATE
  MODULE 4: API FORGE ARCHITECT — FULLY CERTIFIED!
═══════════════════════════════════════════════════════

Candidate Callsign: ${callsign || "Cadet Engineer"}
Total Experience:   ${xp} XP
Station Mastery:    ${currentApiStars} / ${maxApiStars} ★ (All 6 Commercial Modules Verified)

Core Competencies Mastered:
  1. [✓] Liveness Probes & Health Checks (/healthz)
  2. [✓] RESTful Resource Routing & Entity Isolation
  3. [✓] DTO Input Validation & HTTP 201 Semantics
  4. [✓] Bearer Token Authorization & Secure Headers
  5. [✓] High-Throughput HTTP Consumers & JSON Streams
  6. [✓] Resilient Retry Patterns & 504 Timeout Mitigation

Verification Hash: IW-API-FORGE-${Math.random().toString(36).substring(2, 9).toUpperCase()}
═══════════════════════════════════════════════════════`;

    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-obsidian rounded-3xl border border-black/[0.08] shadow-luxury p-6 sm:p-8 space-y-6">
        {/* Close Button */}
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

        {/* ── Modal Header: Trophy & Badges ── */}
        <div className="text-center space-y-2 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-600/25 text-emerald-800 text-xs font-mono font-bold tracking-wider uppercase">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>{currentApiStars} / {maxApiStars} ★ • 4-Star Mastery Certified</span>
          </div>

          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-obsidian tracking-tight">
            {t("apiForge.victoryModal.title", "Модуль 4: API Forge завершено!")}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {t(
              "apiForge.victoryModal.subtitle",
              "Ви побудували повний стек API: від Heartbeat та DTO валідації до Bearer токенів, клієнтських споживачів та повторних спроб при 504 Timeout."
            )}
          </p>
        </div>

        {/* ── XP & Stars Summary Banner ── */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-black/[0.06] flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-600/25 flex items-center justify-center text-amber-700">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase font-bold text-slate-500">
                {t("fintechVictoryModal.xpEarned", "Зароблений XP")}
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
                {currentApiStars} / {maxApiStars} ★
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-black/[0.08] font-mono text-xs font-bold text-obsidian shadow-2xs">
              <Server size={14} className="text-sky-600" />
              <span>API PROD READY</span>
            </div>
          </div>
        </div>

        {/* ── Backend Architecture Competency Matrix (Expandable) ── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-1.5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-obsidian flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#C5A059]" />
              <span>{t("apiForge.victoryModal.matrixTitle", "Матриця компетенцій Backend & API Architect")}</span>
            </h3>
            <button
              onClick={() => {
                audioFx.playRelayClick();
                setIsMatrixExpanded((p) => !p);
              }}
              className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-600 hover:text-obsidian px-2 py-0.5 rounded-md bg-white border border-black/[0.08] shadow-2xs cursor-pointer transition-colors"
            >
              <span>{isMatrixExpanded ? t("common.collapse", "Згорнути") : t("common.showAll", `Всі (${API_SKILLS.length})`)}</span>
              {isMatrixExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {isMatrixExpanded && (
            <div className="space-y-2 animate-in fade-in">
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
                          ? "bg-slate-50 border-sky-600/50 shadow-2xs"
                          : "bg-slate-50/50 hover:bg-slate-50 border-black/[0.06] text-obsidian"
                      }`}
                    >
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-[11px] font-mono font-bold text-obsidian truncate">
                          {skill.category}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 truncate">
                          {t(skill.nameKey, skill.id)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Code Snippet Card for Active Skill */}
              {activeSkillId && (
                <div className="p-3 rounded-xl bg-[#1A1D24] text-white font-mono text-[11px] border border-black/[0.1] mt-2">
                  <div className="text-[9px] text-slate-400 uppercase mb-1">
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
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/[0.06]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#252932] hover:bg-[#1A1D20] text-[#C5A059] border border-[#C5A059]/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
            >
              <Download size={14} />
              <span>{t("common.downloadCertSvg", "Завантажити векторний сертифікат (SVG)")}</span>
            </button>

            <button
              onClick={handleCopyCertificate}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-black/[0.08] text-obsidian font-mono font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-2xs"
              title={t("fintechVictoryModal.copyCertBtn", "Скопіювати сертифікат (ASCII)")}
            >
              {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span className="hidden sm:inline">
                {copied
                  ? t("fintechVictoryModal.copiedBtn", "Скопійовано")
                  : t("common.copy", "Копіювати")}
              </span>
            </button>
          </div>

          <StationTrackNavigator currentStationId="api" onClose={onClose} />
        </div>
      </div>
    </div>
  );
};
