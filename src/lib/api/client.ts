const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string; status: number };
export type ApiResult<T> = ApiOk<T> | ApiErr;

export async function apiFetch<T>(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  if (!API_BASE) return { ok: false, error: "auth.apiNotConfigured", status: 0 };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
  } catch {
    return { ok: false, error: "common.errorConnectApi", status: 0 };
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.message === "string" ? body.message : "common.errorGeneric";
    return { ok: false, error: message, status: res.status };
  }

  const data = (await res.json().catch(() => null)) as T;
  return { ok: true, data };
}

export function isUnauthorized(result: ApiResult<unknown>): boolean {
  return !result.ok && result.status === 401;
}
