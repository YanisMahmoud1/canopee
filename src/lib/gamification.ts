import { eachDayOfInterval, subDays } from "date-fns";
import type { HabitItem, HabitLog } from "@prisma/client";
import type { PriorityLevel, TaskDifficulty, TreeStage, TreeState } from "@/types";
import { isScheduledOn } from "./scoring";
import { parseDateStr, toDateStr } from "./dates";

/** Lifetime count of completed occurrences -> which tree stage a habit has grown into.
 * Growth is cumulative and never regresses on a single missed day — only long-term
 * neglect (see vigor) shows as wilting on top of the current stage. */
export function stageFromCompletionCount(count: number): TreeStage {
  if (count >= 365) return "ancient";
  if (count >= 90) return "fruiting";
  if (count >= 21) return "blooming";
  if (count >= 8) return "sapling";
  if (count >= 4) return "sprout";
  return "seed";
}

export const TREE_STAGE_LABELS: Record<TreeStage, string> = {
  seed: "Graine",
  sprout: "Pousse fragile",
  sapling: "Jeune arbre",
  blooming: "Arbre en fleur",
  fruiting: "Arbre robuste",
  ancient: "Arbre ancien",
};

/** "Avaler le crapaud" (eat the frog): the most important AND most tedious
 * tasks should surface to the top of the day and pay out the most XP, so
 * finishing them first is always the visibly rewarding move. */
const PRIORITY_RANK: Record<PriorityLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const DIFFICULTY_RANK: Record<TaskDifficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  EASY: "Facile",
  MEDIUM: "Moyenne",
  HARD: "Pénible",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

/** Sort weight: higher = more urgent to tackle first. */
export function priorityTaskWeight(priorityLevel: PriorityLevel, difficulty: TaskDifficulty): number {
  return PRIORITY_RANK[priorityLevel] + DIFFICULTY_RANK[difficulty];
}

/** XP payout scales with the same weight, so the frog is always worth eating. */
export function priorityTaskXp(priorityLevel: PriorityLevel, difficulty: TaskDifficulty): number {
  return priorityTaskWeight(priorityLevel, difficulty) * 5;
}

const VIGOR_WINDOW_DAYS = 30;
const VIGOR_ALPHA = 0.3;

export function computeTreeState(
  habit: Pick<HabitItem, "id" | "frequency" | "specificDays" | "createdAt">,
  logs: Pick<HabitLog, "date" | "completed">[],
  today: string
): TreeState {
  const completedByDate = new Set(logs.filter((l) => l.completed).map((l) => l.date));
  const totalGoodDays = completedByDate.size;

  const windowStart = subDays(parseDateStr(today), VIGOR_WINDOW_DAYS - 1);
  const createdAt = new Date(habit.createdAt);
  const rangeStart = createdAt > windowStart ? createdAt : windowStart;
  const rangeEnd = parseDateStr(today);

  let vigor = 0.7; // neutral starting health for a fresh habit
  let sawApplicable = false;

  if (rangeStart <= rangeEnd) {
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map(toDateStr);
    for (const d of days) {
      if (!isScheduledOn(habit, d)) continue;
      sawApplicable = true;
      const hit = completedByDate.has(d) ? 1 : 0;
      vigor = vigor * (1 - VIGOR_ALPHA) + hit * VIGOR_ALPHA;
    }
  }
  if (!sawApplicable) vigor = 1;

  return {
    stage: stageFromCompletionCount(totalGoodDays),
    vigor: Math.max(0, Math.min(1, vigor)),
    streakDays: totalGoodDays,
  };
}

/** XP economy: keep it simple and legible rather than a hidden multiplier maze. */
export const XP_RULES = {
  habitCompletion: (points: number) => points,
  subtaskDone: 5,
  milestoneDone: 15,
  projectDone: 50,
  questDone: (xpReward: number) => xpReward,
  personalRecord: 25,
};

const LEVEL_TIERS: { max: number; name: string }[] = [
  { max: 5, name: "Graine → Pousse" },
  { max: 15, name: "Jeune pousse" },
  { max: 30, name: "Arbre mature" },
  { max: 50, name: "Forêt naissante" },
  { max: Infinity, name: "Écosystème" },
];

/** Cumulative XP required to REACH a given level (level 1 starts at 0 XP). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(30 * (level - 1) * level);
}

export function levelFromXp(xp: number): { level: number; xpIntoLevel: number; xpForNext: number } {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, xpIntoLevel: xp - base, xpForNext: next - base };
}

export function tierNameForLevel(level: number): string {
  return LEVEL_TIERS.find((t) => level <= t.max)!.name;
}
