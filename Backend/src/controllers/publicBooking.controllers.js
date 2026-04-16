import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/prisma.js";
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
import {
  resolveAllowedDurationMinutes,
  resolveDurationMinutesForRequest,
} from "../utils/eventTypeDuration.util.js";
import { sanitizeGuestEmails } from "../utils/guestEmails.util.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";

const hashToken = (raw) =>
  crypto.createHash("sha256").update(raw, "utf8").digest("hex");

const mapBookingWithRelations = (booking) => {
  if (!booking) return booking;
  const { eventType, hostUser, ...rest } = withMongoId(booking);
  return {
    ...rest,
    ...(eventType && { eventTypeId: eventType }),
    ...(hostUser && { hostUserId: hostUser }),
  };
};

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
    durationOptions: resolveAllowedDurationMinutes(eventType),
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
    durationMinutes: req.query.durationMinutes,
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

  const guestEmails = sanitizeGuestEmails(req.body.guestEmails, {
    excludeEmails: [String(bookerEmail || "").trim(), host?.email].filter(
      Boolean
    ),
  });

  const bookingDurationMinutes = resolveDurationMinutesForRequest(
    eventType,
    req.body.durationMinutes
  );

  const start = new Date(startAt);
  const end = new Date(
    start.getTime() + bookingDurationMinutes * 60 * 1000
  );
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  let created;
  let rawToken;
  try {
    await prisma.$transaction(async (tx) => {
      const conflicts = await tx.booking.findMany({
        where: {
          hostUserId: host.id,
          status: { in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE] },
          blockedStartAt: { lt: blockedEnd },
          blockedEndAt: { gt: blockedStart },
        },
      });

      if (hasOverlap(blockedStart, blockedEnd, conflicts)) {
        throw new ApiError(409, "That time slot is no longer available");
      }

      const status = eventType.requiresConfirmation
        ? BOOKING_STATUS.TENTATIVE
        : BOOKING_STATUS.CONFIRMED;

      created = await tx.booking.create({
        data: {
          hostUserId: host._id,
          eventTypeId: eventType.id,
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
          guestEmails,
        },
      });

      rawToken = crypto.randomBytes(32).toString("hex");
      await tx.bookingToken.create({
        data: {
          bookingId: created.id,
          tokenHash: hashToken(rawToken),
          purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw e;
  }

  const populated = await prisma.booking.findUnique({
    where: { id: created.id },
    include: {
      eventType: {
        select: { title: true, slug: true, durationMinutes: true, description: true },
      },
      hostUser: {
        select: { username: true, fullName: true, email: true, avatar: true },
      },
    },
  });
  const bookingPayload = mapBookingWithRelations(populated);

  const et = bookingPayload.eventTypeId;
  const hu = bookingPayload.hostUserId;
  queueEmail(() =>
    sendBookingConfirmationEmail({
      bookerEmail: bookingPayload.bookerEmail,
      bookerName: bookingPayload.bookerName,
      hostEmail: hu?.email,
      hostName: hu?.fullName || hu?.username || "Host",
      eventTitle: et?.title || "Meeting",
      startAt: bookingPayload.startAt,
      endAt: bookingPayload.endAt,
      hostUsername: hu?.username || hostUsername,
      eventSlug: et?.slug || eventSlug,
      bookingId: String(bookingPayload._id),
      confirmationToken: rawToken,
      meetingWhereType: bookingPayload.meetingWhereType,
      meetingWhereDetail: bookingPayload.meetingWhereDetail,
      guestEmails: bookingPayload.guestEmails || [],
    })
  );

  return res.status(201).json(
    new ApiResponse(201, "Booking created", {
      booking: bookingPayload,
      confirmationToken: rawToken,
    })
  );
});

export const getBookingConfirmation = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token } = req.query;
  if (!token) throw new ApiError(400, "token query is required");

  const tokenDoc = await prisma.bookingToken.findFirst({
    where: {
      bookingId,
      tokenHash: hashToken(token),
      purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
      expiresAt: { gt: new Date() },
    },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      eventType: {
        select: { title: true, slug: true, durationMinutes: true, description: true },
      },
      hostUser: {
        select: { username: true, fullName: true, avatar: true, email: true },
      },
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "OK", { booking: mapBookingWithRelations(booking) }));
});

