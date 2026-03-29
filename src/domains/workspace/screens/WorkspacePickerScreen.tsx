"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import { PageLayout } from "@/components/ui";
import { useWorkspaces } from "../workspace.queries";
import { WorkspaceSelect } from "../components/WorkspaceSelect";

export function WorkspacePickerScreen() {
  const router = useRouter();
  const locale = useLocale();
  const { data: workspaces = [], isLoading } = useWorkspaces();

  useEffect(() => {
    if (isLoading) return;
    if (workspaces.length === 0) router.replace(`/${locale}/onboarding`);
    if (workspaces.length === 1) router.replace(`/${locale}/workspace/${workspaces[0].id}`);
  }, [workspaces, isLoading, router, locale]);

  if (isLoading) return null;

  return (
    <PageLayout centered={false}>
      <WorkspaceSelect workspaces={workspaces} />
    </PageLayout>
  );
}
