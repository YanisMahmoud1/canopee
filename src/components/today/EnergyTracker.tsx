"use client";

import { useState, useTransition } from "react";
import { saveEnergyLogAction } from "@/lib/actions/energy-actions";

const PERIODS = [
  { key: "MORNING", label: "Matin" },
  { key: "AFTERNOON", label: "Après-midi" },
  { key: "EVENING", label: "Soir" },
] as const;

export function EnergyTracker({
  date,
  initial,
}: {
  date: string;
  initial: Partial<Record<"MORNING" | "AFTERNOON" | "EVENING", number>>;
}) {
  const [values, setValues] = useState(initial);
  const [, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-canopy-900">Niveau d&apos;énergie</h2>
      <div className="grid grid-cols-3 gap-3">
        {PERIODS.map((p) => (
          <div key={p.key} className="flex flex-col items-center gap-1">
            <span className="text-xs text-canopy-500">{p.label}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={values[p.key] ?? 5}
              onChange={(e) => {
                const v = Number(e.target.value);
                setValues((s) => ({ ...s, [p.key]: v }));
              }}
              onPointerUp={() =>
                startTransition(async () => {
                  await saveEnergyLogAction(date, p.key, values[p.key] ?? 5);
                })
              }
              className="w-full accent-[var(--primary)]"
              aria-label={`Énergie ${p.label}`}
            />
            <span className="text-sm font-semibold text-canopy-800">{values[p.key] ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
