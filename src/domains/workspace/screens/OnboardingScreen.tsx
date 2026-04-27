"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { PageLayout } from "@/components/ui";
import { useSyncUser, useWorkspaces } from "../workspace.queries";
import { OnboardingClient } from "../components/OnboardingClient";

export function OnboardingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createMode = searchParams.get("create") === "true";

  const sync = useSyncUser();
  const workspaces = useWorkspaces({ enabled: sync.isSuccess });

  useEffect(() => {
    if (createMode || !workspaces.data) return;
    if (workspaces.data.length === 1)
      router.replace(`/workspace/${workspaces.data[0].id}/chat`);
    if (workspaces.data.length > 1) router.replace("/workspaces");
  }, [workspaces.data, createMode, router]);

  if (sync.isLoading || workspaces.isLoading) return null;

  const apiError = sync.error?.message ?? workspaces.error?.message ?? null;

  return (
    <PageLayout>
      <OnboardingClient apiError={apiError} />
    </PageLayout>
  );
}
