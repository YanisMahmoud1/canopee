"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { DayScore } from "@/types";
import type { DayDetailEntry } from "@/lib/calendar";
import { toDateStr } from "@/lib/dates";
import { WeatherIcon, WEATHER_LABELS } from "./WeatherIcon";

type ViewMode = "month" | "quarter" | "year";

const WEATHER_BG: Record<DayScore["weather"], string> = {
  sun: "var(--weather-sun)",
  cloud: "var(--weather-cloud)",
  rain: "var(--weather-rain)",
  empty: "var(--weather-empty)",
};

export function Heatmap({
  scores,
  details,
  notes,
}: {
  scores: Record<string, DayScore>;
  details: Record<string, DayDetailEntry[]>;
  notes: Record<string, string>;
}) {
  const [view, setView] = useState<ViewMode>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);

  const shift = (dir: 1 | -1) => {
    setAnchor((a) =>
      view === "year" ? addYears(a, dir) : view === "quarter" ? addMonths(a, dir * 3) : addMonths(a, dir)
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-border-soft bg-parchment-100 p-1">
          {(["month", "quarter", "year"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v ? "bg-surface text-canopy-800 shadow-sm" : "text-canopy-500"
              }`}
            >
              {v === "month" ? "Mois" : v === "quarter" ? "Trimestre" : "Année"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm text-canopy-700">
          <button onClick={() => shift(-1)} aria-label="Période précédente" className="rounded-full px-2 py-1 hover:bg-canopy-100">
            ←
          </button>
          <span className="min-w-[9rem] text-center font-medium capitalize">
            {view === "year"
              ? format(anchor, "yyyy")
              : view === "quarter"
              ? `T${Math.floor(anchor.getMonth() / 3) + 1} ${format(anchor, "yyyy")}`
              : format(anchor, "MMMM yyyy", { locale: fr })}
          </span>
          <button onClick={() => shift(1)} aria-label="Période suivante" className="rounded-full px-2 py-1 hover:bg-canopy-100">
            →
          </button>
        </div>
      </div>

      {view === "month" && <MonthGrid anchor={anchor} scores={scores} selected={selected} onSelect={setSelected} />}
      {view === "quarter" && <QuarterGrid anchor={anchor} scores={scores} selected={selected} onSelect={setSelected} />}
      {view === "year" && <YearGrid anchor={anchor} scores={scores} selected={selected} onSelect={setSelected} />}

      <Legend />

      {selected && (
        <DayDetail
          date={selected}
          score={scores[selected]}
          entries={details[selected] ?? []}
          note={notes[selected]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-canopy-500">
      {(["sun", "cloud", "rain", "empty"] as const).map((w) => (
        <span key={w} className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: WEATHER_BG[w] }} />
          {WEATHER_LABELS[w]}
        </span>
      ))}
    </div>
  );
}

function DayCell({
  date,
  score,
  selected,
  onSelect,
  size = 34,
  showNumber = true,
}: {
  date: string;
  score?: DayScore;
  selected: boolean;
  onSelect: (d: string) => void;
  size?: number;
  showNumber?: boolean;
}) {
  const weather = score?.weather ?? "empty";
  const dayNum = Number(date.slice(-2));
  const isFuture = new Date(date) > new Date();
  return (
    <button
      type="button"
      disabled={isFuture}
      onClick={() => onSelect(date)}
      title={`${date}${score ? ` · ${score.earned}/${score.possible} pts` : ""}`}
      style={{ width: size, height: size, backgroundColor: isFuture ? "transparent" : WEATHER_BG[weather] }}
      className={`flex items-center justify-center rounded-md text-[10px] font-medium transition-transform hover:scale-105 disabled:cursor-default disabled:opacity-0 ${
        selected ? "ring-2 ring-offset-1" : ""
      } ${weather === "empty" ? "text-canopy-400" : "text-white/90"}`}
    >
      {showNumber ? dayNum : ""}
    </button>
  );
}

function MonthGrid({
  anchor,
  scores,
  selected,
  onSelect,
}: {
  anchor: Date;
  scores: Record<string, DayScore>;
  selected: string | null;
  onSelect: (d: string) => void;
}) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weekdayLabels = ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div>
      <div className="mb-1 grid grid-cols-7 gap-1.5 text-center text-[11px] text-canopy-400">
        {weekdayLabels.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const ds = toDateStr(d);
          const inMonth = d.getMonth() === anchor.getMonth();
          return (
            <div key={ds} className={inMonth ? "" : "opacity-30"}>
              <DayCell date={ds} score={scores[ds]} selected={selected === ds} onSelect={onSelect} size={38} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuarterGrid({
  anchor,
  scores,
  selected,
  onSelect,
}: {
  anchor: Date;
  scores: Record<string, DayScore>;
  selected: string | null;
  onSelect: (d: string) => void;
}) {
  const quarterStartMonth = Math.floor(anchor.getMonth() / 3) * 3;
  const months = [0, 1, 2].map((i) => new Date(anchor.getFullYear(), quarterStartMonth + i, 1));
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {months.map((m) => (
        <div key={m.toISOString()}>
          <p className="mb-2 text-center text-sm font-medium capitalize text-canopy-700">
            {format(m, "MMMM", { locale: fr })}
          </p>
          <MonthGrid anchor={m} scores={scores} selected={selected} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

function YearGrid({
  anchor,
  scores,
  selected,
  onSelect,
}: {
  anchor: Date;
  scores: Record<string, DayScore>;
  selected: string | null;
  onSelect: (d: string) => void;
}) {
  const start = startOfWeek(startOfYear(anchor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfYear(anchor), { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start, end });

  const weeks = useMemo(() => {
    const w: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) w.push(allDays.slice(i, i + 7));
    return w;
  }, [allDays]);

  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ index: i, label: format(week[0], "MMM", { locale: fr }) });
      lastMonth = m;
    }
  });

  return (
    <div className="overflow-x-auto pb-2">
      <div className="relative mb-1 h-4" style={{ width: weeks.length * 15 }}>
        {monthLabels.map((m) => (
          <span key={m.index} className="absolute text-[10px] capitalize text-canopy-400" style={{ left: m.index * 15 }}>
            {m.label}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((d) => {
              const ds = toDateStr(d);
              const inYear = d.getFullYear() === anchor.getFullYear();
              return inYear ? (
                <DayCell key={ds} date={ds} score={scores[ds]} selected={selected === ds} onSelect={onSelect} size={12} showNumber={false} />
              ) : (
                <div key={ds} style={{ width: 12, height: 12 }} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayDetail({
  date,
  score,
  entries,
  note,
  onClose,
}: {
  date: string;
  score?: DayScore;
  entries: DayDetailEntry[];
  note?: string;
  onClose: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WeatherIcon state={score?.weather ?? "empty"} size={22} />
          <h3 className="font-display text-lg font-semibold text-canopy-900 capitalize">
            {format(new Date(date), "EEEE d MMMM yyyy", { locale: fr })}
          </h3>
        </div>
        <button onClick={onClose} aria-label="Fermer" className="text-canopy-400 hover:text-canopy-700">
          ×
        </button>
      </div>
      {score && (
        <p className="mb-2 text-sm text-canopy-600">
          {score.earned} / {score.possible} pts
        </p>
      )}
      {entries.length > 0 ? (
        <ul className="mb-3 flex flex-col gap-1.5">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {e.categoryColor && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.categoryColor }} />}
                <span className={e.completed ? "text-canopy-800" : "text-canopy-400 line-through"}>{e.habitName}</span>
              </span>
              <span className="text-xs text-canopy-500">
                {e.pointsEarned}/{e.points} pts
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-3 text-sm text-canopy-400">Aucune donnée ce jour-là.</p>
      )}
      {note && (
        <p className="rounded-lg bg-parchment-100 p-3 text-sm italic text-canopy-700">&laquo; {note} &raquo;</p>
      )}
    </div>
  );
}
