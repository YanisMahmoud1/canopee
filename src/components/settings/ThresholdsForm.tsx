"use client";

import { useState, useTransition } from "react";
import { saveThresholdsAction } from "@/lib/actions/habit-actions";

export function ThresholdsForm({ initial }: { initial: { sun: number; cloud: number } }) {
  const [sun, setSun] = useState(Math.round(initial.sun * 100));
  const [cloud, setCloud] = useState(Math.round(initial.cloud * 100));
  const [, startTransition] = useTransition();

  function commit(nextSun: number, nextCloud: number) {
    startTransition(async () => {
      await saveThresholdsAction(nextSun / 100, nextCloud / 100);
    });
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="mb-1 font-display text-lg font-semibold text-canopy-900">Seuils météo</h2>
      <p className="mb-4 text-xs text-canopy-500">
        % des points possibles atteints pour que ta journée soit ☀️ ensoleillée ou ☁️ nuageuse (en dessous : 🌧️ pluvieuse).
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>☀️ Ensoleillé à partir de</span>
            <span className="font-semibold">{sun}%</span>
          </div>
          <input
            type="range"
            min={cloud + 5}
            max={100}
            value={sun}
            onChange={(e) => setSun(Number(e.target.value))}
            onPointerUp={() => commit(sun, cloud)}
            className="w-full accent-[var(--primary)]"
          />
        </div>
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span>☁️ Nuageux à partir de</span>
            <span className="font-semibold">{cloud}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={sun - 5}
            value={cloud}
            onChange={(e) => setCloud(Number(e.target.value))}
            onPointerUp={() => commit(sun, cloud)}
            className="w-full accent-[var(--weather-cloud)]"
          />
        </div>
      </div>
    </div>
  );
}
