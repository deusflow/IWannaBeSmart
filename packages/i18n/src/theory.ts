/**
 * @file packages/i18n/src/theory.ts
 * @description Comprehensive Code Anatomy & Syntax Theory data across all 16 tasks in UA, EN, DA
 */

export interface SyntaxTokenExplanation {
  token: string;
  role: string;
  explanation: string;
}

export interface TaskTheory {
  concept: string;
  tokens: SyntaxTokenExplanation[];
  notes?: string;
  diff?: string;
}

export interface TheoryDictionary {
  badgeBtn: string;
  headerTitle: string;
  conceptTitle: string;
  tokensTitle: string;
  notesTitle: string;
  diffTitle: string;
  hideBtn: string;
  tasks: Record<string, TaskTheory>;
}

// ─────────────────────────────────────────────────────────────────────────────
// UKRAINIAN (UA)
// ─────────────────────────────────────────────────────────────────────────────
export const theoryUa: TheoryDictionary = {
  badgeBtn: "📖 Теорія та анатомія коду",
  headerTitle: "Теорія та анатомія коду",
  conceptTitle: "Фізична та логічна концепція",
  tokensTitle: "Анатомія по токенах (Token Breakdown)",
  notesTitle: "Важливі інженерні нюанси",
  diffTitle: "Різниця C# та Go",
  hideBtn: "Згорнути теорію",
  tasks: {
    "task-0-1-power-on": {
      concept: "Телевізор знеструмлений. Щоб подати живлення, ми викликаємо метод PowerOn на об'єкті tv. Це дія, яка виконується прямо зараз.",
      tokens: [
        { token: "tv", role: "Object (Прилад)", explanation: "Посилання на об'єкт телевізора, який зберігається в пам'яті комп'ютера." },
        { token: ".", role: "Member Access", explanation: "Оператор крапки — доступ до внутрішніх функцій та можливостей приладу." },
        { token: "PowerOn", role: "Method Name", explanation: "Назва конкретної дії або команди (увімкнути живлення)." },
        { token: "()", role: "Invocation Operator", explanation: "Круглі дужки наказують комп'ютеру виконати цю команду прямо зараз." },
        { token: ";", role: "Statement Terminator", explanation: "Крапка з комою в C# означає завершення повної думки (інструкції)." },
      ],
      notes: "Команда в коді — це натискання кнопки на реальному пульті. Без дужок () дія не запуститься, а без крапки з комою ; у C# компілятор видасть синтаксичну помилку.",
      diff: "У C# крапка з комою обов'язкова: tv.PowerOn();. У Go компілятор підставляє її автоматично, тому пишеться tv.PowerOn().",
    },
    "task-0-2-types": {
      concept: "Встановлення каналу цифрою та назви мережі текстом. Комп'ютер суворо розрізняє типи: ціле число (Integer) пишеться без лапок, а текст (String) — строго у подвійних лапках.",
      tokens: [
        { token: "tv", role: "Object (Прилад)", explanation: "Об'єкт телевізора, що приймає команди налаштування." },
        { token: ".", role: "Member Access", explanation: "Оператор доступу до методів об'єкта." },
        { token: "SetChannel", role: "Method Name", explanation: "Дія налаштування номера телеканалу." },
        { token: "(1)", role: "Integer Argument", explanation: "Ціле число 1 (Integer Literal) без лапок. Комп'ютер розуміє його як математичне число." },
        { token: "SetLabel", role: "Method Name", explanation: "Дія встановлення текстового підпису мовної мережі." },
        { token: '("NEWS")', role: "String Argument", explanation: 'Текст "NEWS" (String Literal) строго у подвійних лапках, для якого виділяється пам\'ять під рядок символів.' },
        { token: ";", role: "Statement Terminator", explanation: "Крапка з комою після кожної завершеної інструкції в C#." },
      ],
      notes: "Якщо написати 1 у лапках \"1\", комп'ютер сприйме це як картинку-символ, а не номер каналу. Якщо написати NEWS без лапок, компілятор шукатиме змінну з такою назвою і повідомить про помилку.",
      diff: "У C# ми завершуємо кожну команду крапкою з комою: tv.SetChannel(1); tv.SetLabel(\"NEWS\");. У Go інструкції розділяються новим рядком або крапкою з комою без обов'язкового кінцевого термінатора.",
    },
    "task-0-3-sequential": {
      concept: "Послідовність команд. Якщо спробувати перемкнути канал на вимкненому телевізорі, екран не зреагує. Процесор читає і виконує код суворо згори донизу, рядок за рядком.",
      tokens: [
        { token: "tv.PowerOn()", role: "First Statement", explanation: "Перша інструкція: подає живлення та переводить екран у робочий стан." },
        { token: ";", role: "Statement Terminator", explanation: "Роздільник команд, що вказує на перехід до наступної дії." },
        { token: "tv.SetChannel(2)", role: "Second Statement", explanation: "Друга інструкція: перемикає вже увімкнений телевізор на 2-й канал." },
      ],
      notes: "Комп'ютер — точний виконавець без людської здогадки. Послідовність інструкцій (Control Flow) критично впливає на фізичний результат приладу.",
      diff: "І в C#, і в Go виконання є послідовним. У C# роздільником є ';', у Go команди записуються з нового рядка.",
    },
    "task-1-assignment": {
      concept: "Ми підключаємо живлення до телевізора. У коді це означає звернутися до потрібного пристрою в пам'яті комп'ютера та записати в його перемикач стан 'увімкнено'.",
      tokens: [
        { token: "tv", role: "Object", explanation: "Назва об'єкта телевізора, розміщеного в оперативній пам'яті." },
        { token: ".", role: "Member Access", explanation: "Оператор доступу (крапка) — заглядає всередину об'єкта, відкриваючи його властивості та методи." },
        { token: "IsOn", role: "Property", explanation: "Властивість-перемикач, яка зберігає поточний стан живлення (true або false)." },
        { token: "=", role: "Assignment", explanation: "Оператор присвоєння — записує значення праворуч у комірку пам'яті ліворуч (не плутати з математичним рівнянням!)." },
        { token: "true", role: "Boolean", explanation: "Логічний літерал 'істина' (стан 'увімкнено')." },
        { token: ";", role: "Terminator", explanation: "Крапка з комою — сигнал для компілятора C#, що інструкція завершена." },
      ],
      notes: "Символ '=' у програмуванні — це дія запису в пам'ять: 'візьми те, що праворуч, і поклади у змінну ліворуч'. Для перевірки на рівність використовують подвійний знак '=='.",
      diff: "У C# крапка з комою ';' є суворо обов'язковою наприкінці кожної інструкції. У Go компілятор підставляє її автоматично, тому писати ';' не потрібно.",
    },
    "task-2-branching": {
      concept: "Ми створюємо поведінку кнопки перемикача: прилад перевіряє свій поточний стан, і якщо він уже працював — вимикається, а якщо був вимкнений — вмикається.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Ключове слово умови — виконує блок коду, якщо умова всередині обчислюється як true." },
        { token: "(tv.IsOn)", role: "Condition", explanation: "Логічний вираз для перевірки: чи працює зараз телевізор." },
        { token: "{ }", role: "Scope Braces", explanation: "Фігурні дужки — окреслюють межі блоку команд, що виконується за певної умови." },
        { token: "else", role: "Keyword", explanation: "Гілка 'інакше' — блок, який спрацьовує тоді, коли перша умова виявилася false." },
      ],
      notes: "Розгалуження — фундамент логіки програм. Воно дозволяє коду діяти за сценарієм 'якщо X — роби одне, інакше — інше'.",
      diff: "У C# умова обов'язково береться в круглі дужки: if (tv.IsOn). У Go круглі дужки не потрібні: if tv.IsOn.",
    },
    "task-variable-mutation": {
      concept: "Ми збільшуємо номер активного каналу на одиницю. Це операція модифікації існуючого значення в комірці пам'яті.",
      tokens: [
        { token: "tv.Channel", role: "Property", explanation: "Числова властивість об'єкта телевізора, яка зберігає поточний номер каналу." },
        { token: "++", role: "Increment", explanation: "Оператор інкременту — збільшує числове значення на 1 (короткий запис для Channel = Channel + 1)." },
        { token: ";", role: "Terminator", explanation: "Завершення інструкції в C#." },
      ],
      notes: "Оператор ++ змінює значення змінної прямо на місці (мутація стану), не вимагаючи повторного написання її імені.",
      diff: "У Go оператор ++ є інструкцією (statement), а не виразом. Його не можна комбінувати з присвоєнням в одному рядку.",
    },
    "task-boundary-guard": {
      concept: "Ми створюємо запобіжник (Guard Clause): якщо номер каналу перевищує допустимий ліміт сітки мовлення, він автоматично скидається на 1.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Перевірка захисного бар'єра перед виконанням наступних кроків." },
        { token: ">", role: "Comparison", explanation: "Оператор порівняння 'більше': повертає true, якщо ліве значення більше за праве." },
        { token: "4", role: "Number Literal", explanation: "Максимально допустимий номер каналу для нашого телевізора." },
        { token: "tv.Channel = 1;", role: "Reset Assignment", explanation: "Скидання стану на перший канал при виході за межі діапазону." },
      ],
      notes: "Guard Clauses захищають системи від аварійного падіння: вони перевіряють некоректні дані на самому вході та негайно їх виправляють.",
      diff: "Логіка перевірки ідентична в C# та Go, за винятком круглих дужок в if та крапки з комою.",
    },
    "task-for-loop": {
      concept: "Ми запускаємо автопошук каналів: комп'ютер послідовно проходить каналами від 1 до 4, змінюючи стан на кожному кроці.",
      tokens: [
        { token: "for", role: "Loop Keyword", explanation: "Ключове слово для запуску циклу з лічильником." },
        { token: "int i = 1", role: "Initializer", explanation: "Створення змінної лічильника i зі стартовим значенням 1 (у Go: i := 1)." },
        { token: "i <= 4", role: "Condition", explanation: "Умова продовження: цикл виконується, доки i не перевищить 4." },
        { token: "i++", role: "Step / Increment", explanation: "Крок ітерації: збільшення лічильника на 1 після кожного проходу." },
        { token: "tv.Channel = i;", role: "Body Assignment", explanation: "Тіло циклу: запис поточного значення лічильника в канал телевізора." },
      ],
      notes: "Цикл for автоматизує рутинні повторювані дії: замість 4 однакових рядків ми пишемо одну компактну конструкцію.",
      diff: "У C# тип лічильника оголошується явно (int i = 1), а в Go використовується короткий синтаксис (i := 1).",
    },
    "task-class-instance": {
      concept: "Клас — це креслення пристрою, а екземпляр — фізично створений у купі пам'яті (Heap) об'єкт. Оператор new виділяє пам'ять та повертає посилання.",
      tokens: [
        { token: "TV", role: "Type / Class", explanation: "Назва класу — креслення типу даних." },
        { token: "myTv", role: "Variable Name", explanation: "Ім'я змінної-посилання на стеку, що зберігає адресу об'єкта." },
        { token: "new", role: "Allocation Operator", explanation: "Оператор виділення динамічної пам'яті в керованій купі (Heap)." },
        { token: "TV() / TV{}", role: "Constructor Call", explanation: "Виклик конструктора класу (в C#) або ініціалізація структури (в Go)." },
        { token: "myTv.PowerOn()", role: "Instance Method Call", explanation: "Виклик методу на конкретному створеному екземплярі." },
      ],
      notes: "Без створення екземпляра через new об'єкт не існує у пам'яті: клас без об'єкта — це лише опис типу на папері.",
      diff: "У C#: TV myTv = new TV(); myTv.PowerOn();. У Go: myTv := TV{} myTv.PowerOn().",
    },
    "task-method-return": {
      concept: "Методи бувають Командами (змінюють стан без повернення) та Запитами (читають значення і повертають його). tv.GetVolume() повертає число, яке ми захоплюємо у змінну.",
      tokens: [
        { token: "int / :=", role: "Type / Declaration", explanation: "Оголошення змінної для збереження повернутого результату." },
        { token: "vol", role: "Variable", explanation: "Локальна змінна на стеку, яка приймає повернене числове значення." },
        { token: "tv.GetVolume()", role: "Query Method", explanation: "Виклик методу-запиту: він зчитує стан без побічних мутацій." },
        { token: "vol + 10", role: "Arithmetic Expression", explanation: "Арифметичне обчислення нового значення на основі отриманого." },
        { token: "tv.SetVolume(...)", role: "Command Method", explanation: "Метод-мутатор, який записує нове значення гучності." },
      ],
      notes: "Command-Query Separation (CQS): метод-запит не повинен змінювати стан системи, а метод-команда не повинен повертати дані.",
      diff: "У C# тип результату вказується явно int vol = tv.GetVolume();. У Go використовується скорочений вираз vol := tv.GetVolume().",
    },
    "task-null-reference": {
      concept: "Порожнє посилання null (nil у Go) вказує на адресу 0x0. Звернення до нього викликає фатальний крах NullReferenceException. Захисна умова if (broken != null) рятує програму від падіння.",
      tokens: [
        { token: "TV broken = null", role: "Null Declaration", explanation: "Змінна вказівника на стеку зі значенням 0x00000000 (у Go: var broken *TV = nil)." },
        { token: "if", role: "Guard Keyword", explanation: "Умовний захисний бар'єр перед виконанням небезпечної операції." },
        { token: "broken != null", role: "Null Safety Check", explanation: "Перевірка адреси: чи існує живий екземпляр у пам'яті (у Go: broken != nil)." },
        { token: "broken.PowerOn()", role: "Guarded Call", explanation: "Безпечний виклик, який виконується лише за умови наявності об'єкта." },
        { token: "broken?.PowerOn()", role: "Safe Navigation", explanation: "Оператор Elvis (C#): якщо посилання null, виклик тихо оминається без падіння." },
      ],
      notes: "NullReferenceException (NRE) — найчастіша причина аварій у продакшні. Захисні перевірки усувають 99% таких падінь.",
      diff: "У C# використовується null та safe navigation ?.. У Go використовується nil і явна перевірка if broken != nil.",
    },
    "task-function-encapsulation": {
      concept: "Ми упаковуємо послідовність дій в іменовану функцію Mute(), щоб викликати її за потреби однією командою з будь-якого місця програми.",
      tokens: [
        { token: "void / func", role: "Declaration", explanation: "Оголошення функції. void (C#) означає, що функція не повертає значення; func — ключове слово в Go." },
        { token: "Mute", role: "Identifier", explanation: "Унікальне ім'я функції, за яким до неї звертаються." },
        { token: "( )", role: "Parameter List", explanation: "Круглі дужки для списку параметрів (тут порожні, оскільки вхідні дані не потрібні)." },
        { token: "{ ... }", role: "Body", explanation: "Тіло функції, яке виконується при кожному її виклику." },
        { token: "Mute();", role: "Invocation", explanation: "Сам виклик функції: комп'ютер переходить до виконання її тіла." },
      ],
      notes: "Інкапсуляція у функції рятує код від дублювання: ви змінюєте алгоритм в одному місці, і він оновлюється скрізь.",
      diff: "У C# тип повернення стоїть перед назвою функції (void Mute()), а в Go спочатку йде ключове слово func (func Mute()).",
    },
    "task-antipattern-god-object": {
      concept: "Ми зіштовхуємося з болем процедурного підходу: велетенський перемикач switch, який доводиться постійно переписувати при додаванні кожної нової кнопки.",
      tokens: [
        { token: "switch", role: "Dispatcher", explanation: "Конструкція вибору одного з багатьох варіантів на основі значення змінної." },
        { token: "case", role: "Branch", explanation: "Окрема гілка для конкретного значення (наприклад, кнопки 'CALC')." },
        { token: ":", role: "Separator", explanation: "Двокрапка відокремлює умову випадку від інструкцій, які слід виконати." },
        { token: "break;", role: "Exit Control", explanation: "Обов'язковий вихід із блоку switch у C#, щоб не провалитися в наступні гілки." },
        { token: "default:", role: "Fallback", explanation: "Гілка за замовчуванням: виконується, якщо жоден case не підійшов." },
      ],
      notes: "Гігантські switch порушують принцип Open-Closed: щоразу при додаванні фічі доводиться лізти всередину старого коду і ризикувати зламати його.",
      diff: "У C# інструкція break наприкінці case є обов'язковою. У Go вихід із case відбувається автоматично.",
    },
    "task-interface-polymorphism": {
      concept: "Ми розділяємо контракт і реалізацію: пульт більше не знає нутрощів телевізора, він просто тисне єдину кнопку Execute() через Interface розетку.",
      tokens: [
        { token: "IRemoteCommand", role: "Interface Type", explanation: "Тип контракту (інтерфейс): гарантує наявність методу Execute() у будь-якого пристрою." },
        { token: "command", role: "Variable", explanation: "Змінна інтерфейсного типу, в яку можна підставити будь-яку сумісну команду." },
        { token: "new CalcCommand()", role: "Instantiation", explanation: "Створення конкретного екземпляра команди в C# (у Go: CalcCommand{})." },
        { token: "command.Execute();", role: "Polymorphic Call", explanation: "Виклик дії: контролер не знає, що саме всередині, але впевнений, що дія виконається." },
      ],
      notes: "Поліморфізм дозволяє підміняти поведінку на льоту без зміни коду контролера. Це основа чистих комерційних архітектур.",
      diff: "У C# клас явно вказує спадкування від інтерфейсу (: IRemoteCommand). У Go діє 'качина типізація' (duck typing) — інтерфейс реалізується неявно.",
    },
    "task-di-container": {
      concept: "Ми забороняємо створювати об'єкти вручну через new: замість цього реєструємо пару 'контракт -> реалізація' у DI-контейнері інверсії управління.",
      tokens: [
        { token: "services", role: "IoC Container", explanation: "Контейнер залежностей (Inversion of Control), який керує створенням об'єктів у програмі." },
        { token: "AddTransient / Register", role: "Lifecycle Method", explanation: "Метод реєстрації залежності: визначає, коли створювати екземпляр." },
        { token: "<IRemoteCommand, CalcCommand>", role: "Generics Binding", explanation: "Параметри типу: вказують, яку конкретну реалізацію видавати на запит інтерфейсу." },
        { token: "( )", role: "Method Arguments", explanation: "Виклик конфігураційного методу контейнера." },
      ],
      notes: "Inversion of Control (IoC): не ваш код створює залежності, а фреймворк автоматично подає їх у потрібне місце.",
      diff: "У C# контейнер Microsoft.Extensions.DependencyInjection спирається на Generics <TInterface, TImpl>. У Go використовується реєстрація за іменем або фабрикою.",
    },
    "task-command-registry": {
      concept: "Ми досягаємо абсолютної гнучкості архітектури: замінюємо жорсткий switch на динамічну таблицю (Dictionary / map), куди команди додаються як плагіни.",
      tokens: [
        { token: "Dictionary / map", role: "Data Structure", explanation: "Хеш-таблиця (словник) пар 'ключ -> значення' з миттєвим доступом O(1)." },
        { token: "<string, IRemoteCommand>", role: "Type Arguments", explanation: "Ключ — назва кнопки ('CALC'), значення — поліморфна команда інтерфейсу." },
        { token: 'registry["CALC"]', role: "Indexer", explanation: "Квадратні дужки для збереження або отримання команди за її унікальним ключем." },
        { token: ".Execute();", role: "Direct Invocation", explanation: "Виконання знайденої в таблиці команди без жодного умовного оператора if чи switch!" },
      ],
      notes: "Це патерн Command + Registry: щоб додати 100 нових кнопок, не треба чіпати диспетчер — достатньо зареєструвати новий ключ у словнику.",
      diff: "У C# тип оголошується як Dictionary<K, V>. У Go це вбудований тип map[K]V.",
    },
    "task-pos-guard-clause": {
      concept: "Ми захищаємо банківський рахунок від овердрафту: якщо запитана сума перевищує залишок, транзакція негайно відхиляється без списання.",
      tokens: [
        { token: "amount > balance", role: "Condition", explanation: "Перевірка перевищення суми покупки над доступними коштами на рахунку." },
        { token: 'status = "DECLINED"', role: "State Mutation", explanation: "Встановлення статусу відхилення транзакції для відображення на екрані POS." },
        { token: "return;", role: "Early Exit", explanation: "Негайний вихід із функції: код списання балансу нижче ніколи не виконається." },
      ],
      notes: "Early Return запобігає 'спагеті-коду' з глибокими вкладеностями і гарантує безпеку балансу клієнта.",
      diff: "У Go умова пишеться без круглих дужок (if amount > balance), а крапка з комою після return не потрібна.",
    },
    "task-pos-fee-calculation": {
      concept: "Ми розраховуємо кінцеву вартість транзакції з банківською комісією та проводимо списання коштів з балансу.",
      tokens: [
        { token: "totalAmount", role: "Variable", explanation: "Кінцева сума до списання, що включає вартість покупки та збір." },
        { token: "amount + fee", role: "Arithmetic Addition", explanation: "Операція додавання базової суми та комісії платіжного шлюзу." },
        { token: "-=", role: "Compound Assignment", explanation: "Оператор віднімання з присвоєнням: balance -= totalAmount зменшує баланс на зазначену суму." },
        { token: 'status = "APPROVED"', role: "Status Update", explanation: "Підтвердження успішної авторизації коштів платіжною системою." },
      ],
      notes: "Оператор -= є скороченням для balance = balance - totalAmount і є стандартним патерном мутації стану у фінтех-системах.",
      diff: "Оператори +=, -= працюють абсолютно ідентично в C# та Go.",
    },
    "task-pos-pin-lockout": {
      concept: "Ми будуємо апаратний захист від перебору PIN-коду: після трьох невдалих спроб клавіатура термінала блокується, а статус переходить у BLOCKED.",
      tokens: [
        { token: "pin != enteredPin", role: "Inequality Check", explanation: "Оператор 'не дорівнює': повертає true, якщо введений клієнтом PIN не збігається з еталоном." },
        { token: "failedAttempts++", role: "Failure Counter", explanation: "Інкремент лічильника помилкових введень на одиницю." },
        { token: "failedAttempts >= 3", role: "Threshold Condition", explanation: "Перевірка досягнення ліміту спроб (3 або більше)." },
        { token: "isLocked = true", role: "Hardware Lock", explanation: "Активація прапорця апаратного блокування термінала." },
      ],
      notes: "Це реалізація кінцевого автомата (State Machine): прилад змінює свій внутрішній режим безпеки, захищаючи карту від крадіжки коштів.",
      diff: "Обидві мови використовують оператори != та >= для порівняння значень.",
    },
    "task-pos-batch-settlement": {
      concept: "Ми виконуємо закриття банківської зміни (Z-звіт): проходимо по всіх транзакціях за день та підсумовуємо загальний денний виторг для чека.",
      tokens: [
        { token: "for", role: "Iteration Loop", explanation: "Цикл для обходу списку транзакцій." },
        { token: "int i = 0", role: "Zero-based Index", explanation: "Старт з нульового елемента (у програмуванні списки завжди індексуються з 0!)." },
        { token: ".Length / len()", role: "Collection Size", explanation: "Кількість транзакцій у масиві (Length у C#, len у Go)." },
        { token: "transactions[i]", role: "Array Indexing", explanation: "Отримання суми конкретної транзакції під номером i за допомогою квадратних дужок." },
        { token: "dailyTotal +=", role: "Accumulator", explanation: "Накопичення суми кожної транзакції в загальний денний підсумок." },
      ],
      notes: "Індексація масивів з нуля — одна з найпоширеніших причин помилок новачка (Off-by-one error). Останній елемент масиву має індекс Length - 1.",
      diff: "У C# довжина масиву отримується через властивість transactions.Length, а в Go — через глобальну функцію len(transactions).",
    },
    "task-pos-interface-polymorphism": {
      concept: "Термінал викликає єдиний контракт gateway.Charge(amount). Він не знає, яка платіжна система підключена фізично (Dankort, Visa, Mastercard) — за це відповідає Interface.",
      tokens: [
        { token: "bool / approved :=", role: "Result Variable", explanation: "Оголошення змінної, яка приймає рішення банку (true = успішно, false = відхилено)." },
        { token: "gateway", role: "Interface Instance", explanation: "Екземпляр платіжного шлюзу, що реалізує контракт IPaymentGateway." },
        { token: ".Charge(totalAmount)", role: "Method Call", explanation: "Виклик контрактного методу з передачею суми до списання." },
        { token: "!approved", role: "Logical NOT", explanation: "Знак оклику означає заперечення ('НЕ схвалено'): скорочення для approved == false." },
      ],
      notes: "Поліморфізм дозволяє додавати підтримку Apple Pay, Google Pay або криптовалют без жодної правки в коді POS-термінала!",
      diff: "У Go оголошення змінної та виклик зазвичай записують через ':=' (approved := gateway.Charge(...)), а в C# вказують явний тип bool.",
    },
    "task-pos-dependency-injection": {
      concept: "Ми підключаємо конкретний банківський шлюз DankortGateway до термінала через контейнер Inversion of Control, не змінюючи бізнес-код процесингу.",
      tokens: [
        { token: "services / container", role: "IoC Registry", explanation: "Контейнер сервісів програми, де зберігаються всі правила створення об'єктів." },
        { token: "AddScoped / Register", role: "Registration Method", explanation: "Реєстрація залежності: сервіс житиме в межах однієї фінансової транзакції." },
        { token: "<IPaymentGateway, DankortGateway>", role: "Type Mapping", explanation: "Прив'язка інтерфейсу-контракту до конкретної реалізації платіжного шлюзу Dankort." },
      ],
      notes: "Dependency Injection робить систему тестованою: для модульних тестів замість реального банку підставляється MockGateway з фейковими грошима.",
      diff: "У C# реєстрація відбувається через типізовані Generics <TInterface, TImpl>. У Go реєстрація здійснюється за рядковим ключем та екземпляром.",
    },
    "task-debug-runaway-loop": {
      concept: "Діагностика нескінченного циклу: помилка декременту (ch--) замість інкременту (ch++). Умова виходу ніколи не досягається, що призводить до зависання процесора та спрацювання апаратного Watchdog.",
      tokens: [
        { token: "for", role: "Loop Statement", explanation: "Керуюча конструкція циклу з лічильником." },
        { token: "int ch = 1", role: "Loop Initialization", explanation: "Початковий стан лічильника каналів (починаємо з 1)." },
        { token: "ch <= 5", role: "Loop Invariant Condition", explanation: "Умова продовження: цикл виконується, доки номер каналу не перевищує 5." },
        { token: "ch++", role: "Corrected Step Operation", explanation: "Інкремент збільшує лічильник каналів на 1 щоітерації, наближаючи завершення циклу." },
      ],
      notes: "Якщо замість ch++ написати ch--, лічильник буде спадати (1, 0, -1, -2...), умова ch <= 5 ніколи не стане false, і програма зависне назавжди.",
      diff: "У C#: for (int ch = 1; ch <= 5; ch++). У Go: for ch := 1; ch <= 5; ch++.",
    },
    "task-debug-off-by-one-overflow": {
      concept: "Діагностика фізичного перевантаження CRT (Off-by-One / Boundary Violation). Значення яскравості 101% перевищує фізичний ліміт 100% і спалює запобіжник. Потрібен Guard Clause.",
      tokens: [
        { token: "if", role: "Defensive Guard", explanation: "Захисна умова, що перевіряє безпечність вхідних даних перед передачею в апаратний драйвер." },
        { token: "requestedBrightness <= 100", role: "Boundary Check", explanation: "Перевірка фізичного інваріанта: яскравість не повинна перевищувати 100%." },
        { token: "tv.SetBrightness()", role: "Safe Invocation", explanation: "Виклик налаштування виконується лише тоді, коли значення гарантовано безпечне." },
      ],
      notes: "Off-by-One та відсутність перевірки меж є головною причиною аппаратних відмов та переповнення буферів у системному програмуванні.",
      diff: "У C#: if (requestedBrightness <= 100) { tv.SetBrightness(...); }. У Go: if requestedBrightness <= 100 { tv.SetBrightness(...) }.",
    },
    "task-pos-double-deduction-bug": {
      concept: "Діагностика подвійної мутації (Double Deduction / Broken Invariant). Комісія fee списується окремо і водночас включена у totalAmount, що призводить до подвійного списання з рахунку клієнта.",
      tokens: [
        { token: "totalAmount = amount + fee", role: "Composite Amount", explanation: "Агрегація загальної суми транзакції з урахуванням обов'язкової комісії." },
        { token: "balance -= totalAmount", role: "Atomic Mutation", explanation: "Єдине коректне списання повної суми з рахунку." },
        { token: "// balance -= fee", role: "Redundant Mutation", explanation: "Зайвий рядок, який спричиняв повторне списання комісії. Повинен бути видалений." },
      ],
      notes: "Кожна транзакція в банку має бути строго ідемпотентною або списувати кошти строго через єдину агреговану проводку (Single-source mutation).",
      diff: "У C#: decimal totalAmount = amount + fee; balance -= totalAmount;. У Go: totalAmount := amount + fee \\n balance -= totalAmount.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ENGLISH (EN)
// ─────────────────────────────────────────────────────────────────────────────
export const theoryEn: TheoryDictionary = {
  badgeBtn: "📖 Theory & Code Anatomy",
  headerTitle: "Theory & Code Anatomy",
  conceptTitle: "Physical & Logical Concept",
  tokensTitle: "Syntax Anatomy (Token Breakdown)",
  notesTitle: "Key Engineering Insights",
  diffTitle: "C# vs Go Differences",
  hideBtn: "Collapse Theory",
  tasks: {
    "task-0-1-power-on": {
      concept: "The TV is unpowered. To supply power, we invoke the PowerOn method on the tv object. This triggers an action immediately.",
      tokens: [
        { token: "tv", role: "Object", explanation: "Reference to the TV device object allocated in computer memory." },
        { token: ".", role: "Member Access", explanation: "The dot operator accesses functions and capabilities inside the object." },
        { token: "PowerOn", role: "Method Name", explanation: "The specific action identifier (power on)." },
        { token: "()", role: "Invocation Operator", explanation: "Parentheses command the runtime to execute this method right now." },
        { token: ";", role: "Statement Terminator", explanation: "Semicolon signals to the C# compiler that the instruction is complete." },
      ],
      notes: "A command in code is like pressing a physical button on a remote. Without parentheses (), the action does not execute; without semicolon ; in C#, a syntax error is raised.",
      diff: "In C#, semicolons are mandatory: tv.PowerOn();. In Go, the compiler injects them automatically, so you write tv.PowerOn().",
    },
    "task-0-2-types": {
      concept: "Setting the channel with a number and network label with text. The compiler strictly separates types: integers (numbers) are written without quotes, while strings (text) must be wrapped in double quotes.",
      tokens: [
        { token: "tv", role: "Object", explanation: "The TV device object accepting configuration commands." },
        { token: ".", role: "Member Access", explanation: "Member access operator exposing TV methods." },
        { token: "SetChannel", role: "Method Name", explanation: "Action configuring the channel number." },
        { token: "(1)", role: "Integer Argument", explanation: "Integer literal 1 without quotes. Stored directly as a primitive number in memory." },
        { token: "SetLabel", role: "Method Name", explanation: "Action configuring the broadcast network label." },
        { token: '("NEWS")', role: "String Argument", explanation: 'String literal "NEWS" wrapped in double quotes, which allocates memory for character text (String Allocation).' },
        { token: ";", role: "Statement Terminator", explanation: "Semicolon marking the end of each completed instruction in C#." },
      ],
      notes: "Writing 1 in quotes \"1\" treats it as a character symbol rather than a mathematical number. Writing NEWS without quotes causes the compiler to look for a non-existent variable name.",
      diff: 'In C#, each statement ends with a semicolon: tv.SetChannel(1); tv.SetLabel("NEWS");. In Go, statements are separated by newlines or semicolons without trailing semicolons.',
    },
    "task-0-3-sequential": {
      concept: "Sequential execution. If you try to switch channels on a powered-off TV, the display does not react. The CPU processes and executes instructions strictly top-to-bottom, line by line.",
      tokens: [
        { token: "tv.PowerOn()", role: "First Statement", explanation: "First statement: supplies power and activates the device screen." },
        { token: ";", role: "Statement Terminator", explanation: "Instruction terminator moving the instruction pointer to the next line." },
        { token: "tv.SetChannel(2)", role: "Second Statement", explanation: "Second statement: switches the already running TV to channel 2." },
      ],
      notes: "Computers follow instructions literally. Instruction ordering (Control Flow) directly determines the physical state of the hardware.",
      diff: "Both C# and Go execute top-to-bottom sequentially. In C#, instructions terminate with ';', whereas Go separates statements via newlines.",
    },
    "task-1-assignment": {
      concept: "We supply power to the television. In code, this means accessing the specific object in computer memory and writing the 'on' state into its switch property.",
      tokens: [
        { token: "tv", role: "Object", explanation: "Name of the TV object allocated in working memory." },
        { token: ".", role: "Member Access", explanation: "Member access operator (dot) — reaches inside the object to expose properties and methods." },
        { token: "IsOn", role: "Property", explanation: "State switch property holding current power status (true or false)." },
        { token: "=", role: "Assignment", explanation: "Assignment operator — stores the right-hand value into the left memory slot (not math equality!)." },
        { token: "true", role: "Boolean", explanation: "Boolean literal representing truth ('powered on')." },
        { token: ";", role: "Terminator", explanation: "Semicolon — signals statement termination to the C# compiler." },
      ],
      notes: "The '=' symbol in code is an action of writing into memory: 'evaluate what's on the right and put it in the box on the left'. Equality checking uses '=='.",
      diff: "C# strictly requires a terminating semicolon ';' on each statement. Go automatically inserts it during compilation, so semicolons are omitted.",
    },
    "task-2-branching": {
      concept: "We build toggle behavior: the device inspects its current state; if already on, it powers down; if off, it powers on.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Condition keyword — executes the enclosed code block only when the expression evaluates to true." },
        { token: "(tv.IsOn)", role: "Condition", explanation: "Boolean expression to evaluate: whether the TV is currently running." },
        { token: "{ }", role: "Scope Braces", explanation: "Curly braces — define the boundary of commands belonging to this branch." },
        { token: "else", role: "Keyword", explanation: "Fallback branch — executed when the preceding condition evaluates to false." },
      ],
      notes: "Branching is the core of program logic, enabling machines to react dynamically to changing environments.",
      diff: "C# requires parentheses around if conditions: if (tv.IsOn). Go omits parentheses: if tv.IsOn.",
    },
    "task-variable-mutation": {
      concept: "We increment the active channel number by one. This directly modifies the value stored inside the memory slot.",
      tokens: [
        { token: "tv.Channel", role: "Property", explanation: "Numeric property storing the TV's active channel number." },
        { token: "++", role: "Increment", explanation: "Increment operator — increases value by 1 (shorthand for Channel = Channel + 1)." },
        { token: ";", role: "Terminator", explanation: "Statement terminator in C#." },
      ],
      notes: "The ++ operator mutates variable state in-place without needing to repeat the identifier name.",
      diff: "In Go, ++ is a statement rather than an expression and cannot be combined into assignment expressions.",
    },
    "task-boundary-guard": {
      concept: "We install a Guard Clause: if the channel exceeds the broadcaster boundary, it safely resets to 1.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Safety barrier check executed before proceeding." },
        { token: ">", role: "Comparison", explanation: "Greater-than operator: returns true if left operand strictly exceeds right operand." },
        { token: "4", role: "Number Literal", explanation: "Upper bound of TV channels supported by hardware." },
        { token: "tv.Channel = 1;", role: "Reset Assignment", explanation: "Resets the state back to channel 1 upon boundary violation." },
      ],
      notes: "Guard Clauses protect production software: they inspect invalid input early and correct or reject it before failures cascade.",
      diff: "Condition logic is identical; C# uses parentheses and semicolons, while Go omits both.",
    },
    "task-for-loop": {
      concept: "We execute an automated channel scan: the computer iterates through channels 1 to 4, mutating the device state on each step.",
      tokens: [
        { token: "for", role: "Loop Keyword", explanation: "Keyword declaring a counted loop." },
        { token: "int i = 1", role: "Initializer", explanation: "Declares counter variable i starting at 1 (Go: i := 1)." },
        { token: "i <= 4", role: "Condition", explanation: "Continuation condition: loop executes while i does not exceed 4." },
        { token: "i++", role: "Step / Increment", explanation: "Step expression: increments counter after each iteration." },
        { token: "tv.Channel = i;", role: "Body Assignment", explanation: "Loop body: updates device channel to current counter value." },
      ],
      notes: "The for loop prevents code repetition: instead of 4 duplicate lines, we express intent in a single compact construct.",
      diff: "C# explicitly types loop counters (int i = 1), whereas Go utilizes short declaration syntax (i := 1).",
    },
    "task-class-instance": {
      concept: "A class is a structural blueprint, while an instance is a living object allocated in Heap memory. The new operator allocates memory and returns an object reference.",
      tokens: [
        { token: "TV", role: "Type / Class", explanation: "Type identifier representing the class blueprint." },
        { token: "myTv", role: "Variable Name", explanation: "Stack reference variable storing the Heap address of the created object." },
        { token: "new", role: "Allocation Operator", explanation: "Allocates dynamic memory in the managed Heap." },
        { token: "TV() / TV{}", role: "Constructor Call", explanation: "Executes class constructor (C#) or initializes struct fields (Go)." },
        { token: "myTv.PowerOn()", role: "Instance Method Call", explanation: "Invokes method on the specific created instance." },
      ],
      notes: "Without instantiating via new, an object does not exist in memory: a class without an instance is just an abstract blueprint.",
      diff: "In C#: TV myTv = new TV(); myTv.PowerOn();. In Go: myTv := TV{} myTv.PowerOn().",
    },
    "task-method-return": {
      concept: "Methods are either Commands (mutating state without return) or Queries (inspecting state and returning data). tv.GetVolume() returns a number captured into a stack variable.",
      tokens: [
        { token: "int / :=", role: "Type / Declaration", explanation: "Variable declaration to store the returned numerical result." },
        { token: "vol", role: "Variable", explanation: "Stack variable capturing the return value." },
        { token: "tv.GetVolume()", role: "Query Method", explanation: "Query method call: reads volume without triggering side-effect mutations." },
        { token: "vol + 10", role: "Arithmetic Expression", explanation: "Evaluates new value using processor ALU before applying change." },
        { token: "tv.SetVolume(...)", role: "Command Method", explanation: "Mutator command updating internal hardware volume." },
      ],
      notes: "Command-Query Separation (CQS): query methods should never mutate state, and command methods should avoid returning business data.",
      diff: "C# explicitly declares the return type int vol = tv.GetVolume();. Go uses short variable declaration vol := tv.GetVolume().",
    },
    "task-null-reference": {
      concept: "A null pointer (nil in Go) points to address 0x0. Accessing members on null triggers a fatal NullReferenceException crash. A Guard check if (broken != null) protects runtime stability.",
      tokens: [
        { token: "TV broken = null", role: "Null Declaration", explanation: "Stack pointer initialized to memory address 0x00000000 (Go: var broken *TV = nil)." },
        { token: "if", role: "Guard Keyword", explanation: "Conditional guard checking reference validity before execution." },
        { token: "broken != null", role: "Null Safety Check", explanation: "Address comparison ensuring the instance physically exists in memory." },
        { token: "broken.PowerOn()", role: "Guarded Call", explanation: "Safe execution invoked only when instance reference is non-null." },
        { token: "broken?.PowerOn()", role: "Safe Navigation", explanation: "Elvis operator (C#): silently skips invocation if reference is null without crashing." },
      ],
      notes: "NullReferenceException (NRE) causes the majority of production outages. Defensive guard clauses eliminate 99% of these crashes.",
      diff: "C# supports null and Elvis safe operator ?.. Go utilizes nil and explicit if broken != nil checks.",
    },
    "task-function-encapsulation": {
      concept: "We package logic into a reusable Mute() function, allowing any part of the system to silence the device with a single command.",
      tokens: [
        { token: "void / func", role: "Declaration", explanation: "Function declaration. void in C# signifies no return value; func is the Go keyword." },
        { token: "Mute", role: "Identifier", explanation: "Unique name used to invoke the function." },
        { token: "( )", role: "Parameter List", explanation: "Parentheses holding input parameters (empty here as none are required)." },
        { token: "{ ... }", role: "Body", explanation: "Encapsulated statements executed whenever the function is invoked." },
        { token: "Mute();", role: "Invocation", explanation: "The call trigger directing computer execution into the function body." },
      ],
      notes: "Encapsulation prevents code duplication: modifying logic in one function updates behavior everywhere it is called.",
      diff: "C# places return type before name (void Mute()), while Go starts with func keyword (func Mute()).",
    },
    "task-antipattern-god-object": {
      concept: "We encounter procedural friction: a bloated switch dispatcher where adding every new button requires editing legacy code.",
      tokens: [
        { token: "switch", role: "Dispatcher", explanation: "Multi-way branch construct selecting code based on variable value." },
        { token: "case", role: "Branch", explanation: "Specific match target (e.g. button 'CALC')." },
        { token: ":", role: "Separator", explanation: "Separates match condition from statements to execute." },
        { token: "break;", role: "Exit Control", explanation: "Mandatory break in C# preventing fallthrough into subsequent cases." },
        { token: "default:", role: "Fallback", explanation: "Default branch executed when no specific case matches." },
      ],
      notes: "Gigantic switch dispatchers violate the Open-Closed Principle: adding features requires constantly modifying existing code.",
      diff: "C# mandates break at the end of cases; Go breaks automatically without needing explicit break statements.",
    },
    "task-interface-polymorphism": {
      concept: "We decouple contract from implementation: the remote controller invokes Execute() through an Interface socket without knowing internal TV hardware.",
      tokens: [
        { token: "IRemoteCommand", role: "Interface Type", explanation: "Contract type guaranteeing the presence of an Execute() method." },
        { token: "command", role: "Variable", explanation: "Interface variable capable of holding any compliant command object." },
        { token: "new CalcCommand()", role: "Instantiation", explanation: "Creates a concrete command instance in C# (Go: CalcCommand{})." },
        { token: "command.Execute();", role: "Polymorphic Call", explanation: "Invokes the contract method polymorphically without coupling to concrete classes." },
      ],
      notes: "Polymorphism allows swapping runtime behavior seamlessly without changing controller code. It is the cornerstone of clean architecture.",
      diff: "C# requires explicit interface inheritance (: IRemoteCommand). Go uses structural duck typing (any type with Execute() fulfills the interface).",
    },
    "task-di-container": {
      concept: "We eliminate manual object creation via 'new': instead, we register the 'contract -> implementation' mapping inside an Inversion of Control container.",
      tokens: [
        { token: "services", role: "IoC Container", explanation: "Inversion of Control container managing object lifecycles across the application." },
        { token: "AddTransient / Register", role: "Lifecycle Method", explanation: "Registers dependency lifecycle: creates a fresh instance per resolution request." },
        { token: "<IRemoteCommand, CalcCommand>", role: "Generics Binding", explanation: "Type parameters linking abstract interface to concrete class." },
        { token: "( )", role: "Method Arguments", explanation: "Method call syntax executing container registration." },
      ],
      notes: "Inversion of Control (IoC): instead of components creating their dependencies, an external container injects them automatically.",
      diff: "C# uses generic parameters <TInterface, TImpl>, while Go registers dependencies via string identifiers or factory functions.",
    },
    "task-command-registry": {
      concept: "We achieve maximum architectural flexibility: replacing rigid switch dispatchers with an open Dictionary / map acting as a plug-in registry.",
      tokens: [
        { token: "Dictionary / map", role: "Data Structure", explanation: "Hash table of key-value pairs providing O(1) instantaneous lookup." },
        { token: "<string, IRemoteCommand>", role: "Type Arguments", explanation: "Key is button string ('CALC'); value is polymorphic command interface." },
        { token: 'registry["CALC"]', role: "Indexer", explanation: "Square brackets indexing into the table by button name." },
        { token: ".Execute();", role: "Direct Invocation", explanation: "Executes the retrieved command directly without any if or switch statements!" },
      ],
      notes: "The Command + Registry pattern allows adding 100 new commands without altering dispatcher code — simply register new dictionary keys.",
      diff: "C# uses Dictionary<K, V>, whereas Go provides built-in map[K]V.",
    },
    "task-pos-guard-clause": {
      concept: "We protect customer balance from overdraft: if the transaction amount exceeds available funds, it immediately declines without modifying balance.",
      tokens: [
        { token: "amount > balance", role: "Condition", explanation: "Evaluates whether purchase amount exceeds available account balance." },
        { token: 'status = "DECLINED"', role: "State Mutation", explanation: "Sets declined status for terminal LCD feedback." },
        { token: "return;", role: "Early Exit", explanation: "Immediate return: balance deduction logic below will never execute." },
      ],
      notes: "Early returns eliminate deep nesting and guarantee financial asset safety before mutations occur.",
      diff: "Go omits parentheses around conditions and does not require trailing semicolons.",
    },
    "task-pos-fee-calculation": {
      concept: "We calculate gross transaction cost with processing fees and execute the balance deduction.",
      tokens: [
        { token: "totalAmount", role: "Variable", explanation: "Gross amount to debit, combining principal amount and bank fee." },
        { token: "amount + fee", role: "Arithmetic Addition", explanation: "Adds base charge and processing surcharge." },
        { token: "-=", role: "Compound Assignment", explanation: "Compound subtract operator: balance -= totalAmount decreases balance in-place." },
        { token: 'status = "APPROVED"', role: "Status Update", explanation: "Confirms authorized transaction status." },
      ],
      notes: "The -= operator is shorthand for balance = balance - totalAmount, common across fintech mutation logic.",
      diff: "Compound assignment operators (+=, -=) behave identically in C# and Go.",
    },
    "task-pos-pin-lockout": {
      concept: "We enforce hardware anti-bruteforce defense: three incorrect PIN attempts lock the terminal and set status to BLOCKED.",
      tokens: [
        { token: "pin != enteredPin", role: "Inequality Check", explanation: "Returns true when customer PIN does not match reference." },
        { token: "failedAttempts++", role: "Failure Counter", explanation: "Increments invalid attempt counter." },
        { token: "failedAttempts >= 3", role: "Threshold Condition", explanation: "Checks if lockout threshold has been reached." },
        { token: "isLocked = true", role: "Hardware Lock", explanation: "Engages hardware lockout flag disabling keypad." },
      ],
      notes: "This implements a State Machine security gate protecting cardholders from automated PIN attacks.",
      diff: "Both languages use != and >= for comparative expressions.",
    },
    "task-pos-batch-settlement": {
      concept: "We perform daily batch settlement (Z-Report): iterating across all daily transactions and accumulating the total for thermal printing.",
      tokens: [
        { token: "for", role: "Iteration Loop", explanation: "Loop construct traversing the transaction array." },
        { token: "int i = 0", role: "Zero-based Index", explanation: "Zero-based array index: computer collections always start at index 0!" },
        { token: ".Length / len()", role: "Collection Size", explanation: "Array length property (.Length in C#, len in Go)." },
        { token: "transactions[i]", role: "Array Indexing", explanation: "Accesses specific transaction value at index i using brackets." },
        { token: "dailyTotal +=", role: "Accumulator", explanation: "Accumulates individual transaction amounts into the running total." },
      ],
      notes: "Zero-based indexing is a common source of off-by-one errors. The last element is always at index Length - 1.",
      diff: "C# accesses array size via .Length property; Go uses the built-in len() function.",
    },
    "task-pos-interface-polymorphism": {
      concept: "The POS terminal invokes gateway.Charge(amount). It does not know or care which bank processor is attached — the Interface contract handles it all.",
      tokens: [
        { token: "bool / approved :=", role: "Result Variable", explanation: "Variable receiving bank decision (true = authorized, false = declined)." },
        { token: "gateway", role: "Interface Instance", explanation: "Payment gateway instance satisfying IPaymentGateway contract." },
        { token: ".Charge(totalAmount)", role: "Method Call", explanation: "Invokes contract method passing gross charge amount." },
        { token: "!approved", role: "Logical NOT", explanation: "Exclamation point negates boolean: shorthand for approved == false." },
      ],
      notes: "Interface polymorphism allows adding Apple Pay or Dankort without modifying a single line of POS core logic.",
      diff: "Go typically uses short declaration ':=' (approved := gateway.Charge(...)), while C# specifies explicit type bool.",
    },
    "task-pos-dependency-injection": {
      concept: "We bind the concrete DankortGateway processor to the terminal via the Inversion of Control container without altering POS business rules.",
      tokens: [
        { token: "services / container", role: "IoC Registry", explanation: "Application service registry holding instantiation blueprints." },
        { token: "AddScoped / Register", role: "Registration Method", explanation: "Registers dependency scoped to the lifetime of a single transaction." },
        { token: "<IPaymentGateway, DankortGateway>", role: "Type Mapping", explanation: "Maps interface contract to concrete Dankort provider." },
      ],
      notes: "Dependency Injection enables automated testing: unit tests can substitute a MockGateway with fake funds seamlessly.",
      diff: "C# leverages generic type parameters <TInterface, TImpl>. Go registers dependencies with string keys or factory methods.",
    },
    "task-debug-runaway-loop": {
      concept: "Reverse debugging of an infinite loop: counter decrement (ch--) instead of increment (ch++). Termination condition is never met, stalling the thread and tripping the hardware Watchdog.",
      tokens: [
        { token: "for", role: "Loop Statement", explanation: "Iteration control structure." },
        { token: "int ch = 1", role: "Loop Initialization", explanation: "Initial counter value starting at channel 1." },
        { token: "ch <= 5", role: "Loop Invariant Condition", explanation: "Continuation condition checking whether channel <= 5." },
        { token: "ch++", role: "Corrected Step Operation", explanation: "Increment step advancing channel toward loop exit." },
      ],
      notes: "Decreasing the counter with ch-- causes values to plummet to negative infinity, never breaking ch <= 5 and crashing via Watchdog timeout.",
      diff: "In C#: for (int ch = 1; ch <= 5; ch++). In Go: for ch := 1; ch <= 5; ch++.",
    },
    "task-debug-off-by-one-overflow": {
      concept: "Diagnostics of hardware CRT overload (Boundary Violation). 101% exceeds physical limit of 100% and trips fuse. Guard Clause required.",
      tokens: [
        { token: "if", role: "Defensive Guard", explanation: "Protective condition ensuring input safety before hardware driver invocation." },
        { token: "requestedBrightness <= 100", role: "Boundary Check", explanation: "Invariant validation ensuring requested value does not exceed hardware ceiling 100%." },
        { token: "tv.SetBrightness()", role: "Safe Invocation", explanation: "Driver method invoked strictly within validated parameters." },
      ],
      notes: "Unchecked boundaries are the primary source of buffer overflows and hardware failures in systems engineering.",
      diff: "C#: if (requestedBrightness <= 100) { ... }. Go: if requestedBrightness <= 100 { ... }.",
    },
    "task-pos-double-deduction-bug": {
      concept: "Diagnostics of double state mutation (Double Deduction). Fee is deducted separately while already aggregated in totalAmount, overcharging customer account.",
      tokens: [
        { token: "totalAmount = amount + fee", role: "Composite Amount", explanation: "Aggregation of total charge including service fee." },
        { token: "balance -= totalAmount", role: "Atomic Mutation", explanation: "Single authoritative account deduction." },
        { token: "// balance -= fee", role: "Redundant Mutation", explanation: "Duplicated mutation that must be removed." },
      ],
      notes: "Financial ledger operations must maintain strict single-source state updates to prevent reconciliation mismatches.",
      diff: "C#: decimal totalAmount = amount + fee; balance -= totalAmount;. Go: totalAmount := amount + fee \\n balance -= totalAmount.",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DANISH (DA)
// ─────────────────────────────────────────────────────────────────────────────
export const theoryDa: TheoryDictionary = {
  badgeBtn: "📖 Teori & Kodeanatomi",
  headerTitle: "Teori & Kodeanatomi",
  conceptTitle: "Fysisk & Logisk Koncept",
  tokensTitle: "Syntaksanatomi (Token Breakdown)",
  notesTitle: "Vigtige Ingeniørpointer",
  diffTitle: "Forskel mellem C# og Go",
  hideBtn: "Skjul teori",
  tasks: {
    "task-0-1-power-on": {
      concept: "Fjernsynet er slukket. For at tilføre strøm kalder vi metoden PowerOn på tv-objektet. Dette er en handling, der udføres med det samme.",
      tokens: [
        { token: "tv", role: "Objekt (Enhed)", explanation: "Reference til fjernsynsobjektet, der er allokeret i computerens arbejdshukommelse." },
        { token: ".", role: "Medlemsadgang", explanation: "Prikoperatoren giver adgang til enhedens funktioner og metoder." },
        { token: "PowerOn", role: "Metodenavn", explanation: "Den specifikke handlingsidentifikator (tænd for strømmen)." },
        { token: "()", role: "Kaldsoperator", explanation: "Parenteser beordrer kørsel af handlingen lige nu." },
        { token: ";", role: "Instruktionsafslutning", explanation: "Semikolon i C# signalerer at instruktionen er færdig." },
      ],
      notes: "En kommando i kode svarer til at trykke på en fysisk knap på fjernbetjeningen. Uden parenteser () udføres handlingen ikke; uden semikolon ; i C# opstår der en syntaksfejl.",
      diff: "I C# er semikolon obligatorisk: tv.PowerOn();. I Go indsætter compileren det automatisk: tv.PowerOn().",
    },
    "task-0-2-types": {
      concept: "Indstilling af kanal som tal og netværksnavn som tekst. Compileren skelner strengt mellem typer: heltal (Integer) skrives uden citationstegn, mens tekst (String) skal have dobbelte citationstegn.",
      tokens: [
        { token: "tv", role: "Objekt (Enhed)", explanation: "TV-objektet der modtager konfigurationskommandoer." },
        { token: ".", role: "Medlemsadgang", explanation: "Prikoperator der åbner for TV-metoder." },
        { token: "SetChannel", role: "Metodenavn", explanation: "Handling der indstiller kanalnummeret." },
        { token: "(1)", role: "Heltalsargument", explanation: "Heltallet 1 (Integer Literal) uden citationstegn gemt som primitiv numerisk værdi." },
        { token: "SetLabel", role: "Metodenavn", explanation: "Handling der indstiller tv-stationens tekstmærke." },
        { token: '("NEWS")', role: "Tekstargument", explanation: 'Tekststrengen "NEWS" (String Literal) strengt i dobbelte citationstegn, som allokerer hukommelse til tegn (String Allocation).' },
        { token: ";", role: "Instruktionsafslutning", explanation: "Semikolon efter hver afsluttet instruktion i C#." },
      ],
      notes: 'Hvis 1 skrives med citationstegn "1", opfattes det som et teksttegn. Hvis NEWS skrives uden citationstegn, leder compileren efter en ikke-eksisterende variabel.',
      diff: 'I C# afsluttes hver instruktion med semikolon: tv.SetChannel(1); tv.SetLabel("NEWS");. I Go adskilles de med linjeskift uden afsluttende semikolon.',
    },
    "task-0-3-sequential": {
      concept: "Sekventiel udførelse. Hvis du prøver at skifte kanal på et slukket fjernsyn, reagerer skærmen ikke. Processoren læser og udfører kode strengt fra top til bund, linje for linje.",
      tokens: [
        { token: "tv.PowerOn()", role: "Første instruktion", explanation: "Første instruktion: forsyner fjernsynet med strøm og aktiverer skærmen." },
        { token: ";", role: "Instruktionsafslutning", explanation: "Afslutning der fører videre til næste handling." },
        { token: "tv.SetChannel(2)", role: "Anden instruktion", explanation: "Anden instruktion: skifter det tændte TV til kanal 2." },
      ],
      notes: "Computeren udfører instruktioner bogstaveligt. Rækkefølgen af instruktioner (Control Flow) afgør enhedens fysiske tilstand.",
      diff: "Både i C# og Go sker udførelsen sekventielt. I C# afsluttes med ';', i Go adskilles instruktioner med linjeskift.",
    },
    "task-1-assignment": {
      concept: "Vi tænder for fjernsynet. I koden betyder det at tilgå det specifikke objekt i computerens arbejdshukommelse og sætte dets tænd/sluk-egenskab til 'tændt'.",
      tokens: [
        { token: "tv", role: "Object", explanation: "Navnet på TV-objektet i computerens hukommelse." },
        { token: ".", role: "Member Access", explanation: "Prik-operatoren giver adgang til objektets indre egenskaber og metoder." },
        { token: "IsOn", role: "Property", explanation: "Tilstandsegenskab der gemmer strømtilstanden (true eller false)." },
        { token: "=", role: "Assignment", explanation: "Tildelingsoperator — gemmer værdien fra højre side i hukommelsescellen til venstre." },
        { token: "true", role: "Boolean", explanation: "Boolsk værdi der repræsenterer sandhed ('tændt')." },
        { token: ";", role: "Terminator", explanation: "Semikolon — signalerer instruktionsafslutning til C#-compileren." },
      ],
      notes: "Tegnet '=' er en tildelingshandling ('skriv værdi ind i variablen'), ikke en matematisk ligning. Sammenligning skrives som '=='.",
      diff: "I C# er semikolon ';' påkrævet. I Go indsætter compileren det automatisk, så det udelades i kildekoden.",
    },
    "task-2-branching": {
      concept: "Vi bygger en omskifter: apparatet undersøger sin tilstand; hvis det allerede kørte, slukker det; hvis det var slukket, tænder det.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Betingelsesnøgleord — udfører kodeblokken hvis udtrykket er sandt (true)." },
        { token: "(tv.IsOn)", role: "Condition", explanation: "Boolsk udtryk der testes: kører fjernsynet i øjeblikket." },
        { token: "{ }", role: "Scope Braces", explanation: "Tuborgklammer afgrænser kommandoerne i denne forgrening." },
        { token: "else", role: "Keyword", explanation: "Alternativ forgrening — udføres hvis betingelsen var falsk (false)." },
      ],
      notes: "Forgreninger udgør kernen i programlogik og gør det muligt for systemet at reagere på skiftende tilstande.",
      diff: "C# kræver parenteser om betingelsen: if (tv.IsOn). Go udelader parenteser: if tv.IsOn.",
    },
    "task-variable-mutation": {
      concept: "Vi øger det aktive kanalnummer med én. Dette ændrer værdien direkte i hukommelsescellen.",
      tokens: [
        { token: "tv.Channel", role: "Property", explanation: "Numerisk egenskab der gemmer det aktuelle kanalnummer." },
        { token: "++", role: "Increment", explanation: "Inkrementoperator — øger værdien med 1 (kort for Channel = Channel + 1)." },
        { token: ";", role: "Terminator", explanation: "Afslutning af instruktion i C#." },
      ],
      notes: "Operatoren ++ muterer variablen direkte på stedet uden behov for at gentage variabelnavnet.",
      diff: "I Go er ++ en erklæring (statement), ikke et udtryk, og kan ikke indgå i tildelinger.",
    },
    "task-boundary-guard": {
      concept: "Vi opretter en sikkerhedsbetingelse (Guard Clause): hvis kanalnummeret overstiger grænsen, nulstilles det automatisk til 1.",
      tokens: [
        { token: "if", role: "Keyword", explanation: "Sikkerhedskontrol udført før videre afvikling." },
        { token: ">", role: "Comparison", explanation: "Større-end operator: returnerer true hvis venstre værdi er større end højre." },
        { token: "4", role: "Number Literal", explanation: "Øvre kanalgrænse for hardwaren." },
        { token: "tv.Channel = 1;", role: "Reset Assignment", explanation: "Nulstiller kanalen til 1 ved overskridelse af grænsen." },
      ],
      notes: "Guard Clauses beskytter produktionskode: de fanger ugyldige data tidligt og retter eller afviser dem.",
      diff: "Logikken er identisk i C# og Go bortset fra parenteser og semikoloner.",
    },
    "task-for-loop": {
      concept: "Vi starter en automatisk kanalsøgning: computeren gennemløber kanalerne fra 1 til 4 og opdaterer apparatet ved hvert trin.",
      tokens: [
        { token: "for", role: "Loop Keyword", explanation: "Nøgleord til gentagelsesløkke med tæller." },
        { token: "int i = 1", role: "Initializer", explanation: "Opretter tællevariabel i med startværdi 1 (i Go: i := 1)." },
        { token: "i <= 4", role: "Condition", explanation: "Fortsættelsesbetingelse: løkken kører så længe i ikke overstiger 4." },
        { token: "i++", role: "Step / Increment", explanation: "Øger tælleren med 1 efter hver gennemkørsel." },
        { token: "tv.Channel = i;", role: "Body Assignment", explanation: "Opdaterer TV-kanalen til tællerens aktuelle værdi." },
      ],
      notes: "En for-loop automatiserer gentagelser: i stedet for 4 linjer skriver vi én kompakt konstruktion.",
      diff: "C# erklærer tællertypen eksplicit (int i = 1), mens Go bruger kort notation (i := 1).",
    },
    "task-class-instance": {
      concept: "En klasse er en arkitekttegning, mens en forekomst er et levende objekt allokeret i Heap-hukommelsen. Operatoren new allokerer hukommelse og returnerer en reference.",
      tokens: [
        { token: "TV", role: "Type / Class", explanation: "Klassens navn — skabelonen for datatypen." },
        { token: "myTv", role: "Variable Name", explanation: "Referencevariabel på stakken, der gemmer objektets adresse." },
        { token: "new", role: "Allocation Operator", explanation: "Allokerer dynamisk hukommelse på den administrerede heap." },
        { token: "TV() / TV{}", role: "Constructor Call", explanation: "Kører klassens konstruktør (C#) eller initialiserer strukturfelter (Go)." },
        { token: "myTv.PowerOn()", role: "Instance Method Call", explanation: "Udfører en metode på den specifikke oprettede forekomst." },
      ],
      notes: "Uden oprettelse via new eksisterer objektet ikke i hukommelsen: en klasse uden et objekt er blot en tegning på papir.",
      diff: "I C#: TV myTv = new TV(); myTv.PowerOn();. I Go: myTv := TV{} myTv.PowerOn().",
    },
    "task-method-return": {
      concept: "Metoder er enten Kommandoer (ændrer tilstand uden returværdi) eller Forespørgsler (aflæser tilstand og returnerer data). tv.GetVolume() returnerer et tal, der fanges i en variabel.",
      tokens: [
        { token: "int / :=", role: "Type / Declaration", explanation: "Variabelerklæring til at gemme det returnerede numeriske resultat." },
        { token: "vol", role: "Variable", explanation: "Lokal variabel på stakken der modtager returværdien." },
        { token: "tv.GetVolume()", role: "Query Method", explanation: "Forespørgselsmetode: aflæser lydstyrken uden utilsigtede sideeffekter." },
        { token: "vol + 10", role: "Arithmetic Expression", explanation: "Beregner ny værdi ved hjælp af processorens ALU før ændringen gemmes." },
        { token: "tv.SetVolume(...)", role: "Command Method", explanation: "Kommandometode der opdaterer den interne hardware-lydstyrke." },
      ],
      notes: "Command-Query Separation (CQS): forespørgselsmetoder bør aldrig ændre tilstand, og kommandometoder bør ikke returnere data.",
      diff: "C# erklærer returtypen eksplicit int vol = tv.GetVolume();. Go anvender kort variabelnotation vol := tv.GetVolume().",
    },
    "task-null-reference": {
      concept: "En null-reference (nil i Go) peger på adressen 0x0. Kald på null udløser et fatalt NullReferenceException-nedbrud. En Guard Clause if (broken != null) beskytter programmet mod nedbrud.",
      tokens: [
        { token: "TV broken = null", role: "Null Declaration", explanation: "Pointer-variabel på stakken med adressen 0x00000000 (Go: var broken *TV = nil)." },
        { token: "if", role: "Guard Keyword", explanation: "Betinget sikkerhedsbarriere før afvikling af potentielt farlig kode." },
        { token: "broken != null", role: "Null Safety Check", explanation: "Adressekontrol der sikrer, at objektet reelt findes i hukommelsen." },
        { token: "broken.PowerOn()", role: "Guarded Call", explanation: "Sikker afvikling der kun aktiveres hvis referencen ikke er null." },
        { token: "broken?.PowerOn()", role: "Safe Navigation", explanation: "Elvis-operatoren (C#): springer over kaldet hvis referencen er null uden at crashe." },
      ],
      notes: "NullReferenceException (NRE) er den hyppigste årsag til nedbrud i drift. Forebyggende guard clauses forhindrer 99% af disse fejl.",
      diff: "C# understøtter null og Elvis safe navigation ?.. Go benytter nil og eksplicit if broken != nil.",
    },
    "task-function-encapsulation": {
      concept: "Vi samler instruktioner i en genanvendelig funktion Mute(), så enheden kan dæmpes med en enkelt kommando fra hele systemet.",
      tokens: [
        { token: "void / func", role: "Declaration", explanation: "Funktionserklæring. void i C# angiver ingen returværdi; func er Go-nøgleordet." },
        { token: "Mute", role: "Identifier", explanation: "Unikt navn til kald af funktionen." },
        { token: "( )", role: "Parameter List", explanation: "Parenteser til parametre (tomme her, da ingen parametre kræves)." },
        { token: "{ ... }", role: "Body", explanation: "Indkapslede instruktioner der udføres ved funktionskald." },
        { token: "Mute();", role: "Invocation", explanation: "Selve kaldet der udløser kørsel af funktionens indhold." },
      ],
      notes: "Indkapsling forhindrer gentaget kode: ændrer du logikken i funktionen, opdateres adfærden overalt.",
      diff: "C# angiver returtype før navnet (void Mute()), mens Go starter med nøgleordet func (func Mute()).",
    },
    "task-antipattern-god-object": {
      concept: "Vi oplever ulemperne ved procedurekoden: en gigantisk switch-blok hvor tilføjelse af nye knapper kræver ændring i eksisterende kode.",
      tokens: [
        { token: "switch", role: "Dispatcher", explanation: "Flerevejs forgreningskonstruktion baseret på en variabel." },
        { token: "case", role: "Branch", explanation: "Specifik knapværdi (f.eks. 'CALC')." },
        { token: ":", role: "Separator", explanation: "Adskiller betingelsen fra instruktionerne." },
        { token: "break;", role: "Exit Control", explanation: "Påkrævet afbrydelse i C# for at forhindre gennemfald til næste case." },
        { token: "default:", role: "Fallback", explanation: "Standardsag udført når ingen case matcher." },
      ],
      notes: "Store switch-blokke bryder Open-Closed princippet: tilføjelse af funktioner kræver konstant redigering af gammel kode.",
      diff: "I C# er break påkrævet. I Go afbryder hvert case automatisk.",
    },
    "task-interface-polymorphism": {
      concept: "Vi adskiller kontrakt fra implementation: fjernbetjeningen kalder Execute() gennem et interface uden at kende TV'ets hardware.",
      tokens: [
        { token: "IRemoteCommand", role: "Interface Type", explanation: "Kontrakttype der garanterer tilstedeværelsen af Execute() metoden." },
        { token: "command", role: "Variable", explanation: "Interfacevariabel der kan modtage enhver kompatibel kommandoklasse." },
        { token: "new CalcCommand()", role: "Instantiation", explanation: "Opretter en konkret instans i C# (i Go: CalcCommand{})." },
        { token: "command.Execute();", role: "Polymorphic Call", explanation: "Udfører kontrakten polymorft uden kobling til konkrete klasser." },
      ],
      notes: "Polymorfi gør det muligt at udskifte adfærd i drift uden at ændre controllerkoden — grundlaget for ren arkitektur.",
      diff: "I C# angives interfacearv eksplicit (: IRemoteCommand). I Go anvendes 'duck typing' (implementeres automatisk).",
    },
    "task-di-container": {
      concept: "Vi fjerner manuel oprettelse via 'new': i stedet registrerer vi 'kontrakt -> implementation' i Inversion of Control containeren.",
      tokens: [
        { token: "services", role: "IoC Container", explanation: "Dependency Injection container der styrer objekters livscyklus." },
        { token: "AddTransient / Register", role: "Lifecycle Method", explanation: "Registreringsmetode der opretter nye instanser efter behov." },
        { token: "<IRemoteCommand, CalcCommand>", role: "Generics Binding", explanation: "Generiske parametre der forbinder interface med konkret klasse." },
        { token: "( )", role: "Method Arguments", explanation: "Metodekald til containerkonfiguration." },
      ],
      notes: "Inversion of Control (IoC): i stedet for at klassen opretter sine afhængigheder, leveres de automatisk udefra.",
      diff: "C# bruger Generics <TInterface, TImpl>, mens Go anvender strenge eller fabriksfunktioner.",
    },
    "task-command-registry": {
      concept: "Vi opnår maksimal arkitekturfleksibilitet: vi erstatter switch med et åbent Dictionary / map, der fungerer som plugin-register.",
      tokens: [
        { token: "Dictionary / map", role: "Data Structure", explanation: "Nøgle-værdi hashtabel med lynhurtig O(1) opslagshastighed." },
        { token: "<string, IRemoteCommand>", role: "Type Arguments", explanation: "Nøglen er knappens navn ('CALC'); værdien er kommandocontrakten." },
        { token: 'registry["CALC"]', role: "Indexer", explanation: "Klammeindeksering til opslag efter knapnavn." },
        { token: ".Execute();", role: "Direct Invocation", explanation: "Udfører kommandoen direkte uden if- eller switch-udsagn!" },
      ],
      notes: "Command + Registry mønstret gør det muligt at tilføje 100 knapper uden at røre ved kontrolkoden.",
      diff: "C# bruger Dictionary<K, V>, mens Go har indbygget map[K]V.",
    },
    "task-pos-guard-clause": {
      concept: "Vi beskytter kontoen mod overtræk: overstiger beløbet saldoen, afvises transaktionen øjeblikkeligt uden ændring i saldo.",
      tokens: [
        { token: "amount > balance", role: "Condition", explanation: "Tester om købsbeløb overstiger tilgængelige midler på kontoen." },
        { token: 'status = "DECLINED"', role: "State Mutation", explanation: "Sætter afvist status til visning på POS-terminalens LCD." },
        { token: "return;", role: "Early Exit", explanation: "Tidlig afslutning: debitering længere nede udføres aldrig." },
      ],
      notes: "Tidlige afslutninger fjerner indlejret spaghettikode og beskytter midler før mutation.",
      diff: "I Go udelades parenteser om if-betingelser, og semikolon efter return er ikke påkrævet.",
    },
    "task-pos-fee-calculation": {
      concept: "Vi beregner det samlede transaktionsbeløb inklusive bankgebyr og gennemfører debiteringen på saldoen.",
      tokens: [
        { token: "totalAmount", role: "Variable", explanation: "Bruttobeløb der skal trækkes, inklusiv gebyr." },
        { token: "amount + fee", role: "Arithmetic Addition", explanation: "Lægger grundbeløb og gebyr sammen." },
        { token: "-=", role: "Compound Assignment", explanation: "Kombineret subtraktion: balance -= totalAmount reducerer saldoen direkte." },
        { token: 'status = "APPROVED"', role: "Status Update", explanation: "Bekræfter godkendt transaktionsstatus." },
      ],
      notes: "Operatoren -= er en forkortelse for balance = balance - totalAmount.",
      diff: "Operatoren -= fungerer fuldstændig ens i C# og Go.",
    },
    "task-pos-pin-lockout": {
      concept: "Vi bygger hardwareforsvar mod PIN brute-force: efter 3 forkerte forsøg låses tastaturet, og status sættes til BLOCKED.",
      tokens: [
        { token: "pin != enteredPin", role: "Inequality Check", explanation: "Tester ulighed: true hvis indtastet PIN afviger fra kortets PIN." },
        { token: "failedAttempts++", role: "Failure Counter", explanation: "Øger tæller for fejlforsøg med 1." },
        { token: "failedAttempts >= 3", role: "Threshold Condition", explanation: "Undersøger om spærregrænsen på 3 forsøg er nået." },
        { token: "isLocked = true", role: "Hardware Lock", explanation: "Aktiverer hardwarelås der afbryder terminalens tastatur." },
      ],
      notes: "Dette er en tilstandsmaskine (State Machine) der beskytter kortet mod misbrug.",
      diff: "Begge sprog anvender operatorerne != og >= til sammenligning.",
    },
    "task-pos-batch-settlement": {
      concept: "Vi gennemfører dagsafslutning (Z-rapport): gennemløber dagens transaktioner og opsummerer det samlede beløb til termoprint.",
      tokens: [
        { token: "for", role: "Iteration Loop", explanation: "Gentagelsesløkke til gennemløb af transaktionsarrayet." },
        { token: "int i = 0", role: "Zero-based Index", explanation: "Nulbaseret indeks: arrays starter altid ved indeks 0 i programmering!" },
        { token: ".Length / len()", role: "Collection Size", explanation: "Arrayets samlede længde (.Length i C#, len i Go)." },
        { token: "transactions[i]", role: "Array Indexing", explanation: "Tilgår transaktionsbeløbet ved indeks i med firkantede klammer." },
        { token: "dailyTotal +=", role: "Accumulator", explanation: "Akkumulerer transaktionernes beløb til dagstotalen." },
      ],
      notes: "Nulbaseret indeksering er årsag til mange fejl. Det sidste element findes ved indeks Length - 1.",
      diff: "I C# tilgås længden via egenskaben .Length; i Go bruges funktionen len().",
    },
    "task-pos-interface-polymorphism": {
      concept: "Terminalen kalder gateway.Charge(amount) uden at kende den specifikke bank (Dankort, Visa, Mastercard) — interfacet håndterer det.",
      tokens: [
        { token: "bool / approved :=", role: "Result Variable", explanation: "Variabel der modtager bankens godkendelse (true eller false)." },
        { token: "gateway", role: "Interface Instance", explanation: "Gateway-instans der opfylder IPaymentGateway-kontrakten." },
        { token: ".Charge(totalAmount)", role: "Method Call", explanation: "Kalder kontraktmetoden med det samlede beløb." },
        { token: "!approved", role: "Logical NOT", explanation: "Udråbstegn negerer den boolske værdi (betyder 'IKKE godkendt')." },
      ],
      notes: "Interface polymorfi gør det muligt at tilføje Apple Pay eller MobilePay uden at ændre én linje i POS-koden.",
      diff: "I Go anvendes ':=' (approved := gateway.Charge(...)), mens C# angiver typen bool.",
    },
    "task-pos-dependency-injection": {
      concept: "Vi forbinder DankortGateway til terminalen via Inversion of Control containeren uden at røre ved forretningslogikken.",
      tokens: [
        { token: "services / container", role: "IoC Registry", explanation: "Container der gemmer alle regler for instansiering." },
        { token: "AddScoped / Register", role: "Registration Method", explanation: "Registrerer afhængigheden til at leve i omfanget af én transaktion." },
        { token: "<IPaymentGateway, DankortGateway>", role: "Type Mapping", explanation: "Forbinder interfacekontrakten med Dankort-udbyderen." },
      ],
      notes: "Dependency Injection muliggør enhedstest: man kan erstatte Dankort med en MockGateway med testpenge.",
      diff: "C# anvender generiske typer <TInterface, TImpl>, mens Go registrerer med strenge eller fabrikker.",
    },
    "task-debug-runaway-loop": {
      concept: "Fejlfinding af uendelig løkke: tæller-dekrement (ch--) i stedet for inkrement (ch++). Afslutningsbetingelsen nås aldrig, hvilket udløser hardware Watchdog.",
      tokens: [
        { token: "for", role: "Loop Statement", explanation: "Løkkekonstruktion med tæller." },
        { token: "int ch = 1", role: "Loop Initialization", explanation: "Startværdi for kanaltælleren." },
        { token: "ch <= 5", role: "Loop Invariant Condition", explanation: "Fortsættelsesbetingelse der tjekker ch <= 5." },
        { token: "ch++", role: "Corrected Step Operation", explanation: "Inkrement der øger kanalen mod afslutning." },
      ],
      notes: "ch-- får værdien til at falde uendeligt mod negative tal, hvilket låser tråden og udløser Watchdog timer.",
      diff: "I C#: for (int ch = 1; ch <= 5; ch++). I Go: for ch := 1; ch <= 5; ch++.",
    },
    "task-debug-off-by-one-overflow": {
      concept: "Fejlfinding af katoderørs-overbelastning (grænseoverskridelse). 101% overskrider grænsen på 100% og sprænger sikringen. Kræver Guard Clause.",
      tokens: [
        { token: "if", role: "Defensive Guard", explanation: "Sikkerhedsbetingelse før hardwareaktivering." },
        { token: "requestedBrightness <= 100", role: "Boundary Check", explanation: "Grænsekontrol der sikrer at værdien ikke overstiger 100%." },
        { token: "tv.SetBrightness()", role: "Safe Invocation", explanation: "Sikkert hardwarekald." },
      ],
      notes: "Manglende grænsekontrol forårsager alvorlige hardwarenedbrud.",
      diff: "C#: if (requestedBrightness <= 100) { ... }. Go: if requestedBrightness <= 100 { ... }.",
    },
    "task-pos-double-deduction-bug": {
      concept: "Fejlfinding af dobbelt fradrag (Double Deduction). Gebyret trækkes to gange, hvilket skaber kasseuoverensstemmelse.",
      tokens: [
        { token: "totalAmount = amount + fee", role: "Composite Amount", explanation: "Beregning af totalbeløb inklusiv gebyr." },
        { token: "balance -= totalAmount", role: "Atomic Mutation", explanation: "Enkelt og autoritativt kontotræk." },
        { token: "// balance -= fee", role: "Redundant Mutation", explanation: "Overflødig linje der fjernes." },
      ],
      notes: "Finansielle transaktioner skal have ét autoritativt træk.",
      diff: "C#: decimal totalAmount = amount + fee; balance -= totalAmount;. Go: totalAmount := amount + fee \\n balance -= totalAmount.",
    },
  },
};
