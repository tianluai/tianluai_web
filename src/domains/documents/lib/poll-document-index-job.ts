import type { DocumentIndexJobStatus } from "../services/drive-api";

/** ~4 minutes of 2s gaps between checks (plus request time). */
export const DOCUMENT_INDEX_JOB_POLL_MAX_ATTEMPTS = 120;

export const DOCUMENT_INDEX_JOB_POLL_INTERVAL_MS = 2_000;

export type FetchDocumentIndexJobStatus = (
  token: string | null,
  workspaceId: string,
  jobId: string,
) => Promise<
  { ok: true; status: DocumentIndexJobStatus } | { ok: false; error?: string }
>;

export type DocumentIndexJobPollOutcome =
  | { kind: "completed"; indexedChunks: number; indexedFiles: number }
  | { kind: "failed"; failedReason: string }
  | {
      kind: "status_request_failed";
      errorMessage: string;
      unauthorized: boolean;
    }
  | { kind: "max_wait_reached" };

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

/**
 * Polls the document-index job until it completes, fails, a status request errors,
 * or {@link maxAttempts} is exhausted.
 */
export async function pollDocumentIndexJobUntilTerminal(args: {
  workspaceId: string;
  jobId: string;
  getToken: () => Promise<string | null>;
  fetchStatus: FetchDocumentIndexJobStatus;
  maxAttempts?: number;
  intervalMs?: number;
  onInProgress?: () => void;
}): Promise<DocumentIndexJobPollOutcome> {
  const maxAttempts = args.maxAttempts ?? DOCUMENT_INDEX_JOB_POLL_MAX_ATTEMPTS;
  const intervalMs = args.intervalMs ?? DOCUMENT_INDEX_JOB_POLL_INTERVAL_MS;

  for (let pollAttempt = 0; pollAttempt < maxAttempts; pollAttempt += 1) {
    const token = await args.getToken();
    const statusResult = await args.fetchStatus(token, args.workspaceId, args.jobId);

    if (!statusResult.ok) {
      const errorMessage = statusResult.error ?? "";
      return {
        kind: "status_request_failed",
        errorMessage,
        unauthorized: errorMessage === "Unauthorized",
      };
    }

    const { state, returnValue, failedReason } = statusResult.status;
    if (state === "completed") {
      return {
        kind: "completed",
        indexedChunks: Number(returnValue?.indexed ?? 0),
        indexedFiles: Number(returnValue?.files ?? 0),
      };
    }

    if (state === "failed") {
      return {
        kind: "failed",
        failedReason: failedReason ?? "",
      };
    }

    args.onInProgress?.();
    await sleep(intervalMs);
  }

  return { kind: "max_wait_reached" };
}
