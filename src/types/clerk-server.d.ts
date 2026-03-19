/**
 * Type declaration for @clerk/nextjs/server when the IDE cannot resolve the package
 * (e.g. when the workspace root is the parent folder). The package is installed
 * and resolves at build time.
 */
declare module "@clerk/nextjs/server" {
  export function auth(): Promise<{
    getToken: (options?: { template?: string }) => Promise<string | null>;
  }>;
  export function clerkMiddleware(
    handler: (
      auth: { protect: () => Promise<unknown> },
      req: Request
    ) => Response | Promise<Response>
  ): (req: Request) => Promise<Response>;
  export function createRouteMatcher(
    routes: string[]
  ): (req: Request) => boolean;
}
