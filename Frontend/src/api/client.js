const getBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

const GET_CACHE_TTL_MS = 15000;
const responseCache = new Map();
const inflightGetRequests = new Map();

/**
 * @param {string} path - e.g. /api/v1/users/current-user
 * @param {RequestInit & { json?: unknown }} options
 */
export async function apiRequest(path, options = {}) {
  const { json, noCache = false, ...init } = options;
  const headers = { ...(init.headers || {}) };
  const method = (init.method || "GET").toUpperCase();
  const url = `${getBaseUrl()}${path}`;
  let body = init.body;
  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }
  const requestPayload = json !== undefined ? json : body;

  console.groupCollapsed(`[API] ${method} ${url}`);
  console.log("Request payload:", requestPayload ?? null);

  const cacheKey = `${method}:${url}`;
  const now = Date.now();

  if (method === "GET" && !noCache) {
    const cached = responseCache.get(cacheKey);
    if (cached && now - cached.at < GET_CACHE_TTL_MS) {
      console.log("Response source:", "memory-cache");
      console.log("Response payload:", cached.payload);
      console.groupEnd();
      return cached.payload;
    }
    const inflight = inflightGetRequests.get(cacheKey);
    if (inflight) {
      console.log("Response source:", "inflight-dedupe");
      console.groupEnd();
      return inflight;
    }
  }

  const requestPromise = (async () => {
    const res = await fetch(url, { ...init, headers, body });

    let payload = {};
    try {
      payload = await res.json();
    } catch {
      payload = {};
    }

    console.log("Response status:", res.status);
    console.log("Response payload:", payload);
    console.groupEnd();

    if (!res.ok) {
      const msg =
        payload?.message || payload?.error || res.statusText || "Request failed";
      throw new Error(msg);
    }

    if (method === "GET" && !noCache) {
      responseCache.set(cacheKey, { payload, at: Date.now() });
    } else if (method !== "GET") {
      // Mutations may affect many resources; simple strategy: drop GET cache.
      responseCache.clear();
    }
    return payload;
  })();

  if (method === "GET" && !noCache) {
    inflightGetRequests.set(cacheKey, requestPromise);
  }
  try {
    return await requestPromise;
  } finally {
    if (method === "GET" && !noCache) {
      inflightGetRequests.delete(cacheKey);
    }
  }
}

/** Returns `data` from backend ApiResponse wrapper. */
export async function apiData(path, options = {}) {
  const payload = await apiRequest(path, options);
  return payload.data;
}
