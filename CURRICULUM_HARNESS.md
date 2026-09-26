# CURRICULUM HARNESS & AGENT REGULATION MANUAL
> **Platform Version:** Interactive Workbench v2.0 (Engineering Workshop)  
> **Target Audience:** Autonomous AI Agents, Human Engineers, Curriculum Architects  
> **Status:** STRICT CONTRACT / ZERO-TOLERANCE COMPLIANCE REQUIRED  

---

## 1. Спецификация новой задачи (Task Schema Contract)

Каждая задача на платформе IWannaBeSmart — это не просто строчка кода в редакторе, а законченный дидактический блок с когнитивной поддержкой студента. Добавление задачи без полного дидактического пакета строго запрещено.

### 1.1. Чеклист полей задачи (`CodingTask` / `TaskDefinition`)
При определении задачи в `@iw/sim-engine` (папка `packages/sim-engine/src/...`):
- [ ] `id`: Строгий семантический идентификатор (`task-[station]-[pattern]-[slug]`, например `task-pos-guard-clause`).
- [ ] `titleKey`: Ключ локализации для названия задачи (например, `fintechStation.tasks.guardClause.title`).
- [ ] `descriptionKey`: Ключ локализации для описания задачи.
- [ ] `category`: Категория (`fundamentals` | `architecture` | `security` | `ai` | `ops`).
- [ ] `initialCode`: Начальный скелет кода для поддерживаемых языков (`csharp`, `go`, `python`, etc.).
- [ ] `solutionCode`: Референсный проверенный код решения.
- [ ] `validationRules`: Набор предикатов проверки симулятора (AST, регулярные выражения, поведенческие тесты).
- [ ] `hints`: Массив из минимум 3 прогрессивных подсказок.

### 1.2. Обязательный контракт `taskDidacticContext`
Каждая задача обязана быть зарегистрирована в `apps/web/src/components/workbench/playground/taskDidacticContext.ts` со следующими блоками:

1. **`whyThisCode` (Зачем этот код):**
   - Детальное объяснение роли синтаксиса и патерна для каждого языка (`csharp`, `go`, etc.).
   - Почему выбран именно этот подход, а не наивный `if-else` или глобальная переменная.
2. **`primitiveMemoryNote` (Заметка по памяти):**
   - Что происходит на уровне железа / рантайма (Heap vs Stack, аллокации, кэш-линии L1/L2, указатели, структуры данных, GC-давление).
3. **`pacingLeading` (Когнитивное сопровождение по Милтону Эриксону / CBT):**
   - `pacing`: Валидация первичного сопротивления студента перед незнакомым промышленным синтаксисом (на 3 языках: `ua`, `en`, `da`).
   - `leading`: Мягкое направление на одно ненапряжное микро-действие (на 3 языках: `ua`, `en`, `da`).
