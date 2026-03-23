"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { API_BASE, type Workspace } from "./api-common";

export function useWorkspaces() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const locale = useLocale();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const token = await getToken();
      if (!token || !API_BASE) {
        console.error("[useWorkspaces] API_BASE is not set");
        setWorkspaces([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/workspaces`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) {
          void signOut({ redirectUrl: `/${locale}/sign-in` });
          return;
        }
        if (!cancelled && res.ok) setWorkspaces(await res.json());
      } catch (error) {
        console.error("[useWorkspaces]", error);
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [getToken, signOut, locale]);

  return { workspaces, loading };
}
