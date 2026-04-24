"use client";

import { Layout } from "antd";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { AuthSessionBoundary } from "@/components/AuthSessionBoundary";
import { IntegrationsModalProvider } from "@/domains/integrations/IntegrationsModalContext";

const { Header, Content } = Layout;

function isWorkspaceChatPath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 3) return false;
  const [segment, workspaceId, page] = parts;
  return segment === "workspace" && Boolean(workspaceId) && page === "chat";
}

/**
 * App chrome (header + content). i18n is provided by RootIntlClient in the route `app/[locale]/layout.tsx` (project root).
 */
export function LocaleLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const chatFullBleed = isWorkspaceChatPath(pathname);

  return (
    <IntegrationsModalProvider>
      <Layout
        style={{
          minHeight: "100vh",
          background: "#fff",
        }}
      >
        {!chatFullBleed && (
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
        )}
        <Content
          style={{
            flex: 1,
            display: chatFullBleed ? "flex" : undefined,
            flexDirection: chatFullBleed ? "column" : undefined,
            overflow: chatFullBleed ? "hidden" : undefined,
          }}
        >
          <AuthSessionBoundary>{children}</AuthSessionBoundary>
        </Content>
      </Layout>
    </IntegrationsModalProvider>
  );
}
