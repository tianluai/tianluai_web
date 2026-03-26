"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import { PageLayout } from "@/components/ui";
import { useSyncUser, useWorkspaces } from "../workspace.queries";
import { OnboardingClient } from "../components/OnboardingClient";

export function OnboardingScreen() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const createMode = searchParams.get("create") === "true";

  const sync = useSyncUser();
  const workspaces = useWorkspaces({ enabled: sync.isSuccess });

  useEffect(() => {
    if (createMode || !workspaces.data) return;
    if (workspaces.data.length === 1)
      router.replace(`/${locale}/workspace/${workspaces.data[0].id}`);
    if (workspaces.data.length > 1)
      router.replace(`/${locale}/workspaces`);
  }, [workspaces.data, createMode, router, locale]);

  if (sync.isLoading || workspaces.isLoading) return null;

  const apiError = sync.error?.message ?? workspaces.error?.message ?? null;

  return (
    <PageLayout>
      <OnboardingClient apiError={apiError} />
    </PageLayout>
  );
}
