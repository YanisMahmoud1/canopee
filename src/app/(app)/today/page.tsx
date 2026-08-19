import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUserRecord } from "@/lib/current-user";
import { todayStr, weekStartStr, toDateStr } from "@/lib/dates";
import { computeDayScore, parseThresholds, isWeeklyAlreadyDone, isScheduledOn } from "@/lib/scoring";
import { ScoreBanner } from "@/components/garden/ScoreBanner";
import { HabitRow, type HabitRowData } from "@/components/today/HabitRow";
import { AddHabitForm } from "@/components/today/AddHabitForm";
import { JournalBox } from "@/components/today/JournalBox";
import { PrioritiesPanel } from "@/components/today/PrioritiesPanel";
import { EnergyTracker } from "@/components/today/EnergyTracker";
import { QuestCard } from "@/components/today/QuestCard";
import Link from "next/link";

export default async function TodayPage() {
  const user = await requireUserRecord();
  const date = todayStr();
  const weekStart = weekStartStr(date);
  const deadlineHorizon = toDateStr(addDays(new Date(), 7));

  const [habits, categories, weekLogs, journal, priorities, projects, energyLogs, quests] = await Promise.all([
    prisma.habitItem.findMany({
      where: { userId: user.id, archived: false },
      include: { category: true },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.habitLog.findMany({
      where: { userId: user.id, date: { gte: weekStart, lte: date } },
    }),
    prisma.dailyJournal.findUnique({ where: { userId_date: { userId: user.id, date } } }),
    prisma.todayPriority.findMany({ where: { userId: user.id, date }, orderBy: { createdAt: "asc" } }),
    prisma.project.findMany({
      where: { userId: user.id, archived: false, dueDate: { not: null, lte: deadlineHorizon, gte: date } },
      include: { milestones: { where: { status: { not: "DONE" }, dueDate: { not: null, lte: deadlineHorizon, gte: date } } } },
    }),
    prisma.energyLog.findMany({ where: { userId: user.id, date } }),
    prisma.quest.findMany({ where: { userId: user.id, weekStart }, orderBy: { id: "asc" } }),
  ]);

  const thresholds = parseThresholds(user.scoreThresholds);
  const score = computeDayScore(date, habits, weekLogs, thresholds);

  const habitRows: HabitRowData[] = habits
    .filter((h) => isScheduledOn(h, date))
    .map((h) => {
      const logsForHabit = weekLogs.filter((l) => l.habitItemId === h.id);
      const todayLog = logsForHabit.find((l) => l.date === date);
      const weeklyAlreadyDone =
        h.frequency === "WEEKLY" && isWeeklyAlreadyDone(h.id, date, logsForHabit);
      return {
        id: h.id,
        name: h.name,
        trackingType: h.trackingType as HabitRowData["trackingType"],
        scaleMin: h.scaleMin,
        scaleMax: h.scaleMax,
        counterTarget: h.counterTarget,
        points: h.points,
        includeInScore: h.includeInScore,
        categoryName: h.category?.name ?? null,
        categoryColor: h.category?.color ?? null,
        currentValue: todayLog?.value ?? 0,
        currentCompleted: todayLog?.completed ?? false,
        weeklyAlreadyDone,
      };
    });

  const deadlines = projects.flatMap((p) => [
    ...(p.dueDate ? [{ label: p.title, date: p.dueDate, kind: "Projet", projectId: p.id }] : []),
    ...p.milestones.map((m) => ({ label: `${p.title} · ${m.name}`, date: m.dueDate!, kind: "Jalon", projectId: p.id })),
  ]).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-900">Aujourd&apos;hui</h1>
        <p className="text-sm text-canopy-600">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      <ScoreBanner score={score} />

      <PrioritiesPanel
        date={date}
        items={priorities.map((p) => ({ ...p, priorityLevel: p.priorityLevel as "HIGH" | "MEDIUM" | "LOW" }))}
      />

      <QuestCard weekStart={weekStart} quests={quests} />

      {deadlines.length > 0 && (
        <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
          <h2 className="font-display text-lg font-semibold text-canopy-900">Échéances proches</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {deadlines.map((d, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <Link href={`/projects/${d.projectId}`} className="text-canopy-800 hover:text-accent hover:underline">
                  <span className="mr-2 rounded-full bg-terracotta-100 px-2 py-0.5 text-[10px] font-medium text-terracotta-600">
                    {d.kind}
                  </span>
                  {d.label}
                </Link>
                <span className="text-xs text-canopy-500">
                  {new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-canopy-900">Objectifs du jour</h2>
        </div>

        {habitRows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft p-6 text-center text-sm text-canopy-500">
            Aucun objectif pour aujourd&apos;hui. Crée ton premier item pour commencer à faire pousser ton jardin.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {habitRows.map((h) => (
              <HabitRow key={h.id} habit={h} date={date} />
            ))}
          </ul>
        )}

        <AddHabitForm existingCategories={categories} />
      </div>

      <EnergyTracker
        date={date}
        initial={Object.fromEntries(energyLogs.map((e) => [e.period, e.value])) as Record<"MORNING" | "AFTERNOON" | "EVENING", number>}
      />

      <JournalBox date={date} initialNote={journal?.note ?? ""} />
    </div>
  );
}
