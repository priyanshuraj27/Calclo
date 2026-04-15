/**
 * Build `durationOptions` for API from primary length + comma-separated extras.
 * Returns [] when only the base length applies.
 */
/** Sorted unique allowed lengths (matches backend merge rules). */
export function mergeAllowedDurations(baseMin, rawOpts) {
  const b = Math.max(1, Math.min(720, Number(baseMin) || 15));
  const raw = Array.isArray(rawOpts)
    ? rawOpts
        .map((n) => Number(n))
        .filter((n) => Number.isFinite(n) && n >= 1 && n <= 720)
    : [];
  return [...new Set([b, ...raw])].sort((a, x) => a - x);
}

export function buildDurationOptionsPayload(baseMin, commaText) {
  const b = Math.max(1, Math.min(720, Number(baseMin) || 15));
  const parts = String(commaText || "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const extras = parts
    .map((p) => Math.round(parseInt(p, 10)))
    .filter(
      (n) => Number.isFinite(n) && n >= 1 && n <= 720 && n !== b
    );
  const merged = [...new Set([b, ...extras])].sort((a, x) => a - x);
  return merged.length <= 1 ? [] : merged;
}
