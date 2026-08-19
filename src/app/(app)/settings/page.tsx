import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUserRecord } from "@/lib/current-user";
import { todayStr, weekStartStr, toDateStr } from "@/lib/dates";
import { parseThresholds } from "@/lib/scoring";
import { levelFromXp, tierNameForLevel } from "@/lib/gamification";
import { ThresholdsForm } from "@/components/settings/ThresholdsForm";
import { HabitsManageList } from "@/components/settings/HabitsManageList";
import { EnergyTrendChart } from "@/components/settings/EnergyTrendChart";
import { WeeklyRetroForm } from "@/components/settings/WeeklyRetroForm";

export default async function SettingsPage() {
  const user = await requireUserRecord();
  const today = todayStr();
  const weekStart = weekStartStr(today);
  const energySince = toDateStr(subDays(new Date(), 30));

  const [habits, energyLogs, currentRetro, pastRetros] = await Promise.all([
    prisma.habitItem.findMany({
      where: { userId: user.id, archived: false },
      include: { category: true },
      orderBy: { order: "asc" },
    }),
    prisma.energyLog.findMany({ where: { userId: user.id, date: { gte: energySince } } }),
    prisma.weeklyRetro.findUnique({ where: { userId_weekStart: { userId: user.id, weekStart } } }),
    prisma.weeklyRetro.findMany({
      where: { userId: user.id, weekStart: { not: weekStart } },
      orderBy: { weekStart: "desc" },
      take: 5,
    }),
  ]);

  const thresholds = parseThresholds(user.scoreThresholds);
  const { level } = levelFromXp(user.xp);
  const tier = tierNameForLevel(level);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-900">Réglages</h1>
        <p className="text-sm text-canopy-600">
          {user.displayName} · @{user.username} · Niv. {level} ({tier}) · {user.xp} xp
        </p>
      </div>

      <ThresholdsForm initial={thresholds} />

      <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
        <h2 className="mb-1 font-display text-lg font-semibold text-canopy-900">Énergie — tendances</h2>
        <p className="mb-4 text-xs text-canopy-500">Moyenne sur les 30 derniers jours, par moment de la journée.</p>
        <EnergyTrendChart
          logs={energyLogs.map((e) => ({ period: e.period as "MORNING" | "AFTERNOON" | "EVENING", value: e.value }))}
        />
      </div>

      <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
        <h2 className="mb-1 font-display text-lg font-semibold text-canopy-900">Rétro hebdomadaire</h2>
        <p className="mb-4 text-xs text-canopy-500">Semaine du {new Date(weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
        <WeeklyRetroForm
          weekStart={weekStart}
          initial={{
            wentWell: currentRetro?.wentWell ?? "",
            didntWork: currentRetro?.didntWork ?? "",
            nextFocus: currentRetro?.nextFocus ?? "",
          }}
        />
        {pastRetros.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 border-t border-border-soft pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-canopy-500">Historique</p>
            {pastRetros.map((r) => (
              <div key={r.id} className="rounded-lg bg-parchment-100 p-3 text-sm">
                <p className="mb-1 text-xs font-medium text-canopy-500">
                  Semaine du {new Date(r.weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
                {r.wentWell && <p><span className="text-canopy-500">Bien : </span>{r.wentWell}</p>}
                {r.didntWork && <p><span className="text-canopy-500">Coincé : </span>{r.didntWork}</p>}
                {r.nextFocus && <p><span className="text-canopy-500">Focus : </span>{r.nextFocus}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
        <h2 className="mb-3 font-display text-lg font-semibold text-canopy-900">Objectifs actifs</h2>
        <HabitsManageList
          habits={habits.map((h) => ({ id: h.id, name: h.name, points: h.points, categoryName: h.category?.name ?? null }))}
        />
      </div>
    </div>
  );
}
