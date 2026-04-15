import mongoose, { Schema } from "mongoose";
import { BOOKING_STATUS } from "../constants/scheduling.constants.js";

const answerSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventTypeId: {
      type: Schema.Types.ObjectId,
      ref: "EventType",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    blockedStartAt: { type: Date, required: true },
    blockedEndAt: { type: Date, required: true },
    bookerName: { type: String, required: true, trim: true },
    bookerEmail: { type: String, required: true, trim: true, lowercase: true },
    answers: { type: [answerSchema], default: [] },
    notes: { type: String, default: "", trim: true },
    cancellationReason: { type: String, default: "", trim: true },
    rescheduledFromBookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true, collection: "bookings" }
);

bookingSchema.index({ hostUserId: 1, startAt: 1, status: 1 });
bookingSchema.index(
  { hostUserId: 1, startAt: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.TENTATIVE] },
    },
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);
