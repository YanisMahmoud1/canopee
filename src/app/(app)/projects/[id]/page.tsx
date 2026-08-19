import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { computeProjectProgress } from "@/lib/projects";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { MilestoneBoard } from "@/components/projects/MilestoneBoard";
import { SubTaskList } from "@/components/projects/SubTaskList";
import { ProjectLog } from "@/components/projects/ProjectLog";
import { NotesBox } from "@/components/projects/NotesBox";

const TYPE_LABEL: Record<string, string> = {
  LONG_TERM: "Projet long terme",
  ONE_SHOT: "Objectif one-shot",
  RECURRING: "Projet récurrent / évolutif",
};

export default async function ProjectDetailPage(props: PageProps<"/projects/[id]">) {
  const { id } = await props.params;
  const user = await requireSessionUser();

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: {
      milestones: {
        orderBy: { order: "asc" },
        include: { subTasks: { orderBy: { order: "asc" } } },
      },
      subTasks: { where: { milestoneId: null }, orderBy: { order: "asc" } },
      logEntries: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) notFound();

  const progress = computeProjectProgress(project, project.milestones, project.subTasks);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-canopy-500">{TYPE_LABEL[project.type]}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-canopy-900">{project.title}</h1>
          <ProjectHeader id={project.id} status={project.status} />
        </div>
        {project.description && <p className="mt-2 text-sm text-canopy-700">{project.description}</p>}
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-parchment-200">
            <div className="h-full rounded-full bg-canopy-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm text-canopy-600">{progress}%</span>
          {project.startDate && (
            <span className="text-xs text-canopy-400">
              Depuis le {new Date(project.startDate).toLocaleDateString("fr-FR")}
            </span>
          )}
          {project.dueDate && (
            <span className="text-xs text-canopy-400">
              Échéance : {new Date(project.dueDate).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      </div>

      {project.type === "ONE_SHOT" ? (
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold text-canopy-900">Étapes</h2>
          <SubTaskList projectId={project.id} tasks={project.subTasks} />
        </div>
      ) : (
        <MilestoneBoard
          projectId={project.id}
          milestones={project.milestones.map((m) => ({
            id: m.id,
            name: m.name,
            dueDate: m.dueDate,
            status: m.status as "TODO" | "IN_PROGRESS" | "DONE",
            subTasks: m.subTasks,
          }))}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <NotesBox projectId={project.id} initialNotes={project.notes} />
        <ProjectLog
          projectId={project.id}
          entries={project.logEntries.map((e) => ({ id: e.id, note: e.note, createdAt: e.createdAt.toISOString() }))}
        />
      </div>
    </div>
  );
}
