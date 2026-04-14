"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AbstractIntlMessages } from "next-intl";
import { getMessagesForLocale } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";

/** Matches next-intl middleware default (`receiveLocaleCookie` in next-intl). */
const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

type LocaleSwitcherContextValue = {
  locale: string;
  setLocale: (nextLocale: string) => void;
};

const LocaleSwitcherContext = createContext<LocaleSwitcherContextValue | null>(null);

export function useLocaleSwitcher() {
  const value = useContext(LocaleSwitcherContext);
  if (!value) {
    throw new Error("useLocaleSwitcher must be used within RootIntlClient");
  }
  return value;
}

type RootIntlClientProps = {
  initialLocale: string;
  initialMessages: AbstractIntlMessages;
  children: ReactNode;
};

export function RootIntlClient({
  initialLocale,
  initialMessages,
  children,
}: RootIntlClientProps) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [messages, setMessages] = useState<AbstractIntlMessages>(initialMessages);

  /** DOM only — locale state is remounted when route `locale` changes (`key` on parent). */
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: string) => {
    const resolved = routing.locales.includes(nextLocale as "en" | "es")
      ? nextLocale
      : routing.defaultLocale;
    setLocaleState(resolved);
    setMessages(getMessagesForLocale(resolved) as AbstractIntlMessages);
    document.cookie = `${LOCALE_COOKIE_NAME}=${resolved};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = resolved;
  }, []);

  const contextValue = useMemo(
    () => ({ locale, setLocale }),
    [locale, setLocale],
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <LocaleSwitcherContext.Provider value={contextValue}>
        {children}
      </LocaleSwitcherContext.Provider>
    </NextIntlClientProvider>
  );
}
