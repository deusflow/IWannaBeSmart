/**
 * @file packages/i18n/src/didacticsData.ts
 * @description Multilingual translations (EN, DA) for Task Didactic Context
 * across all active stations.
 */

export interface DidacticTranslation {
  whyThisCode: {
    csharp: string;
    go: string;
  };
  primitiveMemoryNote?: {
    csharp: string;
    go: string;
  };
  canvasWiring?: string;
  architectureHint?: string;
}

export const TASK_DIDACTIC_EN: Record<string, DidacticTranslation> = {
  "task-0-1-power-on": {
    "whyThisCode": {
      "csharp": "We access the tv object via dot . (member access) and call PowerOn(). The parentheses () instruct the processor to execute the action immediately, and the semicolon ; terminates the statement in C#.",
      "go": "On the tv object, we call the exported PowerOn() method. In Go, the compiler automatically inserts semicolons at end of lines."
    },
    "primitiveMemoryNote": {
      "csharp": "The tv object resides on the Heap. Calling a parameterless method () allocates no argument memory — it only signals the power relay to close.",
      "go": "The tv struct is passed by pointer. Calling the method updates the power bit in the hardware struct."
    }
  },
  "task-0-2-types": {
    "whyThisCode": {
      "csharp": "The runtime enforces strict type checking: SetChannel(1) accepts an integer int, while SetLabel(\"NEWS\") requires a string literal.",
      "go": "Go strict typing requires passing a raw numeric literal 1 for the tuner, and double-quoted \"NEWS\" for the label."
    },
    "primitiveMemoryNote": {
      "csharp": "Number 1 (Integer) is written WITHOUT quotes and placed in a 32-bit register (4 bytes). Text \"NEWS\" (String) is an immutable UTF-16 character array on the Heap.",
      "go": "1 is an int literal stored in stack/register. \"NEWS\" is an immutable byte slice on the Heap."
    }
  },
  "task-0-3-sequential": {
    "whyThisCode": {
      "csharp": "Instructions execute sequentially from top to bottom: power must be turned on (PowerOn()) before the tuner can lock onto channel 2 (SetChannel(2)).",
      "go": "Sequential execution: first power on with tv.PowerOn(), then tune with tv.SetChannel(2)."
    },
    "primitiveMemoryNote": {
      "csharp": "Hardware dependency: tuner communication bus is unpowered before PowerOn(). Reversing order ignores the channel switch.",
      "go": "Execution sequence drives bus signals clocked by CPU cycles."
    }
  },
  "task-1-assignment": {
    "whyThisCode": {
      "csharp": "The = operator writes into memory. Value true on the right is stored into property tv.IsOn on the left.",
      "go": "Operator = sets boolean field IsOn on tv struct instance to true."
    },
    "primitiveMemoryNote": {
      "csharp": "bool occupies 1 byte in memory (true = 0x01, false = 0x00). Do not confuse assignment = with equality comparison ==.",
      "go": "bool stores a single truth flag inline without Heap allocation."
    }
  },
  "task-2-branching": {
    "whyThisCode": {
      "csharp": "The if statement evaluates condition. If tv.IsOn is true, the power toggle runs. This models physical toggle switch behavior.",
      "go": "Branching if tv.IsOn: Go conditions do not require parentheses, but the body must use curly braces {}."
    },
    "primitiveMemoryNote": {
      "csharp": "CPU branch prediction: if condition evaluates to false, processor skips the body within curly braces {}.",
      "go": "Compiler translates if into hardware JMP based on register FLAGS."
    }
  },
  "task-variable-mutation": {
    "whyThisCode": {
      "csharp": "We read the current channel, increment by 1 (channel++), and update the tuner.",
      "go": "Read current channel value and increment counter to select the next frequency multiplex."
    }
  },
  "task-boundary-guard": {
    "whyThisCode": {
      "csharp": "Guard clause checks if channel exceeds upper limit 99. If so, return early to prevent illegal tuning states.",
      "go": "if channel > 99 { return }: early return protects system invariants."
    }
  },
  "task-for-loop": {
    "whyThisCode": {
      "csharp": "A for loop iterates over channel numbers 1 through 5, tuning each station in sequence.",
      "go": "Standard for i := 1; i <= 5; i++ scans channels sequentially."
    }
  },
  "task-async-loop": {
    "whyThisCode": {
      "csharp": "Asynchronous loop with await Task.Delay simulates non-blocking timer ticks between channel scans.",
      "go": "time.Sleep inside loop delays execution without blocking OS threads."
    }
  },
  "task-class-instance": {
    "whyThisCode": {
      "csharp": "new PowerCommand() allocates an object on the Heap and calls its constructor.",
      "go": "PowerCommand{} instantiates a struct in Go."
    }
  },
  "task-method-return": {
    "whyThisCode": {
      "csharp": "Methods declare return types (e.g. int, bool) and return computed values using the return keyword.",
      "go": "func (tv *TV) GetChannel() int returns the integer channel state."
    }
  },
  "task-null-reference": {
    "whyThisCode": {
      "csharp": "Checking cmd != null protects against NullReferenceException when dispatching unassigned references.",
      "go": "if cmd != nil prevents nil pointer dereference panics."
    }
  },
  "task-function-encapsulation": {
    "whyThisCode": {
      "csharp": "Encapsulating volume clamps invalid inputs (0 to 100) before changing internal hardware registers.",
      "go": "Method encapsulation protects struct invariants from external corruption."
    }
  },
  "task-antipattern-god-object": {
    "whyThisCode": {
      "csharp": "Refactoring a monolithic God Object by delegating button handling to separate command classes.",
      "go": "Separate duties into focused structs adhering to Single Responsibility Principle."
    }
  },
  "task-anti-pattern-god-switch": {
    "whyThisCode": {
      "csharp": "Monolithic switch(button) violates Open-Closed Principle. Every new button requires modifying this single file.",
      "go": "Procedural switch button violates Open-Closed. We replace it with polymorphic commands."
    },
    "canvasWiring": "Monolithic controller keeps all buttons in one file without separation of concerns.",
    "architectureHint": "God Switch anti-pattern: changes risk breaking adjacent branches. Replaced with polymorphic commands."
  },
  "task-interface-polymorphism": {
    "whyThisCode": {
      "csharp": "We separate contract from implementation: IRemoteCommand command = new CalcCommand(); and invoke polymorphic command.Execute();.",
      "go": "In Go, command := CalcCommand{} satisfies IRemoteCommand automatically via duck typing."
    },
    "canvasWiring": "Node [IRemoteCommand] (out-execute port) connects to CommandHandler input port of [TVController].",
    "architectureHint": "Controller does not know which concrete button is connected. It sees the universal IRemoteCommand socket and presses Execute()."
  },
  "task-di-container": {
    "whyThisCode": {
      "csharp": "Inversion of Control (IoC): instead of newing up instances inside the controller, we register contract->implementation in DI: services.AddTransient<IRemoteCommand, CalcCommand>();.",
      "go": "Register dependency in container: container.Register(\"calc\", NewCalcCommand()). The container resolves instances on demand."
    },
    "canvasWiring": "Container configures instance factory between [IRemoteCommand] and [CalcCommand].",
    "architectureHint": "Dependency Injection removes tight coupling: modifying CalcCommand leaves remote control code untouched."
  },
  "task-command-registry": {
    "whyThisCode": {
      "csharp": "Architectural peak: replacing massive switch with Dictionary<string, IRemoteCommand>. Look up and execute via registry[button].Execute() in O(1) time!",
      "go": "Using hash map map[string]IRemoteCommand. Commands are stored as plugins: registry[button].Execute() runs in O(1)."
    },
    "canvasWiring": "Dynamic button registry connected to Architecture Studio command execution bus.",
    "architectureHint": "Open-Closed Principle: open for extension (add 1,000 buttons without touching core) and closed for modification!"
  },
  "task-pos-guard-clause": {
    "whyThisCode": {
      "csharp": "Bank balance guard: if amount > balance, immediately set status = \"DECLINED\" and return early to prevent overdraft.",
      "go": "if amount > balance stops the transaction before mutating account balance state."
    },
    "canvasWiring": "Transaction input filter preceding acquirer gateway.",
    "architectureHint": "Early Return eliminates deep nesting and guarantees account balance integrity."
  },
  "task-pos-fee-calculation": {
    "whyThisCode": {
      "csharp": "Calculate total cost: add fixed bank fee to amount, deduct totalAmount atomically from balance, and confirm status = \"APPROVED\".",
      "go": "Compute totalAmount = amount + fee and deduct via balance -= totalAmount with status = \"APPROVED\"."
    }
  },
  "task-pos-pin-lockout": {
    "whyThisCode": {
      "csharp": "Hardware PIN brute-force defense: increment failedAttempts on invalid PIN; lock terminal (isLocked = true, status = \"BLOCKED\") at 3 attempts.",
      "go": "failedAttempts++ on invalid PIN; lock terminal when reaching 3 attempts."
    }
  },
  "task-pos-batch-settlement": {
    "whyThisCode": {
      "csharp": "Daily reconciliation: iterate over transactions array with a for loop, accumulate sum into dailyTotal, and mark status = \"SETTLED\".",
      "go": "Loop through transactions to accumulate batch total and finalize settlement status."
    }
  },
  "task-pos-interface-polymorphism": {
    "whyThisCode": {
      "csharp": "Decouple terminal from banking network: call uniform interface IPaymentGateway.Charge(amount). Decline if authorization fails.",
      "go": "Invoke IPaymentGateway.Charge via interface polymorphism. Decouples POS logic from payment provider."
    }
  },
  "task-pos-dependency-injection": {
    "whyThisCode": {
      "csharp": "Register banking provider in IoC container: services.AddScoped<IPaymentGateway, DankortGateway>(). Enables hot-swapping providers.",
      "go": "Bind payment gateway interface to DankortGateway in IoC container."
    }
  },
  "task-debug-runaway-loop": {
    "whyThisCode": {
      "csharp": "Prevent infinite loops: verify loop condition channel < 10 and ensure counter advances with i++.",
      "go": "Ensure loop condition terminates and variable mutates each iteration."
    }
  },
  "task-debug-off-by-one-overflow": {
    "whyThisCode": {
      "csharp": "Array boundary protection: change i <= length to i < length to prevent IndexOutOfRangeException.",
      "go": "Use strict less-than (<) when iterating slices up to len(items)."
    }
  },
  "task-pos-double-deduction-bug": {
    "whyThisCode": {
      "csharp": "Reconcile double fee deduction: remove redundant balance -= fee since fee is already included in totalAmount.",
      "go": "Remove redundant fee deduction line to maintain atomic transaction balance."
    }
  },
  "task-api-1-heartbeat": {
    "whyThisCode": {
      "csharp": "Register GET /health endpoint returning JSON status 200 OK via Results.Ok(new { status = \"UP\" }).",
      "go": "Register HTTP health handler returning JSON {\"status\":\"UP\"}."
    }
  },
  "task-api-2-path-params": {
    "whyThisCode": {
      "csharp": "Route parameters: map /orders/{id} where id is extracted from the URL and passed to the handler.",
      "go": "Extract route path parameter id and fetch corresponding order record."
    }
  },
  "task-api-3-dto-validation": {
    "whyThisCode": {
      "csharp": "DTO validation guard: if amount <= 0, return Results.BadRequest(\"Invalid amount\") with HTTP 400.",
      "go": "Validate payload fields before processing, returning HTTP 400 Bad Request on error."
    }
  },
  "task-api-4-bearer-auth": {
    "whyThisCode": {
      "csharp": "Bearer token authentication: extract Authorization header and return Results.Unauthorized() on failure.",
      "go": "Validate Bearer token header, rejecting missing or invalid tokens with HTTP 401."
    }
  },
  "task-api-5-client-consumer": {
    "whyThisCode": {
      "csharp": "Consume upstream HTTP APIs: send POST request with JSON payload using client.PostAsJsonAsync.",
      "go": "Send HTTP POST request with JSON payload and deserialize response body."
    }
  },
  "task-api-6-resilient-retry": {
    "whyThisCode": {
      "csharp": "Resilience policy: wrap HTTP calls with Polly retry pipeline to absorb transient 504 timeouts.",
      "go": "Implement retry loop with exponential backoff for transient network errors."
    }
  }
,
  "task-git-1-genesis": {
    "whyThisCode": {
      "csharp": "Execute Git plumbing via Process.Start: stage tracked files (git add) and create the root genesis commit with a cryptographic SHA-1 hash.",
      "go": "Invoke exec.Command in Go to initialize device telemetry repository and write the genesis commit."
    },
    "primitiveMemoryNote": {
      "csharp": "Git calculates SHA-1 / SHA-256 tree hashes based on raw payload bytes, storing immutable objects in .git/objects without loading everything into RAM.",
      "go": "Git objects are stored as zlib-compressed byte streams keyed by 20-byte object IDs."
    }
  },
  "task-git-4-conflict": {
    "whyThisCode": {
      "csharp": "Resolve Git merge conflicts: manually reconcile divergent branches by keeping verified upstream changes and cleanly deleting conflict markers (<<<<<<<, =======, >>>>>>>).",
      "go": "Reconcile divergent file heads and commit resolved state to finalize the merge."
    },
    "primitiveMemoryNote": {
      "csharp": "During merge conflicts, Git holds three stages in the index: common ancestor (stage 1), target branch (stage 2), and source branch (stage 3).",
      "go": "Index stages 1, 2, and 3 track file versions until stage resolution generates a unified hash."
    }
  },
  "task-git-5-rebase": {
    "whyThisCode": {
      "csharp": "Git rebase workflow: replay topic commits on top of updated origin/main to preserve a clean, linear commit history without extraneous merge bubbles.",
      "go": "Linearize commit graph history via rebase before opening upstream pull request."
    },
    "primitiveMemoryNote": {
      "csharp": "Rebasing creates brand-new commit hashes for each replayed commit because their parent SHA pointers are rewritten.",
      "go": "Rebase rewrites parent pointers for each commit, updating downstream SHA references."
    }
  },
  "task-bandit-4-sql-injection": {
    "whyThisCode": {
      "csharp": "Defense against SQL Injection: replace dynamic string interpolation with parameterized SqlCommand queries to neutralize SQL syntax manipulation.",
      "go": "Use database parameter placeholders (, ?) to prevent malicious input from altering the AST parse tree."
    },
    "primitiveMemoryNote": {
      "csharp": "Parameterized queries separate the query grammar from data arguments in memory, ensuring input is treated purely as a literal value.",
      "go": "Parameters are sent separately to the database engine, preventing user input from executing as SQL code."
    }
  },
  "task-bandit-5-rate-limiter": {
    "whyThisCode": {
      "csharp": "Implement Token Bucket rate limiting: enforce maximum requests per second per IP to shield endpoints against credential stuffing and brute-force DoS.",
      "go": "Enforce request rate limiting using time.Ticker and buffered concurrency tokens."
    },
    "primitiveMemoryNote": {
      "csharp": "Tokens refill at fixed clock intervals in an atomic memory register (Interlocked.Increment / Decrement) with zero lock contention.",
      "go": "Token bucket uses atomic memory registers to validate incoming traffic without spinlock contention."
    }
  },
  "task-vertex-3-pipeline-yaml": {
    "whyThisCode": {
      "csharp": "Configure declarative ML training pipelines in Kubeflow / Vertex AI YAML: wire dataset extraction, training container, and model evaluation steps.",
      "go": "Define declarative machine learning workflow DAG specifying container artifacts and compute requirements."
    },
    "primitiveMemoryNote": {
      "csharp": "Pipeline specs compile into immutable cloud execution graphs with input/output artifact URIs tracked in Google Cloud Storage.",
      "go": "Kubeflow specifications are parsed into a directed acyclic graph (DAG) in orchestrator memory."
    }
  },
  "task-vertex-13-drift-detection": {
    "whyThisCode": {
      "csharp": "Data Drift monitoring: compute L-Infinity distance between baseline training distributions and incoming production inference features to detect model degradation.",
      "go": "Track real-time feature skew and trigger automated model retraining when divergence exceeds threshold."
    },
    "primitiveMemoryNote": {
      "csharp": "Statistical histograms are kept in sliding time window buffers (60s) to detect statistical skew with minimal heap footprint.",
      "go": "Data distribution histograms are updated in memory buffers to detect anomalies in real time."
    }
  },
  "task-fde-7-agent-architecture": {
    "whyThisCode": {
      "csharp": "Autonomous AI Agent architecture: implement ReAct loop dividing cognitive flow into Perception (observe state), Planning (reasoning), and Tool Execution.",
      "go": "Orchestrate agent reasoning loop with deterministic tool calling boundaries and circuit breakers."
    },
    "primitiveMemoryNote": {
      "csharp": "Agent scratchpad memory resides in an ephemeral dialogue context, pruned via sliding token window to maintain strict prompt limits.",
      "go": "Agent working memory is maintained in compressed token arrays to respect the model context window."
    }
  },
  "task-fde-10-prompt-injection": {
    "whyThisCode": {
      "csharp": "Shield against Prompt Injection (OWASP LLM01): isolate user input within XML tags, enforce system prompt precedence, and sanitize output before database commits.",
      "go": "Filter and semantically analyze LLM prompts to prevent prompt leak and unauthorized instruction overrides."
    },
    "primitiveMemoryNote": {
      "csharp": "Input tokens are analyzed through deterministic regex guards and dual-model classification filters before reaching the core inference engine.",
      "go": "Prompt token validation is performed in memory buffers before dispatching requests to LLM APIs."
    }
  },
  "task-rag-1-chunking-overlap": {
    "whyThisCode": {
      "csharp": "Document chunking with sliding window overlap: divide source corpus into 500-token chunks with 50-token overlap to preserve semantic continuity across boundaries.",
      "go": "Segment text documents with configurable chunk overlap for optimal vector embedding generation."
    },
    "primitiveMemoryNote": {
      "csharp": "Tokens are processed as contiguous spans in ReadOnlySpan<char> memory buffers, eliminating superfluous string allocations during splitting.",
      "go": "Document snippets are processed as slices in memory to minimize memory copying."
    }
  },
  "task-rag-4-hybrid-rrf": {
    "whyThisCode": {
      "csharp": "Hybrid search via Reciprocal Rank Fusion (RRF): combine sparse lexical results (BM25) and dense semantic vector rankings into a unified relevance score.",
      "go": "Compute reciprocal rank fusion scores to balance exact keyword matching with semantic embedding search."
    },
    "primitiveMemoryNote": {
      "csharp": "Score calculation uses 1.0 / (k + rank) where k=60; results are stored in a priority queue (Min-Heap) for top-K retrieval in O(N log K).",
      "go": "Top-K documents are sorted in a compact memory heap for lowest query latency."
    }
  },
  "task-cyber-4-syn-flood-detector": {
    "whyThisCode": {
      "csharp": "Detect TCP SYN Flood attacks: track half-open connection ratio and alert when pending handshake queue backlog exceeds capacity threshold.",
      "go": "Monitor raw network socket packets to identify abnormal bursts of TCP SYN flags without matching ACK responses."
    },
    "primitiveMemoryNote": {
      "csharp": "Packet header flags (SYN=0x02, ACK=0x10) are unpacked via bitwise masking in a circular ring buffer without locking.",
      "go": "Network packet flags are evaluated with bitwise masks in a ring buffer for low CPU footprint."
    }
  },
  "task-cyber-8-nist-containment": {
    "whyThisCode": {
      "csharp": "Implement NIST SP 800-61 incident containment: isolate compromised hosts via firewall rules, revoke session tokens, and preserve forensic memory logs.",
      "go": "Enforce network host isolation, terminate active malicious connections, and write tamper-proof audit trails."
    },
    "primitiveMemoryNote": {
      "csharp": "Forensic state and network ACLs are written to an append-only audit stream with cryptographic checksums for chain of custody.",
      "go": "Forensic event data is recorded with cryptographic timestamps to safeguard the chain of custody."
    }
  },
};

