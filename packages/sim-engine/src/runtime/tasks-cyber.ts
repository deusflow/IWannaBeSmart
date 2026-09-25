/**
 * @file packages/sim-engine/src/runtime/tasks-cyber.ts
 * @description Educational curriculum tasks for Google Cybersecurity & SOC Analyst Track.
 * 8 enterprise-grade tasks across Python & TypeScript covering:
 * 1. SIEM Log Ingestion & RFC 5424 Parsing
 * 2. Threat Hunting & KQL/Splunk Query Filter
 * 3. Packet Header Dissector & TCP Flag Inspection
 * 4. SYN Flood & Network DoS Anomaly Detection
 * 5. ARP Cache Poisoning & Man-in-the-Middle Detection
 * 6. Cleartext Credential & Sensitive Data Sniffer in PCAP
 * 7. Automated SOC Alert Triage & MITRE ATT&CK TTP Mapper
 * 8. NIST CSF Incident Containment & Dynamic Firewall Rule Generator
 */

import type { WorkedExample } from "./types";

export interface CyberTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  simpleExplanationKey?: string;
  engineeringKey?: string;
  workedExample?: WorkedExample;
  targetCode: {
    python: string;
    typescript: string;
  };
  clozeTemplate: {
    python: string;
    typescript: string;
  };
  transferVariant?: {
    prompt: Record<string, string>;
    hint?: Record<string, string>;
  };
}

