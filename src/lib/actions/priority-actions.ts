"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { priorityTaskXp } from "@/lib/gamification";
import type { PriorityLevel, TaskDifficulty } from "@/types";

export async function addPriorityAction(formData: FormData) {
  const user = await requireSessionUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const date = String(formData.get("date"));
  const priorityLevel = String(formData.get("priorityLevel") || "MEDIUM") as PriorityLevel;
  const difficulty = String(formData.get("difficulty") || "MEDIUM") as TaskDifficulty;
  const estimatedMinRaw = formData.get("estimatedMin");
  const estimatedMin = estimatedMinRaw ? Number(estimatedMinRaw) : undefined;

  await prisma.todayPriority.create({
    data: {
      userId: user.id,
      date,
      label,
      priorityLevel,
      difficulty,
      xpReward: priorityTaskXp(priorityLevel, difficulty),
      estimatedMin,
    },
  });
  revalidatePath("/today");
}

export async function togglePriorityDoneAction(id: string, actualMin?: number) {
  const user = await requireSessionUser();
  const item = await prisma.todayPriority.findFirst({ where: { id, userId: user.id } });
  if (!item) return;
  const nextDone = !item.done;

  await prisma.todayPriority.update({
    where: { id },
    data: { done: nextDone, actualMin: actualMin ?? item.actualMin },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: { increment: nextDone ? item.xpReward : -item.xpReward } },
  });

  revalidatePath("/today");
  revalidatePath("/leaderboard");
}

export async function deletePriorityAction(id: string) {
  const user = await requireSessionUser();
  await prisma.todayPriority.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/today");
}
