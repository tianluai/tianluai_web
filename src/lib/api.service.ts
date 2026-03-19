/**
 * Global API error handling. Use this to turn API responses into user-facing messages.
 * Endpoints can override the default message when needed.
 */
export function getApiErrorMessage(
  data: unknown,
  override?: string
): string {
  const body = data as Record<string, unknown> | null;
  if (body && typeof body.message === "string") {
    return body.message;
  }
  return override ?? "common.errorGeneric";
}
