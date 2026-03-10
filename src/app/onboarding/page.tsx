import { redirect } from "next/navigation";
import { fetchWorkspaces, syncUserToApi } from "@/lib/api";
import { OnboardingClient } from "./onboarding-client";
import { OnboardingHeader } from "./onboarding-header";
import { PageLayout } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let apiError: string | null = null;
  try {
    await syncUserToApi();
  } catch (error) {
    apiError = error instanceof Error ? error.message : "Could not connect to API";
    console.error("[Onboarding] Failed to sync user to API:", error);
  }

  const workspaces = await fetchWorkspaces();
  if (workspaces.length === 1) redirect(`/workspace/${workspaces[0].id}`);
  if (workspaces.length > 1) redirect("/workspaces");

  return (
    <PageLayout header={<OnboardingHeader />}>
      <OnboardingClient apiError={apiError} />
    </PageLayout>
  );
}
