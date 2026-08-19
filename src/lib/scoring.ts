import type { HabitItem, HabitLog } from "@prisma/client";
import type { DayScore, ScoreThresholds, WeatherState } from "@/types";
import { weekdayOf, weekStartStr } from "./dates";

export function defaultThresholds(): ScoreThresholds {
  return { sun: 0.8, cloud: 0.5 };
}

export function parseThresholds(json: string): ScoreThresholds {
  try {
    const parsed = JSON.parse(json);
    return { sun: parsed.sun ?? 0.8, cloud: parsed.cloud ?? 0.5 };
  } catch {
    return defaultThresholds();
  }
}

/** Whether a habit is scheduled (relevant to check) on a given date, ignoring
 * the "already satisfied this week" rule for WEEKLY habits (see isWeeklyAlreadyDone). */
export function isScheduledOn(habit: Pick<HabitItem, "frequency" | "specificDays">, dateStr: string): boolean {
  if (habit.frequency === "DAILY") return true;
  if (habit.frequency === "WEEKLY") return true;
  if (habit.frequency === "SPECIFIC_DAYS") {
    let days: number[] = [];
    try {
      days = JSON.parse(habit.specificDays);
    } catch {
      days = [];
    }
    return days.includes(weekdayOf(dateStr));
  }
  return true;
}

/** For a WEEKLY habit, has it already been completed earlier in the same week
 * (strictly before dateStr)? If so it's no longer "possible" for the rest of the week. */
export function isWeeklyAlreadyDone(
  habitId: string,
  dateStr: string,
  logsForHabit: Pick<HabitLog, "date" | "completed">[]
): boolean {
  const week = weekStartStr(dateStr);
  return logsForHabit.some(
    (l) => l.date < dateStr && l.date >= week && l.completed
  );
}

export function weatherFromFraction(fraction: number, hasAnyPossible: boolean, thresholds: ScoreThresholds): WeatherState {
  if (!hasAnyPossible) return "empty";
  if (fraction >= thresholds.sun) return "sun";
  if (fraction >= thresholds.cloud) return "cloud";
  return "rain";
}

/**
 * Compute the score for one day given the user's habit definitions and the
 * full set of that user's logs (used to resolve WEEKLY "already satisfied").
 */
export function computeDayScore(
  dateStr: string,
  habits: HabitItem[],
  allLogs: HabitLog[],
  thresholds: ScoreThresholds
): DayScore {
  const logsByHabit = new Map<string, HabitLog[]>();
  for (const log of allLogs) {
    const arr = logsByHabit.get(log.habitItemId) ?? [];
    arr.push(log);
    logsByHabit.set(log.habitItemId, arr);
  }

  let earned = 0;
  let possible = 0;
  let hasAnyPossible = false;

  for (const habit of habits) {
    if (habit.archived || !habit.includeInScore) continue;
    if (!isScheduledOn(habit, dateStr)) continue;

    const habitLogs = logsByHabit.get(habit.id) ?? [];
    if (habit.frequency === "WEEKLY" && isWeeklyAlreadyDone(habit.id, dateStr, habitLogs)) {
      continue; // already satisfied earlier this week, doesn't weigh on this day
    }

    hasAnyPossible = true;
    possible += habit.points;

    const todayLog = habitLogs.find((l) => l.date === dateStr);
    if (todayLog?.completed) {
      earned += todayLog.pointsEarned;
    }
  }

  const fraction = possible > 0 ? Math.min(1, earned / possible) : 0;

  return {
    date: dateStr,
    earned,
    possible,
    fraction,
    weather: weatherFromFraction(fraction, hasAnyPossible, thresholds),
  };
}

/** Given a raw value for a habit's tracking type, decide completion + points earned. */
export function evaluateLogValue(
  habit: Pick<HabitItem, "trackingType" | "scaleMin" | "scaleMax" | "counterTarget" | "points">,
  value: number
): { completed: boolean; pointsEarned: number } {
  if (habit.trackingType === "BOOLEAN") {
    const completed = value >= 1;
    return { completed, pointsEarned: completed ? habit.points : 0 };
  }
  if (habit.trackingType === "COUNTER") {
    const target = habit.counterTarget ?? 1;
    const completed = value >= target;
    const fraction = target > 0 ? Math.min(1, value / target) : 0;
    return { completed, pointsEarned: Math.round(habit.points * fraction) };
  }
  // SCALE: any recorded value counts as "logged" for scoring purposes if it's
  // included in score (most qualitative scales are observation-only anyway).
  const min = habit.scaleMin ?? 1;
  const max = habit.scaleMax ?? 5;
  const range = Math.max(1, max - min);
  const fraction = Math.min(1, Math.max(0, (value - min) / range));
  const completed = value >= min;
  return { completed, pointsEarned: Math.round(habit.points * fraction) };
}
