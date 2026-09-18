/**
 * @file packages/i18n/src/workedExamplesI18n.ts
 * @description Multilingual translations (EN, DA) for Gradual Release of Responsibility (GRR)
 * Worked Examples across all 5 active stations.
 */

export interface WorkedExampleTranslation {
  hardwareEffect: string;
  explanation: string;
  prompt: string;
  hint?: string;
}

export const WORKED_EXAMPLES_EN: Record<string, WorkedExampleTranslation> = {
  "task-0-1-power-on": {
    "hardwareEffect": "Power relay clicked, CRT display glowed soft blue, 25 kV anode voltage applied.",
    "explanation": "The teacher invokes PowerOn() to engage the power relay and activate the CRT display.",
    "prompt": "Turn on the TV and immediately switch to channel 5: tv.SetChannel(5);",
    "hint": "First call the power-on method, then pass the channel number to SetChannel."
  },
  "task-0-2-types": {
    "hardwareEffect": "Tuner locked to 175.25 MHz, digital OSD rendered channel 7.",
    "explanation": "We declare an integer variable channel of type int and pass it to the tuner to select the frequency.",
    "prompt": "Declare targetChannel with value 9 and switch the TV to this channel.",
    "hint": "Create an int variable, set it to 9, and pass it as an argument to SetChannel."
  },
  "task-0-3-sequential": {
    "hardwareEffect": "The TV turned on, selected channel 1, and the speaker played audio at a comfortable 25% volume.",
    "explanation": "Commands execute strictly sequentially from top to bottom: first power, then channel, then volume.",
    "prompt": "Execute startup sequence: power on TV, select channel 3, and set volume to 15.",
    "hint": "Follow sequence: first supply power, then tune channel, and finally set DAC volume."
  },
  "task-1-assignment": {
    "hardwareEffect": "Audio amplifier locked volume at 50% without clipping the acoustic path.",
    "explanation": "Variable volume is assigned 50 and passed into the audio amplifier register.",
    "prompt": "Assign 60 to variable volume and pass it to tv.SetVolume.",
    "hint": "Initialize the numeric volume variable and pass its identifier to the volume control method."
  },
  "task-2-branching": {
    "hardwareEffect": "Speaker protection capped volume at 100%, preventing diaphragm damage.",
    "explanation": "The if statement validates safety limits: if volume exceeds 100, it is safely clamped.",
    "prompt": "Write lower-bound check: if volume < 0, set volume = 0, then pass to tv.SetVolume.",
    "hint": "Use an if statement to verify lower bound (< 0), clamp to zero in body, then send to device."
  },
  "task-variable-mutation": {
    "hardwareEffect": "Channel incremented by +1, tuner shifted PLL frequency to the next multiplex.",
    "explanation": "We read the current channel, add 1, and write the result back.",
    "prompt": "Increment the channel by 1 using channel++ or channel = channel + 1, and switch to it.",
    "hint": "Mutate the channel counter by adding 1 and pass updated state to the TV."
  },
  "task-boundary-guard": {
    "hardwareEffect": "Boundary check blocked invalid channel request; receiver retained valid channel.",
    "explanation": "Guard clause verifies channel bounds (1 to 99) before mutation.",
    "prompt": "Write boundary protection: if channel > 99, return early without switching.",
    "hint": "Check if channel exceeds 99; if so, execute return; immediately."
  },
  "task-for-loop": {
    "hardwareEffect": "Tuner scanned channels 1 through 5, updating OSD on each step.",
    "explanation": "A for loop iterates over channel indices sequentially.",
    "prompt": "Write a for loop scanning channels from 1 to 4 sequentially.",
    "hint": "Use for (int ch = 1; ch <= 4; ch++) to scan each channel."
  },
  "task-class-instance": {
    "hardwareEffect": "New command instance allocated on Heap; reference wired to TV dispatcher.",
    "explanation": "Instantiating a concrete command object via new Command().",
    "prompt": "Instantiate VolumeUpCommand and execute its Execute() method.",
    "hint": "Create the command instance with new and call Execute()."
  },
  "task-method-return": {
    "hardwareEffect": "Status query returned current power state (true/false) to controller.",
    "explanation": "Methods can compute and return values back to the caller using return.",
    "prompt": "Create a method GetChannel() returning the current channel integer.",
    "hint": "Define int GetChannel() { return this.channel; }."
  },
  "task-null-reference": {
    "hardwareEffect": "Null check defended TV dispatcher against NullReferenceException crash.",
    "explanation": "Always verify references are not null before calling members on them.",
    "prompt": "Add null check: if (cmd != null) cmd.Execute(); else LogError();",
    "hint": "Check cmd != null before dereferencing the pointer."
  },
  "task-function-encapsulation": {
    "hardwareEffect": "Encapsulated method safely mutated internal hardware state without exposing private fields.",
    "explanation": "Encapsulation bundles data and logic inside classes, exposing only public contracts.",
    "prompt": "Encapsulate volume logic inside a SetSafeVolume(int vol) method.",
    "hint": "Declare public method with parameter validation."
  },
  "task-antipattern-god-object": {
    "hardwareEffect": "Refactored dispatcher delegates button execution to separated command handlers.",
    "explanation": "Break monolithic God Objects into single-responsibility classes.",
    "prompt": "Extract the power handling logic into a dedicated PowerCommandHandler class.",
    "hint": "Create a separate class containing only the power action."
  },
  "task-interface-polymorphism": {
    "hardwareEffect": "Polymorphic dispatch routed button signal through IRemoteCommand abstraction.",
    "explanation": "The controller depends on IRemoteCommand interface rather than concrete classes.",
    "prompt": "Declare IRemoteCommand variable and assign a new ChannelUpCommand to it.",
    "hint": "IRemoteCommand cmd = new ChannelUpCommand(); cmd.Execute();"
  },
  "task-di-container": {
    "hardwareEffect": "IoC Container resolved command dependency and injected into TVController constructor.",
    "explanation": "Register abstractions with implementations in the DI container.",
    "prompt": "Register IRemoteCommand with PowerCommand in services DI container.",
    "hint": "services.AddTransient<IRemoteCommand, PowerCommand>();"
  },
  "task-command-registry": {
    "hardwareEffect": "Command registry mapped remote button key to handler via O(1) dictionary lookup.",
    "explanation": "Replace God Switch with a dynamic dictionary lookup: registry[button].Execute().",
    "prompt": "Register \"POWER\" command in registry dictionary and invoke it by key.",
    "hint": "registry[\"POWER\"] = new PowerCommand(); registry[btn].Execute();"
  },
  "task-debug-runaway-loop": {
    "hardwareEffect": "Infinite loop breaker stopped runaway CPU cycle and restored responsiveness.",
    "explanation": "Loop termination conditions must always advance toward the exit threshold.",
    "prompt": "Fix the loop condition so it terminates when channel reaches 10.",
    "hint": "Ensure loop counter increments on every iteration (i++)."
  },
  "task-debug-off-by-one-overflow": {
    "hardwareEffect": "Array boundary guard prevented IndexOutOfRangeException buffer overflow.",
    "explanation": "Arrays are 0-indexed: valid indices range from 0 to length - 1.",
    "prompt": "Fix the loop bound from i <= length to i < length.",
    "hint": "Use strict less-than (<) when iterating array indices."
  },
  "task-pos-guard-clause": {
    "hardwareEffect": "Overdraft guard rejected transaction: amount exceeded available balance.",
    "explanation": "Guard clause returns early with \"DECLINED\" status before funds can be deducted.",
    "prompt": "If amount > balance, set status = \"DECLINED\" and return immediately.",
    "hint": "if (amount > balance) { status = \"DECLINED\"; return; }"
  },
  "task-pos-fee-calculation": {
    "hardwareEffect": "Receipt printed with transaction amount, fee breakdown, and settled balance.",
    "explanation": "We calculate totalAmount = amount + fee and deduct it atomically from balance.",
    "prompt": "Add fixed fee of 25 to totalAmount and deduct from balance with \"APPROVED\".",
    "hint": "totalAmount = amount + fee; balance -= totalAmount; status = \"APPROVED\";"
  },
  "task-pos-pin-lockout": {
    "hardwareEffect": "Hardware keypad locked out after 3 consecutive failed PIN attempts.",
    "explanation": "Increment failedAttempts on invalid PIN; lock terminal when reaching 3 attempts.",
    "prompt": "If entered PIN doesn't match, increment failedAttempts and lock if >= 3.",
    "hint": "failedAttempts++; if (failedAttempts >= 3) { isLocked = true; status = \"BLOCKED\"; }"
  },
  "task-pos-batch-settlement": {
    "hardwareEffect": "End-of-day batch settlement summarized all receipts and printed Z-Report.",
    "explanation": "Traverse transactions array with a for loop and accumulate dailyTotal.",
    "prompt": "Iterate through transactions array and sum all amounts into dailyTotal.",
    "hint": "for (int i = 0; i < transactions.Length; i++) dailyTotal += transactions[i];"
  },
  "task-pos-interface-polymorphism": {
    "hardwareEffect": "Payment routed through IPaymentGateway abstraction to banking network.",
    "explanation": "The terminal calls gateway.Charge(amount) without depending on a specific bank.",
    "prompt": "Call gateway.Charge(totalAmount) and decline if authorization fails.",
    "hint": "bool ok = gateway.Charge(totalAmount); if (!ok) { status = \"DECLINED\"; return; }"
  },
  "task-pos-dependency-injection": {
    "hardwareEffect": "Banking gateway registered in IoC container and injected into terminal session.",
    "explanation": "Configure IoC container to bind IPaymentGateway to concrete DankortGateway.",
    "prompt": "Register IPaymentGateway with DankortGateway in the DI container.",
    "hint": "services.AddScoped<IPaymentGateway, DankortGateway>();"
  },
  "task-pos-double-deduction-bug": {
    "hardwareEffect": "Ledger reconciled: double fee deduction eliminated, balance accurately settled.",
    "explanation": "Fix the bug where fee was deducted twice: once standalone and once in totalAmount.",
    "prompt": "Remove redundant balance -= fee so deduction happens exactly once.",
    "hint": "Delete the line 'balance -= fee;' because fee is already in totalAmount."
  },
  "task-api-1-heartbeat": {
    "hardwareEffect": "Kestrel web server returned HTTP 200 OK with {\"status\":\"UP\"} health telemetry.",
    "explanation": "Register a GET /health endpoint returning JSON status 200 OK.",
    "prompt": "Implement app.MapGet(\"/health\", () => Results.Ok(new { status = \"UP\" }));",
    "hint": "Return Results.Ok with status object."
  },
  "task-api-2-path-params": {
    "hardwareEffect": "API dispatcher parsed URL route parameter /orders/{id} and queried order record.",
    "explanation": "Extract route parameters from URL path and pass to endpoint handler.",
    "prompt": "Map route /orders/{id} to retrieve order by integer id.",
    "hint": "app.MapGet(\"/orders/{id}\", (int id) => Results.Ok(GetOrder(id)));"
  },
  "task-api-3-dto-validation": {
    "hardwareEffect": "Validation guard rejected invalid payload with HTTP 400 Bad Request.",
    "explanation": "Validate incoming DTO fields before business logic processing.",
    "prompt": "If dto.Amount <= 0, return Results.BadRequest(\"Invalid amount\");",
    "hint": "Check if amount is non-positive and return 400."
  },
  "task-api-4-bearer-auth": {
    "hardwareEffect": "Security middleware rejected unauthorized request with HTTP 401 Unauthorized.",
    "explanation": "Extract and validate Authorization: Bearer <token> header.",
    "prompt": "Verify Bearer token; if missing or invalid, return Results.Unauthorized();",
    "hint": "Check auth header prefix and return 401 on failure."
  },
  "task-api-5-client-consumer": {
    "hardwareEffect": "HttpClient serialized payload, connected to upstream socket, and received 200 OK.",
    "explanation": "Consume upstream HTTP APIs using HttpClient and deserialize JSON response.",
    "prompt": "Send POST request with JSON payload using client.PostAsJsonAsync.",
    "hint": "var response = await client.PostAsJsonAsync(\"/api/pay\", payload);"
  },
  "task-api-6-resiliency-retry": {
    "hardwareEffect": "Polly resilience pipeline absorbed 504 Gateway Timeout and succeeded on retry.",
    "explanation": "Wrap network calls with retry policies for transient HTTP errors (500, 503, 504).",
    "prompt": "Configure retry policy with 3 attempts and exponential backoff.",
    "hint": "Use Polly or retry loop with delay."
  },
  "task-git-1-genesis": {
    "hardwareEffect": "Git initialized .git repository and created root commit in DAG graph.",
    "explanation": "Initialize repository with git init, stage files with git add, and create root commit.",
    "prompt": "Execute git init followed by git add . and git commit -m \"Initial commit\".",
    "hint": "Initialize, stage, and commit."
  },
  "task-git-2-branching": {
    "hardwareEffect": "Branch pointer feature-auth created and switched to branch head.",
    "explanation": "Create and switch branches with git checkout -b feature-name.",
    "prompt": "Create and switch to a new branch named 'feature-payment'.",
    "hint": "git checkout -b feature-payment or git switch -c feature-payment."
  },
  "task-git-3-merge": {
    "hardwareEffect": "Fast-forward merge advanced main pointer to feature branch tip.",
    "explanation": "Merge feature branch into main using git merge feature-name.",
    "prompt": "Switch to main and merge feature-payment branch.",
    "hint": "git checkout main && git merge feature-payment."
  },
  "task-git-4-conflict": {
    "hardwareEffect": "Merge conflict markers detected and resolved in shared configuration file.",
    "explanation": "Resolve <<<<<<< and >>>>>>> conflict markers and commit resolution.",
    "prompt": "Resolve merge conflict in config.json and complete merge commit.",
    "hint": "Edit file to keep valid lines, stage with git add, and commit."
  },
  "task-git-5-rebase": {
    "hardwareEffect": "Git rebased feature commits linearly on top of latest main.",
    "explanation": "Replay feature commits onto updated base using git rebase main.",
    "prompt": "Rebase feature branch on top of main for linear history.",
    "hint": "git rebase main."
  },
  "task-git-6-pull-request": {
    "hardwareEffect": "Pull request approved, CI pipeline green, squash-and-merged to trunk.",
    "explanation": "Push branch upstream and open Pull Request for team review.",
    "prompt": "Push branch with git push -u origin feature-payment.",
    "hint": "Set upstream and push."
  },
  "task-bandit-1-hidden-key": {
    "hardwareEffect": "Security scanner detected hardcoded secret in source code repository.",
    "explanation": "Extract secrets into environment variables instead of hardcoding in source.",
    "prompt": "Read API key from Environment.GetEnvironmentVariable(\"API_KEY\").",
    "hint": "Never commit API keys to git repository."
  },
  "task-bandit-2-obfuscation": {
    "hardwareEffect": "De-obfuscator decoded XOR-masked shellcode payload in memory.",
    "explanation": "Analyze obfuscated strings by applying inverse XOR cipher.",
    "prompt": "Apply XOR mask 0x5A to decode protected byte array.",
    "hint": "byte decoded = (byte)(b ^ 0x5A);"
  },
  "task-bandit-3-wire-tap": {
    "hardwareEffect": "HMAC signature verified: tampered request body rejected with 403 Forbidden.",
    "explanation": "Protect packet integrity against Man-in-the-Middle using HMAC-SHA256 signatures.",
    "prompt": "Verify incoming request signature against computed HMAC.",
    "hint": "Compute HMAC over body and compare with X-Signature header."
  },
  "task-bandit-4-sql-injection": {
    "hardwareEffect": "Parameterized query safely escaped malicious input string ' OR 1=1 --.",
    "explanation": "Prevent SQL injection by using parameterized queries instead of string concatenation.",
    "prompt": "Replace concatenation with cmd.Parameters.AddWithValue(\"@user\", userInput).",
    "hint": "Never concatenate untrusted user input into SQL commands."
  },
  "task-bandit-5-rate-limiter": {
    "hardwareEffect": "Rate limiter blocked brute-force burst with HTTP 429 Too Many Requests.",
    "explanation": "Throttling protects authentication endpoints against password guessing bursts.",
    "prompt": "Return Results.StatusCode(429) when request count exceeds threshold.",
    "hint": "Respond with HTTP 429 and Retry-After header."
  },
  "task-bandit-6-defense-in-depth": {
    "hardwareEffect": "Fortified multi-layer gateway repelled simulated attack vector.",
    "explanation": "Defense in depth combines TLS, authentication, rate limiting, and input validation.",
    "prompt": "Chain TLS enforcement, Bearer auth, and RateLimiter in API middleware pipeline.",
    "hint": "Compose all security middlewares in Startup pipeline."
  }
};

