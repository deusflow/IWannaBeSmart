/**
 * @file apps/web/src/components/workbench/playground/taskDidacticContext.ts
 * @description Educational didactic data: ready reference code, memory allocation notes,
 *              project file hierarchy, and Architecture Canvas node mappings for all tasks.
 */

export interface SyntaxTokenItem {
  token: string;
  role: string;
  explanation: string;
}

export interface ArchitectureMapInfo {
  contractFile?: string;
  implementationFile?: string;
  clientFile?: string;
  canvasNodeName: string;
  canvasWiring: string;
  architectureHint: string;
}

export interface TaskDidacticInfo {
  taskId: string;
  whyThisCode: {
    csharp: string;
    go: string;
  };
  /** Deep explanation for primitive types (int vs string, memory allocation) */
  primitiveMemoryNote?: {
    csharp: string;
    go: string;
  };
  /** Project structure and Architecture Canvas mapping (Tier 2 / architecture tasks) */
  architectureMap?: ArchitectureMapInfo;
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
  },
};

/**
 * Helper to retrieve didactic data for a task with fallback
 */
export function getTaskDidacticInfo(taskId: string): TaskDidacticInfo | undefined {
  return TASK_DIDACTIC_MAP[taskId];
}
