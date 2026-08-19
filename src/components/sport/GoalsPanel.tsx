"use client";

import { useRef, useState, useTransition } from "react";
import { addSportGoalAction, deleteSportGoalAction } from "@/lib/actions/sport-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface GoalEntry {
  id: string;
  label: string;
  targetValue: number;
  unit: string;
  currentValue: number;
  targetDate: string | null;
}

export function GoalsPanel({ goals, knownExercises }: { goals: GoalEntry[]; knownExercises: string[] }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-canopy-900">Objectifs sport</h2>
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-accent">
          {open ? "Fermer" : "+ Objectif"}
        </button>
      </div>

      {goals.length === 0 ? (
        <p className="text-sm text-canopy-400">Aucun objectif défini.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            return (
              <li key={g.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-canopy-800">{g.label}</span>
                  <span className="text-canopy-500">
                    {g.currentValue}/{g.targetValue} {g.unit}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-parchment-200">
                  <div className="h-full rounded-full bg-terracotta-500" style={{ width: `${pct}%` }} />
                </div>
                <button
                  onClick={() => startTransition(async () => { await deleteSportGoalAction(g.id); })}
                  className="mt-1 text-[11px] text-canopy-300 hover:text-terracotta-500"
                >
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <form
          ref={formRef}
          action={(fd) => startTransition(async () => {
            await addSportGoalAction(fd);
            formRef.current?.reset();
            setOpen(false);
          })}
          className="mt-4 flex flex-col gap-2 border-t border-border-soft pt-3"
        >
          <Input name="exerciseName" list="goal-exercises" placeholder="Exercice (ex : Squat) ou laisser vide pour une activité" />
          <datalist id="goal-exercises">
            {knownExercises.map((e) => <option key={e} value={e} />)}
          </datalist>
          <Input name="activityType" placeholder="Ou activité (ex : Course 10km)" />
          <div className="flex gap-2">
            <Input name="targetValue" type="number" step="0.1" placeholder="Cible" required className="flex-1" />
            <Input name="unit" placeholder="kg, km..." required className="w-24" />
          </div>
          <Input name="targetDate" type="date" />
          <Button type="submit" size="sm">Ajouter l&apos;objectif</Button>
        </form>
      )}
    </div>
  );
}
