"use client";

import { useTransition } from "react";
import { deleteSportSessionAction } from "@/lib/actions/sport-actions";

export interface SessionCardData {
  id: string;
  activityType: string;
  date: string;
  durationMin: number | null;
  rpe: number | null;
  distanceKm: number | null;
  paceOrSpeed: string | null;
  notes: string;
  sets: { exerciseName: string; reps: number; weightKg: number }[];
}

export function SessionCard({ session }: { session: SessionCardData }) {
  const [pending, startTransition] = useTransition();

  const byExercise = new Map<string, { reps: number; weightKg: number }[]>();
  for (const s of session.sets) {
    const arr = byExercise.get(s.exerciseName) ?? [];
    arr.push(s);
    byExercise.set(s.exerciseName, arr);
  }

  return (
    <div className={`rounded-xl border border-border-soft bg-surface p-4 ${pending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-canopy-900">{session.activityType}</p>
          <p className="text-xs text-canopy-500">
            {new Date(session.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            {session.durationMin ? ` · ${session.durationMin} min` : ""}
            {session.rpe ? ` · RPE ${session.rpe}/10` : ""}
          </p>
        </div>
        <button
          onClick={() => startTransition(async () => { await deleteSportSessionAction(session.id); })}
          className="text-xs text-canopy-300 hover:text-terracotta-500"
        >
          Supprimer
        </button>
      </div>

      {(session.distanceKm || session.paceOrSpeed) && (
        <p className="mt-1 text-xs text-canopy-600">
          {session.distanceKm ? `${session.distanceKm} km` : ""}
          {session.paceOrSpeed ? ` · ${session.paceOrSpeed}` : ""}
        </p>
      )}

      {byExercise.size > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {[...byExercise.entries()].map(([name, sets]) => (
            <li key={name} className="text-xs text-canopy-700">
              <span className="font-medium">{name}</span> :{" "}
              {sets.map((s, i) => (
                <span key={i}>
                  {s.reps}×{s.weightKg}kg{i < sets.length - 1 ? ", " : ""}
                </span>
              ))}
            </li>
          ))}
        </ul>
      )}

      {session.notes && <p className="mt-2 text-xs italic text-canopy-500">{session.notes}</p>}
    </div>
  );
}
