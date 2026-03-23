"use server";

import { auth } from "@clerk/nextjs/server";
import {
  fetchWorkspaces,
  getWorkspace,
  syncUserToApi,
  UnauthorizedError,
} from "@/lib/api";
import type { Workspace } from "@/lib/api-common";
import { getMessageForLocale } from "@/i18n/load-messages";
import { createWorkspace } from "./services/workspace.service";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function getOnboardingDataAction(): Promise<{
  apiError: string | null;
  workspaces: Workspace[];
  unauthorized?: boolean;
}> {
  let apiError: string | null = null;
  try {
    await syncUserToApi();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { apiError: null, workspaces: [], unauthorized: true };
    }
    apiError =
      error instanceof Error ? error.message : "common.errorConnectApi";
    console.error("[Onboarding] Failed to sync user to API:", error);
  }

  let workspaces: Workspace[] = [];
  try {
    workspaces = await fetchWorkspaces();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { apiError: null, workspaces: [], unauthorized: true };
    }
    if (!apiError) {
      apiError =
        error instanceof Error ? error.message : "common.errorFetchWorkspaces";
    }
    console.error("[Onboarding] Failed to fetch workspaces:", error);
  }

  return { apiError, workspaces };
}

export async function getWorkspacesAction(): Promise<{
  workspaces: Workspace[];
  unauthorized?: boolean;
}> {
  try {
    const workspaces = await fetchWorkspaces();
    return { workspaces };
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { workspaces: [], unauthorized: true };
    }
    throw error;
  }
}

export async function getWorkspaceAction(
  id: string
): Promise<{ id: string; name: string } | null> {
  return getWorkspace(id);
}

export async function createWorkspaceAction(
  name: string,
  locale: string
): Promise<{ redirect: string } | { error: string } | { unauthorized: true }> {
  const t = (key: string) => getMessageForLocale(locale, key);
  if (!API_BASE) return { error: t("auth.apiNotConfigured") };

  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return { error: t("auth.notSignedIn") };

  try {
    const { id } = await createWorkspace(API_BASE, token, name);
    return { redirect: `/${locale}/workspace/${id}` };
  } catch (err) {
    if (err instanceof UnauthorizedError) return { unauthorized: true };
    console.error("[createWorkspaceAction]", err);
    const raw = err instanceof Error ? err.message : t("common.errorGeneric");
    return { error: getMessageForLocale(locale, raw) ?? raw };
  }
}
