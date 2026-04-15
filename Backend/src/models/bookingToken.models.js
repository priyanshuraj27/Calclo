import mongoose, { Schema } from "mongoose";
import { BOOKING_TOKEN_PURPOSE } from "../constants/scheduling.constants.js";

const bookingTokenSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    purpose: {
      type: String,
      enum: Object.values(BOOKING_TOKEN_PURPOSE),
      required: true,
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, collection: "booking_tokens" }
);

bookingTokenSchema.index({ bookingId: 1, purpose: 1 });

export const BookingToken = mongoose.model("BookingToken", bookingTokenSchema);
