/**
 * @file packages/sim-engine/src/runtime/banditContext.ts
 * @description Virtual UNIX bandit wargame, packet sniffer, parameter tampering, SQL injection, and rate limiting simulation engine.
 */

export interface BanditFile {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
  permissions: string; // e.g. "-rw-------" or "-rwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  isSecret?: boolean;
}

export interface BanditPacket {
  id: string;
  timestamp: number;
  method: "GET" | "POST";
  url: string;
  headers: Record<string, string>;
  body: string; // JSON string
  signature?: string; // HMAC-SHA256
  isTampered?: boolean;
  status: "TRANSIT" | "INTERCEPTED" | "FORWARDED" | "DROPPED";
}

export interface DefenseStatus {
  tlsEnabled: boolean;
  hmacActive: boolean;
  sqlParametrized: boolean;
  rateLimitActive: boolean;
}

export interface SqlUser {
  id: number;
  username: string;
  role: string;
  token: string;
}

export interface SqlInjectionResult {
  success: boolean;
  queryExecuted: string;
  vulnerabilityExploited: boolean;
  returnedUsers: SqlUser[];
  message: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  statusCode: number; // 200 or 429
  message: string;
}

export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  type: "INFO" | "ALERT" | "BLOCKED" | "BREACH";
  source: string;
  message: string;
}

export interface BanditState {
  level: number;
  capturedFlags: Record<number, string>;
  files: Record<string, BanditFile>;
  currentDir: string;
  cliHistory: string[];
  cliOutput: string[];
  transitPacket: BanditPacket | null;
  interceptMode: boolean;
  tamperBuffer: string;
  defenseState: DefenseStatus;
  rateLimiter: {
    tokens: number;
    maxTokens: number;
    lastRefillTime: number;
    blockedUntil: number;
  };
  securityLogs: SecurityLogEntry[];
}

export const BANDIT_FLAGS: Record<number, string> = {
  1: "bandit{h1dd3n_d0t_f1l3_p4ssw0rd}",
  2: "bandit{b64_d3c0d3d_t0k3n_c0nf1rm3d}",
  3: "bandit{hm4c_s1gn4tur3_t4mp3r_d3t3ct3d}",
  4: "bandit{sql_pr3p4r3d_st4t3m3nt_sh13ld}",
  5: "bandit{r4t3_l1m1t_429_brut3_bl0ck3d}",
  6: "bandit{d3f3ns3_1n_d3pth_m4st3r_2026}",
};

export const INITIAL_SQL_USERS: SqlUser[] = [
  { id: 1, username: "admin", role: "superadmin", token: "flag_root_token_999" },
  { id: 2, username: "alice", role: "dev", token: "user_token_alice_123" },
  { id: 3, username: "bob", role: "finance", token: "user_token_bob_456" },
];

/**
 * Generates initial files for a given level
 */
