"use client";

import { useState, useTransition } from "react";
import { logHabitAction } from "@/lib/actions/habit-actions";

export interface HabitRowData {
  id: string;
  name: string;
  trackingType: "BOOLEAN" | "SCALE" | "COUNTER";
  scaleMin: number | null;
  scaleMax: number | null;
  counterTarget: number | null;
  points: number;
  includeInScore: boolean;
  categoryName: string | null;
  categoryColor: string | null;
  currentValue: number;
  currentCompleted: boolean;
  weeklyAlreadyDone: boolean;
}

export function HabitRow({ habit, date }: { habit: HabitRowData; date: string }) {
  const [value, setValue] = useState(habit.currentValue);
  const [completed, setCompleted] = useState(habit.currentCompleted);
  const [isPending, startTransition] = useTransition();

  function commit(newValue: number) {
    setValue(newValue);
    startTransition(async () => {
      await logHabitAction(habit.id, date, newValue);
    });
  }

  if (habit.weeklyAlreadyDone) {
    return (
      <Row habit={habit} completed>
        <span className="text-xs font-medium text-canopy-500">Fait cette semaine ✓</span>
      </Row>
    );
  }

  return (
    <Row habit={habit} completed={completed} pending={isPending}>
      {habit.trackingType === "BOOLEAN" && (
        <button
          type="button"
          role="switch"
          aria-checked={value >= 1}
          onClick={() => {
            const next = value >= 1 ? 0 : 1;
            setCompleted(next >= 1);
            commit(next);
          }}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
            value >= 1 ? "bg-canopy-600" : "bg-canopy-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              value >= 1 ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      )}

      {habit.trackingType === "SCALE" && (
        <div className="flex w-full max-w-[220px] items-center gap-2 sm:w-56">
          <input
            type="range"
            min={habit.scaleMin ?? 1}
            max={habit.scaleMax ?? 5}
            step={1}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              setValue(v);
              setCompleted(v >= (habit.scaleMin ?? 1));
            }}
            onPointerUp={() => commit(value)}
            onKeyUp={() => commit(value)}
            className="w-full accent-[var(--primary)]"
            aria-label={habit.name}
          />
          <span className="w-6 shrink-0 text-center text-sm font-semibold text-canopy-800">{value}</span>
        </div>
      )}

      {habit.trackingType === "COUNTER" && (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label="Diminuer"
            onClick={() => {
              const next = Math.max(0, value - 1);
              setCompleted(next >= (habit.counterTarget ?? 1));
              commit(next);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border-soft text-canopy-700 hover:bg-canopy-100"
          >
            −
          </button>
          <span className="w-14 text-center text-sm font-semibold text-canopy-800">
            {value}
            <span className="text-canopy-400"> / {habit.counterTarget ?? 1}</span>
          </span>
          <button
            type="button"
            aria-label="Augmenter"
            onClick={() => {
              const next = value + 1;
              setCompleted(next >= (habit.counterTarget ?? 1));
              commit(next);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border-soft text-canopy-700 hover:bg-canopy-100"
          >
            +
          </button>
        </div>
      )}
    </Row>
  );
}

function Row({
  habit,
  completed,
  pending,
  children,
}: {
  habit: HabitRowData;
  completed: boolean;
  pending?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 transition-opacity ${
        pending ? "opacity-70" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${completed ? "text-canopy-800" : "text-foreground"}`}>
          {habit.name}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-canopy-500">
          {habit.categoryName && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: `${habit.categoryColor}22`, color: habit.categoryColor ?? undefined }}
            >
              {habit.categoryName}
            </span>
          )}
          {habit.includeInScore ? (
            <span>+{habit.points} pts</span>
          ) : (
            <span className="italic">hors score</span>
          )}
        </div>
      </div>
      {children}
    </li>
  );
}
