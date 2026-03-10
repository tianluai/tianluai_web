import { notFound } from "next/navigation";
import { Text, Title } from "@/components/ui";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { getWorkspace } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const workspace = await getWorkspace(workspaceId);
  if (!workspace) notFound();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6">
        <WorkspaceSwitcher currentWorkspaceId={workspaceId} />
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-12 text-center shadow-sm">
          <Title level={2} className="mb-2! mt-0! text-lg font-semibold text-zinc-900">
            {workspace.name}
          </Title>
          <Text type="secondary" className="mt-2 block text-sm">
            Your workspace. Content goes here.
          </Text>
        </div>
      </main>
    </div>
  );
}
