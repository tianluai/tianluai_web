import { getApiUrl } from "@/lib/config";

/** JSON request bodies + Bearer token (empty `Authorization` when token is null). */
export function bearerJsonHeaders(token: string | null): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export type SafeApiFetchError = "no_api_url" | "network";

export type SafeApiFetchResult =
  | { ok: true; response: Response }
  | { ok: false; error: SafeApiFetchError };

/**
 * GET/POST/PATCH… against `NEXT_PUBLIC_API_URL` + path.
 *
 * **`credentials`**: defaults to **`"same-origin"`** (the `fetch` default): cookies go out on
 * same-site requests. Use **`credentials: "include"`** only when the API must receive
 * cookies on a **cross-origin** call (needs CORS `Access-Control-Allow-Credentials`).
 * Bearer auth in `Authorization` does not require `include`.
 *
 * Does not throw: missing base URL and network failures are returned as `{ ok: false }`.
 */
export async function safeApiFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<SafeApiFetchResult> {
  const base = getApiUrl();
  if (!base) return { ok: false, error: "no_api_url" };

  const pathOnly = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${pathOnly}`;
  const { token, headers: initHeaders, credentials, ...rest } = init;

  const headers = new Headers(bearerJsonHeaders(token ?? null));
  if (initHeaders) {
    new Headers(initHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers,
      credentials: credentials ?? "same-origin",
    });
    return { ok: true, response };
  } catch {
    return { ok: false, error: "network" };
  }
}

/**
 * `response.json()` without throwing — returns `null` if the body is not JSON.
 */
export async function safeResponseJson<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}
