"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { XP_RULES } from "@/lib/gamification";

const projectSchema = z.object({
  title: z.string().trim().min(1).max(100),
  type: z.enum(["LONG_TERM", "ONE_SHOT", "RECURRING"]),
  description: z.string().trim().max(2000).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const user = await requireSessionUser();
  const parsed = projectSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
  const data = parsed.data;

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      title: data.title,
      type: data.type,
      description: data.description ?? "",
      startDate: data.startDate ?? null,
      dueDate: data.dueDate ?? null,
    },
  });
  revalidatePath("/projects");
  return project.id;
}

export async function archiveProjectAction(id: string) {
  const user = await requireSessionUser();
  await prisma.project.updateMany({ where: { id, userId: user.id }, data: { archived: true } });
  revalidatePath("/projects");
}

export async function updateProjectStatusAction(id: string, status: string) {
  const user = await requireSessionUser();
  await prisma.project.updateMany({ where: { id, userId: user.id }, data: { status } });
  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
}

export async function updateProjectNotesAction(id: string, notes: string) {
  const user = await requireSessionUser();
  await prisma.project.updateMany({ where: { id, userId: user.id }, data: { notes } });
  revalidatePath(`/projects/${id}`);
}

// ---------- Milestones ----------

export async function addMilestoneAction(projectId: string, formData: FormData) {
  const user = await requireSessionUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const dueDate = (formData.get("dueDate") as string) || null;
  const count = await prisma.milestone.count({ where: { projectId } });
  await prisma.milestone.create({ data: { projectId, name, dueDate, order: count } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/today");
}

export async function updateMilestoneStatusAction(id: string, status: string) {
  const user = await requireSessionUser();
  const milestone = await prisma.milestone.findFirst({
    where: { id, project: { userId: user.id } },
    include: { project: true },
  });
  if (!milestone) return;

  const wasDone = milestone.status === "DONE";
  const willBeDone = status === "DONE";

  await prisma.milestone.update({ where: { id }, data: { status } });

  if (!wasDone && willBeDone) {
    await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: XP_RULES.milestoneDone } } });
  } else if (wasDone && !willBeDone) {
    await prisma.user.update({ where: { id: user.id }, data: { xp: { decrement: XP_RULES.milestoneDone } } });
  }

  revalidatePath(`/projects/${milestone.projectId}`);
  revalidatePath("/today");
  revalidatePath("/leaderboard");
}

export async function deleteMilestoneAction(id: string, projectId: string) {
  const user = await requireSessionUser();
  await prisma.milestone.deleteMany({ where: { id, project: { userId: user.id } } });
  revalidatePath(`/projects/${projectId}`);
}

// ---------- SubTasks ----------

export async function addSubTaskAction(
  target: { projectId?: string; milestoneId?: string },
  formData: FormData
) {
  const user = await requireSessionUser();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  if (target.projectId) {
    const project = await prisma.project.findFirst({ where: { id: target.projectId, userId: user.id } });
    if (!project) return;
    const count = await prisma.subTask.count({ where: { projectId: target.projectId } });
    await prisma.subTask.create({ data: { projectId: target.projectId, name, order: count } });
    revalidatePath(`/projects/${target.projectId}`);
  } else if (target.milestoneId) {
    const milestone = await prisma.milestone.findFirst({
      where: { id: target.milestoneId, project: { userId: user.id } },
    });
    if (!milestone) return;
    const count = await prisma.subTask.count({ where: { milestoneId: target.milestoneId } });
    await prisma.subTask.create({ data: { milestoneId: target.milestoneId, name, order: count } });
    revalidatePath(`/projects/${milestone.projectId}`);
  }
}

export async function toggleSubTaskAction(id: string, projectId: string) {
  const user = await requireSessionUser();
  const task = await prisma.subTask.findFirst({
    where: { id, OR: [{ project: { userId: user.id } }, { milestone: { project: { userId: user.id } } }] },
  });
  if (!task) return;
  const nextDone = !task.done;
  await prisma.subTask.update({ where: { id }, data: { done: nextDone } });
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: { increment: nextDone ? XP_RULES.subtaskDone : -XP_RULES.subtaskDone } },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteSubTaskAction(id: string, projectId: string) {
  const user = await requireSessionUser();
  await prisma.subTask.deleteMany({
    where: { id, OR: [{ project: { userId: user.id } }, { milestone: { project: { userId: user.id } } }] },
  });
  revalidatePath(`/projects/${projectId}`);
}

// ---------- Log entries ----------

export async function addProjectLogAction(projectId: string, formData: FormData) {
  const user = await requireSessionUser();
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return;
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  await prisma.projectLogEntry.create({ data: { projectId, note } });
  revalidatePath(`/projects/${projectId}`);
}
