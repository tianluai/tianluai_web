import { auth } from "@clerk/nextjs/server";
import { getApiErrorMessage } from "./api.service";
import { API_BASE, type Workspace } from "./api-common";

export { API_BASE, type Workspace };

export class UnauthorizedError extends Error {
  constructor() {
    super("auth.sessionExpired");
    this.name = "UnauthorizedError";
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getToken } = await auth();
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!API_BASE) throw new Error("auth.apiNotConfigured");
  let res: Response;
  try {
    const headers = await getAuthHeaders();
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    console.error("[apiFetch]", path, err);
    throw new Error("common.errorConnectApi");
  }
  if (res.status === 401) {
    throw new UnauthorizedError();
  }
  return res;
}

export async function syncUserToApi(): Promise<void> {
  const res = await apiFetch("/users/me");
  if (res.ok) return;
  const data = await res.json().catch(() => ({}));
  throw new Error(getApiErrorMessage(data, "common.errorApiGeneric"));
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await apiFetch("/workspaces");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(getApiErrorMessage(data, "common.errorFetchWorkspaces"));
  }
  return res.json() as Promise<Workspace[]>;
}

export async function getWorkspace(
  id: string
): Promise<{ id: string; name: string } | null> {
  const res = await apiFetch(`/workspaces/${id}`);
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; name: string }>;
}
