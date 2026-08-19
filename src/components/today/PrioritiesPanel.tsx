"use client";

import { useRef, useState, useTransition } from "react";
import { addPriorityAction, togglePriorityDoneAction, deletePriorityAction } from "@/lib/actions/priority-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface PriorityItem {
  id: string;
  label: string;
  priorityLevel: "HIGH" | "MEDIUM" | "LOW";
  isTop3: boolean;
  done: boolean;
  estimatedMin: number | null;
  actualMin: number | null;
}

const LEVEL_LABEL: Record<PriorityItem["priorityLevel"], string> = {
  HIGH: "Haute",
  MEDIUM: "Moyenne",
  LOW: "Basse",
};

export function PrioritiesPanel({ date, items }: { date: string; items: PriorityItem[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [showEstimate, setShowEstimate] = useState(false);

  const top3 = items.filter((i) => i.isTop3);
  const rest = items.filter((i) => !i.isTop3);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-canopy-900">Ce qui compte aujourd&apos;hui</h2>
      <p className="mb-3 text-xs text-canopy-500">Choisis 3 à 5 choses, pas une liste interminable.</p>

      {top3.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {top3.map((item) => (
            <PriorityRow key={item.id} item={item} highlighted />
          ))}
        </ul>
      )}
      {rest.length > 0 && (
        <ul className="mb-3 flex flex-col gap-2">
          {rest.map((item) => (
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
        <Input name="label" placeholder="Ajouter une priorité…" className="min-w-[160px] flex-1" required maxLength={120} />
        <select name="priorityLevel" defaultValue="MEDIUM" className="rounded-lg border border-border-soft bg-surface px-2.5 py-2 text-xs">
          <option value="HIGH">Haute</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="LOW">Basse</option>
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

function PriorityRow({ item, highlighted }: { item: PriorityItem; highlighted?: boolean }) {
  const [done, setDone] = useState(item.done);
  const [, startTransition] = useTransition();

  return (
    <li
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${
        highlighted ? "border border-terracotta-100 bg-terracotta-100/40" : "bg-parchment-100"
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
      <span className={`flex-1 ${done ? "text-canopy-400 line-through" : "text-foreground"}`}>{item.label}</span>
      {!highlighted && <span className="text-[10px] uppercase tracking-wide text-canopy-400">{LEVEL_LABEL[item.priorityLevel]}</span>}
      {item.estimatedMin != null && (
        <span className="text-[10px] text-canopy-400">~{item.estimatedMin}min</span>
      )}
      <button
        type="button"
        aria-label="Supprimer"
        onClick={() => startTransition(async () => { await deletePriorityAction(item.id); })}
        className="text-canopy-300 hover:text-terracotta-500"
      >
        ×
      </button>
    </li>
  );
}
