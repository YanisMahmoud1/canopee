"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  addPriorityAction,
  togglePriorityDoneAction,
  deletePriorityAction,
  movePriorityAction,
} from "@/lib/actions/priority-actions";
import { DIFFICULTY_LABELS, PRIORITY_LABELS } from "@/lib/gamification";
import type { PriorityLevel, TaskDifficulty } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TaskFocusOverlay } from "./TaskFocusOverlay";

export interface PriorityItem {
  id: string;
  label: string;
  priorityLevel: PriorityLevel;
  difficulty: TaskDifficulty;
  xpReward: number;
  order: number;
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
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const { sortedPending, sortedDone } = useMemo(() => {
    const byOrder = (a: PriorityItem, b: PriorityItem) => a.order - b.order;
    return {
      sortedPending: items.filter((i) => !i.done).sort(byOrder),
      sortedDone: items.filter((i) => i.done).sort(byOrder),
    };
  }, [items]);

  const focusedItem = items.find((i) => i.id === focusedId) ?? null;

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-canopy-900">Ce qui compte aujourd&apos;hui</h2>
      <p className="mb-3 text-xs text-canopy-500">
        Le plus pénible et prioritaire en tête pour avaler le crapaud en premier — clique une tâche pour la travailler en plein écran.
      </p>

      {sortedPending.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {sortedPending.map((item, i) => (
            <PriorityRow
              key={item.id}
              item={item}
              isFrog={i === 0}
              isFirst={i === 0}
              isLast={i === sortedPending.length - 1}
              onFocus={() => setFocusedId(item.id)}
            />
          ))}
        </ul>
      )}
      {sortedDone.length > 0 && (
        <ul className="mb-3 flex flex-col gap-1.5 border-t border-border-soft pt-2">
          {sortedDone.map((item, i) => (
            <PriorityRow
              key={item.id}
              item={item}
              isFirst={i === 0}
              isLast={i === sortedDone.length - 1}
            />
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
          <option value="HARD">🪨 Pénible</option>
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

      {focusedItem && (
        <TaskFocusOverlay
          id={focusedItem.id}
          label={focusedItem.label}
          priorityLevel={focusedItem.priorityLevel}
          difficulty={focusedItem.difficulty}
          xpReward={focusedItem.xpReward}
          estimatedMin={focusedItem.estimatedMin}
          onClose={() => setFocusedId(null)}
        />
      )}
    </div>
  );
}

function PriorityRow({
  item,
  isFrog,
  isFirst,
  isLast,
  onFocus,
}: {
  item: PriorityItem;
  isFrog?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onFocus?: () => void;
}) {
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
        {onFocus && !done ? (
          <button
            type="button"
            onClick={onFocus}
            className="text-left text-foreground underline decoration-transparent underline-offset-2 hover:decoration-canopy-400"
          >
            {item.label}
          </button>
        ) : (
          <span className={done ? "text-canopy-400 line-through" : "text-foreground"}>{item.label}</span>
        )}
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

      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          aria-label="Monter"
          disabled={isFirst}
          onClick={() => startTransition(async () => { await movePriorityAction(item.id, "up"); })}
          className="flex h-5 w-5 items-center justify-center rounded text-canopy-400 hover:bg-canopy-100 hover:text-canopy-700 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ▲
        </button>
        <button
          type="button"
          aria-label="Descendre"
          disabled={isLast}
          onClick={() => startTransition(async () => { await movePriorityAction(item.id, "down"); })}
          className="flex h-5 w-5 items-center justify-center rounded text-canopy-400 hover:bg-canopy-100 hover:text-canopy-700 disabled:opacity-20 disabled:hover:bg-transparent"
        >
          ▼
        </button>
      </div>

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
