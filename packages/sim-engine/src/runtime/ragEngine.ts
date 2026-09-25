/**
 * @file packages/sim-engine/src/runtime/ragEngine.ts
 * @description Enterprise-grade RAG and Agentic AI simulation engine.
 * Implements document chunking, semantic vector embeddings, in-memory vector indexing,
 * hybrid search with Reciprocal Rank Fusion (RRF), ReAct agent execution state loops,
 * and RAGAS evaluation metrics (Faithfulness, Relevance, Precision).
 */

// ── 1. Document Chunking & Text Engineering ──────────────────────────────────

export interface ChunkMetadata {
  docId: string;
  source?: string;
  title?: string;
  [key: string]: unknown;
}

export interface DocumentChunk {
  id: string;
  text: string;
  startChar: number;
  endChar: number;
  tokenCount: number;
  metadata: ChunkMetadata;
}

/**
 * Estimates token count using standard 3.8 chars per token approximation
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.trim().length / 3.8);
}

/**
 * Splits text into overlapping chunks with sentence/boundary awareness
 */
export function splitIntoChunks(
  text: string,
  chunkSize = 256,
  chunkOverlap = 40,
  docMetadata: ChunkMetadata = { docId: "doc_01" }
): DocumentChunk[] {
  const cleaned = text.trim();
  if (!cleaned) return [];

  // If text is shorter than chunk size, return single chunk
  if (cleaned.length <= chunkSize) {
    return [
      {
        id: `${docMetadata.docId}_chunk_0`,
        text: cleaned,
        startChar: 0,
        endChar: cleaned.length,
        tokenCount: estimateTokens(cleaned),
        metadata: { ...docMetadata, chunkIndex: 0 },
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIdx = 0;
  const effectiveStep = Math.max(1, chunkSize - chunkOverlap);

  while (startIndex < cleaned.length) {
    let endIndex = Math.min(cleaned.length, startIndex + chunkSize);

    // Boundary snapping: if not at the very end, try snapping to space or punctuation
    if (endIndex < cleaned.length) {
      const windowStr = cleaned.slice(startIndex, endIndex);
      const lastPunct = Math.max(
        windowStr.lastIndexOf(".\n"),
        windowStr.lastIndexOf(". "),
        windowStr.lastIndexOf("\n\n"),
        windowStr.lastIndexOf("; ")
      );

      if (lastPunct > chunkSize * 0.45) {
        endIndex = startIndex + lastPunct + 1;
      } else {
        const lastSpace = windowStr.lastIndexOf(" ");
        if (lastSpace > chunkSize * 0.5) {
          endIndex = startIndex + lastSpace;
        }
      }
    }

    const chunkText = cleaned.slice(startIndex, endIndex).trim();
    if (chunkText.length > 0) {
      chunks.push({
        id: `${docMetadata.docId}_chunk_${chunkIdx}`,
        text: chunkText,
        startChar: startIndex,
        endChar: endIndex,
        tokenCount: estimateTokens(chunkText),
        metadata: { ...docMetadata, chunkIndex: chunkIdx },
      });
      chunkIdx++;
    }

    if (endIndex >= cleaned.length) break;
    startIndex += effectiveStep;
    if (startIndex >= endIndex) {
      startIndex = endIndex;
    }
  }

  return chunks;
}

// ── 2. Vector Embeddings & Math ──────────────────────────────────────────────

/**
 * 8-dimensional semantic subspace projection:
 * [0] Tech / Architecture
 * [1] Security / IAM / Auth
 * [2] Financial / Payments / POS
 * [3] AI / ML / RAG / Agents
 * [4] DevOps / Infrastructure / Cloud
 * [5] Data / Database / Storage
 * [6] Performance / Latency / Concurrency
 * [7] Policy / Compliance / Governance
 */
const SEMANTIC_KEYWORDS: Record<number, string[]> = {
  0: ["architecture", "class", "function", "module", "code", "csharp", "golang", "interface", "pattern", "component"],
  1: ["security", "auth", "token", "jwt", "bearer", "injection", "vulnerability", "iam", "rbac", "zero-trust"],
  2: ["finance", "payment", "pos", "transaction", "balance", "card", "money", "ledger", "price", "checkout"],
  3: ["ai", "rag", "agent", "llm", "embedding", "vector", "retrieval", "prompt", "hallucination", "model"],
  4: ["cloud", "docker", "kubernetes", "deploy", "cluster", "pipeline", "gcs", "aws", "endpoint", "sre"],
  5: ["database", "sql", "storage", "qdrant", "milvus", "vectorstore", "document", "record", "query", "schema"],
  6: ["latency", "cache", "performance", "wpm", "async", "concurrency", "thread", "speed", "throughput", "fast"],
  7: ["compliance", "gdpr", "nist", "pii", "audit", "policy", "governance", "sla", "terms", "regulation"],
};

/**
 * Generates an 8-dimensional unit vector representing semantic embedding
 */
export function generateEmbedding(text: string): number[] {
  const normText = text.toLowerCase();
  const rawVec = new Array<number>(8).fill(0.05); // Small baseline epsilon

  for (let dim = 0; dim < 8; dim++) {
    const keywords = SEMANTIC_KEYWORDS[dim];
    for (const kw of keywords) {
      if (normText.includes(kw)) {
        rawVec[dim] += 0.45;
      }
    }
  }

  // Add deterministic hash influence for unique vocabulary richness
  for (let i = 0; i < normText.length; i++) {
    const charCode = normText.charCodeAt(i);
    const targetDim = (charCode + i) % 8;
    rawVec[targetDim] += 0.008;
  }

  // Normalize to unit vector L2: ||v|| = 1
  const magnitude = Math.sqrt(rawVec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude === 0) return rawVec;
  return rawVec.map((val) => Number((val / magnitude).toFixed(5)));
}

/**
 * Calculates Cosine Similarity between two vectors: (A . B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  if (denominator === 0) return 0;
  return Math.max(-1, Math.min(1, dotProduct / denominator));
}

// ── 3. In-Memory Vector Store ────────────────────────────────────────────────

export interface VectorRecord {
  id: string;
  text: string;
  vector: number[];
  metadata: ChunkMetadata;
}

export interface SearchResult {
  record: VectorRecord;
  score: number;
}

export class InMemoryVectorStore {
  private records: Map<string, VectorRecord> = new Map();

  public addDocument(id: string, text: string, metadata: ChunkMetadata = { docId: id }): VectorRecord {
    const vector = generateEmbedding(text);
    const record: VectorRecord = { id, text, vector, metadata };
    this.records.set(id, record);
    return record;
  }

  public addChunks(chunks: DocumentChunk[]): VectorRecord[] {
    return chunks.map((c) => this.addDocument(c.id, c.text, c.metadata));
  }

  public similaritySearch(query: string, topK = 3, threshold = 0.0): SearchResult[] {
    const queryVec = generateEmbedding(query);
    const results: SearchResult[] = [];

    for (const record of this.records.values()) {
      const score = calculateCosineSimilarity(queryVec, record.vector);
      if (score >= threshold) {
        results.push({ record, score: Number(score.toFixed(4)) });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  public count(): number {
    return this.records.size;
  }

  public clear(): void {
    this.records.clear();
  }

  public getAll(): VectorRecord[] {
    return Array.from(this.records.values());
  }
}

// ── 4. Hybrid Search & Reciprocal Rank Fusion (RRF) ──────────────────────────

export interface HybridSearchResult {
  id: string;
  text: string;
  denseRank: number;
  sparseRank: number;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
  metadata: ChunkMetadata;
}

/**
 * Calculates BM25-like token match score
 */
export function calculateSparseScore(query: string, text: string): number {
  const queryTokens = query.toLowerCase().split(/\W+/).filter(Boolean);
  const docTokens = new Set(text.toLowerCase().split(/\W+/).filter(Boolean));
  if (queryTokens.length === 0 || docTokens.size === 0) return 0;

  let matches = 0;
  for (const token of queryTokens) {
    if (docTokens.has(token)) matches++;
  }
  return matches / queryTokens.length;
}

/**
 * Reciprocal Rank Fusion: RRF(d) = 1 / (k + rank_dense) + 1 / (k + rank_sparse)
 */
export function reciprocalRankFusion(
  query: string,
  records: VectorRecord[],
  topK = 3,
  kConstant = 60
): HybridSearchResult[] {
  if (records.length === 0) return [];

  const queryVec = generateEmbedding(query);

  // 1. Dense ranking (Cosine similarity)
  const denseScored = records.map((rec) => ({
    rec,
    score: calculateCosineSimilarity(queryVec, rec.vector),
  }));
  denseScored.sort((a, b) => b.score - a.score);

  // 2. Sparse ranking (Keyword token matches)
  const sparseScored = records.map((rec) => ({
    rec,
    score: calculateSparseScore(query, rec.text),
  }));
  sparseScored.sort((a, b) => b.score - a.score);

  // Map ranks
  const denseRankMap = new Map<string, { rank: number; score: number }>();
  denseScored.forEach((item, index) => {
    denseRankMap.set(item.rec.id, { rank: index + 1, score: item.score });
  });

  const sparseRankMap = new Map<string, { rank: number; score: number }>();
  sparseScored.forEach((item, index) => {
    sparseRankMap.set(item.rec.id, { rank: index + 1, score: item.score });
  });

  // Calculate RRF scores
  const results: HybridSearchResult[] = records.map((rec) => {
    const dense = denseRankMap.get(rec.id) || { rank: records.length, score: 0 };
    const sparse = sparseRankMap.get(rec.id) || { rank: records.length, score: 0 };

    const rrfScore =
      1.0 / (kConstant + dense.rank) + 1.0 / (kConstant + sparse.rank);

    return {
      id: rec.id,
      text: rec.text,
      denseRank: dense.rank,
      sparseRank: sparse.rank,
      denseScore: Number(dense.score.toFixed(4)),
      sparseScore: Number(sparse.score.toFixed(4)),
      rrfScore: Number(rrfScore.toFixed(5)),
      metadata: rec.metadata,
    };
  });

  results.sort((a, b) => b.rrfScore - a.rrfScore);
  return results.slice(0, topK);
}

// ── 5. ReAct Agent Engine (Reasoning + Acting) ───────────────────────────────

export type AgentStepType = "thought" | "action" | "observation" | "reflection" | "final_answer";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (args: Record<string, string>) => Promise<string> | string;
}

export interface ReActTraceStep {
  stepIndex: number;
  type: AgentStepType;
  title: string;
  content: string;
  toolCall?: {
    toolName: string;
    arguments: Record<string, string>;
  };
  durationMs: number;
}

export interface ReActExecutionResult {
  query: string;
  steps: ReActTraceStep[];
  finalAnswer: string;
  iterations: number;
  toolsUsed: string[];
  isComplete: boolean;
  totalDurationMs: number;
}

export class ReActAgentEngine {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor(tools: ToolDefinition[] = []) {
    for (const tool of tools) {
      this.registerTool(tool);
    }
  }

  public registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public async run(query: string, maxIterations = 4): Promise<ReActExecutionResult> {
    const startTime = Date.now();
    const steps: ReActTraceStep[] = [];
    const toolsUsed: string[] = [];
    let stepCount = 0;
    let finalAnswer = "";

    // 1. Initial Thought Step
    stepCount++;
    steps.push({
      stepIndex: stepCount,
      type: "thought",
      title: "Аналіз наміру користувача (User Intent Decomposition)",
      content: `Розбиваю запит: "${query}". Потрібно перевірити векторну базу знань на наявність перевірених джерел.`,
      durationMs: 45,
    });

    let currentContext = "";

    // Loop iterations
    for (let iter = 1; iter <= maxIterations; iter++) {
      // 2. Action Step (Choose tool)
      const selectedTool = this.tools.get("vector_search") || Array.from(this.tools.values())[0];
      if (!selectedTool) break;

      toolsUsed.push(selectedTool.name);
      stepCount++;
      const toolArgs = { query, topK: "2" };

      steps.push({
        stepIndex: stepCount,
        type: "action",
        title: `Виклик інструменту: ${selectedTool.name}`,
        content: `Викликаю ${selectedTool.name}(query="${query}", topK=2) для верифікації фактів.`,
        toolCall: {
          toolName: selectedTool.name,
          arguments: toolArgs,
        },
        durationMs: 90,
      });

      // 3. Observation Step (Tool output)
      const observation = await selectedTool.execute(toolArgs);
      currentContext = observation;
      stepCount++;
      steps.push({
        stepIndex: stepCount,
        type: "observation",
        title: `Отримано спостереження від ${selectedTool.name}`,
        content: observation,
        durationMs: 60,
      });

      // 4. Reflection Step (Check if information is sufficient)
      stepCount++;
      steps.push({
        stepIndex: stepCount,
        type: "reflection",
        title: "Критична рефлексія (Fact Grounding Check)",
        content: `Знайдено джерела. Перевіряю факт на відповідність першоджерелу без галюцинацій. Відповідь повна.`,
        durationMs: 50,
      });

      // Formulate final answer based on retrieved context
      finalAnswer = `[RAG Grounded Response]: На основі регламенту бази знань: ${currentContext.slice(0, 180)}...`;
      break;
    }

    // 5. Final Answer Step
    stepCount++;
    steps.push({
      stepIndex: stepCount,
      type: "final_answer",
      title: "Синтезована відповідь (Final Answer)",
      content: finalAnswer,
      durationMs: 40,
    });

    return {
      query,
      steps,
      finalAnswer,
      iterations: 1,
      toolsUsed,
      isComplete: true,
      totalDurationMs: Date.now() - startTime + 285, // Add realistic simulated execution latency
    };
  }
}

// ── 6. RAGAS Evaluation Framework (Automated Quality & Trust) ────────────────

export interface RagasEvaluation {
  faithfulnessScore: number;     // 0.0 – 1.0 (Grounding / Anti-Hallucination)
  answerRelevanceScore: number;  // 0.0 – 1.0 (Semantics against user question)
  contextPrecisionScore: number; // 0.0 – 1.0 (Signal to noise in retrieved chunks)
  isHallucinationDetected: boolean;
  verdictKey: string;
  citations: string[];
}

/**
 * Calculates RAGAS Faithfulness:
 * Ratio of claims in generated answer that are directly supported by retrieved context.
 */
export function calculateFaithfulness(answer: string, retrievedContext: string[]): number {
  if (!answer.trim() || retrievedContext.length === 0) return 0.0;

  const combinedContext = retrievedContext.join(" ").toLowerCase();
  const sentences = answer
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length === 0) return 1.0;

  let supportedCount = 0;
  for (const sentence of sentences) {
    const keyWords = sentence.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
    if (keyWords.length === 0) {
      supportedCount++;
      continue;
    }
    const matches = keyWords.filter((w) => combinedContext.includes(w)).length;
    // If at least 65% of sentence's distinctive tokens appear in context -> claim is grounded
    if (matches / keyWords.length >= 0.65) {
      supportedCount++;
    }
  }

  return Number((supportedCount / sentences.length).toFixed(2));
}

/**
 * Evaluates comprehensive RAGAS metrics for production monitoring
 */
export function evaluateRagas(
  query: string,
  answer: string,
  retrievedContexts: string[]
): RagasEvaluation {
  const faithfulness = calculateFaithfulness(answer, retrievedContexts);

  // Answer relevance based on cosine similarity of query and answer
  const qVec = generateEmbedding(query);
  const aVec = generateEmbedding(answer);
  const cosine = calculateCosineSimilarity(qVec, aVec);
  const answerRelevance = Number(Math.max(0, cosine).toFixed(2));

  // Context precision: check if retrieved contexts contain keywords from query
  const queryTokens = query.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  let relevantChunks = 0;
  for (const ctx of retrievedContexts) {
    const lowerCtx = ctx.toLowerCase();
    if (queryTokens.some((t) => lowerCtx.includes(t))) {
      relevantChunks++;
    }
  }
  const contextPrecision =
    retrievedContexts.length > 0
      ? Number((relevantChunks / retrievedContexts.length).toFixed(2))
      : 0.0;

  const isHallucinationDetected = faithfulness < 0.70;

  return {
    faithfulnessScore: faithfulness,
    answerRelevanceScore: answerRelevance,
    contextPrecisionScore: contextPrecision,
    isHallucinationDetected,
    verdictKey: isHallucinationDetected ? "rag.eval.hallucinationAlert" : "rag.eval.groundedVerified",
    citations: retrievedContexts.map((_, i) => `[Source ${i + 1}]`),
  };
}

// ── 7. Enterprise Guardrails (Injection & PII) ───────────────────────────────

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+(dan|developer\s+mode)/i,
  /bypass\s+(safety|guardrail)/i,
  /reveal\s+(secret|password|api_key)/i,
];

const PII_PATTERNS = [
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit Card
  /\b\d{3}-\d{2}-\d{4}\b/g,                    // SSN
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
];

export function detectPromptInjection(input: string): { isThreat: boolean; matchedPattern?: string } {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { isThreat: true, matchedPattern: pattern.source };
    }
  }
  return { isThreat: false };
}

export function sanitizePii(text: string): { sanitized: string; redactedCount: number } {
  let redactedCount = 0;
  let result = text;

  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, () => {
      redactedCount++;
      return "[REDACTED_PII]";
    });
  }

  return { sanitized: result, redactedCount };
}
