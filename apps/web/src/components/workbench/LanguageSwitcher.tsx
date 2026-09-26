import React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LOCALES, type SupportedLocale } from "@iw/i18n";
import { Languages } from "lucide-react";

import { audioFx } from "../../utils/audioFx";
import { toast } from "../../store/toastStore";

export interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
  className = "",
  showIcon = true,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n.language?.slice(0, 2) || "ua") as SupportedLocale;

  return (
    <div
      className={`flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-[#1E2227]/15 shadow-2xs select-none shrink-0 ${className}`}
      title="Зміна мови / Change language / Skift sprog"
    >
      {showIcon && !compact && (
        <Languages size={13} className="text-[#1E2227]/50 ml-1 mr-0.5 hidden sm:inline" />
      )}
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = currentLang === locale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => {
              if (locale !== currentLang) {
                audioFx.playRelayClick();
                i18n.changeLanguage(locale);
                const langLabels: Record<string, string> = {
                  ua: "Мову перемкнуто: Українська",
                  en: "Language switched: English",
                  da: "Sprog skiftet: Dansk",
                };
                toast.info(langLabels[locale] || locale.toUpperCase());
              }
            }}
            className={`px-2 py-0.5 rounded-lg text-[10.5px] font-mono font-bold uppercase transition-all duration-150 cursor-pointer ${
              isActive
                ? "bg-[#1E2227] text-white shadow-2xs"
                : "text-[#1E2227]/60 hover:text-[#1E2227] hover:bg-[#1E2227]/5"
            }`}
            title={locale === "ua" ? "Українська" : locale === "da" ? "Dansk" : "English"}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
};

