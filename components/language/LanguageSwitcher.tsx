"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

type LanguageSwitcherProps = Readonly<{
  className?: string;
  compact?: boolean;
}>;

export default function LanguageSwitcher({
  className = "",
  compact = false,
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  const selectFrench = () => {
    setLanguage("fr");
  };

  const selectEnglish = () => {
    setLanguage("en");
  };

  return (
    <div
      className={`language-switcher ${className}`.trim()}
      role="group"
      aria-label={t("Header.languageSelector")}
    >
      {!compact && (
        <Languages
          aria-hidden="true"
          className="language-switcher__icon"
          size={17}
          strokeWidth={2}
        />
      )}

      <button
        type="button"
        className="language-switcher__button"
        aria-label={t("Header.switchToFrench")}
        aria-pressed={language === "fr"}
        data-active={language === "fr"}
        onClick={selectFrench}
      >
        FR
      </button>

      <span
        className="language-switcher__separator"
        aria-hidden="true"
      >
        /
      </span>

      <button
        type="button"
        className="language-switcher__button"
        aria-label={t("Header.switchToEnglish")}
        aria-pressed={language === "en"}
        data-active={language === "en"}
        onClick={selectEnglish}
      >
        EN
      </button>
    </div>
  );
}