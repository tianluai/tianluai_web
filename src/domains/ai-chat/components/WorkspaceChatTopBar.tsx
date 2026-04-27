"use client";

// Clerk (paused): import { UserButton } from "@clerk/nextjs";
import { MenuOutlined } from "@ant-design/icons";
import { Flex, theme } from "antd";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";
import { UserAccountMenu } from "@/components/UserAccountMenu";
import { WorkspacePickerDropdown } from "@/components/workspace-switcher";
import { useIntegrationsMarketplaceModal } from "@/domains/integrations/IntegrationsModalContext";

type WorkspaceChatTopBarProps = {
  workspaceId: string;
  onOpenSidebar: () => void;
  showSidebarToggle: boolean;
};

export function WorkspaceChatTopBar({
  workspaceId,
  onOpenSidebar,
  showSidebarToggle,
}: WorkspaceChatTopBarProps) {
  const translateNav = useTranslations("nav");
  const translateWorkspaceChat = useTranslations("workspace.chat");
  const { token } = theme.useToken();
  const { openMarketplace } = useIntegrationsMarketplaceModal();

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        height: 52,
        paddingInline: 16,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgLayout,
        flexShrink: 0,
      }}
    >
      <Flex align="center" gap="small">
        {showSidebarToggle && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onOpenSidebar}
            aria-label={translateWorkspaceChat("threadsAria")}
            style={{ color: token.colorText }}
          />
        )}
        <WorkspacePickerDropdown currentWorkspaceId={workspaceId} />
      </Flex>
      <Flex align="center" gap="middle">
        <Button
          type="text"
          style={{ padding: 0, color: token.colorTextSecondary }}
          onClick={() => openMarketplace()}
        >
          {translateNav("integrations")}
        </Button>
        <LocaleSelect />
        {/* Clerk (paused): <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} /> */}
        <UserAccountMenu />
      </Flex>
    </Flex>
  );
}
