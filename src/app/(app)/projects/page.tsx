import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { computeProjectProgress } from "@/lib/projects";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";

const SECTIONS: { type: string; title: string }[] = [
  { type: "LONG_TERM", title: "Projets long terme" },
  { type: "ONE_SHOT", title: "Objectifs one-shot" },
  { type: "RECURRING", title: "Récurrents / évolutifs" },
];

export default async function ProjectsPage() {
  const user = await requireSessionUser();

  const projects = await prisma.project.findMany({
    where: { userId: user.id, archived: false },
    include: { milestones: true, subTasks: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-canopy-900">Projets</h1>
          <p className="text-sm text-canopy-600">Tes chantiers en cours, du plus ambitieux au plus simple.</p>
        </div>
        <CreateProjectForm />
      </div>

      {projects.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border-soft p-8 text-center text-sm text-canopy-500">
          Aucun projet pour l&apos;instant. Crée le premier ci-dessus.
        </p>
      )}

      {SECTIONS.map((section) => {
        const items = projects.filter((p) => p.type === section.type);
        if (items.length === 0) return null;
        return (
          <div key={section.type}>
            <h2 className="mb-2 font-display text-lg font-semibold text-canopy-900">{section.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProjectCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  type={p.type}
                  dueDate={p.dueDate}
                  progress={computeProjectProgress(p, p.milestones, p.subTasks.filter((t) => !t.milestoneId))}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
