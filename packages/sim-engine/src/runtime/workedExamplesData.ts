/**
 * @file packages/sim-engine/src/runtime/workedExamplesData.ts
 * @description Authentic Worked Examples repository for Gradual Release of Responsibility (GRR)
 * Across all stations: Smart TV, Fintech POS, API Forge, Git Time Machine, Cyber Bandit Lab.
 */

import type { WorkedExample } from "./types";

export const WORKED_EXAMPLES: Record<string, WorkedExample> = {
  // ══════════════════════════════════════════════════════════════════
  // STATION 01: SMART TV (tasks.ts)
  // ══════════════════════════════════════════════════════════════════
  "task-0-1-power-on": {
    sampleCode: {
      csharp: "tv.PowerOn();",
      go: "tv.PowerOn()",
    },
    demonstrationLog: {
      terminal: [
        "[HARDWARE] Power relay clicked: ON",
        "[CRT] Cathode filament preheat 6.3V OK",
        "[ANODE] High voltage stabilized at 25kV",
        "[DISPLAY] Phosphor raster initialized",
      ],
      hardwareEffect: "Реле живлення клацнуло, кінескоп засвітився м'яким синім світлом, подано анодну напругу 25 кВ.",
    },
    explanation: "Учитель викликає команду PowerOn() для замикання реле живлення та запуску катодно-променевої трубки телевізора.",
    clozeExercise: {
      csharp: "tv.___();",
      go: "tv.___()",
    },
    finalChallenge: {
      prompt: "Увімкніть живлення телевізора та одразу перемкніть його на 5-й канал: tv.SetChannel(5);",
      hint: "Спочатку викличте метод увімкнення живлення, а наступною інструкцією передайте номер потрібного каналу в метод вибору каналу.",
      targetCode: {
        csharp: "tv.PowerOn();\ntv.SetChannel(5);",
        go: "tv.PowerOn()\ntv.SetChannel(5)",
      },
    },
  },

  "task-0-2-types": {
    sampleCode: {
      csharp: "int channel = 7;\ntv.SetChannel(channel);",
      go: "var channel int = 7\ntv.SetChannel(channel)",
    },
    demonstrationLog: {
      terminal: [
        "[RAM] Allocated 32-bit signed integer 'channel' = 7",
        "[TUNER] PLL synthesizer locked on frequency 175.25 MHz",
        "[OSD] Channel '7' rendered on screen",
      ],
      hardwareEffect: "Тюнер налаштувався на частоту 175.25 МГц, на цифровому OSD індикаторі виведено канал 7.",
    },
    explanation: "Оголошуємо цілочисельну змінну channel типу int та передаємо її в метод тюнера для вибору частоти.",
    clozeExercise: {
      csharp: "int channel = ___;\ntv.SetChannel(___);",
      go: "var channel int = ___\ntv.SetChannel(___)",
    },
    finalChallenge: {
      prompt: "Оголосіть змінну targetChannel зі значенням 9 та перемкніть телевізор на цей канал.",
      hint: "Створіть цілочисельну змінну (int або := у Go), присвойте їй номер 9 і передайте її як аргумент у SetChannel.",
      targetCode: {
        csharp: "int targetChannel = 9;\ntv.SetChannel(targetChannel);",
        go: "var targetChannel int = 9\ntv.SetChannel(targetChannel)",
      },
    },
  },

  "task-0-3-sequential": {
    sampleCode: {
      csharp: "tv.PowerOn();\ntv.SetChannel(1);\ntv.SetVolume(25);",
      go: "tv.PowerOn()\ntv.SetChannel(1)\ntv.SetVolume(25)",
    },
    demonstrationLog: {
      terminal: [
        "[STEP 1] PowerOn -> Relay clicked",
        "[STEP 2] SetChannel(1) -> Tuner locked on 54.2 MHz",
        "[STEP 3] SetVolume(25) -> Audio amplifier DAC set to 25%",
      ],
      hardwareEffect: "Телевізор увімкнувся, обрав 1-й канал, динамік відтворив звук на комфортній гучності 25%.",
    },
    explanation: "Команди виконуються суворо послідовно зверху вниз: спочатку живлення, потім канал, і наостанок гучність.",
    clozeExercise: {
      csharp: "tv.PowerOn();\ntv.___(___);\ntv.___(___);",
      go: "tv.PowerOn()\ntv.___(___)\ntv.___(___)",
    },
    finalChallenge: {
      prompt: "Виконайте послідовність запуску: увімкніть ТБ, оберіть канал 3 та встановіть гучність 15.",
      hint: "Дотримуйтесь хронології операцій: спочатку подайте живлення, потім налаштуйте тюнер на канал, і на завершення задайте рівень звуку DAC.",
      targetCode: {
        csharp: "tv.PowerOn();\ntv.SetChannel(3);\ntv.SetVolume(15);",
        go: "tv.PowerOn()\ntv.SetChannel(3)\ntv.SetVolume(15)",
      },
    },
  },

  "task-1-assignment": {
    sampleCode: {
      csharp: "int volume = 50;\ntv.SetVolume(volume);",
      go: "var volume int = 50\ntv.SetVolume(volume)",
    },
    demonstrationLog: {
      terminal: [
        "[STACK] Variable 'volume' initialized with value 50",
        "[BUS] Writing 0x32 to DAC audio register",
        "[AUDIO] Speaker volume level: 50/100",
      ],
      hardwareEffect: "Аудіопідсилювач зафіксував гучність 50% без перевантаження звукового тракту.",
    },
    explanation: "Змінній volume присвоюється значення 50, після чого вона передається в аудіо-регістр підсилювача.",
    clozeExercise: {
      csharp: "int volume = ___;\ntv.SetVolume(___);",
      go: "var volume int = ___\ntv.SetVolume(___)",
    },
    finalChallenge: {
      prompt: "Присвойте змінній volume значення 60 та передайте її в tv.SetVolume.",
      hint: "Ініціалізуйте числову змінну для рівня звуку та передайте створений ідентифікатор у метод керування гучністю.",
      targetCode: {
        csharp: "int volume = 60;\ntv.SetVolume(volume);",
        go: "var volume int = 60\ntv.SetVolume(volume)",
      },
    },
  },

  "task-2-branching": {
    sampleCode: {
      csharp: "if (volume > 100) {\n    volume = 100;\n}\ntv.SetVolume(volume);",
      go: "if volume > 100 {\n    volume = 100\n}\ntv.SetVolume(volume)",
    },
    demonstrationLog: {
      terminal: [
        "[BRANCH] Evaluating volume > 100: True",
        "[OVERDRIVE_GUARD] Clamping volume to 100",
        "[DAC] Safe peak audio output locked at 100%",
      ],
      hardwareEffect: "Захист динаміків обмежив гучність на рівні 100%, усунувши ризик пошкодження дифузорів.",
    },
    explanation: "Умовний оператор if перевіряє безпечну межу: якщо гучність вища за 100, вона безпечно обмежується.",
    clozeExercise: {
      csharp: "if (volume > ___) {\n    volume = ___;\n}\ntv.SetVolume(volume);",
      go: "if volume > ___ {\n    volume = ___\n}\ntv.SetVolume(volume)",
    },
    finalChallenge: {
      prompt: "Напишіть перевірку нижньої межі: якщо volume < 0, встановіть volume = 0, а потім передайте в tv.SetVolume.",
      hint: "Використайте умовний оператор if для перевірки нижньої межі (менше нуля), скиньте змінну в нуль у тілі умови, а потім надішліть значення на пристрій.",
      targetCode: {
        csharp: "if (volume < 0) {\n    volume = 0;\n}\ntv.SetVolume(volume);",
        go: "if volume < 0 {\n    volume = 0\n}\ntv.SetVolume(volume)",
      },
    },
  },

  "task-variable-mutation": {
    sampleCode: {
      csharp: "int vol = 10;\nvol = vol + 5;\ntv.SetVolume(vol);",
      go: "vol := 10\nvol = vol + 5\ntv.SetVolume(vol)",
    },
    demonstrationLog: {
      terminal: [
        "[ALU] Read vol (10)",
        "[ALU] Add literal 5 -> Result: 15",
        "[RAM] Write 15 to address of vol",
        "[DAC] Volume smoothly transitioned to 15%",
      ],
      hardwareEffect: "Гучність плавно зросла з 10 до 15 завдяки повторному обчисленню значення змінної.",
    },
    explanation: "Вираз vol = vol + 5 зчитує поточне значення, додає 5 в арифметико-логічному пристрої (ALU) та зберігає назад.",
    clozeExercise: {
      csharp: "int vol = 10;\nvol = vol + ___;\ntv.SetVolume(vol);",
      go: "vol := 10\nvol = vol + ___\ntv.SetVolume(vol)",
    },
    finalChallenge: {
      prompt: "Оголосіть vol = 20, збільшіть його значення на 10 та передайте в tv.SetVolume.",
      hint: "Згадайте операцію мутації стану: прочитайте поточне значення змінної, додайте до нього дельту 10 і збережіть назад у ту саму змінну.",
      targetCode: {
        csharp: "int vol = 20;\nvol = vol + 10;\ntv.SetVolume(vol);",
        go: "vol := 20\nvol = vol + 10\ntv.SetVolume(vol)",
      },
    },
  },

  "task-boundary-guard": {
    sampleCode: {
      csharp: "if (channel < 1 || channel > 99) {\n    return;\n}\ntv.SetChannel(channel);",
      go: "if channel < 1 || channel > 99 {\n    return\n}\ntv.SetChannel(channel)",
    },
    demonstrationLog: {
      terminal: [
        "[GUARD] Checking channel bounds (1..99)",
        "[TUNER] Signal within acceptable frequency band",
        "[EEPROM] Channel state updated safely",
      ],
      hardwareEffect: "Захисний бар'єр (Guard Clause) перевірив діапазон тюнера та запобіг аварійній команді.",
    },
    explanation: "Guard Clause відсікає помилкові значення на самому початку методу через негайне повернення return.",
    clozeExercise: {
      csharp: "if (channel < ___ || channel > ___) {\n    return;\n}\ntv.SetChannel(channel);",
      go: "if channel < ___ || channel > ___ {\n    return\n}\ntv.SetChannel(channel)",
    },
    finalChallenge: {
      prompt: "Захистіть діапазон гучності: якщо volume < 0 або volume > 100, виконайте return. Інакше викличте tv.SetVolume(volume).",
      hint: "Застосуйте патерн Guard Clause з логічним оператором АБО (||) для одночасної перевірки обох екстремумів шкали перед викликом методу.",
      targetCode: {
        csharp: "if (volume < 0 || volume > 100) {\n    return;\n}\ntv.SetVolume(volume);",
        go: "if volume < 0 || volume > 100 {\n    return\n}\ntv.SetVolume(volume)",
      },
    },
  },

  "task-for-loop": {
    sampleCode: {
      csharp: "for (int i = 1; i <= 5; i++) {\n    tv.SetChannel(i);\n}",
      go: "for i := 1; i <= 5; i++ {\n    tv.SetChannel(i)\n}",
    },
    demonstrationLog: {
      terminal: [
        "[AUTOSCAN] Channel 1: locked",
        "[AUTOSCAN] Channel 2: locked",
        "[AUTOSCAN] Channel 3: locked",
        "[AUTOSCAN] Channel 4: locked",
        "[AUTOSCAN] Channel 5: locked",
      ],
      hardwareEffect: "Тюнер послідовно перемкнув сітку частот від 1 до 5 каналу в режимі автосканування.",
    },
    explanation: "Цикл for автоматизує багаторазове повторення дій, перебираючи лічильник i від 1 до 5 включно.",
    clozeExercise: {
      csharp: "for (int i = ___; i <= ___; i++) {\n    tv.SetChannel(i);\n}",
      go: "for i := ___; i <= ___; i++ {\n    tv.SetChannel(i)\n}",
    },
    finalChallenge: {
      prompt: "Напишіть цикл for для сканування каналів від 1 до 3.",
      hint: "Сконструюйте лічильник циклу з початковим індексом 1 і умовою продовження до 3 включно, передаючи поточну ітераційну змінну в тюнер.",
      targetCode: {
        csharp: "for (int i = 1; i <= 3; i++) {\n    tv.SetChannel(i);\n}",
        go: "for i := 1; i <= 3; i++ {\n    tv.SetChannel(i)\n}",
      },
    },
  },

  "task-class-instance": {
    sampleCode: {
      csharp: "TvController controller = new TvController();\ncontroller.TurnOn();",
      go: "controller := NewTvController()\ncontroller.TurnOn()",
    },
    demonstrationLog: {
      terminal: [
        "[HEAP] Allocated 32 bytes for TvController",
        "[CTOR] Initialized internal device references",
        "[DISPATCH] Called controller.TurnOn()",
      ],
      hardwareEffect: "Контролер створено в пам'яті (Heap), екран увімкнувся через інкапсульований метод.",
    },
    explanation: "Створюємо екземпляр класу оператором new та викликаємо його метод для керування пристроєм.",
    clozeExercise: {
      csharp: "TvController controller = new ___();\ncontroller.___();",
      go: "controller := ___()\ncontroller.___()",
    },
    finalChallenge: {
      prompt: "Створіть екземпляр AudioController та викличте його метод Mute().",
      hint: "Виділіть пам'ять під об'єкт аудіоконтролера за допомогою ключового слова new (або структури в Go) і зверніться до його методу вимкнення звуку через крапку.",
      targetCode: {
        csharp: "AudioController audio = new AudioController();\naudio.Mute();",
        go: "audio := NewAudioController()\naudio.Mute()",
      },
    },
  },

  "task-method-return": {
    sampleCode: {
      csharp: "bool hasSignal = tv.CheckSignal();\nif (hasSignal) {\n    tv.PowerOn();\n}",
      go: "hasSignal := tv.CheckSignal()\nif hasSignal {\n    tv.PowerOn()\n}",
    },
    demonstrationLog: {
      terminal: [
        "[RF_FRONTEND] Measuring carrier wave... 84 dB",
        "[METHOD] tv.CheckSignal() -> returned true",
        "[SYSTEM] Activating display tube",
      ],
      hardwareEffect: "Детектор антени підтвердив наявність телесигналу, дозволивши безпечний старт.",
    },
    explanation: "Метод повертає булеве значення (true/false), яке ми зберігаємо у змінну та використовуємо в умові if.",
    clozeExercise: {
      csharp: "bool hasSignal = tv.___();\nif (hasSignal) {\n    tv.PowerOn();\n}",
      go: "hasSignal := tv.___()\nif hasSignal {\n    tv.PowerOn()\n}",
    },
    finalChallenge: {
      prompt: "Отримайте результат tv.IsMuted() у змінну isMuted, і якщо вона true — викличте tv.Unmute().",
      hint: "Збережіть булевий результат опитування пристрою в локальну змінну та виконайте команду ввімкнення звуку тільки якщо прапорець істинний.",
      targetCode: {
        csharp: "bool isMuted = tv.IsMuted();\nif (isMuted) {\n    tv.Unmute();\n}",
        go: "isMuted := tv.IsMuted()\nif isMuted {\n    tv.Unmute()\n}",
      },
    },
  },

  "task-null-reference": {
    sampleCode: {
      csharp: "if (remote != null) {\n    remote.PressPower();\n}",
      go: "if remote != nil {\n    remote.PressPower()\n}",
    },
    demonstrationLog: {
      terminal: [
        "[POINTER] Checking memory pointer remote != null",
        "[ADDRESS] Valid object at 0x7FFF8C20",
        "[IR_SENSOR] Power key packet decoded",
      ],
      hardwareEffect: "Перевірка вказівника на null усунула ризик аварійного завершення програми (NullReferenceException).",
    },
    explanation: "Завжди перевіряємо, чи вказівник на об'єкт не порожній (не null/nil), перед зверненням до його методів.",
    clozeExercise: {
      csharp: "if (remote != ___) {\n    remote.___();\n}",
      go: "if remote != ___ {\n    remote.___()\n}",
    },
    finalChallenge: {
      prompt: "Додайте захисну перевірку: якщо antenna != null, викличте antenna.Connect().",
      hint: "Захистіть виконання від NullReferenceException: обгорніть звернення до антени в перевірку існування посилання (нерівність null у C# або nil у Go).",
      targetCode: {
        csharp: "if (antenna != null) {\n    antenna.Connect();\n}",
        go: "if antenna != nil {\n    antenna.Connect()\n}",
      },
    },
  },

  "task-function-encapsulation": {
    sampleCode: {
      csharp: "void BoostVolume(SmartTv t) {\n    t.SetVolume(t.GetVolume() + 10);\n}",
      go: "func BoostVolume(t *SmartTv) {\n    t.SetVolume(t.GetVolume() + 10)\n}",
    },
    demonstrationLog: {
      terminal: [
        "[CALL] Invoking BoostVolume helper function",
        "[STACK] Parameter 't' passed by reference",
        "[DAC] Volume register stepped up by +10%",
      ],
      hardwareEffect: "Інкапсульована функція перевикористала логіку крокового підвищення гучності без дублювання коду.",
    },
    explanation: "Інкапсулюємо повторювану логіку в окрему функцію, яка приймає телевізор як параметр.",
    clozeExercise: {
      csharp: "void BoostVolume(SmartTv t) {\n    t.SetVolume(t.___() + ___);\n}",
      go: "func BoostVolume(t *SmartTv) {\n    t.SetVolume(t.___() + ___)\n}",
    },
    finalChallenge: {
      prompt: "Створіть функцію ResetTv(SmartTv t), яка встановлює канал 1 та гучність 20.",
      hint: "Оголосіть метод з типом повернення void (або func у Go), який приймає екземпляр телевізора як параметр і всередині викликає два методи налаштування.",
      targetCode: {
        csharp: "void ResetTv(SmartTv t) {\n    t.SetChannel(1);\n    t.SetVolume(20);\n}",
        go: "func ResetTv(t *SmartTv) {\n    t.SetChannel(1)\n    t.SetVolume(20)\n}",
      },
    },
  },

  "task-antipattern-god-object": {
    sampleCode: {
      csharp: "tuner.SetFrequency(175.25);\naudio.SetGain(40);\npower.EnableRails();",
      go: "tuner.SetFrequency(175.25)\naudio.SetGain(40)\npower.EnableRails()",
    },
    demonstrationLog: {
      terminal: [
        "[DECOUPLING] Subsystems separated: Tuner, Audio, Power",
        "[SRP] Each module handles single hardware responsibility",
        "[SYS] Telemetry bus synchronized cleanly",
      ],
      hardwareEffect: "Замість громіздкого God Object кожна підсистема незалежно керує своєю мікросхемою.",
    },
    explanation: "Розділяємо обов'язки за принципом Single Responsibility (SRP), замінюючи один перевантажений об'єкт на спеціалізовані модулі.",
    clozeExercise: {
      csharp: "tuner.___(___);\naudio.___(___);\npower.EnableRails();",
      go: "tuner.___(___)\naudio.___(___)\npower.EnableRails()",
    },
    finalChallenge: {
      prompt: "Викличте audio.Mute() та tuner.Reset() для роздільного скидання налаштувань відповідних модулів.",
      hint: "Принцип Single Responsibility: замість монолітного телевізора викличте відповідні методи у профільних декомпонованих підсистемах звуку та тюнера.",
      targetCode: {
        csharp: "audio.Mute();\ntuner.Reset();",
        go: "audio.Mute()\ntuner.Reset()",
      },
    },
  },

  "task-interface-polymorphism": {
    sampleCode: {
      csharp: "ITvDevice device = new SmartTv();\ndevice.PowerOn();\ndevice.SetChannel(1);",
      go: "var device TvDevice = &SmartTv{}\ndevice.PowerOn()\ndevice.SetChannel(1)",
    },
    demonstrationLog: {
      terminal: [
        "[POLYMORPHISM] ITvDevice contract bound to SmartTv chassis",
        "[DISPATCH] Virtual call table resolved: PowerOn() -> 24V bus active",
        "[OSD] Channel 1 tuned via polymorphic interface",
      ],
      hardwareEffect: "Інтерфейс ITvDevice поліморфно передав команди увімкнення та вибору каналу фізичному телевізору.",
    },
    explanation: "Поліморфізм інтерфейсів дозволяє викликати спільні методи пристрою (PowerOn, SetChannel), не прив'язуючись до конкретної апаратної моделі.",
    clozeExercise: {
      csharp: "ITvDevice device = new ___();\ndevice.___();\ndevice.SetChannel(___);",
      go: "var device TvDevice = &____{}\ndevice.___()\ndevice.SetChannel(___)",
    },
    finalChallenge: {
      prompt: "Оголосіть ITvDevice device = new RetroTv(); та викличте device.PowerOn();",
      hint: "Поліморфне зв'язування: типом змінної вкажіть спільний інтерфейс пристрою, а праворуч від оператора присвоєння створіть конкретну ретро-реалізацію.",
      targetCode: {
        csharp: "ITvDevice device = new RetroTv();\ndevice.PowerOn();",
        go: "var device TvDevice = &RetroTv{}\ndevice.PowerOn()",
      },
    },
  },

  "task-di-container": {
    sampleCode: {
      csharp: "container.Register<ITuner, PllTuner>();\ncontainer.Register<ITv, SmartTv>();\nvar tv = container.Resolve<ITv>();",
      go: "container.Register(func() Tuner { return NewPllTuner() })\ncontainer.Register(func() Tv { return NewSmartTv() })\ntv := container.ResolveTv()",
    },
    demonstrationLog: {
      terminal: [
        "[IoC] Container registered ITuner -> PllTuner (RF Synthesizer)",
        "[IoC] Container registered ITv -> SmartTv",
        "[IoC] Resolved SmartTv with autowired PllTuner dependency",
      ],
      hardwareEffect: "Контейнер залежностей автоматично під'єднав синтезатор частот тюнера до головного модуля телевізора.",
    },
    explanation: "Контейнер інверсії керування (IoC) реєструє компоненти та автоматично впроваджує залежності (Dependency Injection).",
    clozeExercise: {
      csharp: "container.Register<ITuner, ___>();\ncontainer.Register<ITv, ___>();\nvar tv = container.Resolve<___>();",
      go: "container.Register(func() Tuner { return ___() })\ncontainer.Register(func() Tv { return ___() })\ntv := container.ResolveTv()",
    },
    finalChallenge: {
      prompt: "Зареєструйте IAudioDac з класом StereoDac: container.Register<IAudioDac, StereoDac>();",
      hint: "У механізмі Dependency Injection зв'яжіть інтерфейс аудіодекодера з його конкретною стерео-імплементацією за допомогою методу реєстрації контейнера.",
      targetCode: {
        csharp: "container.Register<IAudioDac, StereoDac>();",
        go: "container.Register(func() AudioDac { return NewStereoDac() })",
      },
    },
  },

  "task-command-registry": {
    sampleCode: {
      csharp: "registry.Register(\"power\", new PowerOnCommand(tv));\nregistry.Execute(\"power\");",
      go: "registry.Register(\"power\", NewPowerCommand(tv))\nregistry.Execute(\"power\")",
    },
    demonstrationLog: {
      terminal: [
        "[REGISTRY] Command mapped: 'power' -> PowerOnCommand",
        "[DISPATCH] Executing command 'power' via registry",
        "[HARDWARE] PowerOnCommand invoked tv.PowerOn()",
      ],
      hardwareEffect: "Реєстр команд інкапсулював дію пульта дистанційного керування та передав сигнал на ввімкнення живлення.",
    },
    explanation: "Патерн Command реєструє операції у вигляді об'єктів або функцій, дозволяючи викликати їх за текстовою назвою чи кнопкою пульта.",
    clozeExercise: {
      csharp: "registry.Register(\"___\", new PowerOnCommand(tv));\nregistry.Execute(\"___\");",
      go: "registry.Register(\"___\", NewPowerCommand(tv))\nregistry.Execute(\"___\")",
    },
    finalChallenge: {
      prompt: "Зареєструйте команду \"mute\" з MuteCommand(tv) та виконайте registry.Execute(\"mute\");",
      hint: "Патерн Command: збережіть екземпляр об'єкта команди під рядковим ідентифікатором у реєстрі, після чого запустіть її за цим же ключем.",
      targetCode: {
        csharp: "registry.Register(\"mute\", new MuteCommand(tv));\nregistry.Execute(\"mute\");",
        go: "registry.Register(\"mute\", NewMuteCommand(tv))\nregistry.Execute(\"mute\")",
      },
    },
  },

  "task-debug-runaway-loop": {
    sampleCode: {
      csharp: "for (int i = 0; i < 5; i++) {\n    tv.VolumeUp();\n}",
      go: "for i := 0; i < 5; i++ {\n    tv.VolumeUp()\n}",
    },
    demonstrationLog: {
      terminal: [
        "[WATCHDOG] Loop iteration: 0..4 (bounded)",
        "[AUDIO_DAC] Step volume increase +5 units",
        "[SAFE] Loop terminated successfully without CPU freeze",
      ],
      hardwareEffect: "Звуковий підсилювач плавно підвищив гучність на 5 одиниць без зависання процесора телевізора.",
    },
    explanation: "Усуваємо нескінченний цикл, додаючи чітку умову виходу та інкремент лічильника (i < 5; i++), щоб процесор не зависав на 100%.",
    clozeExercise: {
      csharp: "for (int i = 0; i < ___; ___) {\n    tv.VolumeUp();\n}",
      go: "for i := 0; i < ___; ___ {\n    tv.VolumeUp()\n}",
    },
    finalChallenge: {
      prompt: "Створіть безпечний цикл на 3 ітерації для виклику tv.ChannelUp(): for (int i = 0; i < 3; i++) { tv.ChannelUp(); }",
      hint: "Переконайтеся, що секція оновлення лічильника у заголовку циклу обов'язково містить крок збільшення індексу, щоб запобігти нескінченному зависанню.",
      targetCode: {
        csharp: "for (int i = 0; i < 3; i++)\n{\n    tv.ChannelUp();\n}",
        go: "for i := 0; i < 3; i++ {\n    tv.ChannelUp()\n}",
      },
    },
  },

  "task-debug-off-by-one-overflow": {
    sampleCode: {
      csharp: "int[] channels = { 1, 2, 3 };\nfor (int i = 0; i < channels.Length; i++) {\n    tv.SetChannel(channels[i]);\n}",
      go: "channels := []int{1, 2, 3}\nfor i := 0; i < len(channels); i++ {\n    tv.SetChannel(channels[i])\n}",
    },
    demonstrationLog: {
      terminal: [
        "[INDEX_CHECK] Array bounds: length=3, valid indices: 0..2",
        "[PROTECTION] Iteration strictly stops before index 3",
        "[NO_FAULT] IndexOutOfRangeException prevented",
      ],
      hardwareEffect: "Тюнер послідовно перемкнув канали 1, 2, 3 без апаратного збою адресного простору пам'яті.",
    },
    explanation: "Помилка Off-by-One виникає при використанні <= замість <. Використовуємо i < channels.Length, щоб не вийти за межі масиву.",
    clozeExercise: {
      csharp: "for (int i = 0; i < channels.___; i++) {\n    tv.SetChannel(channels[___]);\n}",
      go: "for i := 0; i < len(channels); i++ {\n    tv.SetChannel(channels[___])\n}",
    },
    finalChallenge: {
      prompt: "Обійдіть масив frequencies розміром 4 елементи з правильною умовою i < frequencies.Length: for (int i = 0; i < frequencies.Length; i++) { tv.SetFrequency(frequencies[i]); }",
      hint: "Щоб уникнути IndexOutOfRangeException, використовуйте строгу нерівність менше відносно довжини колекції (оскільки індексація починається з 0).",
      targetCode: {
        csharp: "for (int i = 0; i < frequencies.Length; i++)\n{\n    tv.SetFrequency(frequencies[i]);\n}",
        go: "for i := 0; i < len(frequencies); i++ {\n    tv.SetFrequency(frequencies[i])\n}",
      },
    },
  },


  // ══════════════════════════════════════════════════════════════════
  // STATION 02: FINTECH POS (tasks-fintech.ts)
  // ══════════════════════════════════════════════════════════════════
  "task-pos-guard-clause": {
    sampleCode: {
      csharp: "if (amount > balance) {\n    status = \"DECLINED\";\n    return;\n}",
      go: "if amount > balance {\n    status = \"DECLINED\"\n    return\n}",
    },
    demonstrationLog: {
      terminal: [
        "[EMV_CORE] Auth request: amount=$750.00, balance=$500.00",
        "[LEDGER_GUARD] Insufficient funds guard triggered",
        "[ISO_8583] Response code 51: DECLINED",
      ],
      hardwareEffect: "Екран терміналу засвітився червоним: ТРАНЗАКЦІЮ ВІДХИЛЕНО. Недостатньо коштів на рахунку.",
    },
    explanation: "Guard Clause негайно зупиняє проведення транзакції, якщо запитувана сума перевищує залишок на рахунку.",
    clozeExercise: {
      csharp: "if (___ > ___) {\n    status = \"___\";\n    return;\n}",
      go: "if ___ > ___ {\n    status = \"___\"\n    return\n}",
    },
    finalChallenge: {
      prompt: "Перевірка ліміту: якщо сума транзакції перевищує 500 (amount > 500), встановіть status = \"DECLINED\" та виконайте return.",
      hint: "Захистіть термінал на вході: перевірте ліміт безконтактної оплати і достроково перервіть обробку через return зі статусом відмови.",
      targetCode: {
        csharp: "if (amount > 500) {\n    status = \"DECLINED\";\n    return;\n}",
        go: "if amount > 500 {\n    status = \"DECLINED\"\n    return\n}",
      },
    },
  },

  "task-pos-fee-calculation": {
    sampleCode: {
      csharp: "decimal fee = amount * 0.015m + 0.20m;\ndecimal total = amount + fee;\nstatus = \"APPROVED\";",
      go: "fee := amount*0.015 + 0.20\ntotal := amount + fee\nstatus = \"APPROVED\"",
    },
    demonstrationLog: {
      terminal: [
        "[INTERCHANGE] Base amount: $100.00",
        "[ACQUIRING_FEE] Calculated fee (1.5% + $0.20): $1.70",
        "[SETTLEMENT] Total billed: $101.70. Status: APPROVED",
      ],
      hardwareEffect: "Термінал видрукував чек із комісією еквайрингу $1.70 та успішно схвалив операцію.",
    },
    explanation: "Розраховуємо комісію еквайра (1.5% плюс фіксовані 20 центів) і формуємо підсумкову суму до списання.",
    clozeExercise: {
      csharp: "decimal fee = amount * ___ + ___;\ndecimal total = amount + fee;\nstatus = \"___\";",
      go: "fee := amount*___ + ___\ntotal := amount + fee\nstatus = \"___\"",
    },
    finalChallenge: {
      prompt: "Обчисліть комісію за пільговим тарифом: 1% (0.01) + 0.10 фіксовано, встановіть status = \"APPROVED\".",
      hint: "Для фінансових обчислень обов'язково використовуйте тип decimal з постфіксом m, обчисліть відсоткову та фіксовану частини й оновіть статус операції.",
      targetCode: {
        csharp: "decimal fee = amount * 0.01m + 0.10m;\ndecimal total = amount + fee;\nstatus = \"APPROVED\";",
        go: "fee := amount*0.01 + 0.10\ntotal := amount + fee\nstatus = \"APPROVED\"",
      },
    },
  },

  "task-pos-pin-lockout": {
    sampleCode: {
      csharp: "if (pinAttempts >= 3) {\n    isLocked = true;\n    status = \"BLOCKED\";\n    return;\n}",
      go: "if pinAttempts >= 3 {\n    isLocked = true\n    status = \"BLOCKED\"\n    return\n}",
    },
    demonstrationLog: {
      terminal: [
        "[PINPAD] Consecutive invalid attempts: 3",
        "[SECURITY_MODULE] Tamper lockout activated",
        "[ALERT] Card session blocked for 24h",
      ],
      hardwareEffect: "Пінпад заблокував введення, пролунав звуковий сигнал тривоги, картку заблоковано.",
    },
    explanation: "Після трьох невірних спроб вводу PIN система безпеки блокує термінал для захисту від підбору коду.",
    clozeExercise: {
      csharp: "if (pinAttempts >= ___) {\n    isLocked = ___;\n    status = \"___\";\n    return;\n}",
      go: "if pinAttempts >= ___ {\n    isLocked = ___\n    status = \"___\"\n    return\n}",
    },
    finalChallenge: {
      prompt: "Встановіть ліміт блокування після 5 спроб: якщо pinAttempts >= 5, встановіть isLocked = true та status = \"BLOCKED\".",
      hint: "Реалізуйте апаратне блокування: перевірте лічильник невдалих спроб проти порогу безпеки, переведіть термінал у захищений стан і зупиніть сесію.",
      targetCode: {
        csharp: "if (pinAttempts >= 5) {\n    isLocked = true;\n    status = \"BLOCKED\";\n    return;\n}",
        go: "if pinAttempts >= 5 {\n    isLocked = true\n    status = \"BLOCKED\"\n    return\n}",
      },
    },
  },

  "task-pos-batch-settlement": {
    sampleCode: {
      csharp: "decimal batchSum = 0m;\nforeach (var tx in batch) {\n    if (tx.Approved) batchSum += tx.Amount;\n}\nsendSettlement(batchSum);",
      go: "var batchSum float64 = 0\nfor _, tx := range batch {\n    if tx.Approved {\n        batchSum += tx.Amount\n    }\n}\nsendSettlement(batchSum)",
    },
    demonstrationLog: {
      terminal: [
        "[RECONCILIATION] Aggregating daily transaction records",
        "[BATCH_TOTAL] 14 approved payments reconciled: $3,450.00",
        "[ISO_8583] End-of-day batch settlement uploaded to host",
      ],
      hardwareEffect: "Пакет транзакцій за зміну звірено та надіслано до процесингового центру банку.",
    },
    explanation: "У циклі підсумовуємо всі схвалені за день транзакції для проведення вечірнього клірингу (Batch Settlement).",
    clozeExercise: {
      csharp: "decimal batchSum = 0m;\nforeach (var tx in batch) {\n    if (tx.___) batchSum += tx.___;\n}\nsendSettlement(batchSum);",
      go: "var batchSum float64 = 0\nfor _, tx := range batch {\n    if tx.___ {\n        batchSum += tx.___\n    }\n}\nsendSettlement(batchSum)",
    },
    finalChallenge: {
      prompt: "Підрахуйте кількість схвалених транзакцій (int count = 0), перебираючи batch, та викличте sendCount(count).",
      hint: "Пройдіться ітератором по списку транзакцій, збільшуйте лічильник тільки для підтверджених записів, а підсумкове число відправте на сервер клірингу.",
      targetCode: {
        csharp: "int count = 0;\nforeach (var tx in batch) {\n    if (tx.Approved) count++;\n}\nsendCount(count);",
        go: "count := 0\nfor _, tx := range batch {\n    if tx.Approved {\n        count++\n    }\n}\nsendCount(count)",
      },
    },
  },

  "task-pos-interface-polymorphism": {
    sampleCode: {
      csharp: "IPaymentGateway gateway = new StripeGateway();\ngateway.ProcessPayment(order.Amount);",
      go: "var gateway PaymentGateway = &StripeGateway{}\ngateway.ProcessPayment(order.Amount)",
    },
    demonstrationLog: {
      terminal: [
        "[POLYMORPHISM] Dispatched via IPaymentGateway contract",
        "[DRIVER] StripeGateway.ProcessPayment invoked ($45.00)",
        "[STATUS] 200 OK from payment processor",
      ],
      hardwareEffect: "Платіж проведено через адаптер Stripe завдяки поліморфізму інтерфейсу.",
    },
    explanation: "Використання інтерфейсу IPaymentGateway дозволяє легко замінювати платіжні шлюзи без зміни бізнес-логіки.",
    clozeExercise: {
      csharp: "IPaymentGateway gateway = new ___();\ngateway.___(___);",
      go: "var gateway PaymentGateway = &____{}\ngateway.___(___)",
    },
    finalChallenge: {
      prompt: "Підключіть VisaDirectGateway через інтерфейс IPaymentGateway та викличте gateway.ProcessPayment(150.00m).",
      hint: "Відокремте бізнес-логіку від конкретного банку-еквайєра: визначте тип змінної через спільний контракт платіжного шлюзу та передайте суму у виклик процесингу.",
      targetCode: {
        csharp: "IPaymentGateway gateway = new VisaDirectGateway();\ngateway.ProcessPayment(150.00m);",
        go: "var gateway PaymentGateway = &VisaDirectGateway{}\ngateway.ProcessPayment(150.0)",
      },
    },
  },

  "task-pos-dependency-injection": {
    sampleCode: {
      csharp: "builder.Services.AddSingleton<IPosTerminal, VerifoneTerminal>();\nbuilder.Services.AddScoped<CheckoutService>();",
      go: "container.RegisterSingleton(func() PosTerminal { return NewVerifoneTerminal() })\ncontainer.RegisterScoped(NewCheckoutService)",
    },
    demonstrationLog: {
      terminal: [
        "[IoC] Registered IPosTerminal -> VerifoneTerminal (Singleton)",
        "[IoC] Registered CheckoutService (Scoped)",
        "[CONTAINER] Dependencies resolved and validated successfully",
      ],
      hardwareEffect: "IoC-контейнер зв'язав інтерфейс терміналу з фізичним драйвером Verifone.",
    },
    explanation: "Реєструємо абстракції та служби в контейнері впровадження залежностей (Dependency Injection).",
    clozeExercise: {
      csharp: "builder.Services.___<IPosTerminal, VerifoneTerminal>();\nbuilder.Services.___<CheckoutService>();",
      go: "container.___(func() PosTerminal { return NewVerifoneTerminal() })\ncontainer.___(NewCheckoutService)",
    },
    finalChallenge: {
      prompt: "Зареєструйте IReceiptPrinter як Singleton реалізацію ThermalPrinter: AddSingleton<IReceiptPrinter, ThermalPrinter>().",
      hint: "Зверніться до колекції сервісів хоста та зареєструйте життєвий цикл Singleton, передавши інтерфейс принтера та його конкретний драйвер у generic-параметрах.",
      targetCode: {
        csharp: "builder.Services.AddSingleton<IReceiptPrinter, ThermalPrinter>();",
        go: "container.RegisterSingleton(func() ReceiptPrinter { return NewThermalPrinter() })",
      },
    },
  },

  "task-pos-double-deduction-bug": {
    sampleCode: {
      csharp: "if (processedIds.Contains(tx.IdempotencyKey)) {\n    return tx.PreviousResult;\n}\nprocessedIds.Add(tx.IdempotencyKey);\nExecuteDeduction(tx);",
      go: "if processedIds[tx.IdempotencyKey] {\n    return tx.PreviousResult\n}\nprocessedIds[tx.IdempotencyKey] = true\nExecuteDeduction(tx)",
    },
    demonstrationLog: {
      terminal: [
        "[IDEMPOTENCY] Checking key: 'idem_9921_beta'",
        "[CACHE] Duplicate network replay detected",
        "[SAFE_GUARD] Suppressed second deduction! Returning cached receipt",
      ],
      hardwareEffect: "Захист від дублювання зберіг кошти клієнта: повторний запит через збій зв'язку не призвів до подвійного списання.",
    },
    explanation: "Ключ ідемпотентності запобігає повторному списанню коштів при повторних запитах від ненадійної мережі.",
    clozeExercise: {
      csharp: "if (processedIds.Contains(tx.___)) {\n    return tx.PreviousResult;\n}\nprocessedIds.Add(tx.___ );\nExecuteDeduction(tx);",
      go: "if processedIds[tx.___] {\n    return tx.PreviousResult\n}\nprocessedIds[tx.___] = true\nExecuteDeduction(tx)",
    },
    finalChallenge: {
      prompt: "Перевірте наявність duplicateCache.Has(tx.Key), і якщо true — виконайте return. Інакше викличте duplicateCache.Save(tx.Key).",
      hint: "Ідемпотентність платежів: перевірте наявність унікального ключа операції в сховищі дублікатів перед списанням, і лише за відсутності зафіксуйте новий ключ.",
      targetCode: {
        csharp: "if (duplicateCache.Has(tx.Key)) {\n    return;\n}\nduplicateCache.Save(tx.Key);",
        go: "if duplicateCache.Has(tx.Key) {\n    return\n}\nduplicateCache.Save(tx.Key)",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // STATION 04: API FORGE (tasks-api.ts)
  // ══════════════════════════════════════════════════════════════════
  "task-api-1-heartbeat": {
    sampleCode: {
      csharp: "app.MapGet(\"/health\", () => Results.Ok(new { status = \"UP\", service = \"api-forge\" }));",
      go: "http.HandleFunc(\"/health\", func(w http.ResponseWriter, r *http.Request) {\n    w.Header().Set(\"Content-Type\", \"application/json\")\n    w.WriteHeader(http.StatusOK)\n    w.Write([]byte(`{\"status\":\"UP\",\"service\":\"api-forge\"}`))\n})",
    },
    demonstrationLog: {
      terminal: [
        "[KESTREL] Listening on http://0.0.0.0:5000",
        "[HTTP] GET /health HTTP/1.1 -> 200 OK (0.3ms)",
        "[WIRE] Response: {\"status\":\"UP\",\"service\":\"api-forge\"}",
      ],
      hardwareEffect: "Мережевий шлюз отримав статус 200 OK (UP), світлодіод порту зв'язку заблимав зеленим.",
    },
    explanation: "Маршрут GET /health повертає JSON-статус оркестратору або балансувальнику, сигналізуючи про готовність сервісу.",
    clozeExercise: {
      csharp: "app.MapGet(\"/health\", () => Results.___({ status = \"___\", service = \"api-forge\" }));",
      go: "http.HandleFunc(\"/health\", func(w http.ResponseWriter, r *http.Request) {\n    w.WriteHeader(http.___)\n    w.Write([]byte(`{\"status\":\"___\",\"service\":\"api-forge\"}`))\n})",
    },
    finalChallenge: {
      prompt: "Створіть ендпоінт GET /ping, який повертає 200 OK з JSON-об'єктом { reply = \"pong\" }.",
      hint: "Використайте маршрутизатор мінімального API для прив'язки GET-запиту за шляхом /ping та поверніть статус 200 з анонімним об'єктом відповіді.",
      targetCode: {
        csharp: "app.MapGet(\"/ping\", () => Results.Ok(new { reply = \"pong\" }));",
        go: "http.HandleFunc(\"/ping\", func(w http.ResponseWriter, r *http.Request) {\n    w.WriteHeader(http.StatusOK)\n    w.Write([]byte(`{\"reply\":\"pong\"}`))\n})",
      },
    },
  },

  "task-api-2-path-params": {
    sampleCode: {
      csharp: "app.MapGet(\"/api/devices/{id}\", (string id, IDeviceRepository repo) => {\n    var device = repo.Find(id);\n    return device != null ? Results.Ok(device) : Results.NotFound(new { error = \"Device not found\" });\n});",
      go: "http.HandleFunc(\"/api/devices/\", func(w http.ResponseWriter, r *http.Request) {\n    id := strings.TrimPrefix(r.URL.Path, \"/api/devices/\")\n    device, exists := repo.Find(id)\n    if !exists {\n        http.Error(w, `{\"error\":\"Device not found\"}`, http.StatusNotFound)\n        return\n    }\n    json.NewEncoder(w).Encode(device)\n})",
    },
    demonstrationLog: {
      terminal: [
        "[ROUTER] Matched pattern /api/devices/{id} for id='dev-402'",
        "[STORAGE] Querying memory store -> Match found",
        "[HTTP] 200 OK Content-Type: application/json",
      ],
      hardwareEffect: "Шлюз API успішно витягнув параметр {id} з URL та надіслав телеметрію знайденого приладу.",
    },
    explanation: "Витягуємо ідентифікатор із шляху URL: якщо об'єкт знайдено — повертаємо 200 OK, інакше 404 NotFound.",
    clozeExercise: {
      csharp: "app.MapGet(\"/api/devices/{id}\", (string id, IDeviceRepository repo) => {\n    var device = repo.Find(id);\n    return device != null ? Results.Ok(device) : Results.___(new { error = \"Device not found\" });\n});",
      go: "http.HandleFunc(\"/api/devices/\", func(w http.ResponseWriter, r *http.Request) {\n    id := strings.TrimPrefix(r.URL.Path, \"/api/devices/\")\n    device, exists := repo.Find(id)\n    if !exists {\n        http.Error(w, `{\"error\":\"Device not found\"}`, http.___)\n        return\n    }\n    json.NewEncoder(w).Encode(device)\n})",
    },
    finalChallenge: {
      prompt: "Створіть маршрут GET /api/users/{id}: знайдіть юзера через repo.Find(id), поверніть Results.Ok(user) або Results.NotFound().",
      hint: "Використайте пошуковий метод сховища за отриманим ідентифікатором і поверніть 200 зі знайденою сутністю або статус 404 у разі відсутності запису.",
      targetCode: {
        csharp: "app.MapGet(\"/api/users/{id}\", (string id, IUserRepo repo) => {\n    var user = repo.Find(id);\n    return user != null ? Results.Ok(user) : Results.NotFound();\n});",
        go: "http.HandleFunc(\"/api/users/\", func(w http.ResponseWriter, r *http.Request) {\n    id := strings.TrimPrefix(r.URL.Path, \"/api/users/\")\n    user, exists := repo.Find(id)\n    if !exists {\n        http.Error(w, \"Not found\", http.StatusNotFound)\n        return\n    }\n    json.NewEncoder(w).Encode(user)\n})",
      },
    },
  },

  "task-api-3-dto-validation": {
    sampleCode: {
      csharp: "app.MapPost(\"/api/orders\", (CreateOrderDto dto, IOrderService service) => {\n    if (string.IsNullOrWhiteSpace(dto.Item) || dto.Quantity <= 0)\n        return Results.BadRequest(new { error = \"Invalid order payload\" });\n    var order = service.Create(dto.Item, dto.Quantity);\n    return Results.Created($\"/api/orders/{order.Id}\", order);\n});",
      go: "http.HandleFunc(\"/api/orders\", func(w http.ResponseWriter, r *http.Request) {\n    var dto CreateOrderDto\n    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil || dto.Item == \"\" || dto.Quantity <= 0 {\n        http.Error(w, `{\"error\":\"Invalid order payload\"}`, http.StatusBadRequest)\n        return\n    }\n    order := service.Create(dto.Item, dto.Quantity)\n    w.WriteHeader(http.StatusCreated)\n    json.NewEncoder(w).Encode(order)\n})",
    },
    demonstrationLog: {
      terminal: [
        "[POST] Parsing JSON payload body into CreateOrderDto",
        "[VALIDATOR] Verified dto.Item is non-empty and Quantity > 0",
        "[HTTP] 201 Created -> Location: /api/orders/ord-91",
      ],
      hardwareEffect: "Замовлення перевірено на валідність і збережено в системі з HTTP статусом 201 Created.",
    },
    explanation: "Перевіряємо поля вхідного DTO: некоректні дані відхиляємо зі статусом 400 BadRequest, а валідні створюємо зі статусом 201 Created.",
    clozeExercise: {
      csharp: "app.MapPost(\"/api/orders\", (CreateOrderDto dto, IOrderService service) => {\n    if (string.IsNullOrWhiteSpace(dto.Item) || dto.Quantity <= ___)\n        return Results.___(new { error = \"Invalid order payload\" });\n    var order = service.Create(dto.Item, dto.Quantity);\n    return Results.___($\"/api/orders/{order.Id}\", order);\n});",
      go: "http.HandleFunc(\"/api/orders\", func(w http.ResponseWriter, r *http.Request) {\n    var dto CreateOrderDto\n    if err := json.NewDecoder(r.Body).Decode(&dto); err != nil || dto.Item == \"\" || dto.Quantity <= ___ {\n        http.Error(w, `{\"error\":\"Invalid order payload\"}`, http.___)\n        return\n    }\n    order := service.Create(dto.Item, dto.Quantity)\n    w.WriteHeader(http.___)\n    json.NewEncoder(w).Encode(order)\n})",
    },
    finalChallenge: {
      prompt: "Напишіть валідацію для POST /api/items: якщо dto.Price <= 0, поверніть Results.BadRequest(), інакше Results.Created(\"/api/items\", dto).",
      hint: "Реалізуйте валідацію вхідного DTO: нульова або від'ємна вартість має давати клієнту помилку 400, а успішне створення — статус 201 з URI нового ресурсу.",
      targetCode: {
        csharp: "app.MapPost(\"/api/items\", (ItemDto dto) => {\n    if (dto.Price <= 0) return Results.BadRequest();\n    return Results.Created(\"/api/items\", dto);\n});",
        go: "http.HandleFunc(\"/api/items\", func(w http.ResponseWriter, r *http.Request) {\n    var dto ItemDto\n    json.NewDecoder(r.Body).Decode(&dto)\n    if dto.Price <= 0 {\n        http.Error(w, \"Bad price\", http.StatusBadRequest)\n        return\n    }\n    w.WriteHeader(http.StatusCreated)\n})",
      },
    },
  },

  "task-api-4-bearer-auth": {
    sampleCode: {
      csharp: "app.MapGet(\"/api/secure/stats\", (HttpContext context) => {\n    var auth = context.Request.Headers.Authorization.ToString();\n    if (!auth.StartsWith(\"Bearer forge-token-secure-99\"))\n        return Results.Unauthorized();\n    return Results.Ok(new { gatewayStatus = \"HEALTHY\" });\n});",
      go: "http.HandleFunc(\"/api/secure/stats\", func(w http.ResponseWriter, r *http.Request) {\n    auth := r.Header.Get(\"Authorization\")\n    if !strings.HasPrefix(auth, \"Bearer forge-token-secure-99\") {\n        http.Error(w, `{\"error\":\"Unauthorized\"}`, http.StatusUnauthorized)\n        return\n    }\n    w.Write([]byte(`{\"gatewayStatus\":\"HEALTHY\"}`))\n})",
    },
    demonstrationLog: {
      terminal: [
        "[AUTH_MIDDLEWARE] Intercepting request for /api/secure/stats",
        "[HEADER] Authorization: Bearer forge-token-secure-99",
        "[SECURITY] Token authenticated successfully (Scope: telemetry)",
        "[HTTP] 200 OK",
      ],
      hardwareEffect: "API шлюз валідував криптографічний Bearer токен і надав доступ до захищеного реєстру.",
    },
    explanation: "Перевіряємо наявність префікса Bearer та секретного токена в заголовку Authorization, повертаючи 401 Unauthorized при відмові.",
    clozeExercise: {
      csharp: "app.MapGet(\"/api/secure/stats\", (HttpContext context) => {\n    var auth = context.Request.Headers.Authorization.ToString();\n    if (!auth.StartsWith(\"___\"))\n        return Results.___();\n    return Results.Ok(new { gatewayStatus = \"HEALTHY\" });\n});",
      go: "http.HandleFunc(\"/api/secure/stats\", func(w http.ResponseWriter, r *http.Request) {\n    auth := r.Header.Get(\"Authorization\")\n    if !strings.HasPrefix(auth, \"___\") {\n        http.Error(w, `{\"error\":\"Unauthorized\"}`, http.___)\n        return\n    }\n    w.Write([]byte(`{\"gatewayStatus\":\"HEALTHY\"}`))\n})",
    },
    finalChallenge: {
      prompt: "Захистіть маршрут GET /api/admin: якщо auth != \"Bearer admin-secret-key\", поверніть Results.Unauthorized(), інакше Results.Ok(\"ACCESS_GRANTED\").",
      hint: "Перевірте схему Bearer у токені безпеки: при невідповідності секретного ключа негайно завершуйте запит статусом 401, інакше повертайте підтвердження доступу.",
      targetCode: {
        csharp: "app.MapGet(\"/api/admin\", (HttpContext ctx) => {\n    var auth = ctx.Request.Headers.Authorization.ToString();\n    if (auth != \"Bearer admin-secret-key\") return Results.Unauthorized();\n    return Results.Ok(\"ACCESS_GRANTED\");\n});",
        go: "http.HandleFunc(\"/api/admin\", func(w http.ResponseWriter, r *http.Request) {\n    if r.Header.Get(\"Authorization\") != \"Bearer admin-secret-key\" {\n        http.Error(w, \"Unauthorized\", http.StatusUnauthorized)\n        return\n    }\n    w.Write([]byte(\"ACCESS_GRANTED\"))\n})",
      },
    },
  },

  "task-api-5-client-consumer": {
    sampleCode: {
      csharp: "using var client = new HttpClient();\nvar response = await client.GetAsync(\"https://forge.api/health\");\nresponse.EnsureSuccessStatusCode();\nvar health = await response.Content.ReadFromJsonAsync<HealthDto>();",
      go: "resp, err := http.Get(\"https://forge.api/health\")\nif err != nil || resp.StatusCode != http.StatusOK {\n    return nil, errors.New(\"health check failed\")\n}\ndefer resp.Body.Close()\nvar health HealthDto\njson.NewDecoder(resp.Body).Decode(&health)",
    },
    demonstrationLog: {
      terminal: [
        "[HTTP_CLIENT] Outgoing GET -> https://forge.api/health",
        "[NETWORK] Wire response 200 OK received (48 bytes)",
        "[SERIALIZER] Deserialized JSON payload into HealthDto model",
      ],
      hardwareEffect: "Клієнтський модуль відправив запит через мережу та успішно десеріалізував отриману відповідь.",
    },
    explanation: "Використовуємо HttpClient для відправки запиту, перевіряємо статус успішності через EnsureSuccessStatusCode() та парсимо JSON.",
    clozeExercise: {
      csharp: "using var client = new HttpClient();\nvar response = await client.___(\"https://forge.api/health\");\nresponse.___();\nvar health = await response.Content.ReadFromJsonAsync<HealthDto>();",
      go: "resp, err := http.___(\"https://forge.api/health\")\nif err != nil || resp.StatusCode != http.___ {\n    return nil, errors.New(\"failed\")\n}\ndefer resp.Body.Close()",
    },
    finalChallenge: {
      prompt: "Викличте client.GetAsync(\"https://forge.api/status\"), перевірте response.EnsureSuccessStatusCode() та поверніть response.StatusCode.",
      hint: "Асинхронно відправте HTTP-запит клієнтом через await, перевірте успішність діапазону 2xx через валідатор статусу й поверніть код відповіді.",
      targetCode: {
        csharp: "var response = await client.GetAsync(\"https://forge.api/status\");\nresponse.EnsureSuccessStatusCode();\nreturn response.StatusCode;",
        go: "resp, err := client.Get(\"https://forge.api/status\")\nif err != nil || resp.StatusCode != http.StatusOK {\n    return 0, err\n}\nreturn resp.StatusCode, nil",
      },
    },
  },

  "task-api-6-resiliency-retry": {
    sampleCode: {
      csharp: "for (int attempt = 1; attempt <= 3; attempt++) {\n    try {\n        var res = await client.GetAsync(url);\n        if (res.IsSuccessStatusCode) return await res.Content.ReadAsStringAsync();\n    } catch (HttpRequestException) when (attempt < 3) {\n        await Task.Delay(100 * attempt);\n    }\n}",
      go: "for attempt := 1; attempt <= 3; attempt++ {\n    resp, err := client.Get(url)\n    if err == nil && resp.StatusCode == http.StatusOK {\n        return resp, nil\n    }\n    time.Sleep(time.Duration(attempt * 100) * time.Millisecond)\n}",
    },
    demonstrationLog: {
      terminal: [
        "[RETRY] Attempt 1 failed: Transient 503 Service Unavailable",
        "[BACKOFF] Exponential delay: waiting 100ms before retry...",
        "[RETRY] Attempt 2 succeeded: 200 OK received",
      ],
      hardwareEffect: "Політика стійкості (Retry with Backoff) успішно пережила тимчасовий збій каналу зв'язку.",
    },
    explanation: "Організовуємо цикл повторних спроб (Retry) із затримкою (Backoff) для захисту від короткочасних мережевих коливань.",
    clozeExercise: {
      csharp: "for (int attempt = 1; attempt <= ___; attempt++) {\n    try {\n        var res = await client.GetAsync(url);\n        if (res.IsSuccessStatusCode) return await res.Content.ReadAsStringAsync();\n    } catch (HttpRequestException) when (attempt < 3) {\n        await Task.___(___ * attempt);\n    }\n}",
      go: "for attempt := 1; attempt <= ___; attempt++ {\n    resp, err := client.Get(url)\n    if err == nil && resp.StatusCode == http.StatusOK {\n        return resp, nil\n    }\n    time.Sleep(time.Duration(attempt * ___) * time.Millisecond)\n}",
    },
    finalChallenge: {
      prompt: "Напишіть цикл на 2 спроби: якщо res.IsSuccessStatusCode поверніть true, інакше виконайте Task.Delay(200).",
      hint: "Паттерн Retry: організуйте повторний запит у короткому циклі з асинхронною паузою між невдалими спробами та достроковим виходом при успіху.",
      targetCode: {
        csharp: "for (int attempt = 1; attempt <= 2; attempt++) {\n    var res = await client.GetAsync(url);\n    if (res.IsSuccessStatusCode) return true;\n    await Task.Delay(200);\n}",
        go: "for attempt := 1; attempt <= 2; attempt++ {\n    resp, err := client.Get(url)\n    if err == nil && resp.StatusCode == http.StatusOK {\n        return true\n    }\n    time.Sleep(200 * time.Millisecond)\n}",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // STATION 05: GIT TIME MACHINE (tasks-git.ts)
  // ══════════════════════════════════════════════════════════════════
  "task-git-1-genesis": {
    sampleCode: {
      csharp: "Process.Start(\"git\", \"add .\");\nProcess.Start(\"git\", \"commit -m \\\"feat: initialize hardware telemetry sensor\\\"\");",
      go: "exec.Command(\"git\", \"add\", \".\").Run()\nexec.Command(\"git\", \"commit\", \"-m\", \"feat: initialize hardware telemetry sensor\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[GIT] Indexing working tree files: 4 items tracked",
        "[GIT] Created commit a4f8e12: feat: initialize hardware telemetry sensor",
        "[DAG] Genesis root node committed to repository graph",
      ],
      hardwareEffect: "Створено перший вузол графа версій DAG (SHA-1 a4f8e12), покажчик HEAD зафіксовано на main.",
    },
    explanation: "Фіксуємо початковий зліпок проекту: команда git add індексує файли, а git commit створює вузол історії.",
    clozeExercise: {
      csharp: "Process.Start(\"git\", \"___ .\");\nProcess.Start(\"git\", \"___ -m \\\"feat: initialize hardware telemetry sensor\\\"\");",
      go: "exec.Command(\"git\", \"___\", \".\").Run()\nexec.Command(\"git\", \"___\", \"-m\", \"feat: initialize hardware telemetry sensor\").Run()",
    },
    finalChallenge: {
      prompt: "Виконайте фіксацію файлів із повідомленням: git add . та git commit -m \"docs: add initial documentation\".",
      hint: "Двоетапний процес збереження: спочатку перемістіть усі змінені файли в область індексування (staging), а потім створіть зліпок історії з описовим коментарем.",
      targetCode: {
        csharp: "Process.Start(\"git\", \"add .\");\nProcess.Start(\"git\", \"commit -m \\\"docs: add initial documentation\\\"\");",
        go: "exec.Command(\"git\", \"add\", \".\").Run()\nexec.Command(\"git\", \"commit\", \"-m\", \"docs: add initial documentation\").Run()",
      },
    },
  },

  "task-git-2-branching": {
    sampleCode: {
      csharp: "Process.Start(\"git\", \"branch feature-login\");\nProcess.Start(\"git\", \"switch feature-login\");",
      go: "exec.Command(\"git\", \"branch\", \"feature-login\").Run()\nexec.Command(\"git\", \"switch\", \"feature-login\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[GIT] Branch created: refs/heads/feature-login",
        "[GIT] Switched to branch 'feature-login'",
        "[HEAD] Now points to branch 'feature-login'",
      ],
      hardwareEffect: "Ізольовану лінію розробки feature-login створено, HEAD успішно перемкнуто.",
    },
    explanation: "Створюємо нову гілку для безпечної ізоляції нового функціоналу без ризику пошкодити основну лінію main.",
    clozeExercise: {
      csharp: "Process.Start(\"git\", \"___ feature-login\");\nProcess.Start(\"git\", \"___ feature-login\");",
      go: "exec.Command(\"git\", \"___\", \"feature-login\").Run()\nexec.Command(\"git\", \"___\", \"feature-login\").Run()",
    },
    finalChallenge: {
      prompt: "Створіть та перейдіть у гілку feature-telemetry: git branch feature-telemetry та git switch feature-telemetry.",
      hint: "Ізоляція кодової бази: створіть новий покажчик гілки для розробки телеметрії, після чого перемкніть HEAD на цю гілку через команду switch.",
      targetCode: {
        csharp: "Process.Start(\"git\", \"branch feature-telemetry\");\nProcess.Start(\"git\", \"switch feature-telemetry\");",
        go: "exec.Command(\"git\", \"branch\", \"feature-telemetry\").Run()\nexec.Command(\"git\", \"switch\", \"feature-telemetry\").Run()",
      },
    },
  },

  "task-git-3-merge": {
    sampleCode: {
      csharp: "Process.Start(\"git\", \"switch main\");\nProcess.Start(\"git\", \"merge feature-login\");",
      go: "exec.Command(\"git\", \"switch\", \"main\").Run()\nexec.Command(\"git\", \"merge\", \"feature-login\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[GIT] Switched to branch 'main'",
        "[GIT] Updating head -> Fast-forward merge",
        "[DAG] Main branch tip advanced to latest feature commit",
      ],
      hardwareEffect: "Зміни з feature-login успішно інтегровано в головну гілку через Fast-forward злиття.",
    },
    explanation: "Переходимо у гілку main та виконуємо команду merge для інтеграції протестованих змін з feature-гілки.",
    clozeExercise: {
      csharp: "Process.Start(\"git\", \"switch ___\");\nProcess.Start(\"git\", \"___ feature-login\");",
      go: "exec.Command(\"git\", \"switch\", \"___\").Run()\nexec.Command(\"git\", \"___\", \"feature-login\").Run()",
    },
    finalChallenge: {
      prompt: "Перейдіть у main та злийте гілку feature-auth: git switch main та git merge feature-auth.",
      hint: "Інтеграція функціоналу: поверніться на цільову стабільну лінію розробки, а потім виконайте операцію злиття зазначеної гілки в поточну.",
      targetCode: {
        csharp: "Process.Start(\"git\", \"switch main\");\nProcess.Start(\"git\", \"merge feature-auth\");",
        go: "exec.Command(\"git\", \"switch\", \"main\").Run()\nexec.Command(\"git\", \"merge\", \"feature-auth\").Run()",
      },
    },
  },

  "task-git-4-conflict": {
    sampleCode: {
      csharp: "File.WriteAllText(\"config.json\", \"{\\\"timeout\\\": 5000}\");\nProcess.Start(\"git\", \"add config.json\");\nProcess.Start(\"git\", \"commit -m \\\"fix: resolve timeout conflict\\\"\");",
      go: "os.WriteFile(\"config.json\", []byte(`{\"timeout\": 5000}`), 0644)\nexec.Command(\"git\", \"add\", \"config.json\").Run()\nexec.Command(\"git\", \"commit\", \"-m\", \"fix: resolve timeout conflict\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[CONFLICT] Removed conflict markers <<<<<<<, =======, >>>>>>>",
        "[GIT] Resolved state staged in index: config.json",
        "[GIT] Merge commit recorded: fix: resolve timeout conflict",
      ],
      hardwareEffect: "Конфлікт паралельних змін усунуто, репозиторій повернуто в стабільний стан.",
    },
    explanation: "Вирішуємо конфлікт злиття: очищаємо маркери конфлікту, зберігаємо узгоджений файл та фіксуємо результат комітом.",
    clozeExercise: {
      csharp: "File.WriteAllText(\"config.json\", \"{\\\"timeout\\\": 5000}\");\nProcess.Start(\"git\", \"___ config.json\");\nProcess.Start(\"git\", \"___ -m \\\"fix: resolve timeout conflict\\\"\");",
      go: "os.WriteFile(\"config.json\", []byte(`{\"timeout\": 5000}`), 0644)\nexec.Command(\"git\", \"___\", \"config.json\").Run()\nexec.Command(\"git\", \"___\", \"-m\", \"fix: resolve timeout conflict\").Run()",
    },
    finalChallenge: {
      prompt: "Збережіть файл settings.json зі значенням {\"port\": 8080}, додайте його в індекс та створіть коміт \"fix: resolve port conflict\".",
      hint: "Ручне розв'язання конфлікту: перезапишіть конфліктний конфігураційний файл узгодженим значенням, проіндексуйте результат і зафіксуйте фінальний стан комітом.",
      targetCode: {
        csharp: "File.WriteAllText(\"settings.json\", \"{\\\"port\\\": 8080}\");\nProcess.Start(\"git\", \"add settings.json\");\nProcess.Start(\"git\", \"commit -m \\\"fix: resolve port conflict\\\"\");",
        go: "os.WriteFile(\"settings.json\", []byte(`{\"port\": 8080}`), 0644)\nexec.Command(\"git\", \"add\", \"settings.json\").Run()\nexec.Command(\"git\", \"commit\", \"-m\", \"fix: resolve port conflict\").Run()",
      },
    },
  },

  "task-git-5-rebase": {
    sampleCode: {
      csharp: "Process.Start(\"git\", \"switch feature-login\");\nProcess.Start(\"git\", \"rebase main\");",
      go: "exec.Command(\"git\", \"switch\", \"feature-login\").Run()\nexec.Command(\"git\", \"rebase\", \"main\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[REBASE] Rewinding head to replay commits on top of main...",
        "[REBASE] Applying commit 1/2: feat: add login form",
        "[REBASE] Successfully rebased and updated refs/heads/feature-login",
      ],
      hardwareEffect: "Історію гілки feature-login випрямлено в лінійну послідовність поверх свіжого main.",
    },
    explanation: "Rebase пересаджує основу гілки на вершину актуального main, забезпечуючи чисту лінійну історію без зайвих мердж-комітів.",
    clozeExercise: {
      csharp: "Process.Start(\"git\", \"switch feature-login\");\nProcess.Start(\"git\", \"___ main\");",
      go: "exec.Command(\"git\", \"switch\", \"feature-login\").Run()\nexec.Command(\"git\", \"___\", \"main\").Run()",
    },
    finalChallenge: {
      prompt: "Перейдіть на feature-api та виконайте rebase відносно main: git switch feature-api та git rebase main.",
      hint: "Лінеаризація історії: перемкніться на робочу гілку та перебазуйте її основу на верхівку головної гілки, щоб уникнути зайвих вузлів злиття.",
      targetCode: {
        csharp: "Process.Start(\"git\", \"switch feature-api\");\nProcess.Start(\"git\", \"rebase main\");",
        go: "exec.Command(\"git\", \"switch\", \"feature-api\").Run()\nexec.Command(\"git\", \"rebase\", \"main\").Run()",
      },
    },
  },

  "task-git-6-pull-request": {
    sampleCode: {
      csharp: "Process.Start(\"git\", \"push -u origin feature-login\");",
      go: "exec.Command(\"git\", \"push\", \"-u\", \"origin\", \"feature-login\").Run()",
    },
    demonstrationLog: {
      terminal: [
        "[GIT] Pushing commits to remote: origin/feature-login",
        "[GITHUB] Pull Request #42 created: feature-login -> main",
        "[CI/CD] Automated test suite passed: 100% green",
      ],
      hardwareEffect: "Гілку опубліковано у віддаленому репозиторії, відкрито Pull Request для перевірки командою.",
    },
    explanation: "Пушимо гілку на віддалений сервер (origin) та відкриваємо Pull Request для взаємного код-рев'ю перед релізом.",
    clozeExercise: {
      csharp: "Process.Start(\"git\", \"___ -u origin feature-login\");",
      go: "exec.Command(\"git\", \"___\", \"-u\", \"origin\", \"feature-login\").Run()",
    },
    finalChallenge: {
      prompt: "Опублікуйте гілку release-v1 на сервері origin: git push -u origin release-v1.",
      hint: "Публікація у віддалений репозиторій: відправте локальні коміти на сервер командою push із прив'язкою upstream-покажчика для обраної гілки.",
      targetCode: {
        csharp: "Process.Start(\"git\", \"push -u origin release-v1\");",
        go: "exec.Command(\"git\", \"push\", \"-u\", \"origin\", \"release-v1\").Run()",
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════
  // STATION 06: CYBER BANDIT LAB (tasks-bandit.ts)
  // ══════════════════════════════════════════════════════════════════
  "task-bandit-1-hidden-key": {
    sampleCode: {
      csharp: "string? secret = Environment.GetEnvironmentVariable(\"API_SECRET\");\nif (string.IsNullOrEmpty(secret))\n    throw new InvalidOperationException(\"Missing API_SECRET\");\nreturn secret;",
      go: "secret := os.Getenv(\"API_SECRET\")\nif secret == \"\" {\n    return \"\", errors.New(\"missing API_SECRET\")\n}\nreturn secret, nil",
    },
    demonstrationLog: {
      terminal: [
        "[ENV_LOADER] Reading configuration from secure .env store",
        "[AUDIT] Zero plaintext secrets detected in git codebase",
        "[KEY_VAULT] Secret successfully retrieved into memory",
      ],
      hardwareEffect: "Секретний ключ безпечно зчитано зі змінних оточення без витоку у відкритий вихідний код.",
    },
    explanation: "Ніколи не записуємо секретні ключі та паролі у відкритому коді — зчитуємо їх динамічно через змінні оточення (Environment Variables).",
    clozeExercise: {
      csharp: "string? secret = Environment.___(\"API_SECRET\");\nif (string.IsNullOrEmpty(secret))\n    throw new ___(\"Missing API_SECRET\");\nreturn secret;",
      go: "secret := os.___(\"API_SECRET\")\nif secret == \"\" {\n    return \"\", errors.New(\"missing API_SECRET\")\n}\nreturn secret, nil",
    },
    finalChallenge: {
      prompt: "Зчитайте змінну DB_PASSWORD через Environment.GetEnvironmentVariable, і якщо вона порожня — киньте InvalidOperationException.",
      hint: "Безпечна конфігурація: отримайте значення пароля зі змінних середовища операційної системи та згенеруйте виняток при спробі запуску без налаштованого секрету.",
      targetCode: {
        csharp: "string? pass = Environment.GetEnvironmentVariable(\"DB_PASSWORD\");\nif (string.IsNullOrEmpty(pass))\n    throw new InvalidOperationException(\"No password\");\nreturn pass;",
        go: "pass := os.Getenv(\"DB_PASSWORD\")\nif pass == \"\" {\n    return \"\", errors.New(\"no password\")\n}\nreturn pass, nil",
      },
    },
  },

  "task-bandit-2-obfuscation": {
    sampleCode: {
      csharp: "byte[] data = Convert.FromBase64String(encodedPayload);\nstring decoded = Encoding.UTF8.GetString(data);\nreturn decoded;",
      go: "data, err := base64.StdEncoding.DecodeString(encodedPayload)\nif err != nil {\n    return \"\", err\n}\nreturn string(data), nil",
    },
    demonstrationLog: {
      terminal: [
        "[INPUT] Base64 payload received (44 bytes)",
        "[DECODE] Binary reconstruction via UTF-8 standard",
        "[OUTPUT] Cleartext string extracted safely",
      ],
      hardwareEffect: "Обфускований рядок успішно декодовано з Base64 в читабельний двійковий формат.",
    },
    explanation: "Base64 кодування використовується для безпечної передачі двійкових даних текстовими протоколами.",
    clozeExercise: {
      csharp: "byte[] data = Convert.___(encodedPayload);\nstring decoded = Encoding.UTF8.___(data);\nreturn decoded;",
      go: "data, err := base64.StdEncoding.___(encodedPayload)\nif err != nil {\n    return \"\", err\n}\nreturn string(data), nil",
    },
    finalChallenge: {
      prompt: "Закодуйте рядок secretText у Base64: Convert.ToBase64String(Encoding.UTF8.GetBytes(secretText)).",
      hint: "Кодування даних: спочатку перетворіть текстовий рядок у байти UTF-8, а потім упакуйте отриманий масив у текстовий формат Base64 через службовий клас конвертації.",
      targetCode: {
        csharp: "byte[] bytes = Encoding.UTF8.GetBytes(secretText);\nreturn Convert.ToBase64String(bytes);",
        go: "bytes := []byte(secretText)\nreturn base64.StdEncoding.EncodeToString(bytes)",
      },
    },
  },

  "task-bandit-3-wire-tap": {
    sampleCode: {
      csharp: "using var hmac = new HMACSHA256(secretKey);\nbyte[] hash = hmac.ComputeHash(payloadBytes);\nreturn CryptographicOperations.FixedTimeEquals(hash, expectedHash);",
      go: "mac := hmac.New(sha256.New, secretKey)\nmac.Write(payloadBytes)\nreturn hmac.Equal(mac.Sum(nil), expectedHash)",
    },
    demonstrationLog: {
      terminal: [
        "[PACKET_CAPTURE] Wire frame intercepted on network interface",
        "[HMAC_SHA256] Verifying authenticity signature...",
        "[TIMING_DEFENSE] Constant-time comparison: VALID (Tampering rejected)",
      ],
      hardwareEffect: "Криптографічний підпис HMAC-SHA256 підтвердив цілісність: підробка пакета зловмисником неможлива.",
    },
    explanation: "HMAC-SHA256 гарантує цілісність даних у каналі зв'язку, а порівняння за фіксований час захищає від атак по часу (Timing Attacks).",
    clozeExercise: {
      csharp: "using var hmac = new ___(secretKey);\nbyte[] hash = hmac.___(payloadBytes);\nreturn CryptographicOperations.___(hash, expectedHash);",
      go: "mac := hmac.New(___.New, secretKey)\nmac.Write(payloadBytes)\nreturn hmac.___(mac.Sum(nil), expectedHash)",
    },
    finalChallenge: {
      prompt: "Обчисліть хеш SHA256 від масиву data: using var sha = SHA256.Create(); return sha.ComputeHash(data);",
      hint: "Криптографічний захист цілісності: створіть криптографічний провайдер хешування з автоматичним звільненням ресурсів і обчисліть фінгерпринт вхідного масиву байтів.",
      targetCode: {
        csharp: "using var sha = SHA256.Create();\nreturn sha.ComputeHash(data);",
        go: "hash := sha256.Sum256(data)\nreturn hash[:]",
      },
    },
  },

  "task-bandit-4-sql-injection": {
    sampleCode: {
      csharp: "var cmd = new SqlCommand(\"SELECT * FROM Users WHERE Username = @user\", connection);\ncmd.Parameters.AddWithValue(\"@user\", username);",
      go: "row := db.QueryRow(\"SELECT * FROM Users WHERE Username = $1\", username)",
    },
    demonstrationLog: {
      terminal: [
        "[INTRUSION_DETECTION] Payload injected: 'admin' OR '1'='1'",
        "[PREPARED_STATEMENT] Parameter bound as literal string, not executable SQL",
        "[DB_ENGINE] 0 rows matched. Attack neutralised!",
      ],
      hardwareEffect: "Параметризований запит знешкодив SQL-ін'єкцію 'admin' OR '1'='1', захистивши базу даних від зламу.",
    },
    explanation: "Завжди використовуємо параметри (@user / $1) замість конкатенації рядків для повного захисту від SQL Injection.",
    clozeExercise: {
      csharp: "var cmd = new SqlCommand(\"SELECT * FROM Users WHERE Username = ___\", connection);\ncmd.Parameters.___(\"@user\", username);",
      go: "row := db.QueryRow(\"SELECT * FROM Users WHERE Username = ___\", username)",
    },
    finalChallenge: {
      prompt: "Створіть безпечний параметризований запит пошуку за Id: \"SELECT * FROM Items WHERE Id = @id\" з параметром @id.",
      hint: "Запобігання SQL-ін'єкціям: ніколи не склеюйте рядки в запиті; вкажіть плейсхолдер параметра з префіксом @ і прив'яжіть значення через колекцію Parameters команди.",
      targetCode: {
        csharp: "var cmd = new SqlCommand(\"SELECT * FROM Items WHERE Id = @id\", connection);\ncmd.Parameters.AddWithValue(\"@id\", id);",
        go: "row := db.QueryRow(\"SELECT * FROM Items WHERE Id = $1\", id)",
      },
    },
  },

  "task-bandit-5-rate-limiter": {
    sampleCode: {
      csharp: "if (attemptsByIp[ip] >= 5) {\n    return Results.StatusCode(429);\n}\nattemptsByIp[ip]++;",
      go: "if attemptsByIp[ip] >= 5 {\n    http.Error(w, \"Too Many Requests\", http.StatusTooManyRequests)\n    return\n}\nattemptsByIp[ip]++",
    },
    demonstrationLog: {
      terminal: [
        "[FIREWALL] Threshold exceeded: 6 requests from 192.168.1.105",
        "[RATE_LIMITER] Dispatched HTTP 429 Too Many Requests",
        "[BRUTE_FORCE_BLOCK] IP temporarily throttled for 60 seconds",
      ],
      hardwareEffect: "Файрвол виявив атаку перебору паролів (Brute Force) і відхилив запит із кодом 429.",
    },
    explanation: "Rate Limiter обмежує частоту запитів з однієї IP-адреси, унеможливлюючи автоматизований перебір паролів.",
    clozeExercise: {
      csharp: "if (attemptsByIp[ip] >= ___) {\n    return Results.StatusCode(___);\n}\nattemptsByIp[ip]++;",
      go: "if attemptsByIp[ip] >= ___ {\n    http.Error(w, \"Too Many Requests\", http.___)\n    return\n}\nattemptsByIp[ip]++",
    },
    finalChallenge: {
      prompt: "Встановіть ліміт на 10 запитів: якщо requestsCount >= 10, поверніть Results.StatusCode(429), інакше збільшіть requestsCount++.",
      hint: "Захист від перевантаження (Throttling): порівняйте лічильник звернень із допустимим лімітом до обробки ресурсу, поверніть статус 429 при перевищенні або інкрементуйте лічильник.",
      targetCode: {
        csharp: "if (requestsCount >= 10) {\n    return Results.StatusCode(429);\n}\nrequestsCount++;",
        go: "if requestsCount >= 10 {\n    http.Error(w, \"Too Many Requests\", 429)\n    return\n}\nrequestsCount++",
      },
    },
  },

  "task-bandit-6-defense-in-depth": {
    sampleCode: {
      csharp: "if (IsRateLimited(ip)) return Results.StatusCode(429);\nif (!VerifyToken(token)) return Results.Unauthorized();\nAuditLog.Record(ip, \"SENSITIVE_ACCESS\");\nreturn ExecuteSecureQuery(queryId);",
      go: "if isRateLimited(ip) { return 429 }\nif !verifyToken(token) { return 401 }\nauditLog.Record(ip, \"SENSITIVE_ACCESS\")\nreturn executeSecureQuery(queryId)",
    },
    demonstrationLog: {
      terminal: [
        "[LAYER 1] Rate limit: PASSED (2/5 requests)",
        "[LAYER 2] Bearer token verified: PASSED (Admin scope)",
        "[LAYER 3] Immutable audit log entry written to append-only storage",
        "[LAYER 4] Secure query dispatched with parameterized inputs",
      ],
      hardwareEffect: "Всі ешелони оборони (Rate Limiting, Авторизація, Аудит, Параметризація) спрацювали злагоджено.",
    },
    explanation: "Принцип ешелонованої оборони (Defense in Depth): поєднання кількох незалежних рівнів захисту унеможливлює злам системи навіть при компрометації одного з них.",
    clozeExercise: {
      csharp: "if (___(ip)) return Results.StatusCode(429);\nif (!___(token)) return Results.Unauthorized();\nAuditLog.Record(ip, \"___\");\nreturn ExecuteSecureQuery(queryId);",
      go: "if ___(ip) { return 429 }\nif !___(token) { return 401 }\nauditLog.Record(ip, \"___\")\nreturn executeSecureQuery(queryId)",
    },
    finalChallenge: {
      prompt: "Створіть каскад захисту: якщо !isAuth поверніть Results.Unauthorized(), якщо !isPermitted поверніть Results.Forbid(), інакше Results.Ok().",
      hint: "Багаторівнева оборона (Defense in Depth): перевірте спочатку автентичність клієнта (401), потім наявність прав на операцію (403), і лише за проходження обох бар'єрів дайте доступ.",
      targetCode: {
        csharp: "if (!isAuth) return Results.Unauthorized();\nif (!isPermitted) return Results.Forbid();\nreturn Results.Ok();",
        go: "if !isAuth { return 401 }\nif !isPermitted { return 403 }\nreturn 200",
      },
    },
  },
};

export const TASK_ID_ALIASES: Record<string, string> = {
  "task-0-2-set-channel": "task-0-2-types",
  "task-0-3-volume": "task-0-3-sequential",
  "task-pos-1-auth": "task-pos-guard-clause",
  "task-pos-2-contactless": "task-pos-fee-calculation",
  "task-pos-3-batch": "task-pos-pin-lockout",
  "task-pos-4-settlement": "task-pos-batch-settlement",
  "task-pos-5-reversal": "task-pos-interface-polymorphism",
  "task-pos-6-offline": "task-pos-dependency-injection",
  "task-pos-7-transfer": "task-pos-double-deduction-bug",
  "task-api-1-ping": "task-api-1-heartbeat",
  "task-api-4-jwt": "task-api-4-bearer-auth",
  "task-git-1-commit": "task-git-1-genesis",
  "task-bandit-1-secrets": "task-bandit-1-hidden-key",
  "task-bandit-3-hmac": "task-bandit-3-wire-tap",
};

/**
 * Helper to fetch a WorkedExample for any task ID
 */
export function getWorkedExample(taskId: string): WorkedExample | undefined {
  const direct = WORKED_EXAMPLES[taskId];
  if (direct) return direct;
  const targetId = TASK_ID_ALIASES[taskId];
  return targetId ? WORKED_EXAMPLES[targetId] : undefined;
}
