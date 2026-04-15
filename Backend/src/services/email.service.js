import { Resend } from "resend";
import { DateTime } from "luxon";
import { resolveWhereParts } from "../utils/meetingWhere.util.js";

const DEFAULT_FROM = "Bookings <bookings@bepriyanshu.tech>";
const IST_ZONE = "Asia/Kolkata";
const BRAND = "calclo.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key?.trim()) return null;
  return new Resend(key.trim());
}

function fromAddress() {
  return (process.env.RESEND_FROM || DEFAULT_FROM).trim();
}

function appOrigin() {
  return (process.env.PUBLIC_APP_URL || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatWhenIstLine(startAt, endAt) {
  const s = DateTime.fromJSDate(new Date(startAt)).setZone(IST_ZONE);
  const e = DateTime.fromJSDate(new Date(endAt)).setZone(IST_ZONE);
  const datePart = s.toFormat("cccc, LLLL d, yyyy");
  const t1 = s.toFormat("h:mma").toLowerCase();
  const t2 = e.toFormat("h:mma").toLowerCase();
  return `${datePart} | ${t1} - ${t2} (Asia/Calcutta)`;
}

function formatWhenIstShort(iso) {
  return DateTime.fromJSDate(new Date(iso))
    .setZone(IST_ZONE)
    .toFormat("cccc, LLLL d, yyyy 'at' h:mma")
    .toLowerCase();
}

function manageBookingUrl({
  hostUsername,
  eventSlug,
  bookingId,
  confirmationToken,
}) {
  const base = appOrigin();
  const q = new URLSearchParams({
    reschedule: "1",
    bookingId: String(bookingId),
    token: confirmationToken,
  });
  return `${base}/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(eventSlug)}?${q.toString()}`;
}

function meetingPageUrl(hostUsername, eventSlug) {
  return `${appOrigin()}/book/${encodeURIComponent(hostUsername)}/${encodeURIComponent(eventSlug)}`;
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,");
}

function icsDateUtc(d) {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z/, "Z");
}

function buildBookingIcs(p) {
  const uid = `${p.bookingId}-${Date.now()}@${BRAND}`;
  const bookUrl = meetingPageUrl(p.hostUsername, p.eventSlug);
  const w = resolveWhereParts({
    type: p.meetingWhereType || "cal-video",
    detail: p.meetingWhereDetail || "",
    bookingPageUrl: bookUrl,
  });
  const descBase = `${p.eventTitle} — ${p.hostName} & ${p.bookerName}`;
  const descExtra = w.plainNote
    ? `\\n${w.displayLabel}: ${w.plainNote}`
    : w.linkHref
      ? `\\n${w.displayLabel}: ${w.linkHref}`
      : `\\n${bookUrl}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${BRAND}//Booking//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDateUtc(new Date())}`,
    `DTSTART:${icsDateUtc(p.startAt)}`,
    `DTEND:${icsDateUtc(p.endAt)}`,
    `SUMMARY:${escapeIcs(p.eventTitle)}`,
    `DESCRIPTION:${escapeIcs(descBase + descExtra)}`,
    `LOCATION:${escapeIcs(w.icsLocation || bookUrl)}`,
    `URL:${escapeIcs(w.icsUrl || bookUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function whereSectionHtml(p) {
  const bookUrl = meetingPageUrl(p.hostUsername, p.eventSlug);
  const w = resolveWhereParts({
    type: p.meetingWhereType || "cal-video",
    detail: p.meetingWhereDetail || "",
    bookingPageUrl: bookUrl,
  });
  let html = `<p style="margin:0 0 8px;font-size:13px;"><strong>Where</strong></p>`;
  if (w.linkHref) {
    html += `<p style="margin:0;font-size:14px;"><a href="${esc(w.linkHref)}" style="color:#2563eb;text-decoration:underline;">${esc(w.displayLabel)}</a></p>`;
    html += `<p style="margin:8px 0 0;font-size:13px;color:#52525b;">Meeting URL:<br/><a href="${esc(w.linkHref)}" style="color:#2563eb;word-break:break-all;">${esc(w.linkHref)}</a></p>`;
  } else {
    html += `<p style="margin:0;font-size:14px;color:#27272a;">${esc(w.displayLabel)}</p>`;
    if (w.plainNote) {
      html += `<p style="margin:8px 0 0;font-size:14px;color:#27272a;white-space:pre-wrap;">${esc(w.plainNote)}</p>`;
    }
  }
  return html;
}

function whereSummaryPlain(p) {
  const bookUrl = meetingPageUrl(p.hostUsername, p.eventSlug);
  const w = resolveWhereParts({
    type: p.meetingWhereType || "cal-video",
    detail: p.meetingWhereDetail || "",
    bookingPageUrl: bookUrl,
  });
  if (w.linkHref) return `${w.displayLabel}: ${w.linkHref}`;
  if (w.plainNote) return `${w.displayLabel}: ${w.plainNote}`;
  return bookUrl;
}

function emailWrapper(innerHtml) {
  return `<!DOCTYPE html>
<html><body style="margin:0;background:#f4f4f5;font-family:Inter,system-ui,-apple-system,sans-serif;">
  <div style="padding:28px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:36px 32px;border:1px solid #e4e4e7;box-shadow:0 1px 2px rgba(0,0,0,0.04);color:#18181b;">
      ${innerHtml}
      <p style="margin:32px 0 0;font-size:12px;color:#71717a;text-align:center;">${esc(BRAND)}</p>
    </div>
  </div>
</body></html>`;
}

function icsAttachment(icsString) {
  return [
    {
      filename: `${BRAND}-booking.ics`,
      content: Buffer.from(icsString, "utf8"),
      contentType: "text/calendar; charset=utf-8",
    },
  ];
}

/**
 * @param {object} p
 * @param {string} p.bookerEmail
 * @param {string} p.bookerName
 * @param {string} [p.hostEmail]
 * @param {string} p.hostName
 * @param {string} p.eventTitle
 * @param {Date|string} p.startAt
 * @param {Date|string} p.endAt
 * @param {string} p.hostUsername
 * @param {string} p.eventSlug
 * @param {string} p.bookingId
 * @param {string} p.confirmationToken
 */
export async function sendBookingConfirmationEmail(p) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skipping booking confirmation email");
    return;
  }

  const manageUrl = manageBookingUrl({
    hostUsername: p.hostUsername,
    eventSlug: p.eventSlug,
    bookingId: p.bookingId,
    confirmationToken: p.confirmationToken,
  });
  const meetUrl = meetingPageUrl(p.hostUsername, p.eventSlug);
  const whenIst = formatWhenIstLine(p.startAt, p.endAt);
  const what = `${p.eventTitle} — ${p.hostName} & ${p.bookerName}`;
  const wherePlain = whereSummaryPlain(p);

  const inner = `
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-flex;width:48px;height:48px;border-radius:9999px;background:#dcfce7;align-items:center;justify-content:center;margin-bottom:16px;">
      <span style="color:#16a34a;font-size:24px;font-weight:700">&#10003;</span>
    </div>
    <h1 style="margin:0;font-size:22px;font-weight:600;color:#18181b;">Your event has been scheduled</h1>
    <p style="margin:12px 0 0;font-size:14px;color:#52525b;line-height:1.5;">We sent an email to everyone with this information.</p>
  </div>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
  <p style="margin:0 0 8px;font-size:13px;"><strong>What</strong></p>
  <p style="margin:0 0 20px;font-size:14px;color:#27272a;">${esc(what)}</p>
  <p style="margin:0 0 8px;font-size:13px;"><strong>When</strong></p>
  <p style="margin:0 0 20px;font-size:14px;color:#27272a;">${esc(whenIst)}</p>
  <p style="margin:0 0 8px;font-size:13px;"><strong>Who</strong></p>
  <p style="margin:0 4px 0 0;font-size:14px;color:#27272a;">${esc(p.hostName)} — Organizer<br/>
  <a href="mailto:${esc(p.hostEmail || "")}" style="color:#2563eb;text-decoration:underline;">${esc(p.hostEmail || "")}</a></p>
  <p style="margin:12px 0 0;font-size:14px;color:#27272a;">${esc(p.bookerName)} — Guest<br/>
  <a href="mailto:${esc(p.bookerEmail)}" style="color:#2563eb;text-decoration:underline;">${esc(p.bookerEmail)}</a></p>
  <div style="margin:20px 0 0;">${whereSectionHtml(p)}</div>
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:28px 0;" />
  <p style="margin:0;font-size:14px;color:#52525b;text-align:center;">Need to make a change?
  <a href="${esc(manageUrl)}" style="color:#18181b;font-weight:600;">Reschedule</a> or use your booking page to cancel.</p>`;

  const html = emailWrapper(inner);
  const ics = buildBookingIcs(p);
  const text = `Your event has been scheduled (${BRAND})\n\nWhat: ${what}\nWhen (IST): ${whenIst}\n\nWhere: ${wherePlain}\nBooking page: ${meetUrl}\nReschedule: ${manageUrl}`;

  const to = [p.bookerEmail];
  const cc =
    p.hostEmail && p.hostEmail.toLowerCase() !== p.bookerEmail.toLowerCase()
      ? [p.hostEmail]
      : undefined;

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    cc,
    subject: `Scheduled: ${p.eventTitle} · ${BRAND}`,
    html,
    text,
    attachments: icsAttachment(ics),
  });

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}

/**
 * @param {object} p
 * @param {string} p.bookerEmail
 * @param {string} p.bookerName
 * @param {string} p.eventTitle
 * @param {Date|string} p.startAt
 */
export async function sendBookingCancelledEmail(p) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skipping cancel email");
    return;
  }

  const whenIst = formatWhenIstShort(p.startAt);
  const inner = `
  <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#18181b;">Meeting cancelled</h1>
  <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.55;">Hi ${esc(p.bookerName)},</p>
  <p style="margin:16px 0 0;font-size:14px;color:#3f3f46;">Your booking for <strong>${esc(p.eventTitle)}</strong> (${esc(whenIst)} IST) has been cancelled.</p>`;
  const html = emailWrapper(inner);
  const text = `Meeting cancelled (${BRAND})\n\n${p.eventTitle}\n${whenIst} IST`;

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: [p.bookerEmail],
    subject: `Cancelled: ${p.eventTitle} · ${BRAND}`,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}

/**
 * @param {object} p
 * @param {string} p.bookerEmail
 * @param {string} p.bookerName
 * @param {string} [p.hostEmail]
 * @param {string} p.hostName
 * @param {string} p.eventTitle
 * @param {Date|string} p.startAt
 * @param {Date|string} p.endAt
 * @param {string} p.hostUsername
 * @param {string} p.eventSlug
 * @param {string} p.bookingId
 * @param {string} p.confirmationToken
 */
export async function sendBookingRescheduledEmail(p) {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY missing; skipping reschedule email");
    return;
  }

  const manageUrl = manageBookingUrl({
    hostUsername: p.hostUsername,
    eventSlug: p.eventSlug,
    bookingId: p.bookingId,
    confirmationToken: p.confirmationToken,
  });
  const meetUrl = meetingPageUrl(p.hostUsername, p.eventSlug);
  const whenIst = formatWhenIstLine(p.startAt, p.endAt);
  const wherePlain = whereSummaryPlain(p);

  const inner = `
  <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#18181b;">Meeting rescheduled</h1>
  <p style="margin:0;font-size:14px;color:#3f3f46;">Hi ${esc(p.bookerName)},</p>
  <p style="margin:16px 0 0;font-size:14px;color:#3f3f46;">Your <strong>${esc(p.eventTitle)}</strong> with ${esc(p.hostName)} has a new time (IST):</p>
  <p style="margin:12px 0 0;font-size:14px;font-weight:500;color:#18181b;">${esc(whenIst)}</p>
  <div style="margin:20px 0 0;">${whereSectionHtml(p)}</div>
  <p style="margin:16px 0 0;font-size:13px;color:#52525b;">Booking page: <a href="${esc(meetUrl)}" style="color:#2563eb;">${esc(meetUrl)}</a></p>
  <p style="margin:20px 0 0;font-size:14px;text-align:center;"><a href="${esc(manageUrl)}" style="display:inline-block;padding:12px 18px;background:#18181b;color:#fafafa;text-decoration:none;border-radius:10px;font-weight:600;">Manage booking</a></p>`;

  const html = emailWrapper(inner);
  const ics = buildBookingIcs(p);
  const text = `Meeting rescheduled (${BRAND})\n\nNew time (IST): ${whenIst}\nWhere: ${wherePlain}\n${meetUrl}\nManage: ${manageUrl}`;

  const to = [p.bookerEmail];
  const cc =
    p.hostEmail && p.hostEmail.toLowerCase() !== p.bookerEmail.toLowerCase()
      ? [p.hostEmail]
      : undefined;

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    cc,
    subject: `Updated: ${p.eventTitle} · ${BRAND}`,
    html,
    text,
    attachments: icsAttachment(ics),
  });

  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
}
