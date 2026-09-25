/**
 * @file packages/sim-engine/src/__tests__/cyberEngine.test.ts
 * @description Unit tests for Google Cybersecurity & SOC Analyst Engine.
 */

import { describe, it, expect } from "vitest";
import {
  parseSyslog,
  querySiemLogs,
  dissectPacket,
  detectSynFlood,
  detectArpPoisoning,
  inspectCleartextCredentials,
  mapToMitreAttck,
  generateIptablesBlockRule,
  generateHexDump,
  SAMPLE_SECURITY_LOGS,
  SAMPLE_PACKETS,
  type NetworkPacket,
} from "../runtime/cyberEngine";

describe("Google Cybersecurity & SOC Analyst Engine (cyberEngine)", () => {
  describe("Syslog Parser (parseSyslog)", () => {
    it("should parse an authentication failure syslog line and assign HIGH severity", () => {
      const raw = "<134>1 2026-09-25T08:14:02Z edge-gw01 sshd 4120 - - Failed password for invalid user admin from 198.51.100.42 port 54822 ssh2";
      const parsed = parseSyslog(raw, "test_log_01");

      expect(parsed.id).toBe("test_log_01");
      expect(parsed.timestamp).toBe("2026-09-25T08:14:02Z");
      expect(parsed.sourceIp).toBe("198.51.100.42");
      expect(parsed.severity).toBe("HIGH");
      expect(parsed.action).toBe("ALERT");
      expect(parsed.eventCategory).toBe("auth");
      expect(parsed.user).toBe("admin");
    });

    it("should elevate severity to CRITICAL for exploit payloads", () => {
      const raw = "<131>1 2026-09-25T08:15:10Z waf01 nginx - - SQL injection exploit detected in URI query from 203.0.113.5";
      const parsed = parseSyslog(raw, "test_log_02");

      expect(parsed.severity).toBe("CRITICAL");
      expect(parsed.action).toBe("ALERT");
    });
  });

  describe("SIEM Query Filter (querySiemLogs)", () => {
    it("should return all logs when query is empty or wildcard", () => {
      expect(querySiemLogs(SAMPLE_SECURITY_LOGS, "*")).toHaveLength(SAMPLE_SECURITY_LOGS.length);
      expect(querySiemLogs(SAMPLE_SECURITY_LOGS, "")).toHaveLength(SAMPLE_SECURITY_LOGS.length);
    });

    it("should filter logs by severity", () => {
      const critical = querySiemLogs(SAMPLE_SECURITY_LOGS, "severity = CRITICAL");
      expect(critical.length).toBeGreaterThan(0);
      expect(critical.every((l) => l.severity === "CRITICAL")).toBe(true);
    });

    it("should filter logs using contains operator and composite AND", () => {
      const filtered = querySiemLogs(SAMPLE_SECURITY_LOGS, "eventCategory = auth AND message contains SSH");
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((l) => l.eventCategory === "auth")).toBe(true);
    });
  });

  describe("Packet Dissector (dissectPacket)", () => {
    it("should dissect Ethernet, IP, TCP, and HTTP payload layers", () => {
      const httpPacket = SAMPLE_PACKETS[2];
      const dissected = dissectPacket(httpPacket);

      expect(dissected.layer2).toContain("Ethernet II");
      expect(dissected.layer3).toContain("192.168.1.100");
      expect(dissected.layer4).toContain("Transmission Control Protocol");
      expect(dissected.layer7).toContain("Hypertext Transfer Protocol");
    });
  });

  describe("SYN Flood Detector (detectSynFlood)", () => {
    it("should identify SYN flood condition when SYN to ACK ratio is anomalous", () => {
      const attackPackets: NetworkPacket[] = Array.from({ length: 15 }, (_, i) => ({
        frameNumber: i + 1,
        timestamp: i * 5,
        sourceIp: "192.0.2.66",
        destIp: "10.0.0.1",
        sourceMac: "00:aa:bb:cc:dd:ee",
        destMac: "00:11:22:33:44:55",
        protocol: "TCP",
        sourcePort: 10000 + i,
        destPort: 443,
        flags: { syn: true, ack: false, fin: false, rst: false, psh: false },
        length: 64,
        payload: "",
        hexDump: "",
      }));

      const result = detectSynFlood(attackPackets, 5);
      expect(result.isUnderAttack).toBe(true);
      expect(result.suspiciousIps).toContain("192.0.2.66");
      expect(result.synToAckRatio).toBeGreaterThan(10);
    });
  });

  describe("ARP Poisoning Detector (detectArpPoisoning)", () => {
    it("should flag conflict when multiple MAC addresses claim the same IP", () => {
      const arpPackets: NetworkPacket[] = [
        {
          frameNumber: 1,
          timestamp: 0,
          sourceIp: "192.168.1.1",
          destIp: "255.255.255.255",
          sourceMac: "00:11:22:33:44:01",
          destMac: "ff:ff:ff:ff:ff:ff",
          protocol: "ARP",
          length: 42,
          payload: "ARP reply",
          hexDump: "",
        },
        {
          frameNumber: 2,
          timestamp: 50,
          sourceIp: "192.168.1.1",
          destIp: "255.255.255.255",
          sourceMac: "aa:bb:cc:dd:ee:ff",
          destMac: "ff:ff:ff:ff:ff:ff",
          protocol: "ARP",
          length: 42,
          payload: "ARP spoof reply",
          hexDump: "",
        },
      ];

      const res = detectArpPoisoning(arpPackets);
      expect(res.detected).toBe(true);
      expect(res.poisonedIp).toBe("192.168.1.1");
      expect(res.conflictingMacs).toHaveLength(2);
    });
  });

  describe("Cleartext Credential Sniffer (inspectCleartextCredentials)", () => {
    it("should extract base64 Basic Auth and Form POST credentials", () => {
      const res = inspectCleartextCredentials(SAMPLE_PACKETS);
      expect(res.found).toBe(true);
      expect(res.credentials.length).toBeGreaterThanOrEqual(1);

      const basicCred = res.credentials.find((c) => c.service === "HTTP Basic Auth");
      expect(basicCred).toBeDefined();
      expect(basicCred?.username).toBe("admin");
      expect(basicCred?.secret).toBe("SuperSecret2026!");

      const formCred = res.credentials.find((c) => c.service === "HTTP Form Submission");
      expect(formCred).toBeDefined();
      expect(formCred?.username).toBe("sec_lead");
      expect(formCred?.secret).toBe("VaultAccess99!");
    });
  });

  describe("MITRE ATT&CK Mapper (mapToMitreAttck)", () => {
    it("should map Brute Force, DoS, and SQL injection correctly", () => {
      expect(mapToMitreAttck("SSH password brute force").ttpId).toBe("T1110");
      expect(mapToMitreAttck("TCP SYN flood attack").ttpId).toBe("T1498");
      expect(mapToMitreAttck("SQL injection vulnerability").ttpId).toBe("T1190");
      expect(mapToMitreAttck("ARP cache poisoning MITM").ttpId).toBe("T1557");
      expect(mapToMitreAttck("DNS tunneling exfiltration").ttpId).toBe("T1071.004");
    });
  });

  describe("Firewall & Hex Dump Utilities", () => {
    it("should generate standard iptables drop rule", () => {
      const rule = generateIptablesBlockRule("198.51.100.42");
      expect(rule).toContain("iptables -I INPUT 1 -s 198.51.100.42 -j DROP");
    });

    it("should format valid 16-byte hex dump", () => {
      const dump = generateHexDump("HELLO_WORLD_2026");
      expect(dump).toContain("0000");
      expect(dump).toContain("|HELLO_WORLD_2026|");
    });
  });
});
