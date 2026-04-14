"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { DownOutlined } from "@ant-design/icons";
import { Flex } from "antd";
import { useTranslations } from "next-intl";
import { Button, Dropdown } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";
import { useWorkspaces } from "@/domains/workspace/workspace.queries";
import type { MenuProps } from "antd";

function buildWorkspaceMenuItems(args: {
  workspaces: { id: string; name: string }[];
  router: { push: (href: string) => void };
  translateWorkspaceSwitcher: (key: "allWorkspaces" | "createWorkspace") => string;
}): MenuProps["items"] {
  const { workspaces, router, translateWorkspaceSwitcher } = args;
  return [
    ...workspaces.map((workspace) => ({
      key: workspace.id,
      label: workspace.name,
      onClick: () => router.push(`/workspace/${workspace.id}`),
    })),
    { type: "divider" as const },
    {
      key: "workspaces",
      label: translateWorkspaceSwitcher("allWorkspaces"),
      onClick: () => router.push(`/workspaces`),
    },
    {
      key: "create",
      label: translateWorkspaceSwitcher("createWorkspace"),
      onClick: () => router.push(`/onboarding?create=true`),
    },
  ];
}

export function WorkspacePickerDropdown({
  currentWorkspaceId,
}: {
  currentWorkspaceId: string;
}) {
  const router = useRouter();
  const translateWorkspaceSwitcher = useTranslations("workspaceSwitcher");
  const translateWorkspacePicker = useTranslations("workspace.picker");
  const { data: workspaces = [], isLoading: loading } = useWorkspaces();
  const current = workspaces.find((workspace) => workspace.id === currentWorkspaceId);
  const menuItems: MenuProps["items"] = buildWorkspaceMenuItems({
    workspaces,
    router,
    translateWorkspaceSwitcher,
  });

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <span>
        <Button type="text" loading={loading} style={{ fontWeight: 600 }}>
          {current?.name ?? translateWorkspacePicker("placeholder")}
          <DownOutlined style={{ marginLeft: 8, fontSize: 10, opacity: 0.65 }} />
        </Button>
      </span>
    </Dropdown>
  );
}

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: {
  currentWorkspaceId: string;
}) {
  const router = useRouter();
  const translateWorkspaceSwitcher = useTranslations("workspaceSwitcher");
  const translateWorkspacePicker = useTranslations("workspace.picker");
  const { data: workspaces = [], isLoading: loading } = useWorkspaces();

  const current = workspaces.find((workspace) => workspace.id === currentWorkspaceId);
  const menuItems: MenuProps["items"] = buildWorkspaceMenuItems({
    workspaces,
    router,
    translateWorkspaceSwitcher,
  });

  return (
    <Flex align="center" gap="middle">
      <LocaleSelect />
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <span>
          <Button type="text" loading={loading}>
            {current?.name ?? translateWorkspacePicker("placeholder")}
          </Button>
        </span>
      </Dropdown>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </Flex>
  );
}
