const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

/**
 * @param {string} path - e.g. /api/v1/users/current-user
 * @param {RequestInit & { json?: unknown }} options
 */
export async function apiRequest(path, options = {}) {
  const { json, ...init } = options;
  const headers = { ...(init.headers || {}) };
  let body = init.body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers,
    body,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      payload?.message || payload?.error || res.statusText || "Request failed";
    throw new Error(msg);
  }
  return payload;
}

/** Returns `data` from backend ApiResponse wrapper. */
export async function apiData(path, options = {}) {
  const payload = await apiRequest(path, options);
  return payload.data;
}
