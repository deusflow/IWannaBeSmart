# Interactive Workbench (IWannaBeSmart)

> **Інженерний верстак та інтерактивний симулятор для підготовки Software, Hardware, Cloud та Cyber-безпекових інженерів.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown.svg)](https://github.com/pmndrs/zustand)
[![Tests](https://img.shields.io/badge/Vitest-31%20suites%20%7C%20727%20passed-brightgreen.svg)](https://vitest.dev/)
[![i18n](https://img.shields.io/badge/i18n-UA%20%7C%20EN%20%7C%20DA-orange.svg)](packages/i18n)

---

## 🧭 Про проєкт

**Interactive Workbench** — це навчальна симуляційна платформа класу *Applied Engineering Sandbox*. Користувач не просто читає теорію чи дивиться відео, а безпосередньо працює з віртуальними схемами, шинами даних, протоколами обміну, терміналами, конвеєрами штучного інтелекту та інструментами кіберзахисту.

### Ключові принципи:
- **Offline-First Architecture**: Повноцінна працездатність без доступу до мережі. Гостьовий режим без збереження паролів на клієнті, збереження навчального прогресу в `localStorage`, а при підключенні до хмари — автоматична синхронізація через Supabase з дедуплікацією (`onConflict: user_id,station_id,task_id`).
- **Applied Diagnostics & Self-Healing**: Чекпоїнти сесій, збереження аварійних снепшотів збоїв (`checkpointManager`) та відновлення стану симулятора без втрати hard-earned XP.
- **Повна тримовність**: 100% паритет ключів між українською (UA), англійською (EN) та данською (DA) мовами з автоматичним тестуванням повноти (`localeCompleteness.test.ts`).

---

## 🏛 Архітектура Monorepo

Проєкт побудований на базі **npm workspaces** із суворим розділенням відповідальності:

```
├── apps/
│   └── web/                     # Головний SPA-додаток (React 18 + Vite 6 + Tailwind CSS)
│       ├── src/
│       │   ├── components/      # UI-компоненти верстака, карток, аналітики, модалок
│       │   ├── screens/         # Екрани (WorkbenchScreen, WorkshopHubScreen)
│       │   ├── store/           # Zustand root store та 15+ модульних слайсів
│       │   ├── lib/             # Клієнт Supabase з таймаутами та детекцією офлайну
│       │   └── utils/           # Чекпоїнти, аудіо-ефекти, кар'єрні ранги, SVG-сертифікати
│
├── packages/
│   ├── sim-engine/              # Чисті математичні та логічні рушії симуляцій (без React)
│   │   ├── src/runtime/         # Симулятори схем, IR-пакетів, API, CPU FDE, RAG, DAG
│   │   └── src/tasks/           # Маніфести завдань Code Gym (360 зірок майстерності)
│   │
│   ├── i18n/                    # Багатомовний рушій та словники (UA, EN, DA)
│   │   ├── src/locales/         # ua.ts, en.ts, da.ts
│   │   └── src/__tests__/       # Тест повноти та ідентичності ключів перекладу
│   │
│   └── ui/                      # Спільні дизайн-токени та стилі
```

---

## 🛠 10 Інженерних Станцій

Верстак складається з 10 інтерактивних станцій, кожна з яких містить інтерактивну симуляцію, тренажер коду Code Gym та векторні сертифікати майстерності:

| # | Станція | Назва | Стек & Тематика |
|---|---|---|---|
| **01** | `tv` | **Hardware TV & IR Pipeline** | Апаратні шини (VCC, GND, IR_DATA), фізичний IR-пакет (AGC, Lead-In, Bit Burst), декодер протоколів. |
| **02** | `pos` | **Fintech POS Terminal** | Банківський транзакційний ledger, PIN/NFC-валідація, розрахунок решти, обробка помилок балансу. |
| **03** | `iot` | **IoT Edge & Safety Interlock** | Асинхронний EventBus, промислові датчики, теплові реле, Safety Interlock від аварійного перегріву. |
| **04** | `api` | **API Forge & Resilience** | HTTP/REST симуляція, Bearer-токени, емуляція обриву кабелю (504 Gateway Timeout), 401/404 статуси. |
| **05** | `git` | **Git DAG Terminal** | Спрямований ациклічний граф комітів, rebase, merge, cherry-pick, detach HEAD, відновлення гілок. |
| **06** | `bandit` | **Linux Security Escalation** | Термінал командного рядка, права доступу UNIX (chmod/chown), SUID, конвеєри pipe/grep/awk. |
| **07** | `vertex` | **Google Cloud Vertex AI** | Діагностика LLM-пайплайнів, моніторинг квот, обробка таймаутів, температура генерації. |
| **08** | `fde` | **CPU Instruction Cycle** | Тактовий генератор, Fetch-Decode-Execute, регістри (PC, IR, ACC, MAR, MDR), мікрокод. |
| **09** | `rag` | **Enterprise RAG Engine** | Векторні ембеддінги, косинусна подібність, чанкування документів, top-k пошук контексту. |
| **10** | `cyber` | **Cyber Defense & SIEM** | Тріаж інцидентів SOC, фільтрація алерти за MITRE ATT&CK, нейтралізація DDoS та бекдорів. |

---

## 🚀 Швидкий старт

### Вимоги до оточення
- **Node.js**: `v20+` або `v22+` (LTS рекомендовано)
- **npm**: `v10+`
- **Рекомендований екран**: від 13" (1920×1080 або ноутбук) для роботи зі схемами, шинами даних та редактором коду.

### Встановлення залежностей
```bash
npm install
```

### Запуск середовища розробки
```bash
npm run dev
```
Додаток відкриється за адресою: `http://localhost:5173`.

### Запуск перевірки типів (TypeScript)
```bash
npm run typecheck
```

### Запуск лінтера (ESLint)
```bash
npm run lint
```

### Запуск тестів (Vitest)
```bash
# Одноразовий прогін усіх сьютів
npm test

# Режим спостереження
npm run test:watch
```

---

## 🔐 Безпека та Автентифікація

1. **Без збереження незашифрованих паролів**:
   - Офлайн-режим реалізовано через гостьові сесії (`guest-xxxx`), які зберігають позивний та локальний прогрес суто на пристрої користувача.
   - Спроби реєстрації або входу через Email чи Google в офлайні повертають локалізоване сповіщення про необхідність з'єднання із сервером.
2. **Ізоляція сесій та захист від витоку прогресу**:
   - При виклику `signOut` викликається `clearUserProgressStorage()`, що повністю стирає зірки, XP та чекпоїнти з `localStorage`, а також викликає `resetUserProgress()`, скидаючи в пам'яті всі станції до заводського стану. Наступний гість або користувач гарантовано отримує чисту сесію.
3. **Хмарна синхронізація**:
   - Налаштовується змінними оточення `VITE_SUPABASE_URL` та `VITE_SUPABASE_ANON_KEY` у файлі `.env`. Якщо змінні відсутні, додаток автоматично функціонує в автономному Offline-First режимі.

---

## 📜 Ліцензія

Приватний навчально-інженерний проєкт. Всі права захищено.
