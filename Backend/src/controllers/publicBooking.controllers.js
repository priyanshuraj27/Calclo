import crypto from "crypto";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Booking } from "../models/booking.models.js";
import { BookingToken } from "../models/bookingToken.models.js";
import { BOOKING_STATUS } from "../constants/scheduling.constants.js";
import { BOOKING_TOKEN_PURPOSE } from "../constants/scheduling.constants.js";
import {
  getSlotsForPublicEvent,
  loadPublicEventContext,
  hasOverlap,
} from "../services/slotGeneration.service.js";
import {
  sendBookingConfirmationEmail,
  sendBookingCancelledEmail,
  sendBookingRescheduledEmail,
} from "../services/email.service.js";
import { normalizeMeetingWhere } from "../utils/meetingWhere.util.js";

const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw, "utf8").digest("hex");

function queueEmail(fn) {
  void Promise.resolve()
    .then(fn)
    .catch((err) => console.error("[email]", err?.message || err));
}

export const getPublicEvent = asyncHandler(async (req, res) => {
  const { hostUsername, eventSlug } = req.params;
  const { host, eventType } = await loadPublicEventContext(
    hostUsername,
    eventSlug
  );
  if (!host || !eventType) throw new ApiError(404, "Event not found");

  const safe = {
    title: eventType.title,
    description: eventType.description,
    durationMinutes: eventType.durationMinutes,
    slug: eventType.slug,
    host: {
      username: host.username,
      fullName: host.fullName,
      avatar: host.avatar,
    },
    bookingQuestions: eventType.bookingQuestions ?? [],
  };
  return res.status(200).json(new ApiResponse(200, "OK", safe));
});

export const getPublicSlots = asyncHandler(async (req, res) => {
  const { hostUsername, eventSlug } = req.params;
  const { date } = req.query;
  if (!date) throw new ApiError(400, "Query ?date=YYYY-MM-DD is required");

  const result = await getSlotsForPublicEvent({
    hostUsername,
    eventSlug,
    date,
  });
  if (result.notFound) throw new ApiError(404, "Event not found");
  if (result.invalidDate) throw new ApiError(400, "Invalid date");

  return res.status(200).json(new ApiResponse(200, "OK", { slots: result.slots }));
});

export const createPublicBooking = asyncHandler(async (req, res) => {
  const { hostUsername, eventSlug } = req.params;
  const { startAt, bookerName, bookerEmail, answers, notes } = req.body;

  if (!startAt || !bookerName || !bookerEmail) {
    throw new ApiError(400, "startAt, bookerName, and bookerEmail are required");
  }

  const { type: meetingWhereType, detail: meetingWhereDetail } =
    normalizeMeetingWhere({
      meetingWhereType: req.body.meetingWhereType,
      meetingWhereDetail: req.body.meetingWhereDetail,
    });

  const { host, eventType } = await loadPublicEventContext(
    hostUsername,
    eventSlug
  );
  if (!host || !eventType) throw new ApiError(404, "Event not found");

  const start = new Date(startAt);
  const end = new Date(
    start.getTime() + eventType.durationMinutes * 60 * 1000
  );
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  const session = await mongoose.startSession();
  let created;
  let rawToken;
  try {
    await session.withTransaction(async () => {
      const conflicts = await Booking.find({
        hostUserId: host._id,
        status: {
          $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE],
        },
        blockedStartAt: { $lt: blockedEnd },
        blockedEndAt: { $gt: blockedStart },
      })
        .session(session)
        .lean();

      if (hasOverlap(blockedStart, blockedEnd, conflicts)) {
        throw new ApiError(409, "That time slot is no longer available");
      }

      const status = eventType.requiresConfirmation
        ? BOOKING_STATUS.TENTATIVE
        : BOOKING_STATUS.CONFIRMED;

      const createdDocs = await Booking.create(
        [
          {
            hostUserId: host._id,
            eventTypeId: eventType._id,
            status,
            startAt: start,
            endAt: end,
            blockedStartAt: blockedStart,
            blockedEndAt: blockedEnd,
            bookerName,
            bookerEmail,
            answers: answers ?? [],
            notes: notes ?? "",
            meetingWhereType,
            meetingWhereDetail,
          },
        ],
        { session }
      );
      created = createdDocs[0];

      rawToken = crypto.randomBytes(32).toString("hex");
      await BookingToken.create(
        [
          {
            bookingId: created._id,
            tokenHash: hashToken(rawToken),
            purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
        { session }
      );
    });
  } catch (e) {
    if (e.code === 11000) {
      throw new ApiError(409, "That time slot is no longer available");
    }
    throw e;
  } finally {
    session.endSession();
  }

  const populated = await Booking.findById(created._id)
    .populate("eventTypeId", "title slug durationMinutes description")
    .populate("hostUserId", "username fullName email avatar");

  const et = populated.eventTypeId;
  const hu = populated.hostUserId;
  queueEmail(() =>
    sendBookingConfirmationEmail({
      bookerEmail: populated.bookerEmail,
      bookerName: populated.bookerName,
      hostEmail: hu?.email,
      hostName: hu?.fullName || hu?.username || "Host",
      eventTitle: et?.title || "Meeting",
      startAt: populated.startAt,
      endAt: populated.endAt,
      hostUsername: hu?.username || hostUsername,
      eventSlug: et?.slug || eventSlug,
      bookingId: String(populated._id),
      confirmationToken: rawToken,
      meetingWhereType: populated.meetingWhereType,
      meetingWhereDetail: populated.meetingWhereDetail,
    })
  );

  return res.status(201).json(
    new ApiResponse(201, "Booking created", {
      booking: populated,
      confirmationToken: rawToken,
    })
  );
});

export const getBookingConfirmation = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token } = req.query;
  if (!token) throw new ApiError(400, "token query is required");

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const tokenDoc = await BookingToken.findOne({
    bookingId,
    tokenHash: hashToken(token),
    purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await Booking.findById(bookingId)
    .populate("eventTypeId", "title slug durationMinutes description")
    .populate("hostUserId", "username fullName avatar email");

  return res.status(200).json(new ApiResponse(200, "OK", { booking }));
});

