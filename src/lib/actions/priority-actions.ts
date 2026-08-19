"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";

export async function addPriorityAction(formData: FormData) {
  const user = await requireSessionUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const date = String(formData.get("date"));
  const priorityLevel = String(formData.get("priorityLevel") || "MEDIUM");
  const estimatedMinRaw = formData.get("estimatedMin");
  const estimatedMin = estimatedMinRaw ? Number(estimatedMinRaw) : undefined;

  const top3Count = await prisma.todayPriority.count({
    where: { userId: user.id, date, isTop3: true },
  });

  await prisma.todayPriority.create({
    data: {
      userId: user.id,
      date,
      label,
      priorityLevel,
      isTop3: priorityLevel === "HIGH" && top3Count < 3,
      estimatedMin,
    },
  });
  revalidatePath("/today");
}

export async function togglePriorityDoneAction(id: string, actualMin?: number) {
  const user = await requireSessionUser();
  const item = await prisma.todayPriority.findFirst({ where: { id, userId: user.id } });
  if (!item) return;
  await prisma.todayPriority.update({
    where: { id },
    data: { done: !item.done, actualMin: actualMin ?? item.actualMin },
  });
  revalidatePath("/today");
}

export async function deletePriorityAction(id: string) {
  const user = await requireSessionUser();
  await prisma.todayPriority.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/today");
}
