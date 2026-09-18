/**
 * @file packages/sim-engine/src/runtime/tasks-fde.ts
 * @description Educational curriculum tasks for Station 07: Field AI Deployer.
 * 15 tasks across 5 rounds: Discovery → Integration → Agent Design → Security → Handoff.
 * Target role: Forward Deployed Engineer (Applied AI) @ Google.
 */

import type { WorkedExample } from "./types";
import type { FdeState, DiscoveryResult, IntegrationResult, PipelineResult, SecurityResult, HandoffResult } from "./fdeContext";
import {
  INITIAL_FDE_STATE,
  makeDiscoveryChoice,
  connectLegacyApi,
  configureAuthToken,
  connectAgentNode,
  configureRag,
  toggleSecurityCheck,
  submitRunbook,
} from "./fdeContext";
import { WORKED_EXAMPLES } from "./workedExamplesData";

export interface FdeTask {
  id: string;
  order: number;
  round: 1 | 2 | 3 | 4 | 5;
  roundNameKey: string;
  titleKey: string;
  conceptKey: string;
  descKey: string;
  hintKey: string;
  simpleExplanationKey?: string;
  engineeringKey?: string;
  workedExample?: WorkedExample;
  successKey: string;
  /** For dialogue tasks: the NPC client dialogue tree */
  dialogueTree?: FdeDialogueScenario;
  /** For code tasks: target snippets */
  targetCode?: {
    python: string;
    typescript: string;
  };
  clozeTemplate?: {
    python: string;
    typescript: string;
  };
  initialState: FdeState;
  validate: (
    before: FdeState,
    after: FdeState,
    result: DiscoveryResult | IntegrationResult | PipelineResult | SecurityResult | HandoffResult | { success: boolean; output: string },
    code?: string
  ) => { passed: boolean; messageKey?: string };
}

export interface FdeDialogueScenario {
  /** NPC opening statement */
  npcOpeningKey: string;
  /** Player must make these choices in order */
  choices: FdeDialogueChoice[];
}

export interface FdeDialogueChoice {
  id: string;
  npcPromptKey: string; // what the client says
  options: {
    id: string;
    textKey: string;
    isCorrect: boolean;
    consequenceKey: string;
    xpGain: number;
  }[];
}

