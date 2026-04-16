/** Buffer dropdown values (minutes). */
export const BUFFER_MINUTE_OPTIONS = [
  { label: "No buffer time", value: 0 },
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "25 minutes", value: 25 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "60 minutes", value: 60 },
  { label: "90 minutes", value: 90 },
  { label: "120 minutes", value: 120 },
];

/** Slot grid step options; first entry means “step = meeting length”. */
export const SLOT_INTERVAL_OPTIONS = [
  { label: "Use event length (default)", value: "event" },
  { label: "5 minutes", value: 5 },
  { label: "6 minutes", value: 6 },
  { label: "8 minutes", value: 8 },
  { label: "10 minutes", value: 10 },
  { label: "12 minutes", value: 12 },
  { label: "15 minutes", value: 15 },
  { label: "20 minutes", value: 20 },
  { label: "24 minutes", value: 24 },
  { label: "30 minutes", value: 30 },
  { label: "36 minutes", value: 36 },
  { label: "40 minutes", value: 40 },
  { label: "45 minutes", value: 45 },
  { label: "48 minutes", value: 48 },
  { label: "60 minutes", value: 60 },
  { label: "80 minutes", value: 80 },
  { label: "90 minutes", value: 90 },
  { label: "96 minutes", value: 96 },
  { label: "120 minutes", value: 120 },
];

export const MINIMUM_NOTICE_UNITS = [
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "days" },
];

export function minimumNoticeToValueAndUnit(totalMinutes) {
  const mn = Math.max(0, Math.floor(Number(totalMinutes) || 0));
  if (mn === 0) return { value: 0, unit: "hours" };
  if (mn % 1440 === 0) return { value: mn / 1440, unit: "days" };
  if (mn % 60 === 0) return { value: mn / 60, unit: "hours" };
  return { value: mn, unit: "minutes" };
}

export function valueAndUnitToMinimumNoticeMinutes(value, unit) {
  const v = Math.max(0, Math.floor(Number(value) || 0));
  if (unit === "days") return v * 1440;
  if (unit === "hours") return v * 60;
  return v;
}

export function inferSlotIntervalSelection(durationMinutes, slotIntervalMinutes) {
  const d = Math.max(1, Math.floor(Number(durationMinutes) || 15));
  const s = Math.max(1, Math.floor(Number(slotIntervalMinutes) || 15));
  if (s === d) return "event";
  return s;
}

/** Value persisted on EventType.slotIntervalMinutes */
export function persistedSlotIntervalMinutes(selection, durationMinutes) {
  const d = Math.max(1, Math.floor(Number(durationMinutes) || 15));
  if (selection === "event") return d;
  const n = Math.floor(Number(selection) || 15);
  return Math.max(1, n);
}

/** Map arbitrary stored minutes to the nearest configured buffer option. */
export function snapToBufferOption(minutes) {
  const n = Math.max(0, Math.floor(Number(minutes) || 0));
  if (BUFFER_MINUTE_OPTIONS.some((o) => o.value === n)) return n;
  let best = 0;
  let bestDist = Infinity;
  for (const o of BUFFER_MINUTE_OPTIONS) {
    const d = Math.abs(o.value - n);
    if (d < bestDist) {
      bestDist = d;
      best = o.value;
    }
  }
  return best;
}
