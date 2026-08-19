import type { Milestone, SubTask, Project } from "@prisma/client";

export function computeProjectProgress(
  project: Pick<Project, "status">,
  milestones: Pick<Milestone, "status">[],
  directSubTasks: Pick<SubTask, "done">[]
): number {
  if (milestones.length > 0) {
    const done = milestones.filter((m) => m.status === "DONE").length;
    return Math.round((done / milestones.length) * 100);
  }
  if (directSubTasks.length > 0) {
    const done = directSubTasks.filter((t) => t.done).length;
    return Math.round((done / directSubTasks.length) * 100);
  }
  if (project.status === "DONE") return 100;
  if (project.status === "IN_PROGRESS") return 50;
  return 0;
}
