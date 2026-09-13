import fs from "fs";
import path from "path";

const theoryPath = path.resolve(process.cwd(), "packages/i18n/src/theory.ts");
let content = fs.readFileSync(theoryPath, "utf-8");

// Define the new entries

// --- API FORGE (EN & DA) ---
const apiEn = `
    "task-api-1-heartbeat": {
      concept: "Heartbeat health checking over HTTP GET /health protocol.",
      tokens: [
        { token: "app.MapGet", role: "Route Mapping", explanation: "Registers an HTTP GET route in the Kestrel routing pipeline." },
        { token: '"/health"', role: "URL Route Path", explanation: "The exact endpoint path clients ping to test service liveness." },
        { token: "Results.Ok()", role: "HTTP Status 200", explanation: "Returns a standard 200 OK status code with JSON serialized payload." },
      ],
      notes: "Health check endpoints must be lightweight and should avoid triggering heavy database queries or CPU spikes.",
      diff: "In C#: app.MapGet(\\"/health\\", () => Results.Ok(...));. In Go: http.HandleFunc(\\"/health\\", func(w, r) { w.WriteHeader(http.StatusOK) }).",
    },
    "task-api-2-path-params": {
      concept: "URL Route Parameters and defensive 404 Guard checking.",
      tokens: [
        { token: "{id}", role: "Route Parameter", explanation: "Dynamic URL segment extracted by the web framework router." },
        { token: "repo.Find(id)", role: "Data Lookup", explanation: "Queries the data store for the entity matching the extracted key." },
        { token: "Results.NotFound()", role: "HTTP Status 404", explanation: "Returns 404 Not Found if the entity does not exist, guarding against null errors." },
      ],
      notes: "A 404 Guard prevents server crashes (HTTP 500) caused by dereferencing null pointers.",
      diff: "In C#: app.MapGet(\\"/api/devices/{id}\\", (string id) => ...). In Go: strings.TrimPrefix(r.URL.Path, \\"/api/devices/\\").",
    },
    "task-api-3-dto-validation": {
      concept: "Incoming JSON payload processing and DTO field validation with 400 Bad Request and 201 Created codes.",
      tokens: [
        { token: "app.MapPost", role: "HTTP POST", explanation: "Listens for requests aiming to create a new resource." },
        { token: "CreateOrderDto dto", role: "Model Binding", explanation: "Automatically deserializes request JSON body into a strongly-typed DTO." },
        { token: "Results.BadRequest()", role: "HTTP Status 400", explanation: "Rejects malformed input when required fields are missing or invalid." },
        { token: "Results.Created()", role: "HTTP Status 201", explanation: "Confirms successful creation of the resource with location header." },
      ],
      notes: "DTO validation must always execute prior to any persistence in databases or file stores.",
      diff: "In C#: Results.Created(uri, order). In Go: w.WriteHeader(http.StatusCreated); json.NewEncoder(w).Encode(order).",
    },
    "task-api-4-bearer-auth": {
      concept: "API Security and authorization header parsing using Bearer tokens.",
      tokens: [
        { token: "Headers.Authorization", role: "HTTP Header", explanation: "Standard HTTP protocol header carrying authentication credentials." },
        { token: 'StartsWith("Bearer ")', role: "Scheme Check", explanation: "Validates the standard Bearer token scheme format." },
        { token: "Results.Unauthorized()", role: "HTTP Status 401", explanation: "Rejects unauthenticated requests lacking valid credentials." },
      ],
      notes: "401 Unauthorized denotes missing or invalid credentials; 403 Forbidden denotes valid credentials with insufficient permissions.",
      diff: "In C#: ctx.Request.Headers.Authorization.ToString(). In Go: r.Header.Get(\\"Authorization\\").",
    },
    "task-api-5-client-consumer": {
      concept: "HTTP client construction, network execution, and JSON deserialization.",
      tokens: [
        { token: "HttpClient", role: "HTTP Client", explanation: "Class used for dispatching HTTP requests and receiving responses over TCP sockets." },
        { token: "EnsureSuccessStatusCode()", role: "Status Check", explanation: "Verifies the status code is within 200..299, throwing HttpRequestException otherwise." },
        { token: "ReadFromJsonAsync<T>()", role: "JSON Deserializer", explanation: "Parses UTF-8 byte stream into a strongly-typed in-memory model." },
      ],
      notes: "In Go, always close the response body stream using defer resp.Body.Close() to prevent socket descriptor leaks.",
      diff: "In C#: await client.GetAsync(url). In Go: resp, err := http.Get(url).",
    },
    "task-api-6-resilient-retry": {
      concept: "Network resilience against transient faults: the Retry pattern with exponential backoff.",
      tokens: [
        { token: "for (attempt = 1..3)", role: "Retry Loop", explanation: "Bounds maximum retry attempts, preventing unbounded loops." },
        { token: "catch (HttpRequestException)", role: "Fault Isolation", explanation: "Catches transient network errors while letting business logic faults propagate." },
        { token: "Task.Delay(100 * attempt)", role: "Exponential Backoff", explanation: "Introduces an incremental pause between retries allowing the network to recover." },
      ],
      notes: "Never perform retries without delay or jitter — this triggers devastating retry storms on congested backends.",
      diff: "In C#: await Task.Delay(ms). In Go: time.Sleep(duration).",
    },
    "task-api-6-resiliency-retry": {
      concept: "Network resilience against transient faults: the Retry pattern with exponential backoff.",
      tokens: [
        { token: "for (attempt = 1..3)", role: "Retry Loop", explanation: "Bounds maximum retry attempts, preventing unbounded loops." },
        { token: "catch (HttpRequestException)", role: "Fault Isolation", explanation: "Catches transient network errors while letting business logic faults propagate." },
        { token: "Task.Delay(100 * attempt)", role: "Exponential Backoff", explanation: "Introduces an incremental pause between retries allowing the network to recover." },
      ],
      notes: "Never perform retries without delay or jitter — this triggers devastating retry storms on congested backends.",
      diff: "In C#: await Task.Delay(ms). In Go: time.Sleep(duration).",
    },`;

