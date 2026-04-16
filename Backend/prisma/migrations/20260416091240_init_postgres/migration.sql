-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'TENTATIVE', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "OverrideType" AS ENUM ('CLOSED', 'CUSTOM_HOURS');

-- CreateEnum
CREATE TYPE "BookingTokenPurpose" AS ENUM ('CONFIRMATION', 'CANCEL', 'RESCHEDULE');

-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT '',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "_id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "slug" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "durationOptions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT '#292929',
    "schedulingType" TEXT,
    "requiresConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "seatsPerTimeSlot" INTEGER,
    "metadata" JSONB,
    "availabilityScheduleId" TEXT NOT NULL,
    "bufferBeforeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bufferAfterMinutes" INTEGER NOT NULL DEFAULT 0,
    "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "minimumNoticeMinutes" INTEGER NOT NULL DEFAULT 0,
    "bookingWindowDays" INTEGER NOT NULL DEFAULT 60,
    "bookingQuestions" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "AvailabilitySchedule" (
    "_id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "weeklyRules" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySchedule_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "AvailabilityOverride" (
    "_id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "type" "OverrideType" NOT NULL,
    "intervals" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityOverride_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "_id" TEXT NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "eventTypeId" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "blockedStartAt" TIMESTAMP(3) NOT NULL,
    "blockedEndAt" TIMESTAMP(3) NOT NULL,
    "bookerName" TEXT NOT NULL,
    "bookerEmail" TEXT NOT NULL,
    "guestEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "answers" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT NOT NULL DEFAULT '',
    "meetingWhereType" TEXT NOT NULL DEFAULT 'cal-video',
    "meetingWhereDetail" TEXT NOT NULL DEFAULT '',
    "cancellationReason" TEXT NOT NULL DEFAULT '',
    "rescheduledFromBookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "BookingToken" (
    "_id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" "BookingTokenPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingToken_pkey" PRIMARY KEY ("_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "EventType_hostUserId_sortOrder_idx" ON "EventType"("hostUserId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EventType_hostUserId_slug_key" ON "EventType"("hostUserId", "slug");

-- CreateIndex
CREATE INDEX "AvailabilitySchedule_hostUserId_isDefault_idx" ON "AvailabilitySchedule"("hostUserId", "isDefault");

-- CreateIndex
CREATE INDEX "AvailabilityOverride_scheduleId_idx" ON "AvailabilityOverride"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityOverride_scheduleId_date_key" ON "AvailabilityOverride"("scheduleId", "date");

-- CreateIndex
CREATE INDEX "Booking_hostUserId_startAt_status_idx" ON "Booking"("hostUserId", "startAt", "status");

-- CreateIndex
CREATE INDEX "Booking_hostUserId_blockedStartAt_blockedEndAt_status_idx" ON "Booking"("hostUserId", "blockedStartAt", "blockedEndAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingToken_tokenHash_key" ON "BookingToken"("tokenHash");

-- CreateIndex
CREATE INDEX "BookingToken_bookingId_purpose_idx" ON "BookingToken"("bookingId", "purpose");

-- CreateIndex
CREATE INDEX "BookingToken_expiresAt_idx" ON "BookingToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventType" ADD CONSTRAINT "EventType_availabilityScheduleId_fkey" FOREIGN KEY ("availabilityScheduleId") REFERENCES "AvailabilitySchedule"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySchedule" ADD CONSTRAINT "AvailabilitySchedule_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityOverride" ADD CONSTRAINT "AvailabilityOverride_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityOverride" ADD CONSTRAINT "AvailabilityOverride_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "AvailabilitySchedule"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventTypeId_fkey" FOREIGN KEY ("eventTypeId") REFERENCES "EventType"("_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingToken" ADD CONSTRAINT "BookingToken_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("_id") ON DELETE CASCADE ON UPDATE CASCADE;
