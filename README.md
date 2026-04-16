# Calclo — Scheduling & Booking

A full-stack scheduling application inspired by Cal.com: **event types**, **availability schedules**, **public booking** with conflict detection, a **host bookings dashboard**, **rescheduling**, **email notifications**, **buffers**, **custom questions**, and **date overrides**. The UI is responsive across **mobile**, **tablet**, and **desktop**.

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| Frontend | React (Vite), Tailwind CSS |
| Backend  | Node.js, Express |
| Data     | PostgreSQL, Prisma ORM |
| Email    | Resend (booking confirmation / cancellation) |

---

## Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL database and `DATABASE_URL`

### Backend

```bash
cd Backend
cp .env.example .env   # edit DATABASE_URL, RESEND_* if using email, etc.
npm install
npx prisma migrate dev # or prisma db push for local dev
npx prisma generate
npm run seed           # optional: seed host user & sample data
npm run dev            # default: http://localhost:3000 (check your PORT in .env)
```

### Frontend

```bash
cd Frontend
# Create .env — at minimum:
# VITE_API_BASE_URL=http://localhost:3000
# VITE_DEFAULT_HOST_USERNAME=<your host username>
npm install
npm run dev            # http://localhost:5173
```

Open the app, sign in as the seeded host (or your configured user), and use **Event types**, **Availability**, and **Bookings** from the navigation.

### Public booking URL

Each event type gets a stable public link:

`{VITE_PUBLIC_APP_URL or origin}/{hostUsername}/{eventSlug}`

Example: `https://yoursite.com/priyanshu/15min`

---

## Features

### Add a date override

On **Availability →** open a schedule → **Date overrides**:

- **Block a date** — mark specific days as unavailable (no bookable slots).
- **Custom hours** — override that day’s hours instead of the weekly pattern.

Overrides are stored per schedule and applied when generating public time slots.

---

### 1. Event types management

| Feature | Status |
|--------|--------|
| Create event types with **title**, **description**, **duration** (minutes), and **URL slug** | Done |
| **Edit** and **delete** existing event types | Done |
| **List** all event types on a dashboard | Done |
| **Unique public booking link** per event type | Done |

Additional capabilities include duration options, limits (buffers, minimum notice, slot intervals), and attachment to an availability schedule.

---

### 2. Availability settings

| Feature | Status |
|--------|--------|
| Set **available days** of the week (e.g. Mon–Fri) | Done |
| Set **time ranges** per day (e.g. 9:00 AM – 5:00 PM) | Done |
| Set **timezone** for the schedule (weekly hours interpreted in that zone) | Done |
| **Multiple schedules** (e.g. “Working hours”, “Weekends”) | Done |

---

### 3. Public booking page

| Feature | Status |
|--------|--------|
| **Calendar** to pick a date | Done |
| **Available slots** derived from schedule + overrides + buffers + conflicts | Done |
| **Booking form** (booker name, email, optional custom questions) | Done |
| **No double booking** — server-side overlap checks against existing bookings | Done |
| **Confirmation** view with event and time details | Done |

---

### 4. Bookings dashboard & extras

| Feature | Status |
|--------|--------|
| **Upcoming** bookings | Done |
| **Past** (and other tabs, e.g. cancelled) | Done |
| **Cancel** a booking (host) | Done |
| **Responsive** layout (mobile / tablet / desktop) | Done |
| **Multiple availability schedules** | Done |
| **Date overrides** (block dates or custom hours) | Done |
| **Rescheduling** flow for existing bookings | Done |
| **Email** notifications on confirmation / cancellation | Done |
| **Buffer** time before/after meetings (per event type) | Done |
| **Custom booking questions** (per event type) | Done |

---

## Project layout

```
Scalar AI Assignment/
├── Backend/          # Express API, Prisma, slot generation, emails
│   ├── prisma/
│   └── src/
├── Frontend/         # Vite + React SPA
│   └── src/
└── README.md
```

---

## Database schema

PostgreSQL is modeled with [Prisma](https://www.prisma.io/) (`Backend/prisma/schema.prisma`). IDs are string CUIDs (`@map("_id")` preserves a Mongo-style column name from an earlier migration path).

### Enums

| Enum | Values |
|------|--------|
| `BookingStatus` | `CONFIRMED`, `TENTATIVE`, `CANCELLED`, `RESCHEDULED` |
| `OverrideType` | `CLOSED` (day blocked), `CUSTOM_HOURS` (replacement intervals) |
| `BookingTokenPurpose` | `CONFIRMATION`, `CANCEL`, `RESCHEDULE` (email links) |

### Models

**User** — Host account: `username`, `email`, `fullName`, `avatar`, `defaultTimezone`, `password` (hashed). Owns event types, schedules, overrides, and bookings.

**EventType** — Bookable offering per host: `title`, `description`, `slug` (unique per host), `durationMinutes`, `durationOptions[]`, display (`sortOrder`, `hidden`, `active`, `color`), scheduling (`schedulingType`, `requiresConfirmation`, `seatsPerTimeSlot`, `metadata`), link to **`AvailabilitySchedule`**, buffers (`bufferBeforeMinutes`, `bufferAfterMinutes`), `slotIntervalMinutes`, `minimumNoticeMinutes`, `bookingWindowDays`, `bookingQuestions` (JSON). Cascade delete with host; schedule delete is **restricted** if referenced.

**AvailabilitySchedule** — Named weekly pattern: `name`, `timezone`, `isDefault`, `weeklyRules` (JSON: day → time intervals). Many event types can share one schedule. Per-host overrides hang off the schedule.

**AvailabilityOverride** — Per schedule + calendar **`date`** (string): `type` (`CLOSED` \| `CUSTOM_HOURS`), `intervals` (JSON). Unique `(scheduleId, date)`.

**Booking** — Instance of a booking: `status`, `startAt` / `endAt`, **`blockedStartAt` / `blockedEndAt`** (includes buffers for conflict checks), `bookerName`, `bookerEmail`, `guestEmails[]`, `answers` (JSON, custom questions), `notes`, `meetingWhereType` / `meetingWhereDetail`, `cancellationReason`, optional `rescheduledFromBookingId`. Host and event type relations; event type delete is **restricted** while bookings exist.

**BookingToken** — Hashed token per purpose (`CONFIRMATION`, `CANCEL`, `RESCHEDULE`) with `expiresAt`, for secure email actions. Cascade delete with booking.

### Relationships (summary)

```
User ─┬─< EventType >── AvailabilitySchedule ─┬─< AvailabilityOverride
      ├─< AvailabilitySchedule (direct)         │
      ├─< AvailabilityOverride (direct)         │
      └─< Booking >── EventType
Booking ─┬─< BookingToken
```

---

## API overview

REST API under `/api/v1` (see `Backend/postman/` for a Postman collection). Typical areas:

- Auth / current user  
- Event types CRUD  
- Schedules & **overrides**  
- Public host/event/slots/booking  
- Host **bookings** (list, cancel, reschedule token, PATCH details)  

---

## License

ISC (see individual `package.json` files).
