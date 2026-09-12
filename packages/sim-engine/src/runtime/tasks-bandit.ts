/**
 * @file packages/sim-engine/src/runtime/tasks-bandit.ts
 * @description Educational curriculum tasks for Station 06: Cyber Bandit Lab (C# & Go)
 */

import {
  type BanditState,
  createInitialBanditState,
  BANDIT_FLAGS,
} from "./banditContext";

export interface BanditTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  successKey: string;
  flag: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: BanditState;
  validate: (
    before: BanditState,
    after: BanditState,
    result: { success: boolean; output: string },
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const BANDIT_TASKS: BanditTask[] = [
  // ── Task 1: The Hidden Key (UNIX Recon & Safe Config) ─────────────
  {
    id: "task-bandit-1-hidden-key",
    order: 1,
    titleKey: "bandit.tasks.task1.title",
    conceptKey: "bandit.tasks.task1.concept",
    descKey: "bandit.tasks.task1.desc",
    hintKey: "bandit.tasks.task1.hint",
    successKey: "bandit.tasks.task1.success",
    flag: BANDIT_FLAGS[1],
    targetCode: {
      csharp: `// C# Secure Credential Loading from Environment
using System;

public class ConfigLoader
{
    public static string GetApiSecret()
    {
        // Load secret from environment variable instead of hardcoding
        string? secret = Environment.GetEnvironmentVariable("API_SECRET");
        if (string.IsNullOrEmpty(secret))
        {
            throw new InvalidOperationException("Missing API_SECRET in environment!");
        }
        return secret;
    }
}`,
      go: `// Go Secure Credential Loading from Environment
package main

import (
    "errors"
    "os"
)

func GetApiSecret() (string, error) {
    secret := os.Getenv("API_SECRET")
    if secret == "" {
        return "", errors.New("missing API_SECRET in environment")
    }
    return secret, nil
}`,
    },
    clozeTemplate: {
      csharp: `// C# Secure Credential Loading from Environment
using System;

public class ConfigLoader
{
    public static string GetApiSecret()
    {
        // TODO: Read API_SECRET from environment
        string? secret = /* [[Environment.GetEnvironmentVariable("API_SECRET")]] */;
        if (string.IsNullOrEmpty(secret))
        {
            throw new InvalidOperationException("Missing secret!");
        }
        return secret;
    }
}`,
      go: `// Go Secure Credential Loading from Environment
package main

import (
    "errors"
    "os"
)

func GetApiSecret() (string, error) {
    // TODO: Read API_SECRET from environment
    secret := /* [[os.Getenv("API_SECRET")]] */
    if secret == "" {
        return "", errors.New("missing secret")
    }
    return secret, nil
}`,
    },
    initialState: createInitialBanditState(1),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task1.success" : undefined,
      };
    },
  },

  // ── Task 2: Obfuscation vs Cryptography (CSPRNG Token Generator) ──
  {
    id: "task-bandit-2-obfuscation",
    order: 2,
    titleKey: "bandit.tasks.task2.title",
    conceptKey: "bandit.tasks.task2.concept",
    descKey: "bandit.tasks.task2.desc",
    hintKey: "bandit.tasks.task2.hint",
    successKey: "bandit.tasks.task2.success",
    flag: BANDIT_FLAGS[2],
    targetCode: {
      csharp: `// C# Cryptographically Secure Pseudorandom Number Generator (CSPRNG)
using System;
using System.Security.Cryptography;

public class SecureTokenService
{
    public static string GenerateSecureToken(int byteLength = 32)
    {
        byte[] buffer = new byte[byteLength];
        RandomNumberGenerator.Fill(buffer);
        return Convert.ToBase64String(buffer);
    }
}`,
      go: `// Go Cryptographically Secure Random Token (crypto/rand)
package main

import (
    "crypto/rand"
    "encoding/base64"
)

func GenerateSecureToken(length int) (string, error) {
    bytes := make([]byte, length)
    if _, err := rand.Read(bytes); err != nil {
        return "", err
    }
    return base64.StdEncoding.EncodeToString(bytes), nil
}`,
    },
    clozeTemplate: {
      csharp: `// C# Secure Token Service
using System;
using System.Security.Cryptography;

public class SecureTokenService
{
    public static string GenerateSecureToken(int byteLength = 32)
    {
        byte[] buffer = new byte[byteLength];
        /* [[RandomNumberGenerator.Fill(buffer)]] */;
        return Convert.ToBase64String(buffer);
    }
}`,
      go: `// Go Secure Token Service
package main

import (
    "crypto/rand"
    "encoding/base64"
)

func GenerateSecureToken(length int) (string, error) {
    bytes := make([]byte, length)
    /* [[_, err := rand.Read(bytes)]] */
    if err != nil {
        return "", err
    }
    return base64.StdEncoding.EncodeToString(bytes), nil
}`,
    },
    initialState: createInitialBanditState(2),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task2.success" : undefined,
      };
    },
  },

  // ── Task 3: The Wire Tap (HMAC-SHA256 Signature Verification) ─────
  {
    id: "task-bandit-3-wire-tap",
    order: 3,
    titleKey: "bandit.tasks.task3.title",
    conceptKey: "bandit.tasks.task3.concept",
    descKey: "bandit.tasks.task3.desc",
    hintKey: "bandit.tasks.task3.hint",
    successKey: "bandit.tasks.task3.success",
    flag: BANDIT_FLAGS[3],
    targetCode: {
      csharp: `// C# HMAC-SHA256 Integrity Verification Middleware
using System;
using System.Security.Cryptography;
using System.Text;

public class HmacValidator
{
    public static bool VerifySignature(string secretKey, string payload, string expectedSignature)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secretKey));
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        string computedSignature = Convert.ToHexString(hash).ToLower();
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computedSignature),
            Encoding.UTF8.GetBytes(expectedSignature.ToLower())
        );
    }
}`,
      go: `// Go HMAC-SHA256 Integrity Verification Middleware
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
)

func VerifySignature(secretKey string, payload string, expectedSignature string) bool {
    mac := hmac.New(sha256.New, []byte(secretKey))
    mac.Write([]byte(payload))
    expectedBytes, err := hex.DecodeString(expectedSignature)
    if err != nil {
        return false
    }
    return hmac.Equal(mac.Sum(nil), expectedBytes)
}`,
    },
    clozeTemplate: {
      csharp: `// C# HMAC-SHA256 Integrity Verification
using System;
using System.Security.Cryptography;
using System.Text;

public class HmacValidator
{
    public static bool VerifySignature(string secretKey, string payload, string expectedSignature)
    {
        using var hmac = /* [[new HMACSHA256(Encoding.UTF8.GetBytes(secretKey))]] */;
        byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLower() == expectedSignature.ToLower();
    }
}`,
      go: `// Go HMAC-SHA256 Integrity Verification
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
)

func VerifySignature(secretKey string, payload string, expectedSignature string) bool {
    mac := /* [[hmac.New(sha256.New, []byte(secretKey))]] */
    mac.Write([]byte(payload))
    expectedBytes, _ := hex.DecodeString(expectedSignature)
    return hmac.Equal(mac.Sum(nil), expectedBytes)
}`,
    },
    initialState: createInitialBanditState(3),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task3.success" : undefined,
      };
    },
  },

  // ── Task 4: The Injection (SQL Injection & Prepared Statements) ───
  {
    id: "task-bandit-4-sql-injection",
    order: 4,
    titleKey: "bandit.tasks.task4.title",
    conceptKey: "bandit.tasks.task4.concept",
    descKey: "bandit.tasks.task4.desc",
    hintKey: "bandit.tasks.task4.hint",
    successKey: "bandit.tasks.task4.success",
    flag: BANDIT_FLAGS[4],
    targetCode: {
      csharp: `// C# ADO.NET Parameterized Query (SQL Injection Immune)
using System.Data.SqlClient;

public class UserRepository
{
    public static SqlCommand CreateUserQuery(SqlConnection conn, string userInput)
    {
        // Use parameterized query with @username rather than string concatenation
        var cmd = new SqlCommand("SELECT id, username, role FROM users WHERE username = @username", conn);
        cmd.Parameters.AddWithValue("@username", userInput);
        return cmd;
    }
}`,
      go: `// Go database/sql Prepared Statement (SQL Injection Immune)
package main

import (
    "database/sql"
)

type User struct {
    ID       int
    Username string
    Role     string
}

func FindUserByUsername(db *sql.DB, userInput string) (*User, error) {
    // Safe parameterized placeholder ($1)
    row := db.QueryRow("SELECT id, username, role FROM users WHERE username = $1", userInput)
    var u User
    if err := row.Scan(&u.ID, &u.Username, &u.Role); err != nil {
        return nil, err
    }
    return &u, nil
}`,
    },
    clozeTemplate: {
      csharp: `// C# Parameterized Query
using System.Data.SqlClient;

public class UserRepository
{
    public static SqlCommand CreateUserQuery(SqlConnection conn, string userInput)
    {
        var cmd = new SqlCommand("SELECT id, username, role FROM users WHERE username = @username", conn);
        /* [[cmd.Parameters.AddWithValue("@username", userInput)]] */;
        return cmd;
    }
}`,
      go: `// Go Prepared Statement
package main

import "database/sql"

func QueryUser(db *sql.DB, userInput string) *sql.Row {
    // Parameterized placeholder
    return /* [[db.QueryRow("SELECT id, username, role FROM users WHERE username = $1", userInput)]] */
}`,
    },
    initialState: createInitialBanditState(4),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task4.success" : undefined,
      };
    },
  },

  // ── Task 5: The Shield (Rate Limiting & 429 Too Many Requests) ─────
  {
    id: "task-bandit-5-rate-limiter",
    order: 5,
    titleKey: "bandit.tasks.task5.title",
    conceptKey: "bandit.tasks.task5.concept",
    descKey: "bandit.tasks.task5.desc",
    hintKey: "bandit.tasks.task5.hint",
    successKey: "bandit.tasks.task5.success",
    flag: BANDIT_FLAGS[5],
    targetCode: {
      csharp: `// C# Token Bucket Rate Limiting Middleware
using Microsoft.AspNetCore.Http;
using System.Threading.RateLimiting;
using System.Threading.Tasks;

public class RateLimiterMiddleware
{
    private readonly RequestDelegate _next;
    private readonly PartitionedRateLimiter<HttpContext> _limiter;

    public RateLimiterMiddleware(RequestDelegate next, PartitionedRateLimiter<HttpContext> limiter)
    {
        _next = next;
        _limiter = limiter;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        using var lease = _limiter.AttemptAcquire(context);
        if (!lease.IsAcquired)
        {
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            await context.Response.WriteAsync("429 Too Many Requests: Rate limit exceeded!");
            return;
        }
        await _next(context);
    }
}`,
      go: `// Go Token Bucket Rate Limiting Middleware
package main

import (
    "net/http"
    "golang.org/x/time/rate"
)

func RateLimitMiddleware(limiter *rate.Limiter, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            w.Header().Set("Retry-After", "10")
            http.Error(w, "429 Too Many Requests: Rate limit exceeded!", http.StatusTooManyRequests)
            return
        }
        next(w, r)
    }
}`,
    },
    clozeTemplate: {
      csharp: `// C# Rate Limiting Middleware
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

public class RateLimiterMiddleware
{
    public async Task InvokeAsync(HttpContext context, bool isAllowed)
    {
        if (!isAllowed)
        {
            /* [[context.Response.StatusCode = StatusCodes.Status429TooManyRequests]] */;
            return;
        }
    }
}`,
      go: `// Go Rate Limiting Middleware
package main

import "net/http"

func CheckLimit(w http.ResponseWriter, allowed bool) {
    if !allowed {
        /* [[http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)]] */
        return
    }
}`,
    },
    initialState: createInitialBanditState(5),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task5.success" : undefined,
      };
    },
  },

  // ── Task 6: Fortified Gateway (Defense in Depth Architecture) ──────
  {
    id: "task-bandit-6-defense-in-depth",
    order: 6,
    titleKey: "bandit.tasks.task6.title",
    conceptKey: "bandit.tasks.task6.concept",
    descKey: "bandit.tasks.task6.desc",
    hintKey: "bandit.tasks.task6.hint",
    successKey: "bandit.tasks.task6.success",
    flag: BANDIT_FLAGS[6],
    targetCode: {
      csharp: `// C# Fortified API Gateway Pipeline (Defense in Depth)
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

public static class SecureGatewayPipeline
{
    public static void ConfigureSecurity(IApplicationBuilder app)
    {
        // 1. Enforce TLS / HTTPS Redirection
        app.UseHttpsRedirection();

        // 2. Token Bucket Rate Limiting (Defense against Brute Force / DDoS)
        app.UseRateLimiter();

        // 3. Bearer Token Authentication & Role Authorization
        app.UseAuthentication();
        app.UseAuthorization();

        // 4. Request DTO Validation & HMAC Signature Guard
        app.Use(async (context, next) =>
        {
            if (!context.Request.Headers.ContainsKey("Authorization"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }
            await next();
        });
    }
}`,
      go: `// Go Fortified API Gateway Pipeline (Defense in Depth)
package main

import "net/http"

func SecurePipeline(handler http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. Enforce HTTPS
        if r.Header.Get("X-Forwarded-Proto") == "http" {
            http.Error(w, "403 Forbidden: HTTPS required", http.StatusForbidden)
            return
        }

        // 2. Authenticate Bearer Token
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" || len(authHeader) < 7 || authHeader[:7] != "Bearer " {
            http.Error(w, "401 Unauthorized: Valid Bearer token required", http.StatusUnauthorized)
            return
        }

        // 3. Forward to protected upstream handler
        handler.ServeHTTP(w, r)
    })
}`,
    },
    clozeTemplate: {
      csharp: `// C# Secure Gateway Pipeline
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

public static class SecureGatewayPipeline
{
    public static void ConfigureSecurity(IApplicationBuilder app)
    {
        app.UseHttpsRedirection();
        /* [[app.UseRateLimiter()]] */;
        app.UseAuthentication();
        app.UseAuthorization();
    }
}`,
      go: `// Go Secure Gateway Pipeline
package main

import "net/http"

func GuardAuth(w http.ResponseWriter, r *http.Request) bool {
    auth := r.Header.Get("Authorization")
    if auth == "" || auth[:7] != "Bearer " {
        /* [[http.Error(w, "Unauthorized", http.StatusUnauthorized)]] */
        return false
    }
    return true
}`,
    },
    initialState: createInitialBanditState(6),
    validate: (_before, _after, result) => {
      return {
        passed: result.success,
        messageKey: result.success ? "bandit.tasks.task6.success" : undefined,
      };
    },
  },
];
