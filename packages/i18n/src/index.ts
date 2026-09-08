/**
 * @file packages/i18n/src/index.ts
 * @description react-i18next configuration skeleton and untranslated technical terms dictionary
 * (Interactive Workbench, Block A, Items 3, 5, 6)
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LOCALES = ["en", "da", "uk"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";

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
] as const;

export const defaultResources = {
  en: {
    common: {
      appTitle: "Interactive Workbench",
      status: "Operational",
      localeName: "English",
    },
  },
  da: {
    common: {
      appTitle: "Interactive Workbench",
      status: "Operationel",
      localeName: "Dansk",
    },
  },
  uk: {
    common: {
      appTitle: "Interactive Workbench",
      status: "Працює",
      localeName: "Українська",
    },
  },
} as const;

/**
 * Initializes the i18next instance if not already initialized
 */
export function initI18n(initialLocale: SupportedLocale = DEFAULT_LOCALE) {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: defaultResources,
      lng: initialLocale,
      fallbackLng: DEFAULT_LOCALE,
      interpolation: {
        escapeValue: false, // React already escapes by default
      },
    });
  }
  return i18n;
}

export { i18n };
export const I18N_PACKAGE_VERSION = "0.0.1";
