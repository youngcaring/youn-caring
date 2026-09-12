"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import englishMessages from "@/messages/en.json";
import frenchMessages from "@/messages/fr.json";

export type Language = "fr" | "en";

type TranslationParameters = Readonly<
  Record<string, string | number>
>;

type LanguageContextValue = Readonly<{
  language: Language;
  isFrench: boolean;
  isEnglish: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, parameters?: TranslationParameters) => string;
}>;

type LanguageProviderProps = Readonly<{
  children: ReactNode;
}>;

const DEFAULT_LANGUAGE: Language = "fr";
const STORAGE_KEY = "young-caring-language";

const LanguageContext = createContext<
  LanguageContextValue | undefined
>(undefined);

function isSupportedLanguage(value: unknown): value is Language {
  return value === "fr" || value === "en";
}

function getNestedValue(
  dictionary: unknown,
  key: string
): string | undefined {
  if (
    dictionary === null ||
    typeof dictionary !== "object" ||
    key.length === 0 ||
    key.length > 200
  ) {
    return undefined;
  }

  const segments = key.split(".").filter(Boolean);

  if (segments.length === 0 || segments.length > 20) {
    return undefined;
  }

  let currentValue: unknown = dictionary;

  for (const segment of segments) {
    if (
      segment === "__proto__" ||
      segment === "prototype" ||
      segment === "constructor"
    ) {
      return undefined;
    }

    if (
      currentValue === null ||
      typeof currentValue !== "object" ||
      !Object.prototype.hasOwnProperty.call(currentValue, segment)
    ) {
      return undefined;
    }

    currentValue = (
      currentValue as Record<string, unknown>
    )[segment];
  }

  return typeof currentValue === "string"
    ? currentValue
    : undefined;
}

function replaceParameters(
  message: string,
  parameters?: TranslationParameters
): string {
  if (!parameters) {
    return message;
  }

  return message.replace(
    /\{([a-zA-Z0-9_]+)\}/g,
    (placeholder: string, parameterName: string) => {
      const value = parameters[parameterName];

      if (
        typeof value !== "string" &&
        typeof value !== "number"
      ) {
        return placeholder;
      }

      return String(value);
    }
  );
}

export default function LanguageProvider({
  children,
}: LanguageProviderProps) {
  /*
   * Le français reste la langue du premier rendu.
   * Cela évite les différences entre le serveur et le navigateur.
   */
  const [language, updateLanguage] =
    useState<Language>(DEFAULT_LANGUAGE);

  /*
   * La préférence sauvegardée est restaurée après le premier rendu.
   * Le délai évite l’appel synchrone à setState dans un effet,
   * signalé par les versions récentes d’ESLint React.
   */
  useEffect(() => {
    let timerId: number | undefined;

    try {
      const savedLanguage =
        window.localStorage.getItem(STORAGE_KEY);

      if (isSupportedLanguage(savedLanguage)) {
        timerId = window.setTimeout(() => {
          updateLanguage(savedLanguage);
        }, 0);
      }
    } catch {
      /*
       * localStorage peut être indisponible ou bloqué.
       * Le site continue alors normalement en français.
       */
    }

    return () => {
      if (timerId !== undefined) {
        window.clearTimeout(timerId);
      }
    };
  }, []);

  /*
   * Synchronise la langue du document pour l’accessibilité
   * et les technologies d’assistance.
   */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(
    (nextLanguage: Language): void => {
      if (!isSupportedLanguage(nextLanguage)) {
        return;
      }

      updateLanguage(nextLanguage);

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          nextLanguage
        );
      } catch {
        /*
         * La langue reste active pendant la visite même
         * lorsque la sauvegarde locale est indisponible.
         */
      }
    },
    []
  );

  const toggleLanguage = useCallback((): void => {
    setLanguage(language === "fr" ? "en" : "fr");
  }, [language, setLanguage]);

  const t = useCallback(
    (
      key: string,
      parameters?: TranslationParameters
    ): string => {
      const selectedDictionary =
        language === "en"
          ? englishMessages
          : frenchMessages;

      /*
       * Une traduction anglaise manquante est remplacée
       * automatiquement par sa version française.
       */
      const message =
        getNestedValue(selectedDictionary, key) ??
        getNestedValue(frenchMessages, key) ??
        key;

      return replaceParameters(message, parameters);
    },
    [language]
  );

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      isFrench: language === "fr",
      isEnglish: language === "en",
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error(
      "useLanguage doit être utilisé à l’intérieur de LanguageProvider."
    );
  }

  return context;
}