import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { prisma } from "../db/prisma.js";
import { BOOKING_STATUS } from "../constants/scheduling.constants.js";
import { BOOKING_TOKEN_PURPOSE } from "../constants/scheduling.constants.js";
import { hasOverlap } from "../services/slotGeneration.service.js";
import { resolveDurationMinutesForRequest } from "../utils/eventTypeDuration.util.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";
import { sendBookingCancelledEmail } from "../services/email.service.js";

const activeStatuses = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE];
const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw, "utf8").digest("hex");

function queueEmail(fn) {
  void Promise.resolve()
    .then(fn)
    .catch((err) => console.error("[email]", err?.message || err));
}

const tabFilter = (tab) => {
  const now = new Date();
  switch (tab) {
    case "upcoming":
      return {
        status: { in: activeStatuses },
        startAt: { gte: now },
      };
    case "past":
      return { status: BOOKING_STATUS.CONFIRMED, startAt: { lt: now } };
    case "cancelled":
      return { status: BOOKING_STATUS.CANCELLED };
    case "unconfirmed":
      return {
        status: BOOKING_STATUS.TENTATIVE,
        startAt: { gte: now },
      };
    default:
      return {
        status: { in: activeStatuses },
        startAt: { gte: now },
      };
  }
};

export const listMyBookings = asyncHandler(async (req, res) => {
  const tab = req.query.tab || "upcoming";
  const filter = { hostUserId: req.user._id, ...tabFilter(tab) };
  const items = await prisma.booking.findMany({
    where: filter,
    include: {
      eventType: {
        select: {
          id: true,
          title: true,
          slug: true,
          durationMinutes: true,
          durationOptions: true,
          bufferBeforeMinutes: true,
          bufferAfterMinutes: true,
          requiresConfirmation: true,
        },
      },
    },
    orderBy: { startAt: tab === "past" ? "desc" : "asc" },
    take: 100,
  });
  const mapped = items.map(({ eventType, ...rest }) => ({
    ...rest,
    eventTypeId: eventType,
  }));
  return res.status(200).json(new ApiResponse(200, "OK", withMongoId(mapped)));
});

export const cancelMyBooking = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const doc = await prisma.booking.findFirst({
    where: { id: req.params.bookingId, hostUserId: req.user._id },
    include: { eventType: { select: { title: true } } },
  });
  if (!doc) throw new ApiError(404, "Booking not found");
  if (doc.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Booking already cancelled");
  }
  const updated = await prisma.booking.update({
    where: { id: doc.id },
    data: {
      status: BOOKING_STATUS.CANCELLED,
      cancellationReason: cancellationReason ?? "",
    },
  });

  queueEmail(() =>
    sendBookingCancelledEmail({
      bookerEmail: doc.bookerEmail,
      bookerName: doc.bookerName,
      eventTitle: doc.eventType?.title || "Meeting",
      startAt: doc.startAt,
      guestEmails: [...(doc.guestEmails || [])],
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking cancelled", withMongoId(updated)));
});

export const rescheduleMyBooking = asyncHandler(async (req, res) => {
  const { newStartAt, durationMinutes: durationBody } = req.body;
  if (!newStartAt) throw new ApiError(400, "newStartAt is required (ISO string)");

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.bookingId, hostUserId: req.user._id },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot reschedule a cancelled booking");
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id: booking.eventTypeId },
  });
  if (!eventType) throw new ApiError(404, "Event type missing");

  const prevLen = Math.max(
    1,
    Math.round(
      (new Date(booking.endAt).getTime() - new Date(booking.startAt).getTime()) /
        60000
    )
  );
  const chosenMinutes = resolveDurationMinutesForRequest(
    eventType,
    durationBody != null && durationBody !== "" ? durationBody : prevLen
  );

  const start = new Date(newStartAt);
  const end = new Date(start.getTime() + chosenMinutes * 60 * 1000);
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  const others = await prisma.booking.findMany({
    where: {
      hostUserId: req.user._id,
      id: { not: booking.id },
      status: { in: activeStatuses },
      blockedStartAt: { lt: blockedEnd },
      blockedEndAt: { gt: blockedStart },
    },
  });

  if (hasOverlap(blockedStart, blockedEnd, others)) {
    throw new ApiError(409, "That time slot is no longer available");
  }

  const prevId = booking.id;
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: BOOKING_STATUS.RESCHEDULED },
  });

  const created = await prisma.booking.create({
    data: {
      hostUserId: booking.hostUserId,
      eventTypeId: booking.eventTypeId,
      status: eventType.requiresConfirmation
        ? BOOKING_STATUS.TENTATIVE
        : BOOKING_STATUS.CONFIRMED,
      startAt: start,
      endAt: end,
      blockedStartAt: blockedStart,
      blockedEndAt: blockedEnd,
      bookerName: booking.bookerName,
      bookerEmail: booking.bookerEmail,
      answers: booking.answers,
      notes: booking.notes,
      meetingWhereType: booking.meetingWhereType || "cal-video",
      meetingWhereDetail: booking.meetingWhereDetail || "",
      guestEmails: [...(booking.guestEmails || [])],
      rescheduledFromBookingId: prevId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking rescheduled", created));
});

/** In-place: same start, new end + blocked window from chosen length. */
export const updateBookingDuration = asyncHandler(async (req, res) => {
  const { durationMinutes: durationBody } = req.body;
  if (durationBody == null || durationBody === "") {
    throw new ApiError(400, "durationMinutes is required");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.bookingId, hostUserId: req.user._id },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot update a cancelled booking");
  }
  if (!activeStatuses.includes(booking.status)) {
    throw new ApiError(400, "Can only update duration for confirmed or tentative bookings");
  }

  const eventType = await prisma.eventType.findUnique({
    where: { id: booking.eventTypeId },
  });
  if (!eventType) throw new ApiError(404, "Event type missing");

  const chosenMinutes = resolveDurationMinutesForRequest(
    eventType,
    durationBody
  );

  const start = new Date(booking.startAt);
  const end = new Date(start.getTime() + chosenMinutes * 60 * 1000);
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  const others = await prisma.booking.findMany({
    where: {
      hostUserId: req.user._id,
      id: { not: booking.id },
      status: { in: activeStatuses },
      blockedStartAt: { lt: blockedEnd },
      blockedEndAt: { gt: blockedStart },
    },
  });

  if (hasOverlap(blockedStart, blockedEnd, others)) {
    throw new ApiError(409, "That time range is no longer available");
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      endAt: end,
      blockedStartAt: blockedStart,
      blockedEndAt: blockedEnd,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Duration updated", withMongoId(updated)));
});

/**
 * Creates a short-lived public manage token for host-triggered reschedule flow.
 * Frontend can redirect to /book/:host/:slug?reschedule=1&bookingId=...&token=...
 */
export const createMyBookingManageToken = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.bookingId, hostUserId: req.user._id },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot manage a cancelled booking");
  }
  if (booking.status === BOOKING_STATUS.RESCHEDULED) {
    throw new ApiError(400, "This booking was already rescheduled");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  await prisma.bookingToken.deleteMany({
    where: {
      bookingId: booking.id,
      purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
    },
  });
  await prisma.bookingToken.create({
    data: {
      bookingId: booking.id,
      tokenHash: hashToken(rawToken),
      purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Manage token created", { token: rawToken }));
});
