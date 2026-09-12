/**
 * @file packages/sim-engine/src/__tests__/banditEngine.test.ts
 * @description Comprehensive unit tests for Station 06: Cyber Bandit Lab engine
 */

import { describe, it, expect } from "vitest";
import {
  createInitialBanditState,
  executeBanditCommand,
  tamperTransitPacket,
  forwardTransitPacket,
  dropTransitPacket,
  executeSqlAuthQuery,
  simulateRateLimitRequest,
  toggleBanditDefense,
  executeBanditScript,
  BANDIT_FLAGS,
} from "../runtime/banditContext";

describe("Cyber Bandit Lab Engine (Station 06)", () => {
  describe("Virtual UNIX Terminal & Filesystem", () => {
    it("should initialize state with default directories and readme", () => {
      const state = createInitialBanditState(1);
      expect(state.level).toBe(1);
      expect(state.currentDir).toBe("/home/bandit");
      expect(state.files["/home/bandit/readme.txt"]).toBeDefined();
      expect(state.files["/home/bandit/.secret_pass"]).toBeDefined();
    });

    it("should execute 'ls' and respect hidden dotfiles with -la flag", () => {
      const state = createInitialBanditState(1);
      const resNormal = executeBanditCommand(state, "ls");
      expect(resNormal.output).toContain("readme.txt");
      expect(resNormal.output).not.toContain(".secret_pass");

      const resAll = executeBanditCommand(state, "ls -la");
      expect(resAll.output).toContain("readme.txt");
      expect(resAll.output).toContain(".secret_pass");
      expect(resAll.output).toContain("-rw-------");
    });

    it("should read files using 'cat' and report errors for non-existent files", () => {
      const state = createInitialBanditState(1);
      const res = executeBanditCommand(state, "cat .secret_pass");
      expect(res.output).toBe(BANDIT_FLAGS[1]);

      const resMissing = executeBanditCommand(state, "cat nonexistent.txt");
      expect(resMissing.output).toContain("No such file or directory");
    });

    it("should search strings using 'grep'", () => {
      const state = createInitialBanditState(1);
      const res = executeBanditCommand(state, "grep API_SECRET .env");
      expect(res.output).toContain("API_SECRET=vault_secret_key_8841");
    });

    it("should decode Base64 data with 'base64 -d'", () => {
      const state = createInitialBanditState(2);
      const res = executeBanditCommand(state, "base64 -d data.b64");
      expect(res.output).toBe(BANDIT_FLAGS[2]);
    });

    it("should update file permissions with 'chmod'", () => {
      const state = createInitialBanditState(1);
      const res = executeBanditCommand(state, "chmod 0777 .secret_pass");
      expect(res.output).toContain("World Writable");
      expect(res.newState.files["/home/bandit/.secret_pass"].permissions).toBe("-rwxrwxrwx");

      const resSecure = executeBanditCommand(res.newState, "chmod 0600 .secret_pass");
      expect(resSecure.output).toContain("Owner Read/Write Only");
      expect(resSecure.newState.files["/home/bandit/.secret_pass"].permissions).toBe("-rw-------");
    });

    it("should verify valid flag submissions and reject invalid ones", () => {
      const state = createInitialBanditState(1);
      const resInvalid = executeBanditCommand(state, "submit-flag bandit{wrong_guess}");
      expect(resInvalid.output).toContain("Access Denied");
      expect(resInvalid.flagCaptured).toBeUndefined();

      const resValid = executeBanditCommand(state, `submit-flag ${BANDIT_FLAGS[1]}`);
      expect(resValid.output).toContain("SUCCESS! Flag verified for LEVEL 1");
      expect(resValid.flagCaptured).toBe(BANDIT_FLAGS[1]);
      expect(resValid.newState.capturedFlags[1]).toBe(BANDIT_FLAGS[1]);
    });
  });

  describe("Packet Interception & Parameter Tampering (Wire Tap)", () => {
    it("should tamper transit packet payload", () => {
      const state = createInitialBanditState(3);
      expect(state.transitPacket).not.toBeNull();

      const tampered = JSON.stringify({ price: 1, role: "admin" });
      const nextState = tamperTransitPacket(state, tampered);
      expect(nextState.transitPacket?.isTampered).toBe(true);
      expect(nextState.transitPacket?.body).toBe(tampered);
    });

    it("should accept tampered packet if HMAC defense is disabled (breach)", () => {
      const state = createInitialBanditState(3);
      state.defenseState.hmacActive = false;
      const tamperedState = tamperTransitPacket(state, JSON.stringify({ price: 1 }));
      const result = forwardTransitPacket(tamperedState);
      expect(result.responseStatus).toBe(200);
      expect(result.message).toContain("Exploit successful");
      expect(result.newState.securityLogs[0].type).toBe("BREACH");
    });

    it("should reject tampered packet with 403 when HMAC defense is active", () => {
      const state = createInitialBanditState(3);
      state.defenseState.hmacActive = true;
      const tamperedState = tamperTransitPacket(state, JSON.stringify({ price: 1 }));
      const result = forwardTransitPacket(tamperedState);
      expect(result.responseStatus).toBe(403);
      expect(result.message).toContain("HMAC signature mismatch");
      expect(result.newState.securityLogs[0].type).toBe("BLOCKED");
    });

    it("should drop transit packets correctly", () => {
      const state = createInitialBanditState(3);
      const nextState = dropTransitPacket(state);
      expect(nextState.transitPacket?.status).toBe("DROPPED");
      expect(nextState.securityLogs[0].message).toContain("dropped by operator");
    });
  });

  describe("SQL Injection Simulation", () => {
    it("should succeed with classic ' OR 1=1 -- exploit when unparameterized", () => {
      const state = createInitialBanditState(4);
      state.defenseState.sqlParametrized = false;

      const result = executeSqlAuthQuery(state, "' OR 1=1 --");
      expect(result.vulnerabilityExploited).toBe(true);
      expect(result.returnedUsers.length).toBeGreaterThan(1);
      expect(result.message).toContain("Auth bypass succeeded");
    });

    it("should neutralize SQL injection when parameterized defense is active", () => {
      const state = createInitialBanditState(4);
      state.defenseState.sqlParametrized = true;

      const result = executeSqlAuthQuery(state, "' OR 1=1 --");
      expect(result.vulnerabilityExploited).toBe(false);
      expect(result.returnedUsers.length).toBe(0);
      expect(result.message).toContain("Input safely treated as literal parameter string");
    });

    it("should return legitimate user on exact username match", () => {
      const state = createInitialBanditState(4);
      state.defenseState.sqlParametrized = true;

      const result = executeSqlAuthQuery(state, "admin");
      expect(result.returnedUsers.length).toBe(1);
      expect(result.returnedUsers[0].username).toBe("admin");
    });
  });

  describe("Token Bucket Rate Limiter Simulation", () => {
    it("should allow requests up to token bucket capacity and throttle with 429 on exhaustion", () => {
      let state = createInitialBanditState(5);
      state.defenseState.rateLimitActive = true;

      // 5 allowed requests
      for (let i = 0; i < 5; i++) {
        const { newState, result } = simulateRateLimitRequest(state);
        expect(result.allowed).toBe(true);
        expect(result.statusCode).toBe(200);
        state = newState;
      }

      // 6th request triggers 429 Too Many Requests
      const { result: throttledResult } = simulateRateLimitRequest(state);
      expect(throttledResult.allowed).toBe(false);
      expect(throttledResult.statusCode).toBe(429);
      expect(throttledResult.message).toContain("429 Too Many Requests");
      expect(throttledResult.resetSeconds).toBeGreaterThan(0);
    });

    it("should toggle defense flags smoothly", () => {
      const state = createInitialBanditState(1);
      expect(state.defenseState.tlsEnabled).toBe(false);
      const toggled = toggleBanditDefense(state, "tlsEnabled");
      expect(toggled.defenseState.tlsEnabled).toBe(true);
      expect(toggled.securityLogs[0].message).toContain("ACTIVATED");
    });
  });

  describe("Code Gym Script Runner (Dual C# & Go)", () => {
    it("Task 1: should reject hardcoded secrets and validate environment loading", () => {
      const badCode = `string secret = "bandit{hardcoded}";`;
      const resBad = executeBanditScript(badCode, "csharp", "task-bandit-1-hidden-key");
      expect(resBad.success).toBe(false);
      expect(resBad.output).toContain("Credentials are hardcoded");

      const goodCs = `string secret = Environment.GetEnvironmentVariable("API_SECRET");`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-1-hidden-key");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[1]);

      const goodGo = `secret := os.Getenv("API_SECRET")`;
      const resGo = executeBanditScript(goodGo, "go", "task-bandit-1-hidden-key");
      expect(resGo.success).toBe(true);
    });

    it("Task 2: should reject math/rand and validate CSPRNG", () => {
      const badCs = `var rnd = new Random();`;
      const resBad = executeBanditScript(badCs, "csharp", "task-bandit-2-obfuscation");
      expect(resBad.success).toBe(false);

      const goodCs = `RandomNumberGenerator.Fill(buffer);`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-2-obfuscation");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[2]);

      const goodGo = `rand.Read(bytes)`;
      const resGo = executeBanditScript(goodGo, "go", "task-bandit-2-obfuscation");
      expect(resGo.success).toBe(true);
    });

    it("Task 3: should validate HMAC signature verification", () => {
      const goodCs = `using var hmac = new HMACSHA256(key); hmac.ComputeHash(bytes);`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-3-wire-tap");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[3]);

      const goodGo = `mac := hmac.New(sha256.New, key); hmac.Equal(a, b)`;
      const resGo = executeBanditScript(goodGo, "go", "task-bandit-3-wire-tap");
      expect(resGo.success).toBe(true);
    });

    it("Task 4: should reject string concatenation and enforce parameters in SQL", () => {
      const badCs = `var query = "WHERE username = '" + input + "'";`;
      const resBad = executeBanditScript(badCs, "csharp", "task-bandit-4-sql-injection");
      expect(resBad.success).toBe(false);

      const goodCs = `cmd.Parameters.AddWithValue("@username", userInput);`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-4-sql-injection");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[4]);

      const goodGo = `db.QueryRow("SELECT id FROM users WHERE username = $1", userInput)`;
      const resGo = executeBanditScript(goodGo, "go", "task-bandit-4-sql-injection");
      expect(resGo.success).toBe(true);
    });

    it("Task 5: should enforce 429 Too Many Requests in Rate Limiter", () => {
      const goodCs = `context.Response.StatusCode = StatusCodes.Status429TooManyRequests;`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-5-rate-limiter");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[5]);

      const goodGo = `http.Error(w, "limit", http.StatusTooManyRequests)`;
      const resGo = executeBanditScript(goodGo, "go", "task-bandit-5-rate-limiter");
      expect(resGo.success).toBe(true);
    });

    it("Task 6: should validate Defense in Depth pipeline composition", () => {
      const goodCs = `app.UseHttpsRedirection(); app.UseRateLimiter(); app.UseAuthentication();`;
      const resCs = executeBanditScript(goodCs, "csharp", "task-bandit-6-defense-in-depth");
      expect(resCs.success).toBe(true);
      expect(resCs.flagAwarded).toBe(BANDIT_FLAGS[6]);
    });
  });
});
