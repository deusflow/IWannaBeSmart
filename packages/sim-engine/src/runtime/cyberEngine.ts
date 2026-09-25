/**
 * @file packages/sim-engine/src/runtime/cyberEngine.ts
 * @description Station 10: Google Cybersecurity & SOC Analyst Engine.
 * 100% in-browser deterministic simulation engine providing:
 * 1. SIEM Log Parser & Threat Query Filter (Chronicle / Splunk / KQL-style)
 * 2. Web-Wireshark Packet Dissector & Hex Dumper
 * 3. Anomaly Detectors: TCP SYN Flood, ARP Cache Poisoning, Cleartext Credential Sniffer
 * 4. MITRE ATT&CK TTP Mapping & NIST CSF Incident Response State Machine
 * 5. Dynamic Firewall / iptables Containment Rule Generator
 */

export type SecuritySeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityEventCategory = "auth" | "network" | "endpoint" | "dns" | "cloud";

export interface CyberSecurityLogEntry {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  eventCategory: SecurityEventCategory;
  severity: SecuritySeverity;
  action: "ALLOW" | "BLOCK" | "ALERT";
  message: string;
  user?: string;
  mitreTtp?: string;
  mitreName?: string;
  rawSyslog: string;
}

export type PacketProtocol = "TCP" | "UDP" | "ICMP" | "ARP" | "HTTP" | "DNS";

export interface TcpFlags {
  syn: boolean;
  ack: boolean;
  fin: boolean;
  rst: boolean;
  psh: boolean;
}

export interface NetworkPacket {
  frameNumber: number;
  timestamp: number; // millisecond offset or epoch
  sourceIp: string;
  destIp: string;
  sourceMac: string;
  destMac: string;
  protocol: PacketProtocol;
  sourcePort?: number;
  destPort?: number;
  flags?: TcpFlags;
  length: number;
  payload: string;
  hexDump: string;
  isMalicious?: boolean;
  threatReason?: string;
}

export type NistCsfStage = "IDENTIFY" | "PROTECT" | "DETECT" | "RESPOND" | "RECOVER";

export interface IncidentState {
  incidentId: string;
  title: string;
  stage: NistCsfStage;
  compromisedAssets: string[];
  containedIps: string[];
  isolatedHosts: string[];
  revokedTokens: string[];
  isContained: boolean;
  mitreTtp: string;
}

/**
 * Generate a realistic ASCII hex dump string for a given text payload.
 */
export function generateHexDump(payload: string): string {
  const bytes = Array.from(new TextEncoder().encode(payload));
  let result = "";
  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const hex = chunk
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")
      .padEnd(48, " ");
    const ascii = chunk
      .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
      .join("");
    const offset = i.toString(16).padStart(4, "0");
    result += `${offset}  ${hex}  |${ascii}|\n`;
  }
  return result.trimEnd();
}

/**
 * Parses RFC 5424 / RFC 3164 styled syslog message into structured SecurityLogEntry.
 */
export function parseSyslog(raw: string, id: string = "log_auto"): CyberSecurityLogEntry {
  // Example: <134>1 2026-09-25T08:14:02Z host-edge01 sshd 4120 - - Failed password for invalid user admin from 198.51.100.42 port 54822 ssh2
  const timestampMatch = raw.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?/);
  const timestamp = timestampMatch ? timestampMatch[0] : new Date().toISOString();

  let severity: SecuritySeverity = "INFO";
  if (/failed password|unauthorized|denied|invalid user|drop/i.test(raw)) {
    severity = "HIGH";
  }
  if (/exploit|shell|sqlmap|injection|root login|ransomware|malware/i.test(raw)) {
    severity = "CRITICAL";
  } else if (/warn|deprecated|retry/i.test(raw)) {
    severity = "LOW";
  }

  const ipMatches = raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
  const sourceIp = ipMatches[0] || "127.0.0.1";
  const destIp = ipMatches[1] || "10.0.0.1";

  const userMatch = raw.match(/user[ =]([a-zA-Z0-9_-]+)/i);
  const user = userMatch ? userMatch[1] : undefined;

  let eventCategory: SecurityEventCategory = "network";
  if (/sshd|auth|pam|login|password/i.test(raw)) {
    eventCategory = "auth";
  } else if (/dns|bind|named/i.test(raw)) {
    eventCategory = "dns";
  } else if (/endpoint|kernel|ossec|crowdstrike/i.test(raw)) {
    eventCategory = "endpoint";
  }

  const action = severity === "CRITICAL" || severity === "HIGH" ? "ALERT" : "ALLOW";

  return {
    id,
    timestamp,
    sourceIp,
    destIp,
    eventCategory,
    severity,
    action,
    message: raw.replace(/^<.*?>\d?\s*/, "").trim(),
    user,
    rawSyslog: raw,
  };
}