export function getInitialBanditFiles(level: number): Record<string, BanditFile> {
  const files: Record<string, BanditFile> = {
    "/home/bandit": {
      name: "bandit",
      path: "/home/bandit",
      isDirectory: true,
      permissions: "drwxr-xr-x",
      owner: "bandit",
      group: "bandit",
      size: 4096,
    },
    "/home/bandit/readme.txt": {
      name: "readme.txt",
      path: "/home/bandit/readme.txt",
      isDirectory: false,
      content: `Welcome to Cyber Bandit Lab!\nTo advance to next stages, find the password flags and submit them via:\n  submit-flag bandit{...}\nUse 'ls -la', 'cat', 'grep', 'base64 -d', and 'help'.`,
      permissions: "-rw-r--r--",
      owner: "bandit",
      group: "bandit",
      size: 198,
    },
  };

  if (level >= 1) {
    // Hidden dot file with password
    files["/home/bandit/.secret_pass"] = {
      name: ".secret_pass",
      path: "/home/bandit/.secret_pass",
      isDirectory: false,
      content: BANDIT_FLAGS[1],
      permissions: "-rw-------",
      owner: "bandit",
      group: "bandit",
      size: 36,
      isSecret: true,
    };
    files["/home/bandit/.env"] = {
      name: ".env",
      path: "/home/bandit/.env",
      isDirectory: false,
      content: "DATABASE_URL=postgres://app:secure_vault@db.prod.internal:5432/main\nAPI_SECRET=vault_secret_key_8841",
      permissions: "-rw-r--r--",
      owner: "bandit",
      group: "bandit",
      size: 98,
    };
  }

  if (level >= 2) {
    // Base64 encoded password
    const encodedFlag = btoa(BANDIT_FLAGS[2]);
    files["/home/bandit/data.b64"] = {
      name: "data.b64",
      path: "/home/bandit/data.b64",
      isDirectory: false,
      content: `${encodedFlag}\n`,
      permissions: "-rw-r--r--",
      owner: "bandit",
      group: "bandit",
      size: encodedFlag.length + 1,
    };
    files["/home/bandit/notes.txt"] = {
      name: "notes.txt",
      path: "/home/bandit/notes.txt",
      isDirectory: false,
      content: "The authentication token was intercepted from an API payload and stored in data.b64. Use 'base64 -d data.b64' to decode.",
      permissions: "-rw-r--r--",
      owner: "bandit",
      group: "bandit",
      size: 130,
    };
  }

  if (level >= 3) {
    files["/home/bandit/transit_order.json"] = {
      name: "transit_order.json",
      path: "/home/bandit/transit_order.json",
      isDirectory: false,
      content: JSON.stringify({ orderId: "ORD-771", item: "Master Keycard", price: 9999, role: "guest" }, null, 2),
      permissions: "-rw-rw-rw-",
      owner: "bandit",
      group: "bandit",
      size: 120,
    };
  }

  return files;
}

/**
 * Creates sample packet for MITM interception
 */