export const FDE_TASKS: FdeTask[] = [
  // ══════════════════════════════════════════════════════
  // ROUND 1: DISCOVERY (Tasks 1–3)
  // ══════════════════════════════════════════════════════

  {
    id: "task-fde-1-initial-meeting",
    order: 1,
    round: 1,
    roundNameKey: "fde.rounds.discovery",
    titleKey: "fde.tasks.task1.title",
    conceptKey: "fde.tasks.task1.concept",
    descKey: "fde.tasks.task1.desc",
    hintKey: "fde.tasks.task1.hint",
    simpleExplanationKey: "fde.tasks.task1.simple",
    engineeringKey: "fde.tasks.task1.engineering",
    successKey: "fde.tasks.task1.success",
    workedExample: WORKED_EXAMPLES["task-fde-1-initial-meeting"],
    initialState: INITIAL_FDE_STATE,
    dialogueTree: {
      npcOpeningKey: "fde.dialogue.task1.opening",
      choices: [
        {
          id: "choice-1",
          npcPromptKey: "fde.dialogue.task1.prompt1",
          options: [
            {
              id: "a",
              textKey: "fde.dialogue.task1.option1a",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task1.consequence1a",
              xpGain: 0,
            },
            {
              id: "b",
              textKey: "fde.dialogue.task1.option1b",
              isCorrect: true,
              consequenceKey: "fde.dialogue.task1.consequence1b",
              xpGain: 30,
            },
            {
              id: "c",
              textKey: "fde.dialogue.task1.option1c",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task1.consequence1c",
              xpGain: 0,
            },
          ],
        },
      ],
    },
    validate: (_before, after, _result, _code) => {
      const passed = after.correctChoicesMade > _before.correctChoicesMade;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task1.success" : "fde.tasks.task1.hint",
      };
    },
  },

  {
    id: "task-fde-2-pain-point",
    order: 2,
    round: 1,
    roundNameKey: "fde.rounds.discovery",
    titleKey: "fde.tasks.task2.title",
    conceptKey: "fde.tasks.task2.concept",
    descKey: "fde.tasks.task2.desc",
    hintKey: "fde.tasks.task2.hint",
    simpleExplanationKey: "fde.tasks.task2.simple",
    engineeringKey: "fde.tasks.task2.engineering",
    successKey: "fde.tasks.task2.success",
    workedExample: WORKED_EXAMPLES["task-fde-2-pain-point"],
    initialState: {
      ...INITIAL_FDE_STATE,
      correctChoicesMade: 1,
      clientTrustScore: 55,
    },
    dialogueTree: {
      npcOpeningKey: "fde.dialogue.task2.opening",
      choices: [
        {
          id: "choice-2",
          npcPromptKey: "fde.dialogue.task2.prompt1",
          options: [
            {
              id: "a",
              textKey: "fde.dialogue.task2.option1a",
              isCorrect: true,
              consequenceKey: "fde.dialogue.task2.consequence1a",
              xpGain: 35,
            },
            {
              id: "b",
              textKey: "fde.dialogue.task2.option1b",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task2.consequence1b",
              xpGain: 0,
            },
            {
              id: "c",
              textKey: "fde.dialogue.task2.option1c",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task2.consequence1c",
              xpGain: 0,
            },
            {
              id: "d",
              textKey: "fde.dialogue.task2.option1d",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task2.consequence1d",
              xpGain: 0,
            },
          ],
        },
      ],
    },
    validate: (_before, after, _result, _code) => {
      const passed = after.correctChoicesMade > _before.correctChoicesMade;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task2.success" : "fde.tasks.task2.hint",
      };
    },
  },

  {
    id: "task-fde-3-scope-definition",
    order: 3,
    round: 1,
    roundNameKey: "fde.rounds.discovery",
    titleKey: "fde.tasks.task3.title",
    conceptKey: "fde.tasks.task3.concept",
    descKey: "fde.tasks.task3.desc",
    hintKey: "fde.tasks.task3.hint",
    simpleExplanationKey: "fde.tasks.task3.simple",
    engineeringKey: "fde.tasks.task3.engineering",
    successKey: "fde.tasks.task3.success",
    workedExample: WORKED_EXAMPLES["task-fde-3-scope-definition"],
    targetCode: {
      python: `# Technical Scope Document\nscope = {\n    "problem": "Compliance team spends 40h/week manually reviewing contracts",\n    "proposed_solution": "Gemini-powered RAG agent for contract review",\n    "out_of_scope": ["Legal decisions", "Contract signing", "HRMS integration"],\n    "success_metrics": {\n        "time_reduction": "80%",\n        "accuracy": ">95%",\n        "latency": "<3s per contract page"\n    },\n    "constraints": ["Data must stay on-prem", "No PII to LLM", "EU GDPR compliant"]\n}`,
      typescript: `const scope = {\n  problem: "Compliance team: 40h/week manual contract review",\n  solution: "Gemini RAG agent for contract analysis",\n  outOfScope: ["legal decisions", "contract signing"],\n  successMetrics: {\n    timeReduction: "80%",\n    accuracy: ">95%",\n    latencyPerPage: "<3s"\n  },\n  constraints: ["on-prem data", "no PII to LLM", "GDPR"]\n};`,
    },
    clozeTemplate: {
      python: `scope = {\n    "problem": "___",\n    "proposed_solution": "___",\n    "out_of_scope": ["___", "___"],\n    "success_metrics": {\n        "time_reduction": "___",\n        "accuracy": "___",\n    },\n    "constraints": ["___"]\n}`,
      typescript: `const scope = {\n  problem: "___",\n  solution: "___",\n  successMetrics: {\n    timeReduction: "___",\n    accuracy: "___"\n  }\n};`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      correctChoicesMade: 2,
      clientTrustScore: 70,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasScope =
        c.includes("scope") || c.includes("problem") ||
        c.includes("success_metrics") || c.includes("successmetrics") ||
        c.includes("constraint");
      const hasMeasure = c.includes("%") || c.includes("metric") || c.includes("<");
      const passed = hasScope && hasMeasure;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task3.success" : "fde.tasks.task3.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 2: INTEGRATION (Tasks 4–6)
  // ══════════════════════════════════════════════════════

  {
    id: "task-fde-4-api-connect",
    order: 4,
    round: 2,
    roundNameKey: "fde.rounds.integration",
    titleKey: "fde.tasks.task4.title",
    conceptKey: "fde.tasks.task4.concept",
    descKey: "fde.tasks.task4.desc",
    hintKey: "fde.tasks.task4.hint",
    simpleExplanationKey: "fde.tasks.task4.simple",
    engineeringKey: "fde.tasks.task4.engineering",
    successKey: "fde.tasks.task4.success",
    workedExample: WORKED_EXAMPLES["task-fde-4-api-connect"],
    targetCode: {
      python: `import httpx\n\n# Legacy system uses HTTP Basic Auth over HTTPS\nBASE_URL = "https://compliance-legacy.bankinternal.com/api/v1"\nTOKEN = os.getenv("COMPLIANCE_API_TOKEN")\n\nheaders = {\n    "Authorization": f"Bearer {TOKEN}",\n    "Content-Type": "application/json",\n    "X-Client-ID": "gemini-fde-agent",\n}\n\nasync with httpx.AsyncClient(verify="/certs/bank-ca.pem") as client:\n    resp = await client.get(f"{BASE_URL}/contracts", headers=headers)\n    resp.raise_for_status()\n    contracts = resp.json()`,
      typescript: `const BASE_URL = "https://compliance-legacy.bankinternal.com/api/v1";\nconst token = process.env.COMPLIANCE_API_TOKEN;\n\nconst response = await fetch(\`\${BASE_URL}/contracts\`, {\n  headers: {\n    "Authorization": \`Bearer \${token}\`,\n    "Content-Type": "application/json",\n  },\n});\nif (!response.ok) throw new Error(\`HTTP \${response.status}\`);\nconst contracts = await response.json();`,
    },
    clozeTemplate: {
      python: `BASE_URL = "https://___/api/v1"\nTOKEN = os.getenv("___")\n\nheaders = {\n    "Authorization": f"Bearer {___}",\n    "X-Client-ID": "___",\n}\nasync with httpx.AsyncClient() as client:\n    resp = await client.get(f"{BASE_URL}/___", headers=headers)`,
      typescript: `const token = process.env.___;\n\nconst response = await fetch(\`\${BASE_URL}/___\`, {\n  headers: {\n    "Authorization": \`Bearer \${___}\`,\n  },\n});`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      clientPainPointIdentified: true,
      clientTrustScore: 70,
      correctChoicesMade: 3,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasHttps = c.includes("https://") || c.includes("https");
      const hasAuth = c.includes("bearer") || c.includes("authorization") || c.includes("token");
      const passed = (hasHttps && hasAuth) || after.legacyApiConnected;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task4.success" : "fde.tasks.task4.hint",
      };
    },
  },

  {
    id: "task-fde-5-debug-legacy",
    order: 5,
    round: 2,
    roundNameKey: "fde.rounds.integration",
    titleKey: "fde.tasks.task5.title",
    conceptKey: "fde.tasks.task5.concept",
    descKey: "fde.tasks.task5.desc",
    hintKey: "fde.tasks.task5.hint",
    simpleExplanationKey: "fde.tasks.task5.simple",
    engineeringKey: "fde.tasks.task5.engineering",
    successKey: "fde.tasks.task5.success",
    workedExample: WORKED_EXAMPLES["task-fde-5-debug-legacy"],
    targetCode: {
      python: `# Fix: Legacy API requires X-API-Version header + JSON body for POST\nimport httpx\n\nasync def fetch_contract(contract_id: str) -> dict:\n    try:\n        resp = await client.post(\n            f"{BASE_URL}/contracts/fetch",\n            headers={\n                "Authorization": f"Bearer {TOKEN}",\n                "X-API-Version": "2023-01-01",  # ← Missing in original code!\n                "Content-Type": "application/json",\n            },\n            json={"contractId": contract_id, "format": "json"}\n        )\n        resp.raise_for_status()\n        return resp.json()\n    except httpx.HTTPStatusError as e:\n        logger.error(f"API Error: {e.response.status_code} — {e.response.text}")\n        raise`,
      typescript: `async function fetchContract(contractId: string) {\n  const resp = await fetch(\`\${BASE_URL}/contracts/fetch\`, {\n    method: "POST",\n    headers: {\n      "Authorization": \`Bearer \${TOKEN}\`,\n      "X-API-Version": "2023-01-01", // ← Missing header!\n      "Content-Type": "application/json",\n    },\n    body: JSON.stringify({ contractId, format: "json" }),\n  });\n  if (!resp.ok) throw new Error(\`\${resp.status}: \${await resp.text()}\`);\n  return resp.json();\n}`,
    },
    clozeTemplate: {
      python: `resp = await client.post(\n    f"{BASE_URL}/contracts/fetch",\n    headers={\n        "Authorization": f"Bearer {TOKEN}",\n        "X-API-Version": "___",  # Required versioning header\n    },\n    json={"contractId": ___, "format": "___"}\n)`,
      typescript: `const resp = await fetch(\`\${BASE_URL}/contracts/fetch\`, {\n  method: "POST",\n  headers: {\n    "X-API-Version": "___",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ contractId: ___, format: "___" }),\n});`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      clientTrustScore: 70,
      integrationErrors: [
        { code: 400, message: "Bad Request: Missing X-API-Version header", hint: "fde.integration.hint400" },
      ],
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasVersion =
        c.includes("x-api-version") || c.includes("api_version") || c.includes("version");
      const hasJson = c.includes("json") || c.includes("content-type");
      const passed = hasVersion && hasJson;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task5.success" : "fde.tasks.task5.hint",
      };
    },
  },

  {
    id: "task-fde-6-data-transform",
    order: 6,
    round: 2,
    roundNameKey: "fde.rounds.integration",
    titleKey: "fde.tasks.task6.title",
    conceptKey: "fde.tasks.task6.concept",
    descKey: "fde.tasks.task6.desc",
    hintKey: "fde.tasks.task6.hint",
    simpleExplanationKey: "fde.tasks.task6.simple",
    engineeringKey: "fde.tasks.task6.engineering",
    successKey: "fde.tasks.task6.success",
    workedExample: WORKED_EXAMPLES["task-fde-6-data-transform"],
    targetCode: {
      python: `import re\nfrom typing import TypedDict\n\nclass ContractChunk(TypedDict):\n    text: str\n    page: int\n    pii_redacted: bool\n\ndef transform_for_rag(raw_contract: dict) -> list[ContractChunk]:\n    \"\"\"Transform legacy XML/JSON contract into RAG-ready chunks with PII masking.\"\"\"\n    pages = raw_contract.get("pages", [])\n    chunks = []\n    for i, page in enumerate(pages):\n        text = page["content"]\n        # PII masking: remove names, emails, account numbers\n        text = re.sub(r\"\\b[A-Z][a-z]+ [A-Z][a-z]+\\b\", \"[NAME]\", text)\n        text = re.sub(r\"[\\w.-]+@[\\w.-]+\\.[a-z]+\", \"[EMAIL]\", text)\n        text = re.sub(r\"\\b\\d{8,16}\\b\", \"[ACCOUNT]\", text)\n        chunks.append(ContractChunk(text=text, page=i+1, pii_redacted=True))\n    return chunks`,
      typescript: `interface ContractChunk {\n  text: string;\n  page: number;\n  piiRedacted: boolean;\n}\n\nfunction transformForRag(rawContract: Record<string, any>): ContractChunk[] {\n  return (rawContract.pages ?? []).map((page: any, i: number) => ({\n    text: page.content\n      .replace(/\\b[A-Z][a-z]+ [A-Z][a-z]+\\b/g, "[NAME]")\n      .replace(/[\\w.-]+@[\\w.-]+/g, "[EMAIL]")\n      .replace(/\\b\\d{8,16}\\b/g, "[ACCOUNT]"),\n    page: i + 1,\n    piiRedacted: true,\n  }));\n}`,
    },
    clozeTemplate: {
      python: `def transform_for_rag(raw_contract: dict) -> list[ContractChunk]:\n    pages = raw_contract.get("pages", [])\n    chunks = []\n    for i, page in enumerate(pages):\n        text = page["content"]\n        text = re.sub(r"___", "[NAME]", text)  # Mask names\n        text = re.sub(r"___", "[EMAIL]", text)  # Mask emails\n        chunks.append(ContractChunk(text=___, page=i+1, pii_redacted=___))\n    return chunks`,
      typescript: `function transformForRag(rawContract: Record<string, any>): ContractChunk[] {\n  return (rawContract.pages ?? []).map((page: any, i: number) => ({\n    text: page.content.replace(/___/g, "[NAME]").replace(/___/g, "[EMAIL]"),\n    page: i + 1,\n    piiRedacted: ___,\n  }));\n}`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      authTokenConfigured: true,
      clientTrustScore: 75,
    },
    validate: (_before, _after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasPii =
        c.includes("pii") || c.includes("redact") || c.includes("[name]") || c.includes("[email]");
      const hasTransform = c.includes("transform") || c.includes("chunk") || c.includes("map");
      const passed = hasPii && hasTransform;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task6.success" : "fde.tasks.task6.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 3: AGENT DESIGN (Tasks 7–9)
  // ══════════════════════════════════════════════════════

  {
    id: "task-fde-7-agent-architecture",
    order: 7,
    round: 3,
    roundNameKey: "fde.rounds.agentDesign",
    titleKey: "fde.tasks.task7.title",
    conceptKey: "fde.tasks.task7.concept",
    descKey: "fde.tasks.task7.desc",
    hintKey: "fde.tasks.task7.hint",
    simpleExplanationKey: "fde.tasks.task7.simple",
    engineeringKey: "fde.tasks.task7.engineering",
    successKey: "fde.tasks.task7.success",
    workedExample: WORKED_EXAMPLES["task-fde-7-agent-architecture"],
    targetCode: {
      python: `from langgraph.graph import StateGraph, END\n\ndef create_compliance_agent():\n    workflow = StateGraph(ComplianceState)\n    \n    # Add nodes (agents in the pipeline)\n    workflow.add_node("planner", plan_contract_review)\n    workflow.add_node("retriever", rag_retrieve_clauses)\n    workflow.add_node("tool_caller", call_legal_tools)\n    workflow.add_node("validator", validate_output)\n    workflow.add_node("responder", format_compliance_report)\n    \n    # Wire edges: planner → retriever → tool_caller → validator → responder\n    workflow.set_entry_point("planner")\n    workflow.add_edge("planner", "retriever")\n    workflow.add_edge("retriever", "tool_caller")\n    workflow.add_edge("tool_caller", "validator")\n    workflow.add_edge("validator", "responder")\n    workflow.add_edge("responder", END)\n    \n    return workflow.compile()`,
      typescript: `import { StateGraph, END } from "@langchain/langgraph";\n\nconst workflow = new StateGraph<ComplianceState>({\n  channels: complianceStateSchema,\n});\n\nworkflow\n  .addNode("planner", planContractReview)\n  .addNode("retriever", ragRetrieveClauses)\n  .addNode("toolCaller", callLegalTools)\n  .addNode("validator", validateOutput)\n  .addNode("responder", formatComplianceReport)\n  .addEdge("__start__", "planner")\n  .addEdge("planner", "retriever")\n  .addEdge("retriever", "toolCaller")\n  .addEdge("toolCaller", "validator")\n  .addEdge("validator", "responder")\n  .addEdge("responder", END);\n\nexport const compiledAgent = workflow.compile();`,
    },
    clozeTemplate: {
      python: `workflow = StateGraph(ComplianceState)\n\nworkflow.add_node("___", plan_contract_review)\nworkflow.add_node("___", rag_retrieve_clauses)\nworkflow.add_node("___", validate_output)\n\nworkflow.set_entry_point("___")\nworkflow.add_edge("planner", "___")\nworkflow.add_edge("retriever", "___")`,
      typescript: `workflow\n  .addNode("___", planContractReview)\n  .addNode("___", ragRetrieveClauses)\n  .addNode("___", validateOutput)\n  .addEdge("__start__", "___")\n  .addEdge("planner", "___");`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      authTokenConfigured: true,
      clientTrustScore: 80,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasAgent =
        c.includes("stategraph") || c.includes("stategraph") ||
        c.includes("workflow") || c.includes("langgraph");
      const hasNodes = c.includes("add_node") || c.includes("addnode");
      const hasEdges = c.includes("add_edge") || c.includes("addedge");
      const passed =
        (hasAgent && hasNodes && hasEdges) ||
        (after.agentPipeline.nodes.filter((n) => n.connected).length >= 3);
      return {
        passed,
        messageKey: passed ? "fde.tasks.task7.success" : "fde.tasks.task7.hint",
      };
    },
  },

  {
    id: "task-fde-8-rag-setup",
    order: 8,
    round: 3,
    roundNameKey: "fde.rounds.agentDesign",
    titleKey: "fde.tasks.task8.title",
    conceptKey: "fde.tasks.task8.concept",
    descKey: "fde.tasks.task8.desc",
    hintKey: "fde.tasks.task8.hint",
    simpleExplanationKey: "fde.tasks.task8.simple",
    engineeringKey: "fde.tasks.task8.engineering",
    successKey: "fde.tasks.task8.success",
    workedExample: WORKED_EXAMPLES["task-fde-8-rag-setup"],
    targetCode: {
      python: `from google.cloud import aiplatform\nfrom langchain_google_vertexai import VertexAIEmbeddings\nfrom langchain_community.vectorstores import Qdrant\n\n# Initialize embedding model\nembeddings = VertexAIEmbeddings(model_name="text-embedding-004")\n\n# Configure vector DB with enterprise settings\nvectorstore = Qdrant(\n    client=qdrant_client,\n    collection_name="compliance-contracts",\n    embeddings=embeddings,\n)\n\ndef rag_retrieve_clauses(state: ComplianceState) -> ComplianceState:\n    query = state["user_query"]\n    # Retrieve top-5 most relevant chunks\n    docs = vectorstore.similarity_search(query, k=5)\n    state["context"] = "\\n\\n".join([d.page_content for d in docs])\n    return state`,
      typescript: `import { VertexAIEmbeddings } from "@langchain/google-vertexai";\nimport { QdrantVectorStore } from "@langchain/community/vectorstores/qdrant";\n\nconst embeddings = new VertexAIEmbeddings({ model: "text-embedding-004" });\nconst vectorstore = new QdrantVectorStore(embeddings, {\n  client: qdrantClient,\n  collectionName: "compliance-contracts",\n});\n\nasync function ragRetrieveClauses(state: ComplianceState) {\n  const docs = await vectorstore.similaritySearch(state.userQuery, 5);\n  return { ...state, context: docs.map(d => d.pageContent).join("\\n\\n") };\n}`,
    },
    clozeTemplate: {
      python: `embeddings = VertexAIEmbeddings(model_name="___")\n\nvectorstore = Qdrant(\n    client=qdrant_client,\n    collection_name="___",\n    embeddings=embeddings,\n)\n\ndef rag_retrieve_clauses(state):\n    docs = vectorstore.similarity_search(state["user_query"], k=___)\n    state["context"] = "\\n\\n".join([d.page_content for d in ___])\n    return state`,
      typescript: `const embeddings = new VertexAIEmbeddings({ model: "___" });\nconst vectorstore = new QdrantVectorStore(embeddings, {\n  collectionName: "___",\n});\n\nasync function ragRetrieveClauses(state: ComplianceState) {\n  const docs = await vectorstore.similaritySearch(state.userQuery, ___);\n  return { ...state, context: docs.map(d => d.___).join("\\n\\n") };\n}`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      agentPipeline: {
        nodes: [
          { id: "planner", type: "planner", label: "Planner", connected: true },
          { id: "retriever", type: "retriever", label: "RAG Retriever", connected: false },
          { id: "tool-caller", type: "tool-caller", label: "Tool Caller", connected: true },
          { id: "validator", type: "validator", label: "Output Validator", connected: true },
          { id: "responder", type: "responder", label: "Responder", connected: true },
        ],
        isValid: false,
        validationErrors: ["RAG Retriever requires a Tool Caller node"],
      },
      clientTrustScore: 80,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasRag =
        c.includes("rag") || c.includes("similarity_search") || c.includes("vectorstore") ||
        c.includes("embedding") || c.includes("retriev");
      const hasChunk = c.includes("chunk") || c.includes("k=") || c.includes("k:");
      const passed = (hasRag && hasChunk) || after.ragConfigured;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task8.success" : "fde.tasks.task8.hint",
      };
    },
  },

  {
    id: "task-fde-9-agent-tool",
    order: 9,
    round: 3,
    roundNameKey: "fde.rounds.agentDesign",
    titleKey: "fde.tasks.task9.title",
    conceptKey: "fde.tasks.task9.concept",
    descKey: "fde.tasks.task9.desc",
    hintKey: "fde.tasks.task9.hint",
    simpleExplanationKey: "fde.tasks.task9.simple",
    engineeringKey: "fde.tasks.task9.engineering",
    successKey: "fde.tasks.task9.success",
    workedExample: WORKED_EXAMPLES["task-fde-9-agent-tool"],
    targetCode: {
      python: `from langchain.tools import tool\nfrom google.cloud import aiplatform\n\n@tool\ndef check_gdpr_compliance(clause_text: str) -> str:\n    \"\"\"Check if a contract clause violates GDPR requirements.\"\"\"\n    model = aiplatform.GenerativeModel("gemini-2.0-flash-exp")\n    prompt = f\"\"\"You are a GDPR compliance expert. Analyze this clause:\n    \n{clause_text}\n\nReturn JSON: {{\"compliant\": bool, \"violations\": [str], \"risk_level\": \"LOW|MEDIUM|HIGH\"}}\"\"\"\n    response = model.generate_content(prompt)\n    return response.text\n\n@tool\ndef extract_key_dates(contract_text: str) -> dict:\n    \"\"\"Extract important dates and deadlines from contract text.\"\"\"\n    # Structured extraction with Gemini\n    ...\n\ntools = [check_gdpr_compliance, extract_key_dates]`,
      typescript: `import { tool } from "@langchain/core/tools";\nimport { z } from "zod";\n\nconst checkGdprCompliance = tool(\n  async ({ clauseText }) => {\n    const model = new ChatVertexAI({ model: "gemini-2.0-flash-exp" });\n    const result = await model.invoke(\n      \`Analyze GDPR compliance of: \${clauseText}. Return JSON with compliant, violations, risk_level.\`\n    );\n    return result.content as string;\n  },\n  {\n    name: "check_gdpr_compliance",\n    description: "Check if a clause violates GDPR",\n    schema: z.object({ clauseText: z.string() }),\n  }\n);`,
    },
    clozeTemplate: {
      python: `@tool\ndef check_gdpr_compliance(clause_text: str) -> str:\n    \"\"\"___\"\"\"\n    model = aiplatform.GenerativeModel("___")\n    prompt = f\"\"\"___\n{clause_text}\nReturn JSON: {{\"compliant\": ___, \"violations\": [...]}}\"\"\"\n    response = model.generate_content(___)\n    return response.text`,
      typescript: `const checkGdprCompliance = tool(\n  async ({ clauseText }) => {\n    const model = new ChatVertexAI({ model: "___" });\n    const result = await model.invoke(\`___: \${clauseText}\`);\n    return result.content as string;\n  },\n  { name: "___", description: "___", schema: z.object({ clauseText: z.string() }) }\n);`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      ragConfigured: true,
      vectorDbConnected: true,
      agentPipeline: {
        nodes: [
          { id: "planner", type: "planner", label: "Planner", connected: true },
          { id: "retriever", type: "retriever", label: "RAG Retriever", connected: true },
          { id: "tool-caller", type: "tool-caller", label: "Tool Caller", connected: true },
          { id: "validator", type: "validator", label: "Output Validator", connected: true },
          { id: "responder", type: "responder", label: "Responder", connected: true },
        ],
        isValid: true,
        validationErrors: [],
      },
    },
    validate: (_before, _after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasTool =
        c.includes("@tool") || c.includes("tool(") || c.includes("function_calling");
      const hasGemini = c.includes("gemini") || c.includes("generatecontent") || c.includes("generativecontent");
      const passed = hasTool && hasGemini;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task9.success" : "fde.tasks.task9.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 4: SECURITY HARDENING (Tasks 10–12)
  // ══════════════════════════════════════════════════════

  {
    id: "task-fde-10-prompt-injection",
    order: 10,
    round: 4,
    roundNameKey: "fde.rounds.security",
    titleKey: "fde.tasks.task10.title",
    conceptKey: "fde.tasks.task10.concept",
    descKey: "fde.tasks.task10.desc",
    hintKey: "fde.tasks.task10.hint",
    simpleExplanationKey: "fde.tasks.task10.simple",
    engineeringKey: "fde.tasks.task10.engineering",
    successKey: "fde.tasks.task10.success",
    workedExample: WORKED_EXAMPLES["task-fde-10-prompt-injection"],
    targetCode: {
      python: `import re\n\nPROMPT_INJECTION_PATTERNS = [\n    r"ignore (previous|all) instructions",\n    r"disregard (your|the) (system|previous)",\n    r"you are now",\n    r"act as",\n    r"jailbreak",\n    r"\\\\n---\\\\n",  # Delimiter injection\n]\n\ndef sanitize_user_input(user_input: str) -> str:\n    \"\"\"Block prompt injection attempts.\"\"\"\n    for pattern in PROMPT_INJECTION_PATTERNS:\n        if re.search(pattern, user_input, re.IGNORECASE):\n            raise ValueError(f"Potential prompt injection detected: {pattern}")\n    # Escape template markers\n    sanitized = user_input.replace("{", "{{").replace("}", "}}")\n    return sanitized[:4000]  # Hard cap on input length`,
      typescript: `const INJECTION_PATTERNS = [\n  /ignore (previous|all) instructions/i,\n  /you are now/i,\n  /act as/i,\n  /jailbreak/i,\n];\n\nfunction sanitizeUserInput(userInput: string): string {\n  for (const pattern of INJECTION_PATTERNS) {\n    if (pattern.test(userInput)) {\n      throw new Error(\`Prompt injection detected: \${pattern}\`);\n    }\n  }\n  return userInput.slice(0, 4000);\n}`,
    },
    clozeTemplate: {
      python: `PROMPT_INJECTION_PATTERNS = [\n    r"ignore ___ instructions",\n    r"you are ___",\n    r"___",\n]\n\ndef sanitize_user_input(user_input: str) -> str:\n    for pattern in PROMPT_INJECTION_PATTERNS:\n        if re.search(pattern, user_input, re.IGNORECASE):\n            raise ___(f"Prompt injection: {pattern}")\n    return user_input[:___]`,
      typescript: `const INJECTION_PATTERNS = [\n  /ignore ___ instructions/i,\n  /you are now/i,\n];\n\nfunction sanitizeUserInput(userInput: string): string {\n  for (const pattern of INJECTION_PATTERNS) {\n    if (pattern.test(userInput)) throw new Error(\`Injection: \${pattern}\`);\n  }\n  return userInput.slice(0, ___);\n}`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      ragConfigured: true,
      agentPipeline: {
        nodes: [
          { id: "planner", type: "planner", label: "Planner", connected: true },
          { id: "retriever", type: "retriever", label: "RAG Retriever", connected: true },
          { id: "tool-caller", type: "tool-caller", label: "Tool Caller", connected: true },
          { id: "validator", type: "validator", label: "Output Validator", connected: true },
          { id: "responder", type: "responder", label: "Responder", connected: true },
        ],
        isValid: true,
        validationErrors: [],
      },
      securityPosture: "critical",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasInjection =
        c.includes("injection") || c.includes("sanitize") || c.includes("pattern");
      const hasDefense =
        c.includes("raise") || c.includes("throw") || c.includes("valueerror") || c.includes("error");
      const passed = (hasInjection && hasDefense) || after.promptInjectionDefended;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task10.success" : "fde.tasks.task10.hint",
      };
    },
  },

  {
    id: "task-fde-11-iam-hardening",
    order: 11,
    round: 4,
    roundNameKey: "fde.rounds.security",
    titleKey: "fde.tasks.task11.title",
    conceptKey: "fde.tasks.task11.concept",
    descKey: "fde.tasks.task11.desc",
    hintKey: "fde.tasks.task11.hint",
    simpleExplanationKey: "fde.tasks.task11.simple",
    engineeringKey: "fde.tasks.task11.engineering",
    successKey: "fde.tasks.task11.success",
    workedExample: WORKED_EXAMPLES["task-fde-11-iam-hardening"],
    targetCode: {
      python: `# Least privilege: agent only gets read access to specific resources\nfrom google.cloud import iam_v1\n\nAGENT_SA = "gemini-compliance-agent@bank-ml.iam.gserviceaccount.com"\n\n# Required minimal roles only\nREQUIRED_ROLES = [\n    "roles/aiplatform.user",      # Use Vertex AI inference\n    "roles/storage.objectViewer", # Read contracts from GCS (NOT writer)\n    "roles/logging.logWriter",    # Write audit logs\n]\n\n# Explicitly block dangerous permissions\nDENIED = [\n    "aiplatform.models.delete",\n    "storage.buckets.delete",\n    "iam.serviceAccounts.create",\n    "resourcemanager.projects.setIamPolicy",  # No privilege escalation!\n]`,
      typescript: `const AGENT_SA = "gemini-compliance-agent@bank-ml.iam.gserviceaccount.com";\n\nconst REQUIRED_ROLES = [\n  "roles/aiplatform.user",\n  "roles/storage.objectViewer",\n  "roles/logging.logWriter",\n];\n\nconst DENIED_PERMISSIONS = [\n  "aiplatform.models.delete",\n  "storage.buckets.delete",\n  "iam.serviceAccounts.create",\n];`,
    },
    clozeTemplate: {
      python: `AGENT_SA = "___@bank-ml.iam.gserviceaccount.com"\n\nREQUIRED_ROLES = [\n    "roles/aiplatform.___",  # Use inference, NOT admin\n    "roles/storage.___",     # Read, NOT write\n    "roles/logging.___",\n]\n\nDENIED = [\n    "aiplatform.models.___",\n    "iam.serviceAccounts.___",  # No privilege escalation\n]`,
      typescript: `const REQUIRED_ROLES = [\n  "roles/aiplatform.___",\n  "roles/storage.___",\n];\nconst DENIED = [\n  "iam.serviceAccounts.___",  // No self-escalation\n];`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      promptInjectionDefended: true,
      securityChecks: INITIAL_FDE_STATE.securityChecks.map((c) =>
        c.id === "prompt-injection" ? { ...c, passed: true } : c
      ),
      securityPosture: "critical",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasLeastPriv =
        c.includes("objectviewer") || c.includes("least") || c.includes("denied") ||
        c.includes("roles/aiplatform.user");
      const hasNoEscalation =
        c.includes("serviceaccounts") || c.includes("privilege") || c.includes("setiam");
      const passed =
        (hasLeastPriv && hasNoEscalation) ||
        after.securityChecks.filter((sc) => sc.passed).length >=
          after.securityChecks.filter((sc) => sc.required).length;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task11.success" : "fde.tasks.task11.hint",
      };
    },
  },

  {
    id: "task-fde-12-audit-logging",
    order: 12,
    round: 4,
    roundNameKey: "fde.rounds.security",
    titleKey: "fde.tasks.task12.title",
    conceptKey: "fde.tasks.task12.concept",
    descKey: "fde.tasks.task12.desc",
    hintKey: "fde.tasks.task12.hint",
    simpleExplanationKey: "fde.tasks.task12.simple",
    engineeringKey: "fde.tasks.task12.engineering",
    successKey: "fde.tasks.task12.success",
    workedExample: WORKED_EXAMPLES["task-fde-12-audit-logging"],
    targetCode: {
      python: `import logging\nfrom google.cloud import logging as cloud_logging\nimport json\nfrom datetime import datetime\n\nclient = cloud_logging.Client()\nclient.setup_logging()\nlogger = logging.getLogger("compliance-agent")\n\ndef audit_log_query(user_id: str, query: str, response_summary: str):\n    \"\"\"Structured audit log for every agent interaction.\"\"\"\n    logger.info(json.dumps({\n        "timestamp": datetime.utcnow().isoformat(),\n        "event": "agent_query",\n        "user_id": user_id,\n        "query_hash": hashlib.sha256(query.encode()).hexdigest(),  # Hash, not raw query\n        "response_length": len(response_summary),\n        "model": "gemini-2.0-flash-exp",\n        "contract_count": 1,\n    }))`,
      typescript: `import { Logging } from "@google-cloud/logging";\n\nconst logging = new Logging();\nconst log = logging.log("compliance-agent-audit");\n\nasync function auditLogQuery(userId: string, queryHash: string, responseLength: number) {\n  await log.write(log.entry({\n    timestamp: new Date().toISOString(),\n    event: "agent_query",\n    userId,\n    queryHash, // Hashed, never raw query\n    responseLength,\n    model: "gemini-2.0-flash-exp",\n  }));\n}`,
    },
    clozeTemplate: {
      python: `def audit_log_query(user_id: str, query: str, response_summary: str):\n    logger.info(json.dumps({\n        "event": "___",\n        "user_id": ___,\n        "query_hash": hashlib.sha256(query.encode()).___(),  # Hash query\n        "response_length": len(___),\n    }))`,
      typescript: `async function auditLogQuery(userId: string, queryHash: string) {\n  await log.write(log.entry({\n    event: "___",\n    userId: ___,\n    queryHash: ___,  // Never log raw queries\n  }));\n}`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      promptInjectionDefended: true,
      securityChecks: INITIAL_FDE_STATE.securityChecks.map((c) =>
        ["prompt-injection", "iam-least-privilege"].includes(c.id)
          ? { ...c, passed: true }
          : c
      ),
      securityPosture: "moderate",
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasAudit =
        c.includes("audit") || c.includes("log") || c.includes("logging");
      const hasHash =
        c.includes("hash") || c.includes("sha256") || c.includes("queryhash");
      const passed =
        (hasAudit && hasHash) ||
        after.securityPosture !== "critical";
      return {
        passed,
        messageKey: passed ? "fde.tasks.task12.success" : "fde.tasks.task12.hint",
      };
    },
  },

  // ══════════════════════════════════════════════════════
  // ROUND 5: HANDOFF (Tasks 13–15)
  // ══════════════════════════════════════════════════════

  {
    id: "task-fde-13-runbook",
    order: 13,
    round: 5,
    roundNameKey: "fde.rounds.handoff",
    titleKey: "fde.tasks.task13.title",
    conceptKey: "fde.tasks.task13.concept",
    descKey: "fde.tasks.task13.desc",
    hintKey: "fde.tasks.task13.hint",
    simpleExplanationKey: "fde.tasks.task13.simple",
    engineeringKey: "fde.tasks.task13.engineering",
    successKey: "fde.tasks.task13.success",
    workedExample: WORKED_EXAMPLES["task-fde-13-runbook"],
    targetCode: {
      python: `# Runbook template — write at least 200 words covering:\n# 1. Architecture overview\n# 2. Operations runbook (start/stop, scaling)\n# 3. Troubleshooting guide\n# 4. Escalation path\n\nrunbook = \"\"\"\n# Compliance AI Agent — Operations Runbook\n\n## Architecture Overview\nThe system consists of a LangGraph multi-agent pipeline:\n- Planner → RAG Retriever → Tool Caller → Validator → Responder\n- Data: Qdrant vector DB (on-prem), GCS backup\n- Auth: Service Account + Bearer Token\n\n## Operations\n### Start the Agent\n$ gcloud run deploy compliance-agent --image gcr.io/bank-ml/compliance-agent:v1.2.3\n\n### Monitor Health\n$ gcloud monitoring dashboards describe --dashboard-id=compliance-agent\n\n## Troubleshooting\n### Error: 401 Unauthorized\n- Check COMPLIANCE_API_TOKEN env var is set\n- Rotate token if >90 days old\n\n### Error: Retrieval quality degraded\n- Check vector DB: curl https://qdrant.internal/health\n- Re-index if drift score >0.15\n\n## Escalation\n1. On-call: Slack #ml-alerts → @ml-oncall\n2. P0: Page via PagerDuty — ml-sre-oncall\n\"\"\"`,
      typescript: `const runbook = \`\n# Compliance AI Agent — Operations Runbook\n\n## Architecture Overview\nLangGraph pipeline: Planner → RAG Retriever → Tool Caller → Validator → Responder\n\n## Operations Runbook\n\`\`\`bash\n# Deploy\ngcloud run deploy compliance-agent --image gcr.io/bank-ml/agent:v1.2.3\n\n# Health check\ncurl https://compliance-agent.bank.internal/health\n\`\`\`\n\n## Troubleshooting\n- 401 errors: rotate COMPLIANCE_API_TOKEN\n- Slow responses: check Qdrant index health\n\n## Escalation: #ml-alerts → PagerDuty\n\`;`,
    },
    clozeTemplate: {
      python: `runbook = \"\"\"\n# Compliance AI Agent — Operations Runbook\n\n## Architecture Overview\n___\n\n## Operations\n### Start\n$ ___\n\n## Troubleshooting\n### Error: 401\n- ___\n\n## Escalation\n1. Slack: ___\n2. PagerDuty: ___\n\"\"\"`,
      typescript: `const runbook = \`\n# Compliance AI Agent Runbook\n\n## Architecture\n___\n\n## Operations Runbook\n\`\`\`bash\n___\n\`\`\`\n\n## Troubleshooting\n___\n\`;`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      ragConfigured: true,
      agentPipeline: {
        nodes: INITIAL_FDE_STATE.agentPipeline.nodes.map((n) => ({ ...n, connected: true })),
        isValid: true,
        validationErrors: [],
      },
      securityPosture: "hardened",
      promptInjectionDefended: true,
      clientTrustScore: 90,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasArch = c.includes("architecture") || c.includes("pipeline") || c.includes("overview");
      const hasTrouble = c.includes("troubleshoot") || c.includes("error") || c.includes("401");
      const hasOps = c.includes("deploy") || c.includes("runbook") || c.includes("operations");
      const passed = (hasArch && hasTrouble && hasOps) || after.runbookWritten;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task13.success" : "fde.tasks.task13.hint",
      };
    },
  },

  {
    id: "task-fde-14-knowledge-transfer",
    order: 14,
    round: 5,
    roundNameKey: "fde.rounds.handoff",
    titleKey: "fde.tasks.task14.title",
    conceptKey: "fde.tasks.task14.concept",
    descKey: "fde.tasks.task14.desc",
    hintKey: "fde.tasks.task14.hint",
    simpleExplanationKey: "fde.tasks.task14.simple",
    engineeringKey: "fde.tasks.task14.engineering",
    successKey: "fde.tasks.task14.success",
    workedExample: WORKED_EXAMPLES["task-fde-14-knowledge-transfer"],
    dialogueTree: {
      npcOpeningKey: "fde.dialogue.task14.opening",
      choices: [
        {
          id: "choice-14",
          npcPromptKey: "fde.dialogue.task14.prompt1",
          options: [
            {
              id: "a",
              textKey: "fde.dialogue.task14.option1a",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task14.consequence1a",
              xpGain: 0,
            },
            {
              id: "b",
              textKey: "fde.dialogue.task14.option1b",
              isCorrect: true,
              consequenceKey: "fde.dialogue.task14.consequence1b",
              xpGain: 40,
            },
            {
              id: "c",
              textKey: "fde.dialogue.task14.option1c",
              isCorrect: false,
              consequenceKey: "fde.dialogue.task14.consequence1c",
              xpGain: 0,
            },
          ],
        },
      ],
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      ragConfigured: true,
      runbookWritten: true,
      documentationScore: 85,
      agentPipeline: {
        nodes: INITIAL_FDE_STATE.agentPipeline.nodes.map((n) => ({ ...n, connected: true })),
        isValid: true,
        validationErrors: [],
      },
      securityPosture: "hardened",
    },
    validate: (_before, after, _result) => {
      const passed = after.correctChoicesMade > _before.correctChoicesMade || after.clientTrustScore >= 85;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task14.success" : "fde.tasks.task14.hint",
      };
    },
  },

  {
    id: "task-fde-15-final-handoff",
    order: 15,
    round: 5,
    roundNameKey: "fde.rounds.handoff",
    titleKey: "fde.tasks.task15.title",
    conceptKey: "fde.tasks.task15.concept",
    descKey: "fde.tasks.task15.desc",
    hintKey: "fde.tasks.task15.hint",
    simpleExplanationKey: "fde.tasks.task15.simple",
    engineeringKey: "fde.tasks.task15.engineering",
    successKey: "fde.tasks.task15.success",
    workedExample: WORKED_EXAMPLES["task-fde-15-final-handoff"],
    targetCode: {
      python: `# Final handoff checklist — complete all items\nhandoff = {\n    "runbook_url": "https://confluence.bank.internal/compliance-agent-runbook",\n    "code_repo": "https://github.com/bank-ml/compliance-agent",\n    "monitoring_dashboard": "https://console.cloud.google.com/monitoring/dashboards/compliance",\n    "oncall_rotation": "#ml-oncall via PagerDuty",\n    "security_review": "PASSED — reviewed by InfoSec 2026-09-15",\n    "load_test_results": "P99=142ms @ 500 RPS (SLO: <200ms)",\n    "training_session": "Bank ML team — 2026-09-17 — 2h hands-on",\n    "acceptance_sign_off": "CTO sign-off: John Smith <jsmith@bank.com>",\n}`,
      typescript: `const handoff = {\n  runbookUrl: "https://confluence.bank.internal/compliance-agent-runbook",\n  codeRepo: "https://github.com/bank-ml/compliance-agent",\n  monitoringDashboard: "https://console.cloud.google.com/monitoring",\n  oncallRotation: "#ml-oncall via PagerDuty",\n  securityReview: "PASSED",\n  loadTestResults: "P99=142ms @ 500 RPS",\n  trainingSessions: "2h hands-on with ML team",\n  acceptanceSignOff: "CTO: jsmith@bank.com",\n};`,
    },
    clozeTemplate: {
      python: `handoff = {\n    "runbook_url": "https://___",\n    "code_repo": "https://___",\n    "monitoring_dashboard": "https://___",\n    "security_review": "PASSED — reviewed by ___",\n    "load_test_results": "P99=___ms @ ___ RPS",\n    "acceptance_sign_off": "___",\n}`,
      typescript: `const handoff = {\n  runbookUrl: "https://___",\n  securityReview: "___",\n  loadTestResults: "P99=___ms",\n  acceptanceSignOff: "___",\n};`,
    },
    initialState: {
      ...INITIAL_FDE_STATE,
      discoveryComplete: true,
      legacyApiConnected: true,
      ragConfigured: true,
      runbookWritten: true,
      documentationScore: 85,
      agentPipeline: {
        nodes: INITIAL_FDE_STATE.agentPipeline.nodes.map((n) => ({ ...n, connected: true })),
        isValid: true,
        validationErrors: [],
      },
      securityPosture: "hardened",
      clientTrustScore: 90,
    },
    validate: (_before, after, _result, code = "") => {
      const c = code.toLowerCase();
      const hasHandoff =
        c.includes("runbook") || c.includes("handoff") || c.includes("sign") || c.includes("sign_off");
      const hasMetrics = c.includes("p99") || c.includes("load_test") || c.includes("slo");
      const passed = (hasHandoff && hasMetrics) || after.handoffComplete;
      return {
        passed,
        messageKey: passed ? "fde.tasks.task15.success" : "fde.tasks.task15.hint",
      };
    },
  },
];
