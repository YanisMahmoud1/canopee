"use client";

import { useRef, useState, useTransition } from "react";
import {
  addMilestoneAction,
  updateMilestoneStatusAction,
  deleteMilestoneAction,
} from "@/lib/actions/project-actions";
import { SubTaskList, type SubTaskData } from "./SubTaskList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface MilestoneData {
  id: string;
  name: string;
  dueDate: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  subTasks: SubTaskData[];
}

const COLUMNS: { status: MilestoneData["status"]; label: string }[] = [
  { status: "TODO", label: "À faire" },
  { status: "IN_PROGRESS", label: "En cours" },
  { status: "DONE", label: "Fait" },
];

export function MilestoneBoard({ projectId, milestones }: { projectId: string; milestones: MilestoneData[] }) {
  const [view, setView] = useState<"kanban" | "timeline">("kanban");
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-canopy-900">Jalons</h2>
        <div className="flex gap-1 rounded-lg border border-border-soft bg-parchment-100 p-1">
          <button
            onClick={() => setView("kanban")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${view === "kanban" ? "bg-surface text-canopy-800 shadow-sm" : "text-canopy-500"}`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("timeline")}
            className={`rounded-md px-3 py-1 text-xs font-medium ${view === "timeline" ? "bg-surface text-canopy-800 shadow-sm" : "text-canopy-500"}`}
          >
            Timeline
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.status} className="flex flex-col gap-2 rounded-xl bg-parchment-100 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-canopy-500">{col.label}</p>
              {milestones
                .filter((m) => m.status === col.status)
                .map((m) => (
                  <div key={m.id} className="rounded-lg border border-border-soft bg-surface p-3">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-canopy-900">{m.name}</p>
                      <button
                        aria-label="Supprimer le jalon"
                        onClick={() => startTransition(async () => { await deleteMilestoneAction(m.id, projectId); })}
                        className="text-canopy-300 hover:text-terracotta-500"
                      >
                        ×
                      </button>
                    </div>
                    {m.dueDate && (
                      <p className="mb-2 text-xs text-canopy-500">
                        {new Date(m.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    )}
                    <SubTaskList projectId={projectId} milestoneId={m.id} tasks={m.subTasks} compact />
                    <div className="mt-2 flex gap-1">
                      {COLUMNS.filter((c) => c.status !== m.status).map((c) => (
                        <button
                          key={c.status}
                          onClick={() => startTransition(async () => { await updateMilestoneStatusAction(m.id, c.status); })}
                          className="rounded-md border border-border-soft px-2 py-1 text-[11px] text-canopy-600 hover:bg-canopy-100"
                        >
                          → {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <TimelineView milestones={milestones} />
      )}

      <form
        ref={formRef}
        action={(fd) => startTransition(async () => {
          await addMilestoneAction(projectId, fd);
          formRef.current?.reset();
        })}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border-soft p-3"
      >
        <div className="min-w-[160px] flex-1">
          <Input name="name" placeholder="Nouveau jalon…" required />
        </div>
        <Input name="dueDate" type="date" className="w-40" />
        <Button type="submit" size="sm">Ajouter</Button>
      </form>
    </div>
  );
}

function TimelineView({ milestones }: { milestones: MilestoneData[] }) {
  const dated = milestones.filter((m) => m.dueDate).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  if (dated.length === 0) {
    return <p className="text-sm text-canopy-500">Aucun jalon avec une échéance à afficher sur la timeline.</p>;
  }
  const min = new Date(dated[0].dueDate!).getTime();
  const max = new Date(dated[dated.length - 1].dueDate!).getTime();
  const span = Math.max(1, max - min);

  return (
    <div className="overflow-x-auto py-6">
      <div className="relative h-1 min-w-[600px] rounded-full bg-canopy-200">
        {dated.map((m) => {
          const pct = ((new Date(m.dueDate!).getTime() - min) / span) * 100;
          const color = m.status === "DONE" ? "bg-canopy-600" : m.status === "IN_PROGRESS" ? "bg-terracotta-500" : "bg-canopy-300";
          return (
            <div key={m.id} className="absolute -top-2 flex flex-col items-center" style={{ left: `${pct}%` }}>
              <div className={`h-5 w-5 rounded-full border-2 border-surface ${color}`} title={m.name} />
              <span className="mt-1 w-24 -translate-x-1/2 text-center text-[11px] leading-tight text-canopy-700">
                {m.name}
              </span>
              <span className="text-[10px] text-canopy-400">
                {new Date(m.dueDate!).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
