"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { addPriorityAction, togglePriorityDoneAction, deletePriorityAction } from "@/lib/actions/priority-actions";
import { priorityTaskWeight, DIFFICULTY_LABELS, PRIORITY_LABELS } from "@/lib/gamification";
import type { PriorityLevel, TaskDifficulty } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface PriorityItem {
  id: string;
  label: string;
  priorityLevel: PriorityLevel;
  difficulty: TaskDifficulty;
  xpReward: number;
  done: boolean;
  estimatedMin: number | null;
  actualMin: number | null;
}

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  HIGH: "bg-terracotta-100 text-terracotta-600",
  MEDIUM: "bg-parchment-200 text-bark-700",
  LOW: "bg-canopy-100 text-canopy-700",
};

const DIFFICULTY_ICON: Record<TaskDifficulty, string> = {
  EASY: "🍃",
  MEDIUM: "🪵",
  HARD: "🪨",
};

export function PrioritiesPanel({ date, items }: { date: string; items: PriorityItem[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [showEstimate, setShowEstimate] = useState(false);

  const { sortedPending, sortedDone } = useMemo(() => {
    const withWeight = items.map((item) => ({
      item,
      weight: priorityTaskWeight(item.priorityLevel, item.difficulty),
    }));
    const byWeightDesc = (a: { weight: number }, b: { weight: number }) => b.weight - a.weight;
    return {
      sortedPending: withWeight.filter((w) => !w.item.done).sort(byWeightDesc).map((w) => w.item),
      sortedDone: withWeight.filter((w) => w.item.done).sort(byWeightDesc).map((w) => w.item),
    };
  }, [items]);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-canopy-900">Ce qui compte aujourd&apos;hui</h2>
      <p className="mb-3 text-xs text-canopy-500">
        Trié pour t&apos;aider à avaler le crapaud en premier — le plus relou et prioritaire tout en haut.
      </p>

      {sortedPending.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {sortedPending.map((item, i) => (
            <PriorityRow key={item.id} item={item} isFrog={i === 0} />
          ))}
        </ul>
      )}
      {sortedDone.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5 border-t border-border-soft pt-2">
          {sortedDone.map((item) => (
            <PriorityRow key={item.id} item={item} />
          ))}
        </ul>
      )}

      <form
        ref={formRef}
        action={(fd) => startTransition(async () => {
          await addPriorityAction(fd);
          formRef.current?.reset();
          setShowEstimate(false);
        })}
        className="flex flex-wrap items-center gap-2 border-t border-border-soft pt-3"
      >
        <input type="hidden" name="date" value={date} />
        <Input name="label" placeholder="Ajouter une tâche…" className="min-w-[160px] flex-1" required maxLength={120} />
        <select name="priorityLevel" defaultValue="MEDIUM" aria-label="Priorité" className="rounded-lg border border-border-soft bg-surface px-2.5 py-2 text-xs">
          <option value="HIGH">Priorité haute</option>
          <option value="MEDIUM">Priorité moyenne</option>
          <option value="LOW">Priorité basse</option>
        </select>
        <select name="difficulty" defaultValue="MEDIUM" aria-label="Difficulté" className="rounded-lg border border-border-soft bg-surface px-2.5 py-2 text-xs">
          <option value="EASY">🍃 Facile</option>
          <option value="MEDIUM">🪵 Moyenne</option>
          <option value="HARD">🪨 Relou</option>
        </select>
        <button
          type="button"
          onClick={() => setShowEstimate((v) => !v)}
          className="text-xs text-canopy-500 underline decoration-dotted"
        >
          {showEstimate ? "− temps estimé" : "+ temps estimé"}
        </button>
        {showEstimate && (
          <Input name="estimatedMin" type="number" min={0} placeholder="min" className="w-20" />
        )}
        <Button type="submit" size="sm" disabled={pending}>
          Ajouter
        </Button>
      </form>
    </div>
  );
}

function PriorityRow({ item, isFrog }: { item: PriorityItem; isFrog?: boolean }) {
  const [done, setDone] = useState(item.done);
  const [, startTransition] = useTransition();

  return (
    <li
      className={`flex flex-wrap items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${
        isFrog
          ? "border-2 border-terracotta-400 bg-terracotta-100/50"
          : done
          ? "bg-parchment-100/60"
          : "bg-parchment-100"
      }`}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={`Marquer "${item.label}" comme fait`}
        onClick={() => {
          setDone((d) => !d);
          startTransition(async () => {
            await togglePriorityDoneAction(item.id);
          });
        }}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          done ? "border-canopy-600 bg-canopy-600 text-white" : "border-canopy-400"
        }`}
      >
        {done && "✓"}
      </button>

      <div className="min-w-0 flex-1">
        {isFrog && !done && (
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-terracotta-600">
            🐸 Le crapaud du jour
          </p>
        )}
        <span className={done ? "text-canopy-400 line-through" : "text-foreground"}>{item.label}</span>
      </div>

      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_BADGE[item.priorityLevel]}`}>
        {PRIORITY_LABELS[item.priorityLevel]}
      </span>
      <span className="shrink-0 text-xs" title={DIFFICULTY_LABELS[item.difficulty]}>
        {DIFFICULTY_ICON[item.difficulty]} {DIFFICULTY_LABELS[item.difficulty]}
      </span>
      <span className="shrink-0 text-[11px] font-semibold text-canopy-600">+{item.xpReward}xp</span>
      {item.estimatedMin != null && (
        <span className="shrink-0 text-[10px] text-canopy-400">~{item.estimatedMin}min</span>
      )}
      <button
        type="button"
        aria-label="Supprimer"
        onClick={() => startTransition(async () => { await deletePriorityAction(item.id); })}
        className="shrink-0 text-canopy-300 hover:text-terracotta-500"
      >
        ×
      </button>
    </li>
  );
}
