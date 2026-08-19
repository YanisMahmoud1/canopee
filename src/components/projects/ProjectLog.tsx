"use client";

import { useRef, useTransition } from "react";
import { addProjectLogAction } from "@/lib/actions/project-actions";

export interface LogEntryData {
  id: string;
  note: string;
  createdAt: string;
}

export function ProjectLog({ projectId, entries }: { projectId: string; entries: LogEntryData[] }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="rounded-xl border border-border-soft bg-surface p-4">
      <h3 className="mb-2 font-display text-base font-semibold text-canopy-900">Journal de bord</h3>
      <form
        ref={formRef}
        action={(fd) => startTransition(async () => {
          await addProjectLogAction(projectId, fd);
          formRef.current?.reset();
        })}
        className="mb-3 flex gap-2"
      >
        <input
          name="note"
          placeholder="Noter une avancée, une décision..."
          className="w-full min-w-0 flex-1 rounded-md border border-border-soft bg-parchment-50 px-2.5 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-canopy-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-canopy-700"
        >
          Noter
        </button>
      </form>
      {entries.length === 0 ? (
        <p className="text-sm text-canopy-400">Aucune entrée pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li key={e.id} className="border-l-2 border-canopy-200 pl-3 text-sm">
              <p className="text-canopy-800">{e.note}</p>
              <p className="text-xs text-canopy-400">
                {new Date(e.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
