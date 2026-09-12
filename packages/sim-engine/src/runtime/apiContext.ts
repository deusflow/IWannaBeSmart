/**
 * @file packages/sim-engine/src/runtime/apiContext.ts
 * @description Virtual API Server & Client execution environment with HTTP bus simulation, status codes, and fault injection
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  headers: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
}

export interface HttpResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
  latencyMs: number;
}

export interface ApiRoute {
  id: string;
  method: HttpMethod;
  path: string;
  summary: string;
  handlerDescription?: string;
}

export interface ApiServerLogEntry {
  timestamp: string;
  method: HttpMethod;
  path: string;
  statusCode: number;
  durationMs: number;
  message: string;
  level: "info" | "warn" | "error" | "security";
}

export interface VirtualApiDevice {
  id: string;
  name: string;
  status: string;
  ip: string;
}

export interface VirtualApiOrder {
  id: string;
  item: string;
  quantity: number;
  status: string;
}

export interface VirtualApiState {
  routes: ApiRoute[];
  logs: ApiServerLogEntry[];
  isCableBroken: boolean;
  validBearerTokens: string[];
  devices: VirtualApiDevice[];
  orders: VirtualApiOrder[];
  lastRequest?: HttpRequest;
  lastResponse?: HttpResponse;
  retryCount?: number;
  clientReceivedData?: any;
  clientSuccess?: boolean;
}

export interface ApiRuntimeResult {
  success: boolean;
  newState: VirtualApiState;
  logs: ApiServerLogEntry[];
  error?: string;
  lastResponse?: HttpResponse;
}

export const INITIAL_API_STATE: VirtualApiState = {
  routes: [
    {
      id: "route-health",
      method: "GET",
      path: "/health",
      summary: "Heartbeat check for API readiness",
    },
    {
      id: "route-devices",
      method: "GET",
      path: "/api/devices/{id}",
      summary: "Fetch hardware telemetry by device ID",
    },
    {
      id: "route-orders",
      method: "POST",
      path: "/api/orders",
      summary: "Create new order payload with JSON validation",
    },
    {
      id: "route-secure",
      method: "GET",
      path: "/api/secure/stats",
      summary: "Protected gateway telemetry requiring Bearer token",
    },
  ],
  logs: [],
  isCableBroken: false,
  validBearerTokens: ["forge-token-secure-99"],
  devices: [
    { id: "tv-01", name: "Living Room TV Chassis", status: "ONLINE", ip: "192.168.1.101" },
    { id: "pos-01", name: "Countertop POS Terminal", status: "BUSY", ip: "192.168.1.102" },
    { id: "gate-01", name: "Garage Motor Gate", status: "OFFLINE", ip: "192.168.1.103" },
  ],
  orders: [],
};

export class VirtualApiServer {
  private _state: VirtualApiState;

  constructor(initialState: VirtualApiState = INITIAL_API_STATE) {
    this._state = JSON.parse(JSON.stringify(initialState));
  }

  public getSnapshot(): VirtualApiState {
    return JSON.parse(JSON.stringify(this._state));
  }

  public setCableBroken(broken: boolean): void {
    this._state.isCableBroken = broken;
  }

  public handleRequest(req: HttpRequest): HttpResponse {
    const timestamp = new Date().toISOString().substring(11, 19);

    // Fault injection: If network cable is physically broken -> 504 Gateway Timeout
    if (this._state.isCableBroken) {
      const timeoutRes: HttpResponse = {
        statusCode: 504,
        statusText: "Gateway Timeout",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Network trace physically severed: cable break" }),
        latencyMs: 1500,
      };
      this._state.logs.unshift({
        timestamp,
        method: req.method,
        path: req.path,
        statusCode: 504,
        durationMs: 1500,
        message: "504 Gateway Timeout (Network bus cut)",
        level: "error",
      });
      this._state.lastRequest = req;
      this._state.lastResponse = timeoutRes;
      return timeoutRes;
    }

    // Task 1: /health route
    if (req.method === "GET" && (req.path === "/health" || req.path === "/healthz" || req.path === "/api/health")) {
      const res: HttpResponse = {
        statusCode: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "UP", service: "api-forge", uptime: 3600 }),
        latencyMs: 12,
      };
      this._state.logs.unshift({
        timestamp,
        method: req.method,
        path: req.path,
        statusCode: 200,
        durationMs: 12,
        message: "200 OK -> Heartbeat verified",
        level: "info",
      });
      this._state.lastRequest = req;
      this._state.lastResponse = res;
      return res;
    }

    // Task 2: /api/devices/{id}
    const deviceMatch = req.path.match(/^\/api\/devices\/([^/?]+)$/);
    if (req.method === "GET" && deviceMatch) {
      const deviceId = deviceMatch[1];
      const found = this._state.devices.find((d) => d.id === deviceId);
      if (found) {
        const res: HttpResponse = {
          statusCode: 200,
          statusText: "OK",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(found),
          latencyMs: 18,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 200,
          durationMs: 18,
          message: `200 OK -> Device found: ${found.name}`,
          level: "info",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      } else {
        const res: HttpResponse = {
          statusCode: 404,
          statusText: "Not Found",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: `Device '${deviceId}' not found` }),
          latencyMs: 25,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 404,
          durationMs: 25,
          message: `404 Not Found -> Device '${deviceId}' not registered`,
          level: "warn",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      }
    }

    // Task 3: POST /api/orders
    if (req.method === "POST" && req.path === "/api/orders") {
      try {
        const parsed = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
        if (!parsed.item || typeof parsed.item !== "string" || !parsed.quantity || parsed.quantity <= 0) {
          const res: HttpResponse = {
            statusCode: 400,
            statusText: "Bad Request",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              error: "Validation failed: 'item' must be non-empty and 'quantity' must be > 0",
            }),
            latencyMs: 15,
          };
          this._state.logs.unshift({
            timestamp,
            method: req.method,
            path: req.path,
            statusCode: 400,
            durationMs: 15,
            message: "400 Bad Request -> DTO validation failed",
            level: "warn",
          });
          this._state.lastRequest = req;
          this._state.lastResponse = res;
          return res;
        }

        const newOrder: VirtualApiOrder = {
          id: `ord-${this._state.orders.length + 101}`,
          item: parsed.item,
          quantity: parsed.quantity,
          status: "CONFIRMED",
        };
        this._state.orders.push(newOrder);

        const res: HttpResponse = {
          statusCode: 201,
          statusText: "Created",
          headers: { "Content-Type": "application/json", Location: `/api/orders/${newOrder.id}` },
          body: JSON.stringify(newOrder),
          latencyMs: 22,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 201,
          durationMs: 22,
          message: `201 Created -> Order ${newOrder.id} persisted`,
          level: "info",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      } catch {
        const res: HttpResponse = {
          statusCode: 400,
          statusText: "Bad Request",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid JSON format" }),
          latencyMs: 10,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 400,
          durationMs: 10,
          message: "400 Bad Request -> Malformed JSON",
          level: "error",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      }
    }

    // Task 4: Protected route with Bearer Token
    if (req.path === "/api/secure/stats") {
      const authHeader = req.headers["Authorization"] || req.headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const res: HttpResponse = {
          statusCode: 401,
          statusText: "Unauthorized",
          headers: { "Content-Type": "application/json", "WWW-Authenticate": "Bearer" },
          body: JSON.stringify({ error: "Missing or invalid Bearer token in Authorization header" }),
          latencyMs: 8,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 401,
          durationMs: 8,
          message: "401 Unauthorized -> Security barrier rejected request",
          level: "security",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      }

      const token = authHeader.replace("Bearer ", "").trim();
      if (!this._state.validBearerTokens.includes(token)) {
        const res: HttpResponse = {
          statusCode: 403,
          statusText: "Forbidden",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Access denied: Token expired or lacks permission" }),
          latencyMs: 14,
        };
        this._state.logs.unshift({
          timestamp,
          method: req.method,
          path: req.path,
          statusCode: 403,
          durationMs: 14,
          message: "403 Forbidden -> Untrusted token signature",
          level: "security",
        });
        this._state.lastRequest = req;
        this._state.lastResponse = res;
        return res;
      }

      const res: HttpResponse = {
        statusCode: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeConnections: 142,
          throughputRps: 1840,
          gatewayStatus: "HEALTHY",
        }),
        latencyMs: 11,
      };
      this._state.logs.unshift({
        timestamp,
        method: req.method,
        path: req.path,
        statusCode: 200,
        durationMs: 11,
        message: "200 OK -> Authenticated stats granted",
        level: "info",
      });
      this._state.lastRequest = req;
      this._state.lastResponse = res;
      return res;
    }

    // Default Fallback: 404 Route Not Found
    const notFoundRes: HttpResponse = {
      statusCode: 404,
      statusText: "Not Found",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: `Cannot ${req.method} ${req.path}` }),
      latencyMs: 10,
    };
    this._state.logs.unshift({
      timestamp,
      method: req.method,
      path: req.path,
      statusCode: 404,
      durationMs: 10,
      message: `404 Not Found -> No registered handler for ${req.method} ${req.path}`,
      level: "warn",
    });
    this._state.lastRequest = req;
    this._state.lastResponse = notFoundRes;
    return notFoundRes;
  }
}

/**
 * Executes student's C# or Go script and returns updated state + simulated HTTP response
 */
