"use client";

import { useRef, useState } from "react";
import { createSportSessionAction } from "@/lib/actions/sport-actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { todayStr } from "@/lib/dates";

interface SetRow {
  reps: string;
  weightKg: string;
}
interface ExerciseBlock {
  name: string;
  sets: SetRow[];
}

export function SessionForm({ knownActivities, knownExercises }: { knownActivities: string[]; knownExercises: string[] }) {
  const [open, setOpen] = useState(false);
  const [exercises, setExercises] = useState<ExerciseBlock[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Nouvelle séance
      </Button>
    );
  }

  function addExercise() {
    setExercises((ex) => [...ex, { name: "", sets: [{ reps: "", weightKg: "" }] }]);
  }
  function updateExerciseName(i: number, name: string) {
    setExercises((ex) => ex.map((e, idx) => (idx === i ? { ...e, name } : e)));
  }
  function addSet(i: number) {
    setExercises((ex) => ex.map((e, idx) => (idx === i ? { ...e, sets: [...e.sets, { reps: "", weightKg: "" }] } : e)));
  }
  function updateSet(i: number, si: number, field: keyof SetRow, value: string) {
    setExercises((ex) =>
      ex.map((e, idx) =>
        idx === i ? { ...e, sets: e.sets.map((s, sidx) => (sidx === si ? { ...s, [field]: value } : s)) } : e
      )
    );
  }
  function removeExercise(i: number) {
    setExercises((ex) => ex.filter((_, idx) => idx !== i));
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const payload = exercises
          .filter((e) => e.name.trim())
          .map((e) => ({
            name: e.name.trim(),
            sets: e.sets
              .filter((s) => s.reps && s.weightKg)
              .map((s) => ({ reps: Number(s.reps), weightKg: Number(s.weightKg) })),
          }));
        formData.set("exercisesJson", JSON.stringify(payload));
        await createSportSessionAction(formData);
        formRef.current?.reset();
        setExercises([]);
        setOpen(false);
      }}
      className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="activityType">Activité</Label>
          <Input id="activityType" name="activityType" list="known-activities" required placeholder="Ex : Musculation, Course..." />
          <datalist id="known-activities">
            {knownActivities.map((a) => <option key={a} value={a} />)}
          </datalist>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={todayStr()} required />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="durationMin">Durée (min)</Label>
          <Input id="durationMin" name="durationMin" type="number" min={0} />
        </div>
        <div>
          <Label htmlFor="rpe">Ressenti (RPE 1-10)</Label>
          <Input id="rpe" name="rpe" type="number" min={1} max={10} />
        </div>
        <div>
          <Label htmlFor="heartRate">FC moy. (optionnel)</Label>
          <Input id="heartRate" name="heartRate" type="number" min={0} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="energyBefore">Énergie avant (1-10)</Label>
          <Input id="energyBefore" name="energyBefore" type="number" min={1} max={10} />
        </div>
        <div>
          <Label htmlFor="energyAfter">Énergie après (1-10)</Label>
          <Input id="energyAfter" name="energyAfter" type="number" min={1} max={10} />
        </div>
      </div>

      <details className="rounded-lg border border-border-soft p-3">
        <summary className="cursor-pointer text-sm font-medium text-canopy-700">Cardio / endurance (optionnel)</summary>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="distanceKm">Distance (km)</Label>
            <Input id="distanceKm" name="distanceKm" type="number" step="0.01" min={0} />
          </div>
          <div>
            <Label htmlFor="paceOrSpeed">Allure / vitesse</Label>
            <Input id="paceOrSpeed" name="paceOrSpeed" placeholder="5:30/km" />
          </div>
          <div>
            <Label htmlFor="elevationGain">Dénivelé (m)</Label>
            <Input id="elevationGain" name="elevationGain" type="number" min={0} />
          </div>
        </div>
      </details>

      <div className="rounded-lg border border-border-soft p-3">
        <p className="mb-2 text-sm font-medium text-canopy-700">Musculation (optionnel)</p>
        <div className="flex flex-col gap-3">
          {exercises.map((ex, i) => (
            <div key={i} className="rounded-lg bg-parchment-100 p-3">
              <div className="mb-2 flex items-center gap-2">
                <input
                  list="known-exercises"
                  value={ex.name}
                  onChange={(e) => updateExerciseName(i, e.target.value)}
                  placeholder="Exercice (ex : Squat)"
                  className="w-full min-w-0 flex-1 rounded-md border border-border-soft bg-surface px-2.5 py-1.5 text-sm"
                />
                <button type="button" onClick={() => removeExercise(i)} className="text-canopy-300 hover:text-terracotta-500">
                  ×
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {ex.sets.map((s, si) => (
                  <div key={si} className="flex items-center gap-2 text-xs">
                    <span className="w-10 text-canopy-500">Série {si + 1}</span>
                    <input
                      value={s.reps}
                      onChange={(e) => updateSet(i, si, "reps", e.target.value)}
                      type="number"
                      min={0}
                      placeholder="reps"
                      className="w-16 rounded-md border border-border-soft bg-surface px-2 py-1"
                    />
                    <input
                      value={s.weightKg}
                      onChange={(e) => updateSet(i, si, "weightKg", e.target.value)}
                      type="number"
                      min={0}
                      step="0.5"
                      placeholder="kg"
                      className="w-16 rounded-md border border-border-soft bg-surface px-2 py-1"
                    />
                  </div>
                ))}
                <button type="button" onClick={() => addSet(i)} className="w-fit text-xs text-canopy-500 underline decoration-dotted">
                  + série
                </button>
              </div>
            </div>
          ))}
          <datalist id="known-exercises">
            {knownExercises.map((e) => <option key={e} value={e} />)}
          </datalist>
          <button type="button" onClick={addExercise} className="w-fit text-sm text-accent underline decoration-dotted">
            + Ajouter un exercice
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea id="notes" name="notes" rows={2} className="w-full resize-none rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm" />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Enregistrer la séance</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
      </div>
    </form>
  );
}
