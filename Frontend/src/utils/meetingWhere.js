function isHttpUrl(s) {
  if (!s || typeof s !== "string") return false;
  return /^https?:\/\//i.test(s.trim());
}

/**
 * @param {string} type
 * @param {string} detail
 * @param {string} bookingPageUrl
 */
export function resolveBookingWhereParts(type, detail, bookingPageUrl) {
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
        plainNote: "",
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

export const MEETING_WHERE_OPTIONS = [
  { value: "cal-video", label: "Cal Video (calclo.com)", needsDetail: false },
  {
    value: "google-meet",
    label: "Google Meet",
    needsDetail: "optional",
    detailLabel: "Meet link (optional)",
    detailPlaceholder: "https://meet.google.com/…",
  },
  {
    value: "zoom",
    label: "Zoom",
    needsDetail: true,
    detailLabel: "Zoom join URL",
    detailPlaceholder: "https://zoom.us/j/…",
  },
  {
    value: "phone",
    label: "Phone call",
    needsDetail: true,
    detailLabel: "Phone number",
    detailPlaceholder: "+91 …",
    inputType: "tel",
  },
  {
    value: "in-person",
    label: "In person",
    needsDetail: true,
    detailLabel: "Address or place",
    detailPlaceholder: "Street, city…",
    inputType: "text",
  },
  {
    value: "custom-link",
    label: "Custom link",
    needsDetail: true,
    detailLabel: "Meeting URL",
    detailPlaceholder: "https://…",
  },
];
