/**
 * @file apps/web/src/store/slices/ragAgentSlice.ts
 * @description Station 09: IBM RAG and Agentic AI Track simulation slice.
 * Manages document chunking, in-memory vector storage, hybrid RRF search,
 * ReAct agent trace steps, and RAGAS evaluation metrics.
 */

import type { StateCreator } from "zustand";
import {
  splitIntoChunks,
  InMemoryVectorStore,
  reciprocalRankFusion,
  ReActAgentEngine,
  evaluateRagas,
  detectPromptInjection,
  type DocumentChunk,
  type HybridSearchResult,
  type ReActExecutionResult,
} from "@iw/sim-engine";
import { audioFx } from "../../utils/audioFx";
import type { WorkbenchStore, RagAgentSlice } from "../types";

const INITIAL_DOCUMENTS = [
  {
    id: "doc_sla",
    title: "Enterprise SLA & High-Availability Architecture",
    text: `The enterprise cloud infrastructure mandates a 99.95% uptime SLA across all multi-region clusters. Services communicate via private VPC peering channels with strict mutual TLS (mTLS) enforcement. In the event of a cluster partition, traffic automatically fails over to the standby node within 2.4 seconds without state desynchronization. Recovery Time Objective (RTO) is capped at 15 minutes, with Recovery Point Objective (RPO) zero-data-loss for committed distributed ledger transactions.`,
  },
  {
    id: "doc_sec",
    title: "Zero Trust Security & Identity Access Management (IAM)",
    text: `Authentication across all internal and external microservices utilizes short-lived JWT bearer tokens signed with RS256 asymmetric keys. Keys rotate automatically every 24 hours via HashiCorp Vault. Service accounts adhere strictly to the principle of least privilege: cross-service calls require granular RBAC scopes. All ingress API endpoints enforce IP rate limiting (100 req/sec per token) and automated prompt injection sanitization filters before payloads reach agent pipelines.`,
  },
  {
    id: "doc_rag",
    title: "RAG & Agentic Swarm Knowledge Grounding Specification",
    text: `The enterprise RAG system utilizes an in-memory vector database indexed with 8-dimensional semantic embeddings. Retrieval employs Reciprocal Rank Fusion (RRF) with constant k=60 to fuse BM25 keyword ranks and dense cosine similarity scores. Agents follow the ReAct paradigm (Thought -> Action -> Observation -> Reflection) with a hard maximum of 4 reasoning iterations. All final answers undergo automated RAGAS evaluation: answers with Faithfulness scores below 0.70 trigger automated hallucination rollback.`,
  },
];

const INITIAL_CHUNKS: DocumentChunk[] = INITIAL_DOCUMENTS.flatMap((doc) =>
  splitIntoChunks(doc.text, 256, 40, { docId: doc.id, title: doc.title })
);

// Module-level vector store instance
const vectorStore = new InMemoryVectorStore();
vectorStore.addChunks(INITIAL_CHUNKS);

export const createRagAgentSlice: StateCreator<
  WorkbenchStore,
  [],
  [],
  RagAgentSlice
