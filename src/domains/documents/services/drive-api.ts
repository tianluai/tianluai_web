import { safeApiFetch, safeResponseJson } from "@/lib/api/http";

export type DriveConnectionStatus = {
  connected: boolean;
  driveConfigured: boolean;
  selectedFolderIds: string[];
};

export type DriveAuthResponse = {
  authUrl?: string;
  error?: string;
};

export type DriveFolder = { id: string; name: string };

export type DocumentIndexJobState =
  | "waiting"
  | "active"
  | "completed"
  | "failed"
  | "delayed"
  | "paused"
  | "unknown";

export type DocumentIndexJobStatus = {
  id: string;
  state: DocumentIndexJobState;
  progress: number;
  returnValue?: { indexed?: number; files?: number };
  failedReason?: string | null;
};

/**
 * Google Drive REST calls for the documents domain.
 * HTTP concerns (headers, fetch, network errors) live in `@/lib/api/http`.
 */
export const driveService = {
  /**
   * GET /drive/status — whether Drive is connected for this user + workspace.
   * User identity comes from the Bearer token (Clerk); only `workspaceId` is passed.
   */
  async getStatus(
    token: string | null,
    workspaceId: string,
  ): Promise<{ ok: true; data: DriveConnectionStatus } | { ok: false }> {
    const query = new URLSearchParams({ workspaceId }).toString();
    const fetched = await safeApiFetch(`/drive/status?${query}`, { token });
    if (!fetched.ok) return { ok: false };

    const { response } = fetched;
    if (!response.ok) return { ok: false };

    const raw = await safeResponseJson<Record<string, unknown>>(response);
    if (raw == null) return { ok: false };

    return {
      ok: true,
      data: {
        connected: !!raw.connected,
        driveConfigured: !!raw.driveConfigured,
        selectedFolderIds: Array.isArray(raw.selectedFolderIds) ? (raw.selectedFolderIds as string[]) : [],
      },
    };
  },

  /**
   * POST /drive/auth — returns Google OAuth URL or error.
   */
  async getAuthUrl(
    token: string | null,
    body: { returnUrl: string; workspaceId: string },
  ): Promise<DriveAuthResponse> {
    const fetched = await safeApiFetch("/drive/auth", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
    if (!fetched.ok) {
      return {
        error: fetched.error === "no_api_url" ? "API not configured" : undefined,
      };
    }
    return (await safeResponseJson<DriveAuthResponse>(fetched.response)) ?? {};
  },

  /**
   * GET /drive/folders — list folders under parent (default root).
   * Never throws: failures become `{ ok: false }`.
   */
  async getFolders(
    token: string | null,
    workspaceId: string,
    parentId: string = "root",
  ): Promise<
    | { ok: true; folders: DriveFolder[]; driveError: string | null }
    | { ok: false; apiError?: string }
  > {
    const query = new URLSearchParams({ workspaceId, parentId }).toString();
    const fetched = await safeApiFetch(`/drive/folders?${query}`, { token });
    if (!fetched.ok) return { ok: false };

    const { response } = fetched;
    const data =
      (await safeResponseJson<{ folders?: DriveFolder[]; error?: string }>(response)) ?? {};

    if (response.ok && Array.isArray(data.folders)) {
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
  },

  /**
   * POST /drive/folders — persist selected folder ids.
   * Never throws: failures become `{ ok: false }`.
   */
  async saveFolderSelection(
    token: string | null,
    body: { workspaceId: string; folderIds: string[] },
  ): Promise<{ ok: boolean; error?: string }> {
    const fetched = await safeApiFetch("/drive/folders", {
      method: "POST",
      token,
      body: JSON.stringify(body),
    });
    if (!fetched.ok) return { ok: false };

    return (await safeResponseJson<{ ok: boolean; error?: string }>(fetched.response)) ?? {
      ok: false,
    };
  },

  /**
   * POST /queue/document-index — enqueue workspace document indexing.
   */
  async startSync(
    token: string | null,
    workspaceId: string,
  ): Promise<{ ok: true; jobId: string } | { ok: false; error?: string }> {
    const query = new URLSearchParams({ workspaceId }).toString();
    const fetched = await safeApiFetch(`/queue/document-index?${query}`, {
      method: "POST",
      token,
    });
    if (!fetched.ok) {
      return { ok: false, error: fetched.error === "network" ? "network" : undefined };
    }
    const data = await safeResponseJson<{ jobId?: string; error?: string }>(fetched.response);
    if (!fetched.response.ok || !data?.jobId) {
      return { ok: false, error: data?.error };
    }
    return { ok: true, jobId: data.jobId };
  },

  /**
   * GET /queue/document-index — fetch status for a queued indexing job.
   */
  async getSyncStatus(
    token: string | null,
    workspaceId: string,
    jobId: string,
  ): Promise<{ ok: true; status: DocumentIndexJobStatus } | { ok: false; error?: string }> {
    const query = new URLSearchParams({ workspaceId, jobId }).toString();
    const fetched = await safeApiFetch(`/queue/document-index?${query}`, { token });
    if (!fetched.ok) {
      return { ok: false, error: fetched.error === "network" ? "network" : undefined };
    }
    type QueueDocumentIndexPayload = {
      id?: string;
      state?: DocumentIndexJobState;
      progress?: number;
      returnValue?: { indexed?: number; files?: number };
      failedReason?: string | null;
      error?: string;
    };
    const payload = await safeResponseJson<QueueDocumentIndexPayload>(fetched.response);
    if (payload == null) {
      return { ok: false };
    }
    const { id, state, progress, returnValue, failedReason, error } = payload;
    if (!fetched.response.ok || !id || !state) {
      return { ok: false, error: error };
    }
    return {
      ok: true,
      status: {
        id,
        state,
        progress: Number(progress ?? 0),
        returnValue,
        failedReason: failedReason ?? null,
      },
    };
  },
};