export function executeApiScript(
  script: string,
  initialState: VirtualApiState = INITIAL_API_STATE,
  sampleRequest?: HttpRequest
): ApiRuntimeResult {
  const server = new VirtualApiServer(initialState);
  const normalized = script.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""); // strip comments

  // If the terminal or cable is broken
  if (initialState.isCableBroken) {
    const defaultReq: HttpRequest = sampleRequest || {
      method: "GET",
      path: "/health",
      headers: {},
    };
    const response = server.handleRequest(defaultReq);
    return {
      success: false,
      newState: server.getSnapshot(),
      logs: server.getSnapshot().logs,
      error: "CABLE DISCONNECTED: 504 Gateway Timeout",
      lastResponse: response,
    };
  }

  // Detect script intent
  // ── Task 6: Resiliency & Timeout Retries ──
  if (
    normalized.includes("retry") ||
    normalized.includes("Retry") ||
    normalized.includes("Polly") ||
    normalized.includes("attempts") ||
    normalized.includes("backoff") ||
    /for\s*\(?.*attempt/i.test(normalized)
  ) {
    // Simulate retry policy
    const snap = server.getSnapshot();
    snap.retryCount = 3;
    snap.clientSuccess = true;

    return {
      success: true,
      newState: snap,
      logs: snap.logs,
      lastResponse: {
        statusCode: 200,
        statusText: "OK (Recovered on attempt 3)",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recovered: true, attempts: 3 }),
        latencyMs: 340,
      },
    };
  }

  // ── Task 5: Client Consumer (HttpClient / http.Client) ──
  if (
    normalized.includes("HttpClient") ||
    normalized.includes("http.Get") ||
    normalized.includes("http.NewRequest") ||
    normalized.includes("client.Do") ||
    normalized.includes("client.GetAsync") ||
    normalized.includes("GetFromJsonAsync")
  ) {
    const req: HttpRequest = sampleRequest || {
      method: "GET",
      path: "/health",
      headers: {},
    };
    const response = server.handleRequest(req);
    const snap = server.getSnapshot();
    snap.clientSuccess = response.statusCode === 200;
    snap.clientReceivedData = JSON.parse(response.body || "{}");

    return {
      success: true,
      newState: snap,
      logs: snap.logs,
      lastResponse: response,
    };
  }

  // ── Task 1: Healthcheck Route ──
  if (
    /app\.MapGet\s*\(\s*["'](?:\/api)?\/health/i.test(normalized) ||
    /http\.HandleFunc\s*\(\s*["'](?:\/api)?\/health/i.test(normalized) ||
    (normalized.includes("/health") && (normalized.includes("Results.Ok") || normalized.includes("w.WriteHeader")))
  ) {
    const req: HttpRequest = sampleRequest || {
      method: "GET",
      path: "/health",
      headers: {},
    };
    const response = server.handleRequest(req);
    return {
      success: response.statusCode === 200,
      newState: server.getSnapshot(),
      logs: server.getSnapshot().logs,
      lastResponse: response,
    };
  }

  // ── Task 2: Path Parameters / Devices ──
  if (
    normalized.includes("/devices") ||
    /devices\/\{id\}/i.test(normalized) ||
    /r\.PathValue\s*\(\s*["']id["']\s*\)/i.test(normalized) ||
    /context\.Request\.RouteValues/i.test(normalized) ||
    /Results\.NotFound/i.test(normalized) ||
    /http\.StatusNotFound/i.test(normalized)
  ) {
    const req: HttpRequest = sampleRequest || {
      method: "GET",
      path: "/api/devices/tv-01",
      headers: {},
    };
    const response = server.handleRequest(req);
    return {
      success: response.statusCode === 200 || response.statusCode === 404,
      newState: server.getSnapshot(),
      logs: server.getSnapshot().logs,
      lastResponse: response,
    };
  }

  // ── Task 3: POST /api/orders & DTO validation ──
  if (
    normalized.includes("/orders") ||
    /Results\.BadRequest/i.test(normalized) ||
    /Results\.Created/i.test(normalized) ||
    /http\.StatusBadRequest/i.test(normalized) ||
    /http\.StatusCreated/i.test(normalized) ||
    /json\.NewDecoder/i.test(normalized)
  ) {
    const req: HttpRequest = sampleRequest || {
      method: "POST",
      path: "/api/orders",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: "Oscilloscope Pro", quantity: 2 }),
    };
    const response = server.handleRequest(req);
    return {
      success: response.statusCode === 201 || response.statusCode === 400,
      newState: server.getSnapshot(),
      logs: server.getSnapshot().logs,
      lastResponse: response,
    };
  }

  // ── Task 4: Bearer Authorization ──
  if (
    normalized.includes("Authorization") ||
    normalized.includes("Bearer") ||
    /Results\.Unauthorized/i.test(normalized) ||
    /http\.StatusUnauthorized/i.test(normalized) ||
    /strings\.HasPrefix/i.test(normalized)
  ) {
    const req: HttpRequest = sampleRequest || {
      method: "GET",
      path: "/api/secure/stats",
      headers: { Authorization: "Bearer forge-token-secure-99" },
    };
    const response = server.handleRequest(req);
    return {
      success: response.statusCode === 200 || response.statusCode === 401,
      newState: server.getSnapshot(),
      logs: server.getSnapshot().logs,
      lastResponse: response,
    };
  }

  // Generic fallback: execute sample request against server
  const fallbackReq: HttpRequest = sampleRequest || {
    method: "GET",
    path: "/health",
    headers: {},
  };
  const fallbackRes = server.handleRequest(fallbackReq);

  return {
    success: true,
    newState: server.getSnapshot(),
    logs: server.getSnapshot().logs,
    lastResponse: fallbackRes,
  };
}
