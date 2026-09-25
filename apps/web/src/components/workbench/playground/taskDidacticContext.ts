/**
 * @file apps/web/src/components/workbench/playground/taskDidacticContext.ts
 * @description Educational didactic data: ready reference code, memory allocation notes,
 *              project file hierarchy, and Architecture Canvas node mappings for all tasks.
 */

import { getLocalizedTaskDidactic } from "@iw/i18n";

interface ArchitectureMapInfo {
  contractFile?: string;
  implementationFile?: string;
  clientFile?: string;
  canvasNodeName: string;
  canvasWiring: string;
  architectureHint: string;
  [key: string]: unknown;
}

export type CuratedResourceAuthority =
  | "Microsoft Learn"
  | "Go.dev"
  | "Google Cloud"
  | "IBM Granite"
  | "ByteByteGo"
  | "MIT OCW"
  | "NIST"
  | "RFC"
  | "Computerphile"
  | "OWASP";

export type CuratedResourceType =
  | "documentation"
  | "rfc"
  | "architecture_paper"
  | "video"
  | "standard";

export interface CuratedResource {
  title: string;
  source: CuratedResourceAuthority;
  url: string;
  type: CuratedResourceType;
  targetGrade?: "Junior" | "Middle" | "Senior" | "Architect";
  estimatedMinutes?: number;
  whyRead: Record<string, string>;
}

export interface TaskDidacticInfo {
  taskId: string;
  whyThisCode: Record<string, string>;
  /** Deep explanation for primitive types (int vs string, memory allocation) */
  primitiveMemoryNote?: Record<string, string>;
  /** Project structure and Architecture Canvas mapping (Tier 2 / architecture tasks) */
  architectureMap?: ArchitectureMapInfo;
  /** Primary authoritative learning sources (Deep Dive module) */
  curatedResources?: CuratedResource[];
  [key: string]: unknown;
}

