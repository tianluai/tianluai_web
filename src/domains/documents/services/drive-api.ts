import { getApiUrl } from "@/lib/config";

function authHeaders(token: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export type DriveConnectionStatus = {
  connected: boolean;
  driveConfigured: boolean;
  selectedFolderIds: string[];
};

/**
 * GET /drive/status — whether Drive is connected for this user + workspace.
 */
export async function fetchDriveStatus(
  token: string | null,
  userId: string,
  workspaceId: string,
): Promise<{ ok: true; data: DriveConnectionStatus } | { ok: false }> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return { ok: false };

  const url = `${apiUrl}/drive/status?userId=${encodeURIComponent(userId)}&workspaceId=${encodeURIComponent(workspaceId)}`;
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
    credentials: "include",
  });
  if (!res.ok) return { ok: false };

  const data: unknown = await res.json();
  const o = data as Record<string, unknown>;
  return {
    ok: true,
    data: {
      connected: !!o.connected,
      driveConfigured: !!o.driveConfigured,
      selectedFolderIds: Array.isArray(o.selectedFolderIds) ? (o.selectedFolderIds as string[]) : [],
    },
  };
}

export type DriveAuthResponse = {
  authUrl?: string;
  error?: string;
};

/**
 * POST /drive/auth — returns Google OAuth URL or error.
 */
export async function fetchDriveAuthUrl(
  token: string | null,
  body: { returnUrl: string; userId: string; workspaceId: string },
): Promise<DriveAuthResponse> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return { error: "API not configured" };

  const res = await fetch(`${apiUrl}/drive/auth`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
    credentials: "include",
  });
  return (await res.json().catch(() => ({}))) as DriveAuthResponse;
}

export type DriveFolder = { id: string; name: string };

/**
 * GET /drive/folders — list folders under parent (default root).
 */
export async function fetchDriveFolders(
  token: string | null,
  userId: string,
  workspaceId: string,
  parentId: string = "root",
): Promise<
  | { ok: true; folders: DriveFolder[]; driveError: string | null }
  | { ok: false; apiError?: string }
> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return { ok: false, apiError: "API not configured" };

  const url = `${apiUrl}/drive/folders?userId=${encodeURIComponent(userId)}&workspaceId=${encodeURIComponent(workspaceId)}&parentId=${encodeURIComponent(parentId)}`;
  const res = await fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as {
    folders?: DriveFolder[];
    error?: string;
  };

  if (res.ok && Array.isArray(data.folders)) {
    return {
      ok: true,
      folders: data.folders,
      driveError: data.error ?? null,
    };
  }
  return {
    ok: false,
    apiError: typeof data.error === "string" ? data.error : undefined,
  };
}

/**
 * POST /drive/folders — persist selected folder ids.
 */
export async function saveDriveFolderSelection(
  token: string | null,
  body: { userId: string; workspaceId: string; folderIds: string[] },
): Promise<{ ok: boolean; error?: string }> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return { ok: false, error: "API not configured" };

  const res = await fetch(`${apiUrl}/drive/folders`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
    credentials: "include",
  });
  return (await res.json().catch(() => ({}))) as { ok: boolean; error?: string };
}
