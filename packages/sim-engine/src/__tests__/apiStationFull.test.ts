/**
 * @file packages/sim-engine/src/__tests__/apiStationFull.test.ts
 * @description Comprehensive automated test suite for Station 04: API Forge
 * Validates dual-language compilation (C# Minimal APIs & Go net/http),
 * fault injection (504 Gateway Timeout), route contracts, and Code Gym validation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  API_FORGE_TASKS,
  INITIAL_API_STATE,
  VirtualApiServer,
  executeApiScript,
  type VirtualApiState,
} from "../runtime";

describe("Station 04: API Forge Full Verification Suite", () => {
  let state: VirtualApiState;
  let server: VirtualApiServer;

  beforeEach(() => {
    state = JSON.parse(JSON.stringify(INITIAL_API_STATE));
    server = new VirtualApiServer(state);
  });

  describe("VirtualApiServer Route Contracts & Fault Injection", () => {
    it("should handle GET /health probe returning status 200 and UP payload", () => {
      const res = server.handleRequest({ method: "GET", path: "/health" });
      expect(res.statusCode).toBe(200);
      expect(res.statusText).toBe("OK");
      const body = JSON.parse(res.body);
      expect(body.status).toBe("UP");
      expect(body.service).toBe("api-forge");
    });

    it("should handle GET /api/devices/{id} with 200 for existing and 404 for missing", () => {
      const found42 = server.handleRequest({ method: "GET", path: "/api/devices/42" });
      expect(found42.statusCode).toBe(200);

      const foundTv = server.handleRequest({ method: "GET", path: "/api/devices/tv-01" });
      expect(foundTv.statusCode).toBe(200);

      const missing = server.handleRequest({ method: "GET", path: "/api/devices/nonexistent" });
      expect(missing.statusCode).toBe(404);
      expect(JSON.parse(missing.body).error).toContain("not found");
    });

    it("should handle POST /api/orders with 201 Created for valid and 400 for invalid", () => {
      const validRes = server.handleRequest({
        method: "POST",
        path: "/api/orders",
        body: JSON.stringify({ item: "LaserSensor", quantity: 5 }),
      });
      expect(validRes.statusCode).toBe(201);
      expect(validRes.headers["Location"]).toContain("/api/orders/");
      const order = JSON.parse(validRes.body);
      expect(order.item).toBe("LaserSensor");
      expect(order.quantity).toBe(5);

      const invalidRes = server.handleRequest({
        method: "POST",
        path: "/api/orders",
        body: JSON.stringify({ item: "", quantity: 0 }),
      });
      expect(invalidRes.statusCode).toBe(400);
      expect(JSON.parse(invalidRes.body).error).toContain("Validation failed");
    });

    it("should handle GET /api/secure/stats with 401 Unauthorized unless valid Bearer token", () => {
      const noAuth = server.handleRequest({ method: "GET", path: "/api/secure/stats" });
      expect(noAuth.statusCode).toBe(401);

      const wrongToken = server.handleRequest({
        method: "GET",
        path: "/api/secure/stats",
        headers: { Authorization: "Bearer bad-token" },
      });
      expect(wrongToken.statusCode).toBe(401);

      const validAuth = server.handleRequest({
        method: "GET",
        path: "/api/secure/stats",
        headers: { Authorization: "Bearer forge-token-secure-99" },
      });
      expect(validAuth.statusCode).toBe(200);
      expect(JSON.parse(validAuth.body).gatewayStatus).toBe("HEALTHY");
    });

    it("should return 504 Gateway Timeout when network cable is broken", () => {
      server.setCableBroken(true);
      const res = server.handleRequest({ method: "GET", path: "/health" });
      expect(res.statusCode).toBe(504);
      expect(res.statusText).toBe("Gateway Timeout");
      expect(JSON.parse(res.body).error).toContain("cable break");

      server.setCableBroken(false);
      const recovered = server.handleRequest({ method: "GET", path: "/health" });
      expect(recovered.statusCode).toBe(200);
    });

    it("should maintain immutable rolling access logs with status and duration", () => {
      server.handleRequest({ method: "GET", path: "/health" });
      server.handleRequest({ method: "GET", path: "/api/devices/42" });
      const snap = server.getSnapshot();
      expect(snap.logs.length).toBeGreaterThanOrEqual(2);
      expect(snap.logs[0].path).toBe("/api/devices/42");
      expect(snap.logs[0].statusCode).toBe(200);
    });
  });

  describe("API Forge Curriculum Code Gym Validation (C# and Go)", () => {
    API_FORGE_TASKS.forEach((task) => {
      it(`should pass Task ${task.order} [${task.id}] in C# target code`, () => {
        const csharpCode = task.targetCode.csharp;
        const res = executeApiScript(csharpCode, task.initialState);
        expect(res.success).toBe(true);

        const val = task.validate(task.initialState, res.newState, res, csharpCode);
        expect(val.passed).toBe(true);
      });

      it(`should pass Task ${task.order} [${task.id}] in Go target code`, () => {
        const goCode = task.targetCode.go;
        const res = executeApiScript(goCode, task.initialState);
        expect(res.success).toBe(true);

        const val = task.validate(task.initialState, res.newState, res, goCode);
        expect(val.passed).toBe(true);
      });

      it(`should reject Task ${task.order} [${task.id}] with arbitrary incomplete code`, () => {
        const brokenCode = "// Incomplete todo implementation";
        const res = executeApiScript(brokenCode, task.initialState);
        const val = task.validate(task.initialState, res.newState, res, brokenCode);
        expect(val.passed).toBe(false);
      });
    });
  });
});
