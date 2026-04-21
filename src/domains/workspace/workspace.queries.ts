"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/use-auth";
import { isUnauthorized, type ApiResult } from "@/lib/api/client";
import type { Workspace } from "@/lib/api-common";
import {
  syncUser,
  fetchWorkspaces,
  getWorkspace,
  createWorkspace,
  deleteWorkspace,
} from "./workspace.api";

function unwrap<T>(result: ApiResult<T>, signOut: () => void): T {
  if (isUnauthorized(result)) {
    signOut();
    throw new Error("unauthorized");
  }
  if (!result.ok) throw new Error(result.error);
  return result.data;
}

export function useSyncUser() {
  const { getToken, signOut } = useAuth();
  return useQuery({
    queryKey: ["user", "sync"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        signOut();
        throw new Error("unauthorized");
      }
      const result = await syncUser(token);
      unwrap(result, signOut);
      return true;
    },
    retry: false,
  });
}

export function useWorkspaces(options?: { enabled?: boolean }) {
  const { getToken, signOut } = useAuth();
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        signOut();
        throw new Error("unauthorized");
      }
      return unwrap(await fetchWorkspaces(token), signOut);
    },
    enabled: options?.enabled,
    retry: false,
  });
}

export function useWorkspace(id: string) {
  const { getToken, signOut } = useAuth();
  return useQuery({
    queryKey: ["workspaces", id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        signOut();
        throw new Error("unauthorized");
      }
      return unwrap(await getWorkspace(token, id), signOut);
    },
    enabled: !!id,
    retry: false,
  });
}

export function useCreateWorkspace() {
  const { getToken, signOut } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const token = await getToken();
      if (!token) {
        signOut();
        throw new Error("unauthorized");
      }
      return unwrap(await createWorkspace(token, name), signOut);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useDeleteWorkspace() {
  const { getToken, signOut } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const token = await getToken();
      if (!token) {
        signOut();
        throw new Error("unauthorized");
      }
      return unwrap(await deleteWorkspace(token, workspaceId), signOut);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