export function createTransitPacket(_level = 1): BanditPacket {
  const bodyObj = {
    orderId: "ORD-942",
    item: "Quantum Cryptographic Key",
    price: 1500,
    requestedRole: "analyst",
    account: "ACC-0042",
  };
  const body = JSON.stringify(bodyObj);

  return {
    id: `pkt-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: Date.now(),
    method: "POST",
    url: "/api/v1/orders/checkout",
    headers: {
      "Host": "api.megacorp.internal",
      "Content-Type": "application/json",
      "User-Agent": "MegaPOS/2.4",
      "X-Signature": "sha256:7e9b21f3a92b904e5482b84931a2",
    },
    body,
    signature: "sha256:7e9b21f3a92b904e5482b84931a2",
    status: "TRANSIT",
  };
}

/**
 * Create initial state
 */
export function createInitialBanditState(level = 1): BanditState {
  const files = getInitialBanditFiles(level);
  return {
    level,
    capturedFlags: {},
    files,
    currentDir: "/home/bandit",
    cliHistory: [],
    cliOutput: [
      "==================================================",
      "   CYBER BANDIT LAB v4.0 - OFFENSIVE & DEFENSIVE",
      "==================================================",
      `[+] Connected as user: bandit (uid=1001, gid=1001)`,
      `[+] Mission: Uncover vulnerabilities, intercept packets, bypass bad code, and engineer ironclad defenses.`,
      `[+] Type 'help' or 'ls -la' to explore current environment.`,
    ],
    transitPacket: createTransitPacket(level),
    interceptMode: false,
    tamperBuffer: JSON.stringify({ price: 1, requestedRole: "admin" }, null, 2),
    defenseState: {
      tlsEnabled: false,
      hmacActive: false,
      sqlParametrized: false,
      rateLimitActive: false,
    },
    rateLimiter: {
      tokens: 5,
      maxTokens: 5,
      lastRefillTime: Date.now(),
      blockedUntil: 0,
    },
    securityLogs: [
      {
        id: "log-1",
        timestamp: new Date().toLocaleTimeString(),
        type: "INFO",
        source: "FIREWALL",
        message: "Network sniffer attached to transit line. TLS encryption currently disabled.",
      },
    ],
  };
}

/**
 * CLI Command Processor for Virtual UNIX Terminal
 */
export function executeBanditCommand(
  state: BanditState,
  cmdLine: string
): { newState: BanditState; output: string; flagCaptured?: string } {
  const trimmed = cmdLine.trim();
  if (!trimmed) {
    return { newState: state, output: "" };
  }

  const newHistory = [...state.cliHistory, trimmed];
  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  let output: string;
  let capturedFlag: string | undefined;
  const newFiles = { ...state.files };
  const newCapturedFlags = { ...state.capturedFlags };
  const newCurrentDir = state.currentDir;

  switch (cmd) {
    case "clear": {
      return {
        newState: {
          ...state,
          cliHistory: newHistory,
          cliOutput: [],
        },
        output: "",
      };
    }

    case "help": {
      output = [
        "Available UNIX Bandit Commands:",
        "  ls [-la]              List directory files (including hidden dotfiles)",
        "  cat <file>            Display file contents",
        "  grep <pattern> <file> Search text in file",
        "  base64 [-d] <file>    Encode or decode Base64 data",
        "  file <file>           Inspect file type and metadata",
        "  chmod <perms> <file>  Modify file permissions (e.g. 0600)",
        "  pwd                   Print current working directory",
        "  whoami / id           Display active user credentials",
        "  submit-flag <flag>    Submit discovered flag (e.g. bandit{...})",
        "  clear                 Clear terminal screen",
      ].join("\n");
      break;
    }

    case "pwd": {
      output = newCurrentDir;
      break;
    }

    case "whoami": {
      output = "bandit";
      break;
    }

    case "id": {
      output = "uid=1001(bandit) gid=1001(bandit) groups=1001(bandit),100(users)";
      break;
    }

    case "ls": {
      const showAll = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const showLong = args.includes("-l") || args.includes("-la") || args.includes("-al");

      const dirFiles = Object.values(newFiles).filter((f) => {
        const parent = f.path.substring(0, f.path.lastIndexOf("/")) || "/";
        return parent === newCurrentDir;
      });

      if (!showAll && !showLong) {
        output = dirFiles
          .filter((f) => !f.name.startsWith("."))
          .map((f) => f.name)
          .join("  ");
      } else {
        const lines: string[] = [`total ${dirFiles.length}`];
        if (showAll) {
          lines.push(`drwxr-xr-x 2 bandit bandit 4096 .`);
          lines.push(`drwxr-xr-x 3 root   root   4096 ..`);
        }
        for (const f of dirFiles) {
          if (!showAll && f.name.startsWith(".")) continue;
          const sizeStr = f.size.toString().padStart(6, " ");
          lines.push(`${f.permissions} 1 ${f.owner} ${f.group} ${sizeStr} ${f.name}`);
        }
        output = lines.join("\n");
      }
      break;
    }

    case "cat": {
      if (!args[0]) {
        output = "cat: missing file operand";
        break;
      }
      const targetName = args[0];
      const fullPath = targetName.startsWith("/") ? targetName : `${newCurrentDir}/${targetName}`;
      const file = newFiles[fullPath];

      if (!file) {
        output = `cat: ${targetName}: No such file or directory`;
      } else if (file.isDirectory) {
        output = `cat: ${targetName}: Is a directory`;
      } else {
        output = file.content ?? "";
      }
      break;
    }

    case "grep": {
      if (args.length < 2) {
        output = "Usage: grep [-i] <pattern> <file>";
        break;
      }
      let pattern = args[0];
      let fileName = args[1];
      let ignoreCase = false;
      if (pattern === "-i") {
        ignoreCase = true;
        pattern = args[1];
        fileName = args[2];
      }

      if (!fileName || !pattern) {
        output = "Usage: grep [-i] <pattern> <file>";
        break;
      }

      const fullPath = fileName.startsWith("/") ? fileName : `${newCurrentDir}/${fileName}`;
      const file = newFiles[fullPath];
      if (!file || file.isDirectory) {
        output = `grep: ${fileName}: No such file or directory`;
      } else {
        const lines = (file.content || "").split("\n");
        const matches = lines.filter((l) =>
          ignoreCase ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern)
        );
        output = matches.join("\n") || `grep: pattern '${pattern}' not found`;
      }
      break;
    }

    case "base64": {
      if (!args[0]) {
        output = "Usage: base64 [-d] <file>";
        break;
      }
      const isDecode = args[0] === "-d" || args[0] === "--decode";
      const fileName = isDecode ? args[1] : args[0];
      if (!fileName) {
        output = "Usage: base64 -d <file>";
        break;
      }

      const fullPath = fileName.startsWith("/") ? fileName : `${newCurrentDir}/${fileName}`;
      const file = newFiles[fullPath];
      const rawText = file ? (file.content || "").trim() : fileName;

      try {
        if (isDecode) {
          output = atob(rawText);
        } else {
          output = btoa(rawText);
        }
      } catch (err) {
        output = `base64: invalid input / decoding error: ${err}`;
      }
      break;
    }

    case "file": {
      if (!args[0]) {
        output = "file: missing operand";
        break;
      }
      const targetName = args[0];
      const fullPath = targetName.startsWith("/") ? targetName : `${newCurrentDir}/${targetName}`;
      const file = newFiles[fullPath];
      if (!file) {
        output = `${targetName}: cannot open \`${targetName}' (No such file or directory)`;
      } else if (file.isDirectory) {
        output = `${targetName}: directory`;
      } else if (file.name.endsWith(".b64")) {
        output = `${targetName}: ASCII text, with very long lines (Base64 encoded)`;
      } else {
        output = `${targetName}: ASCII text`;
      }
      break;
    }

    case "chmod": {
      if (args.length < 2) {
        output = "chmod: missing operand";
        break;
      }
      const mode = args[0];
      const targetName = args[1];
      const fullPath = targetName.startsWith("/") ? targetName : `${newCurrentDir}/${targetName}`;
      const file = newFiles[fullPath];
      if (!file) {
        output = `chmod: cannot access '${targetName}': No such file or directory`;
      } else {
        if (mode === "0600" || mode === "600") {
          file.permissions = "-rw-------";
          output = `[+] Changed permissions of ${targetName} to 0600 (Owner Read/Write Only).`;
        } else if (mode === "0777" || mode === "777") {
          file.permissions = "-rwxrwxrwx";
          output = `[!] WARNING: Changed permissions of ${targetName} to 0777 (World Writable!).`;
        } else {
          file.permissions = `-rwxr-xr-x`;
          output = `[+] Set permissions of ${targetName} to ${mode}.`;
        }
      }
      break;
    }

    case "submit-flag": {
      const candidate = (args[0] || "").trim();
      let matchedLevel: number | null = null;
      for (const [lvl, flag] of Object.entries(BANDIT_FLAGS)) {
        if (flag === candidate) {
          matchedLevel = parseInt(lvl, 10);
          break;
        }
      }

      if (matchedLevel !== null) {
        newCapturedFlags[matchedLevel] = candidate;
        capturedFlag = candidate;
        output = [
          `[✓] SUCCESS! Flag verified for LEVEL ${matchedLevel}:`,
          `    ${candidate}`,
          `[+] Unlocked achievements: Level ${matchedLevel} Cleared!`,
        ].join("\n");
      } else {
        output = `[✗] Access Denied: Invalid flag '${candidate}'. Check spelling or search deeper.`;
      }
      break;
    }

    default: {
      output = `bash: ${cmd}: command not found. Type 'help' for available commands.`;
      break;
    }
  }

  const newOutput = [...state.cliOutput, `$ ${cmdLine}`, output].filter(Boolean);

  return {
    newState: {
      ...state,
      files: newFiles,
      currentDir: newCurrentDir,
      cliHistory: newHistory,
      cliOutput: newOutput,
      capturedFlags: newCapturedFlags,
    },
    output,
    flagCaptured: capturedFlag,
  };
}

