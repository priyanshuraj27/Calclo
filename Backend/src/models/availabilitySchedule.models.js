import mongoose, { Schema } from "mongoose";

const dayIntervalSchema = new Schema(
  {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  { _id: false }
);

const weeklyRulesSchema = new Schema(
  {
    sunday: { type: [dayIntervalSchema], default: [] },
    monday: { type: [dayIntervalSchema], default: [] },
    tuesday: { type: [dayIntervalSchema], default: [] },
    wednesday: { type: [dayIntervalSchema], default: [] },
    thursday: { type: [dayIntervalSchema], default: [] },
    friday: { type: [dayIntervalSchema], default: [] },
    saturday: { type: [dayIntervalSchema], default: [] },
  },
  { _id: false }
);

const availabilityScheduleSchema = new Schema(
  {
    hostUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    timezone: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    weeklyRules: { type: weeklyRulesSchema, default: () => ({}) },
  },
  { timestamps: true, collection: "availability_schedules" }
);

availabilityScheduleSchema.index({ hostUserId: 1, isDefault: 1 });

export const AvailabilitySchedule = mongoose.model(
  "AvailabilitySchedule",
  availabilityScheduleSchema
);
