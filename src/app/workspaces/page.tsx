import { redirect } from "next/navigation";
import { PageLayout } from "@/components/ui";
import { fetchWorkspaces } from "@/lib/api";
import { WorkspaceSelect } from "./workspace-select";

export const dynamic = "force-dynamic";

export default async function WorkspacesPickerPage() {
  const workspaces = await fetchWorkspaces();
  if (workspaces.length === 0) redirect("/onboarding");
  if (workspaces.length === 1) redirect(`/workspace/${workspaces[0].id}`);

  return (
    <PageLayout>
      <WorkspaceSelect workspaces={workspaces} />
    </PageLayout>
  );
}
