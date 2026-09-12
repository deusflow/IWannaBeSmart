/**
 * @file packages/i18n/src/index.ts
 * @description react-i18next configuration and multilingual resources (UA, EN, DA)
 * (Interactive Workbench, Block A, Items 3, 5, 6; Block M, Item 99)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  theoryUa,
  theoryEn,
  theoryDa,
  type SyntaxTokenExplanation,
  type TaskTheory,
  type TheoryDictionary,
} from "./theory";
import {
  defaultResources,
  uaTranslation,
  enTranslation,
  daTranslation,
  type LocaleResource,
} from "./locales";

export const SUPPORTED_LOCALES = ["ua", "en", "da"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "ua";

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
  "AddTransient",
  "Loose Coupling",
  "VCC",
  "GND",
  "TSOP38238",
  "LM7805",
  "ATmega328P",
  "TDA9351",
  "LM386",
  "24C08",
] as const;

export { defaultResources, uaTranslation, enTranslation, daTranslation, type LocaleResource };

export function initI18n(initialLocale?: SupportedLocale) {
  const savedLocale =
    typeof window !== "undefined"
      ? (localStorage.getItem("iw_locale") as SupportedLocale | null)
      : null;

  const activeLocale =
    initialLocale && SUPPORTED_LOCALES.includes(initialLocale)
      ? initialLocale
      : savedLocale && SUPPORTED_LOCALES.includes(savedLocale)
      ? savedLocale
      : DEFAULT_LOCALE;

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
export {
  theoryUa,
  theoryEn,
  theoryDa,
  type SyntaxTokenExplanation,
  type TaskTheory,
  type TheoryDictionary,
};
export const I18N_PACKAGE_VERSION = "0.0.1";
