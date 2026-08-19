"use client";

import { useRef, useTransition } from "react";
import { addSubTaskAction, toggleSubTaskAction, deleteSubTaskAction } from "@/lib/actions/project-actions";

export interface SubTaskData {
  id: string;
  name: string;
  done: boolean;
}

export function SubTaskList({
  projectId,
  milestoneId,
  tasks,
  compact,
}: {
  projectId: string;
  milestoneId?: string;
  tasks: SubTaskData[];
  compact?: boolean;
}) {
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className={compact ? "" : "rounded-xl border border-border-soft bg-surface p-4"}>
      {!compact && tasks.length > 0 && (
        <p className="mb-2 text-xs text-canopy-500">
          {done}/{tasks.length} sous-étapes
        </p>
      )}
      <ul className="flex flex-col gap-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-2 text-sm">
            <button
              type="button"
              role="checkbox"
              aria-checked={t.done}
              onClick={() => startTransition(async () => { await toggleSubTaskAction(t.id, projectId); })}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] ${
                t.done ? "border-canopy-600 bg-canopy-600 text-white" : "border-canopy-400"
              }`}
            >
              {t.done && "✓"}
            </button>
            <span className={`flex-1 ${t.done ? "text-canopy-400 line-through" : "text-foreground"}`}>{t.name}</span>
            <button
              type="button"
              aria-label="Supprimer"
              onClick={() => startTransition(async () => { await deleteSubTaskAction(t.id, projectId); })}
              className="text-canopy-300 hover:text-terracotta-500"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        ref={formRef}
        action={(fd) => startTransition(async () => {
          await addSubTaskAction({ projectId: milestoneId ? undefined : projectId, milestoneId }, fd);
          formRef.current?.reset();
        })}
        className="mt-2 flex gap-1.5"
      >
        <input
          name="name"
          placeholder="+ sous-étape"
          className="w-full min-w-0 flex-1 rounded-md border border-border-soft bg-parchment-50 px-2 py-1 text-xs"
        />
      </form>
    </div>
  );
}
