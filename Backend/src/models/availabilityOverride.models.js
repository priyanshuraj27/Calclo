import mongoose, { Schema } from "mongoose";
import { OVERRIDE_TYPE } from "../constants/scheduling.constants.js";

const dayIntervalSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const availabilityOverrideSchema = new Schema(
  {
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: "AvailabilitySchedule",
      required: true,
      index: true,
    },
    date: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(OVERRIDE_TYPE),
      required: true,
    },
    intervals: { type: [dayIntervalSchema], default: [] },
  },
  { timestamps: true, collection: "availability_overrides" }
);

availabilityOverrideSchema.index(
  { scheduleId: 1, date: 1 },
  { unique: true }
);

export const AvailabilityOverride = mongoose.model(
  "AvailabilityOverride",
  availabilityOverrideSchema
);