const apiDa = `
    "task-api-1-heartbeat": {
      concept: "Heartbeat-kontrol af servertilgængelighed via HTTP GET /health.",
      tokens: [
        { token: "app.MapGet", role: "Route Mapping", explanation: "Registrerer en HTTP GET-rute i Kestrels routing-pipeline." },
        { token: '"/health"', role: "URL Route Path", explanation: "Endpoint-stien som klienter forespørger for at teste systemstatus." },
        { token: "Results.Ok()", role: "HTTP Status 200", explanation: "Returnerer en 200 OK HTTP-status med JSON-serialiseret payload." },
      ],
      notes: "Healthcheck-endpoints må ikke kalde tunge databaser eller udføre CPU-krævende beregninger.",
      diff: "I C#: app.MapGet(\\"/health\\", () => Results.Ok(...));. I Go: http.HandleFunc(\\"/health\\", func(w, r) { w.WriteHeader(http.StatusOK) }).",
    },
    "task-api-2-path-params": {
      concept: "Rute-parametre (URL Route Parameters) og defensiv 404 Guard-kontrol.",
      tokens: [
        { token: "{id}", role: "Route Parameter", explanation: "Dynamisk URL-segment udtrukket af routing-motoren." },
        { token: "repo.Find(id)", role: "Data Lookup", explanation: "Søger efter entiteten i lageret ud fra den modtagne identifikator." },
        { token: "Results.NotFound()", role: "HTTP Status 404", explanation: "Returnerer 404 Not Found hvis ressourcen ikke findes, og forhindrer null-fejl." },
      ],
      notes: "En 404 Guard forhindrer servernedbrud med HTTP 500 forårsaget af null-referencer.",
      diff: "I C#: app.MapGet(\\"/api/devices/{id}\\", (string id) => ...). I Go: strings.TrimPrefix(r.URL.Path, \\"/api/devices/\\").",
    },
    "task-api-3-dto-validation": {
      concept: "Validering af indgående JSON-payload og DTO-felter med 400 Bad Request og 201 Created.",
      tokens: [
        { token: "app.MapPost", role: "HTTP POST", explanation: "Lytter efter forespørgsler der opretter en ny ressource." },
        { token: "CreateOrderDto dto", role: "Model Binding", explanation: "Automatisk deserialisering af JSON-body til et stærkt typet DTO-objekt." },
        { token: "Results.BadRequest()", role: "HTTP Status 400", explanation: "Afviser ugyldige data hvis obligatoriske felter mangler." },
        { token: "Results.Created()", role: "HTTP Status 201", explanation: "Bekræfter succesfuld oprettelse af den nye ressource med lokation." },
      ],
      notes: "DTO-validering skal altid ske inden data persisteres til databasen.",
      diff: "I C#: Results.Created(uri, order). I Go: w.WriteHeader(http.StatusCreated); json.NewEncoder(w).Encode(order).",
    },
    "task-api-4-bearer-auth": {
      concept: "API-sikkerhed og autorisation via Authorization-header med Bearer-token.",
      tokens: [
        { token: "Headers.Authorization", role: "HTTP Header", explanation: "Standard HTTP-header til overførsel af legitimationsoplysninger." },
        { token: 'StartsWith("Bearer ")', role: "Scheme Check", explanation: "Kontrol af standardformatet for Bearer-tokens." },
        { token: "Results.Unauthorized()", role: "HTTP Status 401", explanation: "Blokerer uautoriserede anmodninger uden gyldigt token." },
      ],
      notes: "401 Unauthorized betyder manglende eller ugyldig token; 403 Forbidden betyder gyldig token, men utilstrækkelige rettigheder.",
      diff: "I C#: ctx.Request.Headers.Authorization.ToString(). I Go: r.Header.Get(\\"Authorization\\").",
    },
    "task-api-5-client-consumer": {
      concept: "Udvikling af HTTP-klient, anmodningsudførelse og JSON-deserialisering.",
      tokens: [
        { token: "HttpClient", role: "HTTP Client", explanation: "Klasse til afsendelse af HTTP-forespørgsler og modtagelse af svar over netværket." },
        { token: "EnsureSuccessStatusCode()", role: "Status Check", explanation: "Sikrer at svarkoden ligger i intervallet 200..299, ellers kastes en undtagelse." },
        { token: "ReadFromJsonAsync<T>()", role: "JSON Deserializer", explanation: "Omdanner modtagne JSON-bytes i hukommelsen til en C#-struktur." },
      ],
      notes: "I Go skal responsens body altid lukkes med defer resp.Body.Close() for at undgå socket-lækager.",
      diff: "I C#: await client.GetAsync(url). I Go: resp, err := http.Get(url).",
    },
    "task-api-6-resilient-retry": {
      concept: "Modstandsdygtighed over for netværksfejl: Retry-mønsteret med eksponentiel backoff.",
      tokens: [
        { token: "for (attempt = 1..3)", role: "Retry Loop", explanation: "Begrænser det maksimale antal gentagelsesforsøg for at forhindre uendelige løkker." },
        { token: "catch (HttpRequestException)", role: "Fault Isolation", explanation: "Fanger kun midlertidige netværksfejl og isolerer forretningslogik." },
        { token: "Task.Delay(100 * attempt)", role: "Exponential Backoff", explanation: "Øger pausen mellem forsøg, så netværksforbindelsen får tid til at stabilisere sig." },
      ],
      notes: "Udfør aldrig gentagne anmodninger uden forsinkelse — dette kan forårsage en lavine af fejl (Retry Storm).",
      diff: "I C#: await Task.Delay(ms). I Go: time.Sleep(duration).",
    },
    "task-api-6-resiliency-retry": {
      concept: "Modstandsdygtighed over for netværksfejl: Retry-mønsteret med eksponentiel backoff.",
      tokens: [
        { token: "for (attempt = 1..3)", role: "Retry Loop", explanation: "Begrænser det maksimale antal gentagelsesforsøg for at forhindre uendelige løkker." },
        { token: "catch (HttpRequestException)", role: "Fault Isolation", explanation: "Fanger kun midlertidige netværksfejl og isolerer forretningslogik." },
        { token: "Task.Delay(100 * attempt)", role: "Exponential Backoff", explanation: "Øger pausen mellem forsøg, så netværksforbindelsen får tid til at stabilisere sig." },
      ],
      notes: "Udfør aldrig gentagne anmodninger uden forsinkelse — dette kan forårsage en lavine af fejl (Retry Storm).",
      diff: "I C#: await Task.Delay(ms). I Go: time.Sleep(duration).",
    },`;

