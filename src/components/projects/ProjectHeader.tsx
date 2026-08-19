"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveProjectAction, updateProjectStatusAction } from "@/lib/actions/project-actions";

const STATUS_LABEL: Record<string, string> = { TODO: "À faire", IN_PROGRESS: "En cours", DONE: "Terminé" };

export function ProjectHeader({ id, status }: { id: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(e) => startTransition(async () => { await updateProjectStatusAction(id, e.target.value); })}
        disabled={pending}
        className="rounded-lg border border-border-soft bg-surface px-2.5 py-1.5 text-xs font-medium text-canopy-700"
      >
        {Object.entries(STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      <button
        onClick={() => startTransition(async () => { await archiveProjectAction(id); router.push("/projects"); })}
        className="text-xs text-canopy-400 hover:text-terracotta-600"
      >
        Archiver
      </button>
    </div>
  );
}
