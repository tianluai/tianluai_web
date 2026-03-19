"use client";

import type { ComponentProps } from "react";
import { NextIntlClientProvider } from "next-intl";

type IntlProviderClientProps = {
  locale: string;
  messages: ComponentProps<typeof NextIntlClientProvider>["messages"];
  children: React.ReactNode;
};

/**
 * Client-only wrapper for NextIntlClientProvider so the locale layout
 * (a Server Component) never imports next-intl's server bundle and thus
 * never triggers the next-intl/config resolution (broken under Next 16 + Turbopack).
 */
export function IntlProviderClient({
  locale,
  messages,
  children,
}: IntlProviderClientProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="UTC"
    >
      {children}
    </NextIntlClientProvider>
  );
}
