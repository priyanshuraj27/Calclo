import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.models.js";
import { EventType } from "../models/eventType.models.js";
import { BOOKING_STATUS } from "../constants/scheduling.constants.js";
import { hasOverlap } from "../services/slotGeneration.service.js";

const activeStatuses = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE];

const tabFilter = (tab) => {
  const now = new Date();
  switch (tab) {
    case "upcoming":
      return {
        status: { $in: activeStatuses },
        startAt: { $gte: now },
      };
    case "past":
      return { status: BOOKING_STATUS.CONFIRMED, startAt: { $lt: now } };
    case "cancelled":
      return { status: BOOKING_STATUS.CANCELLED };
    case "unconfirmed":
      return {
        status: BOOKING_STATUS.TENTATIVE,
        startAt: { $gte: now },
      };
    default:
      return {
        status: { $in: activeStatuses },
        startAt: { $gte: now },
      };
  }
};

export const listMyBookings = asyncHandler(async (req, res) => {
  const tab = req.query.tab || "upcoming";
  const filter = { hostUserId: req.user._id, ...tabFilter(tab) };
  const items = await Booking.find(filter)
    .populate("eventTypeId", "title slug durationMinutes")
    .sort({ startAt: tab === "past" ? -1 : 1 })
    .limit(100);
  return res.status(200).json(new ApiResponse(200, "OK", items));
});

export const cancelMyBooking = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;
  const doc = await Booking.findOne({
    _id: req.params.bookingId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Booking not found");
  if (doc.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Booking already cancelled");
  }
  doc.status = BOOKING_STATUS.CANCELLED;
  doc.cancellationReason = cancellationReason ?? "";
  await doc.save();
  return res.status(200).json(new ApiResponse(200, "Booking cancelled", doc));
});

export const rescheduleMyBooking = asyncHandler(async (req, res) => {
  const { newStartAt } = req.body;
  if (!newStartAt) throw new ApiError(400, "newStartAt is required (ISO string)");

  const booking = await Booking.findOne({
    _id: req.params.bookingId,
    hostUserId: req.user._id,
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot reschedule a cancelled booking");
  }

  const eventType = await EventType.findById(booking.eventTypeId);
  if (!eventType) throw new ApiError(404, "Event type missing");

  const start = new Date(newStartAt);
  const end = new Date(
    start.getTime() + eventType.durationMinutes * 60 * 1000
  );
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  const others = await Booking.find({
    hostUserId: req.user._id,
    _id: { $ne: booking._id },
    status: { $in: activeStatuses },
    blockedStartAt: { $lt: blockedEnd },
    blockedEndAt: { $gt: blockedStart },
  }).lean();

  if (hasOverlap(blockedStart, blockedEnd, others)) {
    throw new ApiError(409, "That time slot is no longer available");
  }

  const prevId = booking._id;
  booking.status = BOOKING_STATUS.RESCHEDULED;
  await booking.save();

  const created = await Booking.create({
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
    rescheduledFromBookingId: prevId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking rescheduled", created));
});
