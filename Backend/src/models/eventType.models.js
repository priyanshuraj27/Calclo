import mongoose, { Schema } from "mongoose";

const bookingQuestionSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["TEXT", "LONG_TEXT", "SELECT"],
      default: "TEXT",
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
  },
  { _id: false }
);

const eventTypeSchema = new Schema(
  {
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    slug: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    /** Extra lengths (minutes) bookers may choose; always includes durationMinutes server-side. */
    durationOptions: { type: [Number], default: [] },
    /** Host-controlled ordering in event type list (lower first). */
    sortOrder: { type: Number, default: 0, min: 0 },
    hidden: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    color: { type: String, default: "#292929" },
    schedulingType: { type: String, default: null },
    requiresConfirmation: { type: Boolean, default: false },
    seatsPerTimeSlot: { type: Number, default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
    availabilityScheduleId: {
      type: Schema.Types.ObjectId,
      ref: "AvailabilitySchedule",
      required: true,
    },
    bufferBeforeMinutes: { type: Number, default: 0, min: 0 },
    bufferAfterMinutes: { type: Number, default: 0, min: 0 },
    slotIntervalMinutes: { type: Number, default: 15, min: 5 },
    minimumNoticeMinutes: { type: Number, default: 0, min: 0 },
    bookingWindowDays: { type: Number, default: 60, min: 1 },
    bookingQuestions: [bookingQuestionSchema],
  },
  { timestamps: true, collection: "event_types" }
);

eventTypeSchema.index({ hostUserId: 1, slug: 1 }, { unique: true });
eventTypeSchema.index({ hostUserId: 1, sortOrder: 1 });

export const EventType = mongoose.model("EventType", eventTypeSchema);
