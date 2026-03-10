import { auth } from "@clerk/nextjs/server";
import { API_BASE, type Workspace } from "./api-common";

export { API_BASE, type Workspace };

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { getToken } = await auth();
  const token =
    (await getToken({ template: "backend" }).catch(() => null)) ??
    (await getToken());
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const headers = await getAuthHeaders();
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

export async function syncUserToApi(): Promise<void> {
  const headers = await getAuthHeaders();
  if (!headers["Authorization"] || !API_BASE) return;

  const res = await fetch(`${API_BASE}/users/me`, { headers });
  if (res.ok) return;

  const data = await res.json().catch(() => ({}));
  const msg =
    getErrorMessage(data, res.status === 401 ? "Invalid or expired session" : "API error");
  throw new Error(msg);
}

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await apiFetch("/workspaces");
  if (res.status === 401) return [];
  if (!res.ok) throw new Error("Failed to fetch workspaces");
  return res.json();
}

export async function getWorkspace(
  id: string
): Promise<{ id: string; name: string } | null> {
  const res = await apiFetch(`/workspaces/${id}`);
  if (!res.ok) return null;
  return res.json();
}
