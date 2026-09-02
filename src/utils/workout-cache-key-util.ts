export const buildWorkoutCacheKey = (
  archetype: string,
  trainingDays: number,
): string => {
  const normalizedArchetype = archetype
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return `workout:${normalizedArchetype}:${trainingDays}`;
};