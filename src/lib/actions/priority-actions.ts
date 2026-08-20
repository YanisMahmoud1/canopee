"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { priorityTaskWeight, priorityTaskXp } from "@/lib/gamification";
import type { PriorityLevel, TaskDifficulty } from "@/types";

const ORDER_GAP = 1000;

export async function addPriorityAction(formData: FormData) {
  const user = await requireSessionUser();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const date = String(formData.get("date"));
  const priorityLevel = String(formData.get("priorityLevel") || "MEDIUM") as PriorityLevel;
  const difficulty = String(formData.get("difficulty") || "MEDIUM") as TaskDifficulty;
  const estimatedMinRaw = formData.get("estimatedMin");
  const estimatedMin = estimatedMinRaw ? Number(estimatedMinRaw) : undefined;
  const newWeight = priorityTaskWeight(priorityLevel, difficulty);

  // Place the new task by weight among today's existing tasks ("eat the frog"
  // first), while respecting any manual reordering already done today.
  const existing = await prisma.todayPriority.findMany({
    where: { userId: user.id, date },
    orderBy: { order: "asc" },
  });

  let insertIdx = existing.findIndex(
    (e) => priorityTaskWeight(e.priorityLevel as PriorityLevel, e.difficulty as TaskDifficulty) < newWeight
  );
  if (insertIdx === -1) insertIdx = existing.length;

  const before = existing.slice(0, insertIdx);
  const after = existing.slice(insertIdx);

  await prisma.$transaction([
    ...before.map((item, i) =>
      prisma.todayPriority.update({ where: { id: item.id }, data: { order: (i + 1) * ORDER_GAP } })
    ),
    ...after.map((item, i) =>
      prisma.todayPriority.update({
        where: { id: item.id },
        data: { order: (before.length + i + 2) * ORDER_GAP },
      })
    ),
    prisma.todayPriority.create({
      data: {
        userId: user.id,
        date,
        label,
        priorityLevel,
        difficulty,
        xpReward: priorityTaskXp(priorityLevel, difficulty),
        order: (before.length + 1) * ORDER_GAP,
        estimatedMin,
      },
    }),
  ]);

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

/** Swap a task with its neighbor within its own group (pending vs done),
 * so manual reordering never mixes an unfinished task into the done list. */
export async function movePriorityAction(id: string, direction: "up" | "down") {
  const user = await requireSessionUser();
  const target = await prisma.todayPriority.findFirst({ where: { id, userId: user.id } });
  if (!target) return;

  const siblings = await prisma.todayPriority.findMany({
    where: { userId: user.id, date: target.date, done: target.done },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === id);
  const neighborIdx = direction === "up" ? idx - 1 : idx + 1;
  if (idx === -1 || neighborIdx < 0 || neighborIdx >= siblings.length) return;

  const neighbor = siblings[neighborIdx];
  await prisma.$transaction([
    prisma.todayPriority.update({ where: { id: target.id }, data: { order: neighbor.order } }),
    prisma.todayPriority.update({ where: { id: neighbor.id }, data: { order: target.order } }),
  ]);

  revalidatePath("/today");
}
