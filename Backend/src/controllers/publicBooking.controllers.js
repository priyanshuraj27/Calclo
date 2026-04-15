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

const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw, "utf8").digest("hex");

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

  const populated = await Booking.findById(created._id).populate(
    "eventTypeId",
    "title slug durationMinutes description"
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

  const tokenDoc = await BookingToken.findOne({
    bookingId,
    tokenHash: hashToken(token),
    purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
    expiresAt: { $gt: new Date() },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await Booking.findById(bookingId)
    .populate("eventTypeId")
    .populate("hostUserId", "username fullName avatar");

  return res.status(200).json(new ApiResponse(200, "OK", { booking }));
});
