import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OVERRIDE_TYPE } from "../constants/scheduling.constants.js";
import { prisma } from "../db/prisma.js";
import { withMongoId } from "../utils/prismaNormalize.util.js";

const clearOtherDefaults = async (hostUserId, exceptId) => {
  await prisma.availabilitySchedule.updateMany({
    where: { hostUserId, id: { not: exceptId }, isDefault: true },
    data: { isDefault: false },
  });
};

export const createSchedule = asyncHandler(async (req, res) => {
  const hostUserId = req.user._id;
  const { name, timezone, isDefault, weeklyRules } = req.body;
  if (!name || !timezone) {
    throw new ApiError(400, "name and timezone are required");
  }

  const doc = await prisma.availabilitySchedule.create({
    data: {
      hostUserId,
      name,
      timezone,
      isDefault: Boolean(isDefault),
      weeklyRules: weeklyRules ?? {},
    },
  });

  if (doc.isDefault) {
    await clearOtherDefaults(hostUserId, doc.id);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Schedule created", withMongoId(doc)));
});

export const listMySchedules = asyncHandler(async (req, res) => {
  const items = await prisma.availabilitySchedule.findMany({
    where: { hostUserId: req.user._id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return res.status(200).json(new ApiResponse(200, "OK", withMongoId(items)));
});

export const getMySchedule = asyncHandler(async (req, res) => {
  const doc = await prisma.availabilitySchedule.findFirst({
    where: { id: req.params.scheduleId, hostUserId: req.user._id },
  });
  if (!doc) throw new ApiError(404, "Schedule not found");
  return res.status(200).json(new ApiResponse(200, "OK", withMongoId(doc)));
});

export const updateMySchedule = asyncHandler(async (req, res) => {
  const doc = await prisma.availabilitySchedule.findFirst({
    where: { id: req.params.scheduleId, hostUserId: req.user._id },
  });
  if (!doc) throw new ApiError(404, "Schedule not found");

  const { name, timezone, isDefault, weeklyRules } = req.body;
  const updated = await prisma.availabilitySchedule.update({
    where: { id: doc.id },
    data: {
      ...(name !== undefined && { name }),
      ...(timezone !== undefined && { timezone }),
      ...(weeklyRules !== undefined && { weeklyRules }),
      ...(isDefault !== undefined && { isDefault: Boolean(isDefault) }),
    },
  });

  if (updated.isDefault) {
    await clearOtherDefaults(req.user._id, updated.id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Schedule updated", withMongoId(updated)));
});

export const deleteMySchedule = asyncHandler(async (req, res) => {
  const inUse = await prisma.eventType.findFirst({
    where: {
      availabilityScheduleId: req.params.scheduleId,
      hostUserId: req.user._id,
    },
    select: { id: true },
  });
  if (inUse) {
    throw new ApiError(
      400,
      "Schedule is assigned to one or more event types; reassign or delete them first"
    );
  }

  await prisma.availabilityOverride.deleteMany({
    where: { scheduleId: req.params.scheduleId },
  });
  const doc = await prisma.availabilitySchedule.findFirst({
    where: { id: req.params.scheduleId, hostUserId: req.user._id },
  });
  if (doc) {
    await prisma.availabilitySchedule.delete({ where: { id: doc.id } });
  }
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

  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { id: req.params.scheduleId, hostUserId: req.user._id },
  });
  if (!schedule) throw new ApiError(404, "Schedule not found");

  const doc = await prisma.availabilityOverride.upsert({
    where: { scheduleId_date: { scheduleId: schedule.id, date } },
    create: {
      hostUserId: req.user._id,
      scheduleId: schedule.id,
      date,
      type,
      intervals: intervals ?? [],
    },
    update: {
      hostUserId: req.user._id,
      type,
      intervals: intervals ?? [],
    },
  });

  return res.status(200).json(new ApiResponse(200, "Override saved", doc));
});

export const deleteOverride = asyncHandler(async (req, res) => {
  const doc = await prisma.availabilityOverride.findFirst({
    where: {
      id: req.params.overrideId,
      scheduleId: req.params.scheduleId,
      hostUserId: req.user._id,
    },
  });
  if (doc) {
    await prisma.availabilityOverride.delete({ where: { id: doc.id } });
  }
  if (!doc) throw new ApiError(404, "Override not found");
  return res.status(200).json(new ApiResponse(200, "Override deleted", null));
});

export const listOverrides = asyncHandler(async (req, res) => {
  const schedule = await prisma.availabilitySchedule.findFirst({
    where: { id: req.params.scheduleId, hostUserId: req.user._id },
  });
  if (!schedule) throw new ApiError(404, "Schedule not found");
  const items = await prisma.availabilityOverride.findMany({
    where: { scheduleId: schedule.id },
    orderBy: { date: "asc" },
  });
  return res.status(200).json(new ApiResponse(200, "OK", withMongoId(items)));
});