export const CYBER_TASKS: CyberTask[] = [
  // ── Task 1: SIEM Log Ingestion & RFC 5424 Parsing ──────────────────────────
  {
    id: "task-cyber-1-syslog-parsing",
    order: 1,
    titleKey: "cyber.tasks.task1.title",
    conceptKey: "cyber.tasks.task1.concept",
    descKey: "cyber.tasks.task1.desc",
    hintKey: "cyber.tasks.task1.hint",
    successKey: "cyber.tasks.task1.success",
    simpleExplanationKey: "cyber.tasks.task1.simple",
    engineeringKey: "cyber.tasks.task1.engineering",
    targetCode: {
      python: `# RFC 5424 / RFC 3164 Syslog Parser for SIEM Ingestion
import re

def parse_syslog_line(raw_line: str) -> dict:
    ip_match = re.search(r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", raw_line)
    source_ip = ip_match.group(0) if ip_match else "127.0.0.1"

    severity = "INFO"
    if any(k in raw_line.lower() for k in ["failed", "invalid", "denied", "drop"]):
        severity = "HIGH"
    if any(k in raw_line.lower() for k in ["exploit", "shell", "injection", "root"]):
        severity = "CRITICAL"

    return {
        "source_ip": source_ip,
        "severity": severity,
        "action": "ALERT" if severity in ["HIGH", "CRITICAL"] else "ALLOW",
        "raw_message": raw_line.strip()
    }`,
      typescript: `// RFC 5424 / RFC 3164 Syslog Parser for SIEM Ingestion
export interface ParsedSyslog {
  sourceIp: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: "ALLOW" | "BLOCK" | "ALERT";
  rawMessage: string;
}

export function parseSyslogLine(rawLine: string): ParsedSyslog {
  const ipMatch = rawLine.match(/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/);
  const sourceIp = ipMatch ? ipMatch[0] : "127.0.0.1";

  let severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "INFO";
  const lower = rawLine.toLowerCase();
  if (lower.includes("failed") || lower.includes("invalid") || lower.includes("denied")) {
    severity = "HIGH";
  }
  if (lower.includes("exploit") || lower.includes("shell") || lower.includes("injection")) {
    severity = "CRITICAL";
  }

  const action = severity === "HIGH" || severity === "CRITICAL" ? "ALERT" : "ALLOW";

  return { sourceIp, severity, action, rawMessage: rawLine.trim() };
}`,
    },
    clozeTemplate: {
      python: `# RFC 5424 / RFC 3164 Syslog Parser for SIEM Ingestion
import re

def parse_syslog_line(raw_line: str) -> dict:
    ip_match = re.search(r"\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", raw_line)
    source_ip = ip_match.group(0) if ip_match else "127.0.0.1"

    severity = "___"
    if any(k in raw_line.lower() for k in ["failed", "invalid", "denied", "drop"]):
        severity = "HIGH"
    if any(k in raw_line.lower() for k in ["exploit", "shell", "injection", "root"]):
        severity = "___"

    return {
        "source_ip": source_ip,
        "severity": severity,
        "action": "ALERT" if severity in ["HIGH", "CRITICAL"] else "ALLOW",
        "raw_message": raw_line.strip()
    }`,
      typescript: `// RFC 5424 / RFC 3164 Syslog Parser for SIEM Ingestion
export interface ParsedSyslog {
  sourceIp: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  action: "ALLOW" | "BLOCK" | "ALERT";
  rawMessage: string;
}

export function parseSyslogLine(rawLine: string): ParsedSyslog {
  const ipMatch = rawLine.match(/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/);
  const sourceIp = ipMatch ? ipMatch[0] : "127.0.0.1";

  let severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "___";
  const lower = rawLine.toLowerCase();
  if (lower.includes("failed") || lower.includes("invalid") || lower.includes("denied")) {
    severity = "HIGH";
  }
  if (lower.includes("exploit") || lower.includes("shell") || lower.includes("injection")) {
    severity = "___";
  }

  const action = severity === "HIGH" || severity === "CRITICAL" ? "ALERT" : "ALLOW";

  return { sourceIp, severity, action, rawMessage: rawLine.trim() };
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Розширте функцію для вилучення імені користувача (user=admin або user admin).",
        en: "Extend the parser function to extract username from syslog line (user=admin or user admin).",
        da: "Udvid parser-funktionen til at udtrække brugernavn fra syslog-linjen.",
      },
      hint: {
        ua: "Використовуйте регулярний вираз r'user[ =]([a-zA-Z0-9_-]+)' для пошуку групи.",
        en: "Use regex r'user[ =]([a-zA-Z0-9_-]+)' to extract the matched group.",
        da: "Brug regex r'user[ =]([a-zA-Z0-9_-]+)' til at fange gruppen.",
      },
    },
  },

  // ── Task 2: Threat Hunting & KQL/Splunk Query Filter ───────────────────────
  {
    id: "task-cyber-2-threat-hunting-filter",
    order: 2,
    titleKey: "cyber.tasks.task2.title",
    conceptKey: "cyber.tasks.task2.concept",
    descKey: "cyber.tasks.task2.desc",
    hintKey: "cyber.tasks.task2.hint",
    successKey: "cyber.tasks.task2.success",
    simpleExplanationKey: "cyber.tasks.task2.simple",
    engineeringKey: "cyber.tasks.task2.engineering",
    targetCode: {
      python: `# Threat Hunting Query Filter (Chronicle / Splunk style)
def filter_siem_events(events: list[dict], min_severity: str = "HIGH", category: str = "auth") -> list[dict]:
    severity_ranks = {"INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    threshold = severity_ranks.get(min_severity, 3)

    results = []
    for ev in events:
        ev_rank = severity_ranks.get(ev.get("severity", "INFO"), 0)
        if ev_rank >= threshold and ev.get("eventCategory") == category:
            results.append(ev)
    return results`,
      typescript: `// Threat Hunting Query Filter (Chronicle / Splunk style)
export interface SiemEvent {
  id: string;
  sourceIp: string;
  eventCategory: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
}

export function filterSiemEvents(
  events: SiemEvent[],
  minSeverity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "HIGH",
  category: string = "auth"
): SiemEvent[] {
  const ranks = { INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const targetRank = ranks[minSeverity];

  return events.filter(
    (ev) => ranks[ev.severity] >= targetRank && ev.eventCategory === category
  );
}`,
    },
    clozeTemplate: {
      python: `# Threat Hunting Query Filter (Chronicle / Splunk style)
def filter_siem_events(events: list[dict], min_severity: str = "HIGH", category: str = "auth") -> list[dict]:
    severity_ranks = {"INFO": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}
    threshold = severity_ranks.get(min_severity, 3)

    results = []
    for ev in events:
        ev_rank = severity_ranks.get(ev.get("severity", "INFO"), 0)
        if ev_rank >= ___ and ev.get("eventCategory") == ___:
            results.append(ev)
    return results`,
      typescript: `// Threat Hunting Query Filter (Chronicle / Splunk style)
export interface SiemEvent {
  id: string;
  sourceIp: string;
  eventCategory: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
}

export function filterSiemEvents(
  events: SiemEvent[],
  minSeverity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "HIGH",
  category: string = "auth"
): SiemEvent[] {
  const ranks = { INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const targetRank = ranks[minSeverity];

  return events.filter(
    (ev) => ranks[ev.severity] >= ___ && ev.eventCategory === ___
  );
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Додайте фільтрацію за унікальними IP-адресами з понад 3 помилками автентифікації.",
        en: "Add aggregation to find source IPs with greater than 3 authentication failures.",
        da: "Tilføj aggregering til at finde kilde-IP'er med mere end 3 godkendelsesfejl.",
      },
    },
  },

  // ── Task 3: Packet Header Dissector & TCP Flag Inspection ──────────────────
  {
    id: "task-cyber-3-packet-dissector",
    order: 3,
    titleKey: "cyber.tasks.task3.title",
    conceptKey: "cyber.tasks.task3.concept",
    descKey: "cyber.tasks.task3.desc",
    hintKey: "cyber.tasks.task3.hint",
    successKey: "cyber.tasks.task3.success",
    simpleExplanationKey: "cyber.tasks.task3.simple",
    engineeringKey: "cyber.tasks.task3.engineering",
    targetCode: {
      python: `# Web-Wireshark Packet Dissector
def dissect_tcp_packet(packet: dict) -> dict:
    flags = packet.get("flags", {})
    flag_names = [f.upper() for f, active in flags.items() if active]
    flags_str = ", ".join(flag_names) if flag_names else "NONE"

    layer2 = f"Ethernet II, Src: {packet['sourceMac']}, Dst: {packet['destMac']}"
    layer3 = f"IPv4, Src: {packet['sourceIp']}, Dst: {packet['destIp']}, Len: {packet['length']}"
    layer4 = f"TCP, Port: {packet.get('sourcePort')} -> {packet.get('destPort')}, Flags: [{flags_str}]"

    return {"layer2": layer2, "layer3": layer3, "layer4": layer4}`,
      typescript: `// Web-Wireshark Packet Dissector
export interface RawPacket {
  sourceMac: string;
  destMac: string;
  sourceIp: string;
  destIp: string;
  length: number;
  sourcePort?: number;
  destPort?: number;
  flags?: Record<string, boolean>;
}

export function dissectTcpPacket(packet: RawPacket): {
  layer2: string;
  layer3: string;
  layer4: string;
} {
  const flags = packet.flags || {};
  const activeFlags = Object.entries(flags)
    .filter(([, active]) => active)
    .map(([f]) => f.toUpperCase())
    .join(", ");

  const layer2 = \`Ethernet II, Src: \${packet.sourceMac}, Dst: \${packet.destMac}\`;
  const layer3 = \`IPv4, Src: \${packet.sourceIp}, Dst: \${packet.destIp}, Len: \${packet.length}\`;
  const layer4 = \`TCP, Port: \${packet.sourcePort} -> \${packet.destPort}, Flags: [\${activeFlags || "NONE"}]\`;

  return { layer2, layer3, layer4 };
}`,
    },
    clozeTemplate: {
      python: `# Web-Wireshark Packet Dissector
def dissect_tcp_packet(packet: dict) -> dict:
    flags = packet.get("flags", {})
    flag_names = [f.upper() for f, active in flags.items() if active]
    flags_str = ", ".join(flag_names) if flag_names else "NONE"

    layer2 = f"Ethernet II, Src: {packet['sourceMac']}, Dst: {packet['destMac']}"
    layer3 = f"IPv4, Src: {packet['sourceIp']}, Dst: {packet['destIp']}, Len: {packet['length']}"
    layer4 = f"TCP, Port: {packet.get('sourcePort')} -> {packet.get('destPort')}, Flags: [{___}]"

    return {"layer2": layer2, "layer3": layer3, "layer4": layer4}`,
      typescript: `// Web-Wireshark Packet Dissector
export function dissectTcpPacket(packet: RawPacket): {
  layer2: string;
  layer3: string;
  layer4: string;
} {
  const flags = packet.flags || {};
  const activeFlags = Object.entries(flags)
    .filter(([, active]) => active)
    .map(([f]) => f.toUpperCase())
    .join(", ");

  const layer2 = \`Ethernet II, Src: \${packet.sourceMac}, Dst: \${packet.destMac}\`;
  const layer3 = \`IPv4, Src: \${packet.sourceIp}, Dst: \${packet.destIp}, Len: \${packet.length}\`;
  const layer4 = \`TCP, Port: \${packet.sourcePort} -> \${packet.destPort}, Flags: [\${___ || "NONE"}]\`;

  return { layer2, layer3, layer4 };
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Перевірте, чи є прапорець SYN встановленим без ACK (ініціація нового з'єднання).",
        en: "Detect if the packet is a pure SYN handshake initiation (SYN active, ACK inactive).",
        da: "Registrer, om pakken er en ren SYN handshake-initiering.",
      },
    },
  },

  // ── Task 4: SYN Flood & DoS Anomaly Detection ──────────────────────────────
  {
    id: "task-cyber-4-syn-flood-detector",
    order: 4,
    titleKey: "cyber.tasks.task4.title",
    conceptKey: "cyber.tasks.task4.concept",
    descKey: "cyber.tasks.task4.desc",
    hintKey: "cyber.tasks.task4.hint",
    successKey: "cyber.tasks.task4.success",
    simpleExplanationKey: "cyber.tasks.task4.simple",
    engineeringKey: "cyber.tasks.task4.engineering",
    targetCode: {
      python: `# TCP SYN Flood Denial-of-Service Detector
def detect_syn_flood(packets: list[dict], threshold: int = 5) -> list[str]:
    syn_counts = {}
    for p in packets:
        flags = p.get("flags", {})
        if flags.get("syn") and not flags.get("ack"):
            ip = p.get("sourceIp")
            syn_counts[ip] = syn_counts.get(ip, 0) + 1

    suspicious_ips = [ip for ip, count in syn_counts.items() if count >= threshold]
    return suspicious_ips`,
      typescript: `// TCP SYN Flood Denial-of-Service Detector
export interface PacketWithFlags {
  sourceIp: string;
  flags?: { syn?: boolean; ack?: boolean };
}

export function detectSynFlood(packets: PacketWithFlags[], threshold: number = 5): string[] {
  const synCounts: Record<string, number> = {};

  for (const p of packets) {
    if (p.flags?.syn && !p.flags?.ack) {
      synCounts[p.sourceIp] = (synCounts[p.sourceIp] || 0) + 1;
    }
  }

  return Object.entries(synCounts)
    .filter(([, count]) => count >= threshold)
    .map(([ip]) => ip);
}`,
    },
    clozeTemplate: {
      python: `# TCP SYN Flood Denial-of-Service Detector
def detect_syn_flood(packets: list[dict], threshold: int = 5) -> list[str]:
    syn_counts = {}
    for p in packets:
        flags = p.get("flags", {})
        if flags.get("syn") and not flags.get("___"):
            ip = p.get("sourceIp")
            syn_counts[ip] = syn_counts.get(ip, 0) + 1

    suspicious_ips = [ip for ip, count in syn_counts.items() if count >= ___]
    return suspicious_ips`,
      typescript: `// TCP SYN Flood Denial-of-Service Detector
export function detectSynFlood(packets: PacketWithFlags[], threshold: number = 5): string[] {
  const synCounts: Record<string, number> = {};

  for (const p of packets) {
    if (p.flags?.syn && !p.flags?.___) {
      synCounts[p.sourceIp] = (synCounts[p.sourceIp] || 0) + 1;
    }
  }

  return Object.entries(synCounts)
    .filter(([, count]) => count >= ___)
    .map(([ip]) => ip);
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Розрахуйте загальне співвідношення SYN до ACK та поверніть true, якщо воно перевищує 3.0.",
        en: "Calculate global SYN to ACK ratio and return true if it exceeds 3.0.",
        da: "Beregn globalt SYN til ACK forhold og returner true, hvis det overstiger 3.0.",
      },
    },
  },

  // ── Task 5: ARP Cache Poisoning Detector ───────────────────────────────────
  {
    id: "task-cyber-5-arp-poisoning",
    order: 5,
    titleKey: "cyber.tasks.task5.title",
    conceptKey: "cyber.tasks.task5.concept",
    descKey: "cyber.tasks.task5.desc",
    hintKey: "cyber.tasks.task5.hint",
    successKey: "cyber.tasks.task5.success",
    simpleExplanationKey: "cyber.tasks.task5.simple",
    engineeringKey: "cyber.tasks.task5.engineering",
    targetCode: {
      python: `# ARP Cache Poisoning (Man-in-the-Middle) Detector
def detect_arp_poisoning(arp_frames: list[dict]) -> tuple[bool, str, list[str]]:
    ip_to_macs = {}
    for frame in arp_frames:
        ip = frame.get("sourceIp")
        mac = frame.get("sourceMac")
        if ip not in ip_to_macs:
            ip_to_macs[ip] = set()
        ip_to_macs[ip].add(mac)

    for ip, mac_set in ip_to_macs.items():
        if len(mac_set) > 1:
            return (True, ip, list(mac_set))

    return (False, "", [])`,
      typescript: `// ARP Cache Poisoning (Man-in-the-Middle) Detector
export interface ArpFrame {
  sourceIp: string;
  sourceMac: string;
}

export function detectArpPoisoning(arpFrames: ArpFrame[]): {
  detected: boolean;
  poisonedIp: string;
  conflictingMacs: string[];
} {
  const ipToMacs: Record<string, Set<string>> = {};

  for (const f of arpFrames) {
    if (!ipToMacs[f.sourceIp]) {
      ipToMacs[f.sourceIp] = new Set();
    }
    ipToMacs[f.sourceIp].add(f.sourceMac);
  }

  for (const [ip, macSet] of Object.entries(ipToMacs)) {
    if (macSet.size > 1) {
      return {
        detected: true,
        poisonedIp: ip,
        conflictingMacs: Array.from(macSet),
      };
    }
  }

  return { detected: false, poisonedIp: "", conflictingMacs: [] };
}`,
    },
    clozeTemplate: {
      python: `# ARP Cache Poisoning (Man-in-the-Middle) Detector
def detect_arp_poisoning(arp_frames: list[dict]) -> tuple[bool, str, list[str]]:
    ip_to_macs = {}
    for frame in arp_frames:
        ip = frame.get("sourceIp")
        mac = frame.get("sourceMac")
        if ip not in ip_to_macs:
            ip_to_macs[ip] = set()
        ip_to_macs[ip].add(mac)

    for ip, mac_set in ip_to_macs.items():
        if len(mac_set) > ___:
            return (True, ip, list(mac_set))

    return (False, "", [])`,
      typescript: `// ARP Cache Poisoning (Man-in-the-Middle) Detector
export function detectArpPoisoning(arpFrames: ArpFrame[]): {
  detected: boolean;
  poisonedIp: string;
  conflictingMacs: string[];
} {
  const ipToMacs: Record<string, Set<string>> = {};

  for (const f of arpFrames) {
    if (!ipToMacs[f.sourceIp]) {
      ipToMacs[f.sourceIp] = new Set();
    }
    ipToMacs[f.sourceIp].add(f.sourceMac);
  }

  for (const [ip, macSet] of Object.entries(ipToMacs)) {
    if (macSet.size > ___) {
      return {
        detected: true,
        poisonedIp: ip,
        conflictingMacs: Array.from(macSet),
      };
    }
  }

  return { detected: false, poisonedIp: "", conflictingMacs: [] };
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Визначте MAC-адресу зловмисника, припускаючи, що перший зафіксований MAC є легітимним.",
        en: "Identify the rogue MAC address assuming the earliest seen MAC was the legitimate host.",
        da: "Identificer den falske MAC-adresse ud fra antagelsen om, at den tidligste MAC er legitim.",
      },
    },
  },

  // ── Task 6: Cleartext Credential Sniffer ───────────────────────────────────
  {
    id: "task-cyber-6-credential-sniffer",
    order: 6,
    titleKey: "cyber.tasks.task6.title",
    conceptKey: "cyber.tasks.task6.concept",
    descKey: "cyber.tasks.task6.desc",
    hintKey: "cyber.tasks.task6.hint",
    successKey: "cyber.tasks.task6.success",
    simpleExplanationKey: "cyber.tasks.task6.simple",
    engineeringKey: "cyber.tasks.task6.engineering",
    targetCode: {
      python: `# Cleartext Credential & Basic Auth Sniffer
import base64
import re

def sniff_credentials(packets: list[dict]) -> list[dict]:
    findings = []
    for p in packets:
        payload = p.get("payload", "")
        # Check HTTP Basic Auth header
        auth_match = re.search(r"Authorization:\\s*Basic\\s+([A-Za-z0-9+/=]+)", payload, re.IGNORECASE)
        if auth_match:
            try:
                decoded = base64.b64decode(auth_match.group(1)).decode("utf-8")
                user, secret = decoded.split(":", 1)
                findings.append({"sourceIp": p.get("sourceIp"), "service": "BasicAuth", "user": user, "secret": secret})
            except Exception:
                pass
    return findings`,
      typescript: `// Cleartext Credential & Basic Auth Sniffer
export interface CredentialFinding {
  sourceIp: string;
  service: string;
  user: string;
  secret: string;
}

export function sniffCredentials(packets: Array<{ sourceIp: string; payload: string }>): CredentialFinding[] {
  const findings: CredentialFinding[] = [];

  for (const p of packets) {
    const match = p.payload.match(/Authorization:\\s*Basic\\s+([A-Za-z0-9+/=]+)/i);
    if (match) {
      try {
        const decoded = atob(match[1]);
        const [user, secret] = decoded.split(":");
        findings.push({ sourceIp: p.sourceIp, service: "BasicAuth", user, secret });
      } catch {
        // invalid base64
      }
    }
  }

  return findings;
}`,
    },
    clozeTemplate: {
      python: `# Cleartext Credential & Basic Auth Sniffer
import base64
import re

def sniff_credentials(packets: list[dict]) -> list[dict]:
    findings = []
    for p in packets:
        payload = p.get("payload", "")
        auth_match = re.search(r"Authorization:\\s*Basic\\s+([A-Za-z0-9+/=]+)", payload, re.IGNORECASE)
        if auth_match:
            try:
                decoded = base64.b64decode(auth_match.group(1)).decode("___")
                user, secret = decoded.split(":", 1)
                findings.append({"sourceIp": p.get("sourceIp"), "service": "BasicAuth", "user": user, "secret": secret})
            except Exception:
                pass
    return findings`,
      typescript: `// Cleartext Credential & Basic Auth Sniffer
export function sniffCredentials(packets: Array<{ sourceIp: string; payload: string }>): CredentialFinding[] {
  const findings: CredentialFinding[] = [];

  for (const p of packets) {
    const match = p.payload.match(/Authorization:\\s*Basic\\s+([A-Za-z0-9+/=]+)/i);
    if (match) {
      try {
        const decoded = atob(match[1]);
        const [user, secret] = decoded.split("___");
        findings.push({ sourceIp: p.sourceIp, service: "BasicAuth", user, secret });
      } catch {
        // invalid base64
      }
    }
  }

  return findings;
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Додайте перевірку на наявність паролів у тілі HTTP POST запитів (application/x-www-form-urlencoded).",
        en: "Add extraction for cleartext password params in HTTP POST request body.",
        da: "Tilføj udtræk for klartekst password-parametre i HTTP POST body.",
      },
    },
  },

  // ── Task 7: Automated SOC Alert Triage & MITRE ATT&CK Mapper ───────────────
  {
    id: "task-cyber-7-mitre-triage",
    order: 7,
    titleKey: "cyber.tasks.task7.title",
    conceptKey: "cyber.tasks.task7.concept",
    descKey: "cyber.tasks.task7.desc",
    hintKey: "cyber.tasks.task7.hint",
    successKey: "cyber.tasks.task7.success",
    simpleExplanationKey: "cyber.tasks.task7.simple",
    engineeringKey: "cyber.tasks.task7.engineering",
    targetCode: {
      python: `# Automated SOC Alert Triage & MITRE ATT&CK TTP Mapper
def map_mitre_ttp(alert_desc: str) -> dict:
    desc = alert_desc.lower()
    if "brute force" in desc or "failed password" in desc:
        return {"ttp": "T1110", "name": "Brute Force", "tactic": "Credential Access"}
    if "syn flood" in desc or "dos" in desc:
        return {"ttp": "T1498", "name": "Network Denial of Service", "tactic": "Impact"}
    if "sql" in desc or "injection" in desc:
        return {"ttp": "T1190", "name": "Exploit Public-Facing App", "tactic": "Initial Access"}
    if "arp" in desc or "poisoning" in desc:
        return {"ttp": "T1557", "name": "Adversary-in-the-Middle", "tactic": "Collection"}
    return {"ttp": "T1059", "name": "Command and Scripting Interpreter", "tactic": "Execution"}`,
      typescript: `// Automated SOC Alert Triage & MITRE ATT&CK TTP Mapper
export interface MitreTtp {
  ttp: string;
  name: string;
  tactic: string;
}

export function mapMitreTtp(alertDesc: string): MitreTtp {
  const desc = alertDesc.toLowerCase();
  if (desc.includes("brute force") || desc.includes("failed password")) {
    return { ttp: "T1110", name: "Brute Force", tactic: "Credential Access" };
  }
  if (desc.includes("syn flood") || desc.includes("dos")) {
    return { ttp: "T1498", name: "Network Denial of Service", tactic: "Impact" };
  }
  if (desc.includes("sql") || desc.includes("injection")) {
    return { ttp: "T1190", name: "Exploit Public-Facing App", tactic: "Initial Access" };
  }
  if (desc.includes("arp") || desc.includes("poisoning")) {
    return { ttp: "T1557", name: "Adversary-in-the-Middle", tactic: "Collection" };
  }
  return { ttp: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution" };
}`,
    },
    clozeTemplate: {
      python: `# Automated SOC Alert Triage & MITRE ATT&CK TTP Mapper
def map_mitre_ttp(alert_desc: str) -> dict:
    desc = alert_desc.lower()
    if "brute force" in desc or "failed password" in desc:
        return {"ttp": "___", "name": "Brute Force", "tactic": "Credential Access"}
    if "syn flood" in desc or "dos" in desc:
        return {"ttp": "___", "name": "Network Denial of Service", "tactic": "Impact"}
    if "sql" in desc or "injection" in desc:
        return {"ttp": "T1190", "name": "Exploit Public-Facing App", "tactic": "Initial Access"}
    return {"ttp": "T1059", "name": "Command and Scripting Interpreter", "tactic": "Execution"}`,
      typescript: `// Automated SOC Alert Triage & MITRE ATT&CK TTP Mapper
export function mapMitreTtp(alertDesc: string): MitreTtp {
  const desc = alertDesc.toLowerCase();
  if (desc.includes("brute force") || desc.includes("failed password")) {
    return { ttp: "___", name: "Brute Force", tactic: "Credential Access" };
  }
  if (desc.includes("syn flood") || desc.includes("dos")) {
    return { ttp: "___", name: "Network Denial of Service", tactic: "Impact" };
  }
  if (desc.includes("sql") || desc.includes("injection")) {
    return { ttp: "T1190", name: "Exploit Public-Facing App", tactic: "Initial Access" };
  }
  return { ttp: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution" };
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Додайте техніку T1071.004 для аномальних DNS-запитів високої ентропії (DNS Tunneling).",
        en: "Add detection for technique T1071.004 for high-entropy DNS queries (DNS Tunneling).",
        da: "Tilføj teknik T1071.004 for anomal DNS-forespørgsler (DNS Tunneling).",
      },
    },
  },

  // ── Task 8: NIST CSF Incident Containment & Firewall Rule Generator ────────
  {
    id: "task-cyber-8-nist-containment",
    order: 8,
    titleKey: "cyber.tasks.task8.title",
    conceptKey: "cyber.tasks.task8.concept",
    descKey: "cyber.tasks.task8.desc",
    hintKey: "cyber.tasks.task8.hint",
    successKey: "cyber.tasks.task8.success",
    simpleExplanationKey: "cyber.tasks.task8.simple",
    engineeringKey: "cyber.tasks.task8.engineering",
    targetCode: {
      python: `# NIST CSF Respond Phase: Automated Firewall Containment
def contain_threat(adversary_ip: str, host_id: str) -> dict:
    firewall_rule = f"sudo iptables -I INPUT 1 -s {adversary_ip.strip()} -j DROP -m comment --comment 'SOC Containment'"
    isolation_cmd = f"sudo ip link set dev eth0 down && sudo systemctl stop sshd # Host: {host_id}"

    return {
        "status": "CONTAINED",
        "adversary_ip": adversary_ip,
        "firewall_rule": firewall_rule,
        "host_isolation_command": isolation_cmd
    }`,
      typescript: `// NIST CSF Respond Phase: Automated Firewall Containment
export interface ContainmentAction {
  status: "CONTAINED";
  adversaryIp: string;
  firewallRule: string;
  hostIsolationCommand: string;
}

export function containThreat(adversaryIp: string, hostId: string): ContainmentAction {
  const firewallRule = \`sudo iptables -I INPUT 1 -s \${adversaryIp.trim()} -j DROP -m comment --comment 'SOC Containment'\`;
  const hostIsolationCommand = \`sudo ip link set dev eth0 down && sudo systemctl stop sshd # Host: \${hostId}\`;

  return {
    status: "CONTAINED",
    adversaryIp,
    firewallRule,
    hostIsolationCommand,
  };
}`,
    },
    clozeTemplate: {
      python: `# NIST CSF Respond Phase: Automated Firewall Containment
def contain_threat(adversary_ip: str, host_id: str) -> dict:
    firewall_rule = f"sudo iptables -I INPUT 1 -s {adversary_ip.strip()} -j ___ -m comment --comment 'SOC Containment'"
    isolation_cmd = f"sudo ip link set dev eth0 down && sudo systemctl stop sshd # Host: {host_id}"

    return {
        "status": "CONTAINED",
        "adversary_ip": adversary_ip,
        "firewall_rule": firewall_rule,
        "host_isolation_command": isolation_cmd
    }`,
      typescript: `// NIST CSF Respond Phase: Automated Firewall Containment
export function containThreat(adversaryIp: string, hostId: string): ContainmentAction {
  const firewallRule = \`sudo iptables -I INPUT 1 -s \${adversaryIp.trim()} -j ___ -m comment --comment 'SOC Containment'\`;
  const hostIsolationCommand = \`sudo ip link set dev eth0 down && sudo systemctl stop sshd # Host: \${hostId}\`;

  return {
    status: "CONTAINED",
    adversaryIp,
    firewallRule,
    hostIsolationCommand,
  };
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Згенеруйте nftables правило замість iptables: 'nft add rule ip filter input ip saddr <ip> drop'.",
        en: "Generate nftables syntax instead of iptables: 'nft add rule ip filter input ip saddr <ip> drop'.",
        da: "Generer nftables-syntaks i stedet for iptables.",
      },
    },
  },
];
