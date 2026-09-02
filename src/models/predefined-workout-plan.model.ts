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

const predefinedWorkoutPlanSchema = new Schema(
  {
    planKey: {
      type: String,
      required: true,
      unique: true,
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

export type PredefinedWorkoutPlan = InferSchemaType<
  typeof predefinedWorkoutPlanSchema
>;

export const PredefinedWorkoutPlanModel = model(
  "PredefinedWorkoutPlan",
  predefinedWorkoutPlanSchema,
);
