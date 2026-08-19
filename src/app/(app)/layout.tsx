import { requireUserRecord } from "@/lib/current-user";
import { levelFromXp, tierNameForLevel } from "@/lib/gamification";
import { NavBar } from "@/components/nav/NavBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUserRecord();
  const { level } = levelFromXp(user.xp);
  const tierName = tierNameForLevel(level);

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar displayName={user.displayName} level={level} tierName={tierName} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-10">
        {children}
      </main>
    </div>
  );
}