4. **`curatedResources` (Авторитетный Deep Dive):**
   - Минимум 1-2 авторитетных источника из белого списка:
     - `Microsoft Learn` (для C# / .NET / Cloud)
     - `Go.dev` (для Go)
     - `Google Cloud` / `NIST` (для Cloud / Security)
     - `IBM Granite` / `arXiv` (для AI / RAG)
     - `ByteByteGo` / `Computerphile` / `MIT OCW` (для фундаментальной архитектуры)
     - `RFC` / `OWASP` (для протоколов и безопасности)
   - Поля ресурса: `title`, `source`, `url`, `type`, `targetGrade`, `estimatedMinutes`, `whyRead` (`ua`, `en`, `da`).
5. **`architectureMap` (для архитектурных задач Tier 2):**
   - Маппинг на узлы интерактивного графа (`canvasNodeName`, `canvasWiring`, `architectureHint`, `contractFile`, `implementationFile`).

#### Шаблон дидактического контекста:
```typescript
"task-example-guard": {
  taskId: "task-example-guard",
  whyThisCode: {
    csharp: "Guard Clause перевіряє валідність вхідних даних на самому початку методу...",
    go: "Ідіоматичний підхід у Go полягає в ранній перевірці помилки 'if err != nil'...",
  },
  primitiveMemoryNote: {
    csharp: "Раннє повернення звільняє стек виклику без створення зайвих об'єктів у Heap.",
    go: "Нульова алокація: функція не втікає на купу (no escape to heap).",
  },
  pacingLeading: {
    pacing: {
      ua: "Велика кількість умовних операторів на старті лякає — це типове відчуття при розборі чужого коду.",
      en: "A barrage of defensive checks can feel overwhelming when first reading industrial logic.",
      da: "En række forsvarsbetingelser kan virke overvældende ved første øjekast.",
    },
    leading: {
      ua: "Винесіть лише першу негативну умову на початок функції і зробіть return.",
      en: "Isolate just the first negative precondition at the top of the function and return early.",
      da: "Isoler blot den første negative forudsætning øverst i funktionen og returner tidligt.",
    },
  },
  curatedResources: [
    {
      title: "Refactoring: Guard Clauses in Clean Code",
      source: "Microsoft Learn",
      url: "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles",
      type: "documentation",
      targetGrade: "Junior",
      estimatedMinutes: 8,
      whyRead: {
        ua: "Офіційне пояснення ліквідації гніздових сходів Arrow Anti-Pattern.",
        en: "Authoritative breakdown on eliminating nested arrow anti-patterns.",
        da: "Officiel forklaring på eliminering af indlejrede pil-antimønstre.",
      },
    },
  ],
}
```

---

## 2. Спецификация новой станции (Station Scaffold Contract)

Создание новой станции требует реализации 7 взаимосвязанных компонентов в монорепозитории.

### 2.1. Чеклист внедрения станции

| # | Компонент | Расположение | Обязанности |
|---|---|---|---|
| 1 | **Device-компонент** | `apps/web/src/components/workbench/stations/[name]/*Device.tsx` | Интерактивный прибор: SVG-схема, аппаратные реле, индикаторы, симуляция железа/сервиса. |
| 2 | **CodeGym-компонент** | `apps/web/src/components/workbench/stations/[name]/*Gym.tsx` | Среда тренажера кода, переключение задач, 4 режима (TRACE, COPY, SPEED, BUGFIX). |
| 3 | **Zustand Slice** | `apps/web/src/store/slices/*StationSlice.ts` | Состояние прибора, аппаратные регистры, переключатели, ошибки. |
| 4 | **ID в `trackManifest.ts`** | `apps/web/src/components/workbench/career/trackManifest.ts` | Регистрация в `TRACK_SEQUENCES`, `ALL_STATIONS_SEQUENCE`, `STATION_DIRECTORY`. |
| 5 | **Набор тестов в `sim-engine`** | `packages/sim-engine/src/.../__tests__/*.test.ts` | 100% покрытие валидаторов заданий симулятора граничными случаями. |
| 6 | **Регистрация в `stationTraces.ts`** | `packages/sim-engine/src/runtime/trace/stationTraces.ts` | Полноценный `ExecutionTraceTimeline` с POE-вопросами (Predict-Observe-Explain). |
| 7 | **Victory Modal** | `apps/web/src/components/workbench/*VictoryModal.tsx` | Векторный сертификат SVG + `<StationTrackNavigator currentStationId="..." onClose={onClose} />`. |

### 2.2. Требования к локализации
- Любой новый UI-текст или ключ **ОБЯЗАН** одновременно вноситься в 3 файла:
  - `packages/i18n/src/locales/ua.ts`
  - `packages/i18n/src/locales/en.ts`
  - `packages/i18n/src/locales/da.ts`
- Тест `packages/i18n/src/__tests__/localeCompleteness.test.ts` блокирует PR/сборку при любом расхождении ключей между локалями.

---

## 3. Правило Zero-Hardcode (Declarative Flow Guarantee)

### 3.1. Запреты:
1. **Категорический запрет на захардкоженные переходы между станциями:**
   ```typescript
   // ❌ СТРОГО ЗАПРЕЩЕНО:
   const handleNext = () => {
     setCurrentStationId("pos"); // ХАРДКОД! Нарушает гибкость треков
   };
   ```
2. **Запрет на прямое захардкоживание названий следующих станций в кнопках:**
   ```tsx
   // ❌ СТРОГО ЗАПРЕЩЕНО:
   <button>Перейти до API Forge ➔</button>
   ```

### 3.2. Как делать правильно:
Все переходы вычисляются **исключительно** через единый манифест:
```tsx
// ✅ ПРАВИЛЬНО:
import { StationTrackNavigator } from "./career/StationTrackNavigator";

// В футере модалки завершения станции:
<StationTrackNavigator currentStationId="tv" onClose={onClose} />
```

`StationTrackNavigator` автоматически:
- Определяет текущий трек пользователя (`backend`, `ai`, `security`, `explorer`).
- Вызывает чистую функцию `getNextStationInTrack(currentStationId, userTrack)`.
- Если есть следующая станция трека: генерирует акцентную кнопку перехода на нее.
- Если станция последняя в треке: генерирует кнопку допуска в **War Room** (`WAR_ROOM`).
- Предоставляет второстепенную кнопку возврата на Хаб.

---

## 4. Архитектурный и дизайн-код (Design Token Guardrails)

Платформа IWannaBeSmart использует строгий визуальный язык **`Matte Industrial Workshop`** (эстетика тактильной инженерной мастерской, прецизионных аналоговых приборов и бумажных инженерных блокнотов).

### 4.1. Категорические табу (Banned Visual Patterns):
- ❌ **Никакого "геймерского UI":** запрещены кислотные неоновые цвета (`cyan`, `lime`, `neon-blue`, `hot-pink`, `purple-neon`).
- ❌ **Никакого глянцевого черного:** запрещен смоляной чистый черный цвет `#000000` в фонах панелей и карточек.
- ❌ **Никаких неоновых размытий:** запрещены `shadow-[0_0_..._#00ffff]` и агрессивные цветные свечения `glow`.

### 4.2. Авторизованная матовая палитра:

| Токен / Роль | HEX | Класс Tailwind / Использование | Назначение |
|---|---|---|---|
| **Parchment Background** | `#F7F5F0` | `bg-[#F7F5F0]` | Базовый фон страницы мастерской |
| **Warm Card Canvas** | `#FFFFFF`, `#F5EDE6` | `bg-white`, `bg-[#F5EDE6]` | Карточки приборов, подложки бейджей |
| **Deep Slate / Charcoal** | `#1E2227`, `#1A1D20` | `text-[#1E2227]`, `bg-[#1E2227]` | Основной текст, инженерные кнопки действий |
| **Industrial Amber** | `#C86D32` | `text-[#C86D32]`, `bg-[#C86D32]` | Главный промышленный акцент, звезды, XP |
| **Matte Sage Green** | `#3E7A5E` | `text-[#3E7A5E]`, `bg-[#3E7A5E]` | Прогресс трека, успешная верификация, безопасность |
| **Matte Denim Blue** | `#3B6B88` | `text-[#3B6B88]`, `bg-[#3B6B88]` | Акцент трека Backend & Distributed Systems |
| **Matte Amethyst** | `#635380` | `text-[#635380]`, `bg-[#635380]` | Акцент трека AI & MLOps Architecture |
| **Muted Border** | `rgba(30,34,39,0.15)` | `border-[#1E2227]/15` | Тонкие 1px разделители и рамки карточек |
| **Notebook Grid** | `bg-notebook-grid` | Специфический паттерн | Фоновая сетка миллиметровки с прозрачностью 10-20% |

### 4.3. Гайдлайн по типографике и интерактивности:
- **Шрифты:** `font-display` (заголовки приборов), `font-mono` (телеметрия, регистры, счетчики), `font-sans` (пояснения и теория).
- **Скругления:** сдержанные `rounded-xl` или `rounded-2xl`. Никаких гигантских круглых пилюль на прямоугольных блоках.
- **Интерактивные микро-анимации:** `active:scale-95` при клике, `transition-all duration-200`, звуковой отклик через `audioFx.playRelayClick()` или `audioFx.playKeyClick()`.

---

## 5. Обязательный пайплайн валидации (Verification Gates)

Перед завершением любой итерации добавления контента агент **ОБЯЗАН** последовательно выполнить:

```bash
# 1. Проверка строгой типизации TypeScript
npm run typecheck

# 2. Запуск полного набора юнит-тестов, симуляторов и проверки локализации
npm test

# 3. Валидация производственной сборки Vite
npm run build
```

Если хотя бы одна из этих команд завершается с ошибкой — задача считается **НЕВЫПОЛНЕННОЙ**.
