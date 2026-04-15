export const BOOKING_STATUS = {
  CONFIRMED: "CONFIRMED",
  TENTATIVE: "TENTATIVE",
  CANCELLED: "CANCELLED",
  RESCHEDULED: "RESCHEDULED",
};

export const OVERRIDE_TYPE = {
  CLOSED: "CLOSED",
  CUSTOM_HOURS: "CUSTOM_HOURS",
};

export const BOOKING_TOKEN_PURPOSE = {
  CONFIRMATION: "CONFIRMATION",
  CANCEL: "CANCEL",
  RESCHEDULE: "RESCHEDULE",
};

/** Where the meeting happens (booker picks at booking time). */
export const MEETING_WHERE_TYPES = [
  "cal-video",
  "google-meet",
  "zoom",
  "phone",
  "in-person",
  "custom-link",
];

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
