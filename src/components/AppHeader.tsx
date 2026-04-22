"use client";

// Clerk (paused): import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Flex } from "antd";
import { Button } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";
import { UserAccountMenu } from "@/components/UserAccountMenu";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Link } from "@/i18n/navigation";

function useWorkspaceIdFromPath(): string | null {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "workspace" && segments[1]) return segments[1];
  return null;
}

export function AppHeader() {
  const translateWorkspaceSwitcher = useTranslations("workspaceSwitcher");
  const translateNav = useTranslations("nav");
  const workspaceId = useWorkspaceIdFromPath();

  return (
    <Flex align="center" justify="flex-end" gap="middle" style={{ width: "100%" }}>
      {workspaceId && (
        <Link href={`/workspace/${workspaceId}/chat`}>
          <Button type="link" style={{ padding: 0 }}>
            {translateNav("chat")}
          </Button>
        </Link>
      )}
      {workspaceId && (
        <Link href={`/workspace/${workspaceId}/documents`}>
          <Button type="link" style={{ padding: 0 }}>
            {translateNav("documents")}
          </Button>
        </Link>
      )}
      {workspaceId ? (
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      ) : (
        <>
          <LocaleSelect />
          <Link href="/workspaces">
            <Button type="link" style={{ padding: 0 }}>
              {translateWorkspaceSwitcher("allWorkspaces")}
            </Button>
          </Link>
          <Link href="/onboarding?create=true">
            <Button type="link" style={{ padding: 0 }}>
              {translateWorkspaceSwitcher("createWorkspace")}
            </Button>
          </Link>
          {/* Clerk (paused): <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} /> */}
          <UserAccountMenu />
        </>
      )}
    </Flex>
  );
}
