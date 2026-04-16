import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/prisma.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";
import {
  sanitizeDurationOptionsArray,
  resolveDurationOptionsForCreate,
} from "../utils/eventTypeDuration.util.js";

const assertScheduleOwnedByHost = async (scheduleId, hostUserId) => {
  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { id: scheduleId, hostUserId },
  });
  if (!schedule) {
    throw new ApiError(400, "Invalid availability schedule for this host");
  }
  return schedule;
};

export const createEventType = asyncHandler(async (req, res) => {
  const hostUserId = req.user._id;
  const {
    title,
    description,
    slug,
    durationMinutes,
    hidden,
    active,
    color,
    schedulingType,
    requiresConfirmation,
    seatsPerTimeSlot,
    metadata,
    availabilityScheduleId,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    slotIntervalMinutes,
    minimumNoticeMinutes,
    bookingWindowDays,
    bookingQuestions,
    durationOptions,
  } = req.body;

  if (!title || !slug || !durationMinutes) {
    throw new ApiError(400, "title, slug, and durationMinutes are required");
  }

  let scheduleId = availabilityScheduleId;
  if (!scheduleId) {
    const def = await prisma.availabilitySchedule.findFirst({
      where: { hostUserId, isDefault: true },
    });
    if (!def) throw new ApiError(400, "Create an availability schedule first");
    scheduleId = def.id;
  }
  await assertScheduleOwnedByHost(scheduleId, hostUserId);

  const last = await prisma.eventType.findFirst({
    where: { hostUserId },
    orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
    select: { sortOrder: true },
  });
  const nextSortOrder = Math.max(0, Number(last?.sortOrder) || 0) + 1;

  const doc = await prisma.eventType.create({
    data: {
      hostUserId,
      title,
      description: description ?? "",
      slug: String(slug).trim(),
      durationMinutes: Number(durationMinutes),
      hidden: Boolean(hidden),
      active: active !== false,
      color: color ?? "#292929",
      schedulingType: schedulingType ?? null,
      requiresConfirmation: Boolean(requiresConfirmation),
      seatsPerTimeSlot:
        seatsPerTimeSlot == null ? null : Number(seatsPerTimeSlot),
      metadata: metadata ?? null,
      availabilityScheduleId: scheduleId,
      bufferBeforeMinutes: Number(bufferBeforeMinutes ?? 0),
      bufferAfterMinutes: Number(bufferAfterMinutes ?? 0),
      slotIntervalMinutes: Number(slotIntervalMinutes ?? 15),
      minimumNoticeMinutes: Number(minimumNoticeMinutes ?? 0),
      bookingWindowDays: Number(bookingWindowDays ?? 60),
      bookingQuestions: bookingQuestions ?? [],
      durationOptions: resolveDurationOptionsForCreate(
        durationMinutes,
        durationOptions
      ),
      sortOrder: nextSortOrder,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Event type created", withMongoId(doc)));
});

export const listMyEventTypes = asyncHandler(async (req, res) => {
  const items = await prisma.eventType.findMany({
    where: { hostUserId: req.user._id },
    include: {
      availabilitySchedule: {
        select: { id: true, name: true, timezone: true, isDefault: true },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }, { id: "asc" }],
  });
  const mapped = items.map(({ availabilitySchedule, ...rest }) => ({
    ...rest,
    availabilityScheduleId: availabilitySchedule,
  }));
  return res.status(200).json(new ApiResponse(200, "OK", withMongoId(mapped)));
});

export const getMyEventType = asyncHandler(async (req, res) => {
  const doc = await prisma.eventType.findFirst({
    where: { id: req.params.eventTypeId, hostUserId: req.user._id },
    include: { availabilitySchedule: true },
  });
  if (!doc) throw new ApiError(404, "Event type not found");
  const { availabilitySchedule, ...rest } = doc;
  return res
    .status(200)
    .json(
      new ApiResponse(200, "OK", {
        ...withMongoId(rest),
        availabilityScheduleId: withMongoId(availabilitySchedule),
      })
    );
});

export const updateMyEventType = asyncHandler(async (req, res) => {
  const doc = await prisma.eventType.findFirst({
    where: { id: req.params.eventTypeId, hostUserId: req.user._id },
  });
  if (!doc) throw new ApiError(404, "Event type not found");

  const updates = { ...req.body };
  delete updates.hostUserId;
  delete updates._id;
  delete updates.id;
  if (updates.availabilityScheduleId) {
    await assertScheduleOwnedByHost(
      updates.availabilityScheduleId,
      req.user._id
    );
  }

  if (updates.durationOptions !== undefined) {
    updates.durationOptions = sanitizeDurationOptionsArray(
      updates.durationOptions
    );
  }
  const saved = await prisma.eventType.update({
    where: { id: doc.id },
    data: updates,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Event type updated", withMongoId(saved)));
});

export const deleteMyEventType = asyncHandler(async (req, res) => {
  const doc = await prisma.eventType.findFirst({
    where: { id: req.params.eventTypeId, hostUserId: req.user._id },
  });
  if (!doc) throw new ApiError(404, "Event type not found");

  const bookingCount = await prisma.booking.count({
    where: { eventTypeId: doc.id },
  });
  if (bookingCount > 0) {
    throw new ApiError(
      400,
      "This event type has bookings and cannot be deleted. Cancel or move those bookings first."
    );
  }

  if (doc) {
    await prisma.eventType.delete({ where: { id: doc.id } });
  }
  return res.status(200).json(new ApiResponse(200, "Event type deleted", null));
});

export const listPublicEventTypesForHost = asyncHandler(async (req, res) => {
  const { hostUsername } = req.params;
  const host = await prisma.user.findUnique({
    where: { username: hostUsername.toLowerCase().trim() },
    select: { id: true, username: true, fullName: true, avatar: true },
  });
  if (!host) throw new ApiError(404, "Host not found");

  const items = await prisma.eventType.findMany({
    where: { hostUserId: host.id, active: true, hidden: false },
    select: {
      id: true,
      title: true,
      slug: true,
      durationMinutes: true,
      description: true,
      color: true,
      schedulingType: true,
      requiresConfirmation: true,
      durationOptions: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "OK", {
        host: withMongoId(host),
        eventTypes: withMongoId(items),
      })
    );
});
