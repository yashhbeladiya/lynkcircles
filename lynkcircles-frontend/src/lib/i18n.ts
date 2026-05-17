import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "@/locales/en/common.json";
import hi from "@/locales/hi/common.json";
import mr from "@/locales/mr/common.json";

/**
 * i18n bootstrap. Each locale ships one "common" namespace for now
 * — when the catalog of strings grows we can split (e.g., "profile",
 * "messages") but at the current scale one namespace per locale is
 * the right tradeoff between key locality and file proliferation.
 *
 * Detection order: user pick → localStorage → browser → fallback en.
 * Fallback chain: missing key in hi/mr drops to en. That means a
 * partial translation file is safe to ship; readers see English for
 * keys we haven't covered yet.
 */

export const SUPPORTED_LOCALES = ["en", "hi", "mr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      hi: { common: hi },
      mr: { common: mr },
    },
    defaultNS: "common",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: { escapeValue: false }, // React already escapes
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "lynkcircles:locale",
    },
  });

export default i18n;
