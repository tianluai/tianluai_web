"use client";

import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button, Dropdown } from "@/components/ui";
import { useWorkspaces } from "@/lib/use-workspaces";
import type { MenuProps } from "antd";

export function WorkspaceSwitcher({
  currentWorkspaceId,
}: {
  currentWorkspaceId: string;
}) {
  const router = useRouter();
  const { workspaces, loading } = useWorkspaces();

  const current = workspaces.find((workspace) => workspace.id === currentWorkspaceId);
  const menuItems: MenuProps["items"] = [
    ...workspaces.map((workspace) => ({
      key: workspace.id,
      label: workspace.name,
      onClick: () => router.push(`/workspace/${workspace.id}`),
    })),
    { type: "divider" as const },
    {
      key: "workspaces",
      label: "All workspaces",
      onClick: () => router.push("/workspaces"),
    },
    {
      key: "create",
      label: "Create workspace",
      onClick: () => router.push("/onboarding"),
    },
  ];

  return (
    <div className="flex items-center gap-3">
      <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
        <span>
          <Button type="text" loading={loading}>
            {current?.name ?? "Workspace"}
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
    </div>
  );
}
