import type { AppLocale } from "@/constants/translations";
import { translations } from "@/constants/translations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type { AppLocale } from "@/constants/translations";

type I18nContextValue = {
  locale: AppLocale;
  setLocale: (nextLocale: AppLocale) => void;
  toggleLocale: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
};

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "pt-BR";
i18n.locale = "pt-BR";

const LOCALE_STORAGE_KEY = "@gymlog/settings/locale";

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<AppLocale>("pt-BR");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadLocale = async () => {
      try {
        const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
        if (saved === "pt-BR" || saved === "en-US") {
          setLocale(saved);
        }
      } catch {
        // Keep default when read fails.
      } finally {
        if (mounted) {
          setHydrated(true);
        }
      }
    };

    loadLocale();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale).catch(() => {
      // Ignore storage write errors.
    });
  }, [locale, hydrated]);

  const value = useMemo<I18nContextValue>(() => {
    i18n.locale = locale;

    return {
      locale,
      setLocale,
      toggleLocale: () => {
        setLocale((current) => (current === "pt-BR" ? "en-US" : "pt-BR"));
      },
      t: (key, options) => i18n.t(key, options) as string,
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    return {
      locale: "pt-BR" as AppLocale,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key: string) => key,
    };
  }

  return context;
}
