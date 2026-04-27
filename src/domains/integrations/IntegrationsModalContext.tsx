"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Flex, Input, Modal, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import { Title } from "@/components/ui";
import { IntegrationsMarketplaceContent } from "./components/IntegrationsMarketplaceContent";

function useWorkspaceIdFromPath(): string | null {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "workspace" && segments[1]) return segments[1];
  return null;
}

type IntegrationsModalContextValue = {
  openMarketplace: () => void;
  closeMarketplace: () => void;
};

const IntegrationsModalContext = createContext<IntegrationsModalContextValue | null>(null);

function IntegrationsUrlOpenSync({
  workspaceId,
  signalOpen,
}: {
  workspaceId: string | null;
  signalOpen: () => void;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const integrationsFlag = searchParams.get("integrations");

  useEffect(() => {
    if (integrationsFlag !== "1") return;
    if (!workspaceId) return;
    signalOpen();
    router.replace(pathname, { scroll: false });
  }, [integrationsFlag, workspaceId, pathname, router, signalOpen]);

  return null;
}

function ExploreModalTitle({
  marketSearch,
  onMarketSearchChange,
}: {
  marketSearch: string;
  onMarketSearchChange: (value: string) => void;
}) {
  const translate = useTranslations("integrations");
  const { token } = theme.useToken();

  return (
    <Flex align="center" justify="space-between" gap={16} wrap="wrap" style={{ width: "100%" }}>
      <Title level={4} style={{ margin: 0 }}>
        {translate("exploreTitle")}
      </Title>
      <Input.Search
        allowClear
        placeholder={translate("searchPlaceholder")}
        value={marketSearch}
        onChange={(event) => onMarketSearchChange(event.target.value)}
        style={{ maxWidth: 320, minWidth: 200, flex: "1 1 200px" }}
        styles={{ input: { borderRadius: token.borderRadiusLG } }}
      />
    </Flex>
  );
}

/**
 * Explore-style marketplace `Modal` (title + search) plus body from `IntegrationsMarketplaceContent`.
 */
export function IntegrationsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [marketSearch, setMarketSearch] = useState("");
  const workspaceId = useWorkspaceIdFromPath();
  const router = useRouter();
  const { token } = theme.useToken();

  const closeMarketplace = useCallback(() => {
    setOpen(false);
    setMarketSearch("");
  }, []);

  const openMarketplace = useCallback(() => {
    if (!workspaceId) return;
    setOpen(true);
  }, [workspaceId]);

  const signalOpenFromUrl = useCallback(() => setOpen(true), []);

  const handleGoogleDriveOpen = useCallback(() => {
    if (!workspaceId) return;
    closeMarketplace();
    router.push(`/workspace/${workspaceId}/integrations/google-drive`);
  }, [workspaceId, closeMarketplace, router]);

  const value = useMemo(
    () => ({
      openMarketplace,
      closeMarketplace,
    }),
    [openMarketplace, closeMarketplace],
  );

  return (
    <IntegrationsModalContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <IntegrationsUrlOpenSync workspaceId={workspaceId} signalOpen={signalOpenFromUrl} />
      </Suspense>
      <Modal
        title={
          <ExploreModalTitle marketSearch={marketSearch} onMarketSearchChange={setMarketSearch} />
        }
        open={open && Boolean(workspaceId)}
        onCancel={closeMarketplace}
        footer={null}
        width={1100}
        destroyOnClose
        closeIcon={
          <Flex
            align="center"
            justify="center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <CloseOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
          </Flex>
        }
        styles={{
          body: { maxHeight: "78vh", overflowY: "auto", paddingTop: 14 },
          header: { marginBottom: 10 },
        }}
      >
        {workspaceId ? (
          <IntegrationsMarketplaceContent
            workspaceId={workspaceId}
            onGoogleDriveOpen={handleGoogleDriveOpen}
            showPageHeading={false}
            marketSearch={marketSearch}
          />
        ) : null}
      </Modal>
    </IntegrationsModalContext.Provider>
  );
}

export function useIntegrationsMarketplaceModal(): IntegrationsModalContextValue {
  const ctx = useContext(IntegrationsModalContext);
  if (!ctx) {
    return {
      openMarketplace: () => {},
      closeMarketplace: () => {},
    };
  }
  return ctx;
}