export const cancelPublicBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token, cancellationReason } = req.body;
  if (!token) throw new ApiError(400, "token is required");
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const tokenDoc = await BookingToken.findOne({
    bookingId,
    tokenHash: hashToken(token),
    purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Already cancelled", { booking }));
  }
  if (booking.status === BOOKING_STATUS.RESCHEDULED) {
    throw new ApiError(400, "This booking was already rescheduled");
  }

  const populatedForEmail = await Booking.findById(booking._id)
    .populate("eventTypeId", "title")
    .lean();

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancellationReason = cancellationReason ?? "";
  await booking.save();
  await BookingToken.deleteMany({ bookingId: booking._id });

  if (populatedForEmail) {
    queueEmail(() =>
      sendBookingCancelledEmail({
        bookerEmail: populatedForEmail.bookerEmail,
        bookerName: populatedForEmail.bookerName,
        eventTitle: populatedForEmail.eventTypeId?.title || "Meeting",
        startAt: populatedForEmail.startAt,
      })
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking cancelled", { booking }));
});

export const reschedulePublicBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token, newStartAt } = req.body;
  if (!token || !newStartAt) {
    throw new ApiError(400, "token and newStartAt are required");
  }
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const tokenDoc = await BookingToken.findOne({
    bookingId,
    tokenHash: hashToken(token),
    purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await Booking.findById(bookingId).populate("eventTypeId");
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot reschedule a cancelled booking");
  }
  if (booking.status === BOOKING_STATUS.RESCHEDULED) {
    throw new ApiError(400, "This booking was already rescheduled");
  }

  const eventType = booking.eventTypeId;
  if (!eventType) throw new ApiError(404, "Event type missing");

  const whereInput = {
    meetingWhereType:
      req.body.meetingWhereType ?? booking.meetingWhereType ?? "cal-video",
    meetingWhereDetail:
      req.body.meetingWhereDetail !== undefined &&
      req.body.meetingWhereDetail !== null
        ? req.body.meetingWhereDetail
        : (booking.meetingWhereDetail ?? ""),
  };
  const { type: meetingWhereType, detail: meetingWhereDetail } =
    normalizeMeetingWhere(whereInput);

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

  const activeStatuses = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE];

  const session = await mongoose.startSession();
  let created;
  let rawToken;
  try {
    await session.withTransaction(async () => {
      const others = await Booking.find({
        hostUserId: booking.hostUserId,
        _id: { $ne: booking._id },
        status: { $in: activeStatuses },
        blockedStartAt: { $lt: blockedEnd },
        blockedEndAt: { $gt: blockedStart },
      })
        .session(session)
        .lean();

      if (hasOverlap(blockedStart, blockedEnd, others)) {
        throw new ApiError(409, "That time slot is no longer available");
      }

      booking.status = BOOKING_STATUS.RESCHEDULED;
      await booking.save({ session });

      const status = eventType.requiresConfirmation
        ? BOOKING_STATUS.TENTATIVE
        : BOOKING_STATUS.CONFIRMED;

      const etId = eventType._id ?? booking.eventTypeId;

      const createdArr = await Booking.create(
        [
          {
            hostUserId: booking.hostUserId,
            eventTypeId: etId,
            status,
            startAt: start,
            endAt: end,
            blockedStartAt: blockedStart,
            blockedEndAt: blockedEnd,
            bookerName: booking.bookerName,
            bookerEmail: booking.bookerEmail,
            answers: booking.answers ?? [],
            notes: booking.notes ?? "",
            rescheduledFromBookingId: booking._id,
            meetingWhereType,
            meetingWhereDetail,
          },
        ],
        { session }
      );
      created = createdArr[0];

      await BookingToken.deleteMany({ bookingId: booking._id }, { session });

      rawToken = crypto.randomBytes(32).toString("hex");
      await BookingToken.create(
        [
          {
            bookingId: created._id,
            tokenHash: hashToken(rawToken),
            purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
        { session }
      );
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e.code === 11000) {
      throw new ApiError(409, "That time slot is no longer available");
    }
    throw e;
  } finally {
    session.endSession();
  }

  const populated = await Booking.findById(created._id)
    .populate("eventTypeId", "title slug durationMinutes description")
    .populate("hostUserId", "username fullName email avatar");

  const etNew = populated.eventTypeId;
  const huNew = populated.hostUserId;
  queueEmail(() =>
    sendBookingRescheduledEmail({
      bookerEmail: populated.bookerEmail,
      bookerName: populated.bookerName,
      hostEmail: huNew?.email,
      hostName: huNew?.fullName || huNew?.username || "Host",
      eventTitle: etNew?.title || "Meeting",
      startAt: populated.startAt,
      endAt: populated.endAt,
      hostUsername: huNew?.username,
      eventSlug: etNew?.slug,
      bookingId: String(populated._id),
      confirmationToken: rawToken,
      meetingWhereType: populated.meetingWhereType,
      meetingWhereDetail: populated.meetingWhereDetail,
    })
  );

  return res.status(200).json(
    new ApiResponse(200, "Booking rescheduled", {
      booking: populated,
      confirmationToken: rawToken,
    })
  );
});