// --- GIT TIME MACHINE (UA, EN, DA) ---
const gitUa = `
    "task-git-1-first-commit": {
      concept: "Ініціалізація точки збереження (Commit) у графовій базі даних Git. Фіксація стану індексного буфера (Staging Area) в незмінний хеш-вузол SHA-1.",
      tokens: [
        { token: "git add .", role: "Staging Operator", explanation: "Додає всі змінені файли робочої директорії до індексу підготовки (Staging Area)." },
        { token: "git commit", role: "DAG Node Creator", explanation: "Створює постійний незмінний вузол у графі історії зі знімком стану проєкту." },
        { token: '-m "message"', role: "Commit Metadata", explanation: "Прикріплює обов'язковий інженерний опис суті внесених змін." },
      ],
      notes: "Кожен коміт має унікальний криптографічний хеш SHA-1, що гарантує цілісність коду.",
      diff: "У C#: Process.Start(\\"git\\", \\"commit -m ...\\"). У Go: exec.Command(\\"git\\", \\"commit\\", \\"-m\\", \\"...\\").Run().",
    },
    "task-git-2-branching": {
      concept: "Створення паралельної гілки (Branching). Гілка в Git — це легковаговий рухомий вказівник на конкретний коміт у графі DAG.",
      tokens: [
        { token: "git checkout -b", role: "Branch Operator", explanation: "Створює нову гілку та миттєво перемикає на неї активний контекст HEAD." },
        { token: "feature/branch", role: "Branch Reference", explanation: "Назва нової ізольованої гілки для розробки нової функціональності." },
        { token: "HEAD", role: "Active Pointer", explanation: "Вказівник Git, що вказує на поточну активну гілку або коміт у робочій копії." },
      ],
      notes: "Створення гілки в Git коштує лише 41 байт пам'яті, оскільки створюється лише файл з хешем коміту.",
      diff: "У Git: git checkout -b feature/telemetry або сучасне git switch -c feature/telemetry.",
    },
    "task-git-3-feature-merge": {
      concept: "Злиття гілок (Fast-Forward та 3-Way Merge). Об'єднання змін з фіче-гілки в основну гілку main зі створенням спільного вузла.",
      tokens: [
        { token: "git checkout main", role: "Target Context", explanation: "Перемикання на цільову гілку, в яку будуть вливатися зміни." },
        { token: "git merge", role: "DAG Join Operator", explanation: "Запускає алгоритм об'єднання історій двох незалежних гілок." },
        { token: "feature/telemetry", role: "Source Branch", explanation: "Джерело змін, чия історія інтегрується в поточну гілку." },
      ],
      notes: "Якщо в main не було нових комітів, Git виконує швидке перемотування (Fast-Forward) без створення зайвого мердж-коміту.",
      diff: "У C#: Process.Start(\\"git\\", \\"merge feature/telemetry\\"). У Go: exec.Command(\\"git\\", \\"merge\\", \\"feature/telemetry\\").Run().",
    },
    "task-git-4-merge-conflict": {
      concept: "Вирішення конфліктів злиття (Merge Conflict Resolution). Виникає коли обидва коміти модифікували однакові рядки коду з моменту спільного предка.",
      tokens: [
        { token: "<<<<<<< HEAD", role: "Conflict Start Marker", explanation: "Позначає початок локальних змін поточної гілки main." },
        { token: "=======", role: "Conflict Splitter", explanation: "Роздільник між локальною та вхідною версіями рядків." },
        { token: ">>>>>>> branch", role: "Conflict End Marker", explanation: "Позначає завершення змін вхідної гілки, яка зливається." },
        { token: "git add", role: "Resolution Confirmation", explanation: "Позначає конфліктний файл як успішно вирішений інженером." },
      ],
      notes: "Автоматичне злиття неможливе при конкурентних правках однакових рядків; інженер зобов'язаний обрати або об'єднати версії вручну.",
      diff: "Після ручного редагування маркерів конфлікту обов'язково виконати: git add <file> && git commit.",
    },
    "task-git-5-time-travel-checkout": {
      concept: "Подорож у часі за хешем коміту (Detached HEAD & Time Travel). Переміщення вказівника HEAD безпосередньо на історичний коміт для інспекції минулого стану.",
      tokens: [
        { token: "git checkout <hash>", role: "Time Travel", explanation: "Переводить репозиторій у стан Detached HEAD на зазначений історичний коміт." },
        { token: "commit-hash", role: "Immutable Identifier", explanation: "Унікальний SHA-1 хеш цільового знімка стану системи." },
        { token: "Detached HEAD", role: "State Indicator", explanation: "Режим роботи без прив'язки до гілки — будь-які нові коміти тут не збережуться без нової гілки." },
      ],
      notes: "Щоб зберегти експерименти зі стану Detached HEAD, створіть від нього нову гілку через git switch -c new-branch.",
      diff: "У Git: git checkout c2b1a4 або сучасне git switch --detach c2b1a4.",
    },
    "task-git-6-bisect-hotfix": {
      concept: "Пошук регресій бінарним пошуком (Git Bisect) та терміновий реліз виправлення (Hotfix cherry-pick/commit).",
      tokens: [
        { token: "git bisect start", role: "Binary Search Init", explanation: "Запускає алгоритмічний логарифмічний O(log N) пошук дефектного коміту." },
        { token: "git bisect bad/good", role: "State Marking", explanation: "Позначає поточний коміт як зламаний (bad) або справний (good)." },
        { token: "git cherry-pick", role: "Patch Extraction", explanation: "Застосовує конкретний одиничний коміт з виправленням прямо в релізну гілку." },
      ],
      notes: "Git Bisect скорочує перевірку 1000 комітів усього до 10 кроків тестування.",
      diff: "У C#: Process.Start(\\"git\\", \\"cherry-pick <hash>\\"). У Go: exec.Command(\\"git\\", \\"cherry-pick\\", hash).Run().",
    },`;

