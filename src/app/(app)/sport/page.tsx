import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { todayStr } from "@/lib/dates";
import { SessionForm } from "@/components/sport/SessionForm";
import { SessionCard } from "@/components/sport/SessionCard";
import { RecordsShowcase, METRIC_LABEL } from "@/components/sport/RecordsShowcase";
import { ExerciseProgress } from "@/components/sport/ExerciseProgress";
import { GoalsPanel } from "@/components/sport/GoalsPanel";

export default async function SportPage() {
  const user = await requireSessionUser();

  const [sessions, records, exercises, goals] = await Promise.all([
    prisma.sportSession.findMany({
      where: { userId: user.id },
      include: { sets: { include: { exercise: true } } },
      orderBy: { date: "desc" },
      take: 30,
    }),
    prisma.personalRecord.findMany({
      where: { userId: user.id },
      include: { exercise: true },
      orderBy: { achievedAt: "desc" },
    }),
    prisma.exercise.findMany({ where: { userId: user.id }, include: { sets: true } }),
    prisma.sportGoal.findMany({ where: { userId: user.id, achieved: false } }),
  ]);

  const knownActivities = [...new Set(sessions.map((s) => s.activityType))];
  const knownExercises = exercises.map((e) => e.name);

  const recordEntries = records.slice(0, 9).map((r) => ({
    id: r.id,
    label: `${r.exercise?.name ?? r.activityType} · ${METRIC_LABEL[r.metric] ?? r.metric}`,
    value: r.value,
    unit: r.unit,
    achievedAt: r.achievedAt,
  }));

  const exerciseProgress = exercises
    .map((ex) => {
      const bySession = new Map<string, number>();
      for (const s of ex.sets) {
        const session = sessions.find((se) => se.id === s.sportSessionId);
        const date = session?.date;
        if (!date) continue;
        bySession.set(date, Math.max(bySession.get(date) ?? 0, s.weightKg));
      }
      const points = [...bySession.entries()]
        .map(([date, maxWeightKg]) => ({ date, maxWeightKg }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return { name: ex.name, points };
    })
    .filter((e) => e.points.length > 0);

  const goalEntries = goals.map((g) => {
    let currentValue = 0;
    const related = records.find((r) => (g.exerciseId && r.exerciseId === g.exerciseId) || (g.activityType && r.activityType === g.activityType));
    if (related) currentValue = related.value;
    const exercise = exercises.find((e) => e.id === g.exerciseId);
    return {
      id: g.id,
      label: exercise?.name ?? g.activityType ?? "Objectif",
      targetValue: g.targetValue,
      unit: g.unit,
      currentValue,
      targetDate: g.targetDate,
    };
  });

  const sessionCards = sessions.map((s) => ({
    id: s.id,
    activityType: s.activityType,
    date: s.date,
    durationMin: s.durationMin,
    rpe: s.rpe,
    distanceKm: s.distanceKm,
    paceOrSpeed: s.paceOrSpeed,
    notes: s.notes,
    sets: s.sets.map((st) => ({ exerciseName: st.exercise.name, reps: st.reps, weightKg: st.weightKg })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-canopy-900">Sport</h1>
          <p className="text-sm text-canopy-600">Séances, charges, records : le détail de ta pratique.</p>
        </div>
        <SessionForm knownActivities={knownActivities} knownExercises={knownExercises} />
      </div>

      <RecordsShowcase records={recordEntries} />

      {exerciseProgress.length > 0 && (
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-canopy-900">Évolution par exercice</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {exerciseProgress.map((e) => (
              <ExerciseProgress key={e.name} name={e.name} points={e.points} today={todayStr()} />
            ))}
          </div>
        </div>
      )}

      <GoalsPanel goals={goalEntries} knownExercises={knownExercises} />

      <div>
        <h2 className="mb-2 font-display text-lg font-semibold text-canopy-900">Séances récentes</h2>
        {sessionCards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-soft p-8 text-center text-sm text-canopy-500">
            Aucune séance enregistrée. Ajoute la première ci-dessus.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {sessionCards.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
