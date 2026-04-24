"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { ScreenLayout } from "@/components/ui";

/** `/workspace/.../integrations` → chat with `?integrations=1` so the global modal opens. */
export default function IntegrationsOpenModalViaChatPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";

  useEffect(() => {
    if (!workspaceId) return;
    router.replace(`/workspace/${workspaceId}/chat?integrations=1`);
  }, [router, workspaceId]);

  return (
    <ScreenLayout centered>
      <Spin size="large" />
    </ScreenLayout>
  );
}
