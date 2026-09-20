/**
 * @file apps/web/src/components/workbench/hub/StationBlueprintIllustrations.tsx
 * @description Handcrafted vector blueprint diagrams for all 6 workshop station showcases.
 */

import React from "react";

export const TvBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Antennas */}
    <line x1="45" y1="20" x2="30" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="55" y1="20" x2="70" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* TV Body */}
    <rect x="20" y="20" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="2" fill="#FAF8F2" />
    {/* Screen */}
    <rect x="26" y="26" width="50" height="48" rx="4" stroke="currentColor" strokeWidth="1.5" fill="#1A1D20" />
    <rect x="30" y="30" width="42" height="40" rx="2" fill="#2A3036" />
    <path d="M 36 50 Q 51 40 66 50" stroke="#4ADE80" strokeWidth="1.5" fill="none" />
    {/* Knobs */}
    <circle cx="88" cy="35" r="4" stroke="currentColor" strokeWidth="1.5" fill="#EFEAE1" />
    <circle cx="88" cy="48" r="4" stroke="currentColor" strokeWidth="1.5" fill="#EFEAE1" />
    <line x1="84" y1="62" x2="92" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="84" y1="68" x2="92" y2="68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Remote Control */}
    <rect x="120" y="15" width="30" height="70" rx="4" stroke="currentColor" strokeWidth="1.8" fill="#FAF8F2" />
    <circle cx="135" cy="12" r="2.5" fill="#EF4444" />
    <circle cx="135" cy="25" r="3.5" stroke="currentColor" strokeWidth="1.2" fill="#EF4444" />
    <rect x="125" y="35" width="20" height="4" rx="1" fill="#1A1D20" />
    <rect x="125" y="43" width="20" height="4" rx="1" fill="#1A1D20" />
    <rect x="125" y="51" width="20" height="4" rx="1" fill="#1A1D20" />
    <circle cx="135" cy="68" r="7" stroke="currentColor" strokeWidth="1.2" fill="#EFEAE1" />
    {/* Infrared Wave */}
    <path d="M 115 15 C 110 18, 110 22, 115 25" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
    <path d="M 110 12 C 103 17, 103 23, 110 28" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export const PosBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Thermal Receipt sticking out */}
    <path d="M 45 15 L 75 15 L 75 0 L 45 0 Z" fill="#FAF8F2" stroke="currentColor" strokeWidth="1.2" />
    <line x1="48" y1="5" x2="72" y2="5" stroke="#1A1D20" strokeWidth="1" strokeDasharray="1.5 1" />
    <line x1="48" y1="9" x2="65" y2="9" stroke="#1A1D20" strokeWidth="1" strokeDasharray="1.5 1" />
    {/* POS Main Body */}
    <rect x="35" y="15" width="50" height="70" rx="5" stroke="currentColor" strokeWidth="2" fill="#FAF8F2" />
    {/* LCD Display */}
    <rect x="40" y="20" width="40" height="22" rx="3" fill="#1A1D20" stroke="currentColor" strokeWidth="1" />
    <rect x="42" y="22" width="36" height="18" fill="#1F2428" />
    <text x="44" y="32" fill="#34D399" fontSize="6" fontFamily="monospace" fontWeight="bold">$ 135.00</text>
    <text x="44" y="38" fill="#38BDF8" fontSize="4" fontFamily="monospace">DANKORT OK</text>
    {/* Keypad Grid */}
    <circle cx="45" cy="50" r="2.2" fill="#1A1D20" />
    <circle cx="53" cy="50" r="2.2" fill="#1A1D20" />
    <circle cx="61" cy="50" r="2.2" fill="#1A1D20" />
    <circle cx="45" cy="58" r="2.2" fill="#1A1D20" />
    <circle cx="53" cy="58" r="2.2" fill="#1A1D20" />
    <circle cx="61" cy="58" r="2.2" fill="#1A1D20" />
    <circle cx="45" cy="66" r="2.2" fill="#EF4444" />
    <circle cx="53" cy="66" r="2.2" fill="#1A1D20" />
    <circle cx="61" cy="66" r="2.2" fill="#10B981" />
    {/* Chip card insertion slot */}
    <line x1="42" y1="78" x2="65" y2="78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Contactless Credit Card */}
    <rect x="110" y="25" width="48" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" fill="#FAF8F2" />
    <rect x="115" y="33" width="10" height="8" rx="1" fill="#D97706" />
    <line x1="110" y1="46" x2="158" y2="46" stroke="#1A1D20" strokeWidth="4" />
    {/* NFC Radio Waves */}
    <path d="M 95 30 C 100 35, 100 45, 95 50" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 90 26 C 97 33, 97 47, 90 54" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const IotBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Gate Posts */}
    <line x1="30" y1="10" x2="30" y2="80" stroke="currentColor" strokeWidth="3" />
    <line x1="150" y1="10" x2="150" y2="80" stroke="currentColor" strokeWidth="3" />
    <line x1="25" y1="10" x2="155" y2="10" stroke="currentColor" strokeWidth="3" />
    {/* Gate Bars */}
    <line x1="30" y1="30" x2="150" y2="30" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
    <line x1="30" y1="50" x2="150" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2" />
    {/* Servo Motor Box */}
    <rect x="135" y="12" width="22" height="18" rx="2" fill="#FAF8F2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="146" cy="21" r="4" stroke="currentColor" strokeWidth="1.2" fill="#D97706" />
    {/* Laser Obstacle Sensor */}
    <rect x="25" y="65" width="10" height="10" rx="2" fill="#1A1D20" />
    <rect x="145" y="65" width="10" height="10" rx="2" fill="#1A1D20" />
    <line x1="35" y1="70" x2="145" y2="70" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 3" />
    <text x="65" y="66" fill="#EF4444" fontSize="6" fontFamily="monospace">IR OBSTACLE SENSOR</text>
  </svg>
);

