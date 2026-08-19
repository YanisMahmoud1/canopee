import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { todayStr } from "@/lib/dates";
import { computeTreeState, levelFromXp, tierNameForLevel } from "@/lib/gamification";
import { TreeGarden, type GardenHabitEntry } from "@/components/garden/TreeGarden";

export default async function OtherGardenPage(props: PageProps<"/garden/[username]">) {
  const { username } = await props.params;
  const sessionUser = await requireSessionUser();

  if (username === sessionUser.username) redirect("/garden");

  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) notFound();

  const today = todayStr();
  const habits = await prisma.habitItem.findMany({
    where: { userId: target.id, archived: false },
    orderBy: { order: "asc" },
  });
  const logs = await prisma.habitLog.findMany({ where: { userId: target.id } });

  const { level } = levelFromXp(target.xp);
  const tier = tierNameForLevel(level);

  const entries: GardenHabitEntry[] = habits.map((h) => {
    const habitLogs = logs.filter((l) => l.habitItemId === h.id);
    const tree = computeTreeState(h, habitLogs, today);
    return { id: h.id, name: h.name, categoryColor: null, tree, isThirsty: false };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/leaderboard" className="text-sm text-canopy-500 hover:text-accent">
          ← Classement
        </Link>
        <h1 className="mt-1 font-display text-2xl font-semibold text-canopy-900">
          Le jardin de {target.displayName}
        </h1>
        <p className="text-sm text-canopy-600">
          Niv. {level} · {tier} · {target.xp} xp
        </p>
      </div>

      <TreeGarden entries={entries} />
    </div>
  );
}