const gitEn = `
    "task-git-1-first-commit": {
      concept: "Initializing a state checkpoint (Commit) in the Git Directed Acyclic Graph (DAG). Moving files from Staging Area into an immutable SHA-1 hash node.",
      tokens: [
        { token: "git add .", role: "Staging Operator", explanation: "Stages all modified working directory files into the Git index." },
        { token: "git commit", role: "DAG Node Creator", explanation: "Creates a permanent, immutable historical snapshot in the DAG." },
        { token: '-m "message"', role: "Commit Metadata", explanation: "Attaches a mandatory engineering summary describing the intent of the change." },
      ],
      notes: "Every commit has a unique SHA-1 cryptographic digest ensuring tamper-proof history.",
      diff: "In C#: Process.Start(\\"git\\", \\"commit -m ...\\"). In Go: exec.Command(\\"git\\", \\"commit\\", \\"-m\\", \\"...\\").Run().",
    },
    "task-git-2-branching": {
      concept: "Parallel timeline creation (Branching). In Git, a branch is merely a lightweight, movable pointer to a specific commit node.",
      tokens: [
        { token: "git checkout -b", role: "Branch Operator", explanation: "Creates a new branch pointer and switches HEAD context to it immediately." },
        { token: "feature/branch", role: "Branch Reference", explanation: "Identifies the isolated working branch for feature development." },
        { token: "HEAD", role: "Active Pointer", explanation: "Git special reference pointing to the currently active working branch or commit." },
      ],
      notes: "Creating a branch in Git costs only 41 bytes of disk space because it is merely a text file storing a commit hash.",
      diff: "In Git: git checkout -b feature/telemetry or modern git switch -c feature/telemetry.",
    },
    "task-git-3-feature-merge": {
      concept: "Merging branches (Fast-Forward & 3-Way Merge). Integrating feature branch changes into the primary main branch.",
      tokens: [
        { token: "git checkout main", role: "Target Context", explanation: "Switches context to the recipient target branch prior to merge." },
        { token: "git merge", role: "DAG Join Operator", explanation: "Executes the DAG integration algorithm joining two diverging commit histories." },
        { token: "feature/telemetry", role: "Source Branch", explanation: "The origin branch whose changes are being incorporated." },
      ],
      notes: "If no divergent commits exist on main, Git executes a Fast-Forward merge by advancing the pointer without an extra merge commit.",
      diff: "In C#: Process.Start(\\"git\\", \\"merge feature/telemetry\\"). In Go: exec.Command(\\"git\\", \\"merge\\", \\"feature/telemetry\\").Run().",
    },
    "task-git-4-merge-conflict": {
      concept: "Merge Conflict Resolution. Occurs when two branches modify the identical line of code concurrently since their common ancestor.",
      tokens: [
        { token: "<<<<<<< HEAD", role: "Conflict Start Marker", explanation: "Denotes the boundary of current branch local changes." },
        { token: "=======", role: "Conflict Splitter", explanation: "Divider line separating current branch code from incoming branch code." },
        { token: ">>>>>>> branch", role: "Conflict End Marker", explanation: "Denotes the terminus of incoming branch changes." },
        { token: "git add", role: "Resolution Confirmation", explanation: "Marks the resolved file as staged, confirming conflict resolution." },
      ],
      notes: "Automatic merge is suspended during conflicts; an engineer must manually reconcile conflicting blocks before completing the commit.",
      diff: "After manually resolving markers in file: git add <file> && git commit.",
    },
    "task-git-5-time-travel-checkout": {
      concept: "Time travel by commit hash (Detached HEAD). Repositioning HEAD directly onto an arbitrary historical commit to inspect past states.",
      tokens: [
        { token: "git checkout <hash>", role: "Time Travel", explanation: "Transitions repo into Detached HEAD state pointing at specified past commit." },
        { token: "commit-hash", role: "Immutable Identifier", explanation: "40-character SHA-1 identifier of the historical snapshot." },
        { token: "Detached HEAD", role: "State Indicator", explanation: "State where HEAD points directly to a commit rather than a movable branch name." },
      ],
      notes: "To preserve work created while in Detached HEAD, create a branch before leaving: git switch -c branch-name.",
      diff: "In Git: git checkout c2b1a4 or modern git switch --detach c2b1a4.",
    },
    "task-git-6-bisect-hotfix": {
      concept: "Binary search regression hunting (Git Bisect) and critical release hotfix cherry-picking.",
      tokens: [
        { token: "git bisect start", role: "Binary Search Init", explanation: "Initializes algorithmic logarithmic O(log N) search for the defect-inducing commit." },
        { token: "git bisect bad/good", role: "State Marking", explanation: "Tags tested commits as defective (bad) or healthy (good)." },
        { token: "git cherry-pick", role: "Patch Extraction", explanation: "Applies the exact patch from a single commit directly onto the release branch." },
      ],
      notes: "Git Bisect reduces investigating 1,000 commits down to approximately 10 test steps.",
      diff: "In C#: Process.Start(\\"git\\", \\"cherry-pick <hash>\\"). In Go: exec.Command(\\"git\\", \\"cherry-pick\\", hash).Run().",
    },`;

