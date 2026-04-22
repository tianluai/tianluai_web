"use client";

import { Spin } from "antd";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/use-auth";
import { isAuthShellSkippedPath } from "@/lib/auth/public-paths";

/**
 * On protected routes, `isSignedIn` is meaningless until the session has finished loading (`isLoaded`).
 * This boundary shows one global loading shell instead of repeating that in every page.
 *
 * Public routes (aligned with middleware) render children immediately so sign-in/up stay usable.
 */
export function AuthSessionBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoaded } = useAuth();

  if (isAuthShellSkippedPath(pathname)) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
