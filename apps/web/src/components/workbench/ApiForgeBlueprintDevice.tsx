/**
 * @file apps/web/src/components/workbench/ApiForgeBlueprintDevice.tsx
 * @description Blueprint-styled Hardware API Forge device: Visual Client Dispatcher,
 * Animated HTTP Cable / Network Bus with Packet In-Flight & Fault Injection,
 * and Virtual API Gateway Server with Response Inspector and Live Access Logs.
 */

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Send,
  Wifi,
  WifiOff,
  Scissors,
  RotateCcw,
  Key,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Server,
  Terminal,
} from "lucide-react";
import { useWorkbenchStore } from "../../store/workbenchStore";
import { useShallow } from "zustand/react/shallow";
import type { HttpMethod } from "@iw/sim-engine";

export const ApiForgeBlueprintDevice: React.FC = () => {
  const { t } = useTranslation();
  const {
    clientDraftMethod,
    clientDraftPath,
    clientDraftHeaders,
    clientDraftBody,
    isPacketInFlight,
    packetProgress,
    packetDirection,
    apiState,
    lastApiResponse,
    setClientDraftMethod,
    setClientDraftPath,
    setClientDraftHeaders,
    setClientDraftBody,
    toggleNetworkCable,
    sendClientRequest,
    resetApiState,
  } = useWorkbenchStore(
    useShallow((s) => ({
      clientDraftMethod: s.clientDraftMethod,
      clientDraftPath: s.clientDraftPath,
      clientDraftHeaders: s.clientDraftHeaders,
      clientDraftBody: s.clientDraftBody,
      isPacketInFlight: s.isPacketInFlight,
      packetProgress: s.packetProgress,
      packetDirection: s.packetDirection,
      apiState: s.apiState,
      lastApiResponse: s.lastApiResponse,
      setClientDraftMethod: s.setClientDraftMethod,
      setClientDraftPath: s.setClientDraftPath,
      setClientDraftHeaders: s.setClientDraftHeaders,
      setClientDraftBody: s.setClientDraftBody,
      toggleNetworkCable: s.toggleNetworkCable,
      sendClientRequest: s.sendClientRequest,
      resetApiState: s.resetApiState,
    }))
  );

  const [hasAuthToken, setHasAuthToken] = useState<boolean>(
    Boolean(clientDraftHeaders["Authorization"])
  );

  const handleToggleAuth = () => {
    if (hasAuthToken) {
      const next = { ...clientDraftHeaders };
      delete next["Authorization"];
      setClientDraftHeaders(next);
      setHasAuthToken(false);
    } else {
      setClientDraftHeaders({
        ...clientDraftHeaders,
        Authorization: "Bearer forge-token-secure-99",
      });
      setHasAuthToken(true);
    }
  };

  const handleSelectPreset = (
    method: HttpMethod,
    path: string,
    body: string = "",
    withAuth: boolean = false
  ) => {
    setClientDraftMethod(method);
    setClientDraftPath(path);
    setClientDraftBody(body);
    if (withAuth) {
      setClientDraftHeaders({
        ...clientDraftHeaders,
        Authorization: "Bearer forge-token-secure-99",
      });
      setHasAuthToken(true);
    } else {
      const next = { ...clientDraftHeaders };
      delete next["Authorization"];
      setClientDraftHeaders(next);
      setHasAuthToken(false);
    }
  };

  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) {
      return "bg-emerald-500/20 border-emerald-500/40 text-emerald-400";
    }
    if (status >= 300 && status < 400) {
      return "bg-cyan-500/20 border-cyan-500/40 text-cyan-400";
    }
    if (status === 400) {
      return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    }
    if (status === 401 || status === 403) {
      return "bg-orange-500/20 border-orange-500/40 text-orange-400";
    }
    if (status === 404) {
      return "bg-red-500/20 border-red-500/40 text-red-400";
    }
    return "bg-purple-500/20 border-purple-500/40 text-purple-300";
  };

  return (
    <div className="w-full flex flex-col gap-4 select-none font-sans">
      {/* ── Top Chassis Control Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#141518] border-2 border-[#2C3038] text-white shadow-paper-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Server size={15} />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-gray-400 font-bold tracking-wider">
              STATION 04 HARDWARE RACK
            </div>
            <div className="text-xs font-display font-extrabold text-white">
              {t("apiForge.title", "API Forge: Client & Gateway Bus")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => resetApiState()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22262E] hover:bg-[#2C313C] border border-[#3C4250] text-gray-300 text-[11px] font-mono transition-colors cursor-pointer"
            title={t("apiForge.resetDevice", "Скинути стан API")}
          >
            <RotateCcw size={12} />
            <span>{t("common.reset", "Скинути")}</span>
          </button>
        </div>
      </div>

      {/* ── Main Dual-Chassis Layout (Client | Cable Bus | Server) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 items-stretch">
        {/* ═══════════════════════════════════════════════════════════
             1. Left Chassis: Client Dispatcher (5 Cols)
            ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-5 rounded-2xl bg-[#181A1F] border-2 border-[#2C3038] p-4 flex flex-col justify-between shadow-paper-sm space-y-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2C3038] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase text-gray-300 tracking-wider">
                  {t("apiForge.client", "HTTP Клієнт (Dispatcher)")}
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 bg-[#121417] px-2 py-0.5 rounded border border-[#2C3038]">
                PORT :443
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <div className="text-[10px] font-mono uppercase text-gray-400 font-bold mb-1.5 flex items-center justify-between">
                <span>{t("apiForge.presets", "Шаблони запитів")}:</span>
                <span className="text-gray-500 text-[9px]">QUICK SELECT</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <button
                  onClick={() => handleSelectPreset("GET", "/health")}
                  className={`px-2 py-1 rounded-md text-left transition-colors border ${
                    clientDraftPath === "/health"
                      ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold"
                      : "bg-[#1F222A] hover:bg-[#282C36] border-[#343A46] text-gray-300"
                  }`}
                >
                  <span className="text-emerald-400 font-bold">GET</span> /health
                </button>
                <button
                  onClick={() => handleSelectPreset("GET", "/api/devices/42")}
                  className={`px-2 py-1 rounded-md text-left transition-colors border ${
                    clientDraftPath === "/api/devices/42"
                      ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold"
                      : "bg-[#1F222A] hover:bg-[#282C36] border-[#343A46] text-gray-300"
                  }`}
                >
                  <span className="text-emerald-400 font-bold">GET</span> /devices/:id
                </button>
                <button
                  onClick={() =>
                    handleSelectPreset(
                      "POST",
                      "/api/orders",
                      '{\n  "item": "NanoSensor",\n  "quantity": 5\n}'
                    )
                  }
                  className={`px-2 py-1 rounded-md text-left transition-colors border ${
                    clientDraftPath === "/api/orders"
                      ? "bg-cyan-950/70 border-cyan-500/50 text-cyan-300 font-bold"
                      : "bg-[#1F222A] hover:bg-[#282C36] border-[#343A46] text-gray-300"
                  }`}
                >
                  <span className="text-cyan-400 font-bold">POST</span> /api/orders
                </button>
                <button
                  onClick={() =>
                    handleSelectPreset(
                      "GET",
                      "/api/secure/stats",
                      "",
                      true
                    )
                  }
                  className={`px-2 py-1 rounded-md text-left transition-colors border ${
                    clientDraftPath === "/api/secure/stats"
                      ? "bg-orange-950/70 border-orange-500/50 text-orange-300 font-bold"
                      : "bg-[#1F222A] hover:bg-[#282C36] border-[#343A46] text-gray-300"
                  }`}
                >
                  <span className="text-orange-400 font-bold">GET</span> /secure (Auth)
                </button>
              </div>
            </div>

            {/* Request Line (Method + Path) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                {t("apiForge.requestLine", "Рядок запиту")}:
              </label>
              <div className="flex gap-2">
                {/* Method Pills */}
                <div className="flex rounded-lg bg-[#121417] p-0.5 border border-[#2C3038]">
                  {(["GET", "POST"] as HttpMethod[]).map((method) => {
                    const isSelected = clientDraftMethod === method;
                    return (
                      <button
                        key={method}
                        onClick={() => setClientDraftMethod(method)}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono font-extrabold transition-all ${
                          isSelected
                            ? method === "GET"
                              ? "bg-emerald-500 text-black shadow-xs"
                              : "bg-cyan-500 text-black shadow-xs"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>

                {/* Path Input */}
                <div className="flex-1 flex items-center bg-[#121417] border border-[#2C3038] rounded-lg px-2.5 focus-within:border-cyan-500">
                  <span className="text-gray-500 text-xs font-mono mr-1">/</span>
                  <input
                    type="text"
                    value={clientDraftPath.startsWith("/") ? clientDraftPath.slice(1) : clientDraftPath}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setClientDraftPath(val.startsWith("/") ? val : `/${val}`);
                    }}
                    placeholder="health"
                    className="w-full bg-transparent text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Headers & Bearer Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                  {t("apiForge.headers", "Заголовки запиту")}:
                </span>
                <button
                  onClick={handleToggleAuth}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                    hasAuthToken
                      ? "bg-orange-950/80 border-orange-500 text-orange-300"
                      : "bg-[#1E2128] border-[#343A46] text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Key size={10} />
                  <span>{hasAuthToken ? "Bearer: Set ✓" : "+ Bearer Token"}</span>
                </button>
              </div>

              <div className="p-2 rounded-lg bg-[#121417] border border-[#2C3038] text-[11px] font-mono space-y-0.5">
                <div className="text-gray-400">
                  <span className="text-gray-500">Accept:</span> application/json
                </div>
                {hasAuthToken && (
                  <div className="text-orange-300 break-all">
                    <span className="text-gray-500">Authorization:</span> Bearer forge-token-secure-99
                  </div>
                )}
              </div>
            </div>

            {/* Request Body (For POST) */}
            {clientDraftMethod === "POST" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-400 font-bold flex items-center justify-between">
                  <span>{t("apiForge.body", "Тіло запиту (JSON)")}:</span>
                  <span className="text-cyan-400 text-[9px]">Content-Type: application/json</span>
                </label>
                <textarea
                  rows={3}
                  value={clientDraftBody}
                  onChange={(e) => setClientDraftBody(e.target.value)}
                  placeholder='{\n  "item": "Widget",\n  "quantity": 1\n}'
                  className="w-full p-2 rounded-lg bg-[#121417] border border-[#2C3038] text-xs font-mono text-green-300 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* Send Request Button */}
          <div className="pt-2">
            <button
              id="btn-send-http-request"
              disabled={isPacketInFlight}
              onClick={sendClientRequest}
              className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md ${
                isPacketInFlight
                  ? "bg-cyan-600 text-white animate-pulse cursor-wait"
                  : "bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-cyan-500/20 hover:shadow-lg"
              }`}
            >
              <Send size={14} className={isPacketInFlight ? "animate-bounce" : ""} />
              <span>
                {isPacketInFlight
                  ? t("apiForge.sending", "Пакет у польоті...")
                  : t("apiForge.sendRequest", "Надіслати HTTP Запит")}
              </span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
             2. Center: Animated Network Bus / Cable (2 Cols)
            ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-2 rounded-2xl bg-[#141518] border-2 border-[#2C3038] p-3 flex flex-col justify-between items-center shadow-paper-sm space-y-4">
          <div className="w-full text-center border-b border-[#2C3038] pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-gray-400 tracking-wider">
              {t("apiForge.networkBus", "Мережевий кабель")}
            </span>
          </div>

          {/* Physical Cable Visual & Packet Flight */}
          <div className="w-full flex-1 flex flex-col items-center justify-center py-2 relative min-h-[160px]">
            {/* Cable Line */}
            <div className="relative w-full flex items-center justify-center">
              <div
                className={`w-full h-3 rounded-full transition-all duration-300 relative overflow-hidden ${
                  apiState.isCableBroken
                    ? "bg-red-950 border-2 border-dashed border-red-500"
                    : "bg-[#0B0D0F] border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                }`}
              >
                {!apiState.isCableBroken && (
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-400/40 to-cyan-500/20 animate-pulse" />
                )}
              </div>

              {/* Broken Cable Spark Effect */}
              {apiState.isCableBroken && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full p-1 border-2 border-white shadow-lg animate-ping">
                  <Scissors size={12} />
                </div>
              )}

              {/* Packet In Flight Envelope Animation */}
              {isPacketInFlight && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 z-20 flex items-center"
                  style={{
                    left: `${Math.min(90, Math.max(10, packetProgress))}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold shadow-lg flex items-center gap-1 border animate-pulse ${
                      packetDirection === "CLIENT_TO_SERVER"
                        ? "bg-cyan-400 text-black border-white shadow-cyan-400/50"
                        : "bg-emerald-400 text-black border-white shadow-emerald-400/50"
                    }`}
                  >
                    <span>{packetDirection === "CLIENT_TO_SERVER" ? "REQ ▶" : "◀ RES"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cable Status Text */}
            <div className="mt-4 text-center">
              {apiState.isCableBroken ? (
                <div className="flex flex-col items-center text-red-400">
                  <WifiOff size={18} className="animate-bounce" />
                  <span className="text-[10px] font-mono font-bold mt-1 text-red-300">
                    CABLE SEVERED
                  </span>
                  <span className="text-[9px] font-mono text-red-400/80">
                    504 GATEWAY TIMEOUT
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-cyan-400">
                  <Wifi size={18} />
                  <span className="text-[10px] font-mono font-bold mt-1 text-cyan-300">
                    LINK 10 Gbps OK
                  </span>
                  <span className="text-[9px] font-mono text-gray-500">
                    CAT-6 DUPLEX
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fault Injection Button: Cut / Repair Cable */}
          <div className="w-full pt-1">
            <button
              id="btn-toggle-cable"
              onClick={toggleNetworkCable}
              className={`w-full py-2 px-2.5 rounded-xl font-mono font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
                apiState.isCableBroken
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20 shadow-md"
                  : "bg-[#252830] hover:bg-red-950/50 text-gray-300 hover:text-red-300 border-[#3C4250] hover:border-red-500/50"
              }`}
            >
              {apiState.isCableBroken ? (
                <>
                  <Wifi size={13} />
                  <span>{t("apiForge.repairCable", "Відновити кабель")}</span>
                </>
              ) : (
                <>
                  <Scissors size={13} className="text-red-400" />
                  <span>{t("apiForge.cutCable", "Розірвати лінію")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
             3. Right Chassis: Virtual API Server & Gateway (5 Cols)
            ═══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-5 rounded-2xl bg-[#181A1F] border-2 border-[#2C3038] p-4 flex flex-col justify-between shadow-paper-sm space-y-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2C3038] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[11px] font-mono font-bold uppercase text-gray-300 tracking-wider">
                  {t("apiForge.server", "API Gateway (Kestrel / Go)")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-gray-500 bg-[#121417] px-2 py-0.5 rounded border border-[#2C3038]">
                  PORT :8080
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                  ONLINE
                </span>
              </div>
            </div>

            {/* Active Response Inspector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold">
                  {t("apiForge.lastResponse", "Остання HTTP відповідь")}:
                </span>
                {lastApiResponse && (
                  <span className="text-[10px] font-mono text-gray-400">
                    ⏱ {lastApiResponse.latencyMs} ms
                  </span>
                )}
              </div>

              {lastApiResponse ? (
                <div className="p-3 rounded-xl bg-[#121417] border border-[#2C3038] space-y-2">
                  {/* Status Line */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded border ${getStatusBadgeColor(
                          lastApiResponse.statusCode
                        )}`}
                      >
                        {lastApiResponse.statusCode} {lastApiResponse.statusText}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">HTTP/1.1</span>
                    </div>
                    {lastApiResponse.statusCode >= 200 && lastApiResponse.statusCode < 300 ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-400" />
                    )}
                  </div>

                  {/* Body preview */}
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono text-gray-500 uppercase">
                      Payload Body (JSON):
                    </div>
                    <pre className="p-2 rounded-lg bg-[#0C0E11] text-xs font-mono text-gray-200 overflow-x-auto max-h-24 border border-[#232730]">
                      {typeof lastApiResponse.body === "object"
                        ? JSON.stringify(lastApiResponse.body, null, 2)
                        : String(lastApiResponse.body || "{}")}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#121417] border border-dashed border-[#2C3038] text-center text-gray-500 text-xs font-mono">
                  {t("apiForge.awaitingRequest", "Очікування запиту... Натисніть 'Надіслати HTTP Запит'")}
                </div>
              )}
            </div>

            {/* Server Access Log Terminal */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-gray-400 font-bold flex items-center gap-1">
                  <Terminal size={12} />
                  <span>{t("apiForge.serverLogs", "Журнал запитів сервера")}:</span>
                </span>
                <span className="text-[9px] font-mono text-gray-500">
                  {apiState.logs.length} EVENTS
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[#0F1013] border border-[#2C3038] font-mono text-[10px] space-y-1 max-h-28 overflow-y-auto">
                {apiState.logs.length === 0 ? (
                  <div className="text-gray-600 text-center py-2">
                    [Gateway log empty. Send an HTTP request to see traces]
                  </div>
                ) : (
                  apiState.logs
                    .slice(-5)
                    .reverse()
                    .map((log, idx) => (
                      <div
                        key={`${log.timestamp}-${idx}`}
                        className="flex items-center justify-between py-0.5 border-b border-[#1E2128] last:border-0"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500 text-[9px]">{log.timestamp}</span>
                          <span
                            className={`font-bold ${
                              log.method === "GET" ? "text-emerald-400" : "text-cyan-400"
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="text-gray-300 truncate max-w-[120px]">{log.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-extrabold ${
                              log.statusCode >= 200 && log.statusCode < 300
                                ? "text-emerald-400"
                                : log.statusCode === 404
                                ? "text-red-400"
                                : "text-amber-400"
                            }`}
                          >
                            {log.statusCode}
                          </span>
                          <span className="text-gray-500 text-[9px]">{log.durationMs}ms</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Active Routes Blueprint Summary */}
          <div className="p-2 rounded-xl bg-[#121417] border border-[#2C3038] text-[10px] font-mono text-gray-400 space-y-1">
            <div className="flex items-center justify-between text-gray-500">
              <span className="font-bold uppercase flex items-center gap-1">
                <Layers size={11} />
                <span>ACTIVE ENDPOINTS (CONTRACT)</span>
              </span>
              <span>4 ROUTES</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-[#1C2028] text-emerald-300">
                GET /health
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#1C2028] text-emerald-300">
                GET /api/devices/&#123;id&#125;
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#1C2028] text-cyan-300">
                POST /api/orders
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#1C2028] text-orange-300">
                GET /api/secure/stats
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
