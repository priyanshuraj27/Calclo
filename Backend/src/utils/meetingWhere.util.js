import { ApiError } from "./ApiError.js";
import { MEETING_WHERE_TYPES } from "../constants/scheduling.constants.js";

function isHttpUrl(s) {
  if (!s || typeof s !== "string") return false;
  return /^https?:\/\//i.test(s.trim());
}

/**
 * @param {object} body
 * @param {string} [body.meetingWhereType]
 * @param {string} [body.meetingWhereDetail]
 * @returns {{ type: string, detail: string }}
 */
export function normalizeMeetingWhere(body) {
  const rawType = body?.meetingWhereType ?? "cal-video";
  const type = String(rawType).trim();
  if (!MEETING_WHERE_TYPES.includes(type)) {
    throw new ApiError(400, "Invalid meetingWhereType");
  }
  let detail = String(body?.meetingWhereDetail ?? "").trim();
  if (detail.length > 2000) {
    throw new ApiError(400, "meetingWhereDetail is too long");
  }

  if (type === "cal-video") {
    detail = "";
  }
  if (type === "zoom" || type === "custom-link") {
    if (!isHttpUrl(detail)) {
      throw new ApiError(
        400,
        "A valid https meeting link is required for this location type"
      );
    }
  }
  if (type === "google-meet") {
    if (detail && !isHttpUrl(detail)) {
      throw new ApiError(400, "Google Meet link must start with https://");
    }
  }
  if (type === "phone" || type === "in-person") {
    if (!detail) {
      throw new ApiError(
        400,
        "Please enter a phone number or address for this location type"
      );
    }
  }

  return { type, detail };
}

/**
 * @param {{ type: string, detail: string, bookingPageUrl: string }} p
 */
export function resolveWhereParts(p) {
  const { type, detail, bookingPageUrl } = p;
  const d = (detail || "").trim();
  const book = bookingPageUrl || "";

  switch (type) {
    case "cal-video":
      return {
        displayLabel: "Cal Video",
        linkHref: book,
        plainNote: "",
        icsLocation: book,
        icsUrl: book,
      };
    case "google-meet": {
      const link = isHttpUrl(d) ? d.trim() : book;
      return {
        displayLabel: "Google Meet",
        linkHref: link,
        plainNote: isHttpUrl(d) ? "" : "",
        icsLocation: link,
        icsUrl: link,
      };
    }
    case "zoom":
      return {
        displayLabel: "Zoom",
        linkHref: d,
        plainNote: "",
        icsLocation: d,
        icsUrl: d,
      };
    case "phone":
      return {
        displayLabel: "Phone call",
        linkHref: "",
        plainNote: d,
        icsLocation: d,
        icsUrl: book,
      };
    case "in-person":
      return {
        displayLabel: "In person",
        linkHref: "",
        plainNote: d,
        icsLocation: d,
        icsUrl: book,
      };
    case "custom-link":
      return {
        displayLabel: "Custom link",
        linkHref: d,
        plainNote: "",
        icsLocation: d,
        icsUrl: d,
      };
    default:
      return {
        displayLabel: "Cal Video",
        linkHref: book,
        plainNote: "",
        icsLocation: book,
        icsUrl: book,
      };
  }
}
