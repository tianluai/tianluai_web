"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Flex } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { Button, Dropdown } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";
import { useWorkspaces } from "@/lib/use-workspaces";
import type { MenuProps } from "antd";

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: {
  currentWorkspaceId: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("workspaceSwitcher");
  const { workspaces, loading } = useWorkspaces();

  const current = workspaces.find((workspace) => workspace.id === currentWorkspaceId);
  const menuItems: MenuProps["items"] = [
    ...workspaces.map((workspace) => ({
      key: workspace.id,
      label: workspace.name,
      onClick: () => router.push(`/${locale}/workspace/${workspace.id}`),
    })),
    { type: "divider" as const },
    {
      key: "workspaces",
      label: t("allWorkspaces"),
      onClick: () => router.push(`/${locale}/workspaces`),
    },
    {
      key: "create",
      label: t("createWorkspace"),
      onClick: () => router.push(`/${locale}/onboarding?create=true`),
    },
  ];

  return (
    <Flex align="center" gap="middle">
      <LocaleSelect />
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <span>
          <Button type="text" loading={loading}>
            {current?.name ?? "Workspace"}
          </Button>
        </span>
      </Dropdown>
      <UserButton
        afterSignOutUrl={`/${locale}`}
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </Flex>
  );
}
