/**
 * @file packages/sim-engine/src/runtime/tasks-api.ts
 * @description Educational curriculum tasks for Station 04: API Forge (C# & Go)
 */

import {
  type VirtualApiState,
  type ApiRuntimeResult,
  INITIAL_API_STATE,
} from "./apiContext";
import type { WorkedExample } from "./types";
import { WORKED_EXAMPLES } from "./workedExamplesData";

export interface ApiForgeTask {
  id: string;
  order: number;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  simpleExplanationKey?: string;
  engineeringKey?: string;
  workedExample?: WorkedExample;
  successKey: string;
  targetCode: {
    csharp: string;
    go: string;
  };
  clozeTemplate: {
    csharp: string;
    go: string;
  };
  initialState: VirtualApiState;
  validate: (
    before: VirtualApiState,
    after: VirtualApiState,
    result: ApiRuntimeResult,
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export const API_FORGE_TASKS: ApiForgeTask[] = [
  // ── Task 1: Heartbeat Endpoint ──────────────────────────────────
  {
    id: "task-api-1-heartbeat",
    order: 1,
    titleKey: "apiForge.tasks.task1.title",
    conceptKey: "apiForge.tasks.task1.concept",
    descKey: "apiForge.tasks.task1.desc",
    hintKey: "apiForge.tasks.task1.hint",
    simpleExplanationKey: "apiForge.tasks.task1.simple",
    engineeringKey: "apiForge.tasks.task1.engineering",
    successKey: "apiForge.tasks.task1.success",
    targetCode: {
      csharp: `app.MapGet("/health", () => Results.Ok(new { status = "UP", service = "api-forge" }));`,
      go: `http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(\`{"status":"UP","service":"api-forge"}\`))
})`,
    },
    clozeTemplate: {
      csharp: `app.MapGet("/health", () => Results.___({ status = "___", service = "api-forge" }));`,
      go: `http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.___)
    w.Write([]byte(\`{"status":"___","service":"api-forge"}\`))
})`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, _after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasRoute =
        normalized.includes("/health") ||
        normalized.includes("mapget") ||
        normalized.includes("handlefunc");
      const hasOk =
        normalized.includes("results.ok") ||
        normalized.includes("http.statusok") ||
        normalized.includes("200");

      const passed =
        hasRoute &&
        hasOk &&
        result.success &&
        result.lastResponse?.statusCode === 200;

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task1.success"
          : "apiForge.tasks.task1.fail",
      };
    },
  },

  // ── Task 2: Path Parameters & 404 Guard ─────────────────────────
  {
    id: "task-api-2-path-params",
    order: 2,
    titleKey: "apiForge.tasks.task2.title",
    conceptKey: "apiForge.tasks.task2.concept",
    descKey: "apiForge.tasks.task2.desc",
    hintKey: "apiForge.tasks.task2.hint",
    simpleExplanationKey: "apiForge.tasks.task2.simple",
    engineeringKey: "apiForge.tasks.task2.engineering",
    successKey: "apiForge.tasks.task2.success",
    targetCode: {
      csharp: `app.MapGet("/api/devices/{id}", (string id, IDeviceRepository repo) => {
    var device = repo.Find(id);
    return device != null ? Results.Ok(device) : Results.NotFound(new { error = "Device not found" });
});`,
      go: `http.HandleFunc("/api/devices/", func(w http.ResponseWriter, r *http.Request) {
    id := strings.TrimPrefix(r.URL.Path, "/api/devices/")
    device, exists := repo.Find(id)
    if !exists {
        http.Error(w, \`{"error":"Device not found"}\`, http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(device)
})`,
    },
    clozeTemplate: {
      csharp: `app.MapGet("/api/devices/{id}", (string id, IDeviceRepository repo) => {
    var device = repo.Find(id);
    return device != null ? Results.Ok(device) : Results.___(new { error = "Device not found" });
});`,
      go: `http.HandleFunc("/api/devices/", func(w http.ResponseWriter, r *http.Request) {
    id := strings.TrimPrefix(r.URL.Path, "/api/devices/")
    device, exists := repo.Find(id)
    if !exists {
        http.Error(w, \`{"error":"Device not found"}\`, http.___)
        return
    }
    json.NewEncoder(w).Encode(device)
})`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, _after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasNotFound =
        normalized.includes("notfound") ||
        normalized.includes("statusnotfound") ||
        normalized.includes("404");
      const hasDeviceLookup =
        normalized.includes("device") ||
        normalized.includes("id") ||
        normalized.includes("find");

      const passed =
        hasNotFound &&
        hasDeviceLookup &&
        result.success &&
        (result.lastResponse?.statusCode === 200 || result.lastResponse?.statusCode === 404);

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task2.success"
          : "apiForge.tasks.task2.fail",
      };
    },
  },

