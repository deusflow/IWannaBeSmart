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
};

export function getLocalizedTaskDidactic<T extends { whyThisCode?: any; primitiveMemoryNote?: any; architectureMap?: any }>(
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
  };
}
