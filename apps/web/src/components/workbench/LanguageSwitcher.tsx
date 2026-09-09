import React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@iw/i18n";
import { Languages } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) || "uk") as SupportedLocale;

  return (
    <div
      className="flex items-center gap-0.5 bg-paper p-0.5 sm:p-1 rounded-xl border border-paper-border shadow-paper-sm select-none"
      title="Зміна мови / Change language / Skift sprog"
    >
      <Languages size={13} className="text-ink-subtle ml-1 mr-0.5 hidden sm:inline" />
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLang === locale;
        return (
          <button
            key={locale}
            onClick={() => i18n.changeLanguage(locale)}
            className={`px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-balsamiq font-bold uppercase transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-accent-blue text-white shadow-xs"
                : "text-ink-muted hover:text-ink hover:bg-paper-muted"
            }`}
            title={locale === "uk" ? "Українська" : locale === "da" ? "Dansk" : "English"}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
};
