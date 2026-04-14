"use client";

import { useParams } from "next/navigation";
import { WorkspaceChatScreen } from "./screens/WorkspaceChatScreen";

export default function WorkspaceChatPage() {
  const params = useParams();
  const workspaceId = typeof params.workspaceId === "string" ? params.workspaceId : "";
  if (!workspaceId) return null;
  return <WorkspaceChatScreen workspaceId={workspaceId} />;
}
