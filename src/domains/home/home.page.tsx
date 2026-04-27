"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";
import { ScreenLayout } from "@/components/ui";
import { useAuth } from "@/lib/auth/use-auth";
import { useSyncUser, useWorkspaces } from "@/domains/workspace/workspace.queries";

/**
 * `/` — signed-out users go to sign-in. Signed-in users with workspaces go straight to chat
 * (or `/workspaces` if many); only users with **no** workspaces are sent to `/onboarding`.
 */
export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  const sync = useSyncUser({ enabled: Boolean(isLoaded && isSignedIn) });
  const workspaces = useWorkspaces({
    enabled: Boolean(isLoaded && isSignedIn && sync.isSuccess),
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (sync.isLoading || workspaces.isLoading) return;
    if (sync.isError || workspaces.isError) {
      router.replace("/onboarding");
      return;
    }
    if (!workspaces.data) return;
    const list = workspaces.data;
    if (list.length === 0) {
      router.replace("/onboarding");
      return;
    }
    if (list.length === 1) {
      router.replace(`/workspace/${list[0].id}/chat`);
      return;
    }
    router.replace("/workspaces");
  }, [
    isLoaded,
    isSignedIn,
    router,
    sync.isError,
    sync.isLoading,
    sync.isSuccess,
    workspaces.data,
    workspaces.isError,
    workspaces.isLoading,
  ]);

  if (!isLoaded) return null;
  if (!isSignedIn) return null;

  const bootstrapping =
    sync.isLoading || (sync.isSuccess && workspaces.isPending) || workspaces.isLoading;
  if (bootstrapping) {
    return (
      <ScreenLayout centered>
        <Spin size="large" />
      </ScreenLayout>
    );
  }

  return null;
}
