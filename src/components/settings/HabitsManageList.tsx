"use client";

import { useTransition } from "react";
import { archiveHabitAction } from "@/lib/actions/habit-actions";

export interface ManagedHabit {
  id: string;
  name: string;
  points: number;
  categoryName: string | null;
}

export function HabitsManageList({ habits }: { habits: ManagedHabit[] }) {
  const [, startTransition] = useTransition();

  if (habits.length === 0) {
    return <p className="text-sm text-canopy-400">Aucun objectif actif.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {habits.map((h) => (
        <li key={h.id} className="flex items-center justify-between gap-2 rounded-lg bg-parchment-100 px-3 py-2 text-sm">
          <span className="text-canopy-800">
            {h.name}
            {h.categoryName && <span className="ml-2 text-xs text-canopy-500">({h.categoryName})</span>}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-canopy-500">{h.points} pts</span>
            <button
              onClick={() => startTransition(async () => { await archiveHabitAction(h.id); })}
              className="text-xs text-canopy-400 hover:text-terracotta-600"
            >
              Archiver
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