export const TASK_DIDACTIC_DA: Record<string, DidacticTranslation> = {
  "task-0-1-power-on": {
    "whyThisCode": {
      "csharp": "Vi tilgår tv-objektet via punktum . (medlemsadgang) og kalder PowerOn(). Parenteserne () instruerer processoren om at udføre handlingen straks, og semikolon ; afslutter sætningen i C#.",
      "go": "På tv-objektet kalder vi den eksporterede PowerOn() metode. I Go indsætter compileren automatisk semikolon i slutningen af linjer."
    },
    "primitiveMemoryNote": {
      "csharp": "tv-objektet befinder sig på Heapen. Kald af en parameterløs metode () allokerer ingen argumenthukommelse — det slutter blot strømrelæet.",
      "go": "tv-strukturen sendes med pointer. Kald af metoden opdaterer strøm-bitten i hardwarestrukturen."
    }
  },
  "task-0-2-types": {
    "whyThisCode": {
      "csharp": "Kørslen håndhæver streng typekontrol: SetChannel(1) modtager et heltal int, mens SetLabel(\"NEWS\") kræver en streng.",
      "go": "Go streng typestyring kræver at sende et numerisk heltal 1 for tuneren, og anførselstegn \"NEWS\" for teksten."
    },
    "primitiveMemoryNote": {
      "csharp": "Tallet 1 (Integer) skrives UDEN anførselstegn i et 32-bit register (4 bytes). Teksten \"NEWS\" (String) er et uforanderligt UTF-16 array på Heapen.",
      "go": "1 er et int tal i stak/register. \"NEWS\" er et uforanderligt byte-slice på Heapen."
    }
  },
  "task-0-3-sequential": {
    "whyThisCode": {
      "csharp": "Instruktioner udføres sekventielt fra top til bund: strømmen skal tændes (PowerOn()), før tuneren kan låse på kanal 2 (SetChannel(2)).",
      "go": "Sekventiel udførelse: tænd først med tv.PowerOn(), skift derefter med tv.SetChannel(2)."
    },
    "primitiveMemoryNote": {
      "csharp": "Hardwareafhængighed: tunerens kommunikationsbus er uden strøm før PowerOn(). Byt om på rækkefølgen og kanalvalget ignoreres.",
      "go": "Udførelsesrækkefølgen styrer bussignaler styret af processorens clockfrekvens."
    }
  },
  "task-1-assignment": {
    "whyThisCode": {
      "csharp": "Tildelingsoperatoren = skriver til hukommelsen. Værdien true til højre gemmes i tv.IsOn til venstre.",
      "go": "Operatoren = sætter det boolske felt IsOn i tv-strukturen til true."
    },
    "primitiveMemoryNote": {
      "csharp": "bool optager 1 byte i hukommelsen (true = 0x01, false = 0x00). Forveksl ikke tildeling = med sammenligning ==.",
      "go": "bool gemmer et enkelt sandhedsflag direkte i strukturens hukommelse."
    }
  },
  "task-2-branching": {
    "whyThisCode": {
      "csharp": "If-sætningen vurderer betingelsen. Hvis tv.IsOn er true, skifter strømmen. Dette modellerer en fysisk vippekontakt.",
      "go": "Forgrening if tv.IsOn: Go betingelser kræver ikke parenteser, men kroppen skal bruge krøllede parenteser {}."
    },
    "primitiveMemoryNote": {
      "csharp": "CPU branch prediction: hvis betingelsen er falsk, springer processoren blokken i de krøllede parenteser {} over.",
      "go": "Compileren oversætter if til et hardware JMP baseret på registrets FLAGS."
    }
  },
  "task-variable-mutation": {
    "whyThisCode": {
      "csharp": "Vi læser den aktuelle kanal, øger med 1 (channel++), og opdaterer tuneren.",
      "go": "Læs den aktuelle kanal og øg tælleren for at vælge næste frekvens."
    }
  },
  "task-boundary-guard": {
    "whyThisCode": {
      "csharp": "Guard clause kontrollerer om kanalen overstiger 99. Hvis ja, lav tidlig returnering for at undgå ugyldig tilstand.",
      "go": "if channel > 99 { return }: tidlig returnering beskytter systeminvarianter."
    }
  },
  "task-for-loop": {
    "whyThisCode": {
      "csharp": "En for-løkke itererer over kanalnumrene 1 til 5 og tuner hver station i rækkefølge.",
      "go": "Standard for i := 1; i <= 5; i++ scanner kanaler sekventielt."
    }
  },
  "task-async-loop": {
    "whyThisCode": {
      "csharp": "Asynkron løkke med await Task.Delay simulerer ikke-blokerende pauser mellem kanalscanninger.",
      "go": "time.Sleep i løkken pauser afviklingen uden at blokere OS-tråde."
    }
  },
  "task-class-instance": {
    "whyThisCode": {
      "csharp": "new PowerCommand() allokerer et objekt på Heapen og kalder dets konstruktør.",
      "go": "PowerCommand{} opretter en instans af en struct i Go."
    }
  },
  "task-method-return": {
    "whyThisCode": {
      "csharp": "Metoder erklærer returtyper (f.eks. int, bool) og returnerer beregnede værdier med return-nøgleordet.",
      "go": "func (tv *TV) GetChannel() int returnerer det aktuelle kanalnummer."
    }
  },
  "task-null-reference": {
    "whyThisCode": {
      "csharp": "Kontrol af cmd != null beskytter mod NullReferenceException ved udførelse af utilknyttede referencer.",
      "go": "if cmd != nil forhindrer nil pointer dereference nedbrud."
    }
  },
  "task-function-encapsulation": {
    "whyThisCode": {
      "csharp": "Indkapsling af lydstyrke validerer input (0 til 100) før interne hardwareregistre ændres.",
      "go": "Metodeindkapsling beskytter strukturens invarianter mod udefrakommende fejl."
    }
  },
  "task-antipattern-god-object": {
    "whyThisCode": {
      "csharp": "Refaktorering af et monolitisk God Object ved at delegere knaphåndtering til separate kommandoklasser.",
      "go": "Opdel opgaver i fokuserede structs i overensstemmelse med Single Responsibility Principle."
    }
  },
  "task-anti-pattern-god-switch": {
    "whyThisCode": {
      "csharp": "Monolitisk switch(button) bryder Open-Closed Principle. Hver ny knap kræver ændring af denne ene fil.",
      "go": "Procedurel switch button bryder Open-Closed. Vi erstatter den med polymorfe kommandoer."
    },
    "canvasWiring": "Monolitisk controller samler alle knapper i én fil uden ansvarsadskillelse.",
    "architectureHint": "God Switch anti-mønster: ændringer risikerer at ødelægge tilstødende grene. Erstattet med polymorfe kommandoer."
  },
  "task-interface-polymorphism": {
    "whyThisCode": {
      "csharp": "Vi adskiller kontrakt fra implementering: IRemoteCommand command = new CalcCommand(); og kalder polymorf command.Execute();.",
      "go": "I Go opfylder command := CalcCommand{} IRemoteCommand automatisk via duck typing."
    },
    "canvasWiring": "Node [IRemoteCommand] (out-execute port) forbindes til CommandHandler indgangsporten på [TVController].",
    "architectureHint": "Controlleren ved ikke, hvilken knap der er tilsluttet. Den ser kun det universelle IRemoteCommand stik og trykker Execute()."
  },
  "task-di-container": {
    "whyThisCode": {
      "csharp": "Inversion of Control (IoC): i stedet for new i controlleren registrerer vi kontrakt->implementering i DI: services.AddTransient<IRemoteCommand, CalcCommand>();.",
      "go": "Registrer afhængighed i containeren: container.Register(\"calc\", NewCalcCommand()). Containeren leverer instansen ved behov."
    },
    "canvasWiring": "Containeren konfigurerer instansfabrikken mellem [IRemoteCommand] og [CalcCommand].",
    "architectureHint": "Dependency Injection fjerner tæt kobling: ændring af CalcCommand rører overhovedet ikke fjernbetjeningskoden."
  },
  "task-command-registry": {
    "whyThisCode": {
      "csharp": "Arkitektonisk højdepunkt: erstat kæmpe switch med Dictionary<string, IRemoteCommand>. Slå op og udfør med registry[button].Execute() i O(1) tid!",
      "go": "Brug af hash-map map[string]IRemoteCommand. Kommandoer gemmes som plugins: registry[button].Execute() kører i O(1)."
    },
    "canvasWiring": "Dynamisk knapregister forbundet til Architecture Studio kommandobussen.",
    "architectureHint": "Open-Closed Principle: åben for udvidelse (tilføj 1.000 knapper uden at røre kernen) og lukket for modifikation!"
  },
  "task-pos-guard-clause": {
    "whyThisCode": {
      "csharp": "Bankbalancens værn: hvis amount > balance, sæt straks status = \"DECLINED\" og lav tidlig return for at undgå overtræk.",
      "go": "if amount > balance stopper transaktionen før bankkontoens saldo ændres."
    },
    "canvasWiring": "Transaktionsindgangsfilter før indløsningsgatewayen.",
    "architectureHint": "Tidlig returnering (Early Return) fjerner dyb indlejring og garanterer regnskabsmæssig balance."
  },
  "task-pos-fee-calculation": {
    "whyThisCode": {
      "csharp": "Beregn samlede omkostninger: læg bankgebyr til beløb, træk totalAmount fra saldoen, og bekræft status = \"APPROVED\".",
      "go": "Beregn totalAmount = amount + fee og træk fra via balance -= totalAmount med status = \"APPROVED\"."
    }
  },
  "task-pos-pin-lockout": {
    "whyThisCode": {
      "csharp": "Hardware PIN-brute-force forsvar: øg failedAttempts ved forkert PIN; lås terminalen (isLocked = true, status = \"BLOCKED\") ved 3 forsøg.",
      "go": "failedAttempts++ ved forkert PIN; lås terminalen når der nås 3 forsøg."
    }
  },
  "task-pos-batch-settlement": {
    "whyThisCode": {
      "csharp": "Daglig afstemning: gennemløb transaktionsarray med en for-løkke, akkumuler summen i dailyTotal, og sæt status = \"SETTLED\".",
      "go": "Løkke gennem transaktioner for at opsummere batch-total og fastsætte afregningsstatus."
    }
  },
  "task-pos-interface-polymorphism": {
    "whyThisCode": {
      "csharp": "Frakobl terminalen fra banknetværket: kald ensartet interface IPaymentGateway.Charge(amount). Afvis hvis autorisationen fejler.",
      "go": "Kald IPaymentGateway.Charge via interface-polymorfi. Frakobler POS-logik fra betalingsudbyder."
    }
  },
  "task-pos-dependency-injection": {
    "whyThisCode": {
      "csharp": "Registrer bankudbyder i IoC-container: services.AddScoped<IPaymentGateway, DankortGateway>(). Gør det muligt at udskifte udbydere.",
      "go": "Forbind betalingsgateway-interface til DankortGateway i IoC-containeren."
    }
  },
  "task-debug-runaway-loop": {
    "whyThisCode": {
      "csharp": "Undgå uendelige løkker: kontroller betingelsen channel < 10 og sørg for at tælleren øges med i++.",
      "go": "Sørg for at løkkebetingelsen afsluttes og variablen opdateres i hver iteration."
    }
  },
  "task-debug-off-by-one-overflow": {
    "whyThisCode": {
      "csharp": "Arraygrænsebeskyttelse: ret i <= length til i < length for at forhindre IndexOutOfRangeException.",
      "go": "Brug strengt mindre-end (<) ved iteration over slices op til len(items)."
    }
  },
  "task-pos-double-deduction-bug": {
    "whyThisCode": {
      "csharp": "Afstem dobbelt gebyrfradrag: fjern overflødig balance -= fee, da gebyret allerede er inkluderet i totalAmount.",
      "go": "Fjern overflødig gebyrfradragslinje for at bevare atomisk transaktionsbalance."
    }
  },
  "task-api-1-heartbeat": {
    "whyThisCode": {
      "csharp": "Registrer GET /health endepunkt der returnerer JSON status 200 OK via Results.Ok(new { status = \"UP\" }).",
      "go": "Registrer HTTP sundhedshåndterer der returnerer JSON {\"status\":\"UP\"}."
    }
  },
  "task-api-2-path-params": {
    "whyThisCode": {
      "csharp": "Ruteparametre: kortlæg /orders/{id} hvor id udtrækkes fra URL'en og sendes til håndtereren.",
      "go": "Udtræk ruteparameter id og hent den tilsvarende ordreregistrering."
    }
  },
  "task-api-3-dto-validation": {
    "whyThisCode": {
      "csharp": "DTO-valideringsværn: hvis amount <= 0, returner Results.BadRequest(\"Invalid amount\") med HTTP 400.",
      "go": "Valider felter før behandling og returner HTTP 400 Bad Request ved fejl."
    }
  },
  "task-api-4-bearer-auth": {
    "whyThisCode": {
      "csharp": "Bearer token autentificering: udtræk Authorization header og returner Results.Unauthorized() ved fejl.",
      "go": "Valider Bearer token header og afvis manglende eller ugyldige tokens med HTTP 401."
    }
  },
  "task-api-5-client-consumer": {
    "whyThisCode": {
      "csharp": "Forbrug eksterne HTTP API'er: send POST anmodning med JSON payload vha. client.PostAsJsonAsync.",
      "go": "Send HTTP POST anmodning med JSON payload og deserialiser svaret."
    }
  },
  "task-api-6-resilient-retry": {
    "whyThisCode": {
      "csharp": "Resilienspolitik: indpak HTTP-kald i Polly retry-pipeline for at håndtere midlertidige 504 timeouts.",
      "go": "Implementer retry-løkke med eksponentiel backoff for midlertidige netværksfejl."
    }
  }
,
  "task-git-1-genesis": {
    "whyThisCode": {
      "csharp": "Udfør Git-plumbing via Process.Start: stage sporede filer (git add) og opret rod-genesiskommit med en kryptografisk SHA-1 hash.",
      "go": "Kald exec.Command i Go for at initialisere telemetri-lageret og oprette genesiskommit."
    },
    "primitiveMemoryNote": {
      "csharp": "Git beregner SHA-1 / SHA-256 hashes baseret på rå bytes og gemmer uforanderlige objekter i .git/objects uden at overbelaste RAM.",
      "go": "Git-objekter gemmes som zlib-komprimerede datastrømme indekseret efter 20-byte objekt-IDs."
    }
  },
  "task-git-4-conflict": {
    "whyThisCode": {
      "csharp": "Løs Git-flettekonflikter: afstem modstridende ændringer ved at bevare verificerede opdateringer og fjerne konfliktmarkører (<<<<<<<, =======, >>>>>>>).",
      "go": "Afstem divergerende grene og udfør et rent fletningskommit i Git."
    },
    "primitiveMemoryNote": {
      "csharp": "Under flettekonflikter opbevarer Git tre stadier i indekset: fælles forfader (trin 1), målgren (trin 2) og kildegren (trin 3).",
      "go": "Indekstrin 1, 2 og 3 holder filversioner, indtil afstemning skaber en ensartet hash."
    }
  },
  "task-git-5-rebase": {
    "whyThisCode": {
      "csharp": "Git rebase-arbejdsgang: genafspil lokale commits oven på opdateret origin/main for at opretholde en ren, lineær historik uden unødige merge-commits.",
      "go": "Linearisér kommit-historikken via rebase før oprettelse af pull request."
    },
    "primitiveMemoryNote": {
      "csharp": "Rebase tildeler helt nye commit-hashes til hvert kommit, da forælder-referencerne (parent SHA) omskrives.",
      "go": "Rebase omskriver forældre-pointers for hvert kommit og opdaterer hele historiegrenen."
    }
  },
  "task-bandit-4-sql-injection": {
    "whyThisCode": {
      "csharp": "Beskyttelse mod SQL Injection: erstat dynamisk strengkonkatenering med parametriserede SqlCommand-forespørgsler for at neutralisere angreb.",
      "go": "Anvend parametriserede pladsholdere (, ?) for at forhindre manipulation af databasens syntakstræ."
    },
    "primitiveMemoryNote": {
      "csharp": "Parametriserede forespørgsler adskiller SQL-grammatikken fra dataværdier i hukommelsen, så input behandles udelukkende som data.",
      "go": "Database-driveren sender parametre adskilt over netværkssoklen, hvilket forhindrer utilsigtet kodeudførelse."
    }
  },
  "task-bandit-5-rate-limiter": {
    "whyThisCode": {
      "csharp": "Implementér Token Bucket rate-begrænsning: håndhæv maksimalt antal forespørgsler pr. sekund for at beskytte mod brute-force og DoS.",
      "go": "Begræns forespørgselsfrekvens med time.Ticker og bufferede Go-kanaler."
    },
    "primitiveMemoryNote": {
      "csharp": "Tokens genopfyldes med faste tidsintervaller i et atomisk register med Interlocked.Decrement uden låsekonflikter.",
      "go": "Token bucket anvender atomare datatyper i hukommelsen til lynhurtig godkendelse af indgående trafik."
    }
  },
  "task-vertex-3-pipeline-yaml": {
    "whyThisCode": {
      "csharp": "Konfigurér deklarativ ML-træningspipeline i Kubeflow / Vertex AI YAML: forbind datasæt-udtræk, træningsbeholder og modelevaluering.",
      "go": "Definér deklarativ maskinlærings-arbejdsgang med beholder-artefakter og beregningskrav."
    },
    "primitiveMemoryNote": {
      "csharp": "Pipeline-specifikationer kompileres til uforanderlige cloud-eksekveringsgrafer med artefakt-URIs i Cloud Storage.",
      "go": "YAML-specifikationen parses til en rettet acyklisk graf (DAG) i orkestreringslagets hukommelse."
    }
  },
  "task-vertex-13-drift-detection": {
    "whyThisCode": {
      "csharp": "Overvåg datadrift: beregn L-Infinity afstand mellem grundlæggende træningsfordeling og produktionsfunktioner for at opdage modelforringelse.",
      "go": "Overvåg funktionsafvigelse i realtid og udløs automatisk gentræning af modellen."
    },
    "primitiveMemoryNote": {
      "csharp": "Statistiske histogrammer gemmes i glidende tidsvinduer i hukommelsen med lavt heap-forbrug.",
      "go": "Datafordelings-histogrammer opdateres i hukommelsesbuffere for at identificere afvigelser øjeblikkeligt."
    }
  },
  "task-fde-7-agent-architecture": {
    "whyThisCode": {
      "csharp": "Autonom AI-agentarkitektur: implementér ReAct-cyklus opdelt i observation (Perception), planlægning (Planning) og værktøjskald (Tool Calling).",
      "go": "Orkestrer agentens ræsonneringscyklus med deterministiske grænser for værktøjskald."
    },
    "primitiveMemoryNote": {
      "csharp": "Agentens kladdehukommelse opbevares i en flygtig dialogkontekst, der beskæres til faste token-grænser.",
      "go": "Konteksthukommelsen holdes i komprimerede token-arrays for at overholde modellens maksimale vindue."
    }
  },
  "task-fde-10-prompt-injection": {
    "whyThisCode": {
      "csharp": "Beskyttelse mod Prompt Injection (OWASP LLM01): isolér brugerinput i XML-tags, håndhæv systeminstruktioner og saniter svar.",
      "go": "Filtrér og analysér prompter semantisk for at forhindre omgåelse af systemets sikkerhedsregler."
    },
    "primitiveMemoryNote": {
      "csharp": "Input-tokens analyseres gennem deterministiske filtre, før de overføres til inferensmotoren.",
      "go": "Sikkerhedskontrol af strenge sker i memory-buffere før kald til LLM-tjenesten."
    }
  },
  "task-rag-1-chunking-overlap": {
    "whyThisCode": {
      "csharp": "Dokumentopdeling med glidende vindue (overlap): opdel kildetekst i 500-token bidder med 50-token overlap for at bevare semantisk sammenhæng.",
      "go": "Segmentér tekstdokumenter med overlap for at opnå optimale vektorindlejringer."
    },
    "primitiveMemoryNote": {
      "csharp": "Tokens behandles som sammenhængende ReadOnlySpan<char>-blokke uden overflødig strengallokering på heapen.",
      "go": "Udsnit af dokumenter håndteres direkte via slices for lynhurtig parsing."
    }
  },
  "task-rag-4-hybrid-rrf": {
    "whyThisCode": {
      "csharp": "Hybrid søgning med Reciprocal Rank Fusion (RRF): kombinér leksikalsk søgning (BM25) og semantisk vektorsøgning til en samlet relevansscore.",
      "go": "Beregn RRF-point for at afbalancere nøgleordssøgning med semantisk vektorforståelse."
    },
    "primitiveMemoryNote": {
      "csharp": "Pointberegningen anvender formlen 1.0 / (k + rang) med k=60 og lagres i en prioritetskø (Min-Heap) for hurtig top-K søgning.",
      "go": "Top-K dokumenter sorteres i en kompakt hukommelseskø med minimal beregningsforsinkelse."
    }
  },
  "task-cyber-4-syn-flood-detector": {
    "whyThisCode": {
      "csharp": "Registrér TCP SYN Flood angreb: overvåg forholdet mellem halvåbne forbindelser og slå alarm, når baglog-køen overstiger tærsklen.",
      "go": "Overvåg rå netværkspakker for at identificere unormale stigninger i TCP SYN-flag uden matchende ACK."
    },
    "primitiveMemoryNote": {
      "csharp": "Pakkeflag (SYN=0x02, ACK=0x10) udpakkes via bitvise masker i en cirkulær ring-buffer uden låsning.",
      "go": "Netværksflag analyseres med bitmasker i en ringbuffer for ekstremt lav latenstid."
    }
  },
  "task-cyber-8-nist-containment": {
    "whyThisCode": {
      "csharp": "Implementér hændelsesbegrænsning efter NIST SP 800-61: isolér kompromitterede værter via firewall, tilbagekald sessioner og gem retsmedicinske logfiler.",
      "go": "Isolér netværksvært, afbryd ondsindede forbindelser og opret en uforanderlig revisionslog."
    },
    "primitiveMemoryNote": {
      "csharp": "Retsmedicinske data og netværksregler skrives til en append-only log med kryptografiske kontrolsummer for beviskæde.",
      "go": "Hændelsesdata registreres med kryptografiske tidsstempler for at sikre bevisernes gyldighed."
    }
  },
};

export interface LocalizableTaskDidactic {
  whyThisCode?: Record<string, string>;
  primitiveMemoryNote?: Record<string, string>;
  architectureMap?: {
    canvasWiring?: string;
    architectureHint?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function getLocalizedTaskDidactic<T extends LocalizableTaskDidactic>(
  base: T | undefined,
  taskId: string,
  lang: string = "ua"
): T | undefined {
  if (!base) return undefined;
  if (lang === "ua") return base;

  const dict = lang === "da" ? TASK_DIDACTIC_DA : lang === "en" ? TASK_DIDACTIC_EN : undefined;
  const translation = dict?.[taskId];
  if (!translation) return base;

  return {
    ...base,
    whyThisCode: {
      ...base.whyThisCode,
      ...(translation.whyThisCode || {}),
    },
    primitiveMemoryNote: base.primitiveMemoryNote ? {
      ...base.primitiveMemoryNote,
      ...(translation.primitiveMemoryNote || {}),
    } : undefined,
    architectureMap: base.architectureMap ? {
      ...base.architectureMap,
      canvasWiring: translation.canvasWiring || base.architectureMap.canvasWiring,
      architectureHint: translation.architectureHint || base.architectureMap.architectureHint,
    } : undefined,
  } as T;
}
