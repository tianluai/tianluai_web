"use server";

import { auth } from "@clerk/nextjs/server";

export async function getSessionAction() {
  const { userId } = await auth();
  return { userId };
}
