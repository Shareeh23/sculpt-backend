import { AppError } from "../errors/app-error.js";

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

type AIAlternate = {
  Name: string;
  Sets: number;
  Reps: string;
};

type AIExercise = {
  Name: string;
  Sets: number;
  Reps: string;
  Alternate?: AIAlternate[];
};

type AISession = {
  Workout_Day: string;
  Focus_Areas?: string[];
  Exercises?: AIExercise[];
  Notes?: string;
};

type AIWorkoutPlan = {
  Plan_Name: string;
  Training_Days: number;
  Program_Theme: string;
  Strong_Points?: string[];
  Neutral_Points?: string[];
  Weak_Points?: string[];
  Workout_Schedule: AISession[];
};

export type ParsedWorkoutPlan = {
  planName: string;
  programTheme: string;
  prioritizedMuscles: string[];
  neutralPoints: string[];
  weakPoints: string[];
  trainingDays: number;
  sessions: {
    sessionOrder: number;
    focusAreas: string[];
    exercises: {
      name: string;
      sets: number;
      repRange: string;
      alternates: {
        name: string;
        sets: number;
        repRange: string;
      }[];
    }[];
    notes?: string;
  }[];
};

export function parseWorkoutPlan(response: unknown): ParsedWorkoutPlan {
  const content = extractContent(response);
  const parsedResponse = parseJson(content);

  validateWorkoutPlan(parsedResponse);

  return {
    planName: parsedResponse.Plan_Name,
    programTheme: parsedResponse.Program_Theme,
    prioritizedMuscles: parsedResponse.Strong_Points ?? [],
    neutralPoints: parsedResponse.Neutral_Points ?? [],
    weakPoints: parsedResponse.Weak_Points ?? [],
    trainingDays: parsedResponse.Training_Days,
    sessions: parsedResponse.Workout_Schedule.map((session, index) => {
      const result: ParsedWorkoutPlan["sessions"][number] = {
        sessionOrder: index + 1,
        focusAreas: session.Focus_Areas ?? [],
        exercises: (session.Exercises ?? []).map((exercise) => ({
          name: exercise.Name,
          sets: exercise.Sets,
          repRange: exercise.Reps,
          alternates: (exercise.Alternate ?? []).map((alternate) => ({
            name: alternate.Name,
            sets: alternate.Sets,
            repRange: alternate.Reps,
          })),
        })),
      };

      if (typeof session.Notes === "string" && session.Notes.length > 0) {
        result.notes = session.Notes;
      }

      return result;
    }),
  };
}

function extractContent(response: unknown): string {
  if (!isOpenAIResponse(response)) {
    throw new AppError(
      "Invalid response received from workout generation service",
      502,
    );
  }

  const content = response.choices?.[0]?.message?.content;

  if (typeof content !== "string" || content.trim() === "") {
    throw new AppError(
      "Workout generation service returned an empty response",
      502,
    );
  }

  return content;
}

function parseJson(content: string): AIWorkoutPlan {
  try {
    const cleanedContent = cleanJsonContent(content);
    const parsed: unknown = JSON.parse(cleanedContent);

    if (!isAIWorkoutPlan(parsed)) {
      throw new Error("Invalid workout plan structure");
    }

    return parsed;
  } catch {
    throw new AppError("Failed to parse generated workout plan", 502);
  }
}

function cleanJsonContent(content: string): string {
  const trimmed = content.trim();

  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function validateWorkoutPlan(plan: AIWorkoutPlan): void {
  if (plan.Training_Days < 3 || plan.Training_Days > 6) {
    throw new AppError(
      "Generated workout plan contains an invalid number of training days",
      502,
    );
  }

  if (plan.Workout_Schedule.length !== plan.Training_Days) {
    throw new AppError(
      "Generated workout plan contains an incorrect number of sessions",
      502,
    );
  }
}

function isAIWorkoutPlan(value: unknown): value is AIWorkoutPlan {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.Plan_Name !== "string" ||
    typeof value.Training_Days !== "number" ||
    typeof value.Program_Theme !== "string" ||
    !Array.isArray(value.Workout_Schedule)
  ) {
    return false;
  }

  if (
    value.Strong_Points !== undefined &&
    !isStringArray(value.Strong_Points)
  ) {
    return false;
  }

  if (
    value.Neutral_Points !== undefined &&
    !isStringArray(value.Neutral_Points)
  ) {
    return false;
  }

  if (value.Weak_Points !== undefined && !isStringArray(value.Weak_Points)) {
    return false;
  }

  return value.Workout_Schedule.every(isAISession);
}

function isAISession(value: unknown): value is AISession {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.Workout_Day !== "string") {
    return false;
  }

  if (value.Focus_Areas !== undefined && !isStringArray(value.Focus_Areas)) {
    return false;
  }

  if (
    value.Exercises !== undefined &&
    (!Array.isArray(value.Exercises) || !value.Exercises.every(isAIExercise))
  ) {
    return false;
  }

  if (value.Notes !== undefined && typeof value.Notes !== "string") {
    return false;
  }

  return true;
}

function isAIExercise(value: unknown): value is AIExercise {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.Name !== "string" ||
    typeof value.Sets !== "number" ||
    typeof value.Reps !== "string"
  ) {
    return false;
  }

  if (
    value.Alternate !== undefined &&
    (!Array.isArray(value.Alternate) || !value.Alternate.every(isAIAlternate))
  ) {
    return false;
  }

  return true;
}

function isAIAlternate(value: unknown): value is AIAlternate {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.Name === "string" &&
    typeof value.Sets === "number" &&
    typeof value.Reps === "string"
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOpenAIResponse(response: unknown): response is OpenAIResponse {
  if (!isRecord(response)) {
    return false;
  }

  if (!Array.isArray(response.choices)) {
    return false;
  }

  return true;
}
