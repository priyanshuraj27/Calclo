import { toAmPmFrom24, fromAmPmTo24 } from "./timeFormat.js";

const API_DAY_TO_UI = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const UI_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function weeklyRulesToAvailability(weeklyRules) {
  const availability = {};
  for (const d of UI_DAYS) availability[d] = null;
  if (!weeklyRules) return availability;
  for (const [apiKey, intervals] of Object.entries(weeklyRules)) {
    const ui = API_DAY_TO_UI[apiKey];
    if (!ui || !intervals?.length) continue;
    availability[ui] = intervals.map((iv) => ({
      from: toAmPmFrom24(iv.start),
      to: toAmPmFrom24(iv.end),
    }));
  }
  return availability;
}

const UI_TO_API = Object.fromEntries(
  Object.entries(API_DAY_TO_UI).map(([k, v]) => [v, k])
);

export function availabilityToWeeklyRules(availability) {
  const weeklyRules = {};
  for (const uiDay of UI_DAYS) {
    const apiKey = UI_TO_API[uiDay];
    const slots = availability[uiDay];
    if (slots && slots.length > 0) {
      weeklyRules[apiKey] = slots.map((s) => ({
        start: fromAmPmTo24(s.from),
        end: fromAmPmTo24(s.to),
      }));
    } else {
      weeklyRules[apiKey] = [];
    }
  }
  return weeklyRules;
}

/** Summary line like "Mon - Fri" from weeklyRules keys that have intervals */
export function summarizeDays(weeklyRules) {
  const order = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const short = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };
  const activeIdx = order
    .map((k, i) => ((weeklyRules?.[k] || []).length > 0 ? i : -1))
    .filter((i) => i >= 0);
  if (activeIdx.length === 0) return "No days";
  let start = activeIdx[0];
  let prev = activeIdx[0];
  for (let j = 1; j < activeIdx.length; j++) {
    if (activeIdx[j] === prev + 1) prev = activeIdx[j];
    else break;
  }
  if (start === prev) return short[order[start]];
  return `${short[order[start]]} - ${short[order[prev]]}`;
}

/** First interval of first active day, formatted for listing row */
export function summarizeTime(weeklyRules) {
  const order = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  for (const k of order) {
    const iv = weeklyRules?.[k]?.[0];
    if (iv?.start && iv?.end) {
      return `${toAmPmFrom24(iv.start)} - ${toAmPmFrom24(iv.end)}`;
    }
  }
  return "";
}
