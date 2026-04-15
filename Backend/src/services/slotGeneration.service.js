import { DateTime } from "luxon";
import { Booking } from "../models/booking.models.js";
import { EventType } from "../models/eventType.models.js";
import { User } from "../models/user.models.js";
import { AvailabilityOverride } from "../models/availabilityOverride.models.js";
import { BOOKING_STATUS } from "../constants/scheduling.constants.js";
import { OVERRIDE_TYPE } from "../constants/scheduling.constants.js";

const LUXON_WEEKDAY_TO_KEY = {
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

function parseYmd(dateStr) {
  const parts = dateStr.split("-").map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, d] = parts;
  return { y, m, d };
}

function atHm(zone, ymdStr, hm) {
  const ymd = parseYmd(ymdStr);
  if (!ymd) return DateTime.invalid("bad date");
  const hmParts = hm.split(":").map((n) => parseInt(n, 10));
  if (hmParts.length !== 2 || hmParts.some((n) => Number.isNaN(n)))
    return DateTime.invalid("bad time");
  const [hh, mm] = hmParts;
  return DateTime.fromObject(
    {
      year: ymd.y,
      month: ymd.m,
      day: ymd.d,
      hour: hh,
      minute: mm,
      second: 0,
      millisecond: 0,
    },
    { zone }
  );
}

function listSlotsForIntervals(
  zone,
  dateStr,
  intervals,
  slotStepMinutes,
  durationMinutes,
  nowZoned,
  minimumNoticeMinutes,
  windowEndZoned
) {
  const slots = [];
  for (const interval of intervals) {
    let cursor = atHm(zone, dateStr, interval.start);
    const intervalEnd = atHm(zone, dateStr, interval.end);
    if (!cursor.isValid || !intervalEnd.isValid || cursor >= intervalEnd) continue;
    while (cursor.plus({ minutes: durationMinutes }) <= intervalEnd) {
      const slotStart = cursor;
      if (slotStart < nowZoned.plus({ minutes: minimumNoticeMinutes })) {
        cursor = cursor.plus({ minutes: slotStepMinutes });
        continue;
      }
      if (slotStart > windowEndZoned) break;
      const slotEnd = cursor.plus({ minutes: durationMinutes });
      slots.push({ start: slotStart, end: slotEnd });
      cursor = cursor.plus({ minutes: slotStepMinutes });
    }
  }
  return slots;
}

function blockedRangeForSlot(slotStartUtc, slotEndUtc, bufferBefore, bufferAfter) {
  const start = DateTime.fromJSDate(slotStartUtc, { zone: "utc" }).minus({
    minutes: bufferBefore,
  });
  const end = DateTime.fromJSDate(slotEndUtc, { zone: "utc" }).plus({
    minutes: bufferAfter,
  });
  return { start: start.toJSDate(), end: end.toJSDate() };
}

export function hasOverlap(blockedStart, blockedEnd, bookings) {
  return bookings.some(
    (b) =>
      b.blockedStartAt < blockedEnd &&
      b.blockedEndAt > blockedStart &&
      [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE].includes(b.status)
  );
}

export async function loadPublicEventContext(hostUsername, eventSlug) {
  const host = await User.findOne({
    username: hostUsername.toLowerCase().trim(),
  }).lean();
  if (!host) return { host: null, eventType: null };
  const eventType = await EventType.findOne({
    hostUserId: host._id,
    slug: eventSlug,
    active: true,
  })
    .populate("availabilityScheduleId")
    .lean();
  return { host, eventType };
}

export async function getSlotsForPublicEvent({
  hostUsername,
  eventSlug,
  date,
}) {
  const { host, eventType } = await loadPublicEventContext(hostUsername, eventSlug);
  if (!host || !eventType) return { notFound: true };
  const schedule = eventType.availabilityScheduleId;
  if (!schedule) return { notFound: true };

  const zone = schedule.timezone;
  const selectedDay = DateTime.fromISO(date, { zone }).startOf("day");
  if (!selectedDay.isValid) return { invalidDate: true };

  const override = await AvailabilityOverride.findOne({
    scheduleId: schedule._id,
    date,
  }).lean();

  let intervals = [];
  if (override) {
    if (override.type === OVERRIDE_TYPE.CLOSED) intervals = [];
    else intervals = override.intervals || [];
  } else {
    const key = LUXON_WEEKDAY_TO_KEY[selectedDay.weekday];
    const wr = schedule.weeklyRules || {};
    intervals = wr[key] || [];
  }

  const nowHostZoned = DateTime.now().setZone(zone);
  const windowEnd = nowHostZoned
    .plus({ days: eventType.bookingWindowDays })
    .endOf("day");

  const candidates = listSlotsForIntervals(
    zone,
    date,
    intervals,
    eventType.slotIntervalMinutes,
    eventType.durationMinutes,
    nowHostZoned,
    eventType.minimumNoticeMinutes,
    windowEnd
  );

  const dayStartUtc = selectedDay.toUTC().startOf("day").toJSDate();
  const dayEndUtc = selectedDay.toUTC().endOf("day").toJSDate();

  const conflicts = await Booking.find({
    hostUserId: host._id,
    status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE] },
    blockedStartAt: { $lt: dayEndUtc },
    blockedEndAt: { $gt: dayStartUtc },
  }).lean();

  const slots = [];
  for (const c of candidates) {
    const startUtc = c.start.toUTC().toJSDate();
    const endUtc = c.end.toUTC().toJSDate();
    const { start: blockedStart, end: blockedEnd } = blockedRangeForSlot(
      startUtc,
      endUtc,
      eventType.bufferBeforeMinutes,
      eventType.bufferAfterMinutes
    );
    if (hasOverlap(blockedStart, blockedEnd, conflicts)) continue;
    slots.push({
      startAt: startUtc.toISOString(),
      endAt: endUtc.toISOString(),
      label: c.start.setZone(zone).toFormat("h:mm a"),
    });
  }

  return { host, eventType, schedule, slots };
}
