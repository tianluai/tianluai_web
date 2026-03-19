"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { PageLayout } from "@/components/ui";
import { getOnboardingDataAction } from "../actions";
import { OnboardingClient } from "../components/OnboardingClient";

export function OnboardingScreen() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const createMode = searchParams.get("create") === "true";
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOnboardingDataAction().then(({ apiError: err, workspaces }) => {
      setApiError(err);
      setLoading(false);
      if (createMode) return;
      if (workspaces.length === 1) router.replace(`/${locale}/workspace/${workspaces[0].id}`);
      if (workspaces.length > 1) router.replace(`/${locale}/workspaces`);
    });
  }, [router, createMode, locale]);

  if (loading) return null;

  return (
    <PageLayout>
      <OnboardingClient apiError={apiError} />
    </PageLayout>
  );
}
