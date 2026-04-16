/**
 * @param {Record<string, unknown>} eventType
 * @returns {number[]} sorted unique allowed lengths in minutes (always includes durationMinutes)
 */
export function resolveAllowedDurationMinutes(eventType) {
  const base = Math.max(1, Math.min(720, Number(eventType?.durationMinutes) || 15));
  const raw = eventType?.durationOptions;
  const extras = [];
  if (Array.isArray(raw) && raw.length) {
    for (const x of raw) {
      const n = Math.round(Number(x));
      if (Number.isFinite(n) && n >= 1 && n <= 720) extras.push(n);
    }
  }
  return [...new Set([base, ...extras])].sort((a, b) => a - b);
}

/**
 * @param {Record<string, unknown>} eventType
 * @param {unknown} requested — query/body value (minutes)
 * @returns {number} validated duration for slots or booking end
 */
/** Persisted list from API (may omit base; merge at read time). */
export function sanitizeDurationOptionsArray(raw) {
  if (!Array.isArray(raw)) return [];
  return [
    ...new Set(
      raw
        .map((x) => Math.round(Number(x)))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 720)
    ),
  ].slice(0, 24);
}

/**
 * On **create** only: if the client sends no extra lengths (empty or omitted),
 * persist a small preset so bookers see a length picker. Hosts can clear extras
 * in the editor later to keep a single length.
 */
export function resolveDurationOptionsForCreate(durationMinutes, raw) {
  const sanitized = sanitizeDurationOptionsArray(raw ?? []);
  if (sanitized.length > 0) return sanitized;
  const base = Math.max(1, Math.min(720, Number(durationMinutes) || 15));
  const presets = {
    15: [15, 30, 45],
    30: [30, 45, 60],
    45: [45, 60, 90],
    60: [60, 90, 120],
  };
  const preset = presets[base];
  return preset ? [...preset] : [base];
}

export function resolveDurationMinutesForRequest(eventType, requested) {
  const allowed = resolveAllowedDurationMinutes(eventType);
  const base = Math.max(1, Math.min(720, Number(eventType?.durationMinutes) || allowed[0]));
  if (requested == null || requested === "") {
    return allowed.includes(base) ? base : allowed[0];
  }
  const n = Math.round(Number(requested));
  if (!Number.isFinite(n)) return base;
  if (allowed.includes(n)) return n;
  return allowed.includes(base) ? base : allowed[0];
}
