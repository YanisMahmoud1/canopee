"use client";

import { useState } from "react";
import { subDays } from "date-fns";

export interface ExercisePoint {
  date: string;
  maxWeightKg: number;
}

const RANGES = [
  { key: "1m", label: "1 mois", days: 30 },
  { key: "3m", label: "3 mois", days: 90 },
  { key: "1y", label: "1 an", days: 365 },
] as const;

export function ExerciseProgress({ name, points, today }: { name: string; points: ExercisePoint[]; today: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("3m");
  const days = RANGES.find((r) => r.key === range)!.days;
  const cutoff = subDays(new Date(today), days).getTime();
  const filtered = points.filter((p) => new Date(p.date).getTime() >= cutoff);

  if (filtered.length === 0) {
    return null;
  }

  const max = Math.max(...filtered.map((p) => p.maxWeightKg));
  const min = Math.min(...filtered.map((p) => p.maxWeightKg));
  const range_ = Math.max(1, max - min);
  const w = 280;
  const h = 60;
  const pts = filtered.map((p, i) => {
    const x = filtered.length > 1 ? (i / (filtered.length - 1)) * w : w / 2;
    const y = h - ((p.maxWeightKg - min) / range_) * (h - 10) - 5;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl border border-border-soft bg-surface p-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-medium text-canopy-800">{name}</p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded px-1.5 py-0.5 text-[10px] ${range === r.key ? "bg-canopy-100 text-canopy-800" : "text-canopy-400"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-label={`Progression ${name}`}>
        <polyline points={pts.join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {filtered.map((p, i) => {
          const [x, y] = pts[i].split(",");
          return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent)" />;
        })}
      </svg>
      <p className="text-right text-xs text-canopy-500">max {max}kg</p>
    </div>
  );
}
