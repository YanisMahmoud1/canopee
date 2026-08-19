import type { DayScore } from "@/types";
import { WeatherIcon, WEATHER_LABELS } from "./WeatherIcon";

export function ScoreBanner({ score }: { score: DayScore }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-parchment-100">
        <WeatherIcon state={score.weather} size={30} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl font-semibold text-canopy-900">
          {score.earned} <span className="text-base font-normal text-canopy-500">/ {score.possible} pts</span>
        </p>
        <p className="text-sm text-canopy-600">{WEATHER_LABELS[score.weather]}</p>
      </div>
      <div className="h-2 w-24 overflow-hidden rounded-full bg-parchment-200 sm:w-32">
        <div
          className="h-full rounded-full bg-canopy-500 transition-all"
          style={{ width: `${Math.round(score.fraction * 100)}%` }}
        />
      </div>
    </div>
  );
}
