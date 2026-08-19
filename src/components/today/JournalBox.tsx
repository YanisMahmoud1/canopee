"use client";

import { useState, useTransition } from "react";
import { saveJournalAction } from "@/lib/actions/habit-actions";

export function JournalBox({ date, initialNote }: { date: string; initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(true);

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-4 sm:p-5">
      <label htmlFor="journal" className="mb-2 block text-sm font-medium text-canopy-800">
        Comment s&apos;est passée la journée ? <span className="font-normal text-canopy-400">(optionnel)</span>
      </label>
      <textarea
        id="journal"
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        onBlur={() => {
          startTransition(async () => {
            await saveJournalAction(date, note);
            setSaved(true);
          });
        }}
        rows={3}
        placeholder="Fatigue, imprévu, ce qui t'a distrait..."
        className="w-full resize-none rounded-lg border border-border-soft bg-parchment-50 px-3 py-2 text-sm placeholder:text-canopy-400/70 focus-visible:outline-2 focus-visible:outline-ring"
      />
      <p className="mt-1 text-right text-xs text-canopy-400">
        {isPending ? "Enregistrement…" : saved ? "Enregistré" : ""}
      </p>
    </div>
  );
}
