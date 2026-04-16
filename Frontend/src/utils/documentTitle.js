/** Base product name (browser tab + `formatPageTitle`). */
export const APP_BRAND = "Calclo";

/**
 * @param {string | null | undefined} pageTitle Primary segment; empty → brand only.
 * @returns {string} e.g. "Bookings · Calclo"
 */
export function formatPageTitle(pageTitle) {
  const brand = APP_BRAND;
  const s = pageTitle == null ? "" : String(pageTitle).trim();
  if (!s || s === brand) return brand;
  return `${s} · ${brand}`;
}

function decodeParam(params, key) {
  const v = params.get(key);
  if (!v) return "";
  try {
    return decodeURIComponent(v.replace(/\+/g, " "));
  } catch {
    return v;
  }
}

function humanizeSegment(seg) {
  if (!seg) return "";
  return seg
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * @param {string} pathname location.pathname
 * @param {string} search location.search or stored nav search (may be "")
 */
export function titleForAppPath(pathname, search) {
  const q = search && search.startsWith("?") ? search : search ? `?${search}` : "";
  const params = new URLSearchParams(q);

  if (pathname === "/event-types") return formatPageTitle("Event types");
  if (pathname.startsWith("/event-types/")) {
    const t = decodeParam(params, "title");
    return formatPageTitle(t || "Event type");
  }
  if (pathname === "/bookings") return formatPageTitle("Bookings");
  if (pathname === "/availability") return formatPageTitle("Availability");
  if (pathname.startsWith("/availability/")) {
    const name = decodeParam(params, "name");
    if (name) return formatPageTitle(name);
    const id = pathname.split("/").filter(Boolean)[1];
    return formatPageTitle(id === "new" ? "New schedule" : "Schedule");
  }
  if (pathname === "/teams") return formatPageTitle("Teams");
  if (pathname === "/apps") return formatPageTitle("App store");
  if (pathname === "/apps/installed") return formatPageTitle("Installed apps");
  if (pathname === "/routing") return formatPageTitle("Routing forms");
  if (pathname === "/workflows") return formatPageTitle("Workflows");
  if (pathname.startsWith("/insights")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return formatPageTitle("Insights");
    return formatPageTitle(humanizeSegment(parts[parts.length - 1]));
  }
  if (pathname === "/refer") return formatPageTitle("Refer and earn");
  if (pathname.startsWith("/settings")) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length <= 1) return formatPageTitle("Settings");
    return formatPageTitle(humanizeSegment(parts[parts.length - 1]));
  }
  return formatPageTitle("Scheduling");
}
