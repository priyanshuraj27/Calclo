import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import connectDB from "./db/index.js";
import { prisma } from "./db/prisma.js";
import { BOOKING_STATUS } from "./constants/scheduling.constants.js";

dotenv.config({ path: "./.env" });

const HOST_USERNAME = (process.env.DEFAULT_HOST_USERNAME || "priyanshu")
  .toLowerCase()
  .trim();
const HOST_EMAIL =
  process.env.SEED_HOST_EMAIL || `${HOST_USERNAME}@example.com`;
const HOST_FULL_NAME = process.env.SEED_HOST_FULL_NAME || "Priyanshu";
const HOST_PASSWORD = process.env.SEED_HOST_PASSWORD || "password123";
const SEED_TIMEZONE = process.env.SEED_TIMEZONE || "Asia/Kolkata";

async function ensureHostUser() {
  let user = await prisma.user.findUnique({ where: { username: HOST_USERNAME } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: HOST_USERNAME,
        email: HOST_EMAIL.toLowerCase(),
        fullName: HOST_FULL_NAME,
        password: await bcrypt.hash(HOST_PASSWORD, 10),
        defaultTimezone: SEED_TIMEZONE,
        avatar: "",
      },
    });
    console.log("Created host user:", user.username);
  } else {
    console.log("Host user already exists:", user.username);
  }
  return user;
}

async function ensureSchedules(hostUserId) {
  let defaultSched = await prisma.availabilitySchedule.findFirst({
    where: { hostUserId, isDefault: true },
  });

  if (!defaultSched) {
    await prisma.availabilitySchedule.updateMany({
      where: { hostUserId },
      data: { isDefault: false },
    });
    defaultSched = await prisma.availabilitySchedule.create({
      data: {
        hostUserId,
        name: "Working hours",
        timezone: SEED_TIMEZONE,
        isDefault: true,
        weeklyRules: {
          monday: [{ start: "09:00", end: "17:00" }],
          tuesday: [{ start: "09:00", end: "17:00" }],
          wednesday: [{ start: "09:00", end: "17:00" }],
          thursday: [{ start: "09:00", end: "17:00" }],
          friday: [{ start: "09:00", end: "17:00" }],
          saturday: [],
          sunday: [],
        },
      },
    });
    console.log("Created default schedule:", defaultSched.name);
  } else {
    console.log("Default schedule already exists:", defaultSched.name);
  }

  let weekend = await prisma.availabilitySchedule.findFirst({
    where: { hostUserId, name: "Weekend Warm-up" },
  });
  if (!weekend) {
    weekend = await prisma.availabilitySchedule.create({
      data: {
        hostUserId,
        name: "Weekend Warm-up",
        timezone: SEED_TIMEZONE,
        isDefault: false,
        weeklyRules: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [{ start: "10:00", end: "14:00" }],
          sunday: [{ start: "10:00", end: "14:00" }],
        },
      },
    });
    console.log("Created weekend schedule:", weekend.name);
  } else {
    console.log("Weekend schedule already exists:", weekend.name);
  }

  return defaultSched;
}

