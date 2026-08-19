"use client";

import { useState, useTransition } from "react";
import { updateProjectNotesAction } from "@/lib/actions/project-actions";

export function NotesBox({ projectId, initialNotes }: { projectId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-xl border border-border-soft bg-surface p-4">
      <h3 className="mb-2 font-display text-base font-semibold text-canopy-900">Notes</h3>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => startTransition(async () => { await updateProjectNotesAction(projectId, notes); })}
        rows={5}
        placeholder="Idées, liens, contexte utile pour ce projet…"
        className="w-full resize-none rounded-lg border border-border-soft bg-parchment-50 px-3 py-2 text-sm"
      />
      <p className="mt-1 text-right text-xs text-canopy-400">{isPending ? "Enregistrement…" : ""}</p>
    </div>
  );
}
