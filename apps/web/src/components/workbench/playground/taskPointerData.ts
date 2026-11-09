/**
 * @file apps/web/src/components/workbench/playground/taskPointerData.ts
 * @description Master metadata for Didactic Pointers, Step Labels, Goals, and Aha-Moments
 *              across all 18 tasks of Station 01 (Smart TV) and extensible to all stations.
 */

export interface TaskPointerMetadata {
  id: string;
  tier: 0 | 1 | 2;
  shortLabel: {
    ua: string;
    en: string;
    da: string;
  };
  goal: {
    ua: string;
    en: string;
    da: string;
  };
  ahaTitle: {
    ua: string;
    en: string;
    da: string;
  };
  ahaDesc: {
    ua: string;
    en: string;
    da: string;
  };
}

export const TASK_POINTER_METADATA: Record<string, TaskPointerMetadata> = {
  // ── Tier 0: СТАРТ (Основи) ────────────────────────────────────────────────
  "task-0-1-power-on": {
    id: "task-0-1-power-on",
    tier: 0,
    shortLabel: {
      ua: "1. Увімкнення",
      en: "1. Power On",
      da: "1. Tænd",
    },
    goal: {
      ua: "Подати живлення на процесор телевізора і вивести його з режиму очікування.",
      en: "Power on the TV processor and wake it from standby mode.",
      da: "Tænd for tv-processoren og væk den fra standby.",
    },
    ahaTitle: {
      ua: "Вау! Телевізор увімкнувся!",
      en: "Wow! The TV turned on!",
      da: "Wow! Fjernsynet tændte!",
    },
    ahaDesc: {
      ua: "Ось так, однією простою командою ми подали струм на апаратні схеми. Програмування — це керування реальними речами!",
      en: "Just like that, with one simple command we energized the hardware circuits. Coding is controlling real things!",
      da: "Lige sådan, med en simpel kommando sendte vi strøm til kredsløbene. Programmering er at styre virkelige ting!",
    },
  },
  "task-0-2-types": {
    id: "task-0-2-types",
    tier: 0,
    shortLabel: {
      ua: "2. Типи даних",
      en: "2. Data Types",
      da: "2. Datatyper",
    },
    goal: {
      ua: "Перемкнути канал цифрою (int) та задати назву програми текстом (string).",
      en: "Set channel as integer (int) and program title as string (string).",
      da: "Indstil kanal som heltal (int) og programtitel som tekst (string).",
    },
    ahaTitle: {
      ua: "Вау! Канал налаштовано!",
      en: "Wow! Channel configured!",
      da: "Wow! Kanalen er indstillet!",
    },
    ahaDesc: {
      ua: "Телевізор перемкнувся на 1-й канал і отримав назву 'NEWS'. Типи даних int та string спрацювали бездоганно!",
      en: "The TV switched to channel 1 and received 'NEWS'. The int and string data types worked flawlessly!",
      da: "Fjernsynet skiftede til kanal 1 og modtog 'NEWS'. Datatyperne int og string fungerede fejlfrit!",
    },
  },
  "task-0-3-sequential": {
    id: "task-0-3-sequential",
    tier: 0,
    shortLabel: {
      ua: "3. Послідовність",
      en: "3. Sequence",
      da: "3. Sekvens",
    },
    goal: {
      ua: "Виконати ланцюжок інструкцій послідовно зверху вниз: спершу живлення, потім канал.",
      en: "Execute instructions top-to-bottom: power first, then channel.",
      da: "Udfør instruktioner fra top til bund: strøm først, derefter kanal.",
    },
    ahaTitle: {
      ua: "Вау! Ланцюжок команд спрацював!",
      en: "Wow! Command sequence executed!",
      da: "Wow! Kommandosekvensen virkede!",
    },
    ahaDesc: {
      ua: "Процесор виконав інструкції одна за одною зверху вниз: замкнув живлення і налаштував тюнер!",
      en: "The processor executed instructions one by one: closed power rail and configured the tuner!",
      da: "Processoren udførte instruktionerne én efter én: lukkede strømskinnen og indstillede tuneren!",
    },
  },

  // ── Tier 1: ЛОГІКА (Керування станом і алгоритмами) ──────────────────────
  "task-1-assignment": {
    id: "task-1-assignment",
    tier: 1,
    shortLabel: {
      ua: "1. Змінні",
      en: "1. Variables",
      da: "1. Variabler",
    },
    goal: {
      ua: "Записати логічне значення true у змінну стану живлення (tv.IsOn = true).",
      en: "Write boolean value true into power state variable (tv.IsOn = true).",
      da: "Skriv den booleske værdi true til strømtilstandsvariablen (tv.IsOn = true).",
    },
    ahaTitle: {
      ua: "Вау! Стан оновлено через змінну!",
      en: "Wow! State updated via variable!",
      da: "Wow! Tilstand opdateret via variabel!",
    },
    ahaDesc: {
      ua: "Властивість tv.IsOn отримала boolean true. Стан приладу змінився безпосередньо через оператор присвоєння (=)!",
      en: "Property tv.IsOn received boolean true. Device state mutated directly via assignment operator (=)!",
      da: "Egenskaben tv.IsOn modtog boolesk true. Enhedens tilstand ændrede sig direkte via tildelingsoperatoren (=)!",
    },
  },
  "task-variable-mutation": {
    id: "task-variable-mutation",
    tier: 1,
    shortLabel: {
      ua: "2. Інкремент ++",
      en: "2. Increment ++",
      da: "2. Inkrement ++",
    },
    goal: {
      ua: "Збільшити поточний номер каналу на 1 за допомогою оператора інкременту ++.",
      en: "Increase current channel number by 1 using increment operator ++.",
      da: "Forøg aktuelt kanalnummer med 1 ved hjælp af inkrementoperatoren ++.",
    },
    ahaTitle: {
      ua: "Вау! Канал перемкнуто вперед!",
      en: "Wow! Channel flipped forward!",
      da: "Wow! Kanalen skiftede fremad!",
    },
    ahaDesc: {
      ua: "Оператор інкременту ++ збільшив значення каналу на +1. Саме так процесор реагує на кнопку CH+ на пульті!",
      en: "The ++ increment operator increased channel number by 1. That is how processors handle CH+ remote button!",
      da: "Inkrementoperatoren ++ øgede kanalnummeret med 1. Sådan reagerer processoren på fjernbetjeningens CH+ knap!",
    },
  },
  "task-boundary-guard": {
    id: "task-boundary-guard",
    tier: 1,
    shortLabel: {
      ua: "3. Захист меж",
      en: "3. Guard Clause",
      da: "3. Grænsekontrol",
    },
    goal: {
      ua: "Захистити систему: якщо номер каналу перевищує 4 (tv.Channel > 4), скинути його на 1.",
      en: "Guard the system: if channel exceeds 4 (tv.Channel > 4), reset to 1.",
      da: "Beskyt systemet: hvis kanalen overstiger 4 (tv.Channel > 4), nulstil til 1.",
    },
    ahaTitle: {
      ua: "Вау! Guard Clause захистив залізо!",
      en: "Wow! Guard Clause protected hardware!",
      da: "Wow! Guard Clause beskyttede hardwaren!",
    },
    ahaDesc: {
      ua: "Захисна умова запобігла виходу на неіснуючі частоти білого шуму. Ваша система стійка до помилок користувача!",
      en: "The guard condition prevented drifting into invalid static noise channels. Resilient to user errors!",
      da: "Sikkerhedsbetingelsen forhindrede drifting ind i ugyldige støjkanaler. Modstandsdygtigt mod brugerfejl!",
    },
  },
  "task-debug-off-by-one-overflow": {
    id: "task-debug-off-by-one-overflow",
    tier: 1,
    shortLabel: {
      ua: "4. Дебаг меж",
      en: "4. Bounds Debug",
      da: "4. Grænsedebug",
    },
    goal: {
      ua: "Виправити баг Off-by-one: захистити яскравість телевізора умовою <= 100%, щоб не спалити матрицю.",
      en: "Fix Off-by-one defect: guard TV brightness with <= 100% condition to prevent matrix damage.",
      da: "Løs Off-by-one fejl: beskyt tv-lysstyrken med <= 100% betingelse for at forhindre matrixskade.",
    },
    ahaTitle: {
      ua: "Вау! Переповнення 101% заблоковано!",
      en: "Wow! 101% overflow prevented!",
      da: "Wow! 101% overløb blokeret!",
    },
    ahaDesc: {
      ua: "Оператор <= замість < усунув зсув на одиницю. Значення яскравості ніколи не перевищить апаратний максимум!",
      en: "Operator <= eliminated off-by-one edge error. Brightness will never exceed hardware physical limits!",
      da: "Operatoren <= eliminerede fejlen. Lysstyrken vil aldrig overstige hardwarens fysiske maksimum!",
    },
  },
  "task-2-branching": {
    id: "task-2-branching",
    tier: 1,
    shortLabel: {
      ua: "5. Умови if/else",
      en: "5. If / Else",
      da: "5. Betingelser",
    },
    goal: {
      ua: "Створити розумний перемикач: якщо телевізор увімкнено — вимкнути, інакше — увімкнути.",
      en: "Build a smart toggle: if TV is on — turn off, otherwise — turn on.",
      da: "Byg en smart kontakt: hvis tv er tændt — sluk, ellers — tænd.",
    },
    ahaTitle: {
      ua: "Вау! Розгалуження if/else спрацювало!",
      en: "Wow! Branching if/else worked!",
      da: "Wow! Forgrening if/else virkede!",
    },
    ahaDesc: {
      ua: "Процесор перевірив поточний стан і обрав правильну гілку. Це основа інтелекту будь-якої програми!",
      en: "The processor evaluated current state and selected the correct branch. That is the core of software logic!",
      da: "Processoren evaluerede den aktuelle tilstand og valgte den rigtige gren. Det er kernen i al softwarelogik!",
    },
  },
  "task-for-loop": {
    id: "task-for-loop",
    tier: 1,
    shortLabel: {
      ua: "6. Цикл for",
      en: "6. For Loop",
      da: "6. For-løkke",
    },
    goal: {
      ua: "Запустити цикл автопошуку for від каналу 1 до 4, щоб телевізор послідовно показав кожен екран.",
      en: "Run an autoscan for loop from channel 1 to 4 so TV displays each screen sequentially.",
      da: "Kør en automatisk søgning for-løkke fra kanal 1 til 4, så tv'et viser hver skærm sekventielt.",
    },
    ahaTitle: {
      ua: "Вау! Цикл for просканував канали!",
      en: "Wow! For loop scanned all channels!",
      da: "Wow! For-løkken scannede alle kanaler!",
    },
    ahaDesc: {
      ua: "Процесор повторив дію 4 рази автоматично. Цикли дозволяють обробляти мільйони даних без дублювання рядків коду!",
      en: "The processor repeated the action 4 times automatically. Loops process millions of records without code repetition!",
      da: "Processoren gentog handlingen 4 gange automatisk. Løkker behandler millioner af poster uden kodegentagelse!",
    },
  },
  "task-debug-runaway-loop": {
    id: "task-debug-runaway-loop",
    tier: 1,
    shortLabel: {
      ua: "7. Дебаг циклу",
      en: "7. Loop Debug",
      da: "7. Løkkedebug",
    },
    goal: {
      ua: "Усунути нескінченне зависання циклу: обмежити верхню межу автопошуку 5 каналами.",
      en: "Fix infinite runaway loop: constrain autoscan upper bound to 5 channels.",
      da: "Løs uendelig løkke: begræns autosøgningens øvre grænse til 5 kanaler.",
    },
    ahaTitle: {
      ua: "Вау! Нескінченний цикл приборкано!",
      en: "Wow! Runaway loop tamed!",
      da: "Wow! Uendelig løkke tæmmet!",
    },
    ahaDesc: {
      ua: "Ви знайшли баг в умові for-циклу і врятували процесор від 100% завантаження та перегріву. Справжній дебаг!",
      en: "You found the defect in the for condition and saved CPU from 100% lockup and thermal throttle. Real engineering debug!",
      da: "Du fandt fejlen i for-betingelsen og reddede CPU'en fra 100% låsning og overophedning. Ægte fejlfinding!",
    },
  },
  "task-method-return": {
    id: "task-method-return",
    tier: 1,
    shortLabel: {
      ua: "8. Запити CQS",
      en: "8. Queries CQS",
      da: "8. CQS forespørgsel",
    },
    goal: {
      ua: "Зчитати гучність методом GetVolume() і збільшити її на 10 одиниць через метод SetVolume().",
      en: "Read volume using GetVolume() query and increase it by 10 units via SetVolume() command.",
      da: "Aflæs lydstyrke med GetVolume() og forøg den med 10 enheder via SetVolume().",
    },
    ahaTitle: {
      ua: "Вау! Принцип CQS реалізовано!",
      en: "Wow! CQS pattern implemented!",
      da: "Wow! CQS-princippet implementeret!",
    },
    ahaDesc: {
      ua: "Запит GetVolume() повернув число зі стека без сайд-ефектів, а SetVolume() змінив стан. Читання й запис розділені!",
      en: "Query GetVolume() read stack value with no side-effects, while SetVolume() applied mutation. Read and write are cleanly decoupled!",
      da: "Forespørgslen GetVolume() returnerede tallet uden bivirkninger, mens SetVolume() ændrede tilstanden. Læsning og skrivning er adskilt!",
    },
  },
  "task-class-instance": {
    id: "task-class-instance",
    tier: 1,
    shortLabel: {
      ua: "9. Об'єкт new",
      en: "9. Object new",
      da: "9. Objekt new",
    },
    goal: {
      ua: "Створити новий екземпляр телевізора за кресленням класу TV (new TV()) та увімкнути його.",
      en: "Instantiate a new TV object from TV class blueprint (new TV()) and power it on.",
      da: "Opret en ny TV-instans fra TV-klasseopskriften (new TV()) og tænd den.",
    },
    ahaTitle: {
      ua: "Вау! Об'єкт ожив у купі (Heap)!",
      en: "Wow! Object created in Heap!",
      da: "Wow! Objekt oprettet i Heap!",
    },
    ahaDesc: {
      ua: "Оператор new виділив область пам'яті під реальний апаратний об'єкт. Ви перейшли від креслення до живого екземпляра!",
      en: "The new operator allocated dynamic heap memory for a real device object. You advanced from blueprint to a live instance!",
      da: "New-operatoren tildelte dynamisk heap-hukommelse til et virkeligt enhedsobjekt. Du gik fra tegning til levende instans!",
    },
  },
  "task-null-reference": {
    id: "task-null-reference",
    tier: 1,
    shortLabel: {
      ua: "10. Null Guard",
      en: "10. Null Guard",
      da: "10. Null Guard",
    },
    goal: {
      ua: "Захистити код перевіркою if (broken != null), щоб уникнути фатального краху NullReferenceException.",
      en: "Protect code with if (broken != null) guard to avoid fatal NullReferenceException crash.",
      da: "Beskyt koden med if (broken != null) kontrol for at undgå fatalt NullReferenceException-nedbrud.",
    },
    ahaTitle: {
      ua: "Вау! Крах NullReference відвернено!",
      en: "Wow! NullReference crash prevented!",
      da: "Wow! NullReference-nedbrud afværget!",
    },
    ahaDesc: {
      ua: "Захисний бар'єр перевірив адресу в пам'яті й не дав процесору звернутися до порожнечі 0x00000000. Продакшн врятовано!",
      en: "The guard verified memory address and prevented dereferencing 0x00000000. Production is saved!",
      da: "Sikkerhedskontrollen verificerede hukommelsesadressen og forhindrede dereferencering af 0x00000000. Produktionen er reddet!",
    },
  },

  // ── Tier 2: АРХІТЕКТУРА (Декомпозиція, Інтерфейси, DI) ────────────────────
  "task-function-encapsulation": {
    id: "task-function-encapsulation",
    tier: 2,
    shortLabel: {
      ua: "1. Функція Mute",
      en: "1. Mute Function",
      da: "1. Mute Funktion",
    },
    goal: {
      ua: "Оголосити функцію Mute(), яка скидає звук телевізора до 0 (tv.Volume = 0), та викликати її.",
      en: "Declare function Mute() that resets TV sound to 0 (tv.Volume = 0) and call it.",
      da: "Erklær funktionen Mute(), der nulstiller tv-lyden til 0 (tv.Volume = 0), og kald den.",
    },
    ahaTitle: {
      ua: "Вау! Власну функцію створено!",
      en: "Wow! Custom function created!",
      da: "Wow! Brugerdefineret funktion oprettet!",
    },
    ahaDesc: {
      ua: "Ви запакували послідовність дій в іменовану функцію Mute(). Тепер не потрібно дублювати рядки коду — викликайте функцію в один клік!",
      en: "You encapsulated logic into named function Mute(). No duplicate code needed — call it in one clean expression!",
      da: "Du indkapslede logik i en navngiven funktion Mute(). Ingen kodekopiering nødvendig — kald den med ét udtryk!",
    },
  },
  "task-antipattern-god-object": {
    id: "task-antipattern-god-object",
    tier: 2,
    shortLabel: {
      ua: "2. God Object",
      en: "2. God Object",
      da: "2. God Object",
    },
    goal: {
      ua: "Декомпонувати велетенський перемикач: виділити дію кнопки CALC в окремий обробник режиму.",
      en: "Decompose monolithic switch: route CALC button into dedicated calculation mode handler.",
      da: "Opdel monolitisk switch: før CALC-knappen til dedikeret tilstandshåndtering.",
    },
    ahaTitle: {
      ua: "Вау! Моноліт декомпоновано!",
      en: "Wow! Monolith decomposed!",
      da: "Wow! Monolit opdelt!",
    },
    ahaDesc: {
      ua: "Замість спагетті-коду з 50 умовами система отримала чіткий маршрутизатор. Архітектура стала модульною!",
      en: "Instead of 50-branch spaghetti switch, the system uses clear route dispatching. Clean modular architecture!",
      da: "I stedet for 50-grenet spaghetti-kode bruger systemet klar rutedispatching. Ren modulær arkitektur!",
    },
  },
  "task-interface-polymorphism": {
    id: "task-interface-polymorphism",
    tier: 2,
    shortLabel: {
      ua: "3. Поліморфізм",
      en: "3. Polymorphism",
      da: "3. Polymorfi",
    },
    goal: {
      ua: "Оголосити команду за інтерфейсом IRemoteCommand (command = new CalcCommand()) і викликати command.Execute().",
      en: "Instantiate command via IRemoteCommand contract (command = new CalcCommand()) and call command.Execute().",
      da: "Instantiér kommando via IRemoteCommand-kontrakten og kald command.Execute()."
    },
    ahaTitle: {
      ua: "Вау! Поліморфізм інтерфейсу в дії!",
      en: "Wow! Interface polymorphism in action!",
      da: "Wow! Grænsefladepolymorfi i aktion!",
    },
    ahaDesc: {
      ua: "Клієнтський код взаємодіє з пультом тільки через контракт IRemoteCommand. Будь-яку команду тепер можна замінити без зміни коду телевізора!",
      en: "Client code talks to remote purely through IRemoteCommand. Any command can now be swapped without altering TV internals!",
      da: "Klientkoden kommunikerer udelukkende via IRemoteCommand. Enhver kommando kan nu udskiftes uden at ændre tv'ets kode!",
    },
  },
  "task-di-container": {
    id: "task-di-container",
    tier: 2,
    shortLabel: {
      ua: "4. DI-контейнер",
      en: "4. DI Container",
      da: "4. DI Container",
    },
    goal: {
      ua: "Зареєструвати команду калькулятора в контейнері залежностей (services.AddTransient<IRemoteCommand, CalcCommand>()).",
      en: "Register calculator command in dependency injection container (services.AddTransient<IRemoteCommand, CalcCommand>()).",
      da: "Registrer lommeregnerkommando i dependency injection-containeren.",
    },
    ahaTitle: {
      ua: "Вау! Залежності впроваджено (IoC)!",
      en: "Wow! Dependencies injected (IoC)!",
      da: "Wow! Afhængigheder injiceret (IoC)!",
    },
    ahaDesc: {
      ua: "Контейнер бере на себе життєвий цикл об'єктів. Принцип Inversion of Control позбавив код жорстких прив'язок `new`!",
      en: "The container manages object lifecycles. Inversion of Control freed architecture from tight `new` couplings!",
      da: "Containeren administrerer objekternes levetid. Inversion of Control frigjorde arkitekturen fra hårde `new`-koblinger!",
    },
  },
  "task-command-registry": {
    id: "task-command-registry",
    tier: 2,
    shortLabel: {
      ua: "5. Реєстр команд",
      en: "5. Command Registry",
      da: "5. Kommandoregister",
    },
    goal: {
      ua: "Створити словник реєстрації команд (Dictionary/Map), зареєструвати кнопку CALC та викликати її за іменем.",
      en: "Create command registry dictionary (Map), register CALC button and invoke it dynamically by key.",
      da: "Opret et kommandoregister (Map), registrer CALC-knappen og kald den dynamisk efter nøgle.",
    },
    ahaTitle: {
      ua: "Вау! Патерн Command повністю розгорнуто!",
      en: "Wow! Command Pattern fully deployed!",
      da: "Wow! Command Pattern fuldt implementeret!",
    },
    ahaDesc: {
      ua: "Реєстр команд пов'язує будь-яку кількість кнопок пульта з обробниками динамічно. Це архітектурний рівень Senior!",
      en: "The command registry connects any remote button to execution handlers dynamically. This is Senior-level architecture!",
      da: "Kommandoregistret forbinder enhver knap med kørselshåndteringer dynamisk. Dette er Senior-arkitektur!",
    },
  },
};

