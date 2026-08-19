import { eachDayOfInterval } from "date-fns";
import type { HabitItem, HabitLog, DailyJournal } from "@prisma/client";
import type { DayScore, ScoreThresholds } from "@/types";
import { computeDayScore } from "./scoring";
import { toDateStr } from "./dates";

export interface DayDetailEntry {
  habitName: string;
  categoryColor: string | null;
  completed: boolean;
  pointsEarned: number;
  points: number;
}

export function buildScoreRange(
  start: Date,
  end: Date,
  habits: HabitItem[],
  logs: HabitLog[],
  thresholds: ScoreThresholds
): Record<string, DayScore> {
  const days = eachDayOfInterval({ start, end }).map(toDateStr);
  const result: Record<string, DayScore> = {};
  for (const d of days) {
    result[d] = computeDayScore(d, habits, logs, thresholds);
  }
  return result;
}

export function buildDayDetails(
  habits: (HabitItem & { category: { color: string } | null })[],
  logs: HabitLog[],
  journals: DailyJournal[]
): { details: Record<string, DayDetailEntry[]>; notes: Record<string, string> } {
  const details: Record<string, DayDetailEntry[]> = {};
  for (const log of logs) {
    const habit = habits.find((h) => h.id === log.habitItemId);
    if (!habit) continue;
    const entry: DayDetailEntry = {
      habitName: habit.name,
      categoryColor: habit.category?.color ?? null,
      completed: log.completed,
      pointsEarned: log.pointsEarned,
      points: habit.points,
    };
    (details[log.date] ??= []).push(entry);
  }
  const notes: Record<string, string> = {};
  for (const j of journals) {
    if (j.note) notes[j.date] = j.note;
  }
  return { details, notes };
}
