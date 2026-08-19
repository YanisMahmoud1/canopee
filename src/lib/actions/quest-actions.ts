"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { XP_RULES } from "@/lib/gamification";

export async function addQuestAction(weekStart: string, formData: FormData) {
  const user = await requireSessionUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const xpReward = Number(formData.get("xpReward")) || 20;
  await prisma.quest.create({ data: { userId: user.id, title, weekStart, xpReward } });
  revalidatePath("/today");
}

export async function toggleQuestAction(id: string) {
  const user = await requireSessionUser();
  const quest = await prisma.quest.findFirst({ where: { id, userId: user.id } });
  if (!quest) return;
  const nextCompleted = !quest.completed;
  await prisma.quest.update({ where: { id }, data: { completed: nextCompleted } });
  await prisma.user.update({
    where: { id: user.id },
    data: { xp: { increment: nextCompleted ? XP_RULES.questDone(quest.xpReward) : -XP_RULES.questDone(quest.xpReward) } },
  });
  revalidatePath("/today");
  revalidatePath("/leaderboard");
}

export async function deleteQuestAction(id: string) {
  const user = await requireSessionUser();
  await prisma.quest.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/today");
}
