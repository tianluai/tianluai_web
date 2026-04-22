"use server";

// Clerk (paused): import { auth } from "@clerk/nextjs/server";
import { auth } from "../../../auth";

export async function getSessionAction() {
  const session = await auth();
  return { userId: session?.user?.id ?? null };
}