const gitDa = `
    "task-git-1-first-commit": {
      concept: "Initialisering af et gemmepunkt (Commit) i Gits rettede acykliske graf (DAG). Overførsel af filer fra Staging Area til en uforanderlig SHA-1 hashknude.",
      tokens: [
        { token: "git add .", role: "Staging Operator", explanation: "Tilføjer alle ændrede filer fra arbejdsmappen til klargøringsområdet (Staging Area)." },
        { token: "git commit", role: "DAG Node Creator", explanation: "Opretter et permanent, uforanderligt historisk snapshot i grafen." },
        { token: '-m "message"', role: "Commit Metadata", explanation: "Vedhæfter en obligatorisk ingeniørmæssig beskrivelse af ændringen." },
      ],
      notes: "Hvert commit har et unikt kryptografisk SHA-1 hash, som sikrer kildekodens integritet.",
      diff: "I C#: Process.Start(\\"git\\", \\"commit -m ...\\"). I Go: exec.Command(\\"git\\", \\"commit\\", \\"-m\\", \\"...\\").Run().",
    },
    "task-git-2-branching": {
      concept: "Oprettelse af parallel tidslinje (Branching). En branch i Git er blot en letvægts, bevægelig peger på et specifikt commit.",
      tokens: [
        { token: "git checkout -b", role: "Branch Operator", explanation: "Opretter en ny branch og skifter straks HEAD-konteksten over på den." },
        { token: "feature/branch", role: "Branch Reference", explanation: "Navnet på den isolerede arbejdsgren til udvikling af ny funktionalitet." },
        { token: "HEAD", role: "Active Pointer", explanation: "Git-peger der angiver det aktuelt aktive commit eller branch i arbejdsmappen." },
      ],
      notes: "Oprettelse af en branch koster kun 41 bytes hukommelse, da Git blot gemmer et commit-hash i en tekstfil.",
      diff: "I Git: git checkout -b feature/telemetry eller moderne git switch -c feature/telemetry.",
    },
    "task-git-3-feature-merge": {
      concept: "Sammenfletning af branches (Fast-Forward og 3-Way Merge). Integrering af ændringer fra en feature-branch ind i hovedgrenen main.",
      tokens: [
        { token: "git checkout main", role: "Target Context", explanation: "Skifter til modtagergrenen inden sammenfletning påbegyndes." },
        { token: "git merge", role: "DAG Join Operator", explanation: "Eksekverer flettealgoritmen der forener to uafhængige versionshistorikker." },
        { token: "feature/telemetry", role: "Source Branch", explanation: "Kilden hvis ændringer inddrages i den aktive gren." },
      ],
      notes: "Hvis main ikke har nye commits, udfører Git en hurtig fremspoling (Fast-Forward) uden et ekstra flette-commit.",
      diff: "I C#: Process.Start(\\"git\\", \\"merge feature/telemetry\\"). I Go: exec.Command(\\"git\\", \\"merge\\", \\"feature/telemetry\\").Run().",
    },
    "task-git-4-merge-conflict": {
      concept: "Løsning af flettekonflikter (Merge Conflict Resolution). Opstår når to branches har ændret de samme kodelinjer sideløbende.",
      tokens: [
        { token: "<<<<<<< HEAD", role: "Conflict Start Marker", explanation: "Markerer starten på lokale ændringer i den aktive gren." },
        { token: "=======", role: "Conflict Splitter", explanation: "Adskiller den lokale version fra den indkommende version." },
        { token: ">>>>>>> branch", role: "Conflict End Marker", explanation: "Markerer slutningen på ændringerne fra den indkommende gren." },
        { token: "git add", role: "Resolution Confirmation", explanation: "Stager den rettede fil og bekræfter hermed at konflikten er løst." },
      ],
      notes: "Automatisk sammenfletning standses ved konflikter; udvikleren skal manuelt udvælge eller kombinere linjerne.",
      diff: "Efter manuel rettelse af markører i filen: git add <fil> && git commit.",
    },
    "task-git-5-time-travel-checkout": {
      concept: "Tidsrejse via commit-hash (Detached HEAD). Flytning af HEAD direkte til et historisk commit for at inspicere tidligere tilstande.",
      tokens: [
        { token: "git checkout <hash>", role: "Time Travel", explanation: "Sætter arkivet i Detached HEAD-tilstand ved det angivne historiske commit." },
        { token: "commit-hash", role: "Immutable Identifier", explanation: "Unik 40-tegns SHA-1 identifikator for det historiske snapshot." },
        { token: "Detached HEAD", role: "State Indicator", explanation: "Tilstand hvor HEAD peger direkte på et commit og ikke en navngiven branch." },
      ],
      notes: "For at bevare ændringer foretaget i Detached HEAD, skal der oprettes en branch: git switch -c nyt-branchnavn.",
      diff: "I Git: git checkout c2b1a4 eller moderne git switch --detach c2b1a4.",
    },
    "task-git-6-bisect-hotfix": {
      concept: "Fejlfinding med binær søgning (Git Bisect) og udrulning af kritisk rettelse (Hotfix cherry-pick).",
      tokens: [
        { token: "git bisect start", role: "Binary Search Init", explanation: "Starter algoritmisk O(log N) søgning efter det commit der introducerede fejlen." },
        { token: "git bisect bad/good", role: "State Marking", explanation: "Marker det aktuelle commit som defekt (bad) eller velfungerende (good)." },
        { token: "git cherry-pick", role: "Patch Extraction", explanation: "Overfører og anvender et specifikt enkelt-commit direkte på release-grenen." },
      ],
      notes: "Git Bisect reducerer gennemsøgningen af 1.000 commits til blot cirka 10 testtrin.",
      diff: "I C#: Process.Start(\\"git\\", \\"cherry-pick <hash>\\"). I Go: exec.Command(\\"git\\", \\"cherry-pick\\", hash).Run().",
    },`;

