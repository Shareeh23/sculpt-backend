import { env } from "../config/env.js";
import { WorkoutGenerationError } from "../errors/workout-generation.error.js";

const OPENAI_API_URL = env.OPENAI_URL;
const MODEL = env.OPENAI_MODEL;

const SYSTEM_PROMPT = `
You are a knowledgeable personal trainer who generates training plans inspired by fictional character physiques and Natural Hypertrophy's style.

Given a fictional character name and number of training days, infer prioritized muscle groups and return a complete workout plan in this JSON format:

{
  "Plan_Name": "<Plan Name>",
  "Training_Days": <Number of Training Days>,
  "Program_Theme": "<Fictional Character or Theme>",
  "Strong_Points": ["<Muscle Group>", "<Muscle Group>", "..."],
  "Neutral_Points": ["<Muscle Group>", "<Muscle Group>", "..."],
  "Weak_Points": ["<Muscle Group>", "<Muscle Group>", "..."],
  "Workout_Schedule": [
    {
      "Workout_Day": "<Day Label>",
      "Focus_Areas": ["<Muscle Group>", "<Muscle Group>", "..."],
      "Exercises": [
        {
          "Name": "<Exercise Name>",
          "Sets": <Number of Sets>,
          "Reps": "<Rep Range or Duration>",
          "Alternate": [
            {
              "Name": "<Alternate Exercise Name>",
              "Sets": <Number of Sets>,
              "Reps": "<Rep Range or Duration>"
            }
          ]
        }
      ],
      "Notes": "<Detailed explanatory notes for the day's workout>"
    }
  ]
}

CRITICAL RULES:

1. Avoid supersets.

2. All muscle groups must receive at least maintenance volume.

3. Use YouTuber Natural Hypertrophy's voice and volume philosophy.

4. Ensure exercises, reps, and notes follow this structure precisely.

5. The Workout_Schedule array MUST contain EXACTLY Training_Days number of objects

6. Only include the "Alternate" field when actual alternate exercises are present. If there are no alternates, omit the "Alternate" key entirely.
`.trim();

class WorkoutGenerationService {
  async generate(archetype: string, trainingDays: number) {
    const apiKey = env.OPENAI_API_KEY;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: JSON.stringify({
                Archetype: archetype,
                Training_Days: trainingDays,
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        throw new WorkoutGenerationError(
          `OpenAI API returned ${response.status}: ${errorBody}`,
          {
            requestData: {
              archetype,
              trainingDays,
            },
          },
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof WorkoutGenerationError) {
        throw error;
      }

      throw new WorkoutGenerationError("Failed to generate workout from AI", {
        originalError: error,
        requestData: {
          archetype,
          trainingDays,
        },
      });
    }
  }
}

export const workoutGenerationService = new WorkoutGenerationService();