async function ensureEventTypes(hostUserId, scheduleId) {
  const specs = [
    {
      title: "15 Min Meeting",
      slug: "15min",
      durationMinutes: 15,
      durationOptions: [15, 30, 45],
      description: "Short introductory meeting",
      hidden: false,
      color: "#292929",
    },
    {
      title: "30 Min Meeting",
      slug: "30min",
      durationMinutes: 30,
      durationOptions: [30, 45, 60],
      description: "Standard consultation",
      hidden: false,
      color: "#3b82f6",
    },
    {
      title: "Secret Meeting",
      slug: "secret",
      durationMinutes: 60,
      description: "This one is hidden from your profile",
      hidden: true,
      color: "#ef4444",
    },
    {
      title: "Round Robin Team",
      slug: "team/intro",
      durationMinutes: 30,
      description: "Team meeting with round robin scheduling",
      hidden: false,
      color: "#10b981",
      schedulingType: "ROUND_ROBIN",
    },
  ];

  for (const [index, et] of specs.entries()) {
    await prisma.eventType.upsert({
      where: { hostUserId_slug: { hostUserId, slug: et.slug } },
      update: {
        title: et.title,
        description: et.description,
        durationMinutes: et.durationMinutes,
        durationOptions: et.durationOptions ?? [],
        hidden: et.hidden,
        active: true,
        color: et.color,
        schedulingType: et.schedulingType ?? null,
        requiresConfirmation: false,
        seatsPerTimeSlot: null,
        metadata: null,
        availabilityScheduleId: scheduleId,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        slotIntervalMinutes: 15,
        minimumNoticeMinutes: 0,
        bookingWindowDays: 60,
        bookingQuestions: [],
        sortOrder: index + 1,
      },
      create: {
        hostUserId,
        title: et.title,
        slug: et.slug,
        description: et.description,
        durationMinutes: et.durationMinutes,
        durationOptions: et.durationOptions ?? [],
        hidden: et.hidden,
        active: true,
        color: et.color,
        schedulingType: et.schedulingType ?? null,
        requiresConfirmation: false,
        seatsPerTimeSlot: null,
        metadata: null,
        availabilityScheduleId: scheduleId,
        bufferBeforeMinutes: 0,
        bufferAfterMinutes: 0,
        slotIntervalMinutes: 15,
        minimumNoticeMinutes: 0,
        bookingWindowDays: 60,
        bookingQuestions: [],
        sortOrder: index + 1,
      },
    });
    console.log("Upserted event type:", et.slug);
  }

  await prisma.eventType.updateMany({
    where: { hostUserId, slug: "15min", durationOptions: { equals: [] } },
    data: { durationOptions: [15, 30, 45] },
  });
}

async function seedSampleBookings(hostUserId, timezone) {
  await prisma.booking.deleteMany({ where: { hostUserId } });
  console.log("Cleared existing bookings for host (re-seed).");

  const et15 = await prisma.eventType.findFirst({
    where: { hostUserId, slug: "15min" },
  });
  const et30 = await prisma.eventType.findFirst({
    where: { hostUserId, slug: "30min" },
  });
  if (!et15 || !et30) {
    console.warn("Skipping bookings: event types missing.");
    return;
  }

  const z = timezone || "UTC";
  const slot1 = DateTime.now()
    .setZone(z)
    .plus({ days: 3 })
    .set({ hour: 9, minute: 0, second: 0, millisecond: 0 });
  const slot2 = DateTime.now()
    .setZone(z)
    .plus({ days: 5 })
    .set({ hour: 14, minute: 30, second: 0, millisecond: 0 });

  const bookings = [
    {
      hostUserId,
      eventTypeId: et15.id,
      status: BOOKING_STATUS.CONFIRMED,
      startAt: slot1.toUTC().toJSDate(),
      endAt: slot1.plus({ minutes: 15 }).toUTC().toJSDate(),
      blockedStartAt: slot1.toUTC().toJSDate(),
      blockedEndAt: slot1.plus({ minutes: 15 }).toUTC().toJSDate(),
      bookerName: "John Doe",
      bookerEmail: "john@example.com",
      answers: [],
      notes: "",
    },
    {
      hostUserId,
      eventTypeId: et30.id,
      status: BOOKING_STATUS.CONFIRMED,
      startAt: slot2.toUTC().toJSDate(),
      endAt: slot2.plus({ minutes: 30 }).toUTC().toJSDate(),
      blockedStartAt: slot2.toUTC().toJSDate(),
      blockedEndAt: slot2.plus({ minutes: 30 }).toUTC().toJSDate(),
      bookerName: "Alice Smith",
      bookerEmail: "alice@company.com",
      answers: [],
      notes: "",
    },
  ];

  await prisma.booking.createMany({ data: bookings });
  console.log("Inserted sample bookings:", bookings.length);
}

async function run() {
  await connectDB();
  const user = await ensureHostUser();
  const defaultSched = await ensureSchedules(user.id);
  await ensureEventTypes(user.id, defaultSched.id);
  await seedSampleBookings(user.id, defaultSched.timezone);
  console.log("Seed finished successfully.");
}

run()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(process.exitCode || 0);
  });
