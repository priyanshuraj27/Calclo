import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Icon } from "./Icon";
import { apiData } from "../api/client.js";
import {
  MEETING_WHERE_OPTIONS,
  resolveBookingWhereParts,
} from "../utils/meetingWhere.js";
import { formatPageTitle } from "../utils/documentTitle.js";

const FIXED_BOOKING_TZ = "Asia/Kolkata";

/** Confirmation card always shows times in IST (Indian Standard Time). */
const ACK_DISPLAY_TZ = "Asia/Kolkata";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymdFromParts(y, m0, day) {
  return `${y}-${pad2(m0 + 1)}-${pad2(day)}`;
}

function parseYmd(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Calendar cells: null = padding, number = day of month */
function monthGridCells(year, month0) {
  const first = new Date(year, month0, 1);
  const lastDay = new Date(year, month0 + 1, 0).getDate();
  const startPad = first.getDay();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function startOfTodayLocal() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

function formatDayHeader(ymd) {
  const dt = parseYmd(ymd);
  return dt.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

function formatSlotTime(iso, use24h, timeZone) {
  try {
    const s = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: !use24h,
    }).format(new Date(iso));
    return use24h ? s : s.replace(/\s/g, "").toLowerCase();
  } catch {
    return "";
  }
}

function formatTime12(iso, tz) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date(iso))
      .replace(/\s/g, "")
      .toLowerCase();
  } catch {
    return "";
  }
}

function formatAckIstSingleLine(isoStart, isoEnd) {
  try {
    const datePart = new Intl.DateTimeFormat("en-IN", {
      timeZone: ACK_DISPLAY_TZ,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoStart));
    const t1 = formatTime12(isoStart, ACK_DISPLAY_TZ);
    const t2 = formatTime12(isoEnd, ACK_DISPLAY_TZ);
    return `${datePart} | ${t1} - ${t2} (Asia/Calcutta)`;
  } catch {
    return "";
  }
}

function formatFormerDateIst(isoStart) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: ACK_DISPLAY_TZ,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(isoStart));
  } catch {
    return "";
  }
}

function formatFormerTimeIst(isoStart, isoEnd) {
  try {
    const t1 = formatTime12(isoStart, ACK_DISPLAY_TZ);
    const t2 = formatTime12(isoEnd, ACK_DISPLAY_TZ);
    return `${t1} - ${t2}`;
  } catch {
    return "";
  }
}

function publicAppOrigin() {
  const v = import.meta.env?.VITE_PUBLIC_APP_URL;
  if (v) return String(v).replace(/\/$/, "");
  if (typeof window !== "undefined")
    return window.location.origin.replace(/\/$/, "");
  return "";
}

function meetingPageUrl(ack) {
  if (!ack?.hostUsername || !ack?.eventSlug) return "";
  return `${publicAppOrigin()}/book/${encodeURIComponent(ack.hostUsername)}/${encodeURIComponent(ack.eventSlug)}`;
}

function validateMeetingWhereForSubmit(type, detail) {
  const d = (detail || "").trim();
  if (type === "zoom" || type === "custom-link") {
    if (!/^https?:\/\//i.test(d)) {
      return "Enter a valid https link for this location type.";
    }
  }
  if (type === "google-meet" && d && !/^https?:\/\//i.test(d)) {
    return "Google Meet link must start with https://";
  }
  if ((type === "phone" || type === "in-person") && !d) {
    return "Please enter the phone number or address for this location.";
  }
  return "";
}

function buildAckFromApi(apiPayload, event, tz, meta) {
  const b = apiPayload?.booking;
  if (!b) return null;
  const startMs = new Date(b.startAt).getTime();
  const endMs = new Date(b.endAt).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    throw new Error("Booking response contained an invalid time value.");
  }
  const host =
    typeof b.hostUserId === "object" && b.hostUserId ? b.hostUserId : {};
  const et =
    typeof b.eventTypeId === "object" && b.eventTypeId ? b.eventTypeId : {};
  const mType = b.meetingWhereType || "cal-video";
  const mDetail = b.meetingWhereDetail || "";
  const pageHref = meetingPageUrl({
    hostUsername: meta?.hostUsername ?? "",
    eventSlug: meta?.eventSlug ?? "",
  });
  const w = resolveBookingWhereParts(mType, mDetail, pageHref);
  const actualMinutes = Math.max(
    1,
    Math.round(
      (endMs - startMs) / 60000
    )
  );
  return {
    eventTitle: et.title || event.title,
    durationMinutes: actualMinutes,
    hostName: host.fullName || host.username || event.user.name,
    hostEmail: host.email || "",
    guestName: b.bookerName,
    guestEmail: b.bookerEmail,
    startAt: new Date(startMs).toISOString(),
    endAt: new Date(endMs).toISOString(),
    timezone: tz,
    location: w.displayLabel,
    meetingWhereType: mType,
    meetingWhereDetail: mDetail,
    bookingId: String(b._id),
    confirmationToken: apiPayload.confirmationToken,
    hostUsername: meta?.hostUsername ?? "",
    eventSlug: meta?.eventSlug ?? "",
    guestEmails: Array.isArray(b.guestEmails) ? b.guestEmails : [],
  };
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,");
}

