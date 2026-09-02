import { Schema, model, type InferSchemaType } from "mongoose";

const performedSetSchema = new Schema(
  {
    reps: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const exerciseLogSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    performedSets: {
      type: [performedSetSchema],
      required: true,
    },
  },
  {
    _id: false,
  },
);

const workoutLogSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    sessionOrder: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    exercises: {
      type: [exerciseLogSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

workoutLogSchema.index({ userId: 1, date: 1 });
workoutLogSchema.index({
  userId: 1,
  "exercises.name": 1,
  date: 1,
});

export type WorkoutLog = InferSchemaType<typeof workoutLogSchema>;

export const WorkoutLogModel = model("WorkoutLog", workoutLogSchema);
