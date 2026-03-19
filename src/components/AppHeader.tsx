"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Flex } from "antd";
import { Button } from "@/components/ui";
import { LocaleSelect } from "@/components/LocaleSelect";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function useWorkspaceIdFromPath(): string | null {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const localeIndex = segments.findIndex((s) =>
    routing.locales.includes(s as "en" | "es")
  );
  if (localeIndex === -1) return null;
  const afterLocale = segments.slice(localeIndex + 1);
  if (afterLocale[0] === "workspace" && afterLocale[1]) return afterLocale[1];
  return null;
}

export function AppHeader() {
  const locale = useLocale();
  const t = useTranslations("workspaceSwitcher");
  const workspaceId = useWorkspaceIdFromPath();

  return (
    <Flex align="center" justify="flex-end" gap="middle" style={{ width: "100%" }}>
      {workspaceId ? (
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      ) : (
        <>
          <LocaleSelect />
          <Link href="/workspaces">
            <Button type="link" style={{ padding: 0 }}>
              {t("allWorkspaces")}
            </Button>
          </Link>
          <Link href="/onboarding?create=true">
            <Button type="link" style={{ padding: 0 }}>
              {t("createWorkspace")}
            </Button>
          </Link>
          <UserButton
            afterSignOutUrl={`/${locale}`}
            appearance={{
              elements: { avatarBox: "h-8 w-8" },
            }}
          />
        </>
      )}
    </Flex>
  );
}
