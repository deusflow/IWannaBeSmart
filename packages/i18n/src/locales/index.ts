import { uaTranslation } from "./ua";
import { enTranslation } from "./en";
import { daTranslation } from "./da";

export const defaultResources = {
  ua: {
    translation: uaTranslation,
  },
  en: {
    translation: enTranslation,
  },
  da: {
    translation: daTranslation,
  },
};

export type LocaleResource = typeof uaTranslation;
export { uaTranslation, enTranslation, daTranslation };
