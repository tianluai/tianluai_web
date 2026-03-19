"use client";

import { Layout } from "antd";
import { usePathname } from "next/navigation";
import { IntlProviderClient } from "@/components/IntlProviderClient";
import { AppHeader } from "@/components/AppHeader";
import { getMessagesForLocale } from "@/i18n/load-messages";
import { routing } from "@/i18n/routing";

const { Header, Content } = Layout;

/**
 * Client-only locale layout: reads locale from URL, provides i18n, and a global navbar.
 */
export function LocaleLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").filter(Boolean)[0];
  const locale =
    segment && routing.locales.includes(segment as "en" | "es")
      ? segment
      : routing.defaultLocale;
  const messages = getMessagesForLocale(locale);

  return (
    <IntlProviderClient locale={locale} messages={messages}>
      <Layout style={{ minHeight: "100vh", background: "#fff" }}>
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            borderBottom: "1px solid #f0f0f0",
            background: "#fff",
            paddingInline: 24,
          }}
        >
          <AppHeader />
        </Header>
        <Content style={{ flex: 1 }}>{children}</Content>
      </Layout>
    </IntlProviderClient>
  );
}
