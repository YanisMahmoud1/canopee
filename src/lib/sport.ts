/** Epley formula estimated one-rep max. */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export interface ExerciseSetInput {
  exerciseName: string;
  reps: number;
  weightKg: number;
}

export interface SessionFormInput {
  activityType: string;
  date: string;
  durationMin?: number;
  rpe?: number;
  energyBefore?: number;
  energyAfter?: number;
  distanceKm?: number;
  paceOrSpeed?: string;
  heartRate?: number;
  elevationGain?: number;
  notes?: string;
  exercises: { name: string; sets: { reps: number; weightKg: number }[] }[];
}
