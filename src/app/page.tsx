import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/onboarding");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white font-sans">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Tianlu AI
      </h1>
      <p className="text-zinc-600">Sign in to access your workspace.</p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