  // ── Task 3: Payload Validation & 201 Created ────────────────────
  {
    id: "task-api-3-dto-validation",
    order: 3,
    titleKey: "apiForge.tasks.task3.title",
    conceptKey: "apiForge.tasks.task3.concept",
    descKey: "apiForge.tasks.task3.desc",
    hintKey: "apiForge.tasks.task3.hint",
    simpleExplanationKey: "apiForge.tasks.task3.simple",
    engineeringKey: "apiForge.tasks.task3.engineering",
    successKey: "apiForge.tasks.task3.success",
    targetCode: {
      csharp: `app.MapPost("/api/orders", (CreateOrderDto dto, IOrderService service) => {
    if (string.IsNullOrWhiteSpace(dto.Item) || dto.Quantity <= 0)
        return Results.BadRequest(new { error = "Invalid order payload" });
    var order = service.Create(dto.Item, dto.Quantity);
    return Results.Created($"/api/orders/{order.Id}", order);
});`,
      go: `http.HandleFunc("/api/orders", func(w http.ResponseWriter, r *http.Request) {
    var dto CreateOrderDto
    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil || dto.Item == "" || dto.Quantity <= 0 {
        http.Error(w, \`{"error":"Invalid order payload"}\`, http.StatusBadRequest)
        return
    }
    order := service.Create(dto.Item, dto.Quantity)
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(order)
})`,
    },
    clozeTemplate: {
      csharp: `app.MapPost("/api/orders", (CreateOrderDto dto, IOrderService service) => {
    if (string.IsNullOrWhiteSpace(dto.Item) || dto.Quantity <= ___)
        return Results.___(new { error = "Invalid order payload" });
    var order = service.Create(dto.Item, dto.Quantity);
    return Results.___($"/api/orders/{order.Id}", order);
});`,
      go: `http.HandleFunc("/api/orders", func(w http.ResponseWriter, r *http.Request) {
    var dto CreateOrderDto
    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil || dto.Item == "" || dto.Quantity <= ___ {
        http.Error(w, \`{"error":"Invalid order payload"}\`, http.___)
        return
    }
    order := service.Create(dto.Item, dto.Quantity)
    w.WriteHeader(http.___)
    json.NewEncoder(w).Encode(order)
})`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, _after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasBadRequest =
        normalized.includes("badrequest") ||
        normalized.includes("statusbadrequest") ||
        normalized.includes("400");
      const hasCreated =
        normalized.includes("created") ||
        normalized.includes("statuscreated") ||
        normalized.includes("201");

      const passed =
        hasBadRequest &&
        hasCreated &&
        result.success &&
        (result.lastResponse?.statusCode === 201 || result.lastResponse?.statusCode === 400);

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task3.success"
          : "apiForge.tasks.task3.fail",
      };
    },
  },

  // ── Task 4: Bearer Token Authorization ──────────────────────────
  {
    id: "task-api-4-bearer-auth",
    order: 4,
    titleKey: "apiForge.tasks.task4.title",
    conceptKey: "apiForge.tasks.task4.concept",
    descKey: "apiForge.tasks.task4.desc",
    hintKey: "apiForge.tasks.task4.hint",
    simpleExplanationKey: "apiForge.tasks.task4.simple",
    engineeringKey: "apiForge.tasks.task4.engineering",
    successKey: "apiForge.tasks.task4.success",
    targetCode: {
      csharp: `app.MapGet("/api/secure/stats", (HttpContext context) => {
    var auth = context.Request.Headers.Authorization.ToString();
    if (!auth.StartsWith("Bearer forge-token-secure-99"))
        return Results.Unauthorized();
    return Results.Ok(new { gatewayStatus = "HEALTHY" });
});`,
      go: `http.HandleFunc("/api/secure/stats", func(w http.ResponseWriter, r *http.Request) {
    auth := r.Header.Get("Authorization")
    if !strings.HasPrefix(auth, "Bearer forge-token-secure-99") {
        http.Error(w, \`{"error":"Unauthorized"}\`, http.StatusUnauthorized)
        return
    }
    w.Write([]byte(\`{"gatewayStatus":"HEALTHY"}\`))
})`,
    },
    clozeTemplate: {
      csharp: `app.MapGet("/api/secure/stats", (HttpContext context) => {
    var auth = context.Request.Headers.Authorization.ToString();
    if (!auth.StartsWith("___"))
        return Results.___();
    return Results.Ok(new { gatewayStatus = "HEALTHY" });
});`,
      go: `http.HandleFunc("/api/secure/stats", func(w http.ResponseWriter, r *http.Request) {
    auth := r.Header.Get("Authorization")
    if !strings.HasPrefix(auth, "___") {
        http.Error(w, \`{"error":"Unauthorized"}\`, http.___)
        return
    }
    w.Write([]byte(\`{"gatewayStatus":"HEALTHY"}\`))
})`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, _after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasAuth =
        normalized.includes("authorization") ||
        normalized.includes("bearer");
      const hasUnauthorized =
        normalized.includes("unauthorized") ||
        normalized.includes("statusunauthorized") ||
        normalized.includes("401");

      const passed =
        hasAuth &&
        hasUnauthorized &&
        result.success &&
        (result.lastResponse?.statusCode === 200 || result.lastResponse?.statusCode === 401);

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task4.success"
          : "apiForge.tasks.task4.fail",
      };
    },
  },

  // ── Task 5: Client Consumer Implementation ──────────────────────
  {
    id: "task-api-5-client-consumer",
    order: 5,
    titleKey: "apiForge.tasks.task5.title",
    conceptKey: "apiForge.tasks.task5.concept",
    descKey: "apiForge.tasks.task5.desc",
    hintKey: "apiForge.tasks.task5.hint",
    simpleExplanationKey: "apiForge.tasks.task5.simple",
    engineeringKey: "apiForge.tasks.task5.engineering",
    successKey: "apiForge.tasks.task5.success",
    targetCode: {
      csharp: `using var client = new HttpClient();
var response = await client.GetAsync("https://forge.api/health");
response.EnsureSuccessStatusCode();
var health = await response.Content.ReadFromJsonAsync<HealthDto>();`,
      go: `resp, err := http.Get("https://forge.api/health")
if err != nil || resp.StatusCode != http.StatusOK {
    return nil, errors.New("health check failed")
}
defer resp.Body.Close()
var health HealthDto
json.NewDecoder(resp.Body).Decode(&health)`,
    },
    clozeTemplate: {
      csharp: `using var client = new HttpClient();
var response = await client.___("https://forge.api/health");
response.___();
var health = await response.Content.ReadFromJsonAsync<HealthDto>();`,
      go: `resp, err := http.___("https://forge.api/health")
if err != nil || resp.StatusCode != http.___ {
    return nil, errors.New("failed")
}
defer resp.Body.Close()`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasClient =
        normalized.includes("httpclient") ||
        normalized.includes("http.get") ||
        normalized.includes("client.getasync") ||
        normalized.includes("client.do");
      const hasParse =
        normalized.includes("json") ||
        normalized.includes("readfromjsonasync") ||
        normalized.includes("decode") ||
        normalized.includes("statuscode");

      const passed =
        hasClient &&
        hasParse &&
        result.success &&
        (after.clientSuccess === true || result.lastResponse?.statusCode === 200);

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task5.success"
          : "apiForge.tasks.task5.fail",
      };
    },
  },

  // ── Task 6: Resiliency & Timeout Retries ─────────────────────────
  {
    id: "task-api-6-resiliency-retry",
    order: 6,
    titleKey: "apiForge.tasks.task6.title",
    conceptKey: "apiForge.tasks.task6.concept",
    descKey: "apiForge.tasks.task6.desc",
    hintKey: "apiForge.tasks.task6.hint",
    simpleExplanationKey: "apiForge.tasks.task6.simple",
    engineeringKey: "apiForge.tasks.task6.engineering",
    successKey: "apiForge.tasks.task6.success",
    targetCode: {
      csharp: `for (int attempt = 1; attempt <= 3; attempt++) {
    try {
        var res = await client.GetAsync(url);
        if (res.IsSuccessStatusCode) return await res.Content.ReadAsStringAsync();
    } catch (HttpRequestException) when (attempt < 3) {
        await Task.Delay(100 * attempt);
    }
}`,
      go: `for attempt := 1; attempt <= 3; attempt++ {
    resp, err := client.Get(url)
    if err == nil && resp.StatusCode == http.StatusOK {
        return resp, nil
    }
    time.Sleep(time.Duration(attempt * 100) * time.Millisecond)
}`,
    },
    clozeTemplate: {
      csharp: `for (int attempt = 1; attempt <= ___; attempt++) {
    try {
        var res = await client.GetAsync(url);
        if (res.IsSuccessStatusCode) return await res.Content.ReadAsStringAsync();
    } catch (HttpRequestException) when (attempt < 3) {
        await Task.___(___ * attempt);
    }
}`,
      go: `for attempt := 1; attempt <= ___; attempt++ {
    resp, err := client.Get(url)
    if err == nil && resp.StatusCode == http.StatusOK {
        return resp, nil
    }
    time.Sleep(time.Duration(attempt * ___) * time.Millisecond)
}`,
    },
    initialState: INITIAL_API_STATE,
    validate: (_before, after, result, code = "") => {
      const normalized = code.toLowerCase();
      const hasLoop =
        normalized.includes("for") &&
        (normalized.includes("attempt") || normalized.includes("retry") || normalized.includes("<="));
      const hasDelay =
        normalized.includes("delay") ||
        normalized.includes("sleep") ||
        normalized.includes("backoff");

      const passed =
        hasLoop &&
        hasDelay &&
        result.success &&
        after.retryCount === 3;

      return {
        passed,
        messageKey: passed
          ? "apiForge.tasks.task6.success"
          : "apiForge.tasks.task6.fail",
      };
    },
  },
];

// Attach authentic Gradual Release of Responsibility (GRR) worked examples
API_FORGE_TASKS.forEach((t) => {
  if (!t.workedExample && WORKED_EXAMPLES[t.id]) {
    t.workedExample = WORKED_EXAMPLES[t.id];
  }
});