export const ApiForgeBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Client Dispatcher Device */}
    <rect x="15" y="24" width="46" height="42" rx="4" stroke="currentColor" strokeWidth="1.8" fill="#FAF8F2" />
    <rect x="20" y="30" width="36" height="12" rx="2" fill="#1A1D20" />
    <text x="23" y="39" fill="#06B6D4" fontSize="6" fontFamily="monospace" fontWeight="bold">POST :443</text>
    <circle cx="25" cy="54" r="3" fill="#10B981" />
    <circle cx="35" cy="54" r="3" fill="#3B82F6" />
    <line x1="44" y1="54" x2="55" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

    {/* HTTP Cable & In-Flight Packet */}
    <line x1="61" y1="45" x2="119" y2="45" stroke="#06B6D4" strokeWidth="2.5" strokeDasharray="3 2" />
    <rect x="82" y="39" width="16" height="12" rx="2" fill="#06B6D4" stroke="currentColor" strokeWidth="1" />
    <text x="85" y="47" fill="#1A1D20" fontSize="5" fontFamily="monospace" fontWeight="extrabold">REQ</text>

    {/* Gateway Server Rack */}
    <rect x="119" y="18" width="48" height="54" rx="4" stroke="currentColor" strokeWidth="1.8" fill="#FAF8F2" />
    <rect x="124" y="24" width="38" height="8" rx="1.5" fill="#1A1D20" />
    <circle cx="128" cy="28" r="1.5" fill="#10B981" />
    <line x1="133" y1="28" x2="157" y2="28" stroke="#374151" strokeWidth="1.5" />
    <rect x="124" y="36" width="38" height="8" rx="1.5" fill="#1A1D20" />
    <circle cx="128" cy="40" r="1.5" fill="#10B981" />
    <line x1="133" y1="40" x2="157" y2="40" stroke="#374151" strokeWidth="1.5" />
    <rect x="124" y="48" width="38" height="8" rx="1.5" fill="#1A1D20" />
    <circle cx="128" cy="52" r="1.5" fill="#F59E0B" />
    <line x1="133" y1="52" x2="157" y2="52" stroke="#374151" strokeWidth="1.5" />
    <text x="130" y="66" fill="#10B981" fontSize="5" fontFamily="monospace">:8080 OK</text>
  </svg>
);

export const GitBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Main Branch Line */}
    <line x1="25" y1="45" x2="155" y2="45" stroke="#38BDF8" strokeWidth="2" />
    
    {/* Feature Branch Curve */}
    <path d="M 55 45 C 75 45, 85 20, 115 20 L 140 20" stroke="#A855F7" strokeWidth="2" strokeDasharray="3 2" fill="none" />
    
    {/* Merge Curve */}
    <path d="M 115 20 C 130 20, 135 45, 150 45" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

    {/* Commit c1 (Root) */}
    <circle cx="30" cy="45" r="7" fill="#FAF8F2" stroke="#1A1D20" strokeWidth="2" />
    <text x="30" y="47" fill="#1A1D20" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">c1</text>

    {/* Commit c2 (Main) */}
    <circle cx="75" cy="45" r="7" fill="#FAF8F2" stroke="#38BDF8" strokeWidth="2" />
    <text x="75" y="47" fill="#1A1D20" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">c2</text>

    {/* Commit c3 (Feature) */}
    <circle cx="115" cy="20" r="7" fill="#FAF8F2" stroke="#A855F7" strokeWidth="2" />
    <text x="115" y="22" fill="#A855F7" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">c3</text>

    {/* Commit c4 (Merge) */}
    <circle cx="150" cy="45" r="8" fill="#10B981" stroke="#1A1D20" strokeWidth="1.5" />
    <text x="150" y="48" fill="#FAF8F2" fontSize="5.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">c4</text>

    {/* HEAD Tag */}
    <rect x="135" y="62" width="30" height="12" rx="2" fill="#10B981" />
    <text x="150" y="70" fill="#FAF8F2" fontSize="4.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">HEAD</text>
  </svg>
);