export const WORKED_EXAMPLES_DA: Record<string, WorkedExampleTranslation> = {
  "task-0-1-power-on": {
    "hardwareEffect": "Strømrelæet klikkede, katoderøret lyste blødt blåt, 25 kV anodespænding tilsluttet.",
    "explanation": "Læreren kalder PowerOn() for at slutte strømrelæet og starte TV-katoderøret.",
    "prompt": "Tænd for TV'et og skift straks til kanal 5: tv.SetChannel(5);",
    "hint": "Kald først tændingsmetoden, og send derefter kanalnummeret til SetChannel."
  },
  "task-0-2-types": {
    "hardwareEffect": "Tuneren låste sig fast på 175,25 MHz, digital OSD viser kanal 7.",
    "explanation": "Vi erklærer en heltalsvariabel channel af typen int og sender den til tuneren for at vælge frekvens.",
    "prompt": "Erklær targetChannel med værdien 9 og skift TV'et til denne kanal.",
    "hint": "Opret en heltalsvariabel, sæt den til 9, og send den som argument til SetChannel."
  },
  "task-0-3-sequential": {
    "hardwareEffect": "TV'et tændte, valgte kanal 1, og højttaleren afspillede lyd ved behagelige 25% lydstyrke.",
    "explanation": "Kommandoer udføres strengt sekventielt fra top til bund: først strøm, derefter kanal, og til sidst lydstyrke.",
    "prompt": "Udfør opstartssekvens: tænd TV, vælg kanal 3, og sæt lydstyrke til 15.",
    "hint": "Følg rækkefølgen: tænd først, skift derefter kanal, og indstil til sidst lydstyrken."
  },
  "task-1-assignment": {
    "hardwareEffect": "Lydforstærkeren fastlåste lydstyrken på 50% uden overstyring.",
    "explanation": "Variablen volume tildeles værdien 50 og sendes til forstærkerens lydregister.",
    "prompt": "Tildel 60 til variablen volume og send den til tv.SetVolume.",
    "hint": "Initialiser den numeriske variabel og send den til metoden til styring af lydstyrke."
  },
  "task-2-branching": {
    "hardwareEffect": "Højttalerbeskyttelse begrænsede lydstyrken til 100% og forhindrede skader.",
    "explanation": "If-betingelsen kontrollerer sikkerhedsgrænsen: hvis lydstyrken overstiger 100, begrænses den.",
    "prompt": "Skriv kontrol af nedre grænse: hvis volume < 0, sæt volume = 0, og send derefter til tv.SetVolume.",
    "hint": "Brug en if-sætning til at kontrollere om værdien er under nul, nulstil i blokken, og send til enheden."
  },
  "task-variable-mutation": {
    "hardwareEffect": "Kanalen blev øget med +1, tuneren skiftede PLL-frekvens til næste multiplex.",
    "explanation": "Vi læser den aktuelle kanal, lægger 1 til, og gemmer resultatet.",
    "prompt": "Forøg kanalen med 1 vha. channel++ eller channel = channel + 1, og skift til den.",
    "hint": "Opdater kanaltælleren ved at lægge 1 til og send den nye tilstand til TV'et."
  },
  "task-boundary-guard": {
    "hardwareEffect": "Grænsekontrollen afviste ugyldig kanal; modtageren beholdt den gyldige kanal.",
    "explanation": "Guard clause validerer kanalgrænser (1 til 99) før tilstandsændring.",
    "prompt": "Skriv grænsekontrol: hvis channel > 99, lav tidlig returnering uden at skifte.",
    "hint": "Undersøg om channel er over 99; hvis ja, udfør straks return;."
  },
  "task-for-loop": {
    "hardwareEffect": "Tuneren scannede kanal 1 til 5 og opdaterede OSD ved hvert trin.",
    "explanation": "En for-løkke itererer sekventielt over kanalindekser.",
    "prompt": "Skriv en for-løkke, der scanner kanalerne fra 1 til 4 sekventielt.",
    "hint": "Brug for (int ch = 1; ch <= 4; ch++) til at scanne hver kanal."
  },
  "task-class-instance": {
    "hardwareEffect": "Ny kommando-instans allokeret på heapen; reference forbundet til TV-dispatcher.",
    "explanation": "Instansiering af et konkret kommandoobjekt via new Command().",
    "prompt": "Opret en instans af VolumeUpCommand og udfør dens Execute() metode.",
    "hint": "Opret kommandoinstansen med new og kald Execute()."
  },
  "task-method-return": {
    "hardwareEffect": "Tilstandsforespørgsel returnerede aktuel strømtilstand (true/false) til controlleren.",
    "explanation": "Metoder kan beregne og returnere værdier tilbage til kalderen med return.",
    "prompt": "Opret en metode GetChannel(), der returnerer det aktuelle kanalnummer.",
    "hint": "Definer int GetChannel() { return this.channel; }."
  },
  "task-null-reference": {
    "hardwareEffect": "Null-kontrol forsvarede TV-dispatcheren mod et NullReferenceException nedbrud.",
    "explanation": "Kontroller altid, at referencer ikke er null, før du kalder metoder på dem.",
    "prompt": "Tilføj null-kontrol: if (cmd != null) cmd.Execute(); else LogError();",
    "hint": "Kontroller at cmd != null før dereferencering af pointeren."
  },
  "task-function-encapsulation": {
    "hardwareEffect": "Indkapslet metode ændrede hardwaretilstand sikkert uden at blotte private felter.",
    "explanation": "Indkapsling samler data og logik i klasser og blotter kun offentlige kontrakter.",
    "prompt": "Indkapsl lydstyrkelogik i en SetSafeVolume(int vol) metode.",
    "hint": "Erklær en offentlig metode med parametervalidering."
  },
  "task-antipattern-god-object": {
    "hardwareEffect": "Refaktoreret dispatcher delegerer udførelse til adskilte kommandohåndterere.",
    "explanation": "Opdel monolitiske God Objects i klasser med ét enkelt ansvarsområde.",
    "prompt": "Udtræk tænd/sluk-logik i en dedikeret PowerCommandHandler klasse.",
    "hint": "Opret en separat klasse, der kun indeholder tænd/sluk-handlingen."
  },
  "task-interface-polymorphism": {
    "hardwareEffect": "Polymorfisk dispatch sendte knapsignal gennem IRemoteCommand abstraktionen.",
    "explanation": "Controlleren afhænger af IRemoteCommand interfacet frem for konkrete klasser.",
    "prompt": "Erklær en IRemoteCommand variabel og tildel en new ChannelUpCommand til den.",
    "hint": "IRemoteCommand cmd = new ChannelUpCommand(); cmd.Execute();"
  },
  "task-di-container": {
    "hardwareEffect": "IoC-containeren fandt afhængigheden og injicerede den i TVControllerens konstruktør.",
    "explanation": "Registrer abstraktioner med implementeringer i DI-containeren.",
    "prompt": "Registrer IRemoteCommand med PowerCommand i services DI-containeren.",
    "hint": "services.AddTransient<IRemoteCommand, PowerCommand>();"
  },
  "task-command-registry": {
    "hardwareEffect": "Kommandoregisteret forbandt fjernbetjeningsknappen til håndtereren via O(1) opslag.",
    "explanation": "Erstat God Switch med et dynamisk opslag i en dictionary: registry[button].Execute().",
    "prompt": "Registrer \"POWER\" kommandoen i registry og udfør den via nøglen.",
    "hint": "registry[\"POWER\"] = new PowerCommand(); registry[btn].Execute();"
  },
  "task-debug-runaway-loop": {
    "hardwareEffect": "Uendelig løkkebryder stoppede løbsk CPU-cyklus og genoprettede reaktionsevnen.",
    "explanation": "Løkkens stopbetingelse skal altid bevæge sig mod afslutningstærsklen.",
    "prompt": "Ret løkkebetingelsen, så den stopper, når kanalen når 10.",
    "hint": "Sørg for at tælleren øges i hver iteration (i++)."
  },
  "task-debug-off-by-one-overflow": {
    "hardwareEffect": "Arraygrænseværn forhindrede IndexOutOfRangeException bufferoverløb.",
    "explanation": "Arrays er 0-indekserede: gyldige indeks går fra 0 til length - 1.",
    "prompt": "Ret løkkegrænsen fra i <= length til i < length.",
    "hint": "Brug strengt mindre-end (<) ved iteration over arrayindeks."
  },
  "task-pos-guard-clause": {
    "hardwareEffect": "Overtræksværn afviste transaktionen: beløbet oversteg den tilgængelige saldo.",
    "explanation": "Guard clause returnerer tidligt med \"DECLINED\" status før midler trækkes.",
    "prompt": "Hvis amount > balance, sæt status = \"DECLINED\" og lav straks return.",
    "hint": "if (amount > balance) { status = \"DECLINED\"; return; }"
  },
  "task-pos-fee-calculation": {
    "hardwareEffect": "Kvittering udskrevet med transaktionsbeløb, gebyr og opdateret saldo.",
    "explanation": "Vi beregner totalAmount = amount + fee og trækker det atomisk fra saldoen.",
    "prompt": "Tilføj fast gebyr på 25 til totalAmount og træk fra saldoen med \"APPROVED\".",
    "hint": "totalAmount = amount + fee; balance -= totalAmount; status = \"APPROVED\";"
  },
  "task-pos-pin-lockout": {
    "hardwareEffect": "Hardwaretastaturet blev låst efter 3 forkerte PIN-forsøg i træk.",
    "explanation": "Øg failedAttempts ved forkert PIN; lås terminalen ved 3 forsøg.",
    "prompt": "Hvis den indtastede PIN ikke matcher, øg failedAttempts og lås hvis >= 3.",
    "hint": "failedAttempts++; if (failedAttempts >= 3) { isLocked = true; status = \"BLOCKED\"; }"
  },
  "task-pos-batch-settlement": {
    "hardwareEffect": "Dagsafslutningsafregning opsummerede alle kvitteringer og udskrev Z-rapport.",
    "explanation": "Gennemløb transactions arrayet med en for-løkke og akkumuler dailyTotal.",
    "prompt": "Iterer gennem transactions arrayet og opsummer alle beløb i dailyTotal.",
    "hint": "for (int i = 0; i < transactions.Length; i++) dailyTotal += transactions[i];"
  },
  "task-pos-interface-polymorphism": {
    "hardwareEffect": "Betaling dirigeret gennem IPaymentGateway abstraktion til banknetværket.",
    "explanation": "Terminalen kalder gateway.Charge(amount) uden at afhænge af en specifik bank.",
    "prompt": "Kald gateway.Charge(totalAmount) og afvis hvis autorisationen fejler.",
    "hint": "bool ok = gateway.Charge(totalAmount); if (!ok) { status = \"DECLINED\"; return; }"
  },
  "task-pos-dependency-injection": {
    "hardwareEffect": "Bankgateway registreret i IoC-containeren og injiceret i terminalsessionen.",
    "explanation": "Konfigurer IoC-containeren til at binde IPaymentGateway til DankortGateway.",
    "prompt": "Registrer IPaymentGateway med DankortGateway i DI-containeren.",
    "hint": "services.AddScoped<IPaymentGateway, DankortGateway>();"
  },
  "task-pos-double-deduction-bug": {
    "hardwareEffect": "Regnskabet afstemt: dobbelt gebyrfradrag fjernet, saldo nøjagtigt afregnet.",
    "explanation": "Ret fejlen hvor gebyret blev fratrukket to gange: alene og i totalAmount.",
    "prompt": "Fjern overflødig balance -= fee så fradraget sker præcis én gang.",
    "hint": "Slet linjen 'balance -= fee;' da gebyret allerede er inkluderet i totalAmount."
  },
  "task-api-1-heartbeat": {
    "hardwareEffect": "Kestrel webserver returnerede HTTP 200 OK med {\"status\":\"UP\"} telemetri.",
    "explanation": "Registrer et GET /health endepunkt der returnerer JSON status 200 OK.",
    "prompt": "Implementer app.MapGet(\"/health\", () => Results.Ok(new { status = \"UP\" }));",
    "hint": "Returner Results.Ok med statusobjekt."
  },
  "task-api-2-path-params": {
    "hardwareEffect": "API-dispatcheren fortolkede ruteparameter /orders/{id} og fandt ordren.",
    "explanation": "Udtræk ruteparametre fra URL-stien og send til håndtereren.",
    "prompt": "Kortlæg ruten /orders/{id} til at hente ordre efter heltals-id.",
    "hint": "app.MapGet(\"/orders/{id}\", (int id) => Results.Ok(GetOrder(id)));"
  },
  "task-api-3-dto-validation": {
    "hardwareEffect": "Valideringsværn afviste ugyldig payload med HTTP 400 Bad Request.",
    "explanation": "Valider indkommende DTO-felter før forretningslogik afvikles.",
    "prompt": "Hvis dto.Amount <= 0, returner Results.BadRequest(\"Invalid amount\");",
    "hint": "Kontroller om beløbet er ikke-positivt og returner 400."
  },
  "task-api-4-bearer-auth": {
    "hardwareEffect": "Sikkerhedsmiddleware afviste uautoriseret anmodning med HTTP 401 Unauthorized.",
    "explanation": "Udtræk og valider Authorization: Bearer <token> headeren.",
    "prompt": "Verificer Bearer token; hvis ugyldig eller mangler, returner Results.Unauthorized();",
    "hint": "Undersøg headerens præfiks og returner 401 ved fejl."
  },
  "task-api-5-client-consumer": {
    "hardwareEffect": "HttpClient serialiserede payload, forbandt til socket, og modtog 200 OK.",
    "explanation": "Forbrug eksterne HTTP API'er med HttpClient og deserialiser JSON-svaret.",
    "prompt": "Send POST-anmodning med JSON payload vha. client.PostAsJsonAsync.",
    "hint": "var response = await client.PostAsJsonAsync(\"/api/pay\", payload);"
  },
  "task-api-6-resiliency-retry": {
    "hardwareEffect": "Polly-resilienspipelinen håndterede 504 Gateway Timeout og lykkedes ved genforsøg.",
    "explanation": "Indpak netværkskald i retry-politikker for midlertidige HTTP-fejl (500, 503, 504).",
    "prompt": "Konfigurer retry-politik med 3 forsøg og eksponentiel backoff.",
    "hint": "Brug Polly eller en retry-løkke med forsinkelse."
  },
  "task-git-1-genesis": {
    "hardwareEffect": "Git initialiserede .git-depotet og oprettede rod-commit i DAG-grafen.",
    "explanation": "Initialiser depot med git init, tilføj filer med git add, og lav rod-commit.",
    "prompt": "Udfør git init efterfulgt af git add . og git commit -m \"Initial commit\".",
    "hint": "Initialiser, stage og commit."
  },
  "task-git-2-branching": {
    "hardwareEffect": "Grenpointeren feature-auth blev oprettet og skiftede til grentoppen.",
    "explanation": "Opret og skift gren med git checkout -b feature-name.",
    "prompt": "Opret og skift til en ny gren ved navn 'feature-payment'.",
    "hint": "git checkout -b feature-payment eller git switch -c feature-payment."
  },
  "task-git-3-merge": {
    "hardwareEffect": "Fast-forward merge flyttede main-pointeren frem til funktionsgrenen.",
    "explanation": "Foretag merge af funktionsgren ind i main med git merge feature-name.",
    "prompt": "Skift til main og merge feature-payment grenen.",
    "hint": "git checkout main && git merge feature-payment."
  },
  "task-git-4-conflict": {
    "hardwareEffect": "Merge-konfliktmarkører fundet og løst i den fælles konfigurationsfil.",
    "explanation": "Løs <<<<<<< og >>>>>>> konfliktmarkører og commit løsningen.",
    "prompt": "Løs merge-konflikten i config.json og fuldfør merge commit.",
    "hint": "Rediger filen, stage med git add, og commit."
  },
  "task-git-5-rebase": {
    "hardwareEffect": "Git rebasede funktionscommits lineært oven på seneste main.",
    "explanation": "Afspil funktionscommits på opdateret base med git rebase main.",
    "prompt": "Rebase funktionsgrenen oven på main for en lineær historik.",
    "hint": "git rebase main."
  },
  "task-git-6-pull-request": {
    "hardwareEffect": "Pull request godkendt, CI-pipeline grøn, squash-merged til trunk.",
    "explanation": "Push grenen opstrøms og åbn Pull Request til kodegennemgang.",
    "prompt": "Push gren med git push -u origin feature-payment.",
    "hint": "Sæt upstream og push."
  },
  "task-bandit-1-hidden-key": {
    "hardwareEffect": "Sikkerhedsscanner fandt hemmelighed i kildekodedepotet.",
    "explanation": "Flyt hemmeligheder til miljøvariabler i stedet for kildekoden.",
    "prompt": "Læs API-nøglen fra Environment.GetEnvironmentVariable(\"API_KEY\").",
    "hint": "Commit aldrig API-nøgler til git-depotet."
  },
  "task-bandit-2-obfuscation": {
    "hardwareEffect": "De-obfuskator afkodede XOR-maskeret shellcode payload i hukommelsen.",
    "explanation": "Analyser obfuskerede strenge ved at anvende modsat XOR-ciffer.",
    "prompt": "Anvend XOR-maske 0x5A for at afkode beskyttet byte-array.",
    "hint": "byte decoded = (byte)(b ^ 0x5A);"
  },
  "task-bandit-3-wire-tap": {
    "hardwareEffect": "HMAC-signatur verificeret: manipuleret anmodning afvist med 403 Forbidden.",
    "explanation": "Beskyt pakkeintegritet mod Man-in-the-Middle med HMAC-SHA256 signaturer.",
    "prompt": "Verificer anmodningens signatur mod beregnet HMAC.",
    "hint": "Beregn HMAC over body og sammenlign med X-Signature headeren."
  },
  "task-bandit-4-sql-injection": {
    "hardwareEffect": "Parametriseret forespørgsel undveg sikkert skadelig inputstreng ' OR 1=1 --.",
    "explanation": "Undgå SQL-injektion ved at bruge parametriserede forespørgsler frem for strengsammenkædning.",
    "prompt": "Erstat sammenkædning med cmd.Parameters.AddWithValue(\"@user\", userInput).",
    "hint": "Sammenkæd aldrig upålideligt brugerinput i SQL-kommandoer."
  },
  "task-bandit-5-rate-limiter": {
    "hardwareEffect": "Rate limiter blokerede brute-force angreb med HTTP 429 Too Many Requests.",
    "explanation": "Throttling beskytter login-endepunkter mod brute-force gæt.",
    "prompt": "Returner Results.StatusCode(429) når anmodningstallet overstiger grænsen.",
    "hint": "Svar med HTTP 429 og Retry-After header."
  },
  "task-bandit-6-defense-in-depth": {
    "hardwareEffect": "Befæstet flerlags-gateway afviste simuleret angrebsvektor.",
    "explanation": "Defense in depth kombinerer TLS, autentificering, rate limiting og validering.",
    "prompt": "Kobl TLS-tvang, Bearer auth og RateLimiter i API-middlewarepipelinen.",
    "hint": "Sammensæt alle sikkerhedsmiddlewares i Startup-pipelinen."
  }
};

export function getLocalizedWorkedExample<T extends { demonstrationLog?: any; explanation?: any; finalChallenge?: any }>(
  workedExample: T | undefined,
  taskId: string,
  lang: string = "ua"
): T | undefined {
  if (!workedExample) return undefined;
  if (lang === "ua") return workedExample;

  const dict = lang === "da" ? WORKED_EXAMPLES_DA : lang === "en" ? WORKED_EXAMPLES_EN : undefined;
  const translation = dict?.[taskId];
  if (!translation) return workedExample;

  return {
    ...workedExample,
    demonstrationLog: {
      ...workedExample.demonstrationLog,
      hardwareEffect: translation.hardwareEffect || workedExample.demonstrationLog?.hardwareEffect,
    },
    explanation: translation.explanation || workedExample.explanation,
    finalChallenge: {
      ...workedExample.finalChallenge,
      prompt: translation.prompt || workedExample.finalChallenge?.prompt,
      hint: translation.hint || workedExample.finalChallenge?.hint,
    },
  };
}
