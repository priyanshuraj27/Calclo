/** "09:00" / "9:00" 24h → "9:00am" style */
export function toAmPmFrom24(hm) {
  if (!hm || typeof hm !== "string") return "";
  const [hRaw, mRaw] = hm.split(":");
  let h = parseInt(hRaw, 10);
  const m = parseInt(mRaw ?? "0", 10) || 0;
  if (Number.isNaN(h)) return hm;
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")}${ap}`;
}

/** "9:00am" / "9:00 AM" → "09:00"; also accepts "17:00" style 24h */
export function fromAmPmTo24(s) {
  if (!s || typeof s !== "string") return "09:00";
  const t = s.trim().toLowerCase().replace(/\s/g, "");
  const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
  if (m24) {
    const h = parseInt(m24[1], 10);
    const min = parseInt(m24[2], 10);
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
  }
  const m = t.match(/^(\d{1,2}):(\d{2})(am|pm)$/);
  if (!m) return "09:00";
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3];
  if (ap === "pm" && h !== 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