/**
 * Parameter Tampering on Intercepted Packet
 */
export function tamperTransitPacket(state: BanditState, newJsonBody: string): BanditState {
  if (!state.transitPacket) return state;

  return {
    ...state,
    tamperBuffer: newJsonBody,
    transitPacket: {
      ...state.transitPacket,
      body: newJsonBody,
      isTampered: true,
      status: "INTERCEPTED",
    },
  };
}

/**
 * Forward or Drop transit packet
 */
export function forwardTransitPacket(state: BanditState): {
  newState: BanditState;
  responseStatus: number;
  message: string;
} {
  if (!state.transitPacket) {
    return { newState: state, responseStatus: 400, message: "No packet in transit." };
  }

  const isTampered = state.transitPacket.isTampered;
  const hmacEnforced = state.defenseState.hmacActive;
  const now = new Date().toLocaleTimeString();

  let responseStatus: number;
  let message: string;
  const newLogs = [...state.securityLogs];

  if (isTampered && hmacEnforced) {
    responseStatus = 403;
    message = "403 Forbidden: HMAC signature mismatch! Tampered payload rejected by Blue Team Shield.";
    newLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      type: "BLOCKED",
      source: "HMAC_GUARD",
      message: `Blocked tampered packet ${state.transitPacket.id}. Signature verification failed.`,
    });
  } else if (isTampered && !hmacEnforced) {
    responseStatus = 200;
    message = "200 OK: Exploit successful! Unsigned payload accepted: order processed with tampered values!";
    newLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      type: "BREACH",
      source: "API_GATEWAY",
      message: `ALERT: Tampered packet ${state.transitPacket.id} was processed without cryptographic signature!`,
    });
  } else {
    responseStatus = 200;
    message = "200 OK: Valid packet forwarded and processed normally.";
    newLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: now,
      type: "INFO",
      source: "API_GATEWAY",
      message: `Packet ${state.transitPacket.id} forwarded successfully.`,
    });
  }

  const newState: BanditState = {
    ...state,
    securityLogs: newLogs.slice(0, 20),
    transitPacket: {
      ...state.transitPacket,
      status: "FORWARDED",
    },
  };

  return { newState, responseStatus, message };
}