function icsDateUtc(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
}

function buildIcs(ack) {
  const uid = `${ack.bookingId}-${Date.now()}@calclo.com`;
  const pageUrl = meetingPageUrl(ack);
  const w = resolveBookingWhereParts(
    ack.meetingWhereType || "cal-video",
    ack.meetingWhereDetail || "",
    pageUrl
  );
  const loc = w.icsLocation || pageUrl;
  const urlLine = w.icsUrl || pageUrl;
  const descExtra = w.plainNote
    ? `\\n${w.displayLabel}: ${w.plainNote}`
    : w.linkHref
      ? `\\n${w.displayLabel}: ${w.linkHref}`
      : pageUrl
        ? `\\n${pageUrl}`
        : "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//calclo.com//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDateUtc(new Date())}`,
    `DTSTART:${icsDateUtc(new Date(ack.startAt))}`,
    `DTEND:${icsDateUtc(new Date(ack.endAt))}`,
    `SUMMARY:${escapeIcs(ack.eventTitle)}`,
    `DESCRIPTION:${escapeIcs(`Host: ${ack.hostName} (${ack.hostEmail || "n/a"})\\nGuest: ${ack.guestName} (${ack.guestEmail})${descExtra}`)}`,
    ...(loc ? [`LOCATION:${escapeIcs(loc)}`] : []),
    ...(urlLine ? [`URL:${escapeIcs(urlLine)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function downloadIcs(ack) {
  const blob = new Blob([buildIcs(ack)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(ack.eventTitle || "meeting").replace(/\s+/g, "-")}.ics`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(ack) {
  const start = new Date(ack.startAt);
  const end = new Date(ack.endAt);
  const g = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: ack.eventTitle,
    dates: `${g(start)}/${g(end)}`,
    details: `Scheduled meeting.\nHost: ${ack.hostName}\nGuest: ${ack.guestName}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function outlookCalendarUrl(ack) {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: ack.eventTitle,
    startdt: new Date(ack.startAt).toISOString(),
    enddt: new Date(ack.endAt).toISOString(),
    body: `Scheduled meeting.\nHost: ${ack.hostName}\nGuest: ${ack.guestName}`,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function yahooCalendarUrl(ack) {
  const st = Math.floor(new Date(ack.startAt).getTime() / 1000);
  const et = Math.floor(new Date(ack.endAt).getTime() / 1000);
  const params = new URLSearchParams({
    v: "60",
    view: "d",
    type: "20",
    title: ack.eventTitle,
    st: String(st),
    et: String(et),
    desc: `Host: ${ack.hostName} — Guest: ${ack.guestName}`,
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
}

function DetailRow({ label, children }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      <div className="w-14 shrink-0 font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="min-w-0 text-left text-zinc-900 dark:text-zinc-50">
        {children}
      </div>
    </div>
  );
}

function BookingAcknowledgement({
  ack,
  onHome,
  onBookAnother,
  onReschedule,
  onCancel,
  cancelBusy,
}) {
  const what = `${ack.durationMinutes} min meeting between ${ack.hostName} and ${ack.guestName}`;
  const pageUrl = meetingPageUrl(ack);
  const where = resolveBookingWhereParts(
    ack.meetingWhereType || "cal-video",
    ack.meetingWhereDetail || "",
    pageUrl
  );
  const whenIst = formatAckIstSingleLine(ack.startAt, ack.endAt);

  return (
    <div className="w-full max-w-[520px] animate-in fade-in zoom-in-95 duration-300">
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-8 shadow-sm dark:border-[#2a2a2a] dark:bg-[#141414] dark:shadow-2xl sm:px-10 sm:py-10">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700 shadow-sm dark:bg-green-600 dark:text-white dark:shadow-lg dark:shadow-green-900/40">
            <Icon name="check" className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-[#fafafa] sm:text-2xl">
            Your event has been scheduled
          </h1>
          <p className="mt-2 max-w-[400px] text-[13px] leading-relaxed text-zinc-500 dark:text-[#9a9a9a]">
            We sent an email to everyone with this information.
          </p>
        </div>

        <div className="my-8 border-t border-zinc-200 dark:border-[#2a2a2a]" />

        <div className="space-y-5">
          <DetailRow label="What">
            <span className="leading-snug">{what}</span>
          </DetailRow>
          <DetailRow label="When">
            <span className="leading-snug text-zinc-700 dark:text-zinc-200">
              {whenIst}
            </span>
          </DetailRow>
          <DetailRow label="Who">
            <div className="space-y-4">
              <div>
                <p className="font-medium">
                  {ack.hostName}{" "}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    — Organizer
                  </span>
                </p>
                {ack.hostEmail ? (
                  <a
                    href={`mailto:${ack.hostEmail}`}
                    className="mt-1 block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {ack.hostEmail}
                  </a>
                ) : null}
              </div>
              <div>
                <p className="font-medium">
                  {ack.guestName}{" "}
                  <span className="font-normal text-zinc-500 dark:text-zinc-400">
                    — Guest
                  </span>
                </p>
                <a
                  href={`mailto:${ack.guestEmail}`}
                  className="mt-1 block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                >
                  {ack.guestEmail}
                </a>
              </div>
              {ack.guestEmails && ack.guestEmails.length > 0 ? (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Additional guests notified
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700 dark:text-zinc-200">
                    {ack.guestEmails.map((em) => (
                      <li key={em}>
                        <a
                          href={`mailto:${em}`}
                          className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
                        >
                          {em}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </DetailRow>
          <DetailRow label="Where">
            <div className="space-y-2">
              {where.linkHref ? (
                <>
                  <a
                    href={where.linkHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {where.displayLabel}
                  </a>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Meeting URL:{" "}
                    <a
                      href={where.linkHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-600 underline underline-offset-2 dark:text-blue-400"
                    >
                      {where.linkHref}
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <span>{where.displayLabel}</span>
                  {where.plainNote ? (
                    <p className="text-sm whitespace-pre-wrap text-zinc-600 dark:text-zinc-300">
                      {where.plainNote}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </DetailRow>
        </div>

        <div className="my-8 border-t border-zinc-200 dark:border-[#2a2a2a]" />

        <p className="text-center text-[13px] text-zinc-500 dark:text-[#9a9a9a]">
          Need to make a change?{" "}
          <button
            type="button"
            onClick={onReschedule}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-600 disabled:opacity-40 dark:text-[#fafafa] dark:decoration-[#525252] dark:hover:decoration-[#fafafa]"
            disabled={!ack.confirmationToken || !ack.hostUsername || !ack.eventSlug}
          >
            Reschedule
          </button>{" "}
          or{" "}
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelBusy || !ack.confirmationToken}
            className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-600 disabled:opacity-40 dark:text-[#fafafa] dark:decoration-[#525252] dark:hover:decoration-[#fafafa]"
          >
            {cancelBusy ? "Cancelling…" : "Cancel"}
          </button>
        </p>

        <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-[#2a2a2a]">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-[#737373]">
            Add to calendar
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={googleCalendarUrl(ack)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#fafafa] dark:hover:border-[#525252] dark:hover:bg-[#222]"
              title="Google Calendar"
            >
              G
            </a>
            <a
              href={outlookCalendarUrl(ack)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#fafafa] dark:hover:border-[#525252] dark:hover:bg-[#222]"
              title="Outlook"
            >
              O
            </a>
            <button
              type="button"
              onClick={() => downloadIcs(ack)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-[10px] font-bold leading-tight text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#fafafa] dark:hover:border-[#525252] dark:hover:bg-[#222]"
              title="Apple Calendar / .ics"
            >
              .ics
            </button>
            <a
              href={yahooCalendarUrl(ack)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-100 dark:border-[#333] dark:bg-[#1a1a1a] dark:text-[#fafafa] dark:hover:border-[#525252] dark:hover:bg-[#222]"
              title="Yahoo Calendar"
            >
              Y
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {typeof onBookAnother === "function" ? (
            <button
              type="button"
              onClick={onBookAnother}
              className="w-full rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto dark:bg-[#fafafa] dark:text-[#0a0a0a] dark:hover:bg-white"
            >
              Book another time
            </button>
          ) : null}
          <button
            type="button"
            onClick={onHome}
            className="w-full rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 sm:w-auto dark:border-[#333] dark:bg-transparent dark:text-[#e5e5e5] dark:hover:bg-[#1f1f1f]"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Cal.com-style public booker: three columns (event · calendar · times).
 */
export function BookerPage({
  onNavigate,
  hostUsername,
  eventSlug,
  navSearch = "",
}) {
  const [phase, setPhase] = useState("schedule"); // schedule | form | success
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth0, setViewMonth0] = useState(() => new Date().getMonth());
  const [selectedYmd, setSelectedYmd] = useState(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSlotStartAt, setSelectedSlotStartAt] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [use24h, setUse24h] = useState(false);
  const [timezone] = useState(FIXED_BOOKING_TZ);
  const [event, setEvent] = useState({
    title: "15 Min Meeting",
    user: {
      name: "Host",
      avatar: null,
      initial: "h",
    },
    duration: 15,
    durationOptions: [15],
    description: "Welcome to my scheduling page. Please select a time that works for you.",
  });
  const [bookingDuration, setBookingDuration] = useState(15);
  const [bookerName, setBookerName] = useState("");
  const [bookerEmail, setBookerEmail] = useState("");
  const [meetingWhereType, setMeetingWhereType] = useState("cal-video");
  const [meetingWhereDetail, setMeetingWhereDetail] = useState("");
  const [notes, setNotes] = useState("");
  const [guestEmailsInput, setGuestEmailsInput] = useState("");
  const [error, setError] = useState(null);
  const [ackDetails, setAckDetails] = useState(null);
  const [rescheduleCtx, setRescheduleCtx] = useState(null);
  const [rescheduleLoadError, setRescheduleLoadError] = useState(null);
  const [cancelAckBusy, setCancelAckBusy] = useState(false);
  const [formerStartAt, setFormerStartAt] = useState(null);
  const [formerEndAt, setFormerEndAt] = useState(null);

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth0, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [viewYear, viewMonth0]
  );

  const gridCells = useMemo(
    () => monthGridCells(viewYear, viewMonth0),
    [viewYear, viewMonth0]
  );

  const loadEvent = useCallback(async () => {
    try {
      const data = await apiData(
        `/api/v1/public/hosts/${encodeURIComponent(hostUsername)}/events/${encodeURIComponent(eventSlug)}`,
        { noCache: true }
      );
      const name = data.host?.fullName || data.host?.username || "Host";
      const initial = (name || "H").trim().charAt(0).toLowerCase();
      const avatar =
        data.host?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=16a34a&color=fff`;
      const base = Number(data.durationMinutes) || 15;
      const rawOpts = Array.isArray(data.durationOptions)
        ? data.durationOptions.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n >= 1)
        : [];
      const durationOptions = [...new Set([base, ...rawOpts])].sort((a, b) => a - b);
      setEvent({
        title: data.title,
        user: { name, avatar, initial },
        duration: base,
        durationOptions,
        description: data.description || "",
      });
      setBookingDuration(base);
    } catch (e) {
      setError(e.message || "Failed to load event");
    }
  }, [hostUsername, eventSlug]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  useEffect(() => {
    const t = event?.title?.trim();
    document.title = formatPageTitle(t || "Book a time");
    return () => {
      document.title = formatPageTitle(null);
    };
  }, [event.title]);

  useEffect(() => {
    let cancelled = false;
    const q = new URLSearchParams(navSearch || "");
    const mode = q.get("reschedule");
    const bid = q.get("bookingId");
    const tok = q.get("token");

    if (mode !== "1" || !bid || !tok) {
      setRescheduleCtx(null);
      setRescheduleLoadError(null);
      setFormerStartAt(null);
      setFormerEndAt(null);
      return;
    }

    (async () => {
      setRescheduleLoadError(null);
      try {
        const data = await apiData(
          `/api/v1/public/bookings/${encodeURIComponent(bid)}/confirmation?token=${encodeURIComponent(tok)}`,
          { noCache: true }
        );
        if (cancelled) return;
        const b = data.booking;
        const et = typeof b.eventTypeId === "object" ? b.eventTypeId : {};
        const hu = typeof b.hostUserId === "object" ? b.hostUserId : {};
        if (
          (et.slug || "") !== eventSlug ||
          (hu.username || "").toLowerCase() !== (hostUsername || "").toLowerCase()
        ) {
          setRescheduleLoadError(
            "This reschedule link does not match this booking page. Open the link from your confirmation email."
          );
          setRescheduleCtx(null);
          return;
        }
        setRescheduleCtx({ bookingId: bid, token: tok });
        setFormerStartAt(new Date(b.startAt).toISOString());
        setFormerEndAt(new Date(b.endAt).toISOString());
        setBookerName(b.bookerName || "");
        setBookerEmail(b.bookerEmail || "");
        setMeetingWhereType(b.meetingWhereType || "cal-video");
        setMeetingWhereDetail(b.meetingWhereDetail || "");
        const prevMin = Math.max(
          1,
          Math.round(
            (new Date(b.endAt).getTime() - new Date(b.startAt).getTime()) /
              60000
          )
        );
        setBookingDuration(prevMin);
        const d = new Date(b.startAt);
        const y = d.getFullYear();
        const m0 = d.getMonth();
        const day = d.getDate();
        const ymd = ymdFromParts(y, m0, day);
        setViewYear(y);
        setViewMonth0(m0);
        setSelectedYmd(ymd);
        setSelectedDateLabel(
          parseYmd(ymd).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        );
        setSelectedTime(null);
        setSelectedSlotStartAt(null);
        setPhase("schedule");
        const slotQ = new URLSearchParams({
          date: ymd,
          durationMinutes: String(prevMin),
        });
        const slotsData = await apiData(
          `/api/v1/public/hosts/${encodeURIComponent(hostUsername)}/events/${encodeURIComponent(eventSlug)}/slots?${slotQ.toString()}`,
          { noCache: true }
        );
        if (cancelled) return;
        const slots = slotsData?.slots || [];
        setTimeSlots(
          slots.map((s) => ({
            label: s.label,
            startAt: s.startAt,
          }))
        );
      } catch (e) {
        if (!cancelled) {
          setRescheduleLoadError(e.message || "Could not load reschedule link");
          setRescheduleCtx(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navSearch, hostUsername, eventSlug]);

  const loadSlots = useCallback(
    async (ymd, explicitMinutes) => {
      const durationMinutes =
        explicitMinutes != null ? Number(explicitMinutes) : bookingDuration;
      setSlotsLoading(true);
      try {
        const q = new URLSearchParams({
          date: ymd,
          durationMinutes: String(durationMinutes),
        });
        const data = await apiData(
          `/api/v1/public/hosts/${encodeURIComponent(hostUsername)}/events/${encodeURIComponent(eventSlug)}/slots?${q.toString()}`,
          { noCache: true }
        );
        const nowMs = Date.now();
        const slots = (data?.slots || []).filter((s) => {
          const t = new Date(s.startAt).getTime();
          return Number.isFinite(t) && t > nowMs;
        });
        setTimeSlots(
          slots.map((s) => ({
            label: s.label,
            startAt: s.startAt,
          }))
        );
      } catch (e) {
        setTimeSlots([]);
        setError(e.message || "Failed to load slots");
      } finally {
        setSlotsLoading(false);
      }
    },
    [hostUsername, eventSlug, bookingDuration]
  );

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth0 - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth0(d.getMonth());
  };

  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth0 + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth0(d.getMonth());
  };

  const handlePickDay = async (day) => {
    const ymd = ymdFromParts(viewYear, viewMonth0, day);
    setSelectedYmd(ymd);
    setSelectedDateLabel(
      parseYmd(ymd).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
    setSelectedTime(null);
    setSelectedSlotStartAt(null);
    setPhase("schedule");
    await loadSlots(ymd);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(formatSlotTime(slot.startAt, use24h, timezone));
    setSelectedSlotStartAt(slot.startAt);
    setPhase("form");
  };

  const todayStart = startOfTodayLocal();

  const dayMeta = (day) => {
    const ymd = ymdFromParts(viewYear, viewMonth0, day);
    const cellDate = parseYmd(ymd);
    const isPast = cellDate < todayStart;
    const isSelected = selectedYmd === ymd;
    return { ymd, isPast, isSelected };
  };

  const routeMeta = useMemo(
    () => ({ hostUsername, eventSlug }),
    [hostUsername, eventSlug]
  );

  const bookingPageHref = useMemo(() => {
    if (!hostUsername || !eventSlug) return "";
    return `${publicAppOrigin()}/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(eventSlug)}`;
  }, [hostUsername, eventSlug]);

  const meetingWhereSummary = useMemo(() => {
    const w = resolveBookingWhereParts(
      meetingWhereType,
      meetingWhereDetail,
      bookingPageHref
    );
    if (w.plainNote) {
      return w.plainNote.length > 52
        ? `${w.displayLabel} · ${w.plainNote.slice(0, 49)}…`
        : `${w.displayLabel} · ${w.plainNote}`;
    }
    return w.displayLabel;
  }, [meetingWhereType, meetingWhereDetail, bookingPageHref]);

  const meetingWhereFieldMeta = useMemo(
    () => MEETING_WHERE_OPTIONS.find((o) => o.value === meetingWhereType),
    [meetingWhereType]
  );

  useEffect(() => {
    const q = new URLSearchParams(navSearch || "");
    if (
      q.get("reschedule") === "1" &&
      q.get("bookingId") &&
      q.get("token")
    ) {
      return;
    }
    setMeetingWhereType("cal-video");
    setMeetingWhereDetail("");
  }, [hostUsername, eventSlug, navSearch]);

  const handleRescheduleFromAck = useCallback(() => {
    if (!ackDetails?.confirmationToken) return;
    const path = `/book/${encodeURIComponent(ackDetails.hostUsername)}/${encodeURIComponent(ackDetails.eventSlug)}?reschedule=1&bookingId=${encodeURIComponent(ackDetails.bookingId)}&token=${encodeURIComponent(ackDetails.confirmationToken)}`;
    setAckDetails(null);
    setPhase("schedule");
    onNavigate(path);
  }, [ackDetails, onNavigate]);

  const handleCancelFromAck = useCallback(async () => {
    if (!ackDetails?.confirmationToken) return;
    setCancelAckBusy(true);
    setError(null);
    try {
      await apiData(`/api/v1/public/bookings/${ackDetails.bookingId}/cancel`, {
        method: "POST",
        json: { token: ackDetails.confirmationToken },
      });
      onNavigate("/event-types");
    } catch (e) {
      setError(e.message || "Cancel failed");
    } finally {
      setCancelAckBusy(false);
    }
  }, [ackDetails, onNavigate]);

  const handleBookAnother = useCallback(() => {
    setAckDetails(null);
    setPhase("schedule");
    setSelectedTime(null);
    setSelectedSlotStartAt(null);
    setError(null);
    setTimeSlots([]);
    if (selectedYmd) {
      void loadSlots(selectedYmd);
    }
  }, [selectedYmd, loadSlots]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      if (phase !== "schedule" || !selectedYmd) return;
      void loadSlots(selectedYmd);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [phase, selectedYmd, loadSlots]);

  if (phase === "success" && ackDetails) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 selection:bg-zinc-900/10 dark:bg-[#0a0a0a] dark:text-[#fafafa] dark:selection:bg-white/20 flex flex-col items-center justify-center p-4 md:p-6 font-sans">
        {error ? (
          <div className="mb-3 text-sm text-red-600 max-w-lg text-center dark:text-red-400">{error}</div>
        ) : null}
        <BookingAcknowledgement
          ack={ackDetails}
          onHome={() => onNavigate("/event-types")}
          onBookAnother={handleBookAnother}
          onReschedule={handleRescheduleFromAck}
          onCancel={handleCancelFromAck}
          cancelBusy={cancelAckBusy}
        />
        <p className="mt-8 text-center text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-400">
          calclo.com
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] flex flex-col items-center justify-center p-4 md:p-6 font-sans selection:bg-white/20">
      {error ? (
        <div className="mb-3 text-sm text-red-400 max-w-lg text-center">{error}</div>
      ) : null}

      {rescheduleCtx ? (
        <div className="mb-4 w-full max-w-[1040px] rounded-lg border border-blue-500/35 bg-blue-500/10 px-4 py-3 text-center text-[13px] text-[#93c5fd]">
          Reschedule: choose a new date and time. Your previous slot is released after you
          confirm the new one.
        </div>
      ) : null}
      {rescheduleLoadError ? (
        <div className="mb-4 w-full max-w-[1040px] text-center text-sm text-red-400">
          {rescheduleLoadError}
        </div>
      ) : null}

      <div className="w-full max-w-[1040px] rounded-2xl border border-[#262626] bg-[#101010] shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:min-h-[560px]">
        {/* ── Column 1: event meta ───────────────────────────── */}
        <aside className="w-full lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#262626] p-6 md:p-8 flex flex-col gap-8">
              <button 
            type="button"
                onClick={() => {
              if (phase === "form") {
                setPhase("schedule");
                setSelectedTime(null);
                setSelectedSlotStartAt(null);
              } else if (rescheduleCtx) {
                setRescheduleCtx(null);
                setRescheduleLoadError(null);
                setFormerStartAt(null);
                setFormerEndAt(null);
                onNavigate(
                  `/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(eventSlug)}`
                );
              } else onNavigate("/event-types");
            }}
            className="self-start p-2 -ml-2 rounded-full text-[#888] hover:text-[#fafafa] hover:bg-[#1f1f1f] transition-colors"
            aria-label="Go back"
              >
                <Icon name="arrow-left" className="h-4 w-4" />
              </button>

          <div className="flex flex-col gap-5">
            {event.user.avatar ? (
              <img
                src={event.user.avatar}
                className="h-11 w-11 rounded-full border border-[#2a2a2a] object-cover"
                alt=""
              />
            ) : (
              <div className="h-11 w-11 rounded-full bg-green-600 flex items-center justify-center text-sm font-bold text-white border border-green-700">
                {event.user.initial || "?"}
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-[13px] text-[#9a9a9a] leading-tight">{event.user.name}</p>
              <h1 className="text-[22px] md:text-2xl font-cal font-semibold text-[#fafafa] tracking-tight leading-snug">
                {event.title}
              </h1>
            </div>
            {rescheduleCtx && formerStartAt && formerEndAt ? (
              <div className="space-y-1 text-[12px] text-[#8a8a8a]">
                <p className="inline-flex items-center gap-1.5">
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  <span>Former time</span>
                </p>
                <p className="line-through leading-snug">
                  {formatFormerDateIst(formerStartAt)}
                </p>
                <p className="line-through leading-snug">
                  {formatFormerTimeIst(formerStartAt, formerEndAt)}
                </p>
              </div>
            ) : null}
              </div>

          <div className="space-y-3 text-[13px]">
            <div className="flex items-center gap-2.5 text-[#a3a3a3]">
              <Icon name="clock" className="h-4 w-4 shrink-0 opacity-80" />
              <span>{bookingDuration}m</span>
            </div>
            <div className="flex items-center gap-2.5 text-[#a3a3a3]">
              <Icon name="video" className="h-4 w-4 shrink-0 opacity-80" />
              <span className="min-w-0 leading-snug">{meetingWhereSummary}</span>
            </div>
            <div className="relative pt-1">
              <div className="relative flex items-center gap-2.5 rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5">
                <Icon name="globe" className="h-4 w-4 shrink-0 text-[#888]" />
                <span className="text-[13px] font-medium text-[#e5e5e5]">
                  {FIXED_BOOKING_TZ}
                </span>
              </div>
            </div>
          </div>

          {event.description ? (
            <p className="text-[13px] text-[#737373] leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          ) : null}

          {selectedYmd && selectedTime ? (
            <div className="pt-2 border-t border-[#262626] space-y-2 text-[13px] text-[#a3a3a3]">
              <div className="flex items-center gap-2">
                       <Icon name="calendar" className="h-4 w-4" />
                <span>{selectedDateLabel}</span>
                    </div>
              <div className="flex items-center gap-2">
                       <Icon name="clock" className="h-4 w-4" />
                       <span>{selectedTime}</span>
                    </div>
            </div>
          ) : null}

        </aside>

        {/* ── Column 2 + 3 ─────────────────────────────────── */}
        <div className="flex flex-1 flex-col md:flex-row min-h-[480px]">
          {/* Calendar */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-[#262626] p-6 md:p-8 md:pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-[#fafafa]">{monthLabel}</h2>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={goPrevMonth}
                  className="p-2 rounded-lg text-[#888] hover:bg-[#1f1f1f] hover:text-[#fafafa] transition"
                  aria-label="Previous month"
                >
                  <Icon name="chevron-left" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goNextMonth}
                  className="p-2 rounded-lg text-[#888] hover:bg-[#1f1f1f] hover:text-[#fafafa] transition"
                  aria-label="Next month"
                >
                  <Icon name="chevron-right" className="h-4 w-4" />
                </button>
           </div>
        </div>

            <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#666] mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                    </div>
              ))}
                 </div>

            <div className="grid grid-cols-7 gap-1">
              {gridCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`pad-${idx}`} className="aspect-square min-h-[36px]" />;
                }
                const { ymd, isPast, isSelected } = dayMeta(day);
                const clickable = !isPast;

                      return (
                        <button
                    key={ymd}
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && handlePickDay(day)}
                    className={`aspect-square min-h-[40px] max-h-[44px] mx-auto w-full max-w-[44px] flex flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-white text-[#0a0a0a] shadow-md"
                        : clickable
                          ? "bg-[#1c1c1c] text-[#d4d4d4] border border-[#2a2a2a] hover:border-[#404040] hover:bg-[#242424]"
                          : "text-[#3f3f3f] cursor-not-allowed"
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected ? (
                      <span className="mt-0.5 h-1 w-1 rounded-full bg-[#0a0a0a]" aria-hidden />
                    ) : (
                      <span className="h-1 w-1 shrink-0" aria-hidden />
                    )}
                        </button>
                      );
                    })}
                 </div>
                 </div>
                 
          {/* Times / form / success */}
          <section className="w-full md:w-[300px] lg:w-[320px] shrink-0 flex flex-col bg-[#0c0c0c] p-6 md:p-7">
            {phase === "schedule" && (
              <>
                {selectedYmd ? (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <h3 className="text-lg font-semibold text-[#fafafa] tracking-tight">
                        {formatDayHeader(selectedYmd)}
                      </h3>
                      <div
                        className="flex shrink-0 rounded-lg border border-[#333] bg-[#141414] p-0.5 text-[11px] font-semibold"
                        role="group"
                        aria-label="Time format"
                      >
                        <button
                          type="button"
                          onClick={() => setUse24h(false)}
                          className={`px-2.5 py-1 rounded-md transition ${!use24h ? "bg-[#2a2a2a] text-white" : "text-[#888]"}`}
                        >
                          12h
                        </button>
                        <button
                          type="button"
                          onClick={() => setUse24h(true)}
                          className={`px-2.5 py-1 rounded-md transition ${use24h ? "bg-[#2a2a2a] text-white" : "text-[#888]"}`}
                        >
                          24h
                      </button>
                 </div>
              </div>

                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[min(420px,calc(100vh-220px))] pr-1 custom-scrollbar">
                      {slotsLoading ? (
                        <p className="text-sm text-[#737373]">Loading times…</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-[#737373]">No times available for this date.</p>
                      ) : (
                        timeSlots.map((slot) => (
                          <button
                            key={slot.startAt}
                            type="button"
                            onClick={() => handleTimeSelect(slot)}
                            className="flex w-full items-center gap-3 rounded-xl border border-[#333] bg-[#141414] px-4 py-3.5 text-left text-sm font-medium text-[#e5e5e5] transition hover:border-[#525252] hover:bg-[#1a1a1a]"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.45)]"
                              aria-hidden
                            />
                            <span>{formatSlotTime(slot.startAt, use24h, timezone)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center text-center py-12 px-2">
                    <Icon name="calendar" className="h-10 w-10 text-[#333] mb-3" />
                    <p className="text-sm font-medium text-[#a3a3a3]">Select a date</p>
                    <p className="text-xs text-[#525252] mt-1 max-w-[200px]">
                      Choose a day in the calendar to see available times.
                    </p>
                  </div>
                )}
              </>
            )}

            {phase === "form" && (
              <div className="animate-in fade-in duration-200 flex flex-col flex-1 min-h-0">
                <h3 className="text-lg font-semibold text-[#fafafa] mb-1">
                  {rescheduleCtx ? "Confirm new time" : "Enter details"}
                </h3>
                <p className="text-xs text-[#737373] mb-4">
                  {selectedDateLabel} · {selectedTime}
                </p>
                <form
                  className="space-y-4 flex-1 flex flex-col min-h-0 overflow-y-auto"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      setError(null);
                      const whereErr = validateMeetingWhereForSubmit(
                        meetingWhereType,
                        meetingWhereDetail
                      );
                      if (whereErr) {
                        setError(whereErr);
                        return;
                      }
                      const wherePayload = {
                        meetingWhereType,
                        meetingWhereDetail:
                          meetingWhereType === "cal-video"
                            ? ""
                            : meetingWhereDetail.trim(),
                      };
                      let payload;
                      if (rescheduleCtx) {
                        payload = await apiData(
                          `/api/v1/public/bookings/${encodeURIComponent(rescheduleCtx.bookingId)}/reschedule`,
                          {
                            method: "POST",
                            json: {
                              token: rescheduleCtx.token,
                              newStartAt: selectedSlotStartAt,
                              ...wherePayload,
                            },
                          }
                        );
                        setRescheduleCtx(null);
                        onNavigate(
                          `/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(eventSlug)}`
                        );
                      } else {
                        payload = await apiData(
                          `/api/v1/public/hosts/${encodeURIComponent(hostUsername)}/events/${encodeURIComponent(eventSlug)}/bookings`,
                          {
                            method: "POST",
                            json: {
                              startAt: selectedSlotStartAt,
                              durationMinutes: bookingDuration,
                              bookerName,
                              bookerEmail,
                              answers: [],
                              notes,
                              guestEmails: String(guestEmailsInput || "")
                                .split(/[\n,;]+/)
                                .map((s) => s.trim())
                                .filter(Boolean),
                              ...wherePayload,
                            },
                          }
                        );
                        // Immediately hide the just-booked slot in this session.
                        if (selectedSlotStartAt) {
                          setTimeSlots((prev) =>
                            prev.filter((s) => s.startAt !== selectedSlotStartAt)
                          );
                        }
                        // Re-sync from API so stale slots are removed too.
                        if (selectedYmd) {
                          await loadSlots(selectedYmd, bookingDuration);
                        }
                      }
                      const nextAck = buildAckFromApi(
                        payload,
                        event,
                        timezone,
                        routeMeta
                      );
                      if (!nextAck) {
                        setError("Booking saved but confirmation details were missing.");
                        return;
                      }
                      setAckDetails(nextAck);
                      setPhase("success");
                    } catch (err) {
                      setError(err.message || "Booking failed");
                      if (
                        String(err?.message || "")
                          .toLowerCase()
                          .includes("no longer available") &&
                        selectedYmd
                      ) {
                        void loadSlots(selectedYmd, bookingDuration);
                      }
                    }
                  }}
                >
                    <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                      Name
                    </label>
                       <input 
                         required
                         type="text" 
                      placeholder="Jane Doe"
                      value={bookerName}
                      onChange={(e) => setBookerName(e.target.value)}
                      readOnly={!!rescheduleCtx}
                      className="w-full rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#525252] focus:border-[#525252] read-only:opacity-70"
                       />
                    </div>
                    <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                      Email
                    </label>
                       <input 
                         required
                         type="email" 
                      placeholder="you@company.com"
                      value={bookerEmail}
                      onChange={(e) => setBookerEmail(e.target.value)}
                      readOnly={!!rescheduleCtx}
                      className="w-full rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#525252] focus:border-[#525252] read-only:opacity-70"
                       />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                        Location
                      </label>
                      <div className="relative flex items-center gap-2.5 rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 pr-9">
                        <Icon name="link" className="h-4 w-4 shrink-0 text-[#888]" />
                        <select
                          className="w-full min-w-0 cursor-pointer bg-transparent text-[13px] font-medium text-[#e5e5e5] outline-none appearance-none"
                          style={{ colorScheme: "dark" }}
                          value={meetingWhereType}
                          onChange={(e) => {
                            const v = e.target.value;
                            setMeetingWhereType(v);
                            if (v === "cal-video") setMeetingWhereDetail("");
                          }}
                          aria-label="Meeting location"
                        >
                          {MEETING_WHERE_OPTIONS.map((o) => (
                            <option
                              key={o.value}
                              value={o.value}
                              className="bg-[#141414] text-[#e5e5e5]"
                            >
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <Icon
                          name="chevron-down"
                          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666]"
                        />
                      </div>
                    </div>
                    {meetingWhereFieldMeta?.needsDetail ? (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                          {meetingWhereFieldMeta.detailLabel}
                        </label>
                        <input
                          type={meetingWhereFieldMeta.inputType || "url"}
                          value={meetingWhereDetail}
                          onChange={(e) => setMeetingWhereDetail(e.target.value)}
                          placeholder={meetingWhereFieldMeta.detailPlaceholder}
                          required={meetingWhereFieldMeta.needsDetail === true}
                          className="w-full rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#525252] focus:border-[#525252]"
                        />
                        {meetingWhereFieldMeta.needsDetail === "optional" ? (
                          <p className="text-[11px] text-[#525252] leading-snug">
                            Optional. If empty, guests use your calclo.com booking link.
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                    {!rescheduleCtx ? (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                          Additional guests (optional)
                        </label>
                        <textarea
                          rows={2}
                          value={guestEmailsInput}
                          onChange={(e) => setGuestEmailsInput(e.target.value)}
                          placeholder="One email per line, or comma-separated (max 10)"
                          className="w-full resize-none rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#525252] focus:border-[#525252]"
                          aria-describedby="guest-emails-hint"
                        />
                        <p
                          id="guest-emails-hint"
                          className="text-[11px] text-[#525252] leading-snug"
                        >
                          Each address gets an invite with time, location, and a
                          calendar file. They cannot reschedule or cancel this
                          booking (only you can, with your confirmation link).
                        </p>
                      </div>
                    ) : null}
                    <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wide text-[#737373]">
                      Notes
                    </label>
                       <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Anything we should know?"
                      className="w-full resize-none rounded-lg border border-[#333] bg-[#141414] px-3 py-2.5 text-sm text-[#fafafa] outline-none placeholder:text-[#525252] focus:border-[#525252]"
                       />
                    </div>
                  <button type="submit" className="btn-primary mt-2 w-full py-3 h-auto text-sm font-semibold">
                    {rescheduleCtx ? "Confirm reschedule" : "Confirm"}
                    </button>
                 </form>
              </div>
           )}

          </section>
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-semibold tracking-tight text-zinc-500">
        calclo.com
      </p>
    </div>
  );
}
