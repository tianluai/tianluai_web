"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getErrorMessage(data: unknown): string {
  if (
    !data ||
    typeof data !== "object" ||
    !("message" in data) ||
    typeof (data as { message: unknown }).message !== "string"
  ) {
    console.error("[createWorkspaceAction] API error response:", data);
    return "Something went wrong. Please try again.";
  }
  return (data as { message: string }).message;
}

function isNextRedirect(err: unknown): boolean {
  return (
    !!err &&
    typeof err === "object" &&
    "digest" in err &&
    typeof (err as { digest: string }).digest === "string"
  );
}

export async function createWorkspaceAction(name: string) {
  try {
    if (!API_BASE)
      return { error: "NEXT_PUBLIC_API_URL is not set. Check your environment." };
    const { getToken } = await auth();
    const token =
      (await getToken({ template: "backend" }).catch(() => null)) ??
      (await getToken());
    if (!token) return { error: "Not signed in. Please sign in and try again." };

    const res = await fetch(`${API_BASE}/workspaces`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: getErrorMessage(data) };

    redirect(`/workspace/${data.id}`);
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    console.error("[createWorkspaceAction]", err);
    const message =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return { error: message };
  }
}
