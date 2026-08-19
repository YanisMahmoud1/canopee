import { subDays, differenceInCalendarDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUserRecord } from "@/lib/current-user";
import { todayStr, parseDateStr } from "@/lib/dates";
import { parseThresholds } from "@/lib/scoring";
import { buildScoreRange, buildDayDetails } from "@/lib/calendar";
import { computeTreeState } from "@/lib/gamification";
import { GardenTabs } from "@/components/garden/GardenTabs";
import { TreeGarden, type GardenHabitEntry } from "@/components/garden/TreeGarden";
import { Heatmap } from "@/components/garden/Heatmap";

const HISTORY_DAYS = 370;

export default async function GardenPage() {
  const user = await requireUserRecord();
  const today = todayStr();
  const rangeStart = subDays(new Date(), HISTORY_DAYS);

  const [habits, logs, journals] = await Promise.all([
    prisma.habitItem.findMany({
      where: { userId: user.id, archived: false },
      include: { category: true },
      orderBy: { order: "asc" },
    }),
    prisma.habitLog.findMany({
      where: { userId: user.id, date: { gte: rangeStart.toISOString().slice(0, 10) } },
    }),
    prisma.dailyJournal.findMany({ where: { userId: user.id } }),
  ]);

  const thresholds = parseThresholds(user.scoreThresholds);
  const scores = buildScoreRange(rangeStart, new Date(), habits, logs, thresholds);
  const { details, notes } = buildDayDetails(habits, logs, journals);

  const treeEntries: GardenHabitEntry[] = habits.map((h) => {
    const habitLogs = logs.filter((l) => l.habitItemId === h.id);
    const tree = computeTreeState(h, habitLogs, today);
    const lastGood = habitLogs.filter((l) => l.completed).sort((a, b) => b.date.localeCompare(a.date))[0];
    const daysSince = lastGood ? differenceInCalendarDays(parseDateStr(today), parseDateStr(lastGood.date)) : differenceInCalendarDays(parseDateStr(today), new Date(h.createdAt));
    return {
      id: h.id,
      name: h.name,
      categoryColor: h.category?.color ?? null,
      tree,
      isThirsty: daysSince >= 3,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-900">Ton jardin</h1>
        <p className="text-sm text-canopy-600">Chaque habitude est un arbre qui grandit avec ta régularité.</p>
      </div>

      <GardenTabs
        garden={<TreeGarden entries={treeEntries} />}
        calendar={<Heatmap scores={scores} details={details} notes={notes} />}
      />
    </div>
  );
}
