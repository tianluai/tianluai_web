"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { ScreenLayout } from "@/components/ui";

/** Old `/workspace/.../documents` → Google Drive setup under Integrations. */
export default function LegacyWorkspaceDocumentsRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";

  useEffect(() => {
    if (!workspaceId) return;
    router.replace(`/workspace/${workspaceId}/integrations/google-drive`);
  }, [router, workspaceId]);

  return (
    <ScreenLayout centered>
      <Spin size="large" />
    </ScreenLayout>
  );
}
