import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en_US from "@/locales/en_US.json";
import es_ES from "@/locales/es_ES.json";

export enum Language {
  EnglishUS = "en_US",
  SpanishES = "es_ES",
}

// Map any browser locale (e.g. "es", "es-ES", "es-AR") to our supported keys.
// Falls back to English for anything unrecognised.
function normalizeLocale(lang: string): string {
  if (lang.startsWith("es")) return Language.SpanishES;
  return Language.EnglishUS;
}

const resources = {
  [Language.EnglishUS]: { translation: en_US },
  [Language.SpanishES]: { translation: es_ES },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: Language.EnglishUS,
    interpolation: { escapeValue: false },
    detection: {
      // Check localStorage first (returning users), then browser language (new users)
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
      convertDetectedLanguage: normalizeLocale,
    },
  });

export default i18n;
