import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { EventType } from "../models/eventType.models.js";
import { AvailabilitySchedule } from "../models/availabilitySchedule.models.js";
import { User } from "../models/user.models.js";
import {
  sanitizeDurationOptionsArray,
  resolveDurationOptionsForCreate,
} from "../utils/eventTypeDuration.util.js";

const assertScheduleOwnedByHost = async (scheduleId, hostUserId) => {
  const schedule = await AvailabilitySchedule.findOne({
    _id: scheduleId,
    hostUserId,
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
    const def = await AvailabilitySchedule.findOne({
      hostUserId,
      isDefault: true,
    });
    if (!def) throw new ApiError(400, "Create an availability schedule first");
    scheduleId = def._id;
  }
  await assertScheduleOwnedByHost(scheduleId, hostUserId);

  const doc = await EventType.create({
    hostUserId,
    title,
    description: description ?? "",
    slug: String(slug).trim(),
    durationMinutes,
    hidden: Boolean(hidden),
    active: active !== false,
    color,
    schedulingType,
    requiresConfirmation,
    seatsPerTimeSlot,
    metadata,
    availabilityScheduleId: scheduleId,
    bufferBeforeMinutes,
    bufferAfterMinutes,
    slotIntervalMinutes,
    minimumNoticeMinutes,
    bookingWindowDays,
    bookingQuestions: bookingQuestions ?? [],
    durationOptions: resolveDurationOptionsForCreate(
      durationMinutes,
      durationOptions
    ),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Event type created", doc));
});

export const listMyEventTypes = asyncHandler(async (req, res) => {
  const items = await EventType.find({ hostUserId: req.user._id })
    .populate("availabilityScheduleId", "name timezone isDefault")
    .sort({ updatedAt: -1 });
  return res.status(200).json(new ApiResponse(200, "OK", items));
});

export const getMyEventType = asyncHandler(async (req, res) => {
  const doc = await EventType.findOne({
    _id: req.params.eventTypeId,
    hostUserId: req.user._id,
  }).populate("availabilityScheduleId");
  if (!doc) throw new ApiError(404, "Event type not found");
  return res.status(200).json(new ApiResponse(200, "OK", doc));
});

export const updateMyEventType = asyncHandler(async (req, res) => {
  const doc = await EventType.findOne({
    _id: req.params.eventTypeId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Event type not found");

  const updates = { ...req.body };
  delete updates.hostUserId;
  delete updates._id;
  if (updates.availabilityScheduleId) {
    await assertScheduleOwnedByHost(
      updates.availabilityScheduleId,
      req.user._id
    );
  }

  Object.assign(doc, updates);
  if (updates.durationOptions !== undefined) {
    doc.durationOptions = sanitizeDurationOptionsArray(updates.durationOptions);
  }
  await doc.save();

  return res.status(200).json(new ApiResponse(200, "Event type updated", doc));
});

export const deleteMyEventType = asyncHandler(async (req, res) => {
  const doc = await EventType.findOneAndDelete({
    _id: req.params.eventTypeId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Event type not found");
  return res.status(200).json(new ApiResponse(200, "Event type deleted", null));
});

export const listPublicEventTypesForHost = asyncHandler(async (req, res) => {
  const { hostUsername } = req.params;
  const host = await User.findOne({
    username: hostUsername.toLowerCase().trim(),
  }).select("_id username fullName avatar");
  if (!host) throw new ApiError(404, "Host not found");

  const items = await EventType.find({
    hostUserId: host._id,
    active: true,
    hidden: false,
  })
    .select(
      "title slug durationMinutes description color schedulingType requiresConfirmation"
    )
    .sort({ title: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "OK", { host, eventTypes: items }));
});
