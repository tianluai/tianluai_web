"use client";

import { useRouter } from "next/navigation";
import { Select, Title } from "@/components/ui";
import type { Workspace } from "@/lib/api-common";

type WorkspaceSelectProps = {
  workspaces: Workspace[];
};

export function WorkspaceSelect({ workspaces }: WorkspaceSelectProps) {
  const router = useRouter();

  const options = workspaces.map((workspace) => ({
    label: workspace.role && workspace.role !== "member" ? `${workspace.name} (${workspace.role})` : workspace.name,
    value: workspace.id,
  }));

  return (
    <div className="w-full max-w-sm">
      <Title level={2} className="text-center" style={{ marginBottom: 24 }}>
        Choose a workspace
      </Title>
      <Select
        placeholder="Select a workspace"
        options={options}
        size="large"
        className="w-full"
        onSelect={(id) => router.push(`/workspace/${id}`)}
      />
    </div>
  );
}
