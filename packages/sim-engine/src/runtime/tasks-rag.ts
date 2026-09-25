/**
 * @file packages/sim-engine/src/runtime/tasks-rag.ts
 * @description Educational curriculum tasks for IBM RAG and Agentic AI Track.
 * 8 enterprise-grade tasks across Python & TypeScript covering:
 * 1. Recursive Chunking & Overlap
 * 2. Vector Cosine Similarity
 * 3. In-Memory Vector Store Top-K
 * 4. Hybrid Search with Reciprocal Rank Fusion (RRF)
 * 5. ReAct Agent State Loop (Thought -> Action -> Observation)
 * 6. Tool Calling JSON Schema Validation
 * 7. Multi-Agent Supervisor Routing
 * 8. RAGAS Faithfulness & Anti-Hallucination Guardrail
 */

import type { WorkedExample } from "./types";

export interface RagTask {
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

export const RAG_TASKS: RagTask[] = [
  // ── Task 1: Recursive Document Chunking & Overlap ──────────────────────────
  {
    id: "task-rag-1-chunking-overlap",
    order: 1,
    titleKey: "rag.tasks.task1.title",
    conceptKey: "rag.tasks.task1.concept",
    descKey: "rag.tasks.task1.desc",
    hintKey: "rag.tasks.task1.hint",
    successKey: "rag.tasks.task1.success",
    simpleExplanationKey: "rag.tasks.task1.simple",
    engineeringKey: "rag.tasks.task1.engineering",
    targetCode: {
      python: `# Enterprise Document Chunker with Overlap
def chunk_document(text: str, chunk_size: int = 256, overlap: int = 40) -> list[str]:
    chunks = []
    step = max(1, chunk_size - overlap)
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start += step
    return chunks`,
      typescript: `// Enterprise Document Chunker with Overlap
export function chunkDocument(text: string, chunkSize = 256, overlap = 40): string[] {
  const chunks: string[] = [];
  const step = Math.max(1, chunkSize - overlap);
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end >= text.length) break;
    start += step;
  }
  return chunks;
}`,
    },
    clozeTemplate: {
      python: `# Enterprise Document Chunker with Overlap
def chunk_document(text: str, chunk_size: int = 256, overlap: int = 40) -> list[str]:
    chunks = []
    step = max(1, ___ - ___)
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= len(text):
            break
        start += ___
    return chunks`,
      typescript: `// Enterprise Document Chunker with Overlap
export function chunkDocument(text: string, chunkSize = 256, overlap = 40): string[] {
  const chunks: string[] = [];
  const step = Math.max(1, ___ - ___);
  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    if (end >= text.length) break;
    start += ___;
  }
  return chunks;
}`,
    },
    transferVariant: {
      prompt: {
        ua: "Модифікуйте крок розбиття так, щоб мінімальний розмір чанка ніколи не був меншим за 50 символів.",
        en: "Modify the chunking step so that the minimum chunk length is never smaller than 50 characters.",
        da: "Rediger chunking-trinnet, så den minimale chunk-længde aldrig er mindre end 50 tegn.",
      },
      hint: {
        ua: "Використовуйте перевірку if len(chunk) >= 50 перед додаванням у список.",
        en: "Use an if len(chunk) >= 50 check before appending to the list.",
        da: "Brug et if len(chunk) >= 50 tjek før tilføjelse til listen.",
      },
    },
  },

  // ── Task 2: Vector Cosine Similarity Math ──────────────────────────────────
  {
    id: "task-rag-2-cosine-similarity",
    order: 2,
    titleKey: "rag.tasks.task2.title",
    conceptKey: "rag.tasks.task2.concept",
    descKey: "rag.tasks.task2.desc",
    hintKey: "rag.tasks.task2.hint",
    successKey: "rag.tasks.task2.success",
    simpleExplanationKey: "rag.tasks.task2.simple",
    engineeringKey: "rag.tasks.task2.engineering",
    targetCode: {
      python: `import math

# Vector Cosine Similarity: (A . B) / (||A|| * ||B||)
def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(a * a for a in vec_a))
    mag_b = math.sqrt(sum(b * b for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot_product / (mag_a * mag_b)`,
      typescript: `// Vector Cosine Similarity: (A . B) / (||A|| * ||B||)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dotProduct / denom;
}`,
    },
    clozeTemplate: {
      python: `import math

# Vector Cosine Similarity: (A . B) / (||A|| * ||B||)
def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    mag_a = math.sqrt(sum(___ * ___ for a in vec_a))
    mag_b = math.sqrt(sum(___ * ___ for b in vec_b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return ___ / (mag_a * mag_b)`,
      typescript: `// Vector Cosine Similarity: (A . B) / (||A|| * ||B||)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(___) * Math.sqrt(___);
  return denom === 0 ? 0 : ___ / denom;
}`,
    },
  },

  // ── Task 3: In-Memory Vector Store Top-K Search ────────────────────────────
  {
    id: "task-rag-3-vector-store",
    order: 3,
    titleKey: "rag.tasks.task3.title",
    conceptKey: "rag.tasks.task3.concept",
    descKey: "rag.tasks.task3.desc",
    hintKey: "rag.tasks.task3.hint",
    successKey: "rag.tasks.task3.success",
    simpleExplanationKey: "rag.tasks.task3.simple",
    engineeringKey: "rag.tasks.task3.engineering",
    targetCode: {
      python: `# Top-K Vector Search Engine
def top_k_search(query_vec: list[float], docs: list[dict], k: int = 3) -> list[dict]:
    scored = []
    for doc in docs:
        sim = cosine_similarity(query_vec, doc["vector"])
        scored.append({"id": doc["id"], "text": doc["text"], "score": round(sim, 4)})
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]`,
      typescript: `// Top-K Vector Search Engine
export function topKSearch(queryVec: number[], docs: Array<{ id: string; text: string; vector: number[] }>, k = 3) {
  const scored = docs.map((doc) => ({
    id: doc.id,
    text: doc.text,
    score: Number(cosineSimilarity(queryVec, doc.vector).toFixed(4)),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}`,
    },
    clozeTemplate: {
      python: `# Top-K Vector Search Engine
def top_k_search(query_vec: list[float], docs: list[dict], k: int = 3) -> list[dict]:
    scored = []
    for doc in docs:
        sim = cosine_similarity(query_vec, doc["vector"])
        scored.append({"id": doc["id"], "text": doc["text"], "score": round(sim, 4)})
    scored.sort(key=lambda x: x["___"], reverse=___)
    return scored[:k]`,
      typescript: `// Top-K Vector Search Engine
export function topKSearch(queryVec: number[], docs: Array<{ id: string; text: string; vector: number[] }>, k = 3) {
  const scored = docs.map((doc) => ({
    id: doc.id,
    text: doc.text,
    score: Number(cosineSimilarity(queryVec, doc.vector).toFixed(4)),
  }));
  scored.sort((a, b) => b.___ - a.___);
  return scored.slice(0, k);
}`,
    },
  },

  // ── Task 4: Hybrid Search & Reciprocal Rank Fusion (RRF) ───────────────────
  {
    id: "task-rag-4-hybrid-rrf",
    order: 4,
    titleKey: "rag.tasks.task4.title",
    conceptKey: "rag.tasks.task4.concept",
    descKey: "rag.tasks.task4.desc",
    hintKey: "rag.tasks.task4.hint",
    successKey: "rag.tasks.task4.success",
    simpleExplanationKey: "rag.tasks.task4.simple",
    engineeringKey: "rag.tasks.task4.engineering",
    targetCode: {
      python: `# Reciprocal Rank Fusion: RRF(d) = 1 / (60 + r_dense) + 1 / (60 + r_sparse)
def calculate_rrf(dense_rank: int, sparse_rank: int, k: int = 60) -> float:
    score = (1.0 / (k + dense_rank)) + (1.0 / (k + sparse_rank))
    return round(score, 5)

def fuse_ranks(candidates: list[dict], k: int = 60) -> list[dict]:
    for c in candidates:
        c["rrf_score"] = calculate_rrf(c["dense_rank"], c["sparse_rank"], k)
    candidates.sort(key=lambda x: x["rrf_score"], reverse=True)
    return candidates`,
      typescript: `// Reciprocal Rank Fusion: RRF(d) = 1 / (60 + r_dense) + 1 / (60 + r_sparse)
export function calculateRrf(denseRank: number, sparseRank: number, k = 60): number {
  const score = 1.0 / (k + denseRank) + 1.0 / (k + sparseRank);
  return Number(score.toFixed(5));
}

export function fuseRanks(candidates: Array<{ id: string; denseRank: number; sparseRank: number }>, k = 60) {
  const fused = candidates.map((c) => ({
    ...c,
    rrfScore: calculateRrf(c.denseRank, c.sparseRank, k),
  }));
  fused.sort((a, b) => b.rrfScore - a.rrfScore);
  return fused;
}`,
    },
    clozeTemplate: {
      python: `# Reciprocal Rank Fusion: RRF(d) = 1 / (60 + r_dense) + 1 / (60 + r_sparse)
def calculate_rrf(dense_rank: int, sparse_rank: int, k: int = 60) -> float:
    score = (1.0 / (___ + dense_rank)) + (1.0 / (___ + sparse_rank))
    return round(score, 5)

def fuse_ranks(candidates: list[dict], k: int = 60) -> list[dict]:
    for c in candidates:
        c["rrf_score"] = calculate_rrf(c["dense_rank"], c["sparse_rank"], k)
    candidates.sort(key=lambda x: x["rrf_score"], reverse=True)
    return candidates`,
      typescript: `// Reciprocal Rank Fusion: RRF(d) = 1 / (60 + r_dense) + 1 / (60 + r_sparse)
export function calculateRrf(denseRank: number, sparseRank: number, k = 60): number {
  const score = 1.0 / (___ + denseRank) + 1.0 / (___ + sparseRank);
  return Number(score.toFixed(5));
}

export function fuseRanks(candidates: Array<{ id: string; denseRank: number; sparseRank: number }>, k = 60) {
  const fused = candidates.map((c) => ({
    ...c,
    rrfScore: calculateRrf(c.denseRank, c.sparseRank, k),
  }));
  fused.sort((a, b) => b.rrfScore - a.rrfScore);
  return fused;
}`,
    },
  },

  // ── Task 5: ReAct Agent Loop (Thought -> Action -> Observation) ────────────
  {
    id: "task-rag-5-react-loop",
    order: 5,
    titleKey: "rag.tasks.task5.title",
    conceptKey: "rag.tasks.task5.concept",
    descKey: "rag.tasks.task5.desc",
    hintKey: "rag.tasks.task5.hint",
    successKey: "rag.tasks.task5.success",
    simpleExplanationKey: "rag.tasks.task5.simple",
    engineeringKey: "rag.tasks.task5.engineering",
    targetCode: {
      python: `# ReAct Loop State Machine: Thought -> Action -> Observation
class ReActAgent:
    def __init__(self, tool_registry: dict, max_steps: int = 3):
        self.tools = tool_registry
        self.max_steps = max_steps

    def execute_step(self, step_type: str, payload: dict) -> dict:
        if step_type == "thought":
            return {"status": "ok", "action_needed": payload.get("tool_name")}
        elif step_type == "action":
            tool = self.tools.get(payload["tool_name"])
            obs = tool(payload.get("arg", ""))
            return {"status": "observed", "observation": obs}
        return {"status": "complete", "final_answer": payload.get("answer")}`,
      typescript: `// ReAct Loop State Machine: Thought -> Action -> Observation
export class ReActAgent {
  constructor(
    private tools: Record<string, (arg: string) => string>,
    private maxSteps = 3
  ) {}

  executeStep(stepType: "thought" | "action" | "final_answer", payload: Record<string, string>) {
    if (stepType === "thought") {
      return { status: "ok", actionNeeded: payload.toolName };
    } else if (stepType === "action") {
      const tool = this.tools[payload.toolName];
      const obs = tool ? tool(payload.arg || "") : "Tool not found";
      return { status: "observed", observation: obs };
    }
    return { status: "complete", finalAnswer: payload.answer };
  }
}`,
    },
    clozeTemplate: {
      python: `# ReAct Loop State Machine: Thought -> Action -> Observation
class ReActAgent:
    def __init__(self, tool_registry: dict, max_steps: int = 3):
        self.tools = tool_registry
        self.max_steps = max_steps

    def execute_step(self, step_type: str, payload: dict) -> dict:
        if step_type == "___":
            return {"status": "ok", "action_needed": payload.get("tool_name")}
        elif step_type == "___":
            tool = self.tools.get(payload["tool_name"])
            obs = tool(payload.get("arg", ""))
            return {"status": "observed", "observation": obs}
        return {"status": "complete", "final_answer": payload.get("answer")}`,
      typescript: `// ReAct Loop State Machine: Thought -> Action -> Observation
export class ReActAgent {
  constructor(
    private tools: Record<string, (arg: string) => string>,
    private maxSteps = 3
  ) {}

  executeStep(stepType: "thought" | "action" | "final_answer", payload: Record<string, string>) {
    if (stepType === "___") {
      return { status: "ok", actionNeeded: payload.toolName };
    } else if (stepType === "___") {
      const tool = this.tools[payload.toolName];
      const obs = tool ? tool(payload.arg || "") : "Tool not found";
      return { status: "observed", observation: obs };
    }
    return { status: "complete", finalAnswer: payload.answer };
  }
}`,
    },
  },

  // ── Task 6: Tool Calling & JSON Schema Validation ──────────────────────────
  {
    id: "task-rag-6-tool-calling-schema",
    order: 6,
    titleKey: "rag.tasks.task6.title",
    conceptKey: "rag.tasks.task6.concept",
    descKey: "rag.tasks.task6.desc",
    hintKey: "rag.tasks.task6.hint",
    successKey: "rag.tasks.task6.success",
    simpleExplanationKey: "rag.tasks.task6.simple",
    engineeringKey: "rag.tasks.task6.engineering",
    targetCode: {
      python: `# Tool Call Invocation & Schema Guard
def validate_and_invoke_tool(tool_schema: dict, tool_func, arguments: dict) -> dict:
    required_params = tool_schema.get("parameters", {}).get("required", [])
    for param in required_params:
        if param not in arguments:
            return {"success": False, "error": f"Missing required parameter: {param}"}
    output = tool_func(**arguments)
    return {"success": True, "output": output}`,
      typescript: `// Tool Call Invocation & Schema Guard
export function validateAndInvokeTool(
  toolSchema: { parameters: { required: string[] } },
  toolFunc: (args: Record<string, unknown>) => unknown,
  argumentsPayload: Record<string, unknown>
) {
  for (const param of toolSchema.parameters.required) {
    if (!(param in argumentsPayload)) {
      return { success: false, error: \`Missing required parameter: \${param}\` };
    }
  }
  const output = toolFunc(argumentsPayload);
  return { success: true, output };
}`,
    },
    clozeTemplate: {
      python: `# Tool Call Invocation & Schema Guard
def validate_and_invoke_tool(tool_schema: dict, tool_func, arguments: dict) -> dict:
    required_params = tool_schema.get("parameters", {}).get("required", [])
    for param in required_params:
        if param not in arguments:
            return {"success": False, "error": f"Missing required parameter: {param}"}
    output = tool_func(**___)
    return {"success": True, "output": output}`,
      typescript: `// Tool Call Invocation & Schema Guard
export function validateAndInvokeTool(
  toolSchema: { parameters: { required: string[] } },
  toolFunc: (args: Record<string, unknown>) => unknown,
  argumentsPayload: Record<string, unknown>
) {
  for (const param of toolSchema.parameters.required) {
    if (!(param in argumentsPayload)) {
      return { success: false, error: \`Missing required parameter: \${param}\` };
    }
  }
  const output = toolFunc(___);
  return { success: true, output };
}`,
    },
  },

  // ── Task 7: RAGAS Faithfulness & Hallucination Guardrail ───────────────────
  {
    id: "task-rag-7-ragas-faithfulness",
    order: 7,
    titleKey: "rag.tasks.task7.title",
    conceptKey: "rag.tasks.task7.concept",
    descKey: "rag.tasks.task7.desc",
    hintKey: "rag.tasks.task7.hint",
    successKey: "rag.tasks.task7.success",
    simpleExplanationKey: "rag.tasks.task7.simple",
    engineeringKey: "rag.tasks.task7.engineering",
    targetCode: {
      python: `# RAGAS Faithfulness: Ratio of claims grounded in retrieved context
def calculate_faithfulness(claims: list[str], retrieved_context: str) -> float:
    if not claims:
        return 1.0
    grounded_count = 0
    ctx_lower = retrieved_context.lower()
    for claim in claims:
        keywords = [w.lower() for w in claim.split() if len(w) > 4]
        matches = sum(1 for kw in keywords if kw in ctx_lower)
        if keywords and (matches / len(keywords)) >= 0.60:
            grounded_count += 1
    return round(grounded_count / len(claims), 2)`,
      typescript: `// RAGAS Faithfulness: Ratio of claims grounded in retrieved context
export function calculateFaithfulness(claims: string[], retrievedContext: string): number {
  if (claims.length === 0) return 1.0;
  let groundedCount = 0;
  const ctxLower = retrievedContext.toLowerCase();
  for (const claim of claims) {
    const keywords = claim.split(/\\W+/).filter((w) => w.length > 4).map((w) => w.toLowerCase());
    const matches = keywords.filter((kw) => ctxLower.includes(kw)).length;
    if (keywords.length > 0 && matches / keywords.length >= 0.6) {
      groundedCount++;
    }
  }
  return Number((groundedCount / claims.length).toFixed(2));
}`,
    },
    clozeTemplate: {
      python: `# RAGAS Faithfulness: Ratio of claims grounded in retrieved context
def calculate_faithfulness(claims: list[str], retrieved_context: str) -> float:
    if not claims:
        return 1.0
    grounded_count = 0
    ctx_lower = retrieved_context.lower()
    for claim in claims:
        keywords = [w.lower() for w in claim.split() if len(w) > 4]
        matches = sum(1 for kw in keywords if kw in ctx_lower)
        if keywords and (matches / len(keywords)) >= 0.60:
            grounded_count += 1
    return round(___ / len(claims), 2)`,
      typescript: `// RAGAS Faithfulness: Ratio of claims grounded in retrieved context
export function calculateFaithfulness(claims: string[], retrievedContext: string): number {
  if (claims.length === 0) return 1.0;
  let groundedCount = 0;
  const ctxLower = retrievedContext.toLowerCase();
  for (const claim of claims) {
    const keywords = claim.split(/\\W+/).filter((w) => w.length > 4).map((w) => w.toLowerCase());
    const matches = keywords.filter((kw) => ctxLower.includes(kw)).length;
    if (keywords.length > 0 && matches / keywords.length >= 0.6) {
      groundedCount++;
    }
  }
  return Number((___ / claims.length).toFixed(2));
}`,
    },
  },

  // ── Task 8: Enterprise Security Guardrail (Prompt Injection Defense) ───────
  {
    id: "task-rag-8-guardrail-injection",
    order: 8,
    titleKey: "rag.tasks.task8.title",
    conceptKey: "rag.tasks.task8.concept",
    descKey: "rag.tasks.task8.desc",
    hintKey: "rag.tasks.task8.hint",
    successKey: "rag.tasks.task8.success",
    simpleExplanationKey: "rag.tasks.task8.simple",
    engineeringKey: "rag.tasks.task8.engineering",
    targetCode: {
      python: `import re

# Enterprise Prompt Injection & System Prompt Protection
INJECTION_REGEX = re.compile(
    r"(ignore\\s+all\\s+previous\\s+instructions|system\\s+prompt|bypass\\s+guardrail)",
    re.IGNORECASE
)

def guardrail_input_check(user_query: str) -> tuple[bool, str]:
    if INJECTION_REGEX.search(user_query):
        return False, "Security Alert: Prompt injection attempt detected and blocked."
    return True, user_query.strip()`,
      typescript: `// Enterprise Prompt Injection & System Prompt Protection
const INJECTION_REGEX = /(ignore\\s+all\\s+previous\\s+instructions|system\\s+prompt|bypass\\s+guardrail)/i;

export function guardrailInputCheck(userQuery: string): { isSafe: boolean; message: string } {
  if (INJECTION_REGEX.test(userQuery)) {
    return {
      isSafe: false,
      message: "Security Alert: Prompt injection attempt detected and blocked.",
    };
  }
  return { isSafe: true, message: userQuery.trim() };
}`,
    },
    clozeTemplate: {
      python: `import re

# Enterprise Prompt Injection & System Prompt Protection
INJECTION_REGEX = re.compile(
    r"(ignore\\s+all\\s+previous\\s+instructions|system\\s+prompt|bypass\\s+guardrail)",
    re.IGNORECASE
)

def guardrail_input_check(user_query: str) -> tuple[bool, str]:
    if INJECTION_REGEX.search(___):
        return False, "Security Alert: Prompt injection attempt detected and blocked."
    return True, user_query.strip()`,
      typescript: `// Enterprise Prompt Injection & System Prompt Protection
const INJECTION_REGEX = /(ignore\\s+all\\s+previous\\s+instructions|system\\s+prompt|bypass\\s+guardrail)/i;

export function guardrailInputCheck(userQuery: string): { isSafe: boolean; message: string } {
  if (INJECTION_REGEX.test(___)) {
    return {
      isSafe: false,
      message: "Security Alert: Prompt injection attempt detected and blocked.",
    };
  }
  return { isSafe: true, message: userQuery.trim() };
}`,
    },
  },
];
