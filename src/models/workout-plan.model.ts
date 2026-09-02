import { Schema, model, type InferSchemaType } from "mongoose";

const alternateExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    repRange: {
      type: String,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sets: {
      type: Number,
      required: true,
    },
    repRange: {
      type: String,
      required: true,
    },
    alternates: {
      type: [alternateExerciseSchema],
      default: [],
    },
  },
  {
    _id: true,
  },
);

const sessionSchema = new Schema(
  {
    sessionOrder: {
      type: Number,
      required: true,
    },
    focusAreas: {
      type: [String],
      default: [],
    },
    exercises: {
      type: [exerciseSchema],
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    _id: false,
  },
);

const workoutPlanSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    source: {
      type: String,
      enum: ["ai", "predefined"],
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    programTheme: {
      type: String,
      required: true,
    },
    imageKey: {
      type: String,
    },
    prioritizedMuscles: {
      type: [String],
      default: [],
    },
    neutralPoints: {
      type: [String],
      default: [],
    },
    weakPoints: {
      type: [String],
      default: [],
    },
    trainingDays: {
      type: Number,
      required: true,
      min: 3,
      max: 6,
    },
    sessions: {
      type: [sessionSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type WorkoutPlan = InferSchemaType<typeof workoutPlanSchema>;

export const WorkoutPlanModel = model("WorkoutPlan", workoutPlanSchema);
