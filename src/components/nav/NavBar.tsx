"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/session-actions";

const NAV_ITEMS = [
  { href: "/today", label: "Aujourd'hui", icon: "☀️" },
  { href: "/garden", label: "Jardin", icon: "🌳" },
  { href: "/projects", label: "Projets", icon: "🗺️" },
  { href: "/sport", label: "Sport", icon: "🏃" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
];

export function NavBar({
  displayName,
  level,
  tierName,
}: {
  displayName: string;
  level: number;
  tierName: string;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop / top nav */}
      <header className="sticky top-0 z-40 hidden border-b border-border-soft bg-parchment-50/90 backdrop-blur-sm sm:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/today" className="flex items-center gap-2 font-display text-lg font-semibold text-canopy-900">
            <span aria-hidden="true">🌳</span> Canopée
          </Link>
          <nav className="flex items-center gap-1" aria-label="Navigation principale">
            {NAV_ITEMS.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-canopy-600 text-white" : "text-canopy-700 hover:bg-canopy-100"
                  }`}
                >
                  <span aria-hidden="true" className="mr-1.5">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-medium text-canopy-800 hover:bg-canopy-100"
              title={tierName}
            >
              Niv. {level} · {displayName}
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs font-medium text-canopy-600 hover:text-terracotta-600"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-soft bg-parchment-50/90 px-4 py-3 backdrop-blur-sm sm:hidden">
        <Link href="/today" className="flex items-center gap-2 font-display text-lg font-semibold text-canopy-900">
          <span aria-hidden="true">🌳</span> Canopée
        </Link>
        <Link
          href="/settings"
          className="rounded-full border border-border-soft bg-surface px-2.5 py-1 text-xs font-medium text-canopy-800"
        >
          Niv. {level}
        </Link>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-soft bg-parchment-50/95 backdrop-blur-sm sm:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-canopy-700" : "text-canopy-400"
              }`}
            >
              <span aria-hidden="true" className={`text-lg ${active ? "" : "opacity-60"}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
