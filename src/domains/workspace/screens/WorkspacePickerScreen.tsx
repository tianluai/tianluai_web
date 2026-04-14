"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLayout } from "@/components/ui";
import { useWorkspaces } from "../workspace.queries";
import { WorkspaceSelect } from "../components/WorkspaceSelect";

export function WorkspacePickerScreen() {
  const router = useRouter();
  const { data: workspaces = [], isLoading } = useWorkspaces();

  useEffect(() => {
    if (isLoading) return;
    if (workspaces.length === 0) router.replace("/onboarding");
    if (workspaces.length === 1) router.replace(`/workspace/${workspaces[0].id}`);
  }, [workspaces, isLoading, router]);

  if (isLoading) return null;

  return (
    <PageLayout centered={false}>
      <WorkspaceSelect workspaces={workspaces} />
    </PageLayout>
  );
}
