/**
 * @file apps/web/src/utils/certificateSvg.ts
 * @description High-DPI Vector SVG Certificate generator and downloader for all stations.
 * Zero external dependencies — generates a crisp, printable 1200x800 SVG vector asset.
 */

import { toast } from "../store/toastStore";
import { calculateCareerRank } from "./careerRank";

export interface CertificateOptions {
  stationCode: string;
  stationTitle: string;
  credentialTitle: string;
  callsign: string;
  stars: number;
  maxStars: number;
  xp: number;
  competencies: string[];
  themeColor?: string; // hex accent color, e.g. #3B82F6, #10B981, #A855F7
  locale?: string;
  careerRank?: string; // e.g. "L1: Code Apprentice", "L2: Junior Implementer", "L3: Systems Specialist", "L4: Solutions Architect"
}

export function generateCertificateSvg(opts: CertificateOptions): string {
  const accent = opts.themeColor || "#3B82F6";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `IW-${opts.stationCode.toUpperCase()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const defaultRank = calculateCareerRank(opts.xp || 0, 1, 0);
  const rawRank = opts.careerRank || `${defaultRank.grade}: ${defaultRank.codeName}`;
  const safeCareerRank = rawRank
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const competencyItems = opts.competencies
    .slice(0, 5)
    .map(
      (comp, i) => `
      <g transform="translate(180, ${480 + i * 35})">
        <circle cx="8" cy="8" r="5" fill="${accent}" opacity="0.8"/>
        <text x="24" y="12" fill="#E2E8F0" font-family="'JetBrains Mono', monospace" font-size="14" font-weight="500">
          ${comp.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </text>
      </g>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="800" fill="url(#bgGrad)"/>

  <!-- Subtle Blueprint Vector Grid -->
  <g opacity="0.05" stroke="#94A3B8" stroke-width="1">
    ${Array.from({ length: 24 })
      .map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="800"/>`)
      .join("")}
    ${Array.from({ length: 16 })
      .map((_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}"/>`)
      .join("")}
  </g>

  <!-- Certificate Border Framing -->
  <rect x="40" y="40" width="1120" height="720" rx="16" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
  <rect x="52" y="52" width="1096" height="696" rx="12" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.6"/>

  <!-- Corner Cornerpiece Embellishments -->
  <path d="M40 80 L80 40 M1120 40 L1160 80 M40 720 L80 760 M1120 760 L1160 720" stroke="url(#goldGrad)" stroke-width="2" opacity="0.5"/>

  <!-- Header Branding -->
  <text x="600" y="110" text-anchor="middle" fill="${accent}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" letter-spacing="6">
    IWANNABESMART // INTERACTIVE SOFTWARE ENGINEERING ACCREDITATION
  </text>
  <text x="600" y="160" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="800" letter-spacing="-0.5">
    CERTIFICATE OF ENGINEERING MASTERY
  </text>
  <line x1="450" y1="185" x2="750" y2="185" stroke="url(#accentGrad)" stroke-width="2"/>

  <!-- Recipient Section -->
  <text x="600" y="235" text-anchor="middle" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="500">
    This credential formally validates that engineering operator
  </text>
  <text x="600" y="285" text-anchor="middle" fill="url(#goldGrad)" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="800">
    ${opts.callsign.toUpperCase()}
  </text>
  <text x="600" y="325" text-anchor="middle" fill="#94A3B8" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="500">
    has proven rigorous muscle memory and production system invariants in
  </text>

  <!-- Credential Title -->
  <rect x="250" y="348" width="700" height="52" rx="10" fill="#1E293B" stroke="${accent}" stroke-width="1.5" opacity="0.8"/>
  <text x="600" y="381" text-anchor="middle" fill="#FFFFFF" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700">
    ${opts.credentialTitle}
  </text>

  <!-- Station Code & Telemetry -->
  <text x="600" y="422" text-anchor="middle" fill="${accent}" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="600" letter-spacing="2">
    ${opts.stationTitle.toUpperCase()} • ${opts.stars}/${opts.maxStars} MASTERY STARS • +${opts.xp} TOTAL XP
  </text>

  <!-- Career Qualification Grade Badge -->
  <g transform="translate(600, 436)">
    <rect x="-180" y="0" width="360" height="24" rx="12" fill="#1E293B" stroke="${accent}" stroke-width="1.2" opacity="0.95"/>
    <circle cx="-160" cy="12" r="4" fill="#F59E0B"/>
    <text x="0" y="16" text-anchor="middle" fill="#FCD34D" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" letter-spacing="1.5">
      CAREER QUALIFICATION: ${safeCareerRank.toUpperCase()}
    </text>
  </g>

  <!-- Competencies List -->
  ${competencyItems}

  <!-- Footer Signatures & Verification Seal -->
  <g transform="translate(180, 680)">
    <text x="0" y="0" fill="#64748B" font-family="'JetBrains Mono', monospace" font-size="11">DATE OF ISSUE</text>
    <text x="0" y="20" fill="#E2E8F0" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600">${dateStr}</text>
  </g>

  <!-- Central Microchip Seal -->
  <g transform="translate(565, 645)">
    <rect x="0" y="0" width="70" height="70" rx="14" fill="#1E293B" stroke="${accent}" stroke-width="2"/>
    <rect x="18" y="18" width="34" height="34" rx="6" fill="${accent}" opacity="0.2"/>
    <circle cx="35" cy="35" r="10" fill="${accent}"/>
    <text x="35" y="78" text-anchor="middle" fill="#94A3B8" font-family="'JetBrains Mono', monospace" font-size="9">VERIFIED</text>
  </g>

  <g transform="translate(860, 680)">
    <text x="0" y="0" fill="#64748B" font-family="'JetBrains Mono', monospace" font-size="11">CREDENTIAL IDENTIFIER</text>
    <text x="0" y="20" fill="#E2E8F0" font-family="'JetBrains Mono', monospace" font-size="13" font-weight="600">${certId}</text>
  </g>
</svg>
`;
}

export function downloadCertificateSvg(opts: CertificateOptions): void {
  if (typeof document === "undefined") return;
  const svg = generateCertificateSvg(opts);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const filename = `Certificate_${opts.stationCode}_${opts.callsign.replace(/\s+/g, "_")}.svg`;
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success(
    opts.locale === "en"
      ? "Certificate downloaded"
      : opts.locale === "da"
      ? "Certifikat downloadet"
      : "Векторний сертифікат згенеровано",
    filename
  );

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