/**
 * Returns localized task pointer metadata with safe fallbacks
 */
export function getTaskPointerMeta(
  taskId: string,
  locale: "ua" | "en" | "da" = "ua"
): {
  shortLabel: string;
  goal: string;
  ahaTitle: string;
  ahaDesc: string;
} {
  const meta = TASK_POINTER_METADATA[taskId];
  const langKey = locale in { ua: 1, en: 1, da: 1 } ? locale : "ua";
  if (meta) {
    return {
      shortLabel: meta.shortLabel[langKey] || meta.shortLabel.ua,
      goal: meta.goal[langKey] || meta.goal.ua,
      ahaTitle: meta.ahaTitle[langKey] || meta.ahaTitle.ua,
      ahaDesc: meta.ahaDesc[langKey] || meta.ahaDesc.ua,
    };
  }

  // Safe fallback for unmapped tasks
  return {
    shortLabel: `#${taskId}`,
    goal: "Напишіть правильний програмний код для керування пристроєм.",
    ahaTitle: "Вау! Завдання успішно виконано!",
    ahaDesc: "Ваш код успішно пройшов валідацію та керує пристроєм у реальному часі!",
  };
}

export interface AnatomyToken {
  token: string;
  label: string;
  isHighlight?: boolean;
}

interface RawAnatomyToken {
  token: string;
  label: {
    ua: string;
    en: string;
    da: string;
  };
  isHighlight?: boolean;
}

