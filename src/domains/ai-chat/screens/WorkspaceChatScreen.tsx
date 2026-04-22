"use client";

import { ConfigProvider, Spin } from "antd";
import { useWorkspace } from "@/domains/workspace/workspace.queries";
import { WorkspaceChatPanel } from "../components/WorkspaceChatPanel";
import { WorkspaceNotFoundScreen } from "@/domains/workspace/screens/WorkspaceNotFoundScreen";

type WorkspaceChatScreenProps = {
  workspaceId: string;
};

export function WorkspaceChatScreen({ workspaceId }: WorkspaceChatScreenProps) {
  const { data: workspace, isLoading } = useWorkspace(workspaceId);

  /** Only block the whole screen until we have workspace data once; background refetch must not unmount chat. */
  if (isLoading && !workspace) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          background: "#fff",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }
  if (!workspace) return <WorkspaceNotFoundScreen />;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10a37f",
          colorSuccess: "#10a37f",
          borderRadiusLG: 16,
        },
      }}
    >
      <WorkspaceChatPanel workspaceId={workspaceId} workspaceName={workspace.name} />
    </ConfigProvider>
  );
}