// --- CYBER BANDIT LAB (UA, EN, DA) ---
const banditUa = `
    "task-bandit-1-hidden-key": {
      concept: "Захист конфігураційних секретів та ключів доступу через змінні оточення (Environment Variables). Заборона хардкоду секретів у коді.",
      tokens: [
        { token: "Environment.GetEnvironmentVariable", role: "OS Secret Provider", explanation: "Зчитує секретні змінні безпосередньо з пам'яті процесу операційної системи." },
        { token: '"BANDIT_SECRET_KEY"', role: "Configuration Key", explanation: "Назва змінної середовища, що містить приватний токен доступу." },
        { token: "throw new InvalidOperationException()", role: "Fail-Fast Guard", explanation: "Миттєво зупиняє запуск додатку, якщо секрет не знайдено або він порожній." },
      ],
      notes: "Ніколи не залишайте приватні токени, ключі API або паролі у Git-репозиторії.",
      diff: "У C#: Environment.GetEnvironmentVariable(\\"KEY\\"). У Go: os.Getenv(\\"KEY\\").",
    },
    "task-bandit-2-obfuscation": {
      concept: "Деобфускація та криптографічне декодування (Base64 / Reverse Engineering). Розшифрування замаскованих констант у захищеному середовищі.",
      tokens: [
        { token: "Convert.FromBase64String", role: "Binary Decoder", explanation: "Перетворює безпечний текстовий Base64 формат у сирий масив байтів." },
        { token: "Encoding.UTF8.GetString", role: "String Reconstruction", explanation: "Декодує байтовий потік у людиночитабельний текст за стандартом UTF-8." },
        { token: "ReadOnlySpan<byte>", role: "Zero-Allocation Buffer", explanation: "Безпечна робота з пам'яттю без створення зайвих копій у купі (Heap)." },
      ],
      notes: "Base64 не є шифруванням, це лише формат кодування даних для передачі через текстові канали.",
      diff: "У C#: Encoding.UTF8.GetString(Convert.FromBase64String(s)). У Go: base64.StdEncoding.DecodeString(s).",
    },
    "task-bandit-3-wire-tap": {
      concept: "Перевірка цілісності мережевого трафіку через криптографічний підпис HMAC-SHA256 (Message Authentication Code) для захисту від атак Man-in-the-Middle.",
      tokens: [
        { token: "HMACSHA256", role: "Cryptographic Hasher", explanation: "Створює хеш із використанням секретного ключа для перевірки автентичності повідомлення." },
        { token: "ComputeHash", role: "Digest Generation", explanation: "Обчислює 256-бітний цифровий відбиток для пакету даних." },
        { token: "FixedTimeEquals", role: "Timing Attack Guard", explanation: "Порівнює підписи за фіксований час, захищаючи від атак по витоку часу (Timing Attacks)." },
      ],
      notes: "Звичайне порівняння рядків оператором == розкриває символи зловмиснику через вимір наносекунд виконання.",
      diff: "У C#: CryptographicOperations.FixedTimeEquals(a, b). У Go: hmac.Equal(macA, macB).",
    },
    "task-bandit-4-sql-injection": {
      concept: "Захист від SQL-ін'єкцій через параметризовані запити (Prepared Statements). Жорстке відокремлення SQL-інструкцій від даних користувача.",
      tokens: [
        { token: "@username", role: "SQL Parameter Placeholder", explanation: "Параметр-замінник у запиті, який інтерпретується рушієм СУБД суворо як літерал, а не команда." },
        { token: "Parameters.AddWithValue", role: "Safe Parameter Binding", explanation: "Безпечно прив'язує значення користувача до SQL-параметра з автоекрануванням." },
        { token: "SqlCommand", role: "Query Dispatcher", explanation: "Об'єкт команди, що передає скомпільований запит та параметри окремими потоками." },
      ],
      notes: "Конкатенація рядків у SQL (\`SELECT * FROM users WHERE name = '\` + input) є критичною вразливістю OWASP Top 10.",
      diff: "У C#: cmd.Parameters.AddWithValue(\\"@name\\", input). У Go: db.Query(\\"SELECT * FROM t WHERE name = $1\\", input).",
    },
    "task-bandit-5-rate-limiter": {
      concept: "Захист від підбору паролів та перевантаження (Brute Force / DoS) за алгоритмом Token Bucket (Rate Limiter).",
      tokens: [
        { token: "TokenBucket", role: "Throttling Algorithm", explanation: "Накопичує лімітовану кількість токенів, поповнюючи резерв з постійною швидкістю." },
        { token: "Consume(ip)", role: "Token Acquisition", explanation: "Списує один токен для даного IP-клієнта або повертає відмову при вичерпанні ліміту." },
        { token: "429 Too Many Requests", role: "HTTP Throttle Status", explanation: "Стандартна відповідь при перевищенні ліміту частоти запитів." },
      ],
      notes: "Rate Limiter захищає серверні ресурси від автоматизованих ботнетів та вичерпання пулу з'єднань.",
      diff: "У C#: Microsoft.AspNetCore.RateLimiting. У Go: golang.org/x/time/rate.NewLimiter().",
    },
    "task-bandit-6-defense-in-depth": {
      concept: "Ешелонована оборона (Defense-in-Depth): комбінація валідації входу, захисних CSP заголовків та аудиторського журналу подій безпеки.",
      tokens: [
        { token: "ValidateCsrfToken", role: "CSRF Guard", explanation: "Перевіряє криптографічний одноразовий токен для запобігання підробці міжсайтових запитів." },
        { token: "Content-Security-Policy", role: "CSP Header", explanation: "Забороняє браузеру виконувати несанкціоновані скрипти та ін'єкції XSS." },
        { token: "AuditLogger.LogSecurityEvent", role: "Tamper-Evident Trail", explanation: "Фіксує підозрілі спроби доступу в ізольованому журналі аудиту." },
      ],
      notes: "Справжня безпека будується на припущенні, що один із захисних бар'єрів обов'язково буде пробитий.",
      diff: "У C#: app.UseSecurityHeaders(). У Go: secureMiddleware.Handler(httpHandler).",
    },`;

