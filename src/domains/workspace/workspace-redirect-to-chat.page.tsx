"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { ScreenLayout } from "@/components/ui";

/** `/workspace/[id]` opens chat directly (no intermediate hub page). */
export default function WorkspaceRedirectToChatPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";

  useEffect(() => {
    if (!workspaceId) return;
    router.replace(`/workspace/${workspaceId}/chat`);
  }, [router, workspaceId]);

  return (
    <ScreenLayout centered>
      <Spin size="large" />
    </ScreenLayout>
  );
}
