"use client";

import { useRef, useState } from "react";
import { createHabitAction } from "@/lib/actions/habit-actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 0, label: "Dim" },
];

const CATEGORY_COLORS = ["#4f7a55", "#c96f42", "#7d5a3d", "#dfa63a", "#96a596", "#b1543f"];

export function AddHabitForm({ existingCategories }: { existingCategories: { name: string; color: string }[] }) {
  const [open, setOpen] = useState(false);
  const [trackingType, setTrackingType] = useState<"BOOLEAN" | "SCALE" | "COUNTER">("BOOLEAN");
  const [frequency, setFrequency] = useState<"DAILY" | "SPECIFIC_DAYS" | "WEEKLY">("DAILY");
  const [categoryColor, setCategoryColor] = useState(CATEGORY_COLORS[0]);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Ajouter un objectif
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createHabitAction(formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5"
    >
      <div>
        <Label htmlFor="name">Nom de l&apos;objectif</Label>
        <Input id="name" name="name" required maxLength={80} placeholder="Ex : Lecture du Coran" autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="trackingType">Type de suivi</Label>
          <select
            id="trackingType"
            name="trackingType"
            value={trackingType}
            onChange={(e) => setTrackingType(e.target.value as typeof trackingType)}
            className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2.5 text-sm"
          >
            <option value="BOOLEAN">Oui / Non</option>
            <option value="SCALE">Échelle</option>
            <option value="COUNTER">Compteur</option>
          </select>
        </div>
        <div>
          <Label htmlFor="points">Points si atteint</Label>
          <Input id="points" name="points" type="number" min={0} max={999} defaultValue={3} required />
        </div>
      </div>

      {trackingType === "SCALE" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="scaleMin">Min</Label>
            <Input id="scaleMin" name="scaleMin" type="number" defaultValue={1} />
          </div>
          <div>
            <Label htmlFor="scaleMax">Max</Label>
            <Input id="scaleMax" name="scaleMax" type="number" defaultValue={5} />
          </div>
        </div>
      )}

      {trackingType === "COUNTER" && (
        <div>
          <Label htmlFor="counterTarget">Objectif (nombre)</Label>
          <Input id="counterTarget" name="counterTarget" type="number" min={1} defaultValue={1} />
        </div>
      )}

      <div>
        <Label htmlFor="frequency">Fréquence</Label>
        <select
          id="frequency"
          name="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as typeof frequency)}
          className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2.5 text-sm"
        >
          <option value="DAILY">Tous les jours</option>
          <option value="SPECIFIC_DAYS">Certains jours</option>
          <option value="WEEKLY">Une fois par semaine</option>
        </select>
      </div>

      {frequency === "SPECIFIC_DAYS" && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Jours de la semaine">
          {WEEKDAYS.map((d) => (
            <label
              key={d.value}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-soft px-2.5 py-1.5 text-xs has-[:checked]:border-canopy-500 has-[:checked]:bg-canopy-100"
            >
              <input type="checkbox" name="specificDays" value={d.value} className="sr-only" />
              {d.label}
            </label>
          ))}
        </div>
      )}

      <div>
        <Label htmlFor="categoryName">Catégorie (optionnel)</Label>
        <Input
          id="categoryName"
          name="categoryName"
          list="existing-categories"
          maxLength={30}
          placeholder="Ex : Spiritualité, Santé, Travail..."
        />
        <datalist id="existing-categories">
          {existingCategories.map((c) => (
            <option key={c.name} value={c.name} />
          ))}
        </datalist>
        <div className="mt-2 flex gap-1.5">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Couleur ${c}`}
              onClick={() => setCategoryColor(c)}
              className="h-6 w-6 rounded-full ring-offset-2"
              style={{ backgroundColor: c, boxShadow: categoryColor === c ? `0 0 0 2px ${c}` : "none" }}
            />
          ))}
          <input type="hidden" name="categoryColor" value={categoryColor} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-canopy-800">
        <input type="checkbox" name="includeInScore" defaultChecked className="h-4 w-4 accent-[var(--primary)]" />
        Inclure dans le score du jour
      </label>

      <div className="flex gap-2">
        <Button type="submit">Créer l&apos;objectif</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