export const cancelPublicBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token, cancellationReason } = req.body;
  if (!token) throw new ApiError(400, "token is required");
  const tokenDoc = await prisma.bookingToken.findFirst({
    where: {
      bookingId,
      tokenHash: hashToken(token),
      purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
      expiresAt: { gt: new Date() },
    },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new ApiError(404, "Booking not found");
  const guestEmailsForNotify = [...(booking.guestEmails || [])];
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Already cancelled", { booking }));
  }
  if (booking.status === BOOKING_STATUS.RESCHEDULED) {
    throw new ApiError(400, "This booking was already rescheduled");
  }

  const populatedForEmail = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: { eventType: { select: { title: true } } },
  });

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: BOOKING_STATUS.CANCELLED,
      cancellationReason: cancellationReason ?? "",
    },
  });
  await prisma.bookingToken.deleteMany({ where: { bookingId: booking.id } });

  if (populatedForEmail) {
    queueEmail(() =>
      sendBookingCancelledEmail({
        bookerEmail: populatedForEmail.bookerEmail,
        bookerName: populatedForEmail.bookerName,
        eventTitle: populatedForEmail.eventType?.title || "Meeting",
        startAt: populatedForEmail.startAt,
        guestEmails: guestEmailsForNotify,
      })
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Booking cancelled", { booking: withMongoId(updated) }));
});

export const reschedulePublicBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { token, newStartAt } = req.body;
  if (!token || !newStartAt) {
    throw new ApiError(400, "token and newStartAt are required");
  }
  const tokenDoc = await prisma.bookingToken.findFirst({
    where: {
      bookingId,
      tokenHash: hashToken(token),
      purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
      expiresAt: { gt: new Date() },
    },
  });
  if (!tokenDoc) throw new ApiError(401, "Invalid or expired token");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { eventType: true },
  });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw new ApiError(400, "Cannot reschedule a cancelled booking");
  }
  if (booking.status === BOOKING_STATUS.RESCHEDULED) {
    throw new ApiError(400, "This booking was already rescheduled");
  }

  const eventType = booking.eventType;
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
  const prevDurationMinutes = Math.max(
    1,
    Math.round(
      (booking.endAt.getTime() - booking.startAt.getTime()) / (60 * 1000)
    )
  );
  const end = new Date(start.getTime() + prevDurationMinutes * 60 * 1000);
  const blockedStart = new Date(
    start.getTime() - eventType.bufferBeforeMinutes * 60 * 1000
  );
  const blockedEnd = new Date(
    end.getTime() + eventType.bufferAfterMinutes * 60 * 1000
  );

  const activeStatuses = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE];

  let created;
  let rawToken;
  try {
    await prisma.$transaction(async (tx) => {
      const others = await tx.booking.findMany({
        where: {
          hostUserId: booking.hostUserId,
          id: { not: booking.id },
          status: { in: activeStatuses },
          blockedStartAt: { lt: blockedEnd },
          blockedEndAt: { gt: blockedStart },
        },
      });

      if (hasOverlap(blockedStart, blockedEnd, others)) {
        throw new ApiError(409, "That time slot is no longer available");
      }

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BOOKING_STATUS.RESCHEDULED },
      });

      const status = eventType.requiresConfirmation
        ? BOOKING_STATUS.TENTATIVE
        : BOOKING_STATUS.CONFIRMED;

      const etId = eventType.id ?? booking.eventTypeId;
      created = await tx.booking.create({
        data: {
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
          rescheduledFromBookingId: booking.id,
          meetingWhereType,
          meetingWhereDetail,
          guestEmails: [...(booking.guestEmails || [])],
        },
      });

      await tx.bookingToken.deleteMany({ where: { bookingId: booking.id } });

      rawToken = crypto.randomBytes(32).toString("hex");
      await tx.bookingToken.create({
        data: {
          bookingId: created.id,
          tokenHash: hashToken(rawToken),
          purpose: BOOKING_TOKEN_PURPOSE.CONFIRMATION,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw e;
  }

  const populated = await prisma.booking.findUnique({
    where: { id: created.id },
    include: {
      eventType: {
        select: { title: true, slug: true, durationMinutes: true, description: true },
      },
      hostUser: {
        select: { username: true, fullName: true, email: true, avatar: true },
      },
    },
  });
  const bookingPayload = mapBookingWithRelations(populated);

  const etNew = bookingPayload.eventTypeId;
  const huNew = bookingPayload.hostUserId;
  queueEmail(() =>
    sendBookingRescheduledEmail({
      bookerEmail: bookingPayload.bookerEmail,
      bookerName: bookingPayload.bookerName,
      hostEmail: huNew?.email,
      hostName: huNew?.fullName || huNew?.username || "Host",
      eventTitle: etNew?.title || "Meeting",
      startAt: bookingPayload.startAt,
      endAt: bookingPayload.endAt,
      hostUsername: huNew?.username,
      eventSlug: etNew?.slug,
      bookingId: String(bookingPayload._id),
      confirmationToken: rawToken,
      meetingWhereType: bookingPayload.meetingWhereType,
      meetingWhereDetail: bookingPayload.meetingWhereDetail,
      guestEmails: bookingPayload.guestEmails || [],
    })
  );

  return res.status(200).json(
    new ApiResponse(200, "Booking rescheduled", {
      booking: bookingPayload,
      confirmationToken: rawToken,
    })
  );
});
