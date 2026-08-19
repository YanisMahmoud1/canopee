"use client";

import { useRef, useState, useTransition } from "react";
import { addQuestAction, toggleQuestAction, deleteQuestAction } from "@/lib/actions/quest-actions";

export interface QuestItem {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
}

export function QuestCard({ weekStart, quests }: { weekStart: string; quests: QuestItem[] }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-2xl border border-border-soft bg-gradient-to-br from-canopy-100/60 to-parchment-100 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-canopy-900">🍃 Quêtes de la semaine</h2>
        <button onClick={() => setOpen((v) => !v)} className="text-xs font-medium text-accent">
          {open ? "Fermer" : "+ Quête"}
        </button>
      </div>

      {quests.length === 0 ? (
        <p className="text-sm text-canopy-500">
          Ajoute un petit défi pour la semaine (ex : &laquo; 3 jours verts cette semaine &raquo;).
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {quests.map((q) => (
            <li key={q.id} className="flex items-center gap-2.5 rounded-lg bg-surface/70 px-3 py-2 text-sm">
              <button
                type="button"
                role="checkbox"
                aria-checked={q.completed}
                onClick={() => startTransition(async () => { await toggleQuestAction(q.id); })}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  q.completed ? "border-canopy-600 bg-canopy-600 text-white" : "border-canopy-400"
                }`}
              >
                {q.completed && "✓"}
              </button>
              <span className={`flex-1 ${q.completed ? "text-canopy-400 line-through" : "text-foreground"}`}>{q.title}</span>
              <span className="text-xs text-canopy-500">+{q.xpReward}xp</span>
              <button
                onClick={() => startTransition(async () => { await deleteQuestAction(q.id); })}
                className="text-canopy-300 hover:text-terracotta-500"
                aria-label="Supprimer"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form
          ref={formRef}
          action={(fd) => startTransition(async () => {
            await addQuestAction(weekStart, fd);
            formRef.current?.reset();
            setOpen(false);
          })}
          className="mt-3 flex gap-2"
        >
          <input type="hidden" name="xpReward" value={20} />
          <input
            name="title"
            required
            placeholder="Ex : 3 jours verts cette semaine"
            className="w-full min-w-0 flex-1 rounded-md border border-border-soft bg-surface px-2.5 py-1.5 text-sm"
          />
          <button type="submit" className="rounded-md bg-canopy-600 px-3 py-1.5 text-xs font-medium text-white">
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}
