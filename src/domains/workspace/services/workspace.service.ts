import { getApiErrorMessage } from "@/lib/api.service";

export type CreateWorkspaceResult = { id: string };

export async function createWorkspace(
  baseUrl: string,
  token: string,
  name: string
): Promise<CreateWorkspaceResult> {
  const res = await fetch(`${baseUrl}/workspaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("[workspace.service] createWorkspace error:", data);
    const message = getApiErrorMessage(data);
    throw new Error(message);
  }

  return { id: data.id };
}
