/**
 * @file packages/i18n/src/index.ts
 * @description react-i18next configuration and multilingual resources (UK, EN, DA)
 * (Interactive Workbench, Block A, Items 3, 5, 6; Block M, Item 99)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LOCALES = ["uk", "en", "da"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "uk";

/**
 * Rule 6: Technical terms must NOT be translated across any locale.
 */
export const TECHNICAL_TERMS = [
  "Dependency Injection",
  "Interface",
  "Event Bus",
  "Goroutine",
  "State Machine",
  "Inversion of Control",
  "Hardware Fault",
  "Test Points",
  "Pulse",
  "Signal Flow",
  "IRemoteCommand",
  "Execute",
  "TVReceiver",
  "TVController",
  "VCC",
  "GND",
  "TSOP38238",
  "LM7805",
  "ATmega328P",
  "TDA9351",
  "LM386",
  "24C08",
] as const;

export const defaultResources = {
  uk: {
    translation: {
      common: {
        appTitle: "Interactive Workbench",
        status: "Працює",
        localeName: "Українська",
        xp: "XP",
        hint: "Підказка",
        reset: "Скинути",
        cancel: "Скасувати",
      },
      workbench: {
        backToTv: "← До телевізора",
        switchToArchitecture: "Architecture Studio",
        deviceView: "Телевізор",
        tvDeviceTitle: "Smart TV 65\" (Консоль)",
        remoteConsoleTitle: "Пульт ДК (Консоль)",
        remoteHandsetTitle: "Пульт ДК",
        irReceiver: "ІЧ-приймач",
        carrierLabel: "38 kHz ІЧ",
        readyToReceive: "Готовий до прийому",
        xpTooltip: "Очки досвіду (XP)",
        codeAndSchematic: "Code and Schematic",
        drawerOpened: "Відкрито",
        drawerClosed: "Відкрити",
        drawerPinned: "Закріплено",
        hintTitle: "Підказка:",
        tvStandbyHint: "Телевізор у мережі. Натисніть кнопку живлення [PWR] на пульті ДК",
        tvPlayingHint: "Канал {{channel}}: {{channelName}} • Гучність: {{volume}}/100",
        stationTitle: "Телевізійна станція",
        drawerTabs: {
          code: "Код (C# / Go)",
          hardware: "Апаратні вузли",
          architecture: "Архітектура",
        },
      },
      drawer: {
        objectiveTitle: "Інженерне завдання:",
        syntaxVerified: "Синтаксис перевірено",
        signalArchitectureLink: "Зв'язок фізичного сигналу з архітектурою програми",
        pinned: "Закріплено",
        unpin: "Відкріпити панель (Плаваюче вікно)",
        pin: "Закріпити панель (Поруч на верстаку)",
        close: "Закрити панель (ESC)",
        footerEsc: "Esc або закрити",
        footerPinned: "Закріплено на верстаку",
        footerActive: "Телевізор • Схема активна",
        levelBadge: "Рівень {{number}}",
        iocTitle: "Інверсія керування (IoC & DI контракт)",
        iocDescription: "Телевізійний приймач не створює команди вручну. Він приймає абстракції, що реалізують контракт IRemoteCommand. Метод Execute передається у вхідний порт контролера телевізора через Dependency Injection.",
        commandContractLabel: "Контракт команди",
        commandRegistryLabel: "Реєстр команд",
        diInjectionLabel: "✓ Впровадження через DI",
        keyTermsTitle: "Ключові терміни (Без перекладу)",
      },
      architecture: {
        title: "Architecture Studio",
        projectTree: "Дерево проекту",
        searchPlaceholder: "Пошук файлів та класів...",
        dragHint: "Перетягніть або натисніть файл, щоб додати на дошку",
        level1Title: "Рівень 1: Архітектурне підключення команди Power",
        waitingConnection: "Очікує з'єднання",
        connectionActive: "✓ Зв'язок активний",
        missionInstructions: "З'єднайте вихідний порт Execute класу PowerCommand із вхідним портом CommandHandler контролера TVController.",
        missionSuccess: "Контракт виконано! Метод Execute класу PowerCommand зв'язано з TVController. Кнопка Power на пульті активна.",
        autoWire: "Авто-з'єднання",
        reset: "Скинути",
        centerView: "Центрувати",
        inputsDI: "Входи (DI)",
        methodsOutputs: "Методи / Події",
        noInputs: "Немає входів",
        noOutputs: "Немає методів",
        activeWire: "Активний зв'язок",
        connection: "З'єднання",
        disconnect: "Від'єднати провід",
        openFullscreen: "Відкрити Architecture Studio на весь екран",
        fullscreenCardDesc: "Візуальний редактор архітектури в стилі Unreal Blueprints / Blender Nodes тепер розгортається у просторому повноекранному режимі з повним деревом проекту та пошуком.",
        terminal: "Термінал",
        liveLog: "Журнал",
        clearLog: "Очистити журнал",
        collapse: "Згорнути",
        currentGoal: "Поточна мета",
        terminalEmpty: "Журнал порожній — з'єднайте ноди, щоб побачити пояснення",
        noCodeYet: "// Немає з'єднань — перетягніть провід між портами нод",
      },
      level: {
        level1Title: "Лінія живлення та ініціація сигналу",
        level1Objective: "Перевірте шину живлення 5V, зафіксуйте вхідні інфрачервоні пакети 38 kHz та простежте диспетчеризацію сигналу до інтерфейсу контролера.",
        level1Briefing: "Інтерактивний телевізор працює на фізичних лініях напруги, які перетворюються на дискретні програмні команди. Перед впровадженням слабкої зв'язності або Dependency Injection перевірте базовий ланцюг сигналу: Пульт ДК → ІЧ-фотодіод → Переривання MCU GPIO → Диспетчеризація команди.",
        level1Explanation: "Коли кнопка пульта ініціює ІЧ-імпульс, апаратні переривання в MCU десеріалізують протокол NEC у дискретний код команди. У програмній архітектурі це моделюється як IRemoteCommand, ізолюючи фізичний сигнал від мутацій стану.",
      },
    },
  },
  en: {
    translation: {
      common: {
        appTitle: "Interactive Workbench",
        status: "Operational",
        localeName: "English",
        xp: "XP",
        hint: "Hint",
        reset: "Reset",
        cancel: "Cancel",
      },
      workbench: {
        backToTv: "← Back to TV",
        switchToArchitecture: "Architecture Studio",
        deviceView: "Television",
        tvDeviceTitle: "Smart TV 65\" (Console)",
        remoteConsoleTitle: "Remote Control (Console)",
        remoteHandsetTitle: "Remote Control",
        irReceiver: "IR Receiver",
        carrierLabel: "38 kHz IR",
        readyToReceive: "Ready to receive",
        xpTooltip: "Experience Points (XP)",
        codeAndSchematic: "Code and Schematic",
        drawerOpened: "Open",
        drawerClosed: "Open",
        drawerPinned: "Pinned",
        hintTitle: "Hint:",
        tvStandbyHint: "TV connected. Press the power button [PWR] on the remote control",
        tvPlayingHint: "Channel {{channel}}: {{channelName}} • Volume: {{volume}}/100",
        stationTitle: "Television Station",
        drawerTabs: {
          code: "Code (C# / Go)",
          hardware: "Hardware Nodes",
          architecture: "Architecture",
        },
      },
      drawer: {
        objectiveTitle: "Engineering Objective:",
        syntaxVerified: "Syntax Verified",
        signalArchitectureLink: "Physical Signal to Software Architecture Link",
        pinned: "Pinned",
        unpin: "Unpin Drawer (Floating Overlay)",
        pin: "Pin Drawer (Side-by-side Dock)",
        close: "Close Drawer (ESC)",
        footerEsc: "Esc or close",
        footerPinned: "Pinned on workbench",
        footerActive: "Television • Circuit Active",
        levelBadge: "Level {{number}}",
        iocTitle: "Inversion of Control (IoC & DI Contract)",
        iocDescription: "The television receiver does not instantiate commands manually. It accepts abstractions implementing the IRemoteCommand contract. The Execute method is wired to the TV controller input port via Dependency Injection.",
        commandContractLabel: "Command Contract",
        commandRegistryLabel: "Command Registry",
        diInjectionLabel: "✓ Injected via DI",
        keyTermsTitle: "Key Technical Terms (Untranslated)",
      },
      architecture: {
        title: "Architecture Studio",
        projectTree: "Project Explorer",
        searchPlaceholder: "Search files and classes...",
        dragHint: "Drag or click a file to place on canvas",
        level1Title: "Level 1: Wiring the Power Command",
        waitingConnection: "Awaiting Connection",
        connectionActive: "✓ Wire Connected",
        missionInstructions: "Connect the Execute output port of PowerCommand to the CommandHandler input port of TVController.",
        missionSuccess: "Contract fulfilled! Execute method of PowerCommand is wired to TVController. Power button on remote is active.",
        autoWire: "Auto-Wire",
        reset: "Reset",
        centerView: "Center View",
        inputsDI: "Inputs (DI)",
        methodsOutputs: "Methods / Events",
        noInputs: "No inputs",
        noOutputs: "No methods",
        activeWire: "Active Wire",
        connection: "Connection",
        disconnect: "Disconnect wire",
        openFullscreen: "Open Architecture Studio Fullscreen",
        fullscreenCardDesc: "The visual architecture editor in Unreal Blueprints / Blender Nodes style now operates in a spacious full-screen workspace with complete Project Explorer and search.",
        terminal: "Terminal",
        liveLog: "Log",
        clearLog: "Clear log",
        collapse: "Collapse",
        currentGoal: "Current Goal",
        terminalEmpty: "Log is empty — connect nodes to see explanations",
        noCodeYet: "// No connections — drag a wire between node ports",
      },
      level: {
        level1Title: "Power Rail & Signal Initiation",
        level1Objective: "Verify the 5V power bus, observe incoming 38 kHz infrared packets, and trace signal dispatch to the controller interface.",
        level1Briefing: "An interactive TV set operates on physical voltage lines that translate into discrete software commands. Inspect the baseline signal pipeline: Remote → IR Photodiode → MCU GPIO Interrupt → Command Dispatch.",
        level1Explanation: "When a remote button triggers an IR pulse, hardware interrupts in the MCU deserialize the NEC protocol into a discrete opcode. In software, this is modeled as an IRemoteCommand, isolating the physical signal from high-level state mutations.",
      },
    },
  },
  da: {
    translation: {
      common: {
        appTitle: "Interactive Workbench",
        status: "Operationel",
        localeName: "Dansk",
        xp: "XP",
        hint: "Tip",
        reset: "Nulstil",
        cancel: "Annuller",
      },
      workbench: {
        backToTv: "← Til fjernsynet",
        switchToArchitecture: "Architecture Studio",
        deviceView: "Fjernsyn",
        tvDeviceTitle: "Smart TV 65\" (Konsol)",
        remoteConsoleTitle: "Fjernbetjening (Konsol)",
        remoteHandsetTitle: "Fjernbetjening",
        irReceiver: "IR-modtager",
        carrierLabel: "38 kHz IR",
        readyToReceive: "Klar til modtagelse",
        xpTooltip: "Erfaringspoint (XP)",
        codeAndSchematic: "Code and Schematic",
        drawerOpened: "Åben",
        drawerClosed: "Åbn",
        drawerPinned: "Fastgjort",
        hintTitle: "Tip:",
        tvStandbyHint: "Fjernsynet er tilsluttet. Tryk på tænd/sluk-knappen [PWR] på fjernbetjeningen",
        tvPlayingHint: "Kanal {{channel}}: {{channelName}} • Lydstyrke: {{volume}}/100",
        stationTitle: "Fjernsynsstation",
        drawerTabs: {
          code: "Kode (C# / Go)",
          hardware: "Hardwareknuder",
          architecture: "Arkitektur",
        },
      },
      drawer: {
        objectiveTitle: "Ingeniøropgave:",
        syntaxVerified: "Syntaks verificeret",
        signalArchitectureLink: "Forbindelse mellem fysisk signal og softwarearkitektur",
        pinned: "Fastgjort",
        unpin: "Frigør panel (Flydende overlejring)",
        pin: "Fastgør panel (Side om side)",
        close: "Luk panel (ESC)",
        footerEsc: "Esc eller luk",
        footerPinned: "Fastgjort på arbejdsbænken",
        footerActive: "Fjernsyn • Kredsløb aktivt",
        levelBadge: "Niveau {{number}}",
        iocTitle: "Inversion of Control (IoC & DI kontrakt)",
        iocDescription: "Fjernsynsmodtageren opretter ikke kommandoer manuelt. Den accepterer abstraktioner, der implementerer IRemoteCommand-kontrakten. Execute-metoden tilføres tv-controllerens indgangsport via Dependency Injection.",
        commandContractLabel: "Kommandokontrakt",
        commandRegistryLabel: "Kommandoregister",
        diInjectionLabel: "✓ Injektion via DI",
        keyTermsTitle: "Nøgletekniske termer (Uoversat)",
      },
      architecture: {
        title: "Architecture Studio",
        projectTree: "Projektstruktur",
        searchPlaceholder: "Søg efter filer og klasser...",
        dragHint: "Træk eller klik på en fil for at placere på lærredet",
        level1Title: "Niveau 1: Forbindelse af PowerCommand",
        waitingConnection: "Afventer forbindelse",
        connectionActive: "✓ Forbindelse aktiv",
        missionInstructions: "Forbind Execute-outputporten på PowerCommand med CommandHandler-inputporten på TVController.",
        missionSuccess: "Kontrakt opfyldt! Execute-metoden i PowerCommand er forbundet til TVController. Tænd/sluk-knappen på fjernbetjeningen er aktiv.",
        autoWire: "Auto-forbind",
        reset: "Nulstil",
        centerView: "Centrér visning",
        inputsDI: "Indgange (DI)",
        methodsOutputs: "Metoder / Hændelser",
        noInputs: "Ingen indgange",
        noOutputs: "Ingen metoder",
        activeWire: "Aktiv forbindelse",
        connection: "Forbindelse",
        disconnect: "Afbryd ledning",
        openFullscreen: "Åbn Architecture Studio i fuld skærm",
        fullscreenCardDesc: "Den visuelle arkitektur-editor i Unreal Blueprints / Blender Nodes-stil kører nu i fuld skærm med komplet Project Explorer og søgning.",
        terminal: "Terminal",
        liveLog: "Log",
        clearLog: "Ryd log",
        collapse: "Fold sammen",
        currentGoal: "Nuværende mål",
        terminalEmpty: "Loggen er tom — forbind noder for at se forklaringer",
        noCodeYet: "// Ingen forbindelser — træk en ledning mellem nodeporte",
      },
      level: {
        level1Title: "Strømskinne og signalinitiering",
        level1Objective: "Bekræft 5V strømskinnen, observer indkommende 38 kHz infrarøde pakker, og følg signalforsendelsen til controller-interfacet.",
        level1Briefing: "Et interaktivt tv fungerer på fysiske spændingslinjer, der oversættes til diskrete softwarekommandoer. Undersøg den grundlæggende signalkæde: Fjernbetjening → IR-fotodiode → MCU GPIO-afbrydelse → Kommandoforsendelse.",
        level1Explanation: "Når en knap på fjernbetjeningen udløser en IR-impuls, deserialiserer hardwareafbrydelser i MCU'en NEC-protokollen til en diskret opcode. I software modelleres dette som en IRemoteCommand, der isolerer det fysiske signal fra tilstandsmutationer på højt niveau.",
      },
    },
  },
} as const;

/**
 * Initializes the i18next instance if not already initialized
 */
export function initI18n(initialLocale: SupportedLocale = DEFAULT_LOCALE) {
  const savedLocale =
    typeof window !== "undefined"
      ? (localStorage.getItem("iw_locale") as SupportedLocale)
      : null;

  const activeLocale =
    savedLocale && SUPPORTED_LOCALES.includes(savedLocale)
      ? savedLocale
      : initialLocale;

  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: defaultResources,
      lng: activeLocale,
      fallbackLng: DEFAULT_LOCALE,
      defaultNS: "translation",
      ns: ["translation"],
      interpolation: {
        escapeValue: false, // React already escapes by default
      },
    });

    i18n.on("languageChanged", (lng) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("iw_locale", lng);
      }
    });
  }
  return i18n;
}

export { i18n };
export const I18N_PACKAGE_VERSION = "0.0.1";