/**
 * Drops packet from transit line
 */
export function dropTransitPacket(state: BanditState): BanditState {
  if (!state.transitPacket) return state;

  const now = new Date().toLocaleTimeString();
  const newLogs: SecurityLogEntry[] = [
    {
      id: `log-${Date.now()}`,
      timestamp: now,
      type: "ALERT",
      source: "WIRE_TAP",
      message: `Packet ${state.transitPacket.id} was dropped by operator.`,
    },
    ...state.securityLogs,
  ];

  return {
    ...state,
    securityLogs: newLogs.slice(0, 20),
    transitPacket: {
      ...state.transitPacket,
      status: "DROPPED",
    },
  };
}

/**
 * SQL Injection Evaluation
 */
export function executeSqlAuthQuery(state: BanditState, userInput: string): SqlInjectionResult {
  const isProtected = state.defenseState.sqlParametrized;
  const rawQuery = isProtected
    ? `SELECT id, username, role, token FROM users WHERE username = @username`
    : `SELECT id, username, role, token FROM users WHERE username = '${userInput}'`;

  // Check for classic SQL injection patterns
  const injectionPattern = /('\s*(OR|or)\s*('?1'?\s*=\s*'?1'|1\s*=\s*1|true|TRUE)|--|\/\*)/i;
  const hasInjection = injectionPattern.test(userInput);

  if (!isProtected && hasInjection) {
    return {
      success: true,
      queryExecuted: rawQuery,
      vulnerabilityExploited: true,
      returnedUsers: INITIAL_SQL_USERS,
      message: `[VULNERABLE] SQL syntax tree broken! Auth bypass succeeded: returned all ${INITIAL_SQL_USERS.length} user records!`,
    };
  }

  // Normal lookup
  const matched = INITIAL_SQL_USERS.filter((u) => u.username.toLowerCase() === userInput.toLowerCase());
  if (matched.length > 0) {
    return {
      success: true,
      queryExecuted: rawQuery,
      vulnerabilityExploited: false,
      returnedUsers: matched,
      message: `[SECURE] Found user '${matched[0].username}'. Parameterized execution prevented injection.`,
    };
  }

  return {
    success: false,
    queryExecuted: rawQuery,
    vulnerabilityExploited: false,
    returnedUsers: [],
    message: isProtected
      ? `[SECURE] 0 rows returned. Input safely treated as literal parameter string.`
      : `0 rows returned. No matching user.`,
  };
}

/**
 * Token Bucket Rate Limiter Simulation
 */
export function simulateRateLimitRequest(state: BanditState): {
  newState: BanditState;
  result: RateLimitResult;
} {
  const isRateLimitActive = state.defenseState.rateLimitActive;
  const now = Date.now();
  let tokens = state.rateLimiter.tokens;
  const maxTokens = state.rateLimiter.maxTokens;
  const lastRefill = state.rateLimiter.lastRefillTime;
  const blockedUntil = state.rateLimiter.blockedUntil;

  // Refill tokens: 1 token every 2000ms
  const elapsed = now - lastRefill;
  const refillCount = Math.floor(elapsed / 2000);
  if (refillCount > 0) {
    tokens = Math.min(maxTokens, tokens + refillCount);
  }

  if (!isRateLimitActive) {
    // Unlimited requests permitted
    return {
      newState: state,
      result: {
        allowed: true,
        remaining: 999,
        resetSeconds: 0,
        statusCode: 200,
        message: "200 OK: Request allowed (Rate limiter DISABLED - vulnerable to DDoS/Brute Force).",
      },
    };
  }

  if (now < blockedUntil) {
    const remainingSec = Math.ceil((blockedUntil - now) / 1000);
    return {
      newState: state,
      result: {
        allowed: false,
        remaining: 0,
        resetSeconds: remainingSec,
        statusCode: 429,
        message: `429 Too Many Requests: Rate limit exceeded! IP blocked. Retry-After: ${remainingSec}s`,
      },
    };
  }

  if (tokens > 0) {
    tokens -= 1;
    const newState: BanditState = {
      ...state,
      rateLimiter: {
        ...state.rateLimiter,
        tokens,
        lastRefillTime: now,
      },
    };
    return {
      newState,
      result: {
        allowed: true,
        remaining: tokens,
        resetSeconds: 2,
        statusCode: 200,
        message: `200 OK: Request allowed. Tokens remaining in bucket: ${tokens}/${maxTokens}.`,
      },
    };
  } else {
    // Depleted: block for 8 seconds
    const newBlockedUntil = now + 8000;
    const newState: BanditState = {
      ...state,
      rateLimiter: {
        ...state.rateLimiter,
        tokens: 0,
        blockedUntil: newBlockedUntil,
      },
      securityLogs: [
        {
          id: `log-${now}`,
          timestamp: new Date().toLocaleTimeString(),
          type: "BLOCKED",
          source: "RATE_LIMITER",
          message: "Token bucket exhausted (5/5 req). Triggered 429 Too Many Requests defense.",
        },
        ...state.securityLogs,
      ],
    };
    return {
      newState,
      result: {
        allowed: false,
        remaining: 0,
        resetSeconds: 8,
        statusCode: 429,
        message: "429 Too Many Requests: Token bucket exhausted! Brute-force burst neutralized.",
      },
    };
  }
}

/**
 * Toggle defense shields
 */
export function toggleBanditDefense(state: BanditState, key: keyof DefenseStatus): BanditState {
  const newDefense = {
    ...state.defenseState,
    [key]: !state.defenseState[key],
  };

  const now = new Date().toLocaleTimeString();
  const stateLabel = newDefense[key] ? "ACTIVATED" : "DEACTIVATED";
  const newLogs: SecurityLogEntry[] = [
    {
      id: `log-${Date.now()}`,
      timestamp: now,
      type: newDefense[key] ? "INFO" : "ALERT",
      source: "SOC_DEFENSE",
      message: `Shield '${key.toUpperCase()}' was ${stateLabel}.`,
    },
    ...state.securityLogs,
  ];

  return {
    ...state,
    defenseState: newDefense,
    securityLogs: newLogs.slice(0, 20),
  };
}

/**
 * Dual C# / Go Security Code Runner for Code Gym tasks
 */
export function executeBanditScript(
  script: string,
  language: "csharp" | "go",
  taskId: string
): { success: boolean; output: string; flagAwarded?: string } {
  const cleaned = script.trim();
  if (!cleaned) {
    return { success: false, output: "Error: Code buffer is empty." };
  }

  switch (taskId) {
    case "task-bandit-1-hidden-key": {
      // Must read from environment / vault rather than hardcoded password
      const hasEnvRead =
        (language === "csharp" && (cleaned.includes("Environment.GetEnvironmentVariable") || cleaned.includes("IConfiguration"))) ||
        (language === "go" && (cleaned.includes("os.Getenv") || cleaned.includes("os.LookupEnv")));

      const hasHardcodedSecret =
        cleaned.includes('"bandit{') || cleaned.includes("'bandit{") || cleaned.includes('"password123"');

      if (hasHardcodedSecret) {
        return {
          success: false,
          output: "Security Defect: Credentials are hardcoded in source code! Must load securely from environment variable or vault.",
        };
      }
      if (!hasEnvRead) {
        return {
          success: false,
          output: language === "csharp"
            ? "Incomplete: Must use Environment.GetEnvironmentVariable(\"API_SECRET\") to load credentials safely."
            : "Incomplete: Must use os.Getenv(\"API_SECRET\") to load credentials safely.",
        };
      }
      return {
        success: true,
        output: "Vault Configuration Passed: Secret successfully loaded from environment without hardcoded exposure.",
        flagAwarded: BANDIT_FLAGS[1],
      };
    }

    case "task-bandit-2-obfuscation": {
      // Must use cryptographically secure random generator
      const hasCsprng =
        (language === "csharp" && (cleaned.includes("RandomNumberGenerator") || cleaned.includes("RandomNumberGenerator.GetBytes"))) ||
        (language === "go" && (cleaned.includes("crypto/rand") || cleaned.includes("rand.Read")));

      const usesInsecureRandom =
        (language === "csharp" && cleaned.includes("new Random(")) ||
        (language === "go" && cleaned.includes("math/rand"));

      if (usesInsecureRandom) {
        return {
          success: false,
          output: "Critical Vulnerability: Pseudo-random generator (Random / math/rand) is predictable and vulnerable to seeding attacks! Use CSPRNG.",
        };
      }
      if (!hasCsprng) {
        return {
          success: false,
          output: language === "csharp"
            ? "Incomplete: Implement token generation with RandomNumberGenerator.GetBytes()."
            : "Incomplete: Implement token generation with crypto/rand Read().",
        };
      }
      return {
        success: true,
        output: "CSPRNG Cryptographic Token Generator Verified: Non-deterministic entropy secured.",
        flagAwarded: BANDIT_FLAGS[2],
      };
    }

    case "task-bandit-3-wire-tap": {
      // HMAC verification middleware
      const hasHmac =
        (language === "csharp" && (cleaned.includes("HMACSHA256") || cleaned.includes("ComputeHash"))) ||
        (language === "go" && (cleaned.includes("hmac.New") || cleaned.includes("sha256.New") || cleaned.includes("hmac.Equal")));

      if (!hasHmac) {
        return {
          success: false,
          output: language === "csharp"
            ? "Missing HMAC validation: Use HMACSHA256 with secret key to verify X-Signature header against request body."
            : "Missing HMAC validation: Use hmac.New(sha256.New, key) and hmac.Equal() to verify signature.",
        };
      }
      return {
        success: true,
        output: "HMAC Tamper-Proof Middleware Verified: Any modification in transit triggers 403 Signature Mismatch.",
        flagAwarded: BANDIT_FLAGS[3],
      };
    }

    case "task-bandit-4-sql-injection": {
      // Must use parameterized queries
      const isConcatenated =
        cleaned.includes("WHERE username = '\" +") ||
        cleaned.includes("WHERE username = '\"+") ||
        cleaned.includes("fmt.Sprintf(\"SELECT") ||
        cleaned.includes("fmt.Sprintf(\"WHERE");

      const hasParameters =
        (language === "csharp" && (cleaned.includes("Parameters.AddWithValue") || cleaned.includes("@username") || cleaned.includes("SqlParameter"))) ||
        (language === "go" && (cleaned.includes("$1") || cleaned.includes("?") || cleaned.includes("db.QueryRow(")));

      if (isConcatenated) {
        return {
          success: false,
          output: "High Vulnerability: SQL query constructed via string concatenation! Vulnerable to ' OR 1=1 --.",
        };
      }
      if (!hasParameters) {
        return {
          success: false,
          output: language === "csharp"
            ? "Incomplete: Use parameterized command with @username parameter."
            : "Incomplete: Use prepared statement placeholder ($1 or ?) with db.QueryRow().",
        };
      }
      return {
        success: true,
        output: "Prepared Statement Verified: Input is treated strictly as literal data, neutralizing SQL injection.",
        flagAwarded: BANDIT_FLAGS[4],
      };
    }

    case "task-bandit-5-rate-limiter": {
      // Rate limiting logic
      const hasRateLimiting =
        (language === "csharp" && (cleaned.includes("429") || cleaned.includes("TooManyRequests") || cleaned.includes("RateLimiter") || cleaned.includes("TokenBucket"))) ||
        (language === "go" && (cleaned.includes("StatusTooManyRequests") || cleaned.includes("429") || cleaned.includes("rate.NewLimiter") || cleaned.includes("time.After")));

      if (!hasRateLimiting) {
        return {
          success: false,
          output: "Missing Rate Limiter: Must enforce HTTP 429 Too Many Requests when token bucket threshold is exceeded.",
        };
      }
      return {
        success: true,
        output: "Rate Limiter Shield Active: Brute force bursts successfully throttled with 429 response.",
        flagAwarded: BANDIT_FLAGS[5],
      };
    }

    case "task-bandit-6-defense-in-depth": {
      // Fortified Gateway: auth, validation, rate limiting
      const hasCompletePipeline =
        cleaned.includes("Authentication") ||
        cleaned.includes("UseRateLimiter") ||
        cleaned.includes("RateLimit") ||
        cleaned.includes("Bearer") ||
        cleaned.includes("Authorization") ||
        cleaned.includes("Validate") ||
        cleaned.includes("401") ||
        cleaned.includes("429");

      if (!hasCompletePipeline) {
        return {
          success: false,
          output: "Pipeline Incomplete: Secure reverse proxy must compose Authentication (Bearer), Input Validation, and Rate Limiting.",
        };
      }
      return {
        success: true,
        output: "Defense in Depth Verified: Fortified multi-layer security architecture passed all simulated penetration tests.",
        flagAwarded: BANDIT_FLAGS[6],
      };
    }

    default:
      return { success: true, output: "Code compiled and validated successfully." };
  }
}
