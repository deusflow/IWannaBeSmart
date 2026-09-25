import { describe, it, expect } from "vitest";
import { generateCertificateSvg, downloadCertificateSvg } from "../certificateSvg";

describe("certificateSvg utility", () => {
  it("should generate a valid standalone SVG certificate document", () => {
    const svg = generateCertificateSvg({
      stationCode: "VERTEX",
      stationTitle: "Vertex AI Architect",
      credentialTitle: "Certified Cloud MLOps Architect",
      callsign: "CyberViper",
      stars: 20,
      maxStars: 20,
      xp: 1500,
      competencies: [
        "Cloud Object Ingestion",
        "A100 Cluster Sizing",
        "Zero-Downtime Serving",
      ],
      themeColor: "#3B82F6",
    });

    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg width="1200" height="800"');
    expect(svg).toContain("CYBERVIPER");
    expect(svg).toContain("VERTEX AI ARCHITECT");
    expect(svg).toContain("Certified Cloud MLOps Architect");
    expect(svg).toContain("20/20");
    expect(svg).toContain("+1500 TOTAL XP");
    expect(svg).toContain("CAREER QUALIFICATION: L1: CODE APPRENTICE");
    expect(svg).toContain("Cloud Object Ingestion");
    expect(svg).toContain("#3B82F6");
    expect(svg).toContain("IW-VERTEX-");
  });

  it("should render custom careerRank when provided", () => {
    const svg = generateCertificateSvg({
      stationCode: "CYBER",
      stationTitle: "Google Cybersecurity",
      credentialTitle: "Certified Security Architect",
      callsign: "NetStalker",
      stars: 32,
      maxStars: 32,
      xp: 2400,
      competencies: ["SIEM Triage", "Packet Analysis"],
      careerRank: "L4: Solutions Architect",
    });

    expect(svg).toContain("CAREER QUALIFICATION: L4: SOLUTIONS ARCHITECT");
  });

  it("should escape special XML characters in competency items", () => {
    const svg = generateCertificateSvg({
      stationCode: "BANDIT",
      stationTitle: "Security Lab",
      credentialTitle: "Certified Hacker",
      callsign: "Operator <Test & Root>",
      stars: 10,
      maxStars: 24,
      xp: 500,
      competencies: [
        "SQLi <input> & verification",
        "A & B > C",
      ],
    });

    expect(svg).toContain("&lt;input&gt; &amp; verification");
    expect(svg).toContain("A &amp; B &gt; C");
  });

  it("should safely handle downloadCertificateSvg call in non-DOM environment without throwing", () => {
    expect(() => {
      downloadCertificateSvg({
        stationCode: "API",
        stationTitle: "API Forge",
        credentialTitle: "API Architect",
        callsign: "Agent 007",
        stars: 24,
        maxStars: 24,
        xp: 1800,
        competencies: ["Healthchecks", "Routing"],
      });
    }).not.toThrow();
  });
});