> = (set, get) => ({
  ragDocuments: INITIAL_DOCUMENTS,
  ragChunkSize: 256,
  ragChunkOverlap: 40,
  ragActiveChunks: INITIAL_CHUNKS,
  ragQueryInput: "What is our enterprise SLA uptime and failover policy?",
  ragSearchResults: [],
  ragActiveTab: "chunking",
  reActSteps: [],
  isReActRunning: false,
  reActFinalAnswer: "",
  ragasEvaluation: null,
  guardrailAlert: null,
  isRagVictoryModalOpen: false,

  setRagChunkConfig: (chunkSize: number, chunkOverlap: number) => {
    audioFx.playRelayClick();
    const docs = get().ragDocuments;
    const newChunks = docs.flatMap((doc) =>
      splitIntoChunks(doc.text, chunkSize, chunkOverlap, { docId: doc.id, title: doc.title })
    );

    vectorStore.clear();
    vectorStore.addChunks(newChunks);

    set({
      ragChunkSize: chunkSize,
      ragChunkOverlap: chunkOverlap,
      ragActiveChunks: newChunks,
    });

    if (get().isExplorerTourActive && get().explorerStep === 2 && get().tourStepJustCompleted !== 2) {
      get().completeExplorerStep(2);
    }
  },

  setRagQueryInput: (query: string) => {
    set({ ragQueryInput: query });
  },

  executeRagQueryAction: (query: string, topK = 3): HybridSearchResult[] => {
    audioFx.playKeyClick();
    const records = vectorStore.getAll();
    const results = reciprocalRankFusion(query, records, topK, 60);

    // Check prompt injection guardrail
    const injection = detectPromptInjection(query);
    const alert = injection.isThreat
      ? "🚨 Security Alert: Prompt injection attempt detected and blocked!"
      : null;

    if (injection.isThreat) {
      audioFx.playErrorBuzz();
    } else {
      audioFx.playSuccessFanfare();
    }

    set({
      ragSearchResults: results,
      guardrailAlert: alert,
    });

    return results;
  },

  runReActAgentAction: async (query: string): Promise<ReActExecutionResult> => {
    audioFx.playRelayClick();
    set({ isReActRunning: true, reActSteps: [], reActFinalAnswer: "", guardrailAlert: null });

    // Guardrail check
    const injection = detectPromptInjection(query);
    if (injection.isThreat) {
      audioFx.playErrorBuzz();
      const threatResult: ReActExecutionResult = {
        query,
        steps: [
          {
            stepIndex: 1,
            type: "thought",
            title: "Prompt Injection Detected",
            content: "Input blocked by Enterprise Guardrail Sentinel.",
            durationMs: 15,
          },
        ],
        finalAnswer: "Blocked: Prompt injection violates enterprise security policy.",
        iterations: 0,
        toolsUsed: [],
        isComplete: true,
        totalDurationMs: 15,
      };
      set({
        isReActRunning: false,
        reActSteps: threatResult.steps,
        reActFinalAnswer: threatResult.finalAnswer,
        guardrailAlert: "🚨 Security Alert: Prompt injection attempt detected and blocked!",
      });
      return threatResult;
    }

    const engine = new ReActAgentEngine([
      {
        name: "vector_search",
        description: "Searches enterprise knowledge base",
        parameters: { query: "string" },
        execute: (args) => {
          const searchRes = get().executeRagQueryAction(args.query || query, 2);
          if (searchRes.length === 0) return "No relevant documents found.";
          return searchRes.map((r) => `[${r.id}]: ${r.text}`).join("\n\n");
        },
      },
    ]);

    const result = await engine.run(query);
    audioFx.playSuccessFanfare();

    // Run RAGAS automated evaluation
    const retrievedTexts = get().ragSearchResults.map((r) => r.text);
    const evalResult = evaluateRagas(query, result.finalAnswer, retrievedTexts);

    set({
      isReActRunning: false,
      reActSteps: result.steps,
      reActFinalAnswer: result.finalAnswer,
      ragasEvaluation: evalResult,
    });

    return result;
  },

  resetReActAgentAction: () => {
    audioFx.playRelayClick();
    set({
      reActSteps: [],
      isReActRunning: false,
      reActFinalAnswer: "",
      ragasEvaluation: null,
      guardrailAlert: null,
    });
  },

  setRagActiveTabAction: (tab: "chunking" | "react" | "ragas") => {
    audioFx.playRelayClick();
    set({ ragActiveTab: tab });
  },

  setRagVictoryModalOpen: (open: boolean) => {
    set({ isRagVictoryModalOpen: open });
  },

  resetRagState: () => {
    vectorStore.clear();
    vectorStore.addChunks(INITIAL_CHUNKS);
    set({
      ragDocuments: INITIAL_DOCUMENTS,
      ragChunkSize: 256,
      ragChunkOverlap: 40,
      ragActiveChunks: INITIAL_CHUNKS,
      ragSearchResults: [],
      reActSteps: [],
      isReActRunning: false,
      reActFinalAnswer: "",
      ragasEvaluation: null,
      guardrailAlert: null,
    });
  },
});
