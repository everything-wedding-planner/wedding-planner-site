import { useCallback, useMemo } from "react";

interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  try {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !(init.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(url, { ...init, headers, credentials: "include" });
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) message = body.error;
      } catch {
        // response body wasn't JSON — keep the default message
      }
      return { data: null, error: message };
    }
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch {
    return { data: null, error: "Network error" };
  }
}

/** Typed fetch wrapper — always sends credentials, returns { data, error } so callers never throw. */
export function useApi() {
  const get = useCallback(<T,>(url: string) => request<T>(url), []);
  const post = useCallback(
    <T,>(url: string, body: unknown) =>
      request<T>(url, { method: "POST", body: JSON.stringify(body) }),
    [],
  );
  const put = useCallback(
    <T,>(url: string, body: unknown) =>
      request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
    [],
  );
  // The returned object is memoized so consumers can safely use it in
  // dependency arrays without recreating their effects on every render.
  return useMemo(() => ({ get, post, put }), [get, post, put]);
}