const banditEn = `
    "task-bandit-1-hidden-key": {
      concept: "Safeguarding configuration credentials and secret keys via Environment Variables. Zero hardcoded secrets in source files.",
      tokens: [
        { token: "Environment.GetEnvironmentVariable", role: "OS Secret Provider", explanation: "Reads secret configuration directly from operating system process memory." },
        { token: '"BANDIT_SECRET_KEY"', role: "Configuration Key", explanation: "Environment descriptor pointing to the private access token." },
        { token: "throw new InvalidOperationException()", role: "Fail-Fast Guard", explanation: "Immediately terminates application startup if the credential is absent or blank." },
      ],
      notes: "Never commit private tokens, API secrets, or passwords into any Git version control repository.",
      diff: "In C#: Environment.GetEnvironmentVariable(\\"KEY\\"). In Go: os.Getenv(\\"KEY\\").",
    },
    "task-bandit-2-obfuscation": {
      concept: "De-obfuscation and cryptographic binary decoding (Base64 / Reverse Engineering). Unpacking disguised parameters in controlled runtimes.",
      tokens: [
        { token: "Convert.FromBase64String", role: "Binary Decoder", explanation: "Converts text-safe Base64 encoded strings into raw binary byte arrays." },
        { token: "Encoding.UTF8.GetString", role: "String Reconstruction", explanation: "Decodes binary streams back into human-readable UTF-8 character strings." },
        { token: "ReadOnlySpan<byte>", role: "Zero-Allocation Buffer", explanation: "Enables memory-efficient byte inspection without heap allocation overhead." },
      ],
      notes: "Base64 is strictly an encoding format, not an encryption cipher.",
      diff: "In C#: Encoding.UTF8.GetString(Convert.FromBase64String(s)). In Go: base64.StdEncoding.DecodeString(s).",
    },
    "task-bandit-3-wire-tap": {
      concept: "Network packet integrity verification using HMAC-SHA256 (Message Authentication Code) to prevent Man-in-the-Middle tampering.",
      tokens: [
        { token: "HMACSHA256", role: "Cryptographic Hasher", explanation: "Computes a keyed cryptographic hash to verify data authenticity and origin." },
        { token: "ComputeHash", role: "Digest Generation", explanation: "Generates the 256-bit cryptographic digest over payload bytes." },
        { token: "FixedTimeEquals", role: "Timing Attack Guard", explanation: "Performs constant-time signature comparison to eliminate side-channel timing leaks." },
      ],
      notes: "Standard string equality (==) leaks byte match counts through microsecond timing differences.",
      diff: "In C#: CryptographicOperations.FixedTimeEquals(a, b). In Go: hmac.Equal(macA, macB).",
    },
    "task-bandit-4-sql-injection": {
      concept: "SQL Injection prevention using Parameterized Queries (Prepared Statements). Complete isolation between SQL commands and user inputs.",
      tokens: [
        { token: "@username", role: "SQL Parameter Placeholder", explanation: "Parameter token interpreted strictly as raw literal data by database query planners." },
        { token: "Parameters.AddWithValue", role: "Safe Parameter Binding", explanation: "Binds user variables with automatic type conversion and parameter escaping." },
        { token: "SqlCommand", role: "Query Dispatcher", explanation: "Command object transmitting SQL text and parameter data in separate protocol streams." },
      ],
      notes: "String interpolation in SQL queries (\`SELECT * FROM users WHERE name = '\` + input) is a critical OWASP Top 10 flaw.",
      diff: "In C#: cmd.Parameters.AddWithValue(\\"@name\\", input). In Go: db.Query(\\"SELECT * FROM t WHERE name = $1\\", input).",
    },
    "task-bandit-5-rate-limiter": {
      concept: "Protection against Brute Force and Denial-of-Service attacks via the Token Bucket Rate Limiter pattern.",
      tokens: [
        { token: "TokenBucket", role: "Throttling Algorithm", explanation: "Accumulates a fixed token capacity, refilling at a steady defined rate." },
        { token: "Consume(ip)", role: "Token Acquisition", explanation: "Deducts an allowance token for the client IP or rejects when capacity is depleted." },
        { token: "429 Too Many Requests", role: "HTTP Throttle Status", explanation: "Standard response indicating client has exceeded allotted throughput." },
      ],
      notes: "Rate limiters protect downstream computational resources and connection pools from robotic exhaustion.",
      diff: "In C#: Microsoft.AspNetCore.RateLimiting. In Go: golang.org/x/time/rate.NewLimiter().",
    },
    "task-bandit-6-defense-in-depth": {
      concept: "Defense-in-Depth architecture: combining input sanitization, strict CSP headers, CSRF protections, and tamper-evident audit logging.",
      tokens: [
        { token: "ValidateCsrfToken", role: "CSRF Guard", explanation: "Validates anti-forgery cryptographic token to foil cross-site request hijacking." },
        { token: "Content-Security-Policy", role: "CSP Header", explanation: "Restricts unauthorized script execution and resource loading in the browser." },
        { token: "AuditLogger.LogSecurityEvent", role: "Tamper-Evident Trail", explanation: "Emits structured security incident records into an immutable audit sink." },
      ],
      notes: "True security assumes any individual perimeter guard will eventually be breached.",
      diff: "In C#: app.UseSecurityHeaders(). In Go: secureMiddleware.Handler(httpHandler).",
    },`;

