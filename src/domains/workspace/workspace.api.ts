import { apiFetch, type ApiResult } from "@/lib/api/client";
import type { Workspace } from "@/lib/api-common";

export function syncUser(token: string): Promise<ApiResult<void>> {
  return apiFetch<void>(token, "/users/me");
}

export function fetchWorkspaces(token: string): Promise<ApiResult<Workspace[]>> {
  return apiFetch<Workspace[]>(token, "/workspaces");
}

export function getWorkspace(
  token: string,
  id: string
): Promise<ApiResult<Workspace>> {
  return apiFetch<Workspace>(token, `/workspaces/${id}`);
}

export function createWorkspace(
  token: string,
  name: string
): Promise<ApiResult<Workspace>> {
  return apiFetch<Workspace>(token, "/workspaces", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
