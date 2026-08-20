"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { togglePriorityDoneAction } from "@/lib/actions/priority-actions";
import { DIFFICULTY_LABELS, PRIORITY_LABELS } from "@/lib/gamification";
import type { PriorityLevel, TaskDifficulty } from "@/types";

const DIFFICULTY_ICON: Record<TaskDifficulty, string> = { EASY: "🍃", MEDIUM: "🪵", HARD: "🪨" };

function growthEmoji(fraction: number) {
  if (fraction >= 1) return "🌳";
  if (fraction >= 0.5) return "🌿";
  return "🌱";
}

function formatClock(totalSeconds: number) {
  const m = Math.floor(Math.abs(totalSeconds) / 60);
  const s = Math.abs(totalSeconds) % 60;
  return `${totalSeconds < 0 ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}

export function TaskFocusOverlay({
  id,
  label,
  priorityLevel,
  difficulty,
  xpReward,
  estimatedMin,
  onClose,
}: {
  id: string;
  label: string;
  priorityLevel: PriorityLevel;
  difficulty: TaskDifficulty;
  xpReward: number;
  estimatedMin: number | null;
  onClose: () => void;
}) {
  const hasTimer = estimatedMin != null && estimatedMin > 0;
  const totalSeconds = hasTimer ? estimatedMin! * 60 : 0;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(hasTimer);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!hasTimer || !running) return;
    const interval = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(interval);
  }, [hasTimer, running]);

  const elapsed = totalSeconds - remaining;
  const fraction = hasTimer ? Math.min(1, Math.max(0, elapsed / totalSeconds)) : 0;
  const overtime = remaining < 0;
  const circumference = 2 * Math.PI * 54;

  function markDone() {
    startTransition(async () => {
      const actualMin = hasTimer ? Math.max(1, Math.round(elapsed / 60)) : undefined;
      await togglePriorityDoneAction(id, actualMin);
      onClose();
    });
  }

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-50 flex items-center justify-center bg-canopy-950/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-border-soft bg-gradient-to-b from-canopy-100 via-parchment-50 to-parchment-100 p-8 text-center shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-canopy-500 hover:bg-canopy-100 hover:text-canopy-800"
        >
          ×
        </button>

        <div className="flex gap-2">
          <span className="rounded-full bg-terracotta-100 px-3 py-1 text-xs font-medium text-terracotta-600">
            Priorité {PRIORITY_LABELS[priorityLevel]}
          </span>
          <span className="rounded-full bg-parchment-200 px-3 py-1 text-xs font-medium text-bark-700">
            {DIFFICULTY_ICON[difficulty]} {DIFFICULTY_LABELS[difficulty]}
          </span>
        </div>

        <h2 className="font-display text-2xl font-semibold leading-snug text-canopy-950">{label}</h2>

        {hasTimer ? (
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--parchment-200)" strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={overtime ? "var(--terracotta-500)" : "var(--canopy-500)"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - (overtime ? 1 : fraction))}
                className="transition-[stroke-dashoffset] duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl">{overtime ? "🌳" : growthEmoji(fraction)}</span>
              <span className={`font-display text-2xl font-semibold ${overtime ? "text-terracotta-600" : "text-canopy-900"}`}>
                {formatClock(remaining)}
              </span>
              {overtime && <span className="text-xs text-terracotta-600">Temps écoulé</span>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-canopy-500">Pas de temps estimé pour cette tâche — profite du calme du jardin.</p>
        )}

        {hasTimer && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="rounded-full border border-border-soft bg-surface px-4 py-1.5 text-sm font-medium text-canopy-700 hover:bg-canopy-100"
            >
              {running ? "Pause" : "Reprendre"}
            </button>
            <button
              type="button"
              onClick={() => {
                setRemaining(totalSeconds);
                setRunning(true);
              }}
              className="rounded-full border border-border-soft bg-surface px-4 py-1.5 text-sm font-medium text-canopy-700 hover:bg-canopy-100"
            >
              Réinitialiser
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={markDone}
          disabled={pending}
          className="w-full rounded-xl bg-canopy-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-canopy-700 disabled:opacity-50"
        >
          🌳 Marquer comme fait (+{xpReward}xp)
        </button>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