const banditDa = `
    "task-bandit-1-hidden-key": {
      concept: "Beskyttelse af konfigurationshemmeligheder og adgangsnøgler via miljøvariabler (Environment Variables). Forbud mod hardcoding af hemmeligheder i kildekoden.",
      tokens: [
        { token: "Environment.GetEnvironmentVariable", role: "OS Secret Provider", explanation: "Læser hemmelige variabler direkte fra operativsystemets proceshukommelse." },
        { token: '"BANDIT_SECRET_KEY"', role: "Configuration Key", explanation: "Navnet på den miljøvariabel der indeholder den private adgangstoken." },
        { token: "throw new InvalidOperationException()", role: "Fail-Fast Guard", explanation: "Standser omgående applikationsopstarten hvis hemmeligheden mangler eller er tom." },
      ],
      notes: "Gem aldrig private tokens, API-nøgler eller kodeord i et Git-arkiv.",
      diff: "I C#: Environment.GetEnvironmentVariable(\\"KEY\\"). I Go: os.Getenv(\\"KEY\\").",
    },
    "task-bandit-2-obfuscation": {
      concept: "Deobfuskering og kryptografisk afkodning (Base64 / Reverse Engineering). Dekodning af skjulte konstanter i et sikkert afviklingsmiljø.",
      tokens: [
        { token: "Convert.FromBase64String", role: "Binary Decoder", explanation: "Konverterer tekstbaseret Base64-format til et råt byte-array." },
        { token: "Encoding.UTF8.GetString", role: "String Reconstruction", explanation: "Afkoder rå bytes til en læsbar tekststreng efter UTF-8 standarden." },
        { token: "ReadOnlySpan<byte>", role: "Zero-Allocation Buffer", explanation: "Sikker hukommelseshåndtering uden unødvendig allokering på heapen." },
      ],
      notes: "Base64 er ikke kryptering, men udelukkende en datakodningsmetode til transmission over tekstbaserede kanaler.",
      diff: "I C#: Encoding.UTF8.GetString(Convert.FromBase64String(s)). I Go: base64.StdEncoding.DecodeString(s).",
    },
    "task-bandit-3-wire-tap": {
      concept: "Validering af netværkstrafikkens integritet via kryptografisk HMAC-SHA256 signatur (Message Authentication Code) for at modvirke Man-in-the-Middle angreb.",
      tokens: [
        { token: "HMACSHA256", role: "Cryptographic Hasher", explanation: "Genererer et keyed hash til verifikation af pakkens ægthed og oprindelse." },
        { token: "ComputeHash", role: "Digest Generation", explanation: "Beregner et 256-bit kryptografisk aftryk for datapakken." },
        { token: "FixedTimeEquals", role: "Timing Attack Guard", explanation: "Sammenligner signaturer med konstant tidsforbrug for at forhindre tidsbaserede sidekanalsangreb (Timing Attacks)." },
      ],
      notes: "Almindelig strengsammenligning med == afslører tegn til angriberen via nanosekund-målinger.",
      diff: "I C#: CryptographicOperations.FixedTimeEquals(a, b). I Go: hmac.Equal(macA, macB).",
    },
    "task-bandit-4-sql-injection": {
      concept: "Beskyttelse mod SQL-injektion via parametriserede forespørgsler (Prepared Statements). Fuldstændig adskillelse mellem SQL-kommandoer og brugerdata.",
      tokens: [
        { token: "@username", role: "SQL Parameter Placeholder", explanation: "Parameterpladsholder i forespørgslen som databasen udelukkende tolker som rå data." },
        { token: "Parameters.AddWithValue", role: "Safe Parameter Binding", explanation: "Knytter brugerværdier sikkert til SQL-parameteren med automatisk escaping." },
        { token: "SqlCommand", role: "Query Dispatcher", explanation: "Kommandoobjekt der sender SQL-forespørgslen og parametrene i adskilte datastrømme." },
      ],
      notes: "Strengkonkatenation i SQL (\`SELECT * FROM users WHERE name = '\` + input) udgør en kritisk OWASP Top 10 sårbarhed.",
      diff: "I C#: cmd.Parameters.AddWithValue(\\"@name\\", input). I Go: db.Query(\\"SELECT * FROM t WHERE name = $1\\", input).",
    },
    "task-bandit-5-rate-limiter": {
      concept: "Beskyttelse mod brute-force og DoS-angreb via Token Bucket-algoritmen (Rate Limiter).",
      tokens: [
        { token: "TokenBucket", role: "Throttling Algorithm", explanation: "Akkumulerer en fast mængde tokens og genopfylder med en jævn defineret hastighed." },
        { token: "Consume(ip)", role: "Token Acquisition", explanation: "Bruger en token for klientens IP eller afviser når kvoten er opbrugt." },
        { token: "429 Too Many Requests", role: "HTTP Throttle Status", explanation: "Standard svarkode ved overskridelse af den tilladte anmodningsfrekvens." },
      ],
      notes: "En Rate Limiter værner serverens ressourcer og forbindelsespuljer mod automatiserede botnet.",
      diff: "I C#: Microsoft.AspNetCore.RateLimiting. I Go: golang.org/x/time/rate.NewLimiter().",
    },
    "task-bandit-6-defense-in-depth": {
      concept: "Dybdeforsvar (Defense-in-Depth): kombination af inputvalidering, strenge CSP-headere og uforanderlig sikkerhedslogning.",
      tokens: [
        { token: "ValidateCsrfToken", role: "CSRF Guard", explanation: "Validerer kryptografisk engangstoken for at forhindre cross-site request forgery." },
        { token: "Content-Security-Policy", role: "CSP Header", explanation: "Forhindrer browseren i at afvikle uautoriserede scripts og XSS-injektioner." },
        { token: "AuditLogger.LogSecurityEvent", role: "Tamper-Evident Trail", explanation: "Registrerer mistænkelige adgangsforsøg i en manipulationssikret auditlog." },
      ],
      notes: "Robust IT-sikkerhed forudsætter at enhver individuel forsvarsbarriere på et tidspunkt kan blive brudt.",
      diff: "I C#: app.UseSecurityHeaders(). I Go: secureMiddleware.Handler(httpHandler).",
    },`;

// Check and append to theoryUa
const uaApiAlias = `
    "task-api-6-resiliency-retry": {
      concept: "Стійкість до мережевих збоїв: патерн Retry з експоненційною затримкою.",
      tokens: [
        { token: "for (attempt = 1..3)", role: "Retry Loop", explanation: "Обмежує максимальну кількість спроб повтору, запобігаючи нескінченним циклам." },
        { token: "catch (HttpRequestException)", role: "Fault Isolation", explanation: "Перехоплює лише тимчасові помилки мережі, ігноруючи бізнес-помилки." },
        { token: "Task.Delay(100 * attempt)", role: "Exponential Backoff", explanation: "Збільшує паузу між спробами, даючи лінії зв'язку час відновитися." },
      ],
      notes: "Ніколи не робіть повторні запити без затримки — це може викликати лавину відмов (Retry Storm).",
      diff: "У C#: await Task.Delay(ms). У Go: time.Sleep(duration).",
    },`;

// Find where theoryUa tasks ends (before "  },\n};\n\n// ───... ENGLISH")
const uaTasksEndIndex = content.indexOf('  },\n};\n\n// ───');
if (uaTasksEndIndex === -1) {
  console.error("Could not locate end of theoryUa");
  process.exit(1);
}

const part1 = content.slice(0, uaTasksEndIndex);
const remaining1 = content.slice(uaTasksEndIndex);
content = part1 + uaApiAlias + "\n" + gitUa + "\n" + banditUa + remaining1;

// Now find end of theoryEn
const enTasksEndIndex = content.indexOf('  },\n};\n\n// ───', uaTasksEndIndex + 500);
if (enTasksEndIndex === -1) {
  console.error("Could not locate end of theoryEn");
  process.exit(1);
}

const part2 = content.slice(0, enTasksEndIndex);
const remaining2 = content.slice(enTasksEndIndex);
content = part2 + apiEn + "\n" + gitEn + "\n" + banditEn + remaining2;

// Now find end of theoryDa
const daTasksEndIndex = content.lastIndexOf('  },\n};');
if (daTasksEndIndex === -1) {
  console.error("Could not locate end of theoryDa");
  process.exit(1);
}

const part3 = content.slice(0, daTasksEndIndex);
const remaining3 = content.slice(daTasksEndIndex);
content = part3 + apiDa + "\n" + gitDa + "\n" + banditDa + remaining3;

fs.writeFileSync(theoryPath, content, "utf-8");
console.log("Successfully enriched theory.ts across all 3 locales!");
