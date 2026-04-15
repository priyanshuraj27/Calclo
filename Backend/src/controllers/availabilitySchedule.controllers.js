import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AvailabilitySchedule } from "../models/availabilitySchedule.models.js";
import { AvailabilityOverride } from "../models/availabilityOverride.models.js";
import { EventType } from "../models/eventType.models.js";
import { OVERRIDE_TYPE } from "../constants/scheduling.constants.js";

const clearOtherDefaults = async (hostUserId, exceptId) => {
  await AvailabilitySchedule.updateMany(
    { hostUserId, _id: { $ne: exceptId }, isDefault: true },
    { $set: { isDefault: false } }
  );
};

export const createSchedule = asyncHandler(async (req, res) => {
  const hostUserId = req.user._id;
  const { name, timezone, isDefault, weeklyRules } = req.body;
  if (!name || !timezone) {
    throw new ApiError(400, "name and timezone are required");
  }

  const doc = await AvailabilitySchedule.create({
    hostUserId,
    name,
    timezone,
    isDefault: Boolean(isDefault),
    weeklyRules: weeklyRules ?? {},
  });

  if (doc.isDefault) {
    await clearOtherDefaults(hostUserId, doc._id);
  }

  return res.status(201).json(new ApiResponse(201, "Schedule created", doc));
});

export const listMySchedules = asyncHandler(async (req, res) => {
  const items = await AvailabilitySchedule.find({ hostUserId: req.user._id }).sort(
    { isDefault: -1, updatedAt: -1 }
  );
  return res.status(200).json(new ApiResponse(200, "OK", items));
});

export const getMySchedule = asyncHandler(async (req, res) => {
  const doc = await AvailabilitySchedule.findOne({
    _id: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Schedule not found");
  return res.status(200).json(new ApiResponse(200, "OK", doc));
});

export const updateMySchedule = asyncHandler(async (req, res) => {
  const doc = await AvailabilitySchedule.findOne({
    _id: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Schedule not found");

  const { name, timezone, isDefault, weeklyRules } = req.body;
  if (name !== undefined) doc.name = name;
  if (timezone !== undefined) doc.timezone = timezone;
  if (weeklyRules !== undefined) doc.weeklyRules = weeklyRules;
  if (isDefault !== undefined) doc.isDefault = Boolean(isDefault);
  await doc.save();

  if (doc.isDefault) {
    await clearOtherDefaults(req.user._id, doc._id);
  }

  return res.status(200).json(new ApiResponse(200, "Schedule updated", doc));
});

export const deleteMySchedule = asyncHandler(async (req, res) => {
  const inUse = await EventType.exists({
    availabilityScheduleId: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (inUse) {
    throw new ApiError(
      400,
      "Schedule is assigned to one or more event types; reassign or delete them first"
    );
  }

  await AvailabilityOverride.deleteMany({ scheduleId: req.params.scheduleId });
  const doc = await AvailabilitySchedule.findOneAndDelete({
    _id: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Schedule not found");
  return res.status(200).json(new ApiResponse(200, "Schedule deleted", null));
});

export const addOverride = asyncHandler(async (req, res) => {
  const { date, type, intervals } = req.body;
  if (!date || !type) {
    throw new ApiError(400, "date and type are required");
  }
  if (!Object.values(OVERRIDE_TYPE).includes(type)) {
    throw new ApiError(400, "Invalid override type");
  }

  const schedule = await AvailabilitySchedule.findOne({
    _id: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!schedule) throw new ApiError(404, "Schedule not found");

  const doc = await AvailabilityOverride.findOneAndUpdate(
    { scheduleId: schedule._id, date },
    {
      $set: {
        hostUserId: req.user._id,
        type,
        intervals: intervals ?? [],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json(new ApiResponse(200, "Override saved", doc));
});

export const deleteOverride = asyncHandler(async (req, res) => {
  const doc = await AvailabilityOverride.findOneAndDelete({
    _id: req.params.overrideId,
    scheduleId: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!doc) throw new ApiError(404, "Override not found");
  return res.status(200).json(new ApiResponse(200, "Override deleted", null));
});

export const listOverrides = asyncHandler(async (req, res) => {
  const schedule = await AvailabilitySchedule.findOne({
    _id: req.params.scheduleId,
    hostUserId: req.user._id,
  });
  if (!schedule) throw new ApiError(404, "Schedule not found");
  const items = await AvailabilityOverride.find({
    scheduleId: schedule._id,
  }).sort({ date: 1 });
  return res.status(200).json(new ApiResponse(200, "OK", items));
});
