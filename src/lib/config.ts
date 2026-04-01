/**
 * Public API base URL (no trailing slash). Set `NEXT_PUBLIC_API_URL` in env.
 */
export function getApiUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) return "";
  return base.replace(/\/$/, "");
}
