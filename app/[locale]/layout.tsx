import { notFound } from "next/navigation";
import { LocaleLayoutClient } from "@/components/LocaleLayoutClient";
import { RootIntlClient } from "@/components/RootIntlClient";
import { getMessagesForLocale } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "es")) {
    notFound();
  }
  const messages = getMessagesForLocale(locale);

  return (
    <RootIntlClient
      key={locale}
      initialLocale={locale}
      initialMessages={messages}
    >
      <LocaleLayoutClient>{children}</LocaleLayoutClient>
    </RootIntlClient>
  );
}