export const TASK_DIDACTIC_MAP: Record<string, TaskDidacticInfo> = {
  // ── TV Module — Tier 0: Fundamentals ──────────────────────────────────────
  "task-0-1-power-on": {
    taskId: "task-0-1-power-on",
    whyThisCode: {
      csharp:
        "Ми звертаємося до об'єкта `tv` через крапку `.` (доступ до членів) і викликаємо метод `PowerOn()`. Круглі дужки наказують процесору виконати дію негайно, а крапка з комою `;` завершує команду в C#.",
      go:
        "В об'єкті `tv` ми викликаємо експортований метод `PowerOn()`. У Go компілятор підставляє крапку з комою автоматично наприкінці рядка.",
    },
    primitiveMemoryNote: {
      csharp:
        "Об'єкт телевізора `tv` живе у купі (Heap). Виклик методу без параметрів `()` не виділяє пам'ять під аргументи — він лише передає сигнал на перемикання реле живлення.",
      go:
        "Структура `tv` передається за посиланням (вказівником). Виклик методу змінює внутрішнє поле живлення апаратної структури.",
    },
    curatedResources: [
      {
        title: "C# Statements, Expressions, and Operators",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 6,
        whyRead: {
          ua: "Офіційне керівництво Microsoft: як процесор парсить крапку членства, виклики методів та чому крапка з комою є обов'язковою границею інструкції в C#.",
          en: "Official Microsoft documentation on how the CLR parses member access dots, method invocations, and statement termination.",
          da: "Officiel Microsoft-dokumentation om, hvordan CLR parser medlemsadgangs-prikken, metodekald og sætningsafslutning.",
        },
      },
      {
        title: "A Tour of Go: Exported Names & Packages",
        source: "Go.dev",
        url: "https://go.dev/tour/basics/3",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 5,
        whyRead: {
          ua: "Першоджерело авторів мови Go (Роб Пайк, Кен Томпсон): чому публічні методи пишуться з великої літери (PowerOn) і як працює автоматична вставка крапки з комою.",
          en: "Original source from Go creators: why public methods are capitalized and how automatic semicolon insertion operates.",
          da: "Original kilde fra Go-skaberne: hvorfor offentlige metoder har stort begyndelsesbogstav, og hvordan automatisk semikolon fungerer.",
        },
      },
    ],
  },

  "task-0-2-types": {
    taskId: "task-0-2-types",
    whyThisCode: {
      csharp:
        "Комп'ютер суворо розрізняє типи: метод `SetChannel(1)` приймає ціле число `int`, а метод `SetLabel(\"NEWS\")` — текстовий рядок `string`.",
      go:
        "Строга типізація Go вимагає передавати число `1` без лапок для тюнера і текст `\"NEWS\"` строго у подвійних лапках для підпису.",
    },
    primitiveMemoryNote: {
      csharp:
        "⚡ ПАМ'ЯТЬ ПРОЦЕСОРА:\n• Число `1` (Integer) пишеться БЕЗ ЛАПОК: процесор записує його у 32-бітний регістр пам'яті (4 байти) як пряме двійкове значення (0b00000001). З ним можна проводити математичні операції.\n• Текст `\"NEWS\"` (String) пишеться СТРОГО У ЛАПКАХ: для тексту створюється об'єкт у купі (Heap), де зберігається масив символів у кодуванні UTF-16, а змінна отримує вказівник на початок цього масиву.\n⚠️ Якщо написати `SetChannel(\"1\")` — компілятор повідомить про помилку несумісності типів. Якщо написати `SetLabel(NEWS)` без лапок — компілятор шукатиме неіснуючу змінну `NEWS`.",
      go:
        "⚡ ПАМ'ЯТЬ ПРОЦЕСОРА:\n• `1` — числовий літерал `int`, займає прямий машинний стек/регістр.\n• `\"NEWS\"` — незмінний зріз байтів (immutable byte slice) у купі пам'яті.\n⚠️ Числа для обчислень — без лапок. Текст для людей — завжди у лапках.",
    },
    curatedResources: [
      {
        title: "The C# Type System: Value Types vs Reference Types",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 8,
        whyRead: {
          ua: "Глибоке розуміння різниці між розміщенням чисел (Stack / Registers) та рядків (Heap). Чому компілятор C# захищає пам'ять від переповнення та несумісних присвоєнь.",
          en: "Deep dive into value types vs reference types memory layout, stack frames, and type safety guarantees.",
          da: "Dybdegående gennemgang af værdityper vs referencetyper, stakhukommelse og typesikkerhedsgarantier.",
        },
      },
      {
        title: "Effective Go: Data Types & Allocation",
        source: "Go.dev",
        url: "https://go.dev/doc/effective_go#data",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 7,
        whyRead: {
          ua: "Стандарт ідіоматичного Go: як влаштовані незмінні зрізи байтів рядків (string headers) та машинне виділення числових типів.",
          en: "Idiomatic Go standard: how immutable string byte headers work under the hood and memory allocation of numeric primitives.",
          da: "Go-standarden for strengehoveder, immutable byte slices og maskinhukommelsesallokering.",
        },
      },
    ],
  },

  "task-0-3-sequential": {
    taskId: "task-0-3-sequential",
    whyThisCode: {
      csharp:
        "Процесор виконує інструкції послідовно (згори донизу). Спочатку телевізор має увімкнутися (`PowerOn()`), і лише після цього тюнер здатний прийняти команду перемикання каналу (`SetChannel(2)`).",
      go:
        "Лінійний потік виконання (Sequential Execution): спочатку подача живлення `tv.PowerOn()`, потім вибір частоти `tv.SetChannel(2)`.",
    },
    primitiveMemoryNote: {
      csharp:
        "Апаратна залежність: фізична шина зв'язку тюнера знеструмлена до виклику `PowerOn()`. Якщо переставити рядки місцями — зміна каналу проігнорується контролером.",
      go:
        "Послідовність команд керує сигналами системної шини за тактовою частотою процесора.",
    },
  },

  "task-1-assignment": {
    taskId: "task-1-assignment",
    whyThisCode: {
      csharp:
        "Символ `=` у програмуванні — це дія запису в пам'ять (оператор присвоєння). Значення `true` праворуч записується в комірку пам'яті властивості `tv.IsOn` ліворуч.",
      go:
        "Оператор `=` модифікує значення булевого поля `IsOn` екземпляра `tv`, переводячи біт живлення в стан 1 (`true`).",
    },
    primitiveMemoryNote: {
      csharp:
        "Булевий тип `bool` займає 1 байт у пам'яті (значення `true` = 0x01, `false` = 0x00). Не плутайте `=` (запис) з `==` (порівняння).",
      go:
        "Тип `bool` зберігає прапорець істини прямо в пам'яті структури без додаткових виділень.",
    },
  },

  // ── TV Module — Tier 1: Logic & Control Flow ──────────────────────────────
  "task-2-branching": {
    taskId: "task-2-branching",
    whyThisCode: {
      csharp:
        "Умовний оператор `if` перевіряє поточний стан телевізора. Якщо `tv.IsOn` дорівнює `true`, спрацьовує перемикання живлення. Це базова поведінка тумблера.",
      go:
        "Розгалуження `if tv.IsOn`: у Go умова записується без круглих дужок, але тіло обов'язково береться у фігурні дужки `{}`.",
    },
    primitiveMemoryNote: {
      csharp:
        "Інструкція умовного переходу процесора (Branch Prediction): якщо умова хибна, процесор перестрибує блок у фігурних дужках `{}`.",
      go:
        "Оптимізація компілятора перетворює `if` на апаратний стрибок `JMP` за прапорцем регістра `FLAGS`.",
    },
  },

  "task-variable-mutation": {
    taskId: "task-variable-mutation",
    whyThisCode: {
      csharp:
        "Оператор інкременту `++` збільшує номер каналу на 1 прямо на місці (мутація пам'яті). Це скорочений запис для `tv.Channel = tv.Channel + 1`.",
      go:
        "У Go `tv.Channel++` є самостійною інструкцією, яка збільшує цілочисельне значення в полі структури.",
    },
  },

  "task-boundary-guard": {
    taskId: "task-boundary-guard",
    whyThisCode: {
      csharp:
        "Guard Clause (Захисний бар'єр): якщо номер каналу перевищив допустиму межу (4), ми негайно скидаємо його на 1. Це захищає телевізор від виходу в чорний екран.",
      go:
        "Захисна умова `if tv.Channel > 4`: тримає стан приладу у валідному діапазоні сітки мовлення [1..4].",
    },
  },

  "task-for-loop": {
    taskId: "task-for-loop",
    whyThisCode: {
      csharp:
        "Цикл `for (int i = 1; i <= 4; i++)` створює лічильник `i` на стеку й автоматично проходить всі 4 канали, перемикаючи екран на кожному кроці.",
      go:
        "Цикл `for i := 1; i <= 4; i++` усуває дублювання 4 окремих викликів `SetChannel`.",
    },
    primitiveMemoryNote: {
      csharp:
        "Змінна лічильника `i` розміщується безпосередньо в регістрі процесора або на фреймі стека (Stack Frame). Щойно цикл завершується — пам'ять під `i` миттєво звільняється без залучення збирача сміття (GC).",
      go:
        "Змінна лічильника `i` виділяється на стеку виклику горутини і не спричиняє втечі в купу (escape to heap).",
    },
  },
  "task-async-loop": {
    taskId: "task-async-loop",
    whyThisCode: {
      csharp:
        "Цикл `for (int i = 1; i <= 4; i++)` створює лічильник `i` на стеку й автоматично проходить всі 4 канали, перемикаючи екран на кожному кроці.",
      go:
        "Цикл `for i := 1; i <= 4; i++` усуває дублювання 4 окремих викликів `SetChannel`.",
    },
  },

  // ── TV Module — Bridge Tasks: OOP Foundations ─────────────────────────────
  "task-class-instance": {
    taskId: "task-class-instance",
    whyThisCode: {
      csharp:
        "Клас `TV` — це лише креслення на папері. Оператор `new TV()` виділяє фізичну пам'ять у Купі (Heap) і зводить за цим кресленням реальний об'єкт. Змінна `myTv` на стеку отримує посилання (адресу пам'яті) цього об'єкта, через яке ми викликаємо метод `myTv.PowerOn();`.",
      go:
        "Структура `TV` описує форму даних. Вираз `TV{}` або `&TV{}` створює живий екземпляр у пам'яті. Змінна `myTv` отримує доступ до екземпляра, дозволяючи викликати метод `myTv.PowerOn()`.",
    },
    primitiveMemoryNote: {
      csharp:
        "⚡ СТЕК ТА КУПА (Stack vs Heap):\n• Змінна `myTv` розміщується на Стеку (Stack) і займає лише 8 байтів — вона тримає виключно 64-бітну адресу (вказівник).\n• Сам об'єкт телевізора зі своїми полями (`isOn`, `channel`, `volume`) створюється в керованій Купі (Managed Heap).\n• Без оператора `new` креслення не оживе: спроба викликати `TV.PowerOn()` призведе до помилки, адже клас без екземпляра не має реального екрана та тюнера.",
      go:
        "⚡ ПАМ'ЯТЬ В GO:\n• `TV{}` ініціалізує поля структури нульовими значеннями за замовчуванням.\n• Якщо розмір структури відомий і вона не втікає за межі функції, компілятор Go розмістить її на стеку. Інакше (Escape Analysis) — виділить пам'ять у купі.",
    },
    architectureMap: {
      contractFile: "src/devices/ITvDevice.cs",
      implementationFile: "src/devices/VirtualTv.cs",
      clientFile: "src/Program.cs",
      canvasNodeName: "VirtualTV Instance",
      canvasWiring: "Створення окремого екземпляра телевізора у пам'яті ізолює його стан від інших пристроїв.",
      architectureHint:
        "Клас задає структуру поведінки, але кожен створений екземпляр має свій власний незалежний стан живлення та каналу.",
    },
  },

  "task-method-return": {
    taskId: "task-method-return",
    whyThisCode: {
      csharp:
        "Методи бувають двох видів: Команди (змінюють стан без повернення, `void`) та Запити (читають стан і повертають значення). Метод `tv.GetVolume()` є Запитом: він повертає число `int`. Ми перехоплюємо це число у змінну `int vol` на стеку, а потім передаємо обчислене значення `vol + 10` у команду-мутатор `tv.SetVolume()`.",
      go:
        "Запит `tv.GetVolume()` повертає поточний стан гучності у змінну `vol`. Наступна команда `tv.SetVolume(vol + 10)` застосовує нове значення з арифметичним приростом.",
    },
    primitiveMemoryNote: {
      csharp:
        "⚡ ПЕРЕДАЧА ДАНИХ ЧЕРЕЗ СТЕК:\n• Коли метод повертає `int`, значення кладеться в регістр процесора (EAX/RAX) або на вершину стека.\n• Рядок `int vol = tv.GetVolume();` забирає це значення й резервує 4 байти в поточному фреймі стека.\n• Вираз `vol + 10` обчислюється арифметико-логічним пристроєм (ALU) процесора без зміни самого телевізора, доки ми явно не викличемо `SetVolume()`.",
      go:
        "⚡ ПОВЕРНЕННЯ З ФУНКЦІЇ:\n• Значення повернення копіюється в стек виклику.\n• `vol + 10` створює тимчасове чисельне значення, яке передається аргументом у метод `SetVolume`.",
    },
    architectureMap: {
      contractFile: "src/audio/IAudioState.cs",
      implementationFile: "src/audio/AudioEngine.cs",
      clientFile: "src/controllers/VolumeModifier.cs",
      canvasNodeName: "Audio State Pipeline",
      canvasWiring: "Шина зчитування стану GetVolume передає сигнал в обчислювальний вузол перед записом нового рівня.",
      architectureHint:
        "CQS (Command-Query Separation): метод, що повертає значення, не повинен мати побічних ефектів, а метод-мутатор не повинен повертати дані.",
    },
  },

  "task-null-reference": {
    taskId: "task-null-reference",
    whyThisCode: {
      csharp:
        "Ключове слово `null` означає, що посилання веде в нікуди (адреса 0x0). Якщо звернутися через крапку до порожнього посилання (`broken.PowerOn()`), програма впаде з фатальною аварією `NullReferenceException`. Конструкція `if (broken != null)` (або safe navigation `broken?.PowerOn()`) — це захисний бар'єр (Guard), який рятує додаток від аварії.",
      go:
        "`nil` — це нульовий вказівник. Звернення до методу через `nil` призведе до паніки рантайму `runtime error: invalid memory address or nil pointer dereference`. Перевірка `if broken != nil` захищає сервер від аварійного завершення.",
    },
    primitiveMemoryNote: {
      csharp:
        "⚡ АНАТОМІЯ КРАХУ (0x00000000):\n• Змінна `TV broken = null;` створює на стеку вказівник із нульовою адресою `0x00000000`.\n• Спроба прочитати пам'ять за адресою 0x0 блокується операційною системою (Memory Protection Fault), і середовище .NET негайно викидає виняток `NullReferenceException`.\n• Перевірка `if (broken != null)` не чіпає купу — процесор за один такт порівнює регістр з нулем. Якщо там 0 — блок коду безпечно оминається.",
      go:
        "⚡ NIL POINTER DEREFERENCE:\n• Вказівник `*TV = nil` не вказує на жоден виділений блок пам'яті.\n• Перевірка `broken != nil` запобігає паніці процесу, гарантуючи безперебійність роботи сервісу.",
    },
    architectureMap: {
      contractFile: "src/safety/INullGuard.cs",
      implementationFile: "src/safety/SafeInvoker.cs",
      clientFile: "src/controllers/RemoteController.cs",
      canvasNodeName: "NullGuard Barrier",
      canvasWiring: "Захисний вузол валідації посилання стоїть перед апаратним контролером, блокуючи виклики до нульових адрес.",
      architectureHint:
        "Defensive Programming: захисні перевірки (Guard Clauses) на межах шарів архітектури роблять систему стійкою до некоректних вхідних даних.",
    },
  },

  "task-function-encapsulation": {
    taskId: "task-function-encapsulation",
    whyThisCode: {
      csharp:
        "Функція `void Mute()` упаковує скидання гучності в іменовану дію. `void` означає, що функція виконує дію, але не повертає даних. Після оголошення ми одразу викликаємо її `Mute();`.",
      go:
        "Функція `func Mute()` інкапсулює логіку вимкнення звуку. Виклик `Mute()` активує приглушення звуку.",
    },
    architectureMap: {
      contractFile: "src/audio/IAudioService.cs",
      implementationFile: "src/audio/MuteAction.cs",
      clientFile: "src/controllers/TVController.cs",
      canvasNodeName: "AudioController (Mute)",
      canvasWiring: "Функція Mute() підключається до шини звукового тракту телевізора на схемах Architecture Studio.",
      architectureHint:
        "Інкапсуляція дій у методи ізолює зміну внутрішнього стану аудіопроцесора від зовнішнього коду пульта.",
    },
  },

  // ── TV Module — Tier 2: Architecture & Patterns ───────────────────────────
  "task-antipattern-god-object": {
    taskId: "task-antipattern-god-object",
    whyThisCode: {
      csharp:
        "Це монолітний диспетчер через `switch (button)`. Кожна кнопка описується в окремому `case`. Це навчальний приклад антипатерну: щоразу, додаючи нову кнопку, нам доводиться модифікувати єдиний монолітний файл.",
      go:
        "Процедурний `switch button` у Go. Зручний для простих скриптів, але в комерційних системах порушує принцип Open-Closed.",
    },
    architectureMap: {
      contractFile: "src/interfaces/IRemoteCommand.cs",
      implementationFile: "src/controllers/GodTVController.cs",
      clientFile: "src/controllers/TVController.cs",
      canvasNodeName: "TVController (Monolith)",
      canvasWiring: "Монолітний контролер тримає всі кнопки в одному файлі без розділення обов'язків.",
      architectureHint:
        "Антипатерн God Switch: будь-яка зміна ламає сусідні гілки. На наступних кроках ми замінимо його на поліморфні команди.",
    },
  },
  "task-anti-pattern-god-switch": {
    taskId: "task-anti-pattern-god-switch",
    whyThisCode: {
      csharp:
        "Це монолітний диспетчер через `switch (button)`. Кожна кнопка описується в окремому `case`. Це навчальний приклад антипатерну: щоразу, додаючи нову кнопку, нам доводиться модифікувати єдиний монолітний файл.",
      go:
        "Процедурний `switch button` у Go. Зручний для простих скриптів, але в комерційних системах порушує принцип Open-Closed.",
    },
    architectureMap: {
      contractFile: "src/interfaces/IRemoteCommand.cs",
      implementationFile: "src/controllers/GodTVController.cs",
      clientFile: "src/controllers/TVController.cs",
      canvasNodeName: "TVController (Monolith)",
      canvasWiring: "Монолітний контролер тримає всі кнопки в одному файлі без розділення обов'язків.",
      architectureHint:
        "Антипатерн God Switch: будь-яка зміна ламає сусідні гілки. На наступних кроках ми замінимо його на поліморфні команди.",
    },
  },

  "task-interface-polymorphism": {
    taskId: "task-interface-polymorphism",
    whyThisCode: {
      csharp:
        "Ми відокремлюємо контракт від реалізації: створюємо інтерфейсну змінну `IRemoteCommand command = new CalcCommand();` і викликаємо поліморфний метод `command.Execute();`.",
      go:
        "У Go `command := CalcCommand{}` реалізує інтерфейс `IRemoteCommand` автоматично завдяки качиній типізації (duck typing). Виклик `command.Execute()` не залежить від нутрощів команди.",
    },
    architectureMap: {
      contractFile: "src/interfaces/IRemoteCommand.cs",
      implementationFile: "src/commands/CalcCommand.cs",
      clientFile: "src/controllers/TVController.cs",
      canvasNodeName: "IRemoteCommand (Interface)",
      canvasWiring:
        "Нода [IRemoteCommand] (порт out-execute) з'єднується з вхідним портом CommandHandler ноди [TVController].",
      architectureHint:
        "Контролер не знає, яка саме кнопка підключена. Він бачить лише універсальну розетку IRemoteCommand і тисне Execute().",
    },
    curatedResources: [
      {
        title: "Interfaces - Define Behavior for Multiple Types",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/interfaces",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 9,
        whyRead: {
          ua: "Фундамент SOLID: чому інженерний контракт відокремлений від реалізації, як працює віртуальна таблиця методів (vtable) і поліморфна диспетчеризація.",
          en: "SOLID foundations: decoupling contracts from implementations, vtable layout, and runtime method dispatch.",
          da: "SOLID fundament: adskillelse af kontrakter og implementationer, vtable og runtime dispatch.",
        },
      },
      {
        title: "Go by Example: Interfaces and Duck Typing",
        source: "Go.dev",
        url: "https://gobyexample.com/interfaces",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 6,
        whyRead: {
          ua: "Структурна типізація Go: чому в Go немає ключового слова 'implements', і як компілятор автоматично перевіряє сигнатури методів під час збірки.",
          en: "Go structural subtyping: why Go omits 'implements' keyword and how interface tables (itab) work at runtime.",
          da: "Strukturel typisering i Go: hvorfor Go udelader 'implements', og hvordan itab fungerer.",
        },
      },
    ],
  },

  "task-di-container": {
    taskId: "task-di-container",
    whyThisCode: {
      csharp:
        "Inversion of Control (IoC): замість створення об'єкта через `new` прямо в коді контролера, ми реєструємо зв'язку 'контракт -> реалізація' у DI-контейнері: `services.AddTransient<IRemoteCommand, CalcCommand>();`.",
      go:
        "Реєстрація залежності в контейнері: `container.Register(\"calc\", NewCalcCommand())`. Контейнер сам надасть екземпляр у потрібний момент.",
    },
    architectureMap: {
      contractFile: "src/interfaces/IRemoteCommand.cs",
      implementationFile: "src/commands/CalcCommand.cs",
      clientFile: "src/Program.cs (DI Setup)",
      canvasNodeName: "DI ServiceContainer",
      canvasWiring:
        "Контейнер конфігурує фабрику екземплярів між [IRemoteCommand] та [CalcCommand].",
      architectureHint:
        "Dependency Injection усуває жорстку прив'язку (tight coupling): при зміні CalcCommand код пульта не чіпається взагалі.",
    },
    curatedResources: [
      {
        title: "Dependency Injection in .NET Core & Modern Architectures",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection",
        type: "architecture_paper",
        targetGrade: "Middle",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Архітектурний стандарт інверсії керування (IoC): різниця між Transient, Scoped та Singleton часом життя сервісів у високонавантажених бекендах.",
          en: "Inversion of Control (IoC) architectural standard: Transient, Scoped, and Singleton service lifetimes in backend services.",
          da: "Inversion of Control (IoC) arkitekturstandard: Transient, Scoped og Singleton levetider i backend-tjenester.",
        },
      },
      {
        title: "System Design: Dependency Injection & Clean Microservices",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 10,
        whyRead: {
          ua: "Розбір Алекса Сю (ByteByteGo): як DI зменшує зв'язність мікросервісів та спрощує модульне тестування під час рефакторингу монолітів.",
          en: "Alex Xu's architectural breakdown of decoupled services and testability in enterprise architectures.",
          da: "Arkitektonisk gennemgang af afkobling og testbarhed i enterprise-arkitekturer.",
        },
      },
    ],
  },

  "task-command-registry": {
    taskId: "task-command-registry",
    whyThisCode: {
      csharp:
        "Ми досягли вершини архітектури: замінили гігантський `switch` на динамічний словник `Dictionary<string, IRemoteCommand>`. Реєструємо команду під ключем `\"CALC\"` і викликаємо її одразу за індексом `registry[button].Execute()` без жодного `if` чи `switch`!",
      go:
        "Використання хеш-мапи `map[string]IRemoteCommand`. Команди зберігаються як плагіни: `registry[button].Execute()` знаходить дію за O(1).",
    },
    architectureMap: {
      contractFile: "src/interfaces/IRemoteCommand.cs",
      implementationFile: "src/commands/CalcCommand.cs",
      clientFile: "src/controllers/CommandRegistry.cs",
      canvasNodeName: "Command Registry (Dispatcher)",
      canvasWiring:
        "Динамічний реєстр кнопок пульта, підключений до шини виконання команд Architecture Studio.",
      architectureHint:
        "Open-Closed Principle: система відкрита для розширення (можна зареєструвати хоч 1000 кнопок) і закрита для модифікації ядра!",
    },
  },

  // ── Fintech POS Terminal Tasks ────────────────────────────────────────────
  "task-pos-guard-clause": {
    taskId: "task-pos-guard-clause",
    whyThisCode: {
      csharp:
        "Захисний бар'єр банківського балансу: якщо запитана сума `amount` більша за `balance`, ми негайно встановлюємо статус `\"DECLINED\"` і робимо ранній вихід `return;`, щоб списання коштів не відбулося.",
      go:
        "У Go перевірка `if amount > balance` зупиняє транзакцію до будь-якої мутації стану банківського рахунку.",
    },
    architectureMap: {
      clientFile: "src/Domain/TransactionProcessor.cs",
      canvasNodeName: "POS Guard Clause Validator",
      canvasWiring: "Вхідний фільтр транзакції перед шлюзом еквайрингу.",
      architectureHint:
        "Ранній вихід (Early Return) усуває глибоку вкладеність і гарантує непорушність фінансового балансу.",
    },
    curatedResources: [
      {
        title: "Guard Clauses and Defensive Design Patterns",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/exception-handling",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 7,
        whyRead: {
          ua: "Захисне програмування: як уникнути сходів вкладених if-else (arrow antipattern) за допомогою раннього повернення помилок.",
          en: "Defensive programming: preventing nested arrow anti-patterns via early returns and invariant validation.",
          da: "Defensiv programmering: undgå indlejrede if-else konstruktioner med tidlige returns.",
        },
      },
      {
        title: "Design a Payment System: Invariants & Reconciliation",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 15,
        whyRead: {
          ua: "Як фінтех-системи обробляють мільярди транзакцій: правила валідації балансу, захист від від'ємних значень та запобігання фроду.",
          en: "How financial systems process billions of transactions: balance validation, non-negative invariants, and fraud mitigation.",
          da: "Hvordan finansielle systemer behandler milliarder af transaktioner med balance-invarianter.",
        },
      },
    ],
  },

  "task-pos-fee-calculation": {
    taskId: "task-pos-fee-calculation",
    whyThisCode: {
      csharp:
        "Ми розраховуємо повну вартість операції: додаємо фіксовану банківську комісію `fee` до суми покупки, зменшуємо баланс на сумарну величину через оператор `-=` і підтверджуємо статус `\"APPROVED\"`.",
      go:
        "Розрахунок `totalAmount = amount + fee` та мутація `balance -= totalAmount` забезпечують точність обліку банківського рахунку.",
    },
  },

  "task-pos-pin-lockout": {
    taskId: "task-pos-pin-lockout",
    whyThisCode: {
      csharp:
        "Апаратний захист від перебору PIN-коду: якщо введений PIN не збігається з еталоном, лічильник спроб збільшується на 1 (`failedAttempts++`). При досягненні 3 спроб активується апаратне блокування `isLocked = true` та статус `\"BLOCKED\"`.",
      go:
        "Скінченний автомат захисту (Security FSM): при переході ліміту спроб клавіатура термінала вимикається фізично.",
    },
    architectureMap: {
      clientFile: "src/Security/PinSecurityService.cs",
      canvasNodeName: "Hardware PIN Lockout Controller",
      canvasWiring: "Модуль захисту клавіатури термінала POS-7402 PRO.",
      architectureHint:
        "Захист від Brute Force: скінченний автомат (FSM) не дозволяє подальші спроби авторизації після 3 помилок.",
    },
    curatedResources: [
      {
        title: "NIST Special Publication 800-63B: Digital Identity Guidelines",
        source: "NIST",
        url: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        type: "standard",
        targetGrade: "Middle",
        estimatedMinutes: 11,
        whyRead: {
          ua: "Офіційний стандарт кібербезпеки уряду США (NIST): ліміти спроб введення PIN-коду (Rate-Limiting) та обов'язкове блокування сесії після 3 помилок.",
          en: "Official US government cybersecurity standard: PIN attempt thresholds and mandatory session lockout after consecutive failures.",
          da: "Officiel cybersikkerhedsstandard: PIN-forsøgsgrænser og obligatorisk sessionsblokering efter fejl.",
        },
      },
    ],
  },

  "task-pos-batch-settlement": {
    taskId: "task-pos-batch-settlement",
    whyThisCode: {
      csharp:
        "Цикл закриття зміни (Z-звіт): ми проходимо масивом транзакцій від `0` до `Length - 1`, підсумовуючи кожну транзакцію в загальний виторг `dailyTotal += transactions[i]`, і переводимо термінал у статус `\"SETTLED\"`.",
      go:
        "У Go цикл `for i := 0; i < len(transactions); i++` агрегує транзакції дня для друку чека на термопринтері.",
    },
  },

  "task-pos-interface-polymorphism": {
    taskId: "task-pos-interface-polymorphism",
    whyThisCode: {
      csharp:
        "Поліморфний платіжний шлюз: POS-термінал працює через універсальний інтерфейс `IPaymentGateway`. Конкретний шлюз `DankortGateway` викликається через метод `gateway.Charge(totalAmount)` без прив'язки до деталей банківського протоколу.",
      go:
        "Інтерфейс `IPaymentGateway` дозволяє підключати будь-яку банківську мережу (Dankort, Visa, MasterCard) без зміни ядра термінала.",
    },
    architectureMap: {
      contractFile: "src/Contracts/IPaymentGateway.cs",
      implementationFile: "src/Gateways/DankortGateway.cs",
      clientFile: "src/Services/PosTerminalService.cs",
      canvasNodeName: "IPaymentGateway (Acquiring Contract)",
      canvasWiring: "Шлюз еквайрингу підключається до системної плати термінала.",
      architectureHint:
        "Завдяки інтерфейсу платіжна система може замінити шлюз з Dankort на інший банк, не змінюючи код касового апарата.",
    },
  },

  "task-pos-dependency-injection": {
    taskId: "task-pos-dependency-injection",
    whyThisCode: {
      csharp:
        "Реєстрація платіжного сервісу в контейнері залежностей: `services.AddScoped<IPaymentGateway, DankortGateway>();`. Контейнер сам надасть потрібний шлюз на кожну фінансову сесію (Scoped Lifetime).",
      go:
        "Реєстрація шлюзу в IoC-контейнері: `container.Register(\"payment_gateway\", NewDankortGateway())`.",
    },
    architectureMap: {
      contractFile: "src/Contracts/IPaymentGateway.cs",
      implementationFile: "src/Gateways/DankortGateway.cs",
      clientFile: "src/Program.cs",
      canvasNodeName: "POS IoC Container",
      canvasWiring: "Реєстрація життєвого циклу платіжних сервісів у ядрі термінала.",
      architectureHint:
        "AddScoped створює екземпляр шлюзу один раз на сесію розрахунку, гарантуючи ізольованість фінансових транзакцій.",
    },
  },

  "task-debug-runaway-loop": {
    taskId: "task-debug-runaway-loop",
    whyThisCode: {
      csharp:
        "Діагностика нескінченного циклу (Infinite Loop): Замість декременту `ch--` необхідно використовувати інкремент `ch++`. Умова виходу `ch <= 5` вимагає зростання лічильника каналів. При декременті значення прямує до від'ємних чисел і цикл ніколи не завершується, викликаючи спрацювання апаратного Watchdog Timer.",
      go:
        "Виправлення кроку циклу: `for ch := 1; ch <= 5; ch++` замість `ch--`. При `ch--` інваріант циклу ніколи не стає хибним, що блокує горутину назавжди.",
    },
    primitiveMemoryNote: {
      csharp:
        "Змінна циклу `int ch` виділяється у Stack Frame поточного методу (4 байти). Спрацювання Watchdog Timer запобігає перегріву та 100% утилізації процесорного ядра.",
      go:
        "Змінна `ch` розміщується на стеку горутини. Безперервний цикл без точок перемикання (cooperative yield) призводить до монополізації процесорного потоку (thread starvation).",
    },
    architectureMap: {
      clientFile: "src/Tuner/FrequencyScanner.cs",
      canvasNodeName: "Tuner Watchdog & PLL Circuit",
      canvasWiring: "Контур сканування частот під'єднаний до модуля апаратного сторожового таймера.",
      architectureHint:
        "У комерційній розробці критично тестувати термінальні умови циклів (termination conditions), щоб не допускати блокування основного потоку інтерфейсу.",
    },
  },

  "task-debug-off-by-one-overflow": {
    taskId: "task-debug-off-by-one-overflow",
    whyThisCode: {
      csharp:
        "Захисна умова (Defensive Guard): Перед передачею значення у драйвер `tv.SetBrightness(requestedBrightness)` необхідно виконати перевірку `if (requestedBrightness <= 100)`. Запит 101% виходить за межі фізичної шкали [0..100] і призводить до спрацювання аварійного захисту (CATHODE_RAY_OVERLOAD).",
      go:
        "Перевірка діапазону (Boundary Check): `if requestedBrightness <= 100 { tv.SetBrightness(requestedBrightness) }`. Прямий запис невалідного числа в регістр спалює апаратний запобіжник.",
    },
    primitiveMemoryNote: {
      csharp:
        "Число `101` — це 32-бітний int. Незважаючи на те, що тип int вміщує числа до 2 мільярдів, фізичний апаратний інтерфейс випромінювача обмежений 8-бітним ЦАП (максимум 100 одиниць яскравості).",
      go:
        "Межі типів даних (Type Bounds) не тотожні фізичним межам пристрою (Hardware Invariants). Defensive programming вимагає валідації вхідних параметрів на рівні драйвера.",
    },
    architectureMap: {
      clientFile: "src/Drivers/CathodeRayTubeDriver.cs",
      canvasNodeName: "CRT High Voltage Safety Relay",
      canvasWiring: "Шина керування високою напругою кінескопа захищена термозапобіжником.",
      architectureHint:
        "Помилки валідації меж (Off-by-One та Missing Guards) є причиною 70% системних збоїв у вбудованих та авіаційних системах.",
    },
  },

  "task-pos-double-deduction-bug": {
    taskId: "task-pos-double-deduction-bug",
    whyThisCode: {
      csharp:
        "Усунення подвійної мутації стану (Double Mutation Bug): Рядок `balance -= fee;` є надлишковим і шкідливим, оскільки сума `totalAmount` вже була розрахована як `amount + fee`. Його видалення гарантує атомарне списання повної суми рівно один раз (`balance -= totalAmount;`).",
      go:
        "Ідемпотентність та єдине джерело істини: Видаляємо дубльоване списання `balance -= fee`. Баланс рахунку повинен мутувати лише один раз за транзакцію.",
    },
    primitiveMemoryNote: {
      csharp:
        "Поле `balance` представляє залишок на рахунку. Послідовне виконання двох операцій віднімання призводить до розбіжності фінансового балансу (Ledger Drift) на суму $10.00.",
      go:
        "Фінансові проводки повинні бути атомарними. Подвійне дебетування стану одного об'єкта порушує бухгалтерську рівновагу.",
    },
    architectureMap: {
      contractFile: "src/Accounting/ILedgerService.cs",
      implementationFile: "src/Accounting/LedgerService.cs",
      clientFile: "src/Pos/CashierSession.cs",
      canvasNodeName: "POS Ledger & Reconciliation Core",
      canvasWiring: "Транзакційне ядро зводить баланс журналу розрахунків.",
      architectureHint:
        "У фінансових та банківських системах будь-яка мутація балансу має супроводжуватися перевіркою інваріантів у єдиній транзакційній точці (Single Point of Mutation).",
    },
    curatedResources: [
      {
        title: "Payment Processing: Idempotency Keys and Double Mutation Prevention",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 14,
        whyRead: {
          ua: "Класична проблема подвійного списання у розподілених банках: як використовувати ідемпотентні ключі та атомарні транзакції для гарантії балансу.",
          en: "Classic double-charge bug in distributed banking: leveraging idempotency keys and atomic ledger mutations.",
          da: "Det klassiske dobbelttræk-problem i distribuerede betalingssystemer og idempotensnøgler.",
        },
      },
      {
        title: "ACID Transaction Guarantees & Isolation Levels in Distributed Ledgers",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/framework/data/transactions/",
        type: "documentation",
        targetGrade: "Senior",
        estimatedMinutes: 10,
        whyRead: {
          ua: "Атомарність та узгодженість (ACID) у .NET: чому мутація балансу має відбуватися строго в одній транзакційній точці.",
          en: "ACID guarantees and isolation levels: ensuring single-point-of-mutation for mission-critical account ledgers.",
          da: "ACID-garantier og isolationsniveauer: sikring af enkelt muteringspunkt i finansielle transaktioner.",
        },
      },
    ],
  },

  // ── Station 04: API Forge ──────────────────────────────────────────
  "task-api-1-heartbeat": {
    taskId: "task-api-1-heartbeat",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `app.MapGet` — реєструє маршрут для вхідного HTTP-методу GET.\n2. `\"/health\"` — адреса, за якою клієнт шукатиме сервіс.\n3. `() => Results.Ok(...)` — лямбда-функція, що повертає статус HTTP 200 OK з анонімним об'єктом `{ status = \"UP\", service = \"api-forge\" }`. Kestrel автоматично серіалізує цей об'єкт у формат JSON.",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. `http.HandleFunc` прив'язує функцію-обробник до маршруту `\"/health\"`.\n2. `w.Header().Set(\"Content-Type\", \"application/json\")` повідомляє клієнту, що тіло містить JSON.\n3. `w.WriteHeader(http.StatusOK)` відправляє статус 200 OK у сокет.\n4. `w.Write([]byte(...))` записує байти JSON у потік відповіді.",
    },
    primitiveMemoryNote: {
      csharp:
        "🌐 Мережевий пакет:\nМетод Results.Ok() упаковує відповідь у текстовий потік протоколу HTTP:\nHTTP/1.1 200 OK\\r\\nContent-Type: application/json\\r\\n\\r\\n{\"status\":\"UP\",\"service\":\"api-forge\"}\nКлієнт отримує цей потік байтів і розуміє, що бекенд готовий до роботи.",
      go:
        "🌐 Мережевий пакет:\nУ Go запис відбувається напряму у TCP сокет через `http.ResponseWriter`. Метод WriteHeader блокує подальшу зміну заголовків.",
    },
    architectureMap: {
      contractFile: "src/Contracts/IHealthCheck.cs",
      implementationFile: "src/Endpoints/HealthEndpoint.cs",
      clientFile: "src/Client/ApiDispatcher.cs",
      canvasNodeName: "API Gateway Kestrel Server",
      canvasWiring: "Маршрутизатор зіставляє HTTP GET /health із функцією-обробником.",
      architectureHint:
        "Healthcheck ендпоінти опитуються Kubernetes кожні 5-10 секунд для Liveness & Readiness проб.",
    },
    curatedResources: [
      {
        title: "RFC 9110: HTTP Semantics (Status Codes & Status 200 OK)",
        source: "RFC",
        url: "https://datatracker.ietf.org/doc/html/rfc9110",
        type: "rfc",
        targetGrade: "Junior",
        estimatedMinutes: 8,
        whyRead: {
          ua: "Офіційний стандарт IETF (RFC 9110): як клієнти та балансувальники навантаження інтерпретують статус 200 OK та структуру HTTP-відповідей.",
          en: "Official IETF standard: how clients, reverse proxies, and ingress controllers interpret HTTP 200 OK semantics.",
          da: "Officiel IETF standard: hvordan klienter og reverse proxies fortolker HTTP 200 OK.",
        },
      },
      {
        title: "Health Checks in ASP.NET Core and Kubernetes Liveness Probes",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 9,
        whyRead: {
          ua: "Як оркестратор Kubernetes використовує ендпоінти /healthz для перезапуску завислих контейнерів у хмарі.",
          en: "How Kubernetes orchestrators leverage /healthz endpoints for liveness and readiness probe decisions in production.",
          da: "Hvordan Kubernetes anvender /healthz endpoints til liveness- og readiness-prober.",
        },
      },
    ],
  },

  "task-api-2-path-params": {
    taskId: "task-api-2-path-params",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `\"/api/devices/{id}\"` — фрагмент `{id}` у фігурних дужках позначає динамічний параметр шляху.\n2. `(string id, IDeviceRepository repo)` — ASP.NET автоматично підставляє значення з URL у змінну `id`, а репозиторій інжектує через DI.\n3. `return device != null ? Results.Ok(device) : Results.NotFound(...)` — захисна умова (Guard Clause). Якщо ресурс відсутній, повертаємо 404 Not Found замість помилки сервера 500.",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. `strings.TrimPrefix(r.URL.Path, \"/api/devices/\")` витягує ідентифікатор пристрою з URL.\n2. `device, exists := repo.Find(id)` — перевірка наявності запису.\n3. `if !exists { http.Error(w, ..., http.StatusNotFound); return }` — негайне переривання виконання зі статусом 404.",
    },
    primitiveMemoryNote: {
      csharp:
        "Замість генерації NullReferenceException (що призвело б до падіння сервера 500 Internal Server Error), патерн 404 Guard повертає стандартизований статус клієнту.",
      go:
        "Завжди робіть `return` після `http.Error()`, інакше Go продовжить виконання функції і спробує відправити подвійну відповідь.",
    },
  },

  "task-api-3-dto-validation": {
    taskId: "task-api-3-dto-validation",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `app.MapPost(\"/api/orders\", ...)` — слухає HTTP POST запити на створення ресурсу.\n2. `CreateOrderDto dto` — Kestrel зчитує тіло запиту (Request Body) і перетворює JSON на C# об'єкт (Model Binding).\n3. `if (string.IsNullOrWhiteSpace(...) || dto.Quantity <= 0)` — валідація контракту. При порушенні повертаємо `Results.BadRequest()` (400).\n4. При успіху повертаємо `Results.Created($\"/api/orders/{order.Id}\", order)` (201 Created).",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. `json.NewDecoder(r.Body).Decode(&dto)` десеріалізує потік тіла запиту у структуру Go.\n2. Валідація: перевіряємо порожній рядок та кількість `dto.Quantity <= 0`. Повертаємо `http.StatusBadRequest` (400).\n3. При успіху створюємо сутність, пишемо `w.WriteHeader(http.StatusCreated)` (201) та серіалізуємо створений об'єкт.",
    },
    primitiveMemoryNote: {
      csharp:
        "Статус 201 Created сигналізує клієнту про створення нового ресурсу і повинен містити URL створеного ресурсу в заголовку Location або в тілі відповіді.",
      go:
        "Потік `r.Body` можна прочитати лише один раз (One-way Stream). Якщо його не прочитати або не закрити, можливий витік пам'яті (Memory Leak).",
    },
  },

  "task-api-4-bearer-auth": {
    taskId: "task-api-4-bearer-auth",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `context.Request.Headers.Authorization.ToString()` — зчитує заголовок авторизації з HTTP запиту.\n2. `if (!auth.StartsWith(\"Bearer forge-token-secure-99\"))` — перевіряє наявність схеми Bearer та валідного секретного токена.\n3. При відсутності або невалідності токена повертаємо `Results.Unauthorized()` (401) без виклику захищеної бізнес-логіки.",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. `r.Header.Get(\"Authorization\")` витягує рядок авторизаційного заголовка.\n2. `strings.HasPrefix(auth, \"Bearer forge-token-secure-99\")` перевіряє підпис.\n3. Якщо перевірка провалена, повертаємо `http.StatusUnauthorized` (401) і завершуємо виконання.",
    },
    primitiveMemoryNote: {
      csharp:
        "Заголовок `Authorization: Bearer <token>` передається у відкритому або TLS-шифрованому вигляді на кожному HTTP запиті (Stateless Auth).",
      go:
        "Схема Bearer означає, що пред'явник (bearer) токена має право доступу без збереження сесії на сервері.",
    },
    curatedResources: [
      {
        title: "RFC 6750: The OAuth 2.0 Authorization Framework - Bearer Token Usage",
        source: "RFC",
        url: "https://datatracker.ietf.org/doc/html/rfc6750",
        type: "rfc",
        targetGrade: "Middle",
        estimatedMinutes: 10,
        whyRead: {
          ua: "Глобальний стандарт RFC 6750: формат заголовка 'Authorization: Bearer <token>', захист від крадіжки токенів та правила повернення HTTP 401 Unauthorized.",
          en: "Global RFC 6750 standard: Bearer header syntax, threat model, and standard HTTP 401 Unauthorized challenge responses.",
          da: "Global RFC 6750 standard: Bearer header syntaks og HTTP 401 Unauthorized specifikation.",
        },
      },
      {
        title: "Overview of ASP.NET Core Authentication Middleware",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/aspnet/core/security/authentication/",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 9,
        whyRead: {
          ua: "Архітектура Authentication Middleware у Kestrel: як перевіряється підпис JWT без звернення до бази даних на кожному запиті (Stateless Auth).",
          en: "ASP.NET Core authentication pipeline: stateless cryptographically signed JWT validation without round-trips to the DB.",
          da: "ASP.NET Core middleware: stateless JWT validering uden unødvendige databasekald.",
        },
      },
    ],
  },

  "task-api-5-client-consumer": {
    taskId: "task-api-5-client-consumer",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `using var client = new HttpClient()` — створює екземпляр клієнта для вихідних запитів.\n2. `var response = await client.GetAsync(url)` — асинхронно відправляє GET запит до API сервера.\n3. `response.EnsureSuccessStatusCode()` — перевіряє що статус лежить у діапазоні 200..299. Якщо сервер повернув 404 або 500 — генерує помилку.\n4. `await response.Content.ReadFromJsonAsync<HealthDto>()` — десеріалізує JSON у строгий C# об'єкт.",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. `resp, err := http.Get(url)` робить вихідний HTTP виклик.\n2. `if err != nil || resp.StatusCode != http.StatusOK` — обов'язкова перевірка помилки та коду статусу.\n3. `defer resp.Body.Close()` — обов'язкове звільнення з'єднання після завершення читання.\n4. `json.NewDecoder(resp.Body).Decode(&health)` парсить JSON у Go структуру.",
    },
    primitiveMemoryNote: {
      csharp:
        "У продакшн .NET HttpClient створюється через IHttpClientFactory, щоб уникнути вичерпання сокетів (Socket Exhaustion).",
      go:
        "Якщо пропустити `defer resp.Body.Close()`, TCP з'єднання не повернеться у пул (Keep-Alive Pool), що заблокує мережеву підсистему.",
    },
  },

  "task-api-6-resilient-retry": {
    taskId: "task-api-6-resilient-retry",
    whyThisCode: {
      csharp:
        "👨‍🏫 Демонстрація вчителя:\n1. `for (int attempt = 1; attempt <= 3; attempt++)` — цикл із 3 спроб для боротьби з тимчасовими обривами мережі.\n2. `try { var res = await client.GetAsync(url); if (res.IsSuccessStatusCode) return; }` — спроба виконати запит.\n3. `catch (HttpRequestException) when (attempt < 3)` — перехоплюємо мережеві помилки і лише на останній спробі дозволяємо їм впасти.\n4. `await Task.Delay(100 * attempt)` — експоненційна затримка (Backoff), що дає мережі час відновитися.",
      go:
        "👨‍🏫 Демонстрація вчителя:\n1. Цикл `for attempt := 1; attempt <= 3; attempt++` обмежує кількість повторів.\n2. Якщо `err == nil && resp.StatusCode == http.StatusOK`, повертаємо результат.\n3. Інакше робимо паузу `time.Sleep(time.Duration(attempt * 100) * time.Millisecond)` перед наступною спробою.",
    },
    primitiveMemoryNote: {
      csharp:
        "Повтори без затримки (Immediate Retries) можуть створити шторм запитів (Retry Storm) і добити сервер, що відновлюється. Затримка згладжує навантаження.",
      go:
        "Патерн Exponential Backoff разом із Circuit Breaker є золотим стандартом надійності хмарних мікросервісів.",
    },
    curatedResources: [
      {
        title: "Exponential Backoff and Jitter in Distributed Microservices",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Чому негайні повторні запити вбивають упалий сервіс (Retry Storm), і як рандомізований jitter розсіює пікові сплески навантаження.",
          en: "Why immediate retries trigger devastating retry storms, and how randomized exponential jitter stabilizes struggling clusters.",
          da: "Hvorfor øjeblikkelige retries kan forårsage retry storms, og hvordan exponential jitter stabiliserer klynger.",
        },
      },
      {
        title: "Implement Resilient HTTP Applications with Polly and .NET",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/implement-resilient-applications/implement-http-call-retries-exponential-backoff-polly",
        type: "documentation",
        targetGrade: "Senior",
        estimatedMinutes: 11,
        whyRead: {
          ua: "Реалізація патернів Circuit Breaker та Retry за допомогою бібліотеки Polly: автоматичне розмикання ланцюга при збоях бекенду.",
          en: "Production implementation of Circuit Breaker and Retry policies using Polly to protect upstream dependencies.",
          da: "Produktionsimplementering af Circuit Breaker og Retry ved hjælp af Polly i .NET.",
        },
      },
    ],
  },

  // ── Station 05: Git Time Machine ──────────────────────────────────
  "task-git-1-genesis": {
    taskId: "task-git-1-genesis",
    whyThisCode: {
      csharp: "Виконання команд Git через Process.Start: індексування змін (git add) та створення кореневого коміту з криптографічним хешем SHA-1.",
      go: "Виклик exec.Command у Go для ініціалізації генезис-коміту телеметрії пристрою.",
    },
    curatedResources: [
      {
        title: "Git Internals - Plumbing and Porcelain: Objects, Trees, and Commits",
        source: "Go.dev",
        url: "https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain",
        type: "documentation",
        targetGrade: "Junior",
        estimatedMinutes: 10,
        whyRead: {
          ua: "Фундаментальна архітектура Git: як об'єкти blob, tree і commit зберігаються у сховищі контенту за хешами SHA-1 / SHA-256.",
          en: "Git internal architecture: how blob, tree, and commit objects are addressed in content-addressable storage.",
          da: "Git intern arkitektur: hvordan blob-, tree- og commit-objekter gemmes med kryptografiske hashes.",
        },
      },
    ],
  },

  "task-git-4-conflict": {
    taskId: "task-git-4-conflict",
    whyThisCode: {
      csharp: "Вирішення конфлікту злиття (Merge Conflict): інженер узгоджує дві конфліктуючі зміни в єдиний працездатний стан файлу.",
      go: "Усунення дивергенції гілок Git перед фінальним комітом злиття.",
    },
    curatedResources: [
      {
        title: "How Git Works Under the Hood: Directed Acyclic Graph (DAG) and 3-Way Merge",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Middle",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Математична модель Git (DAG): алгоритми 3-Way Merge, знаходження найближчого спільного предка (LCA) та природа конфліктів.",
          en: "Mathematical graph model of Git: DAG structure, 3-way merge heuristics, and lowest common ancestor detection.",
          da: "Matematisk grafmodel for Git: DAG-struktur, 3-vejs merge og løsning af modstridende ændringer.",
        },
      },
      {
        title: "Git Branching Strategies: Trunk-Based Development vs GitFlow",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/devops/develop/git/what-is-git",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 8,
        whyRead: {
          ua: "Офіційні рекомендації Microsoft DevOps: чому сучасні високоефективні команди переходять на Trunk-Based Development з короткими гілками.",
          en: "Microsoft DevOps recommendations: why high-performing teams adopt short-lived branches and Trunk-Based workflows.",
          da: "Microsoft DevOps anbefalinger: hvorfor moderne teams skifter til Trunk-Based Development.",
        },
      },
    ],
  },

  "task-git-5-rebase": {
    taskId: "task-git-5-rebase",
    whyThisCode: {
      csharp: "Операція git rebase пересаджує коміти поточної гілки поверх оновленого main, формуючи чисту лінійну історію без сміттєвих merge-комітів.",
      go: "Лінеаризація графа історії комітів за допомогою rebase.",
    },
    curatedResources: [
      {
        title: "Git Rebase vs Merge Workflow in Enterprise Teams",
        source: "Microsoft Learn",
        url: "https://learn.microsoft.com/en-us/devops/develop/git/merge-vs-rebase",
        type: "documentation",
        targetGrade: "Senior",
        estimatedMinutes: 9,
        whyRead: {
          ua: "Інженерні правила вибору між rebase та merge: захист публічних гілок та чистота бісект-пошуку багів (git bisect).",
          en: "Engineering trade-offs between rebase and merge: preserving public history vs keeping linear bisectable logs.",
          da: "Tekniske afvejninger mellem rebase og merge i professionelle udviklingsteams.",
        },
      },
    ],
  },

  // ── Station 06: Cyber Bandit (AppSec) ─────────────────────────────
  "task-bandit-4-sql-injection": {
    taskId: "task-bandit-4-sql-injection",
    whyThisCode: {
      csharp: "Захист від SQL Injection: заміна динамічної конкатенації рядків на параметризовані SQL-запити (Parameterized Queries).",
      go: "Використання параметризованих плейсхолдерів ($1, ?) для запобігання підміні синтаксичного дерева бази даних.",
    },
    curatedResources: [
      {
        title: "OWASP Top 10: SQL Injection Prevention Cheat Sheet",
        source: "OWASP",
        url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
        type: "standard",
        targetGrade: "Middle",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Еталонне керівництво OWASP з безпеки баз даних: чому параметризація гарантує, що база ніколи не виконає вхідні дані користувача як SQL-команду.",
          en: "Definitive OWASP cheat sheet: why parameterized queries guarantee user inputs cannot alter SQL AST structures.",
          da: "OWASP standardvejledning: hvorfor parametrering garanterer mod SQL-injektionsangreb.",
        },
      },
      {
        title: "NIST SP 800-53 Rev. 5: SI-10 Information Input Validation",
        source: "NIST",
        url: "https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final",
        type: "standard",
        targetGrade: "Senior",
        estimatedMinutes: 14,
        whyRead: {
          ua: "Федеральний стандарт безпеки NIST: сувора типізація, білі списки дозволених символів та ізоляція виконання небезпечних команд.",
          en: "NIST federal security controls: input validation, strict type enforcement, and execution boundaries.",
          da: "NIST sikkerhedsstandard: inputvalidering, stærk typisering og afskærmning af eksekveringsmiljøer.",
        },
      },
    ],
  },

  "task-bandit-5-rate-limiter": {
    taskId: "task-bandit-5-rate-limiter",
    whyThisCode: {
      csharp: "Впровадження алгоритму Token Bucket для захисту бекенду від DoS-атак та автоматизованого підбору паролів.",
      go: "Алгоритм обмеження частоти запитів через time.Ticker та буферизовані канали Go.",
    },
    curatedResources: [
      {
        title: "Design a Scalable Distributed Rate Limiter (Token Bucket Algorithm)",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 15,
        whyRead: {
          ua: "Архітектурний аналіз алгоритмів Rate Limiter (Token Bucket vs Leaky Bucket vs Sliding Window) з розподіленим кешем Redis.",
          en: "System design of distributed rate limiters using Redis token buckets and sliding window counters.",
          da: "Systemdesign af distribuerede rate limiters med Redis og token bucket algoritmer.",
        },
      },
      {
        title: "RFC 6585: Additional HTTP Status Codes - 429 Too Many Requests",
        source: "RFC",
        url: "https://datatracker.ietf.org/doc/html/rfc6585",
        type: "rfc",
        targetGrade: "Middle",
        estimatedMinutes: 6,
        whyRead: {
          ua: "Стандарт RFC 6585: семантика коду 429 та використання заголовка 'Retry-After' для чемного інформування клієнтів про час очікування.",
          en: "RFC 6585 specification of HTTP 429 and the Retry-After header for backpressure signaling.",
          da: "RFC 6585 specifikation for HTTP 429 og Retry-After header til regulering af klientforespørgsler.",
        },
      },
    ],
  },

  // ── Station 07: Vertex AI (ML Pipelines) ──────────────────────────
  "task-vertex-3-pipeline-yaml": {
    taskId: "task-vertex-3-pipeline-yaml",
    whyThisCode: {
      csharp: "Конфігурація декларативного ML пайплайну Kubeflow / Vertex AI Pipelines у форматі YAML.",
      go: "Декларативний опис кроків навчання та валідації моделі.",
    },
    curatedResources: [
      {
        title: "Vertex AI Pipelines: Kubeflow Pipeline Specifications & Artifact Tracking",
        source: "Google Cloud",
        url: "https://cloud.google.com/vertex-ai/docs/pipelines/introduction",
        type: "documentation",
        targetGrade: "Middle",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Офіційна документація Google Cloud: як Kubeflow запускає ізольовані контейнери, фіксує артефакти та версіонує моделі.",
          en: "Google Cloud official docs: running containerized pipeline components, tracking lineage, and artifact reproducibility.",
          da: "Google Cloud dokumentation for containeriserede Kubeflow komponenter og artefaktsporing.",
        },
      },
    ],
  },

  "task-vertex-13-drift-detection": {
    taskId: "task-vertex-13-drift-detection",
    whyThisCode: {
      csharp: "Моніторинг дрейфу даних (Data Drift): порівняння статистичного розподілу вхідних ознак у проді з навчальною вибіркою за метрикою L-Infinity.",
      go: "Виявлення відхилення розподілу ознак (Feature Skew) у режимі реального часу.",
    },
    curatedResources: [
      {
        title: "Vertex AI Model Monitoring: Feature Skew & Concept Drift Detection",
        source: "Google Cloud",
        url: "https://cloud.google.com/vertex-ai/docs/model-monitoring/overview",
        type: "documentation",
        targetGrade: "Senior",
        estimatedMinutes: 14,
        whyRead: {
          ua: "Як Google Cloud Model Monitoring автоматично б'є на сполох, коли поведінка користувачів змінюється, викликаючи деградацію точності моделі.",
          en: "How production model monitoring calculates Jensen-Shannon divergence to identify model degradation before outages occur.",
          da: "Hvordan automatisk modelovervågning registrerer konceptdrift og dataskew i produktion.",
        },
      },
    ],
  },

  // ── Station 08: Field AI Deployer (FDE) ───────────────────────────
  "task-fde-7-agent-architecture": {
    taskId: "task-fde-7-agent-architecture",
    whyThisCode: {
      csharp: "Архітектура автономного AI-агента: розбиття процесу на цикл сприйняття (Perception), планування (Planning) та виклику інструментів (Tool Calling).",
      go: "Оркестрація агентного циклу ReAct для безпечної взаємодії з API клієнта.",
    },
    curatedResources: [
      {
        title: "IBM Granite 3.0: Enterprise Agentic Architectures and Tool Calling",
        source: "IBM Granite",
        url: "https://www.ibm.com/granite",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 16,
        whyRead: {
          ua: "Архітектурний пейпер IBM Granite: побудова стійких агентних систем для корпоративних даних з мінімальним галюцинуванням.",
          en: "IBM Granite technical report: robust enterprise agent architectures with structured tool calling and guardrails.",
          da: "IBM Granite teknisk rapport om robuste agentarkitekturer til enterprise-systemer.",
        },
      },
      {
        title: "LLM Agent System Design: Planning, Memory, Tools",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 13,
        whyRead: {
          ua: "Системний дизайн агентів: як короткострокова і довгострокова пам'ять дозволяють LLM виконувати багатоетапні інженерні завдання.",
          en: "System design of agentic loops: memory management, reflection, and external tool execution patterns.",
          da: "Systemdesign af LLM-agenter: hukommelsesstyring og sikker integration med eksterne værktøjer.",
        },
      },
    ],
  },

  "task-fde-10-prompt-injection": {
    taskId: "task-fde-10-prompt-injection",
    whyThisCode: {
      csharp: "Захист від Prompt Injection: ізоляція системних інструкцій та валідація відповідей моделі перед передачею в базу даних.",
      go: "Фільтрація та семантичний аналіз запитів до LLM для запобігання взлому інструкцій.",
    },
    curatedResources: [
      {
        title: "OWASP Top 10 for LLM Applications: LLM01 Prompt Injection Defense",
        source: "OWASP",
        url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
        type: "standard",
        targetGrade: "Senior",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Офіційний каталог загроз безпеки штучного інтелекту OWASP: прямі та непрямі ін'єкції промптів та архітектурні бар'єри захисту (Guardrails).",
          en: "OWASP Top 10 for LLMs: direct and indirect prompt injection vectors, boundary enforcement, and guardrail layers.",
          da: "OWASP sikkerhedsstandard for LLM-applikationer: beskyttelse mod prompt injection og sikkerhedszoner.",
        },
      },
    ],
  },

  // ── Station 09: IBM RAG & Agentic AI ──────────────────────────────
  "task-rag-1-chunking-overlap": {
    taskId: "task-rag-1-chunking-overlap",
    whyThisCode: {
      csharp: "Розбиття тексту на чанки з перекриттям (Sliding Window Chunking) для збереження семантичного контексту на границях речень.",
      go: "Оптимальне сегментування документів для подальшої векторизації.",
    },
    curatedResources: [
      {
        title: "Optimal Chunking Strategies & Boundary Preservation in Enterprise RAG",
        source: "IBM Granite",
        url: "https://www.ibm.com/granite/docs",
        type: "architecture_paper",
        targetGrade: "Middle",
        estimatedMinutes: 11,
        whyRead: {
          ua: "Дослідження IBM Research: як розмір чанка та коефіцієнт перекриття (overlap ratio) впливають на точність пошуку відповідей у RAG-системах.",
          en: "IBM Research on text chunking trade-offs, semantic boundary preservation, and embedding retrieval fidelity.",
          da: "IBM forskning om tekst-chunking strategier og præcision i enterprise RAG-systemer.",
        },
      },
    ],
  },

  "task-rag-4-hybrid-rrf": {
    taskId: "task-rag-4-hybrid-rrf",
    whyThisCode: {
      csharp: "Гібридний пошук: об'єднання результатів повнотекстового пошуку (BM25) та векторного пошуку через алгоритм Reciprocal Rank Fusion (RRF).",
      go: "Ранжування документів за формулою RRF для досягнення максимальної релевантності.",
    },
    curatedResources: [
      {
        title: "Hybrid Search: Combining BM25 Keyword Search and Vector Embeddings via RRF",
        source: "ByteByteGo",
        url: "https://bytebytego.com",
        type: "architecture_paper",
        targetGrade: "Senior",
        estimatedMinutes: 14,
        whyRead: {
          ua: "Чому векторний пошук сам по собі пропускає точні терміни та серійні номери, і як RRF гармонійно поєднує BM25 з щільними ембеддінгами.",
          en: "Why vector retrieval alone fails on exact keywords, and how Reciprocal Rank Fusion fuses lexical and semantic rankings.",
          da: "Hvorfor hybrid søgning med BM25 og vektor-embeddings via RRF giver de mest præcise søgeresultater.",
        },
      },
    ],
  },

  // ── Station 10: Google Cybersecurity ──────────────────────────────
  "task-cyber-4-syn-flood-detector": {
    taskId: "task-cyber-4-syn-flood-detector",
    whyThisCode: {
      csharp: "Виявлення TCP SYN Flood атак: відстеження співвідношення незавершених рукостискань SYN-ACK та перевищення порогу черги беклогу.",
      go: "Детекція аномальних спалахів TCP SYN пакетів у сирому сокеті.",
    },
    curatedResources: [
      {
        title: "RFC 4987: TCP SYN Flooding Attacks and Common Mitigations (SYN Cookies)",
        source: "RFC",
        url: "https://datatracker.ietf.org/doc/html/rfc4987",
        type: "rfc",
        targetGrade: "Middle",
        estimatedMinutes: 12,
        whyRead: {
          ua: "Офіційний RFC 4987: механізм атаки на вичерпання черги TCP з'єднань та криптографічний захист за допомогою SYN Cookies.",
          en: "RFC 4987 specification: TCP connection queue exhaustion attacks and cryptographic SYN Cookie defenses.",
          da: "RFC 4987: TCP SYN Flood angrebsmekanisme og kryptografisk beskyttelse med SYN Cookies.",
        },
      },
      {
        title: "SYN Flood Attacks & TCP Handshake Mechanics",
        source: "Computerphile",
        url: "https://www.youtube.com/user/Computerphile",
        type: "video",
        targetGrade: "Junior",
        estimatedMinutes: 9,
        whyRead: {
          ua: "Наочний відеорозбір професорів комп'ютерних наук: як триетапне рукопотискання TCP (SYN, SYN-ACK, ACK) стає мішенню зловмисників.",
          en: "Clear video breakdown of TCP 3-way handshake vulnerability and kernel socket memory exhaustion.",
          da: "Pædagogisk gennemgang af 3-vejs TCP håndtryk og netværkssårbarheder.",
        },
      },
    ],
  },

  "task-cyber-8-nist-containment": {
    taskId: "task-cyber-8-nist-containment",
    whyThisCode: {
      csharp: "Реалізація фази локалізації загрози за стандартом NIST SP 800-61: ізоляція скомпрометованого вузла на рівні міжмережевого екрана.",
      go: "Блокування шкідливого трафіку та фіксація цифрових доказів у журналі інцидентів.",
    },
    curatedResources: [
      {
        title: "NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide",
        source: "NIST",
        url: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final",
        type: "standard",
        targetGrade: "Senior",
        estimatedMinutes: 18,
        whyRead: {
          ua: "Золотий стандарт реагування на кіберінциденти: 4 фази (Preparation -> Detection -> Containment/Eradication -> Post-Incident Analysis).",
          en: "The global gold standard in incident response: containment strategies, evidence preservation, and post-mortem analysis.",
          da: "Den globale guldstandard for hændelseshåndtering: 4 faser fra detektering til genetablering.",
        },
      },
    ],
  },
};

/**
 * Helper to retrieve didactic data for a task with fallback and language support
 */
export function getTaskDidacticInfo(
  taskId: string,
  lang: string = "ua"
): TaskDidacticInfo | undefined {
  const base = TASK_DIDACTIC_MAP[taskId];
  if (!base) return undefined;
  if (lang === "ua") return base;
  return getLocalizedTaskDidactic(base, taskId, lang);
}