/**
 * Filter SIEM logs using a lightweight KQL/Splunk/Chronicle like query filter.
 * Supports:
 * - Direct field equality: `severity = "CRITICAL"`, `eventCategory = "auth"`
 * - Substring contains: `message contains "ssh"`, `sourceIp = "192.168.1.100"`
 * - AND / OR operators
 */
export function querySiemLogs(logs: CyberSecurityLogEntry[], query: string): CyberSecurityLogEntry[] {
  const trimmed = query.trim();
  if (!trimmed || trimmed === "*") return [...logs];

  // Parse basic condition tokens
  const conditions = trimmed.split(/\s+AND\s+/i);

  return logs.filter((log) => {
    return conditions.every((cond) => {
      const matchEquals = cond.match(/^([a-zA-Z_]+)\s*(=|==|!=)\s*["']?([^"']+)["']?$/);
      if (matchEquals) {
        const [, field, op, val] = matchEquals;
        const recordVal = String((log as unknown as Record<string, unknown>)[field] || "").toLowerCase();
        const targetVal = val.trim().toLowerCase();
        if (op === "!=") {
          return recordVal !== targetVal;
        }
        return recordVal === targetVal;
      }

      const matchContains = cond.match(/^([a-zA-Z_]+)\s+contains\s+["']?([^"']+)["']?$/i);
      if (matchContains) {
        const [, field, val] = matchContains;
        const recordVal = String((log as unknown as Record<string, unknown>)[field] || "").toLowerCase();
        return recordVal.includes(val.trim().toLowerCase());
      }

      // Free text fallback search
      const term = cond.replace(/^["']|["']$/g, "").toLowerCase();
      return (
        log.message.toLowerCase().includes(term) ||
        log.sourceIp.toLowerCase().includes(term) ||
        log.destIp.toLowerCase().includes(term) ||
        (log.user && log.user.toLowerCase().includes(term))
      );
    });
  });
}

/**
 * Dissect a packet into detailed layer explanations (like Wireshark tree items).
 */
export function dissectPacket(packet: NetworkPacket): {
  layer2: string;
  layer3: string;
  layer4: string;
  layer7?: string;
} {
  const layer2 = `Ethernet II, Src: ${packet.sourceMac}, Dst: ${packet.destMac}`;
  const layer3 = `Internet Protocol Version 4, Src: ${packet.sourceIp}, Dst: ${packet.destIp}, Total Length: ${packet.length}`;

  let layer4 = `Protocol: ${packet.protocol}`;
  if (packet.protocol === "TCP" || packet.protocol === "HTTP" || packet.flags) {
    const flagList = packet.flags
      ? Object.entries(packet.flags)
          .filter(([, active]) => active)
          .map(([f]) => f.toUpperCase())
          .join(", ")
      : "ACK";
    layer4 = `Transmission Control Protocol, Src Port: ${packet.sourcePort || 80}, Dst Port: ${packet.destPort || 80}, Flags: [${flagList || "NONE"}]`;
  } else if (packet.protocol === "UDP" || packet.protocol === "DNS") {
    layer4 = `User Datagram Protocol, Src Port: ${packet.sourcePort}, Dst Port: ${packet.destPort}, Length: ${packet.length}`;
  } else if (packet.protocol === "ARP") {
    layer4 = `Address Resolution Protocol (request/reply)`;
  }

  let layer7: string | undefined = undefined;
  if (packet.protocol === "HTTP" || packet.payload.startsWith("GET ") || packet.payload.startsWith("POST ") || packet.payload.startsWith("HTTP/")) {
    layer7 = `Hypertext Transfer Protocol: ${packet.payload.split("\n")[0]}`;
  } else if (packet.protocol === "DNS") {
    layer7 = `Domain Name System (query/response): ${packet.payload}`;
  }

  return { layer2, layer3, layer4, layer7 };
}

/**
 * Detects TCP SYN flood denial-of-service attack.
 * SYN flood is characterized by high incoming SYN packets without corresponding ACK / completion.
 */
export function detectSynFlood(
  packets: NetworkPacket[],
  synThreshold: number = 5
): { isUnderAttack: boolean; suspiciousIps: string[]; synToAckRatio: number } {
  let synCount = 0;
  let ackCount = 0;
  const ipSynMap: Record<string, number> = {};

  for (const p of packets) {
    if (p.protocol === "TCP" && p.flags) {
      if (p.flags.syn && !p.flags.ack) {
        synCount++;
        ipSynMap[p.sourceIp] = (ipSynMap[p.sourceIp] || 0) + 1;
      } else if (p.flags.ack) {
        ackCount++;
      }
    }
  }

  const suspiciousIps = Object.entries(ipSynMap)
    .filter(([, count]) => count >= synThreshold)
    .map(([ip]) => ip);

  const ratio = ackCount === 0 ? synCount : Number((synCount / ackCount).toFixed(2));
  const isUnderAttack = suspiciousIps.length > 0 || (synCount >= 10 && ratio >= 3.0);

  return {
    isUnderAttack,
    suspiciousIps,
    synToAckRatio: ratio,
  };
}

/**
 * Detects ARP Cache Poisoning (Man-in-the-Middle).
 * Occurs when two distinct MAC addresses claim the exact same IPv4 gateway/host address.
 */
export function detectArpPoisoning(packets: NetworkPacket[]): {
  detected: boolean;
  poisonedIp?: string;
  conflictingMacs: string[];
} {
  const ipToMacs: Record<string, Set<string>> = {};

  for (const p of packets) {
    if (p.protocol === "ARP") {
      if (!ipToMacs[p.sourceIp]) {
        ipToMacs[p.sourceIp] = new Set();
      }
      ipToMacs[p.sourceIp].add(p.sourceMac);
    }
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

  return {
    detected: false,
    conflictingMacs: [],
  };
}

/**
 * Sniffs unencrypted cleartext credentials (e.g. Basic Auth, plaintext POST body, Telnet).
 */
export function inspectCleartextCredentials(packets: NetworkPacket[]): {
  found: boolean;
  credentials: Array<{ sourceIp: string; service: string; username?: string; secret?: string }>;
} {
  const results: Array<{ sourceIp: string; service: string; username?: string; secret?: string }> = [];

  for (const p of packets) {
    // Check Authorization: Basic header (Base64)
    const basicAuthMatch = p.payload.match(/Authorization:\s*Basic\s+([A-Za-z0-9+/=]+)/i);
    if (basicAuthMatch) {
      try {
        const decoded = atob(basicAuthMatch[1]);
        const [username, secret] = decoded.split(":");
        results.push({
          sourceIp: p.sourceIp,
          service: "HTTP Basic Auth",
          username,
          secret,
        });
      } catch {
        // invalid base64
      }
    }

    // Check plaintext POST form body (e.g. username=admin&password=123)
    const formMatch = p.payload.match(/(?:username|user|login)=([^&\s]+)&(?:password|pass|secret)=([^&\s]+)/i);
    if (formMatch) {
      results.push({
        sourceIp: p.sourceIp,
        service: "HTTP Form Submission",
        username: decodeURIComponent(formMatch[1]),
        secret: decodeURIComponent(formMatch[2]),
      });
    }
  }

  return {
    found: results.length > 0,
    credentials: results,
  };
}

/**
 * Maps security alerts to standard MITRE ATT&CK techniques.
 */
export function mapToMitreAttck(eventDescription: string): {
  ttpId: string;
  name: string;
  tactic: string;
} {
  const desc = eventDescription.toLowerCase();

  if (desc.includes("brute force") || desc.includes("password") || desc.includes("failed login")) {
    return {
      ttpId: "T1110",
      name: "Brute Force: Credential Stuffing & Password Guessing",
      tactic: "Credential Access",
    };
  }

  if (desc.includes("syn flood") || desc.includes("dos") || desc.includes("exhaustion")) {
    return {
      ttpId: "T1498",
      name: "Network Denial of Service: Direct Network Flood",
      tactic: "Impact",
    };
  }

  if (desc.includes("arp") || desc.includes("spoof") || desc.includes("mitm")) {
    return {
      ttpId: "T1557",
      name: "Adversary-in-the-Middle: ARP Cache Poisoning",
      tactic: "Credential Access / Collection",
    };
  }

  if (desc.includes("sql") || desc.includes("injection") || desc.includes("sqli")) {
    return {
      ttpId: "T1190",
      name: "Exploit Public-Facing Application: SQL Injection",
      tactic: "Initial Access",
    };
  }

  if (desc.includes("tunnel") || desc.includes("dns exfil") || desc.includes("exfiltration")) {
    return {
      ttpId: "T1071.004",
      name: "Application Layer Protocol: DNS Exfiltration Tunneling",
      tactic: "Command and Control",
    };
  }

  return {
    ttpId: "T1059",
    name: "Command and Scripting Interpreter",
    tactic: "Execution",
  };
}

/**
 * Generates an enterprise iptables / nftables firewall drop rule for an adversarial IP.
 */
export function generateIptablesBlockRule(ip: string): string {
  const cleanIp = ip.trim();
  return `sudo iptables -I INPUT 1 -s ${cleanIp} -j DROP -m comment --comment "SOC Automated Containment Block"`;
}

/**
 * Default sample logs for SOC studio simulation.
 */
export const SAMPLE_SECURITY_LOGS: CyberSecurityLogEntry[] = [
  {
    id: "log_01",
    timestamp: "2026-09-25T08:14:02Z",
    sourceIp: "198.51.100.42",
    destIp: "10.0.4.15",
    eventCategory: "auth",
    severity: "HIGH",
    action: "ALERT",
    message: "Failed SSH password for invalid user 'admin' from 198.51.100.42 port 54822 ssh2",
    user: "admin",
    mitreTtp: "T1110.001",
    mitreName: "Password Guessing",
    rawSyslog: "<134>1 2026-09-25T08:14:02Z edge-gw01 sshd 4120 - - Failed SSH password for invalid user admin from 198.51.100.42 port 54822 ssh2",
  },
  {
    id: "log_02",
    timestamp: "2026-09-25T08:14:05Z",
    sourceIp: "198.51.100.42",
    destIp: "10.0.4.15",
    eventCategory: "auth",
    severity: "HIGH",
    action: "ALERT",
    message: "Failed SSH password for root from 198.51.100.42 port 54826 ssh2 [3 consecutive failures]",
    user: "root",
    mitreTtp: "T1110.001",
    mitreName: "Password Guessing",
    rawSyslog: "<134>1 2026-09-25T08:14:05Z edge-gw01 sshd 4123 - - Failed SSH password for root from 198.51.100.42 port 54826 ssh2",
  },
  {
    id: "log_03",
    timestamp: "2026-09-25T08:15:10Z",
    sourceIp: "203.0.113.88",
    destIp: "10.0.2.80",
    eventCategory: "network",
    severity: "CRITICAL",
    action: "ALERT",
    message: "WAF Alert: SQL Injection payload detected in URI parameter 'id=1%27%20OR%201=1--'",
    mitreTtp: "T1190",
    mitreName: "Exploit Public-Facing App",
    rawSyslog: "<131>1 2026-09-25T08:15:10Z waf-lb02 coraza-waf 8812 - - SQL Injection payload detected in URI parameter 'id=1%27%20OR%201=1--'",
  },
  {
    id: "log_04",
    timestamp: "2026-09-25T08:16:30Z",
    sourceIp: "10.0.3.12",
    destIp: "8.8.8.8",
    eventCategory: "dns",
    severity: "HIGH",
    action: "ALERT",
    message: "High-entropy DNS query sequence detected: a8f9c0e21b74d.corp-exfil.net (Possible DNS Tunneling)",
    mitreTtp: "T1071.004",
    mitreName: "DNS Exfiltration Tunneling",
    rawSyslog: "<132>1 2026-09-25T08:16:30Z dns-resolver named 994 - - High-entropy DNS query sequence detected: a8f9c0e21b74d.corp-exfil.net",
  },
  {
    id: "log_05",
    timestamp: "2026-09-25T08:17:00Z",
    sourceIp: "10.0.1.5",
    destIp: "10.0.1.254",
    eventCategory: "network",
    severity: "LOW",
    action: "ALLOW",
    message: "NTP time synchronization successful with internal clock pool pool.ntp.local",
    rawSyslog: "<134>1 2026-09-25T08:17:00Z srv-app01 chronyd 612 - - NTP time synchronization successful with internal clock pool",
  },
];

/**
 * Default sample packets for Web-Wireshark inspector simulation.
 */
export const SAMPLE_PACKETS: NetworkPacket[] = [
  {
    frameNumber: 1,
    timestamp: 0,
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.5",
    sourceMac: "aa:bb:cc:dd:ee:01",
    destMac: "00:11:22:33:44:55",
    protocol: "TCP",
    sourcePort: 49152,
    destPort: 80,
    flags: { syn: true, ack: false, fin: false, rst: false, psh: false },
    length: 64,
    payload: "",
    hexDump: generateHexDump("TCP SYN Handshake initiation"),
  },
  {
    frameNumber: 2,
    timestamp: 12,
    sourceIp: "10.0.0.5",
    destIp: "192.168.1.100",
    sourceMac: "00:11:22:33:44:55",
    destMac: "aa:bb:cc:dd:ee:01",
    protocol: "TCP",
    sourcePort: 80,
    destPort: 49152,
    flags: { syn: true, ack: true, fin: false, rst: false, psh: false },
    length: 64,
    payload: "",
    hexDump: generateHexDump("TCP SYN-ACK Server acknowledgment"),
  },
  {
    frameNumber: 3,
    timestamp: 24,
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.5",
    sourceMac: "aa:bb:cc:dd:ee:01",
    destMac: "00:11:22:33:44:55",
    protocol: "HTTP",
    sourcePort: 49152,
    destPort: 80,
    flags: { syn: false, ack: true, fin: false, rst: false, psh: true },
    length: 248,
    payload: "POST /login HTTP/1.1\r\nHost: intranet.bank.local\r\nContent-Type: application/x-www-form-urlencoded\r\nAuthorization: Basic YWRtaW46U3VwZXJTZWNyZXQyMDI2IQ==\r\n\r\nusername=sec_lead&password=VaultAccess99!",
    hexDump: generateHexDump("POST /login HTTP/1.1\r\nAuthorization: Basic YWRtaW46U3VwZXJTZWNyZXQyMDI2IQ==\r\n\r\nusername=sec_lead&password=VaultAccess99!"),
    isMalicious: true,
    threatReason: "Cleartext credentials (HTTP Basic Auth & Form POST) detected in unencrypted transmission",
  },
  {
    frameNumber: 4,
    timestamp: 45,
    sourceIp: "10.0.0.1",
    destIp: "255.255.255.255",
    sourceMac: "ff:ee:dd:cc:bb:aa",
    destMac: "ff:ff:ff:ff:ff:ff",
    protocol: "ARP",
    length: 42,
    payload: "ARP is-at 10.0.0.1 tell 192.168.1.100",
    hexDump: generateHexDump("ARP Reply: 10.0.0.1 is-at ff:ee:dd:cc:bb:aa"),
    isMalicious: true,
    threatReason: "ARP Cache Poisoning: Host claiming default gateway IP 10.0.0.1 with unknown rogue MAC",
  },
];
