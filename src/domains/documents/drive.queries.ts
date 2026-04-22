"use client";

import { useAuth } from "@/lib/auth/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { driveService, type DriveConnectionStatus } from "./services/drive-api";

export const driveConnectionStatusQueryKey = (workspaceId: string) =>
  ["drive", "connection-status", workspaceId] as const;

/**
 * Drive connection state for a workspace (read-only; refetch after OAuth or folder save).
 */
export function useDriveConnectionStatus(workspaceId: string, queryEnabled: boolean) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: driveConnectionStatusQueryKey(workspaceId),
    queryFn: async (): Promise<DriveConnectionStatus> => {
      const token = await getToken({ skipCache: true });
      const result = await driveService.getStatus(token, workspaceId);
      if (!result.ok) {
        return {
          connected: false,
          driveSessionExpired: false,
          driveConfigured: false,
          selectedFolderIds: [],
          selectedFolders: [],
          indexedSources: null,
          lastGoogleDriveSyncAt: null,
          indexedVectorCount: null,
        };
      }
      return result.data;
    },
    enabled: queryEnabled && !!workspaceId,
    retry: false,
  });
}

export function useInvalidateDriveConnectionStatus() {
  const queryClient = useQueryClient();
  return (workspaceId: string) => {
    void queryClient.invalidateQueries({
      queryKey: driveConnectionStatusQueryKey(workspaceId),
    });
  };
}