/**
 * Returns structured syntax anatomy tokens for each task and language
 */
export function getSyntaxAnatomy(
  taskId: string,
  codeLang: "csharp" | "go" | string,
  locale: "ua" | "en" | "da" = "ua"
): AnatomyToken[] {
  const langKey = locale in { ua: 1, en: 1, da: 1 } ? locale : "ua";

  const getRawTokens = (): RawAnatomyToken[] => {
    switch (taskId) {
      case "task-1-assignment":
        return [
          { token: "tv.IsOn", label: { ua: "стан приладу", en: "device state", da: "enhedstilstand" } },
          { token: "=", label: { ua: "присвоєння", en: "assignment", da: "tildeling" } },
          { token: "true", label: { ua: "значення boolean", en: "boolean literal", da: "boolesk værdi" }, isHighlight: true },
          {
            token: codeLang === "go" ? "\\n" : ";",
            label: { ua: "завершення", en: "terminator", da: "afslutning" },
          },
        ];
      case "task-2-branching":
        return [
          { token: "if", label: { ua: "умова", en: "condition", da: "betingelse" } },
          { token: "(tv.IsOn)", label: { ua: "перевірка стану", en: "state check", da: "tilstandstjek" }, isHighlight: true },
          { token: "{ ... }", label: { ua: "блок дій", en: "action block", da: "handlingsblok" } },
          { token: "else", label: { ua: "інакше", en: "else branch", da: "ellers-gren" } },
        ];
      case "task-variable-mutation":
        return [
          { token: "tv.Channel", label: { ua: "змінна каналу", en: "channel variable", da: "kanalvariabel" } },
          { token: "++", label: { ua: "інкремент (+1)", en: "increment (+1)", da: "inkrement (+1)" }, isHighlight: true },
          {
            token: codeLang === "go" ? "\\n" : ";",
            label: { ua: "завершення", en: "terminator", da: "afslutning" },
          },
        ];
      case "task-boundary-guard":
        return [
          { token: "if (tv.Channel > 4)", label: { ua: "захисна умова", en: "guard clause", da: "sikkerhedsbetingelse" }, isHighlight: true },
          { token: "tv.Channel = 1", label: { ua: "скидання в норму", en: "fallback value", da: "nulstilling" } },
          {
            token: codeLang === "go" ? "\\n" : ";",
            label: { ua: "завершення", en: "terminator", da: "afslutning" },
          },
        ];
      case "task-for-loop":
        return [
          {
            token: codeLang === "go" ? "for i := 1; i <= 4; i++" : "for (int i = 1; i <= 4; i++)",
            label: { ua: "лічильник 1..4", en: "counter 1..4", da: "tæller 1..4" },
            isHighlight: true,
          },
          { token: "tv.Channel = i", label: { ua: "тіло циклу", en: "loop body", da: "løkkekrop" } },
        ];
      case "task-class-instance":
        return [
          {
            token: codeLang === "go" ? "myTv := TV{}" : "TV myTv = new TV()",
            label: { ua: "створення в Heap", en: "Heap allocation", da: "Heap-allokering" },
            isHighlight: true,
          },
          { token: "myTv.PowerOn()", label: { ua: "виклик екземпляра", en: "instance invocation", da: "instanskald" } },
        ];
      case "task-method-return":
        return [
          {
            token: codeLang === "go" ? "vol := tv.GetVolume()" : "int vol = tv.GetVolume()",
            label: { ua: "запит CQS (Query)", en: "CQS query", da: "CQS forespørgsel" },
            isHighlight: true,
          },
          { token: "tv.SetVolume(vol + 10)", label: { ua: "команда CQS (Command)", en: "CQS command", da: "CQS kommando" } },
        ];
      case "task-null-reference":
        return [
          {
            token: codeLang === "go" ? "if broken != nil" : "if (broken != null)",
            label: { ua: "перевірка Null Guard", en: "Null guard check", da: "Null guard tjek" },
            isHighlight: true,
          },
          { token: "broken.PowerOn()", label: { ua: "безпечний виклик", en: "safe invocation", da: "sikkert kald" } },
        ];
      case "task-debug-runaway-loop":
        return [
          { token: "ch <= 5", label: { ua: "виправлена межа", en: "fixed bound", da: "korrigeret grænse" }, isHighlight: true },
          { token: "tv.SetChannel(ch)", label: { ua: "безпечний перехід", en: "safe switch", da: "sikkert skift" } },
        ];
      case "task-debug-off-by-one-overflow":
        return [
          { token: "<= 100", label: { ua: "захист максимуму", en: "maximum guard", da: "maksimumbeskyttelse" }, isHighlight: true },
          { token: "tv.SetBrightness()", label: { ua: "регулювання", en: "regulation", da: "regulering" } },
        ];
      case "task-function-encapsulation":
        return [
          {
            token: codeLang === "go" ? "func Mute() { ... }" : "void Mute() { ... }",
            label: { ua: "оголошення функції", en: "function declaration", da: "funktionserklæring" },
            isHighlight: true,
          },
          { token: "Mute()", label: { ua: "виклик функції", en: "function invocation", da: "funktionskald" } },
        ];
      case "task-antipattern-god-object":
        return [
          { token: "switch (button)", label: { ua: "маршрутизація", en: "route dispatch", da: "rutedispatch" }, isHighlight: true },
          { token: 'case "CALC":', label: { ua: "гілка обробника", en: "handler branch", da: "behandlergren" } },
        ];
      case "task-interface-polymorphism":
        return [
          { token: "IRemoteCommand", label: { ua: "інтерфейсний контракт", en: "interface contract", da: "grænsefladekontrakt" }, isHighlight: true },
          { token: "command.Execute()", label: { ua: "поліморфний виклик", en: "polymorphic call", da: "polymorft kald" } },
        ];
      case "task-di-container":
        return [
          { token: "AddTransient / Register", label: { ua: "реєстрація в IoC", en: "IoC registration", da: "IoC registrering" }, isHighlight: true },
          { token: "IRemoteCommand", label: { ua: "зв'язування контракту", en: "contract binding", da: "kontraktbinding" } },
        ];
      case "task-command-registry":
        return [
          { token: "Dictionary / Map", label: { ua: "динамічний реєстр", en: "dynamic registry", da: "dynamisk register" } },
          { token: "registry[button].Execute()", label: { ua: "динамічний запуск", en: "dynamic dispatch", da: "dynamisk kørsel" } },
        ];
      case "task-0-2-types":
        return [
          { token: "SetChannel(1)", label: { ua: "число (int без лапок)", en: "int (no quotes)", da: "int (uden anførselstegn)" } },
          { token: 'SetLabel("NEWS")', label: { ua: "текст (string у лапках)", en: "string (double quotes)", da: "string (anførselstegn)" }, isHighlight: true },
        ];
      case "task-0-3-sequential":
        return [
          { token: "tv.PowerOn()", label: { ua: "крок 1: живлення", en: "step 1: power", da: "trin 1: strøm" } },
          { token: "tv.SetChannel(2)", label: { ua: "крок 2: канал", en: "step 2: channel", da: "trin 2: kanal" }, isHighlight: true },
        ];
      case "task-0-1-power-on":
      default:
        return [
          { token: "tv", label: { ua: "прилад", en: "device", da: "enhed" } },
          { token: ".", label: { ua: "звернення", en: "member access", da: "adgang" } },
          { token: "PowerOn()", label: { ua: "дія", en: "action", da: "handling" }, isHighlight: true },
          {
            token: codeLang === "go" ? "\\n" : ";",
            label: { ua: "завершення", en: "terminator", da: "afslutning" },
          },
        ];
    }
  };

  return getRawTokens().map((tok) => ({
    token: tok.token,
    label: tok.label[langKey] || tok.label.ua,
    isHighlight: tok.isHighlight,
  }));
}