export const BanditBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Hacker Terminal Screen */}
    <rect x="15" y="20" width="55" height="48" rx="4" stroke="currentColor" strokeWidth="1.8" fill="#05080E" />
    <rect x="20" y="25" width="45" height="7" rx="1.5" fill="#0D1520" />
    <circle cx="24" cy="28.5" r="1.5" fill="#EF4444" />
    <circle cx="29" cy="28.5" r="1.5" fill="#F59E0B" />
    <circle cx="34" cy="28.5" r="1.5" fill="#10B981" />
    <text x="21" y="42" fill="#10B981" fontSize="5" fontFamily="monospace" fontWeight="bold">$ cat .secret</text>
    <text x="21" y="52" fill="#38BDF8" fontSize="4.5" fontFamily="monospace">&gt; bandit&#123;pass&#125;</text>
    <rect x="52" y="48" width="3" height="6" fill="#10B981" />

    {/* Wire Tap & Packet Interceptor */}
    <line x1="70" y1="44" x2="115" y2="44" stroke="#059669" strokeWidth="2.5" strokeDasharray="3 2" />
    <circle cx="92" cy="44" r="9" fill="#059669" stroke="#05080E" strokeWidth="1.5" />
    <path d="M 88 44 L 92 40 L 96 44 L 92 48 Z" fill="#FAF8F2" />

    {/* Blue Team Shield Guard */}
    <path d="M 140 18 L 160 25 L 160 48 C 160 62, 140 70, 140 70 C 140 70, 120 62, 120 48 L 120 25 Z" fill="#065F46" stroke="#05080E" strokeWidth="1.8" />
    <circle cx="140" cy="42" r="5" fill="#FAF8F2" />
    <rect x="138" y="42" width="4" height="6" fill="#FAF8F2" />
  </svg>
);

export const VertexBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Cloud Outline */}
    <path d="M 25 45 C 20 45 15 40 15 35 C 15 28 22 24 28 25 C 32 18 42 16 48 22 C 54 18 64 22 65 28 C 70 28 75 32 75 38 C 75 45 68 45 65 45 Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.8" />
    <text x="42" y="36" fill="#1E40AF" fontSize="5.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">GCS</text>

    {/* DAG Connecting Line */}
    <line x1="75" y1="36" x2="105" y2="36" stroke="#2563EB" strokeWidth="2" strokeDasharray="3 2" />
    <circle cx="90" cy="36" r="4" fill="#2563EB" />

    {/* TPU / GPU Accelerator Die */}
    <rect x="105" y="18" width="45" height="45" rx="5" fill="#1E293B" stroke="#2563EB" strokeWidth="1.8" />
    <rect x="112" y="25" width="31" height="31" rx="3" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
    <text x="127" y="42" fill="#38BDF8" fontSize="5.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">A100</text>
    <text x="127" y="49" fill="#93C5FD" fontSize="4" fontFamily="monospace" textAnchor="middle">NVLINK</text>

    {/* Inference Pulse Antenna */}
    <path d="M 127 63 L 127 75" stroke="#2563EB" strokeWidth="1.5" />
    <circle cx="127" cy="78" r="3" fill="#10B981" />
  </svg>
);

export const FdeBlueprintSvg: React.FC = () => (
  <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="text-[#1A1D20]">
    {/* Legacy System Tower */}
    <rect x="15" y="20" width="35" height="50" rx="3" fill="#334155" stroke="#1E293B" strokeWidth="1.5" />
    <line x1="20" y1="28" x2="45" y2="28" stroke="#94A3B8" strokeWidth="1.5" />
    <line x1="20" y1="34" x2="45" y2="34" stroke="#94A3B8" strokeWidth="1.5" />
    <circle cx="23" cy="55" r="2" fill="#22C55E" />
    <circle cx="30" cy="55" r="2" fill="#EAB308" />
    <text x="32" y="65" fill="#CBD5E1" fontSize="4" fontFamily="monospace">LEGACY</text>

    {/* Modern Agentic Bridge / LangGraph */}
    <line x1="50" y1="45" x2="85" y2="45" stroke="#A855F7" strokeWidth="2" strokeDasharray="2.5 2" />
    <circle cx="68" cy="45" r="7" fill="#7E22CE" stroke="#1E1B4B" strokeWidth="1.5" />
    <text x="68" y="47" fill="#FAF5FF" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">FDE</text>

    {/* Enterprise Security Shield */}
    <path d="M 125 18 L 155 24 L 155 50 C 155 65, 125 74, 125 74 C 125 74, 95 65, 95 50 L 95 24 Z" fill="#581C87" stroke="#3B0764" strokeWidth="1.8" />
    <circle cx="125" cy="44" r="6" fill="#FAF5FF" />
    <text x="125" y="46" fill="#581C87" fontSize="5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">AI</text>
    <text x="125" y="62" fill="#E9D5FF" fontSize="4" fontFamily="monospace" textAnchor="middle">SECURED</text>
  </svg>
);
