import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { levelFromXp, tierNameForLevel } from "@/lib/gamification";

export default async function LeaderboardPage() {
  const sessionUser = await requireSessionUser();

  const users = await prisma.user.findMany({
    orderBy: { xp: "desc" },
    select: { id: true, username: true, displayName: true, xp: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-900">Classement</h1>
        <p className="text-sm text-canopy-600">Les jardins les plus florissants de la communauté.</p>
      </div>

      <ol className="flex flex-col gap-2">
        {users.map((u, i) => {
          const { level } = levelFromXp(u.xp);
          const tier = tierNameForLevel(level);
          const isMe = u.id === sessionUser.id;
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
          return (
            <li key={u.id}>
              <Link
                href={isMe ? "/garden" : `/garden/${u.username}`}
                className={`flex items-center gap-3 rounded-xl border p-3 transition-shadow hover:shadow-md ${
                  isMe ? "border-canopy-400 bg-canopy-100/50" : "border-border-soft bg-surface"
                }`}
              >
                <span className="w-8 text-center text-lg">{medal ?? `#${i + 1}`}</span>
                <span aria-hidden="true" className="text-2xl">🌳</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-canopy-900">
                    {u.displayName} {isMe && <span className="text-xs text-canopy-500">(toi)</span>}
                  </p>
                  <p className="text-xs text-canopy-500">
                    Niv. {level} · {tier}
                  </p>
                </div>
                <span className="text-sm font-semibold text-canopy-700">{u.xp} xp</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
