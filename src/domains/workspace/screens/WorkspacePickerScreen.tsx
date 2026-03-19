"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { PageLayout } from "@/components/ui";
import type { Workspace } from "@/lib/api-common";
import { getWorkspacesAction } from "../actions";
import { WorkspaceSelect } from "../components/WorkspaceSelect";

export function WorkspacePickerScreen() {
  const router = useRouter();
  const locale = useLocale();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWorkspacesAction()
      .then((list) => {
        setWorkspaces(list);
        if (list.length === 0) router.replace(`/${locale}/onboarding`);
        if (list.length === 1) router.replace(`/${locale}/workspace/${list[0].id}`);
      })
      .finally(() => setLoading(false));
  }, [router, locale]);

  if (loading) return null;

  return (
    <PageLayout centered={false}>
      <WorkspaceSelect workspaces={workspaces} />
    </PageLayout>
  );
}
