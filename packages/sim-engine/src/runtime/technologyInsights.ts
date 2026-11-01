/**
 * @file packages/sim-engine/src/runtime/technologyInsights.ts
 * @description Real-world technology comparisons, protocols, patterns, and trade-offs
 * for every lesson across all 10 stations in IWannaBeSmart.
 *
 * Answers:
 * 1. What technology/protocol/method is used in real production?
 * 2. What it is and how it works (working principle).
 * 3. Why it is used here (practical real-world rationale).
 * 4. What alternative exists, and why it is worse (trade-offs in speed, latency, RAM, etc.).
 * 5. Key engineering advantages.
 */

export type TechCategory =
  | "protocol"
  | "pattern"
  | "architecture"
  | "security"
  | "database"
  | "cloud"
  | "hardware"
  | "network";

export interface TechnologyInsight {
  taskId: string;
  primaryTech: string;
  category: TechCategory;
  whatIsIt: Record<"ua" | "en" | "da", string>;
  whyHere: Record<"ua" | "en" | "da", string>;
  alternative: {
    name: string;
    tradeoff: Record<"ua" | "en" | "da", string>;
  };
  advantages: Record<"ua" | "en" | "da", string[]>;
}

export const TECHNOLOGY_INSIGHTS: Record<string, TechnologyInsight> = {
  // ═════════════════════════════════════════════════════════════
  // STATION 01: TV STATION & EMBEDDED DISPLAY ENGINE
  // ═════════════════════════════════════════════════════════════
  "task-0-1-power-on": {
    taskId: "task-0-1-power-on",
    primaryTech: "GPIO Relay Rail & Power Sequencer (I2C / PMIC)",
    category: "hardware",
    whatIsIt: {
      ua: "Апаратне керування живленням через силові ключі (MOSFET) та інтегральну схему PMIC, керовану мікроконтролером по шині I2C.",
      en: "Hardware power delivery switching via power MOSFET gates and a PMIC controlled by microcontroller over the I2C bus.",
      da: "Hardware-strømstyring via MOSFET-porte og PMIC styret af mikrokontroller over I2C-bussen.",
    },
    whyHere: {
      ua: "У Smart TV не можна миттєво подати струм на всі чіпи: спочатку стабілізується 3.3V для процесора, потім 12V для підсвітки.",
      en: "Smart TVs must stage voltage rails: first 3.3V logic stabilizes, then 12V LED backlighting powers up safely.",
      da: "Smart TV skal stabilisere strøm i trin: først 3,3V logik, derefter 12V bagbelysning.",
    },
    alternative: {
      name: "Analog Mechanical Toggle Switch",
      tradeoff: {
        ua: "Механічний тумблер дешевший, але ним неможливо керувати програмно (з пульта IR, Bluetooth або через таймер сну), а контактний брязкіт викликає спалахи напруги.",
        en: "Mechanical switches are cheap, but cannot be remotely actuated via IR/Bluetooth or sleep timers, and contact bounce damages silicon.",
        da: "Mekaniske kontakter er billige, men kan ikke fjernstyres via IR/Bluetooth, og kontaktprel giver spændingsspidser.",
      },
    },
    advantages: {
      ua: ["Програмний контроль", "Захист від стрибків напруги", "Сплячий режим <0.5W"],
      en: ["Programmatic sleep/wake", "Inrush current protection", "Deep standby <0.5W"],
      da: ["Programmerbar dvale", "Strømspidsbeskyttelse", "Dyb standby <0.5W"],
    },
  },

  "task-0-2-types": {
    taskId: "task-0-2-types",
    primaryTech: "Protocol Buffers (Protobuf) & Static Binary Structs",
    category: "protocol",
    whatIsIt: {
      ua: "Компактний бінарний формат серіалізації зі суворою типізацією від Google. Поля кодуються як числові теги (Varint/Fixed32) без текстових імен.",
      en: "Compact strongly-typed binary serialization by Google. Fields are encoded as numeric wire tags (Varint/Fixed32) without string names.",
      da: "Kompakt binær serialisering fra Google med strenge typer og numeriske wire-tags uden strengnavne.",
    },
    whyHere: {
      ua: "Тюнер Smart TV передає стан за мілісекунди: номер каналу (int32) та назву (UTF-8). Суворі типи гарантують, що в тюнер не потрапить сміття.",
      en: "TV tuners report channel updates within milliseconds: channel numbers (int32) and labels (UTF-8) are strictly typed to avoid memory corruption.",
      da: "TV-tuneren opdaterer kanaler på få millisekunder: heltal (int32) og strenge er strengt adskilt for stabilitet.",
    },
    alternative: {
      name: "Dynamic JSON over Text Sockets",
      tradeoff: {
        ua: "JSON вимагає парсингу рядків та виділення пам'яті в купі (Heap). На чипах з 512 МБ пам'яті це спричиняє GC-паузи та затримку перемикання каналів на 400 мс.",
        en: "JSON parsing parses strings and churns heap memory. On low-memory SoC chips, this triggers garbage collection stalls of up to 400ms.",
        da: "JSON-parsing allokerer heap-hukommelse og udløser GC-pauser på op til 400ms på embeddede chips.",
      },
    },
    advantages: {
      ua: ["У 6-10 разів швидше за JSON", "Мізерний розмір пакету", "Неможливість сплутати тип"],
      en: ["6-10x faster than JSON", "Minimal wire footprint", "Compile-time schema safety"],
      da: ["6-10x hurtigere end JSON", "Minimal pakkestørrelse", "Kompileringstypekontrol"],
    },
  },

  "task-0-3-sequential": {
    taskId: "task-0-3-sequential",
    primaryTech: "Finite State Machine (FSM) Initialization Barrier",
    category: "pattern",
    whatIsIt: {
      ua: "Патерн скінченного автомата з бар'єром синхронізації: перехід у стан OPERATIONAL дозволено лише після проходження фаз POWER_ON -> CALIBRATE -> TUNE.",
      en: "Finite State Machine with synchronization barrier: transitioning to OPERATIONAL is strictly disallowed until POWER_ON -> CALIBRATE -> TUNE finish.",
      da: "Endelig tilstandsmaskine (FSM) med synkroniseringsbarriere: forhindrer operation før fuld opstart.",
    },
    whyHere: {
      ua: "Спроба налаштувати частоту тюнера до подачі живлення на кварцовий резонатор викличе зависання шини SPI.",
      en: "Attempting to tune frequency before the crystal oscillator receives stable voltage locks up the SPI bus permanently.",
      da: "Tuning af frekvens før krystaloscillatoren har stabil spænding låser SPI-bussen.",
    },
    alternative: {
      name: "Unordered Asynchronous Goroutines / Threads",
      tradeoff: {
        ua: "Запуск без синхронізації створює Race Condition: якщо тюнер стартує на 2 мс швидше за дисплей, користувач чує звук без картинки або отримує чорний екран.",
        en: "Uncoordinated async tasks cause Race Conditions: if the tuner boots faster than HDMI PHY, sound plays on a pitch-black screen.",
        da: "Ukontrolleret asynkron kørsel giver Race Conditions med lyd uden billede.",
      },
    },
    advantages: {
      ua: ["Передбачуваність 100%", "Запобігання апаратним зависанням", "Проста діагностика помилок"],
      en: ["100% deterministic boot", "Prevents hardware deadlocks", "Crystal-clear failure logging"],
      da: ["100% deterministisk opstart", "Forhindrer hardware-låsning", "Klar fejllogning"],
    },
  },

  "task-1-assignment": {
    taskId: "task-1-assignment",
    primaryTech: "Memory-Mapped I/O (MMIO) Registers",
    category: "hardware",
    whatIsIt: {
      ua: "Адресація апаратних портів як звичайних комірок пам'яті. Запис значення у змінну записує біти прямо в регістр керування чіпом.",
      en: "Hardware control registers mapped directly into physical memory space. Assigning a value writes directly to silicon control registers.",
      da: "Hardwareporte mappet direkte i hukommelsen. Tildeling skriver direkte til chippens registre.",
    },
    whyHere: {
      ua: "Вбудовані телевізійні мікросхеми перемикають аудіо-підсилювачі за 1 такт процесора через прямий MMIO запис.",
      en: "Television audio amplifiers and switchers are toggled in a single CPU cycle via direct MMIO register writes.",
      da: "Forstærkere og omskiftere styres i én enkelt CPU-cyklus via direkte MMIO-skrivning.",
    },
    alternative: {
      name: "Remote Procedure Call (RPC) over Network",
      tradeoff: {
        ua: "RPC додає сетевий стек, серіалізацію і затримку 10-50 мс замість 2 наносекунд, що унеможливлює керування в реальному часі.",
        en: "Network RPC introduces network stacks and serialization, imposing 10-50ms latency instead of 2 nanoseconds.",
        da: "Netværks-RPC tilføjer netværksstakke og 10-50ms forsinkelse mod 2 nanosekunder ved MMIO.",
      },
    },
    advantages: {
      ua: ["Миттєвий відгук (наносекунди)", "Нуль додаткової пам'яті", "Апаратна надійність"],
      en: ["Nanosecond execution speed", "Zero memory overhead", "Hardware-direct reliability"],
      da: ["Nanosekund eksekvering", "Nul hukommelsesforbrug", "Hardware-direkte pålidelighed"],
    },
  },

  "task-2-branching": {
    taskId: "task-2-branching",
    primaryTech: "Watchdog State Boundary Checks & Fail-Safe Defaults",
    category: "pattern",
    whatIsIt: {
      ua: "Умовне розгалуження (if/else) для захисту меж робочих параметрів та спрацьовування апаратного Watchdog таймера.",
      en: "Conditional boundary guards preventing hardware out-of-range commands and satisfying hardware Watchdog monitors.",
      da: "Betinget forgrening der beskytter driftsparametre og servicerer hardware-watchdog.",
    },
    whyHere: {
      ua: "Якщо гучність вийде за межі [0..100] і переповнить регістр ЦАП, динаміки видадуть акустичний удар і спалять котушку.",
      en: "If volume overflows the DAC register bounds [0..100], audio clipping burns voice coils and damages speakers.",
      da: "Overskridelse af lydgrænser [0..100] forårsager klipning og brænder højttalerspolen.",
    },
    alternative: {
      name: "Unchecked Direct Register Write",
      tradeoff: {
        ua: "Запис без перевірки веде до цілочисельного переповнення (Integer Overflow): звук 101 перетворюється на 0, або -1 перетворюється на 255 (максимальний оглушливий вереск).",
        en: "Writing without guards causes Integer Overflow: 101 wraps to 0, or -1 wraps to 255 (ear-splitting maximum deafening volume).",
        da: "Skrivning uden grænser giver integer overflow, hvor -1 kan blive 255 og ødelægge højttaleren.",
      },
    },
    advantages: {
      ua: ["Захист обладнання від виходу з ладу", "Плавний інтерфейс", "Передбачуваний стан"],
      en: ["Acoustic hardware safety", "Smooth user experience", "Guaranteed value bounds"],
      da: ["Hardwarebeskyttelse", "Jævn brugeroplevelse", "Garanterede værdigrænser"],
    },
  },

  "task-variable-mutation": {
    taskId: "task-variable-mutation",
    primaryTech: "Atomic State Mutation & Ring Buffer Indices",
    category: "pattern",
    whatIsIt: {
      ua: "Інкремент та мутація змінних стану (станційні канали, індекси буфера) із захистом від стану гонитви (Race Condition).",
      en: "Atomic variable mutation and state tracking for ring buffers and tuner indices with concurrency safety.",
      da: "Atomisk tilstandsmutation og ringbuffer-indeksering med trådsikkerhed.",
    },
    whyHere: {
      ua: "При швидкому натисканні кнопок на пульті зміна номера каналу повинна мутувати лічильник послідовно без пропуску кроків.",
      en: "Rapid remote control bursts must mutate the tuner index sequentially without dropping rapid keystrokes.",
      da: "Hurtige tastetryk fra fjernbetjeningen skal mutere kanalindekset sekventielt uden tab.",
    },
    alternative: {
      name: "Immutable State Copy on Write (Cloning)",
      tradeoff: {
        ua: "Повне копіювання всього дерева стану на кожне натискання кнопки створює гігабайти сміття в RAM на низькорівневих Linux SoC.",
        en: "Deep-cloning state trees on every keystroke causes massive memory allocations and garbage collection stutter on 512MB RAM Linux SoCs.",
        da: "Dyb kloning af tilstandstræer ved hvert klik overbelaster RAM på billige Linux SoCs.",
      },
    },
    advantages: {
      ua: ["Мінімальне навантаження на процесор", "Швидкість виконання 1 такт", "Збереження ресурсу RAM"],
      en: ["Minimal CPU overhead", "Single-cycle execution", "Zero heap churn"],
      da: ["Minimal CPU-belastning", "Eksekvering i 1 cyklus", "Ingen heap-spild"],
    },
  },

  "task-boundary-guard": {
    taskId: "task-boundary-guard",
    primaryTech: "Clamp Function & Memory-Safety Bound Checks",
    category: "pattern",
    whatIsIt: {
      ua: "Математичне обмеження значення у замкненому інтервалі [min..max] за допомогою `Math.Clamp` або тернарних охоронців.",
      en: "Mathematical clamping of numeric variables within closed intervals [min..max] via `Math.Clamp` or ternary guards.",
      da: "Matematisk clamping i et lukket interval [min..max] via Math.Clamp.",
    },
    whyHere: {
      ua: "Вихід за межі доступного масиву каналів (наприклад, звернення до каналу 999 при 50 наявних) викликає збій IndexOutOfRangeException.",
      en: "Accessing channel index 999 when only 50 exist triggers IndexOutOfRangeException and crashes the firmware runtime.",
      da: "Adgang til kanal 999 når der kun er 50 udløser IndexOutOfRangeException.",
    },
    alternative: {
      name: "Catching Runtime Exception (try/catch)",
      tradeoff: {
        ua: "Використання try/catch для контролю логіки в 100 разів повільніше за `if`, виділяє стековий фрейм і маскує реальні помилки пам'яті.",
        en: "Using try/catch for control flow is 100x slower than simple `if`, constructs costly stack traces, and hides real memory corruption.",
        da: "try/catch til flowstyring er 100x langsommere end simple ifs og opbygger unødige stack traces.",
      },
    },
    advantages: {
      ua: ["Миттєва перевірка (1 інструкція)", "Неможливість падіння процесу", "Чистий самодокументований код"],
      en: ["Branch-predictor friendly", "Zero exception overhead", "Robust zero-crash guarantee"],
      da: ["Hurtig instruktion", "Nul nedbrud", "Ren kode uden undtagelser"],
    },
  },

  "task-for-loop": {
    taskId: "task-for-loop",
    primaryTech: "Direct Memory Access (DMA) Blitter & SIMD Vector Loops",
    category: "hardware",
    whatIsIt: {
      ua: "Апаратний контролер DMA копіює пікселі та списки каналів у фоні паралельно з роботою основного процесора, не блокуючи інтерфейс.",
      en: "Hardware DMA controllers transfer pixel matrices and channel lists in background without stalling the main CPU.",
      da: "Hardware DMA overfører datablokke i baggrunden uden at blokere hovedprocessoren.",
    },
    whyHere: {
      ua: "Сканування 100 каналів або очищення екранного меню (OSD) вимагає перебору пам'яті за частки мілісекунди.",
      en: "Scanning 100 tuner frequencies or refreshing the on-screen display (OSD) requires sub-millisecond memory sweeps.",
      da: "Scanning af 100 kanaler eller opdatering af skærmmenuen kræver mikrosekunders dataoverførsel.",
    },
    alternative: {
      name: "Recursive Function Calls",
      tradeoff: {
        ua: "Рекурсія замість циклу на мікроконтролері швидко переповнює стек (Stack Overflow) через обмежений розмір стеку викликів (кілька кілобайт).",
        en: "Recursion on embedded devices exhausts the limited call stack (often just 8-16KB), triggering hard fault CPU resets.",
        da: "Rekursion på embeddede enheder overskrider det lille stak-område og crasher chippen.",
      },
    },
    advantages: {
      ua: ["Передбачуване використання стеку O(1)", "Оптимізація компілятора (Loop Unrolling)", "Висока швидкість"],
      en: ["Deterministic O(1) stack memory", "Compiler vectorization & unrolling", "Maximum throughput"],
      da: ["Deterministisk O(1) stakhukommelse", "Kompiler-vektorisering", "Maksimal båndbredde"],
    },
  },

  "task-class-instance": {
    taskId: "task-class-instance",
    primaryTech: "Flyweight Object Pool & Pre-allocated Structs",
    category: "pattern",
    whatIsIt: {
      ua: "Виділення фіксованого пулу об'єктів під час старту пристрою. Замість постійного створення нових об'єктів повторно використовуються наявні.",
      en: "Allocating a fixed memory pool of domain objects at startup. Reusing pre-warmed structures avoids continuous heap allocations.",
      da: "Allokering af en fast objektpulje ved opstart for at undgå løbende heap-allokeringer.",
    },
    whyHere: {
      ua: "Створення нових об'єктів на кожну трансляцію викликає фрагментацію пам'яті в довгопрацюючих пристроях (роками без перезавантаження).",
      en: "Instantiating objects on every channel switch causes heap fragmentation on devices expected to run 24/7 for years without rebooting.",
      da: "Oprettelse af nye objekter ved hvert kanalskift fragmenterer RAM på enheder der kører i årevis.",
    },
    alternative: {
      name: "Ad-hoc Dynamic Heap Allocation (`new Object()`)",
      tradeoff: {
        ua: "Динамічне виділення пам'яті спричиняє Out-Of-Memory (OOM) через фрагментацію вже через кілька місяців безперервної роботи.",
        en: "Frequent dynamic allocations fragment the memory pool, eventually crashing the operating system with Out-Of-Memory (OOM).",
        da: "Hyppige allokeringer fragmenterer hukommelsen og fører til OOM-nedbrud efter måneders drift.",
      },
    },
    advantages: {
      ua: ["Стабільна робота роками", "Нуль пауз збирача сміття", "Передбачувана витрата RAM"],
      en: ["24/7 uptime without degradation", "Zero garbage collection pauses", "Bounded deterministic RAM"],
      da: ["24/7 oppetid uden forringelse", "Nul GC-pauser", "Forudsigelig RAM-forbrug"],
    },
  },

  "task-method-return": {
    taskId: "task-method-return",
    primaryTech: "Register-Passed Return Codes (POSIX / ABI Convention)",
    category: "pattern",
    whatIsIt: {
      ua: "Повернення результату та статусу операції безпосередньо через регістр процесора (EAX/RAX) або тип `Result<T, E>`.",
      en: "Returning values and execution statuses directly in CPU registers (RAX) or language `Result<T, E>` algebraic types.",
      da: "Returnering af værdier direkte i CPU-registre eller via Result<T, E> typer.",
    },
    whyHere: {
      ua: "Метод отримання статусу повинен працювати з нульовою затримкою для миттєвого відображення на пульті та екрані.",
      en: "State queries must execute with zero overhead to feed 60 FPS user interface telemetry smoothly.",
      da: "Statusforespørgsler skal eksekveres uden ventetid til 60 FPS brugerflader.",
    },
    alternative: {
      name: "Global Mutable Status Flags",
      tradeoff: {
        ua: "Глобальні змінні стану можуть бути перезаписані іншим потоком під час читання, спричиняючи фантомні помилки.",
        en: "Global status flags are vulnerable to concurrent writes from asynchronous threads, yielding torn reads and ghost states.",
        da: "Globale variable er sårbare over for parallelle overskrivninger og race conditions.",
      },
    },
    advantages: {
      ua: ["Потокобезпечність (Thread-Safe)", "Повернення за 1 такт CPU", "Ізоляція контексту"],
      en: ["Thread-safe functional purity", "Single-cycle return speed", "Isolated call context"],
      da: ["Trådsikker funktionalitet", "Enkeltcyklus returhastighed", "Isoleret kontekst"],
    },
  },

  "task-null-reference": {
    taskId: "task-null-reference",
    primaryTech: "Nullable Reference Types & Option / Maybe Monad",
    category: "security",
    whatIsIt: {
      ua: "Компіляторний захист від порожніх вказівників (NULL/nil). Тип зобов'язує перевірити наявність об'єкта перед зверненням до методів.",
      en: "Compile-time protection against null pointers. Enforces explicit null checks or Option/Result types prior to dereferencing.",
      da: "Kompilatorbeskyttelse mod null-pointere. Kræver eksplicit kontrol før brug.",
    },
    whyHere: {
      ua: "Помилка NullReferenceException у прошивці викликає Kernel Panic або аварійне перезавантаження пристрою прямо перед очима користувача.",
      en: "A NullReferenceException in embedded firmware triggers a hardware watchdog reset, rebooting the TV during prime time.",
      da: "Null-fejl i firmware udløser watchdog-genstart midt i udsendelsen.",
    },
    alternative: {
      name: "Unchecked Raw Pointer Dereferencing",
      tradeoff: {
        ua: "Розіменування вказівника без перевірки читає адресу 0x00000000, викликаючи Segmentation Fault та падіння процесу.",
        en: "Unchecked dereferencing accesses memory address 0x00, crashing the process with Segmentation Fault.",
        da: "Adgang uden kontrol til adresse 0x00 crasher processen med Segmentation Fault.",
      },
    },
    advantages: {
      ua: ["100% захист від Segment Fault", "Виявлення помилки на етапі компіляції", "Висока надійність"],
      en: ["Zero segmentation faults", "Compile-time bug elimination", "Ultra-high availability"],
      da: ["Nul segmentation faults", "Fejl fanges ved kompilering", "Høj driftssikkerhed"],
    },
  },

  "task-function-encapsulation": {
    taskId: "task-function-encapsulation",
    primaryTech: "Hardware Abstraction Layer (HAL) API",
    category: "architecture",
    whatIsIt: {
      ua: "Програмний шар, що приховує конкретні апаратні регістри та чіпи за уніфікованими функціями `SetVolume()`, `SetChannel()`.",
      en: "Software architectural layer hiding silicon-specific register addresses behind clean semantic interfaces.",
      da: "Softwarelag der skjuler hardwareregistre bag rene semantiske funktioner.",
    },
    whyHere: {
      ua: "Якщо завод змінює модель мікросхеми звуку, весь додаток залишається незмінним — переписується лише 1 внутрішній файл драйвера.",
      en: "When the factory swaps the sound DAC for a cheaper chip, application business logic remains untouched; only the driver changes.",
      da: "Når fabrikken skifter lydchip, forbliver applikationen uændret; kun driveren opdateres.",
    },
    alternative: {
      name: "Direct Hardware Memory Access Scattered in App Code",
      tradeoff: {
        ua: "Пряме звернення до пам'яті по всьому коду прив'язує софт до конкретної ревізії плати. Оновлення чипа вимагає переписування всієї системи.",
        en: "Scattering raw register writes across application code locks the software to one chip revision, making hardware upgrades impossible.",
        da: "Direkte hardwareskrivning låser koden til én chiprevision og umuliggør hardwareopgraderinger.",
      },
    },
    advantages: {
      ua: ["Портованість на будь-яке залізо", "Зручне модульне тестування (Unit Testing)", "Безпека архітектури"],
      en: ["Portability across hardware revisions", "Mockable unit testing", "Strict architectural decoupling"],
      da: ["Portabilitet på tværs af hardware", "Nem unit-test med mocks", "Klar adskillelse af ansvar"],
    },
  },

  "task-antipattern-god-object": {
    taskId: "task-antipattern-god-object",
    primaryTech: "Single Responsibility Principle (SRP) & Component Decoupling",
    category: "architecture",
    whatIsIt: {
      ua: "Розділення гігантського об'єкта 'Бог' на вузькоспеціалізовані незалежні підсистеми: Tuner, Audio, Display, Network.",
      en: "Decomposition of monolithic God objects into decoupled single-purpose domain services: Tuner, Audio, Display, Network.",
      da: "Opdeling af et monolitisk 'Gud-objekt' i uafhængige komponenter: Tuner, Audio, Display, Netværk.",
    },
    whyHere: {
      ua: "Збій у мережевому оновленні віджета погоди не повинен блокувати можливість зменшити гучність або вимкнути пристрій.",
      en: "A crash or network timeout in a weather widget must never freeze the user's ability to turn down volume or switch channels.",
      da: "Et netværksnedbrud i en vejr-widget må aldrig forhindre brugeren i at skrue ned for lyden.",
    },
    alternative: {
      name: "Monolithic God Class (`TVManager.cs` with 10,000 lines)",
      tradeoff: {
        ua: "Усі модулі жорстко зчеплені. Зміна в логіці каналів ламає регулятор гучності. Неможливо писати ізольовані тести.",
        en: "Tight coupling: changes in channel tuning inadvertently break volume regulation. Tests require booting the entire television.",
        da: "Tæt kobling gør koden sårbar: ændring i kanaler ødelægger lydstyrken, og test er umulig.",
      },
    },
    advantages: {
      ua: ["Ізоляція збоїв (Fault Isolation)", "Паралельна розробка різними командами", "100% покриття тестами"],
      en: ["Subsystem fault isolation", "Independent team velocity", "High testability"],
      da: ["Isolering af fejl", "Uafhængig udvikling i teams", "Høj testbarhed"],
    },
  },

  "task-interface-polymorphism": {
    taskId: "task-interface-polymorphism",
    primaryTech: "VTable Polymorphism & Peripheral Driver Abstraction",
    category: "architecture",
    whatIsIt: {
      ua: "Інтерфейсний контракт (`IDisplayOutput`), що дозволяє підключати різні пристрої (HDMI, DisplayPort, OLED) без зміни ядра системи.",
      en: "Interface contracts (`IDisplayOutput`) enabling dynamic peripheral swapping (HDMI, DisplayPort, OLED panel) via compiler VTables.",
      da: "Interface-kontrakter (IDisplayOutput) der muliggør skift af output-enheder uden ændring i kernen.",
    },
    whyHere: {
      ua: "Операційна система телевізора однакова для 43-дюймових LCD та 85-дюймових OLED матриць — змінюється лише клас драйвера.",
      en: "The same television OS runs on cheap 43-inch LCDs and luxury 85-inch OLEDs; only the display driver implementation changes.",
      da: "Samme TV-styresystem kører på både billige 43-tommer LCD og luksus 85-tommer OLED.",
    },
    alternative: {
      name: "Hardcoded switch(panelType) in Every Method",
      tradeoff: {
        ua: "Величезні ланцюжки switch/case порушують принцип Open/Closed. Додавання нової панелі вимагає редагування 50 файлів.",
        en: "Giant switch/case ladders violate the Open/Closed Principle. Supporting a new display panel requires editing 50 core files.",
        da: "Kæmpe switch/case blokke bryder Open/Closed princippet og kræver ændringer i 50 filer for et nyt panel.",
      },
    },
    advantages: {
      ua: ["Легке додавання нових пристроїв", "Відповідність принципу Open/Closed", "Зручні моки в тестах"],
      en: ["Frictionless hardware extensibility", "Strict Open/Closed adherence", "Effortless test mocking"],
      da: ["Nem tilføjelse af ny hardware", "Overholder Open/Closed princippet", "Enkel mock-test"],
    },
  },

  "task-di-container": {
    taskId: "task-di-container",
    primaryTech: "Inversion of Control (IoC) & Dependency Injection Container",
    category: "architecture",
    whatIsIt: {
      ua: "Автоматичне впровадження залежностей через конструктори. Компоненти не створюють сервіси через `new`, а отримують їх з фабрики.",
      en: "Inversion of Control container resolving dependencies via constructor injection rather than hardcoded `new` expressions.",
      da: "Inversion of Control container der indsprøjter afhængigheder i stedet for hårdkodet 'new'.",
    },
    whyHere: {
      ua: "Дозволяє запускати весь код симулятора в браузері з віртуальними приладами, а на заводі — зі справжніми апаратними чіпами.",
      en: "Enables running the exact same engine inside a browser simulator with mock devices, and in the real factory with actual hardware.",
      da: "Tillader at køre præcis samme kode i browser-simulatoren og på den virkelige hardware på fabrikken.",
    },
    alternative: {
      name: "Hardcoded Global Singletons (`Device.Instance`)",
      tradeoff: {
        ua: "Глобальні сінглтони унеможливлюють запуск паралельних тестів, зберігають прихований стан і ламають модульну архітектуру.",
        en: "Global Singletons prevent concurrent unit tests, hide state coupling, and make mock-testing hardware impossible.",
        da: "Globale singletons forhindrer parallelle tests og skjuler afhængigheder.",
      },
    },
    advantages: {
      ua: ["100% готовність до тестування", "Заміна компонентів без переписування", "Чітка карта залежностей"],
      en: ["100% test automation readiness", "Plug-and-play component replacement", "Transparent dependency graph"],
      da: ["100% testbarhed", "Plug-and-play udskiftning", "Klar afhængighedsstruktur"],
    },
  },

  "task-command-registry": {
    taskId: "task-command-registry",
    primaryTech: "Command Pattern & Event Dispatch Queue",
    category: "pattern",
    whatIsIt: {
      ua: "Інкапсуляція дій (гучність, канал, живлення) в об'єкти Command з чергою виконання та можливістю скасування (Undo) і логування.",
      en: "Encapsulating user requests (volume, channel, power) into Command objects queued for non-blocking serial dispatch.",
      da: "Indkapsling af brugerhandlinger i Command-objekter i en kø med mulighed for logning og fortrydelse.",
    },
    whyHere: {
      ua: "Пульт дистанційного керування може відправити 10 команд за секунду. Черга команд згладжує навантаження і гарантує порядок виконання.",
      en: "Remote controls can transmit 10 IR signals per second. The Command Queue serializes bursts and guarantees in-order execution.",
      da: "Fjernbetjeningen kan sende 10 signaler i sekundet; kommandokøen sikrer korrekt rækkefølge.",
    },
    alternative: {
      name: "Direct Event Listeners Blocking the UI Thread",
      tradeoff: {
        ua: "Пряме виконання важких операцій у слухачі кнопок 'заморожує' інтерфейс і призводить до пропуску наступних натискань пульта.",
        en: "Executing slow hardware I/O directly in UI event listeners freezes the screen and drops subsequent remote control signals.",
        da: "Direkte kørsel i event listeners fryser brugerfladen og taber efterfølgende tastetryk.",
      },
    },
    advantages: {
      ua: ["Асинхронне виконання без підвисань", "Історія команд та телеметрія", "Можливість Undo/Redo"],
      en: ["Non-blocking asynchronous execution", "Command history audit trail", "Undo/Redo capabilities"],
      da: ["Ikke-blokerende kørsel", "Historik og telemetri", "Fortryd/gentag funktion"],
    },
  },

  "task-debug-runaway-loop": {
    taskId: "task-debug-runaway-loop",
    primaryTech: "Hardware Watchdog Timer (WDT) & Loop Bound Invariants",
    category: "hardware",
    whatIsIt: {
      ua: "Апаратний таймер зворотного відліку, який процесор повинен скидати кожні 500 мс. Якщо цикл завис — таймер скидає живлення чіпа.",
      en: "Independent hardware countdown timer reset periodically by software. If an infinite loop hangs, the WDT resets the chip.",
      da: "Hardware-watchdog nedtællingstimer der genstarter processoren hvis en løkke hænger.",
    },
    whyHere: {
      ua: "Завислий цикл пошуку каналів блокує телевізор так, що він перестає реагувати навіть на кнопку живлення.",
      en: "An infinite loop in channel scanning hangs the TV so completely that it ignores the physical power button.",
      da: "En uendelig løkke i kanalsøgning låser TV'et så selv sluk-knappen ikke reagerer.",
    },
    alternative: {
      name: "Software-only Heartbeat Thread",
      tradeoff: {
        ua: "Якщо процесор зайнятий на 100% завислим циклом в ядрі, програмний потік теж не отримає квант часу і не зможе врятувати систему.",
        en: "When the CPU is 100% pegged by an infinite loop in the kernel, software-only watchdog threads never get scheduled to run.",
        da: "Software-watchdogs hjælper ikke når CPU'en er 100% låst af en kernefejl.",
      },
    },
    advantages: {
      ua: ["Апаратна гарантія перезавантаження", "Захист від нескінченних зависань", "Автономність системи 24/7"],
      en: ["Silicon-enforced reboot guarantee", "Zero unrecoverable software freezes", "Autonomous 24/7 self-healing"],
      da: ["Garanteret genstart ved fejl", "Beskyttelse mod uendelige løkker", "Automatisk 24/7 genopretning"],
    },
  },

  "task-debug-off-by-one-overflow": {
    taskId: "task-debug-off-by-one-overflow",
    primaryTech: "Static Analysis (AST Bound Verification) & AddressSanitizer",
    category: "security",
    whatIsIt: {
      ua: "Аналіз меж масивів на етапі компіляції та динамічний захист пам'яті (ASan), що виявляє читання або запис на 1 байт далі дозволеного.",
      en: "Compile-time AST bounds analysis and AddressSanitizer (ASan) instrumenting memory buffers to catch 1-byte overflow errors.",
      da: "Statisk analyse og AddressSanitizer der fanger fejl ved læsning/skrivning 1 byte ud over grænsen.",
    },
    whyHere: {
      ua: "Помилка Off-by-one (<= замість <) у списку каналів затирає сусідній стек пам'яті і відкриває вразливість для взлому прошивки.",
      en: "Off-by-one errors (using <= instead of <) corrupt adjacent stack frames, creating remote code execution vulnerabilities.",
      da: "Off-by-one fejl (<= i stedet for <) overskriver tilstødende stak-hukommelse og skaber sikkerhedshuller.",
    },
    alternative: {
      name: "Manual Code Review Only",
      tradeoff: {
        ua: "Людське око пропускає помилки знаків '<' та '<=' у 40% випадків, що призводить до критичних багів у релізі.",
        en: "Human reviewers miss off-by-one comparison operators in over 40% of cases, shipping memory vulnerabilities to customers.",
        da: "Manuelle kode-gennemgange overser sammenligningsfejl i over 40% af tilfældene.",
      },
    },
    advantages: {
      ua: ["Миттєве знаходження вразливостей пам'яті", "Усунення витоків буфера", "Запобігання зламу пристрою"],
      en: ["Automated buffer overflow elimination", "Guaranteed array bounds safety", "Exploit prevention"],
      da: ["Automatisk eliminering af bufferfejl", "Garanteret grænsekontrol", "Forhindrer hacking"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 02: FINTECH POS TERMINAL & CORE BANKING
  // ═════════════════════════════════════════════════════════════
  "task-pos-guard-clause": {
    taskId: "task-pos-guard-clause",
    primaryTech: "Fail-Fast Guard Clause & Pre-Condition Validation",
    category: "pattern",
    whatIsIt: {
      ua: "Архітектурний підхід негайного переривання операції (`return early`) при порушенні передумов (недостатньо коштів, недійсний статус) без входу в транзакцію.",
      en: "Fail-Fast architectural pattern immediately returning on invalid conditions (insufficient funds) prior to mutating balances.",
      da: "Fail-Fast arkitekturmønster der straks afbryder ved manglende dækning inden saldoen ændres.",
    },
    whyHere: {
      ua: "У платіжних системах (Stripe, Visa) не можна списувати кошти або створювати замовлення, доки рахунок не перевірено на платоспроможність.",
      en: "Payment processors (Visa, Mastercard, Stripe) mandate pre-condition verification before dispatching fund clearing instructions.",
      da: "Betalingssystemer kræver validering af dækning inden der sendes trækinstruktioner.",
    },
    alternative: {
      name: "Deeply Nested if/else Ladders",
      tradeoff: {
        ua: "Вкладені `if/else` (драбини) створюють високу цикломатичну складність: легко помилитися дужкою і списати кошти на гілці помилки.",
        en: "Deep if/else pyramids inflate cyclomatic complexity: developers frequently misplace braces, executing deduction on error branches.",
        da: "Dybe if/else strukturer øger kompleksiteten og medfører risiko for utilsigtede hævninger.",
      },
    },
    advantages: {
      ua: ["Неможливість овердрафту каси", "Плоский, чистий код", "Миттєве відхилення невалідних транзакцій"],
      en: ["Zero cash overdraft risk", "Linear readable logic", "Instant rejection of invalid transfers"],
      da: ["Nul overtræksrisiko", "Lineær læsbar kode", "Øjeblikkelig afvisning"],
    },
  },

  "task-pos-fee-calculation": {
    taskId: "task-pos-fee-calculation",
    primaryTech: "Fixed-Point Decimal Arithmetic (Martin Fowler Money Pattern)",
    category: "pattern",
    whatIsIt: {
      ua: "Фінансові розрахунки виключно в цілих одиницях (центи/копійки як `int64`) або типі `decimal` з фіксованою комою замість дробових чисел `float`.",
      en: "Financial calculations executed exclusively with integer subunits (cents as `int64`) or arbitrary-precision `decimal` types.",
      da: "Finansielle beregninger udelukkende med heltal (cent som int64) eller decimal-typer for at undgå afrundingsfejl.",
    },
    whyHere: {
      ua: "Розрахунок комісії банку (наприклад, 1.5% від $19.99) у двійковому форматі float дає $0.29985000000000004, через що губляться гроші.",
      en: "Computing 1.5% interchange fee on $19.99 in binary float yields $0.29985000000000004, leaking fractional pennies over millions of transactions.",
      da: "Beregning af gebyrer med float giver uacceptable afrundingsfejl over millioner af transaktioner.",
    },
    alternative: {
      name: "IEEE-754 Binary Floating-Point (`float` / `double`)",
      tradeoff: {
        ua: "Двійковий `double` не може точно зберегти десяткові дроби (0.1, 0.05). За підсумками місяця банк виявляє розходження балансу на тисячі доларів.",
        en: "IEEE-754 floats cannot represent decimal 0.1 accurately, creating cumulative balance discrepancies of thousands of dollars during end-of-month audits.",
        da: "Float kan ikke repræsentere 0,1 præcist, hvilket giver store uoverensstemmelser ved månedsafstemning.",
      },
    },
    advantages: {
      ua: ["Точність до копійки 100%", "Відповідність вимогам аудиту PCI-DSS", "Передбачуване заокруглення"],
      en: ["100% penny-perfect precision", "Full PCI-DSS compliance auditability", "Deterministic banking roundings"],
      da: ["100% præcision til mindste øre", "PCI-DSS overholdelse", "Deterministisk afrunding"],
    },
  },

  "task-pos-pin-lockout": {
    taskId: "task-pos-pin-lockout",
    primaryTech: "Hardware Security Module (HSM) Pin Retry Throttling (PCI-PTS)",
    category: "security",
    whatIsIt: {
      ua: "Апаратний лічильник спроб введення PIN-коду, захищений криптографічним чипом. Після 3 невдалих спроб термінал блокує чіп-карту.",
      en: "Tamper-resistant cryptographic counter in a Hardware Security Module (HSM). Enforces permanent lockout after 3 consecutive bad PINs.",
      da: "Kryptografisk tæller i et HSM-modul der låser kortet permanent efter 3 forkerte forsøg.",
    },
    whyHere: {
      ua: "Захищає клієнтів від підбору 4-значного PIN-коду (брутфорс). За 3 спроби шанс підбору становить лише 0.03%.",
      en: "Eliminates 4-digit PIN brute-force attacks. Three attempts restrict attacker success probability to less than 0.03%.",
      da: "Forhindrer brute-force angreb mod 4-cifrede PIN-koder. 3 forsøg giver under 0,03% chance for gæt.",
    },
    alternative: {
      name: "Volatile In-Memory Counter (`int pinAttempts`)",
      tradeoff: {
        ua: "Якщо лічильник зберігається просто в пам'яті, зловмисник висмикує кабель живлення, перезавантажує термінал і пробує наступні 3 спроби до успіху.",
        en: "In-memory counters reset when power is cycled: an attacker simply reboots the terminal to get 3 fresh guesses repeatedly.",
        da: "En simpel tæller i RAM nulstilles ved genstart, så angriberen kan gætte uendeligt.",
      },
    },
    advantages: {
      ua: ["Захист від підбору паролів", "Збереження стану при вимкненні живлення", "Банківський стандарт безпеки"],
      en: ["Anti-brute-force defense", "Power-loss persistent security state", "PCI-PTS certified standard"],
      da: ["Sikring mod brute-force", "Vedholdende tilstand ved strømsvigt", "Bankgodkendt sikkerhed"],
    },
  },

  "task-pos-batch-settlement": {
    taskId: "task-pos-batch-settlement",
    primaryTech: "Two-Phase Commit (2PC) & SAGA Distributed Settlement",
    category: "architecture",
    whatIsIt: {
      ua: "Протокол узгодження пакетних клірингових операцій: Phase 1 (Prepare: чи всі рахунки доступні) -> Phase 2 (Commit: списання коштів або повний відкат Rollback).",
      en: "Distributed consensus protocol for batch settlements: Phase 1 (Prepare / funds check) followed by Phase 2 (Commit or atomic Rollback).",
      da: "Distribueret konsensusprotokol for afregning: Fase 1 (Forberedelse) efterfulgt af Fase 2 (Gennemførsel eller Rollback).",
    },
    whyHere: {
      ua: "Наприкінці робочого дня каса відправляє пачку з 500 чеків у банк. Списання повинно бути атомарним — ніяких напівпроведених пачок.",
      en: "At end-of-day closing, 500 transactions are cleared in one batch. All records must post atomically, leaving zero orphan debits.",
      da: "Ved dagsafslutning afregnes 500 transaktioner. Alle skal bogføres atomisk uden efterladte fejlposter.",
    },
    alternative: {
      name: "Iterative Uncommitted HTTP Requests in a Loop",
      tradeoff: {
        ua: "Якщо на 250-й транзакції обірветься інтернет, перша половина спишеться, а друга ні, створюючи хаос у бухгалтерському балансі.",
        en: "Looping uncommitted HTTP calls leaves the ledger in an inconsistent half-settled state if the network drops on transaction #250.",
        da: "Almindelige HTTP-kald i en løkke efterlader regnskabet i uorden hvis nettet svigter midtvejs.",
      },
    },
    advantages: {
      ua: ["Атомарність (ACID)", "Автоматичний відкат при збої зв'язку", "Цілісність фінансових звітів"],
      en: ["ACID-grade atomicity", "Automatic rollback on network failure", "Guaranteed ledger reconciliation"],
      da: ["ACID-integritet", "Automatisk rollback ved fejl", "Garanteret regnskabsafstemning"],
    },
  },

  "task-pos-interface-polymorphism": {
    taskId: "task-pos-interface-polymorphism",
    primaryTech: "ISO 8583 / AS 2805 Financial Transaction Switcher",
    category: "protocol",
    whatIsIt: {
      ua: "Міжнародний стандарт обміну картковими повідомленнями між банками та терміналами через поліморфні адаптери платіжних систем (Visa, Mastercard, Amex).",
      en: "International messaging standard for cardholder-originated financial transactions via polymorphic gateway adapters.",
      da: "International standard for finansielle transaktioner via polymorfe gateway-adaptere.",
    },
    whyHere: {
      ua: "POS-термінал повинен однаково легко проводити оплату через Visa, Apple Pay чи банківський QR-код через один контракт `IPaymentProcessor`.",
      en: "Terminals must accept Visa, Mastercard, Apple Pay, or QR payments uniformly via a single polymorphic `IPaymentProcessor` interface.",
      da: "Terminalen skal håndtere Visa, Apple Pay og QR-betalinger ensartet gennem ét interface.",
    },
    alternative: {
      name: "Vendor-Locked Hardcoded Proprietary API",
      tradeoff: {
        ua: "Жорстка прив'язка до одного банку унеможливлює зміну еквайра без повної заміни всього парку касових апаратів компанії.",
        en: "Hardcoding one specific acquirer API locks the merchant in, requiring complete POS terminal replacement to switch banking partners.",
        da: "Hårdkodning til én bank låser kunden fast og kræver udskiftning af alle terminaler ved bankskift.",
      },
    },
    advantages: {
      ua: ["Сумісність з будь-яким банком світу", "Швидке підключення нових методів оплати", "Гнучка маршрутизація"],
      en: ["Global banking interoperability", "Zero-downtime payment provider onboarding", "Dynamic least-cost routing"],
      da: ["Global bankkompatibilitet", "Hurtig tilføjelse af betalingsmetoder", "Dynamisk omkostningsstyring"],
    },
  },

  "task-pos-dependency-injection": {
    taskId: "task-pos-dependency-injection",
    primaryTech: "Inversion of Control for Cryptographic HSM Provider (PKCS#11)",
    category: "architecture",
    whatIsIt: {
      ua: "Впровадження залежностей криптографічного процесора: у продакшені підключається апаратний HSM-чіп, а в тестах — програмний емулятор.",
      en: "Dependency injection isolating cryptographic key stores: production uses dedicated PKCS#11 HSM chips, while tests use mock providers.",
      da: "Dependency Injection der isolerer kryptografiske nøgler: hardware-HSM i drift og emulator i test.",
    },
    whyHere: {
      ua: "За стандартом PCI-DSS криптографічні ключі ніколи не повинні потрапляти в сирцевий код додатку або звичайну оперативну пам'ять.",
      en: "PCI-DSS standards strictly forbid master encryption keys from ever touching application source code or general RAM.",
      da: "PCI-DSS forbyder at krypteringsnøgler placeres i kildekode eller almindelig RAM.",
    },
    alternative: {
      name: "Direct Instantiation with Hardcoded Software Crypto Keys",
      tradeoff: {
        ua: "Збереження ключів прямо в коді дозволяє будь-кому витягнути їх декомпілятором і клонувати банківські карти.",
        en: "Embedding software keys in source code allows attackers to decompile the app binary and mass-clone customer cards.",
        da: "Nøgler direkte i koden kan udtrækkes med en dekompiler og bruges til at klone betalingskort.",
      },
    },
    advantages: {
      ua: ["Ключі неможливо викрасти з пам'яті", "Зручне локальне тестування", "Сертифікація за найвищим рівнем безпеки"],
      en: ["Keys cannot be dumped from memory", "Effortless isolated unit testing", "FIPS 140-2 Level 3 certification"],
      da: ["Nøgler kan ikke udlæses fra RAM", "Enkel isoleret unit-test", "Højeste sikkerhedscertificering"],
    },
  },

  "task-pos-double-deduction-bug": {
    taskId: "task-pos-double-deduction-bug",
    primaryTech: "Idempotency Keys & Deduplication Store (Redis SETNX / PostgreSQL)",
    category: "database",
    whatIsIt: {
      ua: "Унікальний клієнтський UUID токен операції (`Idempotency-Key`). Якщо повторний запит надходить з тим же ключем — транзакція не повторюється, а повертається готовий чек.",
      en: "Unique client-generated UUID token attached to payment requests (`Idempotency-Key`). Duplicate requests return the original receipt without recharging.",
      da: "Unik Idempotency-Key på betalingsanmodninger. Gentagne kald returnerer den oprindelige kvittering uden ny trækning.",
    },
    whyHere: {
      ua: "Коли інтернет блимає після списання коштів, касир тисне 'Повторити'. Ідемпотентність гарантує, що клієнт не заплатить двічі за одну каву.",
      en: "When mobile networks stutter after charging, cashiers mash the 'Retry' button. Idempotency guarantees the customer is never double-charged.",
      da: "Ved ustabilt netværk trykker kasseassistenten 'Prøv igen'. Idempotens sikrer at kunden ikke betaler to gange for samme vare.",
    },
    alternative: {
      name: "Blind Retries without Idempotency Token",
      tradeoff: {
        ua: "Повторні запити списують гроші з картки стільки разів, скільки разів клієнт натиснув кнопку, що веде до штрафів від платіжних систем та скарг.",
        en: "Blind retries bill customer cards repeatedly on every timeout, causing severe chargeback fees and regulatory banking sanctions.",
        da: "Blinde gentagne forsøg trækker beløbet igen og medfører store bankbøder og klagesager.",
      },
    },
    advantages: {
      ua: ["100% захист від подвійних списань", "Безпечні автоматичні повтори (Retries)", "Довіра клієнтів"],
      en: ["Zero double-billing incidents", "Safe automated network retries", "Rock-solid financial trust"],
      da: ["Nul risiko for dobbelttrækning", "Sikre automatiske gentagelser", "Kundefortrolighed og tillid"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 03: EMBEDDED HARDWARE & IOT GARAGE
  // ═════════════════════════════════════════════════════════════
  "task-iot-1-motion-stop": {
    taskId: "task-iot-1-motion-stop",
    primaryTech: "MQTT v5.0 (Publish/Subscribe Telemetry) with QoS 1/2",
    category: "protocol",
    whatIsIt: {
      ua: "Надлегкий бінарний протокол черг повідомлень для IoT-пристроїв. Заголовок пакета займає лише 2 байти. Працює за моделлю видавець-підписник через брокер (Mosquitto/EMQX).",
      en: "Ultra-lightweight binary publish-subscribe messaging protocol for constrained IoT sensors. Packet headers are just 2 bytes, routed through MQTT brokers.",
      da: "Ultralet binær pub/sub protokol for IoT-enheder med kun 2 bytes header-overhead via MQTT-broker.",
    },
    whyHere: {
      ua: "При виявленні перешкоди ворота гаража повинні зупинитися за 5 мілісекунд. MQTT доставляє подію миттєво через постійне відкрите TCP-з'єднання.",
      en: "When safety beams detect an obstacle, garage gates must halt within 5ms. MQTT delivers emergency stop frames instantly over persistent keep-alive sockets.",
      da: "Når en forhindring registreres, skal porten stoppe inden for 5ms via konstant åbne TCP-forbindelser.",
    },
    alternative: {
      name: "HTTP / REST Polling (`GET /api/sensors/obstacle` every 500ms)",
      tradeoff: {
        ua: "HTTP створює оверхед заголовків (близько 1 КБ тексту на кожен пінг), виснажує батарею сенсора за 2 тижні і має небезпечну затримку до 500 мс (ворота встигнуть вдарити авто).",
        en: "HTTP polling sends ~1KB of text headers on every request, depletes sensor batteries in 2 weeks, and incurs 500ms latency (the gate crushes the car).",
        da: "HTTP-polling sender 1KB headers pr. anmodning, dræner batteriet på 2 uger og har op til 500ms forsinkelse.",
      },
    },
    advantages: {
      ua: ["Затримка до 5 мс замість 500 мс", "Економія заряду батареї на 90%", "Гарантія доставки (QoS 1/2)"],
      en: ["Sub-5ms push latency vs 500ms polling", "90% sensor battery power savings", "Guaranteed delivery with QoS 1/2"],
      da: ["Under 5ms latency mod 500ms", "90% batteribesparelse", "Garanteret levering med QoS 1/2"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 04: API FORGE (CLIENT & SERVER SIMULATION)
  // ═════════════════════════════════════════════════════════════
  "task-api-1-heartbeat": {
    taskId: "task-api-1-heartbeat",
    primaryTech: "Kubernetes Liveness & Readiness Probes (RFC 7807)",
    category: "architecture",
    whatIsIt: {
      ua: "Мікросервісні перевірки працездатності: `/health/liveness` (чи живий процес) та `/health/readiness` (чи готовий приймати клієнтський трафік).",
      en: "Standard cloud-native health checks: `/health/liveness` (is the process deadlocked) and `/health/readiness` (ready to route user traffic).",
      da: "Cloud-native sundhedstjek: liveness (kører processen) og readiness (klar til trafik).",
    },
    whyHere: {
      ua: "Балансувальник навантаження повинен знати, на які сервери надсилати запити, а несправні екземпляри перезапускати автоматично.",
      en: "Cloud load balancers rely on fast ping endpoints to route traffic away from failing nodes and trigger automatic pod restarts.",
      da: "Load balancers bruger sundhedstjek til at lede trafik væk fra nedbrudte servere.",
    },
    alternative: {
      name: "Heavy Synthetic Database Query on Every Ping",
      tradeoff: {
        ua: "Виконання складного SQL-запиту на кожен пінг (кожні 2 секунди від 20 нод) створює паразитарне навантаження і кладе базу даних під час пікового трафіку.",
        en: "Executing full SQL queries on 2-second health intervals from 20 cluster nodes saturates database connections and triggers production outages.",
        da: "Tunge databasekald ved hvert 2-sekunders tjek overbelaster databasen unødigt.",
      },
    },
    advantages: {
      ua: ["Миттєва відповідь <1 мс", "Нуль навантаження на базу даних", "Автоматичне самовідновлення кластера"],
      en: ["Sub-millisecond response time", "Zero database connection exhaustion", "Automatic orchestrator self-healing"],
      da: ["Sub-millisekund svartid", "Ingen overbelastning af databasen", "Automatisk genopretning"],
    },
  },

  "task-api-2-path-params": {
    taskId: "task-api-2-path-params",
    primaryTech: "RESTful URI Resource Hierarchy & OpenAPI 3.0 Routing",
    category: "architecture",
    whatIsIt: {
      ua: "Стандарт іменування ресурсів за іменниками у множині (`/api/devices/{id}`), де ідентифікатор є частиною шляху для кешування проксі-серверами.",
      en: "Resource-oriented REST routing using plural nouns (`/api/devices/{id}`) where unique IDs form deterministic cacheable URI paths.",
      da: "Ressourceorienteret REST-routing med navneord i flertal (/api/devices/{id}) for optimal caching.",
    },
    whyHere: {
      ua: "Дозволяє проміжним CDN та шлюзам (Cloudflare, Envoy) автоматично кешувати відповіді для конкретного пристрою без запиту до сервера.",
      en: "Allows upstream edge gateways and CDNs (Cloudflare, Envoy) to cache device profiles transparently without hitting origin servers.",
      da: "Tillader CDNs og gateways (Cloudflare, Envoy) at cache enhedsprofiler effektivt.",
    },
    alternative: {
      name: "SOAP / RPC over POST with JSON Payload `{ action: 'get', id: 42 }`",
      tradeoff: {
        ua: "POST-запити за замовчуванням ніколи не кешуються мережевими проксі. Кожен запит навантажує сервер, а логи перетворюються на незрозумілу кашу.",
        en: "POST endpoints cannot be cached by HTTP edge proxies. Every read burns origin CPU, and access logs lose endpoint visibility.",
        da: "POST-forespørgsler caches ikke af proxyer, hvilket overbelaster serveren ved simple læsninger.",
      },
    },
    advantages: {
      ua: ["Автоматичне кешування на рівні HTTP", "Зрозуміла документація OpenAPI / Swagger", "Ідемпотентність GET-запитів"],
      en: ["Edge CDN caching compliance", "Auto-generated Swagger/OpenAPI schemas", "Idempotent safe GET retrieval"],
      da: ["Automatisk CDN-caching", "Standard OpenAPI dokumentation", "Sikre og idempotente GET-kald"],
    },
  },

  "task-api-3-dto-validation": {
    taskId: "task-api-3-dto-validation",
    primaryTech: "DTO Input Schema Validation & Deserialization Sanitization (Zod / FluentValidation)",
    category: "security",
    whatIsIt: {
      ua: "Строга валідація формату вхідних даних (DTO) на кордоні API ще до того, як запит потрапить до бізнес-логіки або бази даних.",
      en: "Strict Data Transfer Object (DTO) schema boundary validation rejecting malformed payloads before reaching business domain logic.",
      da: "Streng validering af input-data (DTO) ved API-grænsen før koden når forretningslogikken.",
    },
    whyHere: {
      ua: "Помилка валідації повертає клієнту чіткий статус `400 Bad Request` із переліком неправильних полів, захищаючи сервер від падіння.",
      en: "Returns standard `400 Bad Request` with structured error feedback, preventing SQL injection and unhandled crash panics.",
      da: "Returnerer standard 400 Bad Request ved fejl, hvilket forhindrer nedbrud og SQL-injections.",
    },
    alternative: {
      name: "Ad-hoc Manual `if` checks Scattered Inside Database Queries",
      tradeoff: {
        ua: "Ручні перевірки всередині SQL-запитів легко пропустити, що відкриває критичні дірки для XSS та SQL-ін'єкцій і повертає `500 Server Error`.",
        en: "Scattering manual checks deep in database code leads to missed fields, accidental SQL injection vulnerabilities, and ugly 500 crashes.",
        da: "Manuelle tjek dybt i koden bliver ofte glemt og åbner for alvorlige SQL-injections og 500-fejl.",
      },
    },
    advantages: {
      ua: ["Захист від шкідливих ін'єкцій", "Стандартний статус 400 Bad Request", "Чистий доменний шар"],
      en: ["Guaranteed injection immunity", "RFC 7807 standardized 400 errors", "Pristine domain architecture"],
      da: ["Beskyttelse mod injection", "Standardiseret 400-fejlretur", "Ren forretningslogik"],
    },
  },

  "task-api-4-bearer-auth": {
    taskId: "task-api-4-bearer-auth",
    primaryTech: "Stateless RFC 7519 JSON Web Token (JWT) with Cryptographic Signature",
    category: "security",
    whatIsIt: {
      ua: "Безсесійний токен авторизації (Bearer JWT), підписаний секретним ключем сервера (HMAC-SHA256 або RSA/EdDSA). Містить ID користувача та права доступу.",
      en: "Stateless RFC 7519 Bearer JSON Web Token carrying cryptographically signed user identity and roles without querying session tables.",
      da: "Tilstandsløs RFC 7519 Bearer JWT signeret med kryptografisk nøgle, der beviser brugerens identitet.",
    },
    whyHere: {
      ua: "Сервер перевіряє підпис токена локально за 0.05 мілісекунди без необхідності робити повільний запит у базу даних при кожному кліку.",
      en: "API gateways verify digital signatures in 0.05ms in CPU cache without querying centralized session databases on every click.",
      da: "Serveren verificerer signaturen i CPU-cache på 0,05ms uden at forespørge en sessionsdatabase.",
    },
    alternative: {
      name: "Stateful Server Sessions Stored in Centralized Database",
      tradeoff: {
        ua: "Сесії вимагають запиту в Redis/SQL на кожен HTTP-запит. Якщо база падає — жоден користувач не може зробити навіть просту дію.",
        en: "Stateful sessions force every microservice to query a shared session DB on every HTTP call, creating a colossal single point of failure.",
        da: "Sessionsdatabaser kræver opslag ved hvert eneste kald og skaber en fatal flaskehals.",
      },
    },
    advantages: {
      ua: ["Миттєва перевірка без звернення до БД", "Ідеально для мікросервісів", "Горизонтальне масштабування"],
      en: ["Zero database load on authentication", "Seamless microservice federation", "Infinite horizontal scalability"],
      da: ["Nul databasebelastning ved login", "Perfekt til mikrotjenester", "Uendelig horisontal skalering"],
    },
  },

  "task-api-5-client-consumer": {
    taskId: "task-api-5-client-consumer",
    primaryTech: "HttpClient Connection Pooling & HTTP/2 Persistent Keep-Alive",
    category: "network",
    whatIsIt: {
      ua: "Пул відкритих TCP-з'єднань, що повторно використовуються для багатьох HTTP-запитів замість постійного відкриття та закриття нових сокетів.",
      en: "High-performance TCP socket connection pooling reusing established TLS connections across thousands of HTTP requests.",
      da: "Genbrug af åbne TCP- og TLS-forbindelser (connection pooling) til tusindvis af HTTP-kald.",
    },
    whyHere: {
      ua: "Встановлення нового HTTPS з'єднання (TCP 3-way handshake + TLS Handshake) займає 150 мс. Пул зменшує цей час до 2 мс.",
      en: "Negotiating new TLS handshakes consumes ~150ms of network latency. Connection pooling reuses warm sockets in under 2ms.",
      da: "Ny TLS-forhandling tager ~150ms. Genbrug af sockets sænker svartiden til under 2ms.",
    },
    alternative: {
      name: "Creating `new HttpClient()` for Every Single Request",
      tradeoff: {
        ua: "Створення нового клієнта на кожен запит викликає Socket Exhaustion (вичерпання портів у стані TIME_WAIT), що повністю паралізує сервер під навантаженням.",
        en: "Creating new HTTP client instances on each call causes TCP Socket Exhaustion (lingering in TIME_WAIT), crashing production servers.",
        da: "Oprettelse af ny klient for hvert kald opbruger alle TCP-porte (TIME_WAIT) og crasher serveren.",
      },
    },
    advantages: {
      ua: ["У 50 разів швидший відгук", "Захист від вичерпання мережевих портів", "Економія пам'яті"],
      en: ["50x faster network roundtrips", "Guaranteed socket exhaustion immunity", "Minimal RAM and kernel footprint"],
      da: ["50x hurtigere netværkskald", "Forhindrer socket-mangel", "Minimalt RAM- og kerneforbrug"],
    },
  },

  "task-api-6-resiliency-retry": {
    taskId: "task-api-6-resiliency-retry",
    primaryTech: "Exponential Backoff with Full Jitter & Circuit Breaker (Polly / Resilience4j)",
    category: "architecture",
    whatIsIt: {
      ua: "Інженерний патерн повторних спроб: час очікування між спробами подвоюється (100ms -> 200ms -> 400ms) з випадковим шумом (Jitter), а Circuit Breaker зупиняє запити, якщо сервіс ліг.",
      en: "Resilience pattern combining exponential retry intervals, randomized jitter, and circuit breaker tripwires to safely recover from outages.",
      da: "Resilience-mønster med eksponentiel ventetid, jitter og circuit breaker for at håndtere netværksudfald.",
    },
    whyHere: {
      ua: "Якщо віддалена база перезавантажується, миттєві повтори від 10,000 клієнтів вчинять DDoS-атаку («Thundering Herd») і не дадуть їй піднятися.",
      en: "When downstream databases restart, 10,000 clients retrying immediately cause a Thundering Herd DDoS, preventing the database from recovering.",
      da: "Når en database genstarter, vil 10.000 samtidige gentagne kald overbelaste den i et Thundering Herd angreb.",
    },
    alternative: {
      name: "Immediate Tight-Loop Retries (`while (error) retry()` without sleep)",
      tradeoff: {
        ua: "Негайні повтори миттєво спалюють 100% CPU, генерують мільйони сміттєвих запитів і добивають слабкий або відновлюваний сервер.",
        en: "Tight retry loops peg CPU to 100%, flood network pipes with millions of useless packets, and knock recovering services offline permanently.",
        da: "Hurtige gentagelser uden pause belaster CPU med 100% og holder den genstartende server nede.",
      },
    },
    advantages: {
      ua: ["Захист серверів від само-DDoS", "Автоматичне згладжування піків", "Підвищення успішності запитів до 99.9%"],
      en: ["Thundering Herd DDoS immunity", "Smooth load recovery curve", "Boosts API success rates to 99.9%"],
      da: ["Beskyttelse mod selv-DDoS", "Blød genopretningskurve", "Hæver succesraten til 99,9%"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 05: GIT TIME MACHINE (VCS & MERKLE DAG)
  // ═════════════════════════════════════════════════════════════
  "task-git-1-genesis": {
    taskId: "task-git-1-genesis",
    primaryTech: "Merkle Directed Acyclic Graph (DAG) & Content-Addressable Storage",
    category: "architecture",
    whatIsIt: {
      ua: "Криптографічне сховище вмісту на основі хешів SHA-1/SHA-256. Будь-який файл або коміт є незмінним блоком (Blob/Commit), адресованим його хешем.",
      en: "Cryptographic Merkle Directed Acyclic Graph. Every file, directory tree, and commit is stored as an immutable object addressed by its SHA hash.",
      da: "Kryptografisk Merkle DAG hvor filer og commits gemmes som uforanderlige objekter adresseret via SHA-hash.",
    },
    whyHere: {
      ua: "Неможливо непомітно підробити історію: зміна навіть 1 коми в коді змінює хеш цього коміту і всіх наступних комітів проекту.",
      en: "Tamper-proof history: modifying even a single comma in source code alters its SHA hash and cascades through all subsequent child commits.",
      da: "Uforfalskelig historik: ændring af ét enkelt komma ændrer hele hash-kæden.",
    },
    alternative: {
      name: "Centralized Delta-Diff Version Control (Subversion / CVS)",
      tradeoff: {
        ua: "SVN вимагає постійного зв'язку з центральним сервером. Без інтернету неможливо зробити коміт або переглянути історію, а гілки займають гігабайти.",
        en: "Subversion requires network connectivity to a central server for every commit. Offline work is impossible, and branching copies gigabytes of files.",
        da: "SVN kræver konstant forbindelse til en central server. Offline-arbejde er umuligt og forgreninger fylder enormt.",
      },
    },
    advantages: {
      ua: ["100% автономна робота офлайн", "Криптографічний захист від підробок", "Миттєве створення репозиторію"],
      en: ["100% offline autonomy", "Cryptographic integrity guarantee", "Instantaneous repository initialization"],
      da: ["100% offline autonomi", "Kryptografisk integritetsgaranti", "Øjeblikkelig initialisering"],
    },
  },

  "task-git-2-branching": {
    taskId: "task-git-2-branching",
    primaryTech: "Lightweight Reference Pointers (41-Byte SHA Pointer)",
    category: "architecture",
    whatIsIt: {
      ua: "Гілка в Git — це просто текстовий файл розміром 41 байт у папці `.git/refs/heads/`, що містить хеш останнього коміту.",
      en: "Git branches are ultra-lightweight 41-byte text files in `.git/refs/heads/` storing nothing more than the SHA-1 commit hash.",
      da: "Git-branches er blot 41-byte tekstfiler i .git/refs/heads/ der indeholder et SHA-hash.",
    },
    whyHere: {
      ua: "Створення нової гілки в Git відбувається за 1 мілісекунду і не копіює жодного байту сирцевого коду.",
      en: "Creating a branch in Git executes in 1 millisecond and consumes zero bytes of disk space for source files.",
      da: "Oprettelse af en branch tager 1 millisekund og fylder praktisk talt ingenting på disken.",
    },
    alternative: {
      name: "Physical Directory Copying (SVN / Perforce Branches)",
      tradeoff: {
        ua: "У старих VCS створення гілки копіювало всі 500,000 файлів проекту на диск, займаючи 20 хвилин часу та гігабайти місця.",
        en: "Legacy VCS branched by duplicating the entire directory tree, wasting 20 minutes of developer time and gigabytes of disk space.",
        da: "Ældre versionsstyring kopierede hele mappetræet, hvilket tog 20 minutter og mange gigabytes.",
      },
    },
    advantages: {
      ua: ["Створення гілки за 1 мс", "Нуль зайвого місця на диску", "Безстрашне експериментування в ізоляції"],
      en: ["Sub-millisecond branch creation", "Near-zero disk footprint", "Fearless isolated experimentation"],
      da: ["Branching på 1ms", "Næsten intet diskforbrug", "Sikker isoleret udvikling"],
    },
  },

  "task-git-3-merge": {
    taskId: "task-git-3-merge",
    primaryTech: "Three-Way Merge Algorithm (Common Ancestor Diffing)",
    category: "pattern",
    whatIsIt: {
      ua: "Алгоритм злиття на основі спільного предка (Merge Base). Git порівнює зміни обох гілок відносно точки їхнього розгалуження.",
      en: "Three-way merge algorithm computing diffs relative to the most recent common ancestor commit (Merge Base).",
      da: "3-vejs merge-algoritme der beregner ændringer i forhold til den fælles stamfader (Merge Base).",
    },
    whyHere: {
      ua: "Якщо двоє інженерів редагували різні файли або різні функції в одному файлі, Git об'єднує їх автоматично без втручання людини.",
      en: "When two engineers edit different functions in the same repository, Git merges both changes automatically with zero manual friction.",
      da: "Når to udviklere redigerer forskellige funktioner, samler Git automatisk ændringerne uden manuelle konflikter.",
    },
    alternative: {
      name: "Two-Way Snapshot Overwriting (Blind File Copy)",
      tradeoff: {
        ua: "Просте копіювання файлів затирає чужі зміни: код останнього, хто зберіг файл, тихо знищує роботу колеги за цілий день.",
        en: "Naive file overwriting silently wipes out colleague contributions without conflict detection, destroying entire workdays.",
        da: "Simpel filoverskrivning sletter kollegaens arbejde uden varsel.",
      },
    },
    advantages: {
      ua: ["Автоматичне вирішення 95% злиттів", "Збереження внеску кожного розробника", "Чітка історія змін"],
      en: ["Automated resolution for 95% of merges", "Lossless team collaboration", "Auditable merge lineage"],
      da: ["Automatisk samling af 95% af ændringer", "Sikkert samarbejde uden tab", "Reviderbar historik"],
    },
  },

  "task-git-4-conflict": {
    taskId: "task-git-4-conflict",
    primaryTech: "Three-Way Merge Conflict Markers (`<<<<<<<`, `=======`, `>>>>>>>`)",
    category: "pattern",
    whatIsIt: {
      ua: "Механізм безпечної зупинки злиття при виявленні суперечливих змін в одному рядку. Git розставляє маркери конфлікту та чекає вибору інженера.",
      en: "Safety tripwire halting merge operations when opposing branches edit identical line ranges, injecting explicit collision markers.",
      da: "Sikkerhedsmekanisme der pauser merge ved modstridende linjer og indsætter konfliktmarkører.",
    },
    whyHere: {
      ua: "Запобігає потраплянню зламаного коду в головну гілку: комп'ютер не вгадує, який рядок важливіший, а делегує рішення авторам.",
      en: "Guarantees broken logic is never silently injected into production: humans resolve semantic intent explicitly.",
      da: "Forhindrer at ødelagt kode havner i produktion ved at lade udvikleren vælge intentionen.",
    },
    alternative: {
      name: "Arbitrary Last-Write-Wins Auto-Resolution",
      tradeoff: {
        ua: "Автоматичний вибір 'чиєїсь' версії призводить до прихованих критичних багів у релізі, які неможливо відловити компілятором.",
        en: "Blind Last-Write-Wins rules silently drop security fixes or core logic, shipping catastrophic undetected runtime defects.",
        da: "Blind overskrivning kasserer sikkerhedsrettelser og skaber uforudsigelige produktionsfejl.",
      },
    },
    advantages: {
      ua: ["Нуль випадково втраченого коду", "Повна прозорість конфлікту", "Захист стабільності гілки main"],
      en: ["Zero accidental code loss", "Absolute conflict transparency", "Guaranteed production branch stability"],
      da: ["Nul utilsigtet tab af kode", "Fuld gennemsigtighed", "Garanteret stabilitet i main"],
    },
  },

  "task-git-5-rebase": {
    taskId: "task-git-5-rebase",
    primaryTech: "Linear History Git Rebase (Commit Replaying)",
    category: "pattern",
    whatIsIt: {
      ua: "Перенесення базової точки гілки: Git бере коміти поточної гілки і послідовно 'переграє' їх поверх найсвіжішого коміту гілки `main`.",
      en: "Replaying a branch's unique commits sequentially on top of the latest tip of `main`, producing a pristine linear history.",
      da: "Genafspilning af en branchs commits ovenpå den seneste main, hvilket giver en ren lineær historik.",
    },
    whyHere: {
      ua: "Створює красиву лінійну історію проекту без зайвих вузлів і merge-комітів, що робить пошук багів через `git bisect` ідеальним.",
      en: "Maintains a clean linear commit graph without noisy merge bubbles, enabling automated debugging via `git bisect`.",
      da: "Giver en ren lineær historik uden unødige merge-commits, hvilket gør git bisect uhyre effektiv.",
    },
    alternative: {
      name: "Repeated Intermediary Merge Commits",
      tradeoff: {
        ua: "Постійні `git merge main` створюють заплутане 'залізничне полотно' з сотнями порожніх merge-комітів, у яких неможливо розібратися.",
        en: "Back-merging main repeatedly creates an incomprehensible 'railroad tracks' history cluttered with hundreds of noisy merge commits.",
        da: "Konstant merge af main skaber en uoverskuelig 'togbane-historik' med støjende merge-commits.",
      },
    },
    advantages: {
      ua: ["Ідеальна лінійна історія", "Простий бінарний пошук багів (git bisect)", "Легкий аудит коду перед релізом"],
      en: ["Pristine linear project timeline", "Fast binary bug localization with `git bisect`", "Effortless pre-release code reviews"],
      da: ["Ren lineær tidslinje", "Hurtig fejlsøgning med git bisect", "Enkel code review før release"],
    },
  },

  "task-git-6-pull-request": {
    taskId: "task-git-6-pull-request",
    primaryTech: "Trunk-Based Development & Automated CI/CD Gateways",
    category: "architecture",
    whatIsIt: {
      ua: "Процес перевірки коду перед злиттям у `main`: автоматичний запуск тестів (CI), статичний аналіз (Lint/SAST) та обов'язковий Code Review колегами.",
      en: "Rigorous quality gate before merging into `main`: automated CI test suites, security linters, and peer code reviews.",
      da: "Kvalitetsport før merge til main: automatiske CI-tests, sikkerhedsscanning og peer code review.",
    },
    whyHere: {
      ua: "Жоден рядок коду не потрапляє на сервери компанії без підтвердження тестів та схвалення мінімум одного Senior інженера.",
      en: "Guarantees zero unreviewed or broken code ever reaches production servers, enforcing organizational engineering standards.",
      da: "Sikrer at ingen uprøvet eller fejlbehæftet kode når produktionsserverne.",
    },
    alternative: {
      name: "Direct Pushing to Production Branch (`git push origin main`)",
      tradeoff: {
        ua: "Прямий пуш у main — головна причина аварій SEV-1. Одна випадкова синтаксична помилка одразу ламає продакшен усім користувачам.",
        en: "Direct pushing to main is the #1 cause of SEV-1 production outages: a single broken typo immediately takes the platform down.",
        da: "Direkte push til main er hovedårsagen til SEV-1 nedbrud, hvor en slåfejl crasher hele platformen.",
      },
    },
    advantages: {
      ua: ["Захист стабільності продакшену", "Обмін досвідом у команді", "Автоматична верифікація 100% тестів"],
      en: ["Production outage prevention", "Continuous team knowledge transfer", "Automated 100% test verification"],
      da: ["Forebyggelse af produktionsnedbrud", "Løbende videndeling i teamet", "Automatisk testbekræftelse"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 06: CYBER BANDIT LAB & APPLICATION SECURITY
  // ═════════════════════════════════════════════════════════════
  "task-bandit-1-hidden-key": {
    taskId: "task-bandit-1-hidden-key",
    primaryTech: "HashiCorp Vault & Cloud Key Management Service (KMS / AWS Secrets Manager)",
    category: "security",
    whatIsIt: {
      ua: "Централізоване захищене сховище секретів з шифруванням у спокої (AES-256), контролем доступу (RBAC) та автоматичною ротацією ключів.",
      en: "Hardened centralized secret management with hardware-backed encryption at rest (AES-256-GCM) and dynamic automated key rotation.",
      da: "Centraliseret hemmelighedshåndtering med AES-256 kryptering og automatisk nøglerotation.",
    },
    whyHere: {
      ua: "API-ключі та паролі до бази даних ніколи не повинні зберігатися у вихідному коді чи файлах конфігурації, доступних розробникам.",
      en: "Production database credentials and third-party API tokens must never reside in source control where developers or attackers can read them.",
      da: "Produktionsadgangskoder og API-nøgler må aldrig ligge i kildekoden hvor de kan læses.",
    },
    alternative: {
      name: "Hardcoded String Secrets in Source Code (`const API_KEY = '...'`)",
      tradeoff: {
        ua: "Захардкоджені секрети негайно витікають у публічні репозиторії GitHub або логи збірки, де боти-сканери викрадають їх за 30 секунд.",
        en: "Hardcoded strings leak into Git history and CI build artifacts, where automated scraper bots harvest them within 30 seconds.",
        da: "Hårdkodede hemmeligheder lækkes hurtigt til Git-historik hvor bots høster dem på sekunder.",
      },
    },
    advantages: {
      ua: ["Секрети ніколи не потрапляють у Git", "Автоматична ротація без простою", "Повний аудит кожного звернення"],
      en: ["Zero secret exposure in Git", "Zero-downtime automated rotation", "Comprehensive access audit logging"],
      da: ["Ingen hemmeligheder i Git", "Automatisk rotation uden nedetid", "Komplet adgangslogning"],
    },
  },

  "task-bandit-2-obfuscation": {
    taskId: "task-bandit-2-obfuscation",
    primaryTech: "Constant-Time Cryptographic Comparison (`crypto.timingSafeEqual`)",
    category: "security",
    whatIsIt: {
      ua: "Алгоритм порівняння двох рядків чи хешів, який завжди виконується за однаковий час незалежно від того, на якому символі знайдено невідповідність.",
      en: "Constant-time string and hash comparison algorithm executing in fixed CPU cycles regardless of where byte mismatches occur.",
      da: "Konstant-tids sammenligningsalgoritme der altid tager samme tid uanset hvor bytes afviger.",
    },
    whyHere: {
      ua: "Захищає від таймінг-атак (Timing Attacks): звичайний оператор `==` переривається на першому невірному символі, дозволяючи зловмиснику вгадати токен по наносекундах.",
      en: "Defeats Timing Attacks: standard `==` operators exit on the first mismatched byte, allowing attackers to deduce tokens by measuring nanosecond deltas.",
      da: "Beskytter mod Timing Attacks hvor angribere gætter tokens baseret på nanosekunders målinger.",
    },
    alternative: {
      name: "Standard Short-Circuiting String Equality (`str1 == str2`)",
      tradeoff: {
        ua: "Ранній вихід з оператора `==` робить час перевірки довшим для кожного вгаданого байта, що дозволяє підібрати секретний токен за кілька тисяч запитів.",
        en: "Short-circuiting `==` reveals secret token prefixes through statistical response latency analysis over network jitter.",
        da: "Almindelig '==' afslører hemmelige tegn via statistisk svartidsanalyse.",
      },
    },
    advantages: {
      ua: ["100% захист від атак по часу", "Криптографічний стандарт безпеки", "Проста інтеграція однією функцією"],
      en: ["Immunity to side-channel timing attacks", "Cryptographic industry standard", "Drop-in security hardening"],
      da: ["Immunitet mod side-channel angreb", "Kryptografisk industristandard", "Enkel sikkerhedshærdning"],
    },
  },

  "task-bandit-3-wire-tap": {
    taskId: "task-bandit-3-wire-tap",
    primaryTech: "Transport Layer Security (TLS 1.3) with Perfect Forward Secrecy (PFS)",
    category: "security",
    whatIsIt: {
      ua: "Сучасний криптографічний протокол захисту трафіку. Використовує алгоритм Діффі-Хеллмана (ECDHE), що генерує унікальні тимчасові сесійні ключі.",
      en: "Modern cryptographic transport security using ephemeral Diffie-Hellman key exchanges (ECDHE) to ensure Perfect Forward Secrecy.",
      da: "Moderne TLS 1.3 transportkryptering med midlertidige Diffie-Hellman nøgler for Perfect Forward Secrecy.",
    },
    whyHere: {
      ua: "Навіть якщо головний приватний ключ сервера буде викрадено в майбутньому, зловмисник ніколи не зможе розшифрувати раніше записаний трафік.",
      en: "Even if server private keys are compromised years later, attackers cannot decrypt recorded past network communications.",
      da: "Selv hvis serverens private nøgle stjæles i fremtiden, kan tidligere optaget netværkstrafik ikke dekrypteres.",
    },
    alternative: {
      name: "Plaintext HTTP or Unencrypted TCP Sockets",
      tradeoff: {
        ua: "Будь-який посередник у мережі (публічний Wi-Fi у кафе, провайдер) може прочитати паролі, номери карток і токени у відкритому вигляді через Wireshark.",
        en: "Unencrypted traffic allows anyone on the local Wi-Fi or transit ISP to intercept passwords and cookies in cleartext with Wireshark.",
        da: "Ukrypteret trafik tillader alle på det åbne Wi-Fi at læse adgangskoder og cookies i klartekst.",
      },
    },
    advantages: {
      ua: ["Повна конфіденційність трафіку", "Захист від підміни даних (Man-in-the-Middle)", "Швидкий TLS 1.3 Handshake (1 RTT)"],
      en: ["Total communication confidentiality", "Man-in-the-Middle tamper resistance", "Fast 1-RTT handshake latency"],
      da: ["Fuldstændig fortrolighed", "Beskyttelse mod Man-in-the-Middle", "Hurtig 1-RTT handshake"],
    },
  },

  "task-bandit-4-sql-injection": {
    taskId: "task-bandit-4-sql-injection",
    primaryTech: "Parameterized Prepared Statements ($1, $2) & Strict ORM Binding",
    category: "security",
    whatIsIt: {
      ua: "Розділення структури SQL-запиту та даних користувача. База даних спочатку компілює шаблон запиту, а дані підставляє як безпечні значення.",
      en: "Separation of SQL query code from user data parameters. The SQL engine compiles the query plan before binding untrusted input safely.",
      da: "Adskillelse af SQL-forespørgselskode og brugerdata. Databasen kompilerer skabelonen før parametre indsættes.",
    },
    whyHere: {
      ua: "Усуває вразливість SQL Injection №1 у світі: символ лапки `'` або рядок `OR 1=1` інтерпретується просто як текст, а не як команда базі даних.",
      en: "Completely neutralizes OWASP Top 10 SQL Injection: quotes `'` and `OR 1=1` payloads are treated purely as inert literal strings.",
      da: "Neutraliserer SQL-injection fuldstændigt: 'OR 1=1' behandles som en harmløs streng og ikke som kode.",
    },
    alternative: {
      name: "Dynamic String Concatenation (`\"SELECT * WHERE name = '\" + input + \"'\"`)",
      tradeoff: {
        ua: "Конкатенація дозволяє зловмиснику вставити шкідливу команду `admin' --`, обійти пароль і повністю вивантажити або видалити всю базу даних.",
        en: "String concatenation permits attackers to inject malicious SQL (`admin' --`), bypass authentication, and drop database tables.",
        da: "Klassisk streng-sammensætning lader hackere injicere kode, omgå adgangskontrol og slette databasen.",
      },
    },
    advantages: {
      ua: ["100% захист від SQL Injection", "Кешування плану виконання запитів (Query Plan)", "Швидша робота бази даних"],
      en: ["100% SQL injection immunity", "Pre-compiled database execution plan caching", "Measurably faster database performance"],
      da: ["100% immunitet mod SQL-injection", "Caching af eksekveringsplan i databasen", "Mærkbart hurtigere databasekald"],
    },
  },

  "task-bandit-5-rate-limiter": {
    taskId: "task-bandit-5-rate-limiter",
    primaryTech: "Token Bucket & Sliding Window Counter in Distributed In-Memory Redis",
    category: "network",
    whatIsIt: {
      ua: "Алгоритм обмеження кількості запитів у секунду (RPS) на основі 'кошика токенів' у надшвидкій пам'яті Redis із підтримкою розподілених серверів.",
      en: "Distributed Token Bucket and Sliding Window algorithm hosted in Redis enforcing strict per-IP / per-token rate limits across cluster nodes.",
      da: "Distribueret Token Bucket algoritme i Redis der håndhæver hastighedsgrænser pr. IP på tværs af servere.",
    },
    whyHere: {
      ua: "Зупиняє спамерів, ботів та атаки підбору паролів: користувач може робити не більше 5 спроб авторизації за хвилину.",
      en: "Stops credential stuffing and API abuse: limits users to 5 login attempts per minute, throttling malicious botnets gracefully.",
      da: "Stopper credential stuffing og bot-angreb ved at begrænse til 5 loginforsøg pr. minut.",
    },
    alternative: {
      name: "Unshared Local Process Memory Counter (`Map<string, number>`)",
      tradeoff: {
        ua: "Локальний лічильник зберігається окремо на кожній ноді. Якщо у вас 10 серверів, бот зможе надіслати в 10 разів більше запитів, обходячи захист.",
        en: "In-memory maps are siloed per container: an attacker with 10 backend pods simply rotates requests to get 10x the allowed rate limit.",
        da: "Lokale RAM-tællere deles ikke mellem containere, så en angriber kan omgå grænsen via 10 pods.",
      },
    },
    advantages: {
      ua: ["Централізований контроль усього кластера", "Захист від DDoS та перебору паролів", "Відповідь 429 Too Many Requests"],
      en: ["Cluster-wide synchronized enforcement", "Complete DDoS and brute-force mitigation", "Standardized RFC 6585 429 status code"],
      da: ["Synkroniseret beskyttelse af hele klyngen", "Effektiv DDoS- og brute-force blokering", "Standardiseret 429-fejlretur"],
    },
  },

  "task-bandit-6-defense-in-depth": {
    taskId: "task-bandit-6-defense-in-depth",
    primaryTech: "Defense-in-Depth Layered Architecture & Zero Trust Model",
    category: "security",
    whatIsIt: {
      ua: "Стратегія багатоешелонованої безпеки: WAF на вході, mTLS між сервісами, RBAC авторизація, валідація даних, шифрування бази та аудит-логи.",
      en: "Multi-layered Defense-in-Depth and Zero Trust architecture: perimeter WAF -> service mTLS -> granular RBAC -> encrypted datastores.",
      da: "Lagdelt sikkerhedsstrategi (Defense-in-Depth og Zero Trust): WAF -> mTLS -> RBAC -> krypteret database.",
    },
    whyHere: {
      ua: "Якщо хакер подолає один рівень захисту (наприклад, знайде вразливість у бібліотеці), наступний рівень ізоляції зупинить атаку.",
      en: "Ensures that if an adversary compromises a single perimeter component, subsequent security layers contain the breach immediately.",
      da: "Sikrer at hvis en hacker bryder gennem yderkanten, stoppes angrebet af de indre sikkerhedslag.",
    },
    alternative: {
      name: "Perimeter-Only 'Castle-and-Moat' Security Model",
      tradeoff: {
        ua: "Модель 'замок і рів': якщо зловмисник зламав один зовнішній веб-сервер, він отримує повний відкритий доступ до всіх внутрішніх баз і систем.",
        en: "Castle-and-moat models trust all internal network traffic: once an edge server is breached, attackers roam internal databases unrestricted.",
        da: "Slot-og-voldgrav-modellen stoler blindt på intern trafik; et gennembrud giver fri adgang til hele netværket.",
      },
    },
    advantages: {
      ua: ["Неможливість захоплення всієї системи", "Локалізація зламу в пісочниці", "Відповідність вимогам SOC 2 та ISO 27001"],
      en: ["Zero single points of security failure", "Breach containment to sandbox zones", "Full SOC 2 and ISO 27001 compliance"],
      da: ["Ingen enkeltstående sikkerhedsfejl", "Isolering af brud til sandbox", "Overholder SOC 2 og ISO 27001"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 07: GOOGLE VERTEX AI & ENTERPRISE MLOPS
  // ═════════════════════════════════════════════════════════════
  "task-vertex-1-gcs-connect": {
    taskId: "task-vertex-1-gcs-connect",
    primaryTech: "Cloud Storage Streaming Ingestion & GCS FUSE Sharding",
    category: "cloud",
    whatIsIt: {
      ua: "Потокове читання навчальних даних безпосередньо з хмарного сховища GCS через оптимізовані бінарні чанки без попереднього завантаження гігабайтів на локальний диск інстансу.",
      en: "Streaming training dataset ingestion directly from Cloud Storage (GCS) via optimized binary chunks without downloading terabytes to local VM disks.",
      da: "Streaming af datasæt direkte fra Cloud Storage (GCS) i binære bidder uden forudgående download til lokal disk.",
    },
    whyHere: {
      ua: "Навчальні датасети важать сотні гігабайтів. Потокове зчитування дозволяє розпочати навчання моделі за секунди замість годин очікування копіювання.",
      en: "Datasets scale to hundreds of gigabytes. Direct streaming kicks off training batches within seconds rather than waiting hours for local disk rsync.",
      da: "Datasæt fylder ofte hundreder af gigabytes. Direkte streaming starter træning på sekunder i stedet for timers filkopiering.",
    },
    alternative: {
      name: "Downloading Full Tarball Archives to Local Instance Disk",
      tradeoff: {
        ua: "Забиває локальний SSD, збільшує час старту воркерів на години та вимагає втричі дорожчих віртуальних машин з великими дисками.",
        en: "Exhausts node disk space, stalls cluster initialization for hours, and forces expensive high-capacity local SSD provisioning.",
        da: "Bruger al lokal diskplads, forsinker klyngeopstart i timevis og kræver markant dyrere servere.",
      },
    },
    advantages: {
      ua: ["Миттєвий старт тренувальних воркерів", "Нульові витрати локального дискового простору", "Паралельне зчитування батчів з високою пропускною здатністю"],
      en: ["Instant training pod startup", "Zero local node disk footprint", "High-throughput parallelized batch streaming"],
      da: ["Øjeblikkelig pod-opstart", "Intet lokalt diskforbrug", "Høj båndbredde med parallel batch-streaming"],
    },
  },

  "task-vertex-2-preprocessing": {
    taskId: "task-vertex-2-preprocessing",
    primaryTech: "Columnar Feature Stores & Apache Arrow / Parquet Transforms",
    category: "database",
    whatIsIt: {
      ua: "Колонковий бінарний формат даних зі стисненням Snappy та векторною обробкою в пам'яті через Apache Arrow без накладних витрат на десеріалізацію.",
      en: "Columnar binary format with Snappy compression and zero-copy in-memory compute via Apache Arrow, eliminating deserialization overhead.",
      da: "Søjleorienteret binært format med komprimering og lynhurtig hukommelsesbehandling via Apache Arrow.",
    },
    whyHere: {
      ua: "ML-моделі тренуються на числових матрицях. Колонковий формат дозволяє завантажувати в GPU тільки потрібні ознаки на максимальній швидкості шини PCIe.",
      en: "ML models compute on numerical tensors. Columnar layouts read only required feature columns at full PCIe bandwidth directly into GPU memory.",
      da: "ML-modeller arbejder med matricer. Søjleformatet indlæser kun relevante kolonner direkte til GPU med maksimal hastighed.",
    },
    alternative: {
      name: "Uncompressed CSV / JSON Parsing via Standard Python Loops",
      tradeoff: {
        ua: "Рядкові текстові файли потребують парсингу кожного рядка в CPU, створюючи 'GPU Starvation' — дорога відеокарта 80% часу простоює в очікуванні даних.",
        en: "Row-based text parsing exhausts CPU cycles, causing GPU starvation where expensive accelerators sit idle waiting for slow data parsing.",
        da: "Rækkevis tekstparsing overbelaster CPU'en og skaber 'GPU Starvation', hvor grafikkortet spilder tid på langsomme data.",
      },
    },
    advantages: {
      ua: ["Висока пропускна здатність читання даних", "Компактне стиснення даних у сховищі", "Zero-copy пряма передача в тензори"],
      en: ["High-throughput feature ingest", "Compact on-disk footprint", "Zero-copy tensor serialization"],
      da: ["Høj læsehastighed for features", "Kompakt datastørrelse", "Zero-copy direkte til tensormatricer"],
    },
  },

  "task-vertex-3-pipeline-yaml": {
    taskId: "task-vertex-3-pipeline-yaml",
    primaryTech: "Kubeflow Pipelines (KFP) & Argo DAG Workflow Engine",
    category: "cloud",
    whatIsIt: {
      ua: "Декларативний конвеєр машинного навчання у вигляді спрямованого ациклічного графа (DAG) у форматі YAML/JSON, що виконується в контейнерах Kubernetes.",
      en: "Declarative machine learning pipeline compiled into a Directed Acyclic Graph (DAG) executed as isolated Kubernetes container steps.",
      da: "Deklarativ ML-pipeline samlet i en Directed Acyclic Graph (DAG) udført i Kubernetes-containere.",
    },
    whyHere: {
      ua: "Забезпечує 100% відтворюваність навчання моделі: кожен крок (очищення, тренування, оцінка) кешується і зберігає точні версії даних та артефактів.",
      en: "Guarantees 100% deterministic model lineage: every step (ETL, training, evaluation) is cached with cryptographic artifact tracking.",
      da: "Sikrer 100% reproducerbar modeltræning: hvert trin caches med præcis versionsstyring.",
    },
    alternative: {
      name: "Ad-hoc Python & Bash Scripts Run Manually in Terminal",
      tradeoff: {
        ua: "Ручні скрипти не зберігають історію артефактів. Якщо інженер звільниться, ніхто в компанії не зможе відтворити модель з тими ж вагами.",
        en: "Manual bash scripts provide zero artifact lineage. If the engineer departs, the company cannot reproduce the production weights.",
        da: "Manuelle scripts mangler sporbarhed; hvis ingeniøren stopper, kan modellen ikke genskabes.",
      },
    },
    advantages: {
      ua: ["100% відтворюваність навчання", "Автоматичне кешування незмінних кроків", "Масштабування на тисячі вузлів"],
      en: ["100% reproducible experiments", "Automated step caching saves cloud spend", "Effortless scale-out to thousands of nodes"],
      da: ["100% reproducerbarhed", "Automatisk caching sparer cloud-udgifter", "Skalering til tusindvis af noder"],
    },
  },

  "task-vertex-4-hardware-selection": {
    taskId: "task-vertex-4-hardware-selection",
    primaryTech: "Heterogeneous Accelerator Provisioning (NVIDIA Tensor Core / Google Cloud TPU v4)",
    category: "hardware",
    whatIsIt: {
      ua: "Спеціалізовані тензорні процесори (TPU/GPU) з матричними блоками множення (bfloat16 / FP8 / INT8), що виконують мільйони операцій за один такт.",
      en: "Dedicated tensor processors (TPU/GPU) with hardware systolic arrays running millions of matrix multiply-accumulate operations in a single clock cycle.",
      da: "Dedikerede tensor-processorer (TPU/GPU) med hardware-accelereret matrixmultiplikation for lynhurtig modeltræning.",
    },
    whyHere: {
      ua: "Навчання глибоких нейромереж на звичайних CPU триває місяці. Тензорні ядра скорочують час розрахунку матриць градієнтів до кількох годин.",
      en: "Training deep networks on CPUs takes months. Tensor cores compress gradient matrix computations down to hours with native mixed-precision arithmetic.",
      da: "Træning på almindelige CPU'er tager måneder. Tensor-kerner reducerer beregningstiden til få timer med hardwareoptimering.",
    },
    alternative: {
      name: "CPU-Only General Purpose Virtual Machines",
      tradeoff: {
        ua: "Загальні процесори оптимізовані під умовні переходи, а не паралельні матричні обчислення, тому навчання зупиняється на етапі зворотного поширення помилки.",
        en: "General-purpose CPUs prioritize branch prediction over massive parallel SIMD, resulting in extreme thermal throttling and stalled backpropagation.",
        da: "Generelle CPU'er er ikke bygget til parallelle matrixberegninger, hvilket gør træningen uacceptabelt langsom.",
      },
    },
    advantages: {
      ua: ["Сотні TFLOPS обчислювальної потужності", "Апаратна підтримка mixed-precision (BF16)", "Енергетична ефективність розрахунків"],
      en: ["Hundreds of TFLOPS compute power", "Hardware mixed-precision (BF16/FP8)", "Maximum power-to-compute efficiency"],
      da: ["Hundreder af TFLOPS regnekraft", "Mixed-precision hardwareunderstøttelse", "Optimal energieffektivitet pr. beregning"],
    },
  },

  "task-vertex-5-hyperparams": {
    taskId: "task-vertex-5-hyperparams",
    primaryTech: "Bayesian Optimization & Gaussian Process Hyperparameter Tuning (Vertex Vizier)",
    category: "pattern",
    whatIsIt: {
      ua: "Імовірнісний алгоритм підбору гіперпараметрів (learning rate, batch size, dropout), що будує модель корисності та обирає найбільш перспективні експерименти.",
      en: "Probabilistic hyperparameter optimization using Gaussian processes to balance exploration and exploitation across learning rates and batch sizes.",
      da: "Sandsynlighedsbaseret optimering (Bayesian Optimization) der klogt vælger de mest lovende hyperparametre.",
    },
    whyHere: {
      ua: "Кожен експеримент на GPU коштує реальних грошей. Байєсівська оптимізація знаходить оптимум за 20 спроб замість сотень сліпих запусків.",
      en: "Every GPU training run costs money. Bayesian optimization zeroes in on optimal validation loss in 20 smart trials instead of hundreds of blind iterations.",
      da: "Hvert GPU-forsøg koster cloud-penge. Bayesiansk optimering finder de bedste parametre på 20 forsøg frem for hundreder af blinde gæt.",
    },
    alternative: {
      name: "Exhaustive Grid Search or Pure Random Guessing",
      tradeoff: {
        ua: "Grid Search експоненційно витрачає хмарний бюджет на явно програшні комбінації параметрів (наприклад, занадто великий learning rate).",
        en: "Grid search suffers combinatorial explosion, wasting thousands of cloud dollars running doomed trials with exploding gradients.",
        da: "Grid Search eksploderer i tidsforbrug og spilder budget på parameterkombinationer der fejler med det samme.",
      },
    },
    advantages: {
      ua: ["Мінімальна кількість тренувальних спроб", "Математичне балансування exploration vs exploitation", "Економія хмарного бюджету"],
      en: ["Minimal trial budget required", "Mathematical exploration vs exploitation balance", "Significant cloud compute cost savings"],
      da: ["Færre nødvendige træningskørsler", "Optimal balance mellem udforskning og udnyttelse", "Markant lavere cloud-omkostninger"],
    },
  },

  "task-vertex-6-run-training": {
    taskId: "task-vertex-6-run-training",
    primaryTech: "Distributed Data Parallel (PyTorch DDP / NCCL AllReduce) with Resilient Checkpointing",
    category: "architecture",
    whatIsIt: {
      ua: "Розподілене навчання на кластері з багатьох GPU, де кожен воркер має копію моделі та синхронізує градієнти через оптимізовану бібліотеку NCCL (Ring-AllReduce).",
      en: "Multi-node distributed training where each GPU computes forward/backward passes on distinct mini-batches, synchronizing gradients via NCCL Ring-AllReduce.",
      da: "Distribueret træning på flere GPU'er med gradient-synkronisering via NCCL Ring-AllReduce og automatisk gemning af checkpoints.",
    },
    whyHere: {
      ua: "Масштабує навчання великих моделей на десятки GPU з лінійним прискоренням і дозволяє відновити тренування з останнього чекпойнту при падінні ноди.",
      en: "Scales training throughput linearly across GPU clusters while preserving fault tolerance: if a preemptible node dies, training resumes from the latest checkpoint.",
      da: "Giver næsten lineær skalering over flere GPU'er og sikrer mod datatab ved nedbrud via automatiske checkpoints.",
    },
    alternative: {
      name: "Single-GPU Training with Manual Ad-Hoc Scripts",
      tradeoff: {
        ua: "При будь-якому збої інфраструктури або перезавантаженні сервера весь багатоденний прогрес навчання безповоротно втрачається.",
        en: "A single node hardware fault or spot instance termination wipes out days of uncheckpointed training progress.",
        da: "Et enkelt servernedbrud sletter dages træningsfremskridt hvis der mangler strukturerede checkpoints.",
      },
    },
    advantages: {
      ua: ["Масштабування на десятки GPU", "Відмовостійкість при збоях інфраструктури", "Ефективне використання Spot/Preemptible інстансів"],
      en: ["Near-linear multi-GPU scaling", "Automated spot node recovery", "Substantial spot/preemptible compute savings"],
      da: ["Lineær skalering over mange GPU'er", "Automatisk genoptagelse ved fejl", "Store besparelser med Spot-servere"],
    },
  },

  "task-vertex-7-deploy-endpoint": {
    taskId: "task-vertex-7-deploy-endpoint",
    primaryTech: "Triton Inference Server & Dynamic Batching Model Runtime",
    category: "cloud",
    whatIsIt: {
      ua: "Високопродуктивний C++ сервер виводу (inference), що об'єднує поодинокі запити користувачів у спільні батчі (Dynamic Batching) для максимальної утилізації GPU.",
      en: "High-performance C++ inference engine grouping concurrent user requests into dynamic GPU execution batches with minimal tail latency.",
      da: "C++ inference-server (Triton) der samler individuelle brugerforespørgsler i dynamiske GPU-batches med lav latency.",
    },
    whyHere: {
      ua: "Обробка кожного запиту окремо навантажує GPU лише на 5%. Динамічний батчинг піднімає утилізацію до 95% без відчутного зростання затримки.",
      en: "Serving one request per GPU kernel launch wastes 90% of tensor cores. Dynamic batching saturates GPU duty cycles with sub-20ms SLA guarantees.",
      da: "Behandling af én anmodning ad gangen spilder grafikkortets regnekraft. Dynamisk batching udnytter GPU'en optimalt.",
    },
    alternative: {
      name: "Synchronous Flask / Django Python Web App wrapping Model",
      tradeoff: {
        ua: "Python GIL (Global Interpreter Lock) блокує багатопотоковість, викликає черги на вході та падає при 50 одночасних запитах.",
        en: "Python GIL serialization creates severe queueing delay under concurrent traffic, crashing worker processes under moderate load spikes.",
        da: "Python GIL blokerer parallelle forespørgsler og skaber lange køer ved selv moderat brugertrafik.",
      },
    },
    advantages: {
      ua: ["Максимальна утилізація GPU", "Динамічне батчування запитів", "P99 затримка <25 мс"],
      en: ["Full GPU core saturation", "Zero-copy IPC dynamic batching", "Sub-25ms P99 latency SLA"],
      da: ["Maksimal GPU-udnyttelse", "Dynamisk batching uden ventetid", "P99 responstid under 25ms"],
    },
  },

  "task-vertex-8-autoscaling": {
    taskId: "task-vertex-8-autoscaling",
    primaryTech: "KEDA Metric-Driven Horizontal Pod Autoscaler (HPA) for GPU Workloads",
    category: "cloud",
    whatIsIt: {
      ua: "Автоматичне масштабування кількості подів моделі на основі довжини черги запитів та утилізації пам'яті GPU, а не лише стандартного завантаження CPU.",
      en: "Event-driven Kubernetes autoscaling querying inference queue depth and GPU memory utilization to scale model replicas before latency spikes.",
      da: "Automatisk skalering af model-pods baseret på kølængde og GPU-forbrug i stedet for forældede CPU-målinger.",
    },
    whyHere: {
      ua: "У пікові години навантаження зростає в рази. Автоскейлінг миттєво піднімає нові копії моделі, а вночі згортає їх до нуля для економії.",
      en: "Absorbs sudden enterprise traffic bursts by scaling pods ahead of queue build-up, downscaling to zero during off-peak hours to save thousands of dollars.",
      da: "Håndterer pludselige trafikspidser ved at starte nye instanser og skalerer ned om natten for at spare penge.",
    },
    alternative: {
      name: "Statically Provisioned Always-On Dedicated GPU Nodes",
      tradeoff: {
        ua: "Компанія платить тисячі доларів щомісяця за порожні сервери вночі, а під час раптового піку система однаково падає через перевантаження.",
        en: "Fixed sizing burns massive cloud budgets on idle GPU capacity at night, yet still drops user connections when traffic surges beyond static limits.",
        da: "Faste servere koster tusindvis af kroner i tomgang og bryder alligevel sammen under uventede spidsbelastninger.",
      },
    },
    advantages: {
      ua: ["Масштабування до нуля в період простою", "Миттєве реагування на довжину черги", "Збереження SLO затримки під навантаженням"],
      en: ["Scale-to-zero cost efficiency", "Queue-depth proactive scaling", "Rock-solid latency SLA preservation"],
      da: ["Skalering til nul i tomgang", "Proaktiv reaktion på kølængde", "Sikring af oppetid og svartider under spidsbelastning"],
    },
  },

  "task-vertex-9-ab-traffic": {
    taskId: "task-vertex-9-ab-traffic",
    primaryTech: "Envoy Service Mesh Canary Traffic Splitting & Weighted Shadowing",
    category: "network",
    whatIsIt: {
      ua: "Керування трафіком на рівні L7 проксі (Envoy/Istio): перенаправлення 5% реальних користувачів на нову версію моделі v2 з порівнянням метрик якості.",
      en: "L7 service mesh routing splitting live inference requests (e.g. 95% v1, 5% v2) with optional traffic shadowing to evaluate candidate models risk-free.",
      da: "Routestyring via Service Mesh (Envoy) der sender 5% af trafikken til en ny model v2 for at teste kvaliteten uden risiko.",
    },
    whyHere: {
      ua: "Нова версія нейромережі може мати приховані галюцинації чи деградацію точності. Canary-реліз дозволяє виявити проблему на малій вибірці без шкоди для бізнесу.",
      en: "Protects production revenue: if candidate v2 hallucinates or regresses on critical edge cases, canary routing isolates blast radius to 5% of users.",
      da: "Beskytter produktionen: hvis model v2 fejler, rammer det kun 5% af brugerne før automatisk tilbagerulning.",
    },
    alternative: {
      name: "Hard 100% Big-Bang Model Replacement in Production",
      tradeoff: {
        ua: "Миттєве перемикання 100% трафіку без тестування наживо: у разі критичної помилки моделі всі клієнти компанії одночасно отримують збій.",
        en: "All-at-once cutovers expose 100% of customers to unforeseen model flaws simultaneously, turning minor regression into catastrophic outages.",
        da: "Øjeblikkelig udskiftning af 100% af trafikken risikerer totalt nedbrud for alle brugere ved uventede modelfejl.",
      },
    },
    advantages: {
      ua: ["Нульовий ризик для 95% користувачів", "Автоматичний rollback при деградації метрик", "Порівняння бізнес-конверсії на реальних даних"],
      en: ["Zero impact on primary user base", "Automated rollbacks on metric anomalies", "Real-world production A/B evaluation"],
      da: ["Sikker test på lille trafikmængde", "Automatisk tilbagerulning ved fejl", "A/B-sammenligning på rigtige produktionsdata"],
    },
  },

  "task-vertex-10-service-account": {
    taskId: "task-vertex-10-service-account",
    primaryTech: "Workload Identity Federation & Ephemeral OIDC Tokens (Zero Long-Lived Keys)",
    category: "security",
    whatIsIt: {
      ua: "Безпечна автентифікація Kubernetes-подів у хмарних сервісах через тимчасові OIDC-токени без створення постійних файлів сервісних акаунтів (JSON keys).",
      en: "Short-lived OpenID Connect (OIDC) token exchange allowing Kubernetes service accounts to impersonate Cloud IAM roles without static JSON keys.",
      da: "Sikker cloud-godkendelse via kortlivede OIDC-tokens der helt fjerner behovet for sårbare JSON-nøglefiler.",
    },
    whyHere: {
      ua: "Статичні JSON-ключі сервісних акаунтів регулярно витікають на GitHub або в публічні логи. Workload Identity генерує токени, які живуть лише 1 годину.",
      en: "Static credential JSON files are the #1 source of cloud breaches via GitHub leaks. Workload Identity uses ephemeral 60-minute cryptographic tokens.",
      da: "Statiske nøglefiler er den største kilde til cloud-sikkerhedsbrud. Workload Identity udsteder midlertidige tokens der udløber automatisk.",
    },
    alternative: {
      name: "Static Long-Lived Service Account JSON Keyfiles stored in Git/Containers",
      tradeoff: {
        ua: "Будь-який розробник або зловмисник, що отримав доступ до файла ключа, має необмежений за часом доступ до хмарної інфраструктури.",
        en: "Compromised static private keys remain valid indefinitely until manual revocation, providing attackers permanent root access to enterprise cloud.",
        da: "Statiske nøgler forbliver gyldige i årevis hvis de lækkes, hvilket giver hackere permanent adgang.",
      },
    },
    advantages: {
      ua: ["Повна відсутність секретів у вихідному коді", "Токени автоматично знешкоджуються через 60 хв", "Відповідність вимогам SOC 2 та ISO 27001"],
      en: ["Zero secret footprint in repos or pods", "Automatic 60-minute token expiration", "Guaranteed SOC 2 / ISO 27001 compliance"],
      da: ["Ingen hemmeligheder i kildekoden", "Tokens udløber automatisk efter 60 min", "Overholder strenge revisionskrav"],
    },
  },

  "task-vertex-11-vpc-peering": {
    taskId: "task-vertex-11-vpc-peering",
    primaryTech: "Private Service Connect (PSC) & Isolated VPC Subnet Peering",
    category: "network",
    whatIsIt: {
      ua: "Приватний тунель між VPC-мережею компанії та хмарними сервісами машинного навчання через внутрішні IP-адреси без виходу в публічний інтернет.",
      en: "Private L4 network endpoints routing training and inference traffic entirely within the cloud provider backbone over private RFC 1918 IP addresses.",
      da: "Lukket netværkstunnel (PSC) der forbinder klyngen med cloud-tjenester via interne IP-adresser uden internetadgang.",
    },
    whyHere: {
      ua: "Конфіденційні медичні та банківські датасети не повинні передаватися через відкритий інтернет, де вони вразливі до перехоплення та MITM-атак.",
      en: "Sensitive banking and medical training datasets must never traverse public internet routes, preventing external snooping and MITM attacks.",
      da: "Følsomme bank- og sundhedsdata må aldrig sendes over det offentlige internet for at undgå aflytning.",
    },
    alternative: {
      name: "Public HTTPS Endpoints protected only by API Keys",
      tradeoff: {
        ua: "Публічні IP-адреси відкриті для сканування ботами, DDoS-атак та спроб підбору ключів з усього світу.",
        en: "Public endpoint IPs are exposed to port scanning, brute-force credential stuffing, and volumetric denial-of-service attacks from global botnets.",
        da: "Offentlige IP-adresser er sårbare over for scanninger, DDoS-angreb og brute-force forsøg fra hele verden.",
      },
    },
    advantages: {
      ua: ["Нульова видимість у публічному інтернеті", "Захист від витоку даних на рівні мережі", "Зниження мережевої затримки на 30%"],
      en: ["Zero public internet exposure", "Network-level data exfiltration block", "Reduced routing latency on private backbone"],
      da: ["Usynlig for det offentlige internet", "Maksimal databeskyttelse på netværksniveau", "Lavere netværksforsinkelse"],
    },
  },

  "task-vertex-12-data-residency": {
    taskId: "task-vertex-12-data-residency",
    primaryTech: "Sovereign Cloud Regional Data Pinning & Cryptographic CMEK Encryption",
    category: "security",
    whatIsIt: {
      ua: "Сувора прив'язка даних та обчислювальних потужностей до конкретного географічного регіону (наприклад, `europe-west4` Нідерланди) з ключами замовника (CMEK).",
      en: "Geographic pinning of training storage and compute clusters to designated sovereign jurisdictions (e.g. EU/GDPR) encrypted with customer keys (CMEK).",
      da: "Regional fastlåsning af data og servere til et specifikt land (f.eks. EU/GDPR) krypteret med kundens egne nøgler (CMEK).",
    },
    whyHere: {
      ua: "Європейське законодавство (GDPR) забороняє вивезення персональних даних громадян за межі ЄС. Порушення загрожує штрафами до 20 мільйонів євро.",
      en: "Enforces strict GDPR and HIPAA regulatory mandates: personal European customer data must never cross borders into non-sovereign jurisdictions.",
      da: "Overholder GDPR: europæiske persondata må ikke forlade EU uden store bøder til følge.",
    },
    alternative: {
      name: "Unrestricted Multi-Region Default Buckets (Global Anycast Routing)",
      tradeoff: {
        ua: "Хмара автоматично копіює дані на сервери в США чи Азії, що є прямим юридичним порушенням регламенту захисту даних.",
        en: "Global routing silently replicates data across international boundaries, triggering severe regulatory penalties and customer contract breaches.",
        da: "Globale standard-indstillinger kopierer data til servere i USA eller Asien i strid med europæisk lovgivning.",
      },
    },
    advantages: {
      ua: ["100% відповідність вимогам GDPR та HIPAA", "Повний контроль за географією зберігання", "Клієнтські ключі шифрування (CMEK)"],
      en: ["Full GDPR and HIPAA legal compliance", "Deterministic geographic data sovereignty", "Customer-Managed Encryption Keys (CMEK)"]
      ,da: ["Komplet overholdelse af GDPR og HIPAA", "Fuld kontrol over data-geografi", "Kryptering med egne nøgler (CMEK)"],
    },
  },

  "task-vertex-13-drift-detection": {
    taskId: "task-vertex-13-drift-detection",
    primaryTech: "Continuous Model Monitoring & Kolmogorov-Smirnov / PSI Drift Tests",
    category: "cloud",
    whatIsIt: {
      ua: "Статистичний аналіз зміни розподілу вхідних ознак у часі (Population Stability Index / KS-Test) між даними навчання та живими запитами користувачів.",
      en: "Statistical distribution drift monitoring using Kolmogorov-Smirnov and Population Stability Index (PSI) algorithms against baseline training data.",
      da: "Statistisk overvågning af datadrift med Kolmogorov-Smirnov og PSI for at fange afvigelser fra træningsdata.",
    },
    whyHere: {
      ua: "З часом поведінка користувачів змінюється (Data Drift), і точність моделі падає. Моніторинг автоматично фіксує деградацію та ініціює донавчання.",
      en: "User behavior evolves over time (Data Drift), degrading inference accuracy. Automated drift triggers alert engineers and kick off retraining.",
      da: "Brugeradfærd ændrer sig over tid (Data Drift). Overvågning opdager fald i præcision og starter gentræning.",
    },
    alternative: {
      name: "Periodic Manual Accuracy Spot-Checks Once a Year",
      tradeoff: {
        ua: "Без моніторингу модель може кілька місяців видавати неправильні рекомендації або блокувати клієнтів, завдаючи збитків на мільйони доларів.",
        en: "Without continuous drift monitoring, degraded models silently serve toxic predictions for months, costing millions in revenue.",
        da: "Uden aktiv drift-overvågning kan en defekt model give forkerte svar i månedsvis før det opdages.",
      },
    },
    advantages: {
      ua: ["Миттєве виявлення старіння моделі", "Автоматичний запуск перенавчання (CI/CD/CT)", "Збереження бізнес-метрик"],
      en: ["Real-time feature distribution alerts", "Automated continuous retraining (CT)", "Protects high-value business KPIs"],
      da: ["Øjeblikkelig advarsel ved forringelse", "Automatisk gentræning (CT)", "Beskytter forretningskritiske KPI'er"],
    },
  },

  "task-vertex-14-latency-slo": {
    taskId: "task-vertex-14-latency-slo",
    primaryTech: "P99/P95 Latency Budgets & OpenTelemetry Distributed Trace Profiling",
    category: "pattern",
    whatIsIt: {
      ua: "Вимірювання продуктивності системи за 99-м перцентилем (P99) та наскрізний трейсинг кожного запиту через спани (OpenTelemetry / Jaeger).",
      en: "Latency distribution monitoring focusing on P99 tail metrics with OpenTelemetry distributed trace spans tracking each stage of inference execution.",
      da: "Overvågning af svartider via P99-percentiler og OpenTelemetry tracing for at finde flaskehalse i hvert enkelt trin.",
    },
    whyHere: {
      ua: "Середня затримка (Average) приховує проблеми: вона може бути 50 мс, тоді як кожен сотий користувач чекає відповіді 5 секунд і залишає сервіс.",
      en: "Averages hide catastrophic tail latency: mean latency can report 50ms while 1 in 100 users experiences 5-second freezes and abandons the platform.",
      da: "Gennemsnitlige svartider snyder: gennemsnittet kan være 50ms, mens hver 100. bruger venter 5 sekunder og opgiver.",
    },
    alternative: {
      name: "Monitoring Only Arithmetic Mean (Average) Response Time",
      tradeoff: {
        ua: "Маскує хвости розподілу: мікропаузи збирача сміття (GC) та очікування GPU залишаються непоміченими до масових скарг клієнтів.",
        en: "Averages flatten outliers, blinding operations teams to severe GPU kernel serialization bottlenecks and GC stalls affecting real users.",
        da: "Gennemsnit udglatter afvigelser og skjuler mikropauser i systemet for driftsafdelingen.",
      },
    },
    advantages: {
      ua: ["Точне виявлення прихованих затримок", "Наскрізна деталізація кожного запиту", "Гарантія дотримання бізнес-SLO"],
      en: ["Eliminates tail latency blind spots", "Granular sub-millisecond trace spans", "Guarantees contractual user SLO compliance"],
      da: ["Afslører skjulte flaskehalse", "Detaljeret overblik over hver anmodning", "Sikrer overholdelse af forretningens SLA"],
    },
  },

  "task-vertex-15-retraining-trigger": {
    taskId: "task-vertex-15-retraining-trigger",
    primaryTech: "Event-Driven Continuous Training (CT) Webhook Triggers & Model Registry Lineage",
    category: "architecture",
    whatIsIt: {
      ua: "Подієво-орієнтований запуск перенавчання моделі при надходженні нових порцій даних або спрацюванні сигналів дрифту через хмарні черги Pub/Sub.",
      en: "Event-driven MLOps pipeline orchestration triggering continuous retraining jobs via Cloud Pub/Sub events when new ground truth labels arrive.",
      da: "Hændelsesdrevet genoptræning (Continuous Training) udløst automatisk via hændelseskøer når nye data ankommer.",
    },
    whyHere: {
      ua: "Автоматизує повний життєвий цикл моделі: як тільки накопичується новий перевірений масив даних, пайплайн тренує та оцінює оновлену версію без участі людини.",
      en: "Automates model freshness: newly validated production feedback automatically triggers retraining and evaluation without manual engineering toil.",
      da: "Holder modellen opdateret: validerede produktionsdata starter automatisk gentræning og test uden manuelt arbejde.",
    },
    alternative: {
      name: "Manual Cron Jobs or Infrequent Developer-Initiated Scripts",
      tradeoff: {
        ua: "Ручні процеси забуваються, моделі місяцями працюють на застарілих даних, втрачаючи здатність розуміти нові тенденції ринку.",
        en: "Manual retraining cycles get deferred, leaving mission-critical models operating on stale historical data that degrades business returns.",
        da: "Manuelle processer glemmes ofte, så modeller kører på forældede data og taber forretningsværdi.",
      },
    },
    advantages: {
      ua: ["Повна автоматизація оновлення моделей", "Актуальність алгоритмів 24/7", "Збереження точної історії версій (Lineage)"],
      en: ["Zero-touch model lifecycle automation", "Always-fresh predictions adapting to shifts", "Cryptographic dataset-to-artifact lineage tracking"],
      da: ["Fuldautomatisk modelopdatering", "Modellen tilpasser sig markedet 24/7", "Komplet sporbarhed af data og modeller"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 08: FIELD AI DEPLOYER (FDE & EDGE AI RUNTIMES)
  // ═════════════════════════════════════════════════════════════
  "task-fde-1-initial-meeting": {
    taskId: "task-fde-1-initial-meeting",
    primaryTech: "RFC Requirements Discovery Matrix & User Problem Framing",
    category: "pattern",
    whatIsIt: {
      ua: "Структурована методологія збору технічних вимог та формулювання проблеми клієнта у форматі RFC (Request for Comments) перед написанням першого рядка коду.",
      en: "Structured technical requirements discovery framework codifying customer pain points into an RFC (Request for Comments) before writing code.",
      da: "Struktureret metode til afdækning af krav og problemformulering i et RFC-dokument før der kodes.",
    },
    whyHere: {
      ua: "Половина IT-проєктів зазнають невдачі, тому що розробники будують технічно правильне рішення для зовсім іншої проблеми клієнта.",
      en: "Most failed engineering projects fail not from bad code, but from building the wrong solution due to unverified assumptions.",
      da: "De fleste mislykkede projekter fejler fordi ingeniører bygger den forkerte løsning baseret på gætterier.",
    },
    alternative: {
      name: "Jumping Directly into Writing Code on Day One",
      tradeoff: {
        ua: "Команда витрачає тижні на розробку непотрібних функцій, після чого клієнт відмовляється від результату.",
        en: "Leads to weeks of wasted engineering hours building unnecessary features that don't address the client's actual core bottleneck.",
        da: "Fører til spildte arbejdstimer på funktioner som kunden slet ikke har brug for.",
      },
    },
    advantages: {
      ua: ["Повне порозуміння з бізнесом", "Запобігання переробкам коду", "Чіткі критерії успіху з першого дня"],
      en: ["Crystal-clear business alignment", "Elimination of costly architectural rewrites", "Unambiguous measurable success criteria"],
      da: ["Krystalklar forventningsafstemning", "Undgår dyre omskrivninger", "Klare succeskriterier fra start"],
    },
  },

  "task-fde-2-pain-point": {
    taskId: "task-fde-2-pain-point",
    primaryTech: "5 Whys Root Cause Profiling & Quantitative Bottleneck Analysis",
    category: "pattern",
    whatIsIt: {
      ua: "Методика багаторівневого аналізу першопричин збоїв (5 Whys) на основі числових метрик (метрики затримки, втрати транзакцій, помилки баз даних).",
      en: "Empirical root-cause analysis (5 Whys) driven by quantitative instrumentation (latency profiles, query lock times, drop rates).",
      da: "Empirisk rodårsagsanalyse (5 Whys) baseret på konkrete målinger af flaskehalse og fejl.",
    },
    whyHere: {
      ua: "Клієнт часто скаржиться на видимий симптом ('повільний сайт'), тоді як справжня проблема криється у відсутності індексу в базі даних чи блокуючому I/O.",
      en: "Clients report surface symptoms ('the app feels sluggish') while the actual culprit is an unindexed database query or synchronous network lock.",
      da: "Kunder klager over symptomer ('systemet er langsomt'), mens den reelle årsag er manglende databaseindekser eller blokerende kald.",
    },
    alternative: {
      name: "Superficial Symptom Patching without Root-Cause Verification",
      tradeoff: {
        ua: "Додавання випадкового кешу або збільшення потужності сервера тимчасово маскує проблему, але вона вибухає знову при збільшенні трафіку.",
        en: "Throwing faster hardware or hasty cache layers at surface symptoms hides flaws temporarily, causing catastrophic failure under future load.",
        da: "Køb af større servere eller hurtige lappeløsninger skjuler problemet midlertidigt indtil næste nedbrud.",
      },
    },
    advantages: {
      ua: ["Ліквідація справжньої причини збоїв", "Економія бюджету на оптимізацію", "Стійкість до майбутнього зростання навантаження"],
      en: ["Permanent root-cause elimination", "Zero budget wasted on incorrect fixes", "Long-term architectural resilience"],
      da: ["Permanent løsning på problemet", "Ingen spildte penge på forkerte fixes", "Robusthed over for fremtidig vækst"],
    },
  },

  "task-fde-3-scope-definition": {
    taskId: "task-fde-3-scope-definition",
    primaryTech: "MoSCoW Prioritization & Rigid Scope Boundary Contracts",
    category: "pattern",
    whatIsIt: {
      ua: "Матриця класифікації завдань (Must have, Should have, Could have, Won't have) з фіксацією меж проєкту в технічній угоді (SOW).",
      en: "Formal scope boundary management (MoSCoW framework) establishing legally binding delivery commitments and explicit non-goals in the SOW.",
      da: "Opdeling af opgaver (MoSCoW: Must, Should, Could, Won't) der fastlægger projektets grænser og forhindrer ukontrolleret vækst.",
    },
    whyHere: {
      ua: "Захищає команду від неконтрольованого розростання вимог (Scope Creep), коли в ході робіт клієнт додає все нові й нові 'дрібнички'.",
      en: "Shields teams from uncontrolled scope creep where ad-hoc client requests quietly derail sprint commitments and blow deadlines.",
      da: "Beskytter mod 'Scope Creep', hvor kunden løbende tilføjer nye ønsker der vælter tidsplanen.",
    },
    alternative: {
      name: "Open-Ended Unbounded Verbal Promises ('We will do everything you need')",
      tradeoff: {
        ua: "Проєкт перетворюється на нескінченний довгобуд, команда вигорає, а бюджет закінчується задовго до релізу.",
        en: "Projects spiral into endless death marches with burned-out engineers and depleted budgets before delivering a single working milestone.",
        da: "Projekter trækker i langdrag, teamet brænder ud, og budgettet slipper op før levering.",
      },
    },
    advantages: {
      ua: ["Гарантований своєчасний реліз MVP", "Захист від перепрацювань та стресу", "Прозорість очікувань замовника"],
      en: ["Guaranteed on-time MVP delivery", "Protection against developer burnout", "Clear, transparent customer expectations"],
      da: ["Sikker og rettidig MVP-levering", "Forebygger stress i teamet", "Gennemskuelige forventninger"],
    },
  },

  "task-fde-4-api-connect": {
    taskId: "task-fde-4-api-connect",
    primaryTech: "OpenAPI 3.1 Contract Handshakes & Ephemeral Mock Adapters",
    category: "protocol",
    whatIsIt: {
      ua: "Машиночитаний стандарт специфікації API (OpenAPI/Swagger) з автоматичною генерацією клієнтських SDK та мок-серверів для паралельної розробки.",
      en: "Machine-readable OpenAPI 3.1 interface contracts driving auto-generated type-safe SDKs and schema-validated mock server fixtures.",
      da: "OpenAPI-standard med typesikre kontrakter og automatiske mock-servere til parallel udvikling.",
    },
    whyHere: {
      ua: "Дозволяє фронтенду і бекенду розробляти модулі паралельно, гарантуючи, що при реальному з'єднанні формати полів і типів збіжаться на 100%.",
      en: "Unblocks parallel frontend/backend development: contract mocks ensure seamless integration without field mismatch surprises on launch day.",
      da: "Gør det muligt for frontend og backend at bygge uafhængigt med garanti for, at dataformater passer sammen ved integration.",
    },
    alternative: {
      name: "Unformalized Ad-Hoc Endpoints documented in Google Docs or Chat",
      tradeoff: {
        ua: "Рядки документації застарівають за день, типи розходяться, і перший реальний запит падає з помилкою 500 через несподіване null-поле.",
        en: "Text chat notes become obsolete immediately; type mismatches break production on release night with unexpected null exceptions.",
        da: "Tekstbeskeder og noter forældes hurtigt, hvilket fører til uventede null-fejl og nedbrud.",
      },
    },
    advantages: {
      ua: ["Автоматична генерація типізованих клієнтів", "Паралельна розробка без очікування бекенду", "100% сумісність форматів даних"],
      en: ["Automated type-safe SDK generation", "Zero-block parallel team workflows", "Compile-time schema validation"],
      da: ["Automatisk generering af typesikre klienter", "Parallel udvikling uden ventetid", "Ingen ubehagelige overraskelser ved integration"],
    },
  },

  "task-fde-5-debug-legacy": {
    taskId: "task-fde-5-debug-legacy",
    primaryTech: "Strangler Fig Migration Pattern & Non-Invasive Routing Shims",
    category: "architecture",
    whatIsIt: {
      ua: "Архітектурний патерн поступової заміни застарілої монолітної системи: новий функціонал пишеться як мікросервіс, а шлюз поступово переводить трафік.",
      en: "Incremental modernisation pattern routing traffic through an API gateway proxy, gradually replacing legacy endpoints without wholesale system shutdowns.",
      da: "Strangler Fig-mønster der gradvist erstatter ældre systemer modul for modul via en smart routing-proxy.",
    },
    whyHere: {
      ua: "Переписати 10-річну систему з нуля практично неможливо. Strangler Fig дозволяє впроваджувати сучасні сервіси без зупинки роботи бізнесу.",
      en: "Full rewrites of 10-year-old core systems almost always fail. Strangler Fig delivers modern services incrementally with zero business downtime.",
      da: "At omskrive et 10 år gammelt system fra bunden fejler næsten altid. Dette mønster sikrer fornyelse uden nedetid.",
    },
    alternative: {
      name: "High-Risk 'Big Bang' Monolithic System Rewrite",
      tradeoff: {
        ua: "Вимагає років розробки 'в стіл', а в день запуску стара база даних не стикується з новою, спричиняючи зупинку всієї компанії.",
        en: "Years of closed development without customer feedback, culminating in launch-day disasters when old and new data models clash.",
        da: "Årelang udvikling uden feedback der ofte ender i kaos når det nye system endelig rulles ud.",
      },
    },
    advantages: {
      ua: ["Постійна доступність системи 24/7", "Швидка доставка цінності клієнту частинами", "Можливість легкого відкату окремого модуля"],
      en: ["Continuous 24/7 business availability", "Continuous incremental value delivery", "Granular per-endpoint rollback capability"],
      da: ["Kontinuerlig drift uden nedetid", "Hurtig levering af værdi i små bidder", "Let tilbagerulning af enkelte moduler"],
    },
  },

  "task-fde-6-data-transform": {
    taskId: "task-fde-6-data-transform",
    primaryTech: "Schema-Enforced Data Transformations (Pydantic / Zod / Apache Avro)",
    category: "pattern",
    whatIsIt: {
      ua: "Строга валідація вхідних даних на межі системи за допомогою типізованих схем, що гарантують правильні типи (int, UUID, ISO date) перед обробкою.",
      en: "Strict boundary schema enforcement using declarative models (Pydantic/Zod), parsing and sanitizing untrusted external payloads into immutable types.",
      da: "Streng skemavalidering (Pydantic/Zod) der renser og validerer eksterne data til sikre, uforanderlige datatyper.",
    },
    whyHere: {
      ua: "Зовнішні системи часто надсилають несподівані формати (`null` замість рядка або число в лапках). Схеми зупиняють брудні дані на вході.",
      en: "Partner APIs frequently transmit corrupted payloads (e.g. string numbers or nulls). Strict schemas reject invalid data before corrupting state.",
      da: "Eksterne systemer sender ofte forkerte formater. Skemavalidering afviser ugyldige data før de forurener databasen.",
    },
    alternative: {
      name: "Unchecked Dynamic Dictionary Access (`data['user']['id']`)",
      tradeoff: {
        ua: "Коли поле відсутнє, програма викидає фатальний `KeyError` або `NullReferenceException` глибоко всередині бізнес-логіки.",
        en: "Raw dictionary key lookups cause silent data corruption or unhandled KeyError crashes deep inside database transactions.",
        da: "Uvalideret opslag i rå objekter fører til uventede nedbrud dybt inde i forretningslogikken.",
      },
    },
    advantages: {
      ua: ["Неможливість помилок відсутності полів", "Автоматична типізація та парсинг", "Чіткі зрозумілі повідомлення про помилки клієнту"],
      en: ["Zero unexpected null/key crashes", "Automated type coercion and parsing", "Actionable validation error messages"],
      da: ["Ingen uventede nedbrud ved manglende felter", "Automatisk parsing og typestyring", "Præcise fejlmeddelelser til klienten"],
    },
  },

  "task-fde-7-agent-architecture": {
    taskId: "task-fde-7-agent-architecture",
    primaryTech: "Model Context Protocol (MCP) & Autonomous ReAct Execution Loop",
    category: "architecture",
    whatIsIt: {
      ua: "Відкритий протокол інтеграції штучного інтелекту зі сторонніми інструментами (бази даних, термінал, API) за структурованою схемою Thought -> Action -> Observation.",
      en: "Open protocol standardizing AI agent integration with tools and databases via structured Thought -> Action -> Observation reasoning loops.",
      da: "Åben standard (MCP) til integration af AI-agenter med værktøjer og databaser via Thought -> Action -> Observation løkker.",
    },
    whyHere: {
      ua: "Агент не просто генерує текст, а автономно викликає потрібні функції системи, перевіряє результат та виправляє свої помилки в реальному часі.",
      en: "Enables agents to query live enterprise databases, execute diagnostic scripts, inspect results, and self-correct errors autonomously.",
      da: "Giver agenten mulighed for at kalde systemfunktioner, inspicere resultater og rette egne fejl automatisk.",
    },
    alternative: {
      name: "Single-Prompt Text Generation without Tool Calling",
      tradeoff: {
        ua: "Звичайний одноразовий запит до LLM не має доступу до живих даних компанії і вигадує факти (галюцинує), коли стикається з невідомим.",
        en: "Single-shot LLMs lack live environmental feedback, hallucinating fabricated data when encountering enterprise edge cases.",
        da: "Simple LLM-kald uden værktøjsadgang mangler friske data og hallucinerer svar ved ukendte scenarier.",
      },
    },
    advantages: {
      ua: ["Автономне вирішення комплексних завдань", "Доступ до живих баз даних через API", "Кардинальне зниження фактологічних галюцинацій"],
      en: ["Autonomous multi-step problem solving", "Real-time enterprise tool integration", "Grounded factuality with verifiable sources"],
      da: ["Autonom flertrins-problemløsning", "Integration med friske data via API", "Markant færre hallucinationer"],
    },
  },

  "task-fde-8-rag-setup": {
    taskId: "task-fde-8-rag-setup",
    primaryTech: "Enterprise RAG Ingestion Pipeline & Metadata-Tagged Vector Indexing",
    category: "architecture",
    whatIsIt: {
      ua: "Пайплайн підготовки внутрішніх документів: парсинг PDF/Markdown, розбиття на семантичні чанки, генерація ембеддінгів та збереження у векторній БД.",
      en: "End-to-end knowledge ingestion parsing enterprise documents into semantic chunks with role-based access control (RBAC) metadata in vector storage.",
      da: "Vidensopsamling (RAG) der opdeler virksomhedens dokumenter i bidder og gemmer dem i en vektordatabase med adgangsstyring.",
    },
    whyHere: {
      ua: "Дає змогу AI-агенту відповідати на запитання виключно за офіційними регламентами компанії з точними посиланнями на джерела.",
      en: "Powers AI agents to answer customer questions strictly grounded in official policy manuals, complete with direct page-number citations.",
      da: "Gør AI-assistenten i stand til at svare præcist baseret på officielle dokumenter med direkte kildehenvisninger.",
    },
    alternative: {
      name: "Dumping Entire 500-Page PDF Documents into Raw LLM Context",
      tradeoff: {
        ua: "Вичерпує контекстне вікно моделі, коштує в десятки разів дорожче на кожен запит і призводить до 'Lost in the Middle' — модель губить суть.",
        en: "Exhausts prompt token budgets, multiplies API costs 50x, and causes context dilution where models overlook facts buried in large documents.",
        da: "Overfylder modellens kontekst, koster 50x mere pr. kald og får modellen til at overse vigtige detaljer.",
      },
    },
    advantages: {
      ua: ["Відповіді тільки за перевіреними фактами", "Швидкий пошук за мілісекунди", "Повний контроль прав доступу до документів"],
      en: ["Strict factual grounding", "Sub-second semantic search latency", "Fine-grained document RBAC filtering"],
      da: ["Præcise svar baseret på fakta", "Lynhurtig semantisk søgning", "Streng adgangskontrol på dokumentniveau"],
    },
  },

  "task-fde-9-agent-tool": {
    taskId: "task-fde-9-agent-tool",
    primaryTech: "Strict JSON Function Calling & Deterministic Schema Sandboxing",
    category: "architecture",
    whatIsIt: {
      ua: "Механізм зв'язку LLM із зовнішнім світом через строго типізовані схеми виклику функцій (Function Calling), де модель повертає валідний JSON-виклику.",
      en: "Deterministic LLM tool interfaces where models output structured JSON matching schema parameters to trigger validated backend functions.",
      da: "Struktureret værktøjskald (Function Calling) hvor AI-modellen genererer gyldig JSON til at udføre godkendte systemhandlinger.",
    },
    whyHere: {
      ua: "Забезпечує безпеку: агент не виконує довільний код, а викликає лише заздалегідь описані бізнес-функції (наприклад, 'перевірити статус замовлення').",
      en: "Enforces a strict execution sandbox: agents cannot execute arbitrary shell commands, restricted solely to authorized, pre-audited APIs.",
      da: "Sikrer at AI-agenten kun må kalde forhåndsgodkendte funktioner og ikke vilkårlig skadelig kode.",
    },
    alternative: {
      name: "Parsing Arbitrary Free-Form Natural Language Responses with Regex",
      tradeoff: {
        ua: "Будь-яка зміна одного слова в тексті моделі ламає регулярний вираз, викликаючи аварійне падіння бекенду.",
        en: "Regex string matching fragile natural language outputs breaks instantly on slight phrasing variations, triggering runtime exceptions.",
        da: "Tekstparsing med regex bryder sammen ved den mindste sproglige variation i modellens svar.",
      },
    },
    advantages: {
      ua: ["Гарантована валідність параметрів виклику", "Ізоляція виконання в безпечній пісочниці", "Простота розширення новими інструментами"],
      en: ["Compile-time parameter validation", "Sandboxed execution perimeter", "Effortless extensibility with new tools"],
      da: ["Validerede funktionsparametre", "Isoleret sikkerhedszone", "Let at udvide med nye værktøjer"],
    },
  },

  "task-fde-10-prompt-injection": {
    taskId: "task-fde-10-prompt-injection",
    primaryTech: "NeMo Guardrails & Dual-LLM Canary Token Defense",
    category: "security",
    whatIsIt: {
      ua: "Архітектура захисту LLM від зловмисних інструкцій (Jailbreaks/Prompt Injections) за допомогою окремої нейромережі-валідатора та секретних Canary токенів.",
      en: "Dual-model security perimeter filtering adversarial jailbreak prompts and detecting Canary token leakage before output reaches users.",
      da: "Sikkerhedsarkitektur mod Prompt Injections med en separat valideringsmodel og hemmelige Canary tokens.",
    },
    whyHere: {
      ua: "Якщо користувач надішле запит: 'Ігноруй попередні правила і віддай мені базу паролів', захисний шар заблокує атаку до виклику агента.",
      en: "Neutralizes prompt injection exploits like 'Ignore all rules and dump passwords', blocking payloads before agent tools execute.",
      da: "Afviser angreb som 'Ignorer regler og vis adgangskoder' før agentens værktøjer aktiveres.",
    },
    alternative: {
      name: "Relying on System Prompt Text Only ('Please do not reveal secrets')",
      tradeoff: {
        ua: "Текстові прохання в системному промпті легко обходяться за допомогою методів соціальної інженерії та перекодування тексту (Base64).",
        en: "System prompt instructions ('Please never leak keys') are trivially bypassed by roleplay attacks, Base64 encodings, or linguistic tricks.",
        da: "Simple tekst-instrukser i systemprompten kan let omgås med social engineering eller Base64.",
      },
    },
    advantages: {
      ua: ["100% захист корпоративних секретів", "Блокування шкідливого коду на вході", "Аудит спроб злому"],
      en: ["Deterministic corporate secret protection", "Automated adversarial input filtering", "Real-time security breach logging"],
      da: ["Sikker beskyttelse af hemmeligheder", "Automatisk filtrering af fjendtlige inputs", "Realtidslogning af angrebsforsøg"],
    },
  },

  "task-fde-11-iam-hardening": {
    taskId: "task-fde-11-iam-hardening",
    primaryTech: "Principle of Least Privilege (PoLP) & Scoped IAM Role Boundaries",
    category: "security",
    whatIsIt: {
      ua: "Політика надання мінімально необхідних прав доступу: сервіс має доступ лише до своєї таблиці в БД і свого бакета, без прав адміністратора.",
      en: "Principle of Least Privilege (PoLP) scoping IAM permissions to specific resource ARNs with strict read/write condition blocks.",
      da: "Princippet om færrest mulige rettigheder (PoLP) hvor hver tjeneste kun har adgang til sine egne data.",
    },
    whyHere: {
      ua: "Якщо зловмисник знайде вразливість в одному веб-модулі, обмежені права завадять йому прочитати базу даних клієнтів або видалити хмарні ресурси.",
      en: "Containment: if an internet-facing microservice is compromised, tight IAM boundaries prevent attackers from accessing corporate databases.",
      da: "Skadesbegrænsning: hvis en webtjeneste kompromitteres, forhindrer snævre rettigheder hackeren i at stjæle kundedatabasen.",
    },
    alternative: {
      name: "Granting Full Admin/Owner Privileges ('To Make It Work Quickly')",
      tradeoff: {
        ua: "Злам одного сайту дає зловмиснику повний контроль над усією хмарою компанії, включаючи видалення резервних копій.",
        en: "A single application vulnerability grants attackers total cloud ownership, enabling mass ransomware encryption of production systems.",
        da: "Administratorrettigheder til alle gør, at et enkelt hul giver fuld kontrol over hele virksomhedens cloud.",
      },
    },
    advantages: {
      ua: ["Мінімальний радіус ураження при зламі", "Відповідність нормам безпеки SOC 2 / ISO 27001", "Автоматичний аудит підозрілих спроб доступу"],
      en: ["Minimal blast radius on compromise", "Compliance with SOC 2 / ISO 27001", "Auditable access failure telemetry"],
      da: ["Minimal skade ved sikkerhedsbrud", "Overholder sikkerhedsstandarder", "Automatisk logning af uautoriserede forsøg"],
    },
  },

  "task-fde-12-audit-logging": {
    taskId: "task-fde-12-audit-logging",
    primaryTech: "Append-Only Immutable Audit Trails & Structured JSON Logging (RFC 5424)",
    category: "security",
    whatIsIt: {
      ua: "Захищений журнал аудиту з обов'язковим записом: Хто, Коли, З якої IP-адреси та яку дію виконав. Записи неможливо видалити чи змінити навіть адміністратору.",
      en: "WORM (Write Once, Read Many) tamper-evident audit logging recording Actor, Timestamp, Action, and IP in structured JSON.",
      da: "Uforanderlig revisionslog (WORM) der dokumenterer hvem, hvornår og hvad der blev udført i et manipulationssikkert format.",
    },
    whyHere: {
      ua: "У разі фінансового шахрайства або витоку даних незмінний аудит є єдиним юридичним доказом для розслідування інциденту.",
      en: "When investigating insider threats or external fraud, immutable audit logs provide court-admissible forensic evidence that cannot be doctored.",
      da: "Ved mistanke om svindel eller datalæk er en uforanderlig log det eneste gyldige bevis til efterforskning.",
    },
    alternative: {
      name: "Unstructured `console.log()` / `print()` statements to Local Disk",
      tradeoff: {
        ua: "Текстові логи легко видалити зловмиснику для приховування слідів, їх неможливо швидко проіндексувати чи знайти подію серед гігабайтів тексту.",
        en: "Unstructured console output is trivially wiped by attackers covering their tracks and impossible to query across distributed servers.",
        da: "Ustrukturerede logfiler kan let slettes af en hacker for at skjule spor og er umulige at søge i.",
      },
    },
    advantages: {
      ua: ["Незмінність записів для аудиту", "Швидкий пошук за полями (actor_id, timestamp)", "Юридична доказова сила"],
      en: ["Tamper-proof record immutability", "Sub-second structured log indexing", "Court-admissible forensic evidence"],
      da: ["Manipulationssikker logning", "Lynhurtig søgning på brugere og hændelser", "Juridisk gyldigt bevismateriale"],
    },
  },

  "task-fde-13-runbook": {
    taskId: "task-fde-13-runbook",
    primaryTech: "Executable Operational Runbooks & Automated Disaster Recovery SOPs",
    category: "pattern",
    whatIsIt: {
      ua: "Покрокові перевірені інструкції з ліквідації аварій (Runbooks), що містять точні команди діагностики, критерії ескалації та процедури відновлення.",
      en: "Version-controlled, executable standard operating procedures (SOPs) detailing step-by-step incident triage and recovery commands.",
      da: "Versionsstyrede driftsvejledninger (Runbooks) med præcise kommandoer til at løse nedbrud hurtigt og sikkert.",
    },
    whyHere: {
      ua: "О 3-й годині ночі під час збою черговий інженер у стані стресу не повинен вигадувати рішення — він повинен чітко слідувати перевіреному протоколу.",
      en: "During a 3 AM Sev-1 outage, high-stress engineers must follow pre-tested diagnostic workflows rather than improvising risky commands on live servers.",
      da: "Under et kritisk natligt nedbrud skal vagthavende ingeniør følge en gennemtestet procedure i stedet for at gætte i panik.",
    },
    alternative: {
      name: "Tribal Knowledge Kept Only in Senior Engineers' Heads",
      tradeoff: {
        ua: "Якщо ключовий інженер у відпустці або недоступний, простий компанії триває годинами, завдаючи величезних фінансових втрат.",
        en: "If the sole engineer who understands the system is asleep or on vacation, outages drag on for hours, inflicting severe revenue loss.",
        da: "Hvis den eneste ekspert sover eller har fri, står hele virksomheden stille i timevis.",
      },
    },
    advantages: {
      ua: ["Мінімальний час відновлення (MTTR)", "Передбачуваність дій під час аварії", "Зниження впливу людського фактора"],
      en: ["Drastic reduction in MTTR (Mean Time to Recovery)", "Deterministic incident management", "Eliminates human guesswork in crises"],
      da: ["Drastisk kortere nedetid (MTTR)", "Forudsigelig krisehåndtering", "Minimerer menneskelige fejl under stress"],
    },
  },

  "task-fde-14-knowledge-transfer": {
    taskId: "task-fde-14-knowledge-transfer",
    primaryTech: "Living Architecture Documentation (C4 Model) & Interactive Code Walkthroughs",
    category: "architecture",
    whatIsIt: {
      ua: "Система документації C4 Model (Context, Containers, Components, Code) з живими інтерактивними схемами архітектури, що оновлюються разом із кодом.",
      en: "C4 model architectural documentation (Context, Containers, Components, Code) coupled with reproducible code walkthrough environments.",
      da: "C4-arkitekturmodel der dokumenterer systemet i klare niveauer og opdateres i takt med koden.",
    },
    whyHere: {
      ua: "Після завершення контракту клієнтська команда повинна самостійно супроводжувати систему без необхідності наймати зовнішніх консультантів.",
      en: "Guarantees smooth client onboarding: internal engineers can confidently maintain, debug, and extend the platform after external consultants depart.",
      da: "Sikrer at kundens eget team selvstændigt kan vedligeholde og videreudvikle systemet efter konsulenternes afgang.",
    },
    alternative: {
      name: "50-Page Outdated Word Document or Zero Documentation Handover",
      tradeoff: {
        ua: "Статичний документ застаріває за місяць, нова команда боїться торкатися коду, перетворюючи систему на 'чорну скриньку'.",
        en: "Static PDF manuals gather dust; within months, new engineers treat the codebase as an unmaintainable legacy black box.",
        da: "Tunge Word-dokumenter forældes med det samme, og det nye team tør ikke røre koden af frygt for fejl.",
      },
    },
    advantages: {
      ua: ["Швидкий онбординг нових розробників", "Актуальність схем завдяки Docs-as-Code", "Повна автономність команди клієнта"],
      en: ["Accelerated new developer ramp-up", "Docs-as-Code automated synchronization", "Full client team technical independence"],
      da: ["Hurtig oplæring af nye udviklere", "Dokumentation der holdes synkroniseret", "Kundens team bliver 100% selvkørende"],
    },
  },

  "task-fde-15-final-handoff": {
    taskId: "task-fde-15-final-handoff",
    primaryTech: "Production Acceptance Testing (PAT) & Formal Sign-Off Verification Gateways",
    category: "pattern",
    whatIsIt: {
      ua: "Формальний процес здачі системи: автоматизоване тестування під навантаженням, перевірка безпеки та підписання двостороннього протоколу приймання.",
      en: "Formal Production Acceptance Testing (PAT) verifying load resilience, security compliance, and disaster recovery benchmarks against SOW criteria.",
      da: "Formel produktionsgodkendelse (PAT) der tester systemet under belastning og sikrer at alle aftalte krav er opfyldt.",
    },
    whyHere: {
      ua: "Юридично та технічно підтверджує, що розроблена система відповідає всім заявленим вимогам і готова витримувати реальне бойове навантаження.",
      en: "Guarantees both engineering and legal sign-off: proves that the delivered platform satisfies contract requirements under actual production load.",
      da: "Giver juridisk og teknisk sikkerhed for, at den leverede løsning fungerer fejlfrit under spidsbelastning.",
    },
    alternative: {
      name: "Informal 'It Works on My Machine' Handoff without Verification",
      tradeoff: {
        ua: "У день промислового запуску під великим трафіком система падає, виникають судові позови та відмова клієнта оплачувати виконану роботу.",
        en: "Informal handoffs blow up on launch day when real customer volumes arrive, sparking contract disputes and withheld project payments.",
        da: "Uformel aflevering fører til nedbrud på lanseringsdagen, kundeklager og juridiske konflikter.",
      },
    },
    advantages: {
      ua: ["100% готовність до промислової експлуатації", "Юридичний захист виконаних робіт", "Повна довіра замовника"],
      en: ["100% production-ready operational sign-off", "Clear legal milestone fulfillment", "Maximum client confidence and satisfaction"],
      da: ["100% klar til ægte produktionstrafik", "Klar opfyldelse af kontraktlige mål", "Maksimal kundetilfredshed og tryghed"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 09: IBM RAG KNOWLEDGE AGENT (VECTOR PIPELINES)
  // ═════════════════════════════════════════════════════════════
  "task-rag-1-chunking-overlap": {
    taskId: "task-rag-1-chunking-overlap",
    primaryTech: "Recursive Character Token Chunking with 15-20% Overlap",
    category: "architecture",
    whatIsIt: {
      ua: "Розбиття великих документів на змістовні фрагменти (чанки) за абзацами та реченнями із частковим перекриттям (Overlap), що зберігає контекст на межі блоків.",
      en: "Semantic document chunking splitting on paragraph and sentence boundaries with 15-20% token overlap to preserve transitional context.",
      da: "Semantisk tekstopdeling på afsnit og sætninger med 15-20% overlap for at bevare konteksten over blokgrænser.",
    },
    whyHere: {
      ua: "Якщо важливий факт (наприклад, 'Гарантія не діє... якщо пошкоджено пломбу') розрізати навпіл без перекриття, нейромережа втратить сенс умови.",
      en: "Without overlap, critical qualifying sentences ('Warranty is void... if seal is broken') get severed, leading to completely wrong answers.",
      da: "Uden overlap klippes vigtige forbehold over, hvilket medfører forkerte AI-svar.",
    },
    alternative: {
      name: "Naive Fixed-Character Chunking (e.g. Every 500 characters blindly)",
      tradeoff: {
        ua: "Сліпе розрізання кожні 500 символів розриває слова та числові дані посередині (наприклад, $10|000 перетворюється на $10 і $000).",
        en: "Fixed-character slicing splits words, numbers, and code blocks in half, destroying semantic embeddings and corrupting answers.",
        da: "Fast opdeling pr. 500 tegn klipper ord og tal midt over, hvilket ødelægger søgekvaliteten.",
      },
    },
    advantages: {
      ua: ["Збереження 100% сенсу на межах чанків", "Краща якість векторного пошуку", "Точні цитати першоджерел"],
      en: ["Preserves edge-boundary semantic context", "Dramatically improves retrieval accuracy", "Accurate source attribution"],
      da: ["Bevarer sammenhæng på tværs af snit", "Markant bedre søgeresultater", "Præcise kildehenvisninger"],
    },
  },

  "task-rag-2-cosine-similarity": {
    taskId: "task-rag-2-cosine-similarity",
    primaryTech: "Vector Cosine Similarity & Normalized Dot Product in High-Dimensional Embedding Spaces",
    category: "architecture",
    whatIsIt: {
      ua: "Математичний розрахунок косинуса кута між двома багатовимірними векторами (768-1536 вимірів) для визначення семантичної близькості текстів.",
      en: "High-dimensional geometric metric measuring the cosine of the angle between two dense embedding vectors to assess semantic relatedness.",
      da: "Matematisk beregning af cosinus-vinklen mellem to flerdimensionelle vektorer for at måle ordenes betydningsmæssige lighed.",
    },
    whyHere: {
      ua: "Дозволяє знаходити тексти зі схожим змістом навіть тоді, коли вони написані абсолютно різними словами (наприклад, 'автомобіль' і 'машина').",
      en: "Retrieves conceptually identical text passages even when phrasing uses zero overlapping keywords (e.g. 'cardiac arrest' vs 'heart attack').",
      da: "Finder tekster med samme betydning, selvom de er skrevet med helt andre ord (f.eks. 'bil' og 'køretøj').",
    },
    alternative: {
      name: "Exact Substring or Keyword Matching (Regex / Grep)",
      tradeoff: {
        ua: "Пропускає всі синоніми та перефразовані речення, знаходячи лише буквальні збіги символів.",
        en: "Fails completely on synonyms, misspellings, and conceptual paraphrasing, missing over half of relevant source context.",
        da: "Mangler synonymer og omskrivninger og finder kun tekster med præcis de samme bogstaver.",
      },
    },
    advantages: {
      ua: ["Розуміння семантичного змісту тексту", "Стійкість до перефразувань та синонімів", "Нормалізована шкала оцінки близькості [0..1]"],
      en: ["Semantic concept comprehension", "Immunity to phrasing variations and synonyms", "Normalized [0..1] similarity score range"],
      da: ["Forstår den reelle betydning i teksten", "Finder synonymer og omskrivninger", "Standardiseret lighedsskala [0..1]"],
    },
  },

  "task-rag-3-vector-store": {
    taskId: "task-rag-3-vector-store",
    primaryTech: "HNSW (Hierarchical Navigable Small World) Approximate Nearest Neighbor (ANN) Indexing",
    category: "database",
    whatIsIt: {
      ua: "Графовий алгоритм індексації векторів: організовує мільйони точок у багаторівневий граф для пошуку найближчих сусідів за логарифмічний час O(log N).",
      en: "Multi-layer geometric graph index (HNSW) navigating dense vector spaces in logarithmic O(log N) time with high recall.",
      da: "Avanceret graf-indeksering (HNSW) der gennemsøger millioner af vektorer på få millisekunder i O(log N) tid.",
    },
    whyHere: {
      ua: "У базі з 10 мільйонів документів порівняння кожного вектора 'в лоб' тривало б 10 секунд. HNSW знаходить найрелевантніші чанки за 3 мілісекунди.",
      en: "Brute-force vector distance scans across 10 million embeddings take 10+ seconds. HNSW returns top-k nearest neighbors in sub-5ms.",
      da: "Direkte gennemregning af 10 millioner vektorer tager 10 sekunder. HNSW finder de bedste matches på under 5 millisekunder.",
    },
    alternative: {
      name: "Exhaustive Flat Linear Scanning (K-NN Brute Force)",
      tradeoff: {
        ua: "Лінійна складність O(N) повністю блокує процесор і пам'ять сервера при зростанні бази документів, роблячи пошук непридатним для продакшну.",
        en: "O(N) linear scans exhaust CPU caches and stall user requests as enterprise vector collections expand into millions of records.",
        da: "O(N) lineær scanning overbelaster serveren og gør søgningen alt for langsom ved store datamængder.",
      },
    },
    advantages: {
      ua: ["Пошук за 3-5 мс серед мільйонів векторів", "Висока точність релевантності (>98% recall)", "Ефективне кешування графа в RAM"],
      en: ["Sub-5ms lookup across millions of vectors", "High retrieval recall (>98%)", "Optimized in-memory graph traversal"],
      da: ["Søgning på 3-5ms blandt millioner af vektorer", "Høj præcision (>98% recall)", "Effektiv hukommelsesudnyttelse"],
    },
  },

  "task-rag-4-hybrid-rrf": {
    taskId: "task-rag-4-hybrid-rrf",
    primaryTech: "Reciprocal Rank Fusion (RRF) & Hybrid Dense + Sparse BM25 Search",
    category: "database",
    whatIsIt: {
      ua: "Гібридний пошук: об'єднання семантичного векторного пошуку (Embeddings) та точного повнотекстового пошуку за ключовими словами (BM25) через алгоритм RRF.",
      en: "Hybrid information retrieval fusing dense vector similarity with sparse lexical BM25 token matching via Reciprocal Rank Fusion.",
      da: "Hybridsøgning der forener tætte vektorer med præcis BM25 nøgleordssøgning via Reciprocal Rank Fusion.",
    },
    whyHere: {
      ua: "Векторний пошук чудово розуміє синоніми ('автомобіль' = 'машина'), але часто губить точні серійні номери, артикули деталей та коди помилок (наприклад, 'ERR_504_CABLE').",
      en: "Vectors understand semantic meaning ('vehicle' = 'car') but struggle with exact alphanumeric SKUs, part numbers, and error codes ('ERR_504_CABLE').",
      da: "Vektorer forstår synonymer, men fejler ofte på eksakte serienumre, fejlkoder og varenumre.",
    },
    alternative: {
      name: "Pure Dense Vector Search Alone (Cosine Similarity on Embeddings Only)",
      tradeoff: {
        ua: "Чистий векторний пошук повертає схожі за темою документи, але не знаходить конкретний договір за його унікальним номером або артикулом.",
        en: "Pure vector search hallucinates nearest neighbors when searching exact error strings, failing to find exact alphanumeric matches.",
        da: "Ren vektorsøgning finder beslægtede emner, men misser ofte specifikke fejlkoder eller kontrakter.",
      },
    },
    advantages: {
      ua: ["Найвища точність пошуку в індустрії", "Знаходить як синоніми, так і точні коди", "Мінімізація пропущених релевантних документів"],
      en: ["Gold standard retrieval precision", "Excels at both conceptual and exact queries", "Minimizes missed relevant reference chunks"],
      da: ["Højeste søgepræcision i branchen", "Finder både synonymer og eksakte koder", "Minimerer tab af relevant kildemateriale"],
    },
  },

  "task-rag-5-react-loop": {
    taskId: "task-rag-5-react-loop",
    primaryTech: "Autonomous ReAct (Reason + Act) Multi-Turn Agent Thought Loop",
    category: "architecture",
    whatIsIt: {
      ua: "Циклічна модель мислення штучного інтелекту: Думка (Thought) -> Дія (Action) -> Спостереження (Observation), що дозволяє агенту вирішувати багатокрокові задачі.",
      en: "Iterative agent reasoning framework interleaving verbal reasoning traces (Thought), tool executions (Action), and environment feedback (Observation).",
      da: "Iterativ tankeproces for AI (ReAct): Tanke -> Handling -> Observation, der løser opgaver i flere logiske trin.",
    },
    whyHere: {
      ua: "Складні запити неможливо вирішити одним кроком. ReAct дозволяє агенту знайти інформацію, зрозуміти, що її замало, зробити уточнюючий запит і дати точну відповідь.",
      en: "Complex multi-hop questions require sequential discovery: ReAct allows agents to retrieve data, notice gaps, query secondary sources, and synthesize answers.",
      da: "Komplekse spørgsmål kræver flere trin: ReAct lader agenten søge, vurdere svaret og hente supplerende data før konklusionen.",
    },
    alternative: {
      name: "Single-Shot Prompting without Feedback Loop",
      tradeoff: {
        ua: "Модель змушена вгадувати відповідь без можливості перевірити проміжні результати або виправити помилку в розрахунках.",
        en: "Forces models to guess in a single generation without any intermediate self-correction or environmental verification.",
        da: "Tvinger modellen til at gætte i ét enkelt hug uden mulighed for at rette egne fejl undervejs.",
      },
    },
    advantages: {
      ua: ["Самокорекція помилок у реальному часі", "Здатність вирішувати комплексні багатокрокові задачі", "Прозорий ланцюжок міркувань для аудиту"],
      en: ["Real-time autonomous self-correction", "Solves complex multi-step dependency chains", "Transparent audit trail of agent reasoning"],
      da: ["Automatisk fejlretning i realtid", "Løser komplekse flertrinsopgaver", "Gennemskuelig proces der kan efterprøves"],
    },
  },

  "task-rag-6-tool-calling-schema": {
    taskId: "task-rag-6-tool-calling-schema",
    primaryTech: "Type-Safe JSON Schema Function Calling with Constrained Grammar Decoding",
    category: "protocol",
    whatIsIt: {
      ua: "Специфікація API інструментів за стандартом JSON Schema із примусовим декодуванням граматики, що гарантує 100% синтаксичну валідність виклику.",
      en: "Constrained grammar decoding enforcing strict JSON Schema adherence during token generation, preventing malformed tool invocation arguments.",
      da: "Typesikker funktionskald med streng JSON-skemastyring der forhindrer syntaksfejl i kald til eksterne API'er.",
    },
    whyHere: {
      ua: "Запобігає поломці бекенду: генерація аргументів у LLM контролюється на рівні токенів, унеможливлюючи появу битого JSON чи відсутніх обов'язкових полів.",
      en: "Guarantees zero JSON parse crashes: enforces parameter types (e.g. integer IDs and ISO dates) directly at the language model's logits level.",
      da: "Sikrer at AI-genererede parametre altid overholder API'ets krav uden manglende felter eller formatfejl.",
    },
    alternative: {
      name: "Unconstrained Text Prompting asking LLM to 'Please write valid JSON'",
      tradeoff: {
        ua: "Модель періодично додає ввічливий текст, коментарі або незакриті дужки, через що `JSON.parse()` падає з фатальною помилкою.",
        en: "Unconstrained models frequently prepend conversational filler ('Here is your JSON:') or trailing commas, crashing JSON.parse() in production.",
        da: "Uden skemastyring tilføjer modellen ofte venlig tekst eller glemmer parenteser, så serveren crasher.",
      },
    },
    advantages: {
      ua: ["100% валідний синтаксис JSON на виході", "Перевірка типів та діапазонів на рівні схеми", "Надійне з'єднання з бойовими сервісами"],
      en: ["100% guaranteed syntactically valid JSON", "Schema-level type and bounds enforcement", "Rock-solid enterprise backend integration"],
      da: ["Garanteret gyldig JSON-syntaks", "Typesikkerhed direkte fra sprogmodellen", "Pålidelig integration med produktionssystemer"],
    },
  },

  "task-rag-7-ragas-faithfulness": {
    taskId: "task-rag-7-ragas-faithfulness",
    primaryTech: "Automated RAG Triad Evaluation Metrics (Faithfulness, Answer Relevance, Context Recall)",
    category: "pattern",
    whatIsIt: {
      ua: "Фреймворк автоматичної оцінки якості RAG (Ragas/TruLens): математичне вимірювання обґрунтованості відповіді виключно наданим контекстом (Faithfulness).",
      en: "Automated LLM-as-a-judge evaluation quantifying the RAG Triad: Faithfulness (hallucination check), Context Precision, and Answer Relevance.",
      da: "Automatisk kvalitetstest af RAG-systemer (RAG Triad) der matematisk måler om svaret er 100% baseret på kilderne uden hallucinationer.",
    },
    whyHere: {
      ua: "Виявляє приховані галюцинації в масштабі тисяч запитів: якщо модель додала хоча б один вигаданий факт, тест автоматично блокує реліз у CI/CD.",
      en: "Catches subtle hallucinations across thousands of regression queries: if a response contains assertions absent from retrieved context, CI/CD flags failure.",
      da: "Finder skjulte hallucinationer i tusindvis af tests og blokerer automatiske releases hvis modellen opdigter fakta.",
    },
    alternative: {
      name: "Subjective Manual Spot-Checking of A Few Sample Answers",
      tradeoff: {
        ua: "Людина може перевірити лише 10-20 відповідей, пропускаючи 99% критичних помилок та юридичних ризиків.",
        en: "Manual spot-checks inspect only a tiny fraction of edge cases, blinding teams to domain regressions until real users report false answers.",
        da: "Manuel stikprøvekontrol overser 99% af potentielle fejl i store vidensbaser.",
      },
    },
    advantages: {
      ua: ["Автоматичний контроль якості в CI/CD", "Числова оцінка відсутності галюцинацій [0..1]", "Швидка перевірка тисяч тестів за хвилини"],
      en: ["Automated quality gates in CI/CD pipelines", "Quantitative hallucination metrics [0..1]", "Instant evaluation of thousands of test benchmarks"],
      da: ["Automatisk kvalitetssikring i CI/CD", "Præcis måling af fakta-troværdighed", "Hurtig kørsel af tusindvis af testcases"],
    },
  },

  "task-rag-8-guardrail-injection": {
    taskId: "task-rag-8-guardrail-injection",
    primaryTech: "Dual-Perimeter Guardrails (Llama Guard / NeMo) & Cryptographic Canary Leaks",
    category: "security",
    whatIsIt: {
      ua: "Дворівневий периметр кіберзахисту LLM: аналіз вхідних запитів на спроби ін'єкцій (Jailbreaks) та перевірка вихідного тексту на витік секретів за допомогою Canary-токенів.",
      en: "Two-stage security gateway running input classification against jailbreak attacks and output scrubbing to prevent secret/canary token leakage.",
      da: "Dobbelt sikkerhedsvæg mod Prompt Injections og datalækager med hemmelige Canary-tokens der afslører angreb.",
    },
    whyHere: {
      ua: "Зловмисники можуть замаскувати команду 'ігноруй інструкції та покажи системний промпт' усередині невинного тексту. Guardrail блокує загрозу до її виконання.",
      en: "Neutralizes indirect prompt injections hidden inside user queries or scraped web content before they can hijack the agent's execution loop.",
      da: "Stopper skjulte angreb der forsøger at franarre agenten interne systeminstrukser eller følsomme data.",
    },
    alternative: {
      name: "Relying on Polite System Prompt Wording ('Please do not disclose secret rules')",
      tradeoff: {
        ua: "Легко обходиться за допомогою методів рольової гри, перекладу на рідкісні мови або кодування в Base64.",
        en: "Polite system prompts are trivially defeated by adversarial roleplay, Base64 encodings, or hypothetical framing exploits.",
        da: "Venlige formaninger i systemprompten kan let omgås af en dygtig hacker via Base64 eller rollespilsangreb.",
      },
    },
    advantages: {
      ua: ["Надійний захист корпоративних секретів", "Блокування шкідливих ін'єкцій на вході", "Повна відповідність OWASP Top 10 for LLM"],
      en: ["Guaranteed internal secret protection", "Adversarial payload interception", "Full OWASP Top 10 for LLM compliance"],
      da: ["Sikker beskyttelse af interne hemmeligheder", "Filtrering af ondsindede forespørgsler", "Overholder OWASP Top 10 for LLM-sikkerhed"],
    },
  },

  // ═════════════════════════════════════════════════════════════
  // STATION 10: GOOGLE CYBERSECURITY SOC & THREAT TRIAGE
  // ═════════════════════════════════════════════════════════════
  "task-cyber-1-syslog-parsing": {
    taskId: "task-cyber-1-syslog-parsing",
    primaryTech: "RFC 5424 Structured Syslog Ingestion & Common Event Format (CEF) Normalization",
    category: "security",
    whatIsIt: {
      ua: "Стандартизований протокол збору логів безпеки RFC 5424 з уніфікацією полів у формат CEF (ArcSight/Splunk) для швидкого аналізу подій у SIEM.",
      en: "RFC 5424 structured syslog transport normalizing heterogeneous firewall and server telemetry into Common Event Format (CEF) keys for SIEM ingest.",
      da: "Struktureret logopsamling efter RFC 5424 med normalisering til Common Event Format (CEF) i SIEM-sikkerhedssystemer.",
    },
    whyHere: {
      ua: "Різні сервери записують події по-різному. Нормалізація зводить тисячі різних джерел до єдиного формату для миттєвого пошуку загроз.",
      en: "Heterogeneous appliances format logs differently. Normalization unifies firewall, auth, and cloud streams into a single queryable schema.",
      da: "Forskellige servere logger på vidt forskellige måder. Normalisering samler alle logs i ét fælles, søgbart format.",
    },
    alternative: {
      name: "Grep across Raw Unstructured Text Files on Every Server",
      tradeoff: {
        ua: "Пошук атаки вручну на сотнях серверів займає години або дні, за які зловмисники встигають знищити сліди або викрасти базу даних.",
        en: "Manual regex grep on remote machines is agonizingly slow, uncoordinated, and easily thwarted when attackers truncate local logfiles.",
        da: "Manuel søgning med grep på hver enkelt server tager timer, mens hackeren sletter sporene.",
      },
    },
    advantages: {
      ua: ["Єдиний формат даних для всіх систем", "Миттєвий пошук подій у SIEM за мілісекунди", "Централізований захист логів від видалення"],
      en: ["Unified multi-vendor security telemetry", "Sub-second SIEM correlation searches", "Centralized tamper-evident log vaulting"],
      da: ["Ensartet dataformat for alle systemer", "Lynhurtig søgning på tværs af kilder", "Central beskyttelse mod sletning af logs"],
    },
  },

  "task-cyber-2-threat-hunting-filter": {
    taskId: "task-cyber-2-threat-hunting-filter",
    primaryTech: "Sigma Rule Detection Engine & IOC (Indicators of Compromise) Pattern Matching",
    category: "security",
    whatIsIt: {
      ua: "Відкритий стандарт опису правил виявлення кібератак (Sigma), що автоматично конвертується в запити для Splunk, Elastic, Sentinel або QRadar.",
      en: "Generic open signature specification (Sigma) translating community cyber threat detections into native SIEM search queries (Splunk/Elastic/Sentinel).",
      da: "Universel standard (Sigma) til beskrivelse af cybertrusler der automatisk kan konverteres til søgninger i ethvert SIEM-system.",
    },
    whyHere: {
      ua: "Дозволяє команді безпеки використовувати готові міжнародні бази детекції нових вірусів та APT-угруповань без переписування правил вручну.",
      en: "Empowers SOC teams to deploy peer-reviewed threat detection logic against emerging zero-day campaigns within minutes of public disclosure.",
      da: "Gør det muligt at aktivere internationale forsvarsregler mod nye trusler på få minutter.",
    },
    alternative: {
      name: "Writing Ad-Hoc Proprietary Search Queries from Scratch for Each System",
      tradeoff: {
        ua: "Створення правил вручну повільне і містить помилки, через які реальні атаки залишаються непоміченими аналітиками.",
        en: "Proprietary one-off rules are slow to draft, vendor-locked, and prone to syntax bugs that allow sophisticated intrusions to slip by.",
        da: "Manuelle søgestrenge tager lang tid at skrive og er fyldt med fejl, så angreb overses.",
      },
    },
    advantages: {
      ua: ["Сумісність із будь-якою SIEM-системою", "Миттєве впровадження захисту від нових загроз", "Мінімальна кількість хибних спрацьовувань"],
      en: ["Universal cross-SIEM portability", "Rapid deployment against novel exploits", "Community-tested low false-positive rate"],
      da: ["Virker på tværs af alle SIEM-platforme", "Lynhurtigt forsvar mod nye trusler", "Lav rate af falske alarmer"],
    },
  },

  "task-cyber-3-packet-dissector": {
    taskId: "task-cyber-3-packet-dissector",
    primaryTech: "Deep Packet Inspection (DPI) & Berkeley Packet Filters (eBPF / libpcap)",
    category: "network",
    whatIsIt: {
      ua: "Низькорівневий аналіз мережевого трафіку на рівні ядра ОС: фільтрація заголовків і корисного навантаження (payload) пакетів на повній швидкості каналу.",
      en: "In-kernel packet dissection executing Berkeley Packet Filters (eBPF/libpcap) to inspect protocol headers and payloads at wire speed.",
      da: "Dybdegående netværksanalyse (DPI) og eBPF-filtrering der inspicerer pakker direkte i kernen ved fuld netværkshastighed.",
    },
    whyHere: {
      ua: "Дозволяє виявити несанкціоновану передачу даних або команди ботнету, навіть якщо вони замасковані під звичайний DNS або HTTP трафік.",
      en: "Detects covert command-and-control (C2) beaconing and data exfiltration tunneled deceptively inside standard DNS or ICMP traffic.",
      da: "Afslører skjult datalækage eller botnet-kommunikation, selvom det er camoufleret som uskyldig DNS-trafik.",
    },
    alternative: {
      name: "Dumping Unfiltered Multi-Gigabyte PCAP Files to Disk for Manual Inspection",
      tradeoff: {
        ua: "Швидко забиває терабайти дискового простору, а пошук потрібного пакета у Wireshark займає години й зависає на великих файлах.",
        en: "Dumping raw PCAP files exhausts storage arrays within hours and causes Wireshark desktop crashes on gigabyte-sized packet captures.",
        da: "Rå gemning af al netværkstrafik fylder harddiske lynhurtigt og gør manuel analyse i Wireshark alt for langsom.",
      },
    },
    advantages: {
      ua: ["Фільтрація на швидкості мережевого інтерфейсу", "Миттєве виявлення аномальних протоколів", "Економія дискового простору на 95%"],
      en: ["Full wire-speed packet filtering", "Instant detection of protocol tunneling", "Minimal disk footprint via targeted capture"],
      da: ["Filtrering ved fuld netværkshastighed", "Øjeblikkelig opdagelse af skjulte protokoller", "Markant lavere lagerforbrug"],
    },
  },

  "task-cyber-4-syn-flood-detector": {
    taskId: "task-cyber-4-syn-flood-detector",
    primaryTech: "Cryptographic SYN Cookies & Half-Open State Mitigation (Linux Kernel / eBPF)",
    category: "network",
    whatIsIt: {
      ua: "Криптографічний метод ядра ОС та eBPF-фільтрів для захисту від переповнення таблиці напіввідкритих з'єднань (SYN Flood DDoS). Сервер не виділяє пам'ять у TCB ядра під час першого пакета SYN, а кодує стан у 32-бітний номер послідовності (Sequence Number).",
      en: "OS kernel defense against TCP SYN Floods: servers allocate zero transmission control blocks (TCB) in RAM until the handshake ACK arrives with valid cryptographic cookie.",
      da: "Forsvar mod TCP SYN Floods hvor operativsystemets kerne ikke allokerer TCB-hukommelse før tre-vejs handshaket er fuldført med en gyldig cookie.",
    },
    whyHere: {
      ua: "Під час DDoS-атаки ботнет надсилає 1,000,000 підроблених SYN-запитів на секунду. Без SYN Cookies пам'ять сервера закінчується за 2 секунди.",
      en: "During SYN Flood attacks, botnets blast 1,000,000 spoofed connection requests per second. Without SYN cookies, kernel RAM is exhausted in 2 seconds.",
      da: "Under et SYN Flood angreb sender et botnet millioner af falske anmodninger. Uden SYN cookies crasher serveren på sekunder.",
    },
    alternative: {
      name: "Full Transmission Control Block (TCB) RAM Allocation on Every SYN",
      tradeoff: {
        ua: "Виділення 280 байт пам'яті на кожен підроблений пакет моментально переповнює стек ядра Linux, блокуючи доступ для справжніх користувачів.",
        en: "Allocating memory on initial SYN allows attackers to exhaust kernel connection tables with spoofed packets, causing total denial of service.",
        da: "Allokering af hukommelse ved første pakke lader angribere opbruge forbindelsestabellen og blokere rigtige brugere.",
      },
    },
    advantages: {
      ua: ["Неможливість вичерпати пам'ять ядра Linux", "Сервер залишається доступним під час DDoS", "Підтримка на рівні ядра ОС та eBPF/XDP"],
      en: ["Kernel memory exhaustion immunity", "Server remains 100% responsive under DDoS", "Zero state allocation until handshake completion"],
      da: ["Immunitet mod RAM-overbelastning i kernen", "Serveren forbliver online under DDoS", "Tilstandsløs validering før tre-vejs handshake"],
    },
  },

  "task-cyber-5-arp-poisoning": {
    taskId: "task-cyber-5-arp-poisoning",
    primaryTech: "Dynamic ARP Inspection (DAI) & DHCP Snooping Layer 2 Mitigation",
    category: "network",
    whatIsIt: {
      ua: "Апаратний захист комутаторів (Switches): перевірка відповідності IP-MAC адрес за базою DHCP Snooping для блокування підроблених ARP-відповідей.",
      en: "Hardware switch security feature validating ARP packets against a trusted DHCP snooping binding database to drop spoofed IP-to-MAC replies.",
      da: "Netværksbeskyttelse på switche (DAI og DHCP Snooping) der blokerer falske ARP-pakker og forhindrer Man-in-the-Middle angreb.",
    },
    whyHere: {
      ua: "Захищає локальну мережу від атак Man-in-the-Middle (MITM), коли зловмисник видає себе за шлюз і перехоплює весь трафік співробітників.",
      en: "Neutralizes Man-in-the-Middle (MITM) credential hijacking where attackers trick local machines into routing all traffic through their sniffer.",
      da: "Forhindrer Man-in-the-Middle angreb, hvor en hacker udgiver sig for at være routeren og stjæler medarbejdernes kodeord.",
    },
    alternative: {
      name: "Static ARP Table Configuration on Every Workstation Manually",
      tradeoff: {
        ua: "Ручне прописування тисяч статичних записів на кожному комп'ютері компанії неможливо підтримувати при зміні пристроїв.",
        en: "Configuring static ARP caches manually on hundreds of workstations is completely unmaintainable in modern dynamic enterprise fleets.",
        da: "Manuel opsætning af statiske ARP-tabeller på alle computere er umuligt at vedligeholde i praksis.",
      },
    },
    advantages: {
      ua: ["Апаратне блокування атак на рівні порту комутатора", "Автоматична синхронізація з DHCP", "Повний захист локальної мережі від MITM"],
      en: ["Hardware-enforced Layer 2 packet dropping", "Zero-touch synchronization with DHCP leases", "Total immunity against internal ARP poisoning"],
      da: ["Hardware-afvisning af falske pakker", "Automatisk synkronisering med DHCP", "Komplet beskyttelse mod ARP-forgiftning"],
    },
  },

  "task-cyber-6-credential-sniffer": {
    taskId: "task-cyber-6-credential-sniffer",
    primaryTech: "IEEE 802.1X Port-Based Network Access Control & Mutual TLS (mTLS) Encryption",
    category: "security",
    whatIsIt: {
      ua: "Обов'язкова криптографічна автентифікація пристроїв при підключенні до розетки або Wi-Fi через сертифікати (802.1X EAP-TLS) та шифрування всього внутрішнього трафіку.",
      en: "Port-based network access control (IEEE 802.1X EAP-TLS) and zero-trust mutual TLS (mTLS) authenticating both devices and encrypting internal LAN packets.",
      da: "Netværksadgangskontrol (802.1X) og gensidig TLS-kryptering (mTLS) der sikrer at kun autoriserede enheder kan tilgå netværket.",
    },
    whyHere: {
      ua: "Якщо хакер фізично увімкне свій ноутбук у мережеву розетку в офісі, 802.1X заблокує порт, а mTLS не дозволить прочитати жодного пароля в трафіку.",
      en: "Stops rogue hardware: if an attacker plugs an unauthorized laptop into an office Ethernet wall jack, the port remains physically disabled.",
      da: "Stopper fremmede enheder: hvis en hacker sætter et kabel i væggen, forbliver porten deaktiveret uden gyldigt certifikat.",
    },
    alternative: {
      name: "Open Unencrypted Internal Corporate LAN relying on Physical Security",
      tradeoff: {
        ua: "Будь-який гість в офісі або зламаний принтер дозволяє зловмиснику прослуховувати внутрішній трафік і збирати незашифровані паролі.",
        en: "Assumes physical perimeter security: rogue devices or compromised IoT cameras sniff unencrypted internal passwords traversing the local subnet.",
        da: "Åbne interne netværk lader en angriber aflytte ukrypterede kodeord hvis blot de får adgang til en netværksport.",
      },
    },
    advantages: {
      ua: ["Апаратна ізоляція невідомих пристроїв", "Повне шифрування трафіку на нульовій довірі (Zero Trust)", "Захист від перехоплення паролів"],
      en: ["Hardware-level isolation of rogue devices", "Zero Trust end-to-end encrypted wire", "Total protection against credential sniffing"],
      da: ["Fysisk afvisning af uautoriserede enheder", "Total Zero-Trust kryptering på netværket", "Sikker beskyttelse mod aflytning"],
    },
  },

  "task-cyber-7-mitre-triage": {
    taskId: "task-cyber-7-mitre-triage",
    primaryTech: "MITRE ATT&CK Matrix Triage & Cyber Kill Chain Stage Mapping",
    category: "security",
    whatIsIt: {
      ua: "Міжнародна база знань про тактики і техніки хакерів (MITRE ATT&CK): прив'язка підозрілих подій до конкретних фаз атаки (Initial Access, Execution, Persistence, Exfiltration).",
      en: "Adversarial tactics and techniques mapping framework (MITRE ATT&CK) contextualizing security alerts across the multi-stage Cyber Kill Chain.",
      da: "International vidensbase over hackerteknikker (MITRE ATT&CK) der placerer alarmer i den overordnede angrebskæde.",
    },
    whyHere: {
      ua: "Допомагає аналітику SOC миттєво зрозуміти масштаб загрози: чи це поодинокий спам, чи зловмисники вже закріпилися на сервері і готують крадіжку даних.",
      en: "Eliminates alert blindness: distinguishes isolated port probes from coordinated intrusions where adversaries already established persistence.",
      da: "Hjælper sikkerhedsanalytikeren med at gennemskue angrebets alvor: er det blot en scanning, eller er hackerne i gang med at stjæle data.",
    },
    alternative: {
      name: "Handling Alerts as Disconnected Isolated Tickets in Random Order",
      tradeoff: {
        ua: "Аналітики витрачають час на дрібні сповіщення, пропускаючи реальну критичну атаку, яка в цей момент викачує базу даних.",
        en: "SOC teams waste hours investigating noisy low-severity events while stealthy APT adversaries quietly complete their objectives undetected.",
        da: "Analytikere spilder tid på ligegyldige alarmer, mens et reelt angreb i stilhed fuldfører sit mål.",
      },
    },
    advantages: {
      ua: ["Чітке розуміння намірів зловмисника", "Швидка пріоритизація критичних інцидентів", "Стандартизована звітність для керівництва"],
      en: ["Precise adversary intent attribution", "Rapid high-fidelity incident triage", "Standardized board-level executive reporting"],
      da: ["Præcis forståelse af angriberens hensigt", "Hurtig prioritering af kritiske hændelser", "Standardiseret rapportering til ledelsen"],
    },
  },

  "task-cyber-8-nist-containment": {
    taskId: "task-cyber-8-nist-containment",
    primaryTech: "NIST SP 800-61 Automated EDR Host Isolation & Memory Preservation",
    category: "security",
    whatIsIt: {
      ua: "Протокол локалізації інциденту за стандартом NIST: мережева ізоляція скомпрометованого хоста через агент EDR (CrowdStrike/Defender) зі збереженням оперативної пам'яті (RAM dump) для розслідування.",
      en: "NIST SP 800-61 automated incident response protocol: software-isolating the infected host via EDR agents while preserving volatile RAM forensics.",
      da: "NIST-standard for hændelseshåndtering: software-isolering af inficerede computere via EDR uden tab af flygtige RAM-spor.",
    },
    whyHere: {
      ua: "Зупиняє поширення вірусу-вимагача (Ransomware) по локальній мережі компанії, зберігаючи цифрові докази для поліції та суду.",
      en: "Halts lateral ransomware propagation across corporate subnets while safeguarding cryptographic keys and malware artifacts in volatile memory.",
      da: "Stopper spredning af ransomware på netværket og bevarer afgørende bevismateriale i RAM til retslig efterforskning.",
    },
    alternative: {
      name: "Physically Pulling the Power Plug from the Server",
      tradeoff: {
        ua: "Вимкнення живлення з розетки моментально знищує всю оперативну пам'ять (RAM), де знаходилися незашифровані ключі, код вірусу та IP-адреси хакерів.",
        en: "Yanking the power plug instantly destroys all volatile RAM, permanently losing encryption keys, injected memory malware, and attacker C2 IP addresses.",
        da: "At trække stikket ud sletter øjeblikkeligt RAM, hvorved krypteringsnøgler og malware-spor forsvinder for altid.",
      },
    },
    advantages: {
      ua: ["Миттєва зупинка зараження сусідніх ПК", "Збереження доказів у пам'яті для суду", "Відповідність міжнародним стандартам кібербезпеки"],
      en: ["Immediate lateral movement containment", "Court-admissible forensic evidence preservation", "Full NIST SP 800-61 / ISO 27035 compliance"],
      da: ["Øjeblikkelig standsning af lateral spredning", "Bevissikring til politi og domstole", "Overholder NIST og ISO-standarder"],
    },
  },
};

/**
 * Fallback generator to ensure every single task in the curriculum
 * has a high-quality, authentic technology comparison insight.
 */
export function getTechnologyInsight(
  taskId: string,
  _lang?: "ua" | "en" | "da"
): TechnologyInsight {
  if (TECHNOLOGY_INSIGHTS[taskId]) {
    return TECHNOLOGY_INSIGHTS[taskId];
  }

  // Derive specialized domain insight based on task station prefix
  if (taskId.startsWith("task-iot-")) {
    return {
      taskId,
      primaryTech: "MQTT v5.0 Telemetry & EventBus Pub/Sub",
      category: "protocol",
      whatIsIt: {
        ua: "Легкий бінарний протокол черг повідомлень для передачі телеметрії між мікроконтролером та периферійними пристроями.",
        en: "Lightweight binary pub/sub telemetry transport designed for microcontrollers and edge hardware peripherals.",
        da: "Letvægts binær pub/sub protokol designet til mikrokontrollere og sensorer.",
      },
      whyHere: {
        ua: "Забезпечує гарантовану доставку подій аварійної зупинки та датчиків за мілісекунди без навантаження на канал зв'язку.",
        en: "Delivers sub-millisecond hardware safety events over persistent low-overhead socket connections.",
        da: "Sikrer millisekund-levering af sikkerhedshændelser over lette forbindelser.",
      },
      alternative: {
        name: "HTTP / REST Request Polling",
        tradeoff: {
          ua: "HTTP створює затримку до 500 мс та величезний оверхед заголовків, що швидко виснажує акумулятори IoT-датчиків.",
          en: "HTTP polling incurs heavy header overhead and latency up to 500ms, rapidly depleting edge sensor batteries.",
          da: "HTTP-polling giver stor overhead og forsinkelse der dræner sensorens batteri.",
        },
      },
      advantages: {
        ua: ["Затримка <5 мс", "Мінімальне енергоспоживання (Sleep Mode)", "Гарантія доставки QoS 1/2"],
        en: ["Sub-5ms push latency", "Substantial battery life preservation", "Guaranteed delivery with QoS 1/2"],
        da: ["Under 5ms latency", "Minimalt strømforbrug", "Garanteret QoS levering"],
      },
    };
  }

  if (taskId.startsWith("task-pos-")) {
    return {
      taskId,
      primaryTech: "ISO 8583 Financial Clearing & Idempotent State Machine",
      category: "protocol",
      whatIsIt: {
        ua: "Міжнародний стандарт банківських транзакцій з обов'язковою перевіркою передумов та ідемпотентними ключами.",
        en: "International banking clearing standard enforcing pre-condition checks and atomic idempotent state transitions.",
        da: "International bankstandard der håndhæver validering og idempotente transaktioner.",
      },
      whyHere: {
        ua: "Запобігає подвійним списанням коштів та фінансовим розходженням при обривах зв'язку.",
        en: "Guarantees zero duplicate charges and preserves financial ledger integrity across network disconnects.",
        da: "Forhindrer dobbelttrækninger og sikrer regnskabsintegritet ved netværkstab.",
      },
      alternative: {
        name: "Ad-hoc Non-Idempotent HTTP Calls",
        tradeoff: {
          ua: "Повторні запити без ідемпотентності призводять до подвійного списання грошей з картки клієнта та штрафів від платіжних систем.",
          en: "Retrying without idempotency tokens double-bills customer cards and triggers costly compliance penalties.",
          da: "Gentagelser uden idempotens trækker beløbet to gange og medfører bankbøder.",
        },
      },
      advantages: {
        ua: ["Атомарність ACID", "100% захист від овердрафту", "Відповідність вимогам PCI-DSS"],
        en: ["ACID transaction atomicity", "Zero cash overdraft risk", "PCI-DSS certified architecture"],
        da: ["ACID transaktionssikkerhed", "Nul overtræksrisiko", "PCI-DSS overholdelse"],
      },
    };
  }

  if (taskId.startsWith("task-api-")) {
    return {
      taskId,
      primaryTech: "RESTful HTTP/2 Multiplexing & RFC 7807 Problem Details",
      category: "network",
      whatIsIt: {
        ua: "Сучасний веб-стандарт API з мультиплексуванням багатьох запитів в одному TCP-з'єднанні та стандартизованими кодами помилок.",
        en: "Modern API standard multiplexing concurrent streams over a single TCP socket with standardized error schemas.",
        da: "Moderne API-standard der multiplexer samtidige forespørgsler over ét TCP-kabel med standardfejl.",
      },
      whyHere: {
        ua: "Забезпечує передбачуваний час відповіді та дозволяє проксі-серверам кешувати дані без звернення до бази.",
        en: "Enables upstream proxies to cache responses transparently and keeps service latency predictable.",
        da: "Giver forudsigelig svartid og lader proxyer cache svar uden databasekald.",
      },
      alternative: {
        name: "Unstructured Monolithic RPC over HTTP/1.0",
        tradeoff: {
          ua: "Вимагає відкриття нового сокета на кожен запит і повертає `200 OK` навіть при помилках, ламаючи автоматичний моніторинг.",
          en: "Opens a new TCP socket per request and returns 200 OK on errors, hiding failures from monitoring tools.",
          da: "Kræver ny socket for hvert kald og slører fejl med 200 OK koder.",
        },
      },
      advantages: {
        ua: ["У 5-10 разів швидший відгук", "Автоматичне кешування на CDN", "Зрозумілі коди статусів (400, 404, 500)"],
        en: ["5-10x faster response time", "Native edge CDN caching", "Transparent HTTP status telemetry"],
        da: ["5-10x hurtigere svartid", "Native CDN-caching", "Klare HTTP-statuskoder"],
      },
    };
  }

  if (taskId.startsWith("task-git-")) {
    return {
      taskId,
      primaryTech: "Merkle DAG & Content-Addressable Cryptographic Storage",
      category: "architecture",
      whatIsIt: {
        ua: "Незмінний спрямований ациклічний граф (DAG), де кожен об'єкт адресується власним криптографічним хешем SHA.",
        en: "Immutable Directed Acyclic Graph where every file and commit is identified by its cryptographic SHA hash.",
        da: "Uforanderlig Merkle DAG hvor enhver fil og commit identificeres ved sit SHA-hash.",
      },
      whyHere: {
        ua: "Дозволяє працювати повністю автономно в офлайні та миттєво зливати гілки без копіювання файлів.",
        en: "Enables completely autonomous offline development and sub-millisecond branch operations without disk duplication.",
        da: "Muliggør fuld offline-udvikling og lynhurtig branching uden filkopiering.",
      },
      alternative: {
        name: "Centralized Delta VCS (Subversion / CVS)",
        tradeoff: {
          ua: "Без зв'язку з центральним сервером робота блокується, а створення кожної нової гілки займає хвилини та гігабайти диска.",
          en: "Requires continuous network access to a central server, making branching slow and consuming gigabytes of disk space.",
          da: "Kræver konstant serverkontakt og bruger gigabytes af diskplads på branches.",
        },
      },
      advantages: {
        ua: ["100% автономна робота офлайн", "Криптографічний захист історії", "Миттєве перемикання гілок"],
        en: ["100% offline autonomy", "Cryptographic tamper-proofing", "Instantaneous branch switching"],
        da: ["100% offline autonomi", "Kryptografisk sikkerhed", "Lynhurtigt branchskift"],
      },
    };
  }

  if (taskId.startsWith("task-bandit-")) {
    return {
      taskId,
      primaryTech: "AST Static Analysis (SAST) & Defense-in-Depth Cryptography",
      category: "security",
      whatIsIt: {
        ua: "Аналіз абстрактного синтаксичного дерева коду (AST) для виявлення вразливостей ще до запуску програми в продакшен.",
        en: "Abstract Syntax Tree (AST) static application security testing detecting vulnerabilities prior to production deployment.",
        da: "Statisk sikkerhedsanalyse (SAST) af kildetræet der fanger sikkerhedshuller før release.",
      },
      whyHere: {
        ua: "Знаходить захардкоджені паролі, SQL-ін'єкції та слабку криптографію на етапі написання коду.",
        en: "Pinpoints hardcoded secrets, SQL injection vectors, and weak cipher modes directly in developer pipelines.",
        da: "Finder hårdkodede kodeord, SQL-injections og svag krypto direkte i udviklingsfasen.",
      },
      alternative: {
        name: "Manual Code Inspection Alone",
        tradeoff: {
          ua: "Людина пропускає до 50% прихованих вразливостей, що веде до зламу системи та витоку персональних даних.",
          en: "Manual code reviews miss up to 50% of subtle security holes, shipping exploitable vulnerabilities to customers.",
          da: "Manuel inspektion overser op mod 50% af sikkerhedsfejl og fører til datalæk.",
        },
      },
      advantages: {
        ua: ["Автоматичний аудит кожного коміту", "Виправлення вразливостей до релізу", "Нуль витоків секретів"],
        en: ["Automated continuous CI auditing", "Pre-release vulnerability mitigation", "Zero secret exposure in Git"],
        da: ["Automatisk audit ved hvert commit", "Rettelse af huller før release", "Ingen lækkede nøgler"],
      },
    };
  }

  if (taskId.startsWith("task-vertex-")) {
    return {
      taskId,
      primaryTech: "Kubeflow Pipelines & Scalable Managed Model Registry",
      category: "cloud",
      whatIsIt: {
        ua: "Керований MLOps-конвеєр для відтворюваного навчання моделей на кластерах GPU/TPU із трекінгом артефактів.",
        en: "Managed MLOps workflow engine executing reproducible training runs on GPU/TPU clusters with artifact tracking.",
        da: "Styret MLOps-pipeline til reproducerbar træning på GPU/TPU klynger med fuld sporbarhed.",
      },
      whyHere: {
        ua: "Забезпечує нульовий час простою (Zero-Downtime) при оновленні моделі та автоматично масштабує репліки за навантаженням.",
        en: "Enables zero-downtime canary model updates and autoscales inference replicas dynamically with traffic demand.",
        da: "Sikrer nul nedetid ved modelopdateringer og skalerer automatisk efter behov.",
      },
      alternative: {
        name: "Manual Python Scripts on Local Machines",
        tradeoff: {
          ua: "Ручні скрипти призводять до втрати історії експериментів, не масштабуються і падають при великих датасетах через брак пам'яті.",
          en: "Local scripts lack experiment lineage, cannot distribute compute, and crash with Out-Of-Memory on production datasets.",
          da: "Lokale scripts mangler sporbarhed og crasher ved store datamængder på grund af RAM-mangel.",
        },
      },
      advantages: {
        ua: ["100% відтворюваність експериментів", "Автоматичне масштабування під навантаженням", "Плавний Canary-реліз моделей"],
        en: ["100% reproducible experiments", "Dynamic traffic autoscaling", "Safe canary model deployments"],
        da: ["100% reproducerbarhed", "Dynamisk autoskalering", "Sikker canary-udrulning"],
      },
    };
  }

  if (taskId.startsWith("task-fde-")) {
    return {
      taskId,
      primaryTech: "Model Context Protocol (MCP) & Edge Runtime Architecture",
      category: "architecture",
      whatIsIt: {
        ua: "Промисловий стандарт підключення штучного інтелекту до реальних інженерних інструментів, файлів та баз даних.",
        en: "Enterprise protocol standardizing AI agent orchestration with native tools, local files, and live APIs.",
        da: "Industristandard for integration af AI med værktøjer, lokale filer og databaser.",
      },
      whyHere: {
        ua: "Дозволяє агенту безпечно виконувати діагностику обладнання та вносити зміни з дотриманням корпоративних політик безпеки.",
        en: "Enables agents to safely execute diagnostics and apply configuration changes within strict security guardrails.",
        da: "Giver agenten mulighed for at udføre fejlsøgning og ændringer inden for faste sikkerhedsrammer.",
      },
      alternative: {
        name: "Unbounded Direct Script Execution without Guardrails",
        tradeoff: {
          ua: "Пряме виконання команд нейромережею без контролю може випадково видалити робочі файли або зупинити продакшен-сервер.",
          en: "Unconstrained script execution risks catastrophic data loss or production downtime if the model hallucinates an invalid flag.",
          da: "Ubegrænset script-kørsel risikerer utilsigtede sletninger og nedetid ved hallucinationer.",
        },
      },
      advantages: {
        ua: ["Безпечний пісочничний доступ", "Аудит кожної дії агента", "Швидка інтеграція з будь-яким API"],
        en: ["Secure sandboxed tool execution", "Full audit trail of agent actions", "Universal API integration"],
        da: ["Sikker sandbox-eksekvering", "Komplet logning af agentens handlinger", "Universal API-integration"],
      },
    };
  }

  if (taskId.startsWith("task-rag-")) {
    return {
      taskId,
      primaryTech: "Hybrid RRF (Dense Vector + Sparse BM25) & Semantic Chunking",
      category: "database",
      whatIsIt: {
        ua: "Двоканальний векторний конвеєр, що знаходить і точні ключові слова, і прихований семантичний зміст тексту.",
        en: "Dual-channel retrieval pipeline fusing dense semantic embeddings with exact BM25 keyword matching via Reciprocal Rank Fusion.",
        da: "Dobbelt-sporet søgepipeline der kombinerer semantiske vektorer med præcis nøgleordsmatchning.",
      },
      whyHere: {
        ua: "Нейромережа отримує лише перевірені точні факти з внутрішньої документації компанії, усуваючи галюцинації.",
        en: "Feeds verified enterprise context into the model context window, eliminating factual hallucinations.",
        da: "Fodrer AI-modellen med verificerede fakta fra interne dokumenter for at eliminere hallucinationer.",
      },
      alternative: {
        name: "Pure Dense Vector Search Alone",
        tradeoff: {
          ua: "Чисті вектори гублять точні номери договорів, серійні номери та назви функцій, видаючи неточні документи.",
          en: "Dense vectors frequently fail on exact alphanumeric terms like serial numbers, SKUs, and function names.",
          da: "Rene vektorer overser ofte eksakte serienumre, koder og funktionsnavne.",
        },
      },
      advantages: {
        ua: ["Кардинальне зниження галюцинацій завдяки верифікованим джерелам", "Пошук як за змістом, так і за точними кодами", "Посилання на точні джерела"],
        en: ["Grounded retrieval with minimal hallucinations", "Excels at both semantic and exact terms", "Verifiable primary source citations"],
        da: ["Markant færre hallucinationer gennem verificerede kilder", "Matcher både betydning og eksakte koder", "Verificerbare kildehenvisninger"],
      },
    };
  }

  if (taskId.startsWith("task-cyber-")) {
    return {
      taskId,
      primaryTech: "NIST Incident Response & Packet Inspection (DPI / SYN Cookies)",
      category: "security",
      whatIsIt: {
        ua: "Глибинний аналіз мережевих пакетів та автоматизована ізоляція загроз за міжнародними протоколами кібербезпеки.",
        en: "Deep packet inspection and automated threat isolation aligned with NIST SP 800-61 cybersecurity standards.",
        da: "Dybdegående pakkeinspektion og automatisk trusselsisolering i henhold til NIST-standarder.",
      },
      whyHere: {
        ua: "Запобігає поширенню атак по локальній мережі компанії та захищає сервери від виходу з ладу під час шторму запитів.",
        en: "Stops lateral threat propagation across enterprise subnets and preserves system availability under severe DDoS.",
        da: "Stopper spredning af trusler på det interne netværk og bevarer oppetid under DDoS.",
      },
      alternative: {
        name: "Manual Firewall Log Review without Automation",
        tradeoff: {
          ua: "Ручний перегляд сотень тисяч рядків логів займає години, за які хакери встигають зашифрувати всі сервери компанії.",
          en: "Manual log review takes hours while modern ransomware encrypts entire corporate server fleets in minutes.",
          da: "Manuel log-gennemgang tager timer, mens ransomware låser servere på få minutter.",
        },
      },
      advantages: {
        ua: ["Миттєве реагування на загрози за секунди", "Збереження цифрових доказів", "Стійкість до потужних DDoS-атак"],
        en: ["Automated threat containment in seconds", "Court-admissible digital forensics", "Proven DDoS resilience"],
        da: ["Automatisk inddæmning på sekunder", "Bevissikring til efterforskning", "Dokumenteret DDoS-modstandskraft"],
      },
    };
  }

  // Default fallback for fundamental Station 01 / General Coding tasks
  return {
    taskId,
    primaryTech: "Memory-Mapped Hardware I/O & Deterministic State Machine",
    category: "pattern",
    whatIsIt: {
      ua: "Апаратне керування та сувора типізація даних для забезпечення надійної роботи пристрою без збоїв у режимі реального часу.",
      en: "Direct hardware register mapping and strict type contracts ensuring deterministic real-time device operation.",
      da: "Hardwareregistrering og streng typestyring der sikrer deterministisk drift i realtid.",
    },
    whyHere: {
      ua: "Забезпечує передбачуваний час виконання та стабільну роботу вбудованих контролерів без фрагментації оперативної пам'яті.",
      en: "Guarantees predictable execution deadlines and rock-solid stability without heap fragmentation on embedded controllers.",
      da: "Sikrer forudsigelig udførelsestid og stabilitet uden RAM-fragmentering på embeddede enheder.",
    },
    alternative: {
      name: "Unconstrained Dynamically-Typed Scripting",
      tradeoff: {
        ua: "Динамічна типізація призводить до помилок типів прямо під час роботи, збільшує витрату RAM у 4 рази та сповільнює виконання.",
        en: "Dynamic scripting introduces runtime type failures, consumes 4x more RAM, and suffers unpredictable garbage collection pauses.",
        da: "Dynamiske sprog giver uventede runtime-fejl, bruger 4x mere RAM og udløser uforudsigelige GC-pauser.",
      },
    },
    advantages: {
      ua: ["Миттєвий відгук за 1 такт CPU", "Неможливість помилок типів", "Мінімальне споживання енергії"],
      en: ["Single-cycle CPU execution", "Guaranteed compile-time type safety", "Minimal electrical power consumption"],
      da: ["Eksekvering i 1 CPU-cyklus", "Garanteret typesikkerhed", "Minimalt strømforbrug"],
    },
  };
}
