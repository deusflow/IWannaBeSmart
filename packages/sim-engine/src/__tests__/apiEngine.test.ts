/**
 * @file packages/sim-engine/src/__tests__/apiEngine.test.ts
 * @description Vitest suite for Station 04: API Forge Execution Engine & Tasks 1-6
 */

import { describe, it, expect } from "vitest";
import {
  API_FORGE_TASKS,
  VirtualApiServer,
  executeApiScript,
  INITIAL_API_STATE,
} from "../index";

describe("Station 04: API Forge Engine & Tasks", () => {
  it("should contain all 6 progressive API tasks", () => {
    expect(API_FORGE_TASKS.length).toBeGreaterThanOrEqual(6);
  });

  describe("VirtualApiServer Core Routing & Status Codes", () => {
    it("should return 200 OK for /health check", () => {
      const server = new VirtualApiServer();
      const res = server.handleRequest({
        method: "GET",
        path: "/health",
        headers: {},
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toContain("UP");
      expect(server.getSnapshot().logs).toHaveLength(1);
    });

    it("should return 200 OK when device exists, and 404 when missing", () => {
      const server = new VirtualApiServer();
      const resFound = server.handleRequest({
        method: "GET",
        path: "/api/devices/tv-01",
        headers: {},
      });
      expect(resFound.statusCode).toBe(200);
      expect(resFound.body).toContain("Living Room TV");

      const resNotFound = server.handleRequest({
        method: "GET",
        path: "/api/devices/unknown-999",
        headers: {},
      });
      expect(resNotFound.statusCode).toBe(404);
      expect(resNotFound.body).toContain("not found");
    });

    it("should return 201 Created on valid order, and 400 on invalid payload", () => {
      const server = new VirtualApiServer();
      const validRes = server.handleRequest({
        method: "POST",
        path: "/api/orders",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: "Multimeter Pro", quantity: 3 }),
      });
      expect(validRes.statusCode).toBe(201);
      expect(server.getSnapshot().orders).toHaveLength(1);

      const invalidRes = server.handleRequest({
        method: "POST",
        path: "/api/orders",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: "", quantity: 0 }),
      });
      expect(invalidRes.statusCode).toBe(400);
      expect(invalidRes.body).toContain("Validation failed");
    });

    it("should return 401 Unauthorized when Bearer token is missing", () => {
      const server = new VirtualApiServer();
      const resUnauth = server.handleRequest({
        method: "GET",
        path: "/api/secure/stats",
        headers: {},
      });
      expect(resUnauth.statusCode).toBe(401);

      const resAuth = server.handleRequest({
        method: "GET",
        path: "/api/secure/stats",
        headers: { Authorization: "Bearer forge-token-secure-99" },
      });
      expect(resAuth.statusCode).toBe(200);
      expect(resAuth.body).toContain("HEALTHY");
    });

    it("should return 504 Gateway Timeout when network cable is broken", () => {
      const server = new VirtualApiServer();
      server.setCableBroken(true);
      const res = server.handleRequest({
        method: "GET",
        path: "/health",
        headers: {},
      });
      expect(res.statusCode).toBe(504);
      expect(res.body).toContain("cable break");
    });
  });

  describe("Task 1: Heartbeat Endpoint", () => {
    const task = API_FORGE_TASKS[0];

    it("should validate C# MapGet /health endpoint", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.lastResponse?.statusCode).toBe(200);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go HandleFunc /health endpoint", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.lastResponse?.statusCode).toBe(200);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 2: Path Parameters & 404 Guard", () => {
    const task = API_FORGE_TASKS[1];

    it("should validate C# MapGet with path parameter and NotFound guard", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go HandleFunc with path extraction and StatusNotFound", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 3: Payload Validation & 201 Created", () => {
    const task = API_FORGE_TASKS[2];

    it("should validate C# MapPost with DTO validation and Results.Created", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go HandleFunc with JSON decode and StatusCreated", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 4: Bearer Token Authorization", () => {
    const task = API_FORGE_TASKS[3];

    it("should validate C# Bearer token verification and 401 guard", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go Authorization header inspection and StatusUnauthorized", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 5: Client Consumer Implementation", () => {
    const task = API_FORGE_TASKS[4];

    it("should validate C# HttpClient consumer", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.clientSuccess).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go http.Get consumer", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.clientSuccess).toBe(true);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Task 6: Resiliency & Timeout Retries", () => {
    const task = API_FORGE_TASKS[5];

    it("should validate C# retry loop with Task.Delay", () => {
      const res = executeApiScript(task.targetCode.csharp, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.retryCount).toBe(3);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.csharp).passed).toBe(true);
    });

    it("should validate Go retry loop with time.Sleep", () => {
      const res = executeApiScript(task.targetCode.go, task.initialState);
      expect(res.success).toBe(true);
      expect(res.newState.retryCount).toBe(3);
      expect(task.validate(task.initialState, res.newState, res, task.targetCode.go).passed).toBe(true);
    });
  });

  describe("Fault Injection & Broken Cable Handling", () => {
    it("should reject script execution when cable is broken", () => {
      const brokenState = {
        ...INITIAL_API_STATE,
        isCableBroken: true,
      };
      const res = executeApiScript(API_FORGE_TASKS[0].targetCode.csharp, brokenState);
      expect(res.success).toBe(false);
      expect(res.error).toContain("504 Gateway Timeout");
      expect(res.lastResponse?.statusCode).toBe(504);
    });
  });
});
