const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const MAX_GUESTS = 10;

/**
 * @param {unknown} raw — string (comma/newline/semicolon) or string[]
 * @param {{ excludeEmails?: string[] }} [opts]
 * @returns {string[]} unique lowercase emails, max MAX_GUESTS
 */
export function sanitizeGuestEmails(raw, opts = {}) {
  const exclude = new Set(
    (opts.excludeEmails || [])
      .map((e) => String(e || "").trim().toLowerCase())
      .filter(Boolean)
  );
  const items = [];
  if (Array.isArray(raw)) {
    for (const x of raw) items.push(String(x || ""));
  } else if (raw != null && String(raw).trim()) {
    items.push(...String(raw).split(/[\s,;]+/));
  }
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const e = item.trim().toLowerCase();
    if (!e || !SIMPLE_EMAIL.test(e)) continue;
    if (exclude.has(e) || seen.has(e)) continue;
    seen.add(e);
    out.push(e);
    if (out.length >= MAX_GUESTS) break;
  }
  return out;
}
