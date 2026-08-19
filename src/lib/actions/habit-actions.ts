"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { evaluateLogValue } from "@/lib/scoring";
import { XP_RULES } from "@/lib/gamification";

const habitSchema = z.object({
  name: z.string().trim().min(1).max(80),
  trackingType: z.enum(["BOOLEAN", "SCALE", "COUNTER"]),
  points: z.coerce.number().int().min(0).max(999),
  frequency: z.enum(["DAILY", "SPECIFIC_DAYS", "WEEKLY"]),
  specificDays: z.array(z.number().int().min(0).max(6)).default([]),
  scaleMin: z.coerce.number().int().optional(),
  scaleMax: z.coerce.number().int().optional(),
  counterTarget: z.coerce.number().int().optional(),
  categoryName: z.string().trim().max(30).optional(),
  categoryColor: z.string().trim().max(20).optional(),
  includeInScore: z.boolean().default(true),
});

export async function createHabitAction(formData: FormData) {
  const user = await requireSessionUser();

  const raw = {
    name: formData.get("name"),
    trackingType: formData.get("trackingType"),
    points: formData.get("points"),
    frequency: formData.get("frequency"),
    specificDays: formData.getAll("specificDays").map(Number),
    scaleMin: formData.get("scaleMin") || undefined,
    scaleMax: formData.get("scaleMax") || undefined,
    counterTarget: formData.get("counterTarget") || undefined,
    categoryName: formData.get("categoryName") || undefined,
    categoryColor: formData.get("categoryColor") || undefined,
    includeInScore: formData.get("includeInScore") === "on",
  };
  const parsed = habitSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
  const data = parsed.data;

  let categoryId: string | undefined;
  if (data.categoryName) {
    const category = await prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: data.categoryName } },
      update: {},
      create: {
        userId: user.id,
        name: data.categoryName,
        color: data.categoryColor || "#5b7f5e",
      },
    });
    categoryId = category.id;
  }

  const count = await prisma.habitItem.count({ where: { userId: user.id, archived: false } });

  await prisma.habitItem.create({
    data: {
      userId: user.id,
      name: data.name,
      trackingType: data.trackingType,
      points: data.points,
      frequency: data.frequency,
      specificDays: JSON.stringify(data.specificDays),
      scaleMin: data.trackingType === "SCALE" ? (data.scaleMin ?? 1) : null,
      scaleMax: data.trackingType === "SCALE" ? (data.scaleMax ?? 5) : null,
      counterTarget: data.trackingType === "COUNTER" ? (data.counterTarget ?? 1) : null,
      categoryId,
      includeInScore: data.includeInScore,
      order: count,
    },
  });

  revalidatePath("/today");
  revalidatePath("/garden");
}

export async function archiveHabitAction(habitId: string) {
  const user = await requireSessionUser();
  await prisma.habitItem.updateMany({
    where: { id: habitId, userId: user.id },
    data: { archived: true },
  });
  revalidatePath("/today");
  revalidatePath("/garden");
}

export async function logHabitAction(habitId: string, date: string, value: number) {
  const user = await requireSessionUser();

  const habit = await prisma.habitItem.findFirst({ where: { id: habitId, userId: user.id } });
  if (!habit) throw new Error("Objectif introuvable");

  const { completed, pointsEarned } = evaluateLogValue(habit, value);

  const existing = await prisma.habitLog.findUnique({
    where: { habitItemId_date: { habitItemId: habitId, date } },
  });
  const previousPoints = existing?.pointsEarned ?? 0;

  await prisma.habitLog.upsert({
    where: { habitItemId_date: { habitItemId: habitId, date } },
    update: { value, completed, pointsEarned },
    create: { habitItemId: habitId, userId: user.id, date, value, completed, pointsEarned },
  });

  const xpDelta = XP_RULES.habitCompletion(pointsEarned) - previousPoints;
  if (xpDelta !== 0 && habit.includeInScore) {
    await prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: xpDelta } },
    });
    if (xpDelta < 0) {
      const fresh = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
      if (fresh.xp < 0) await prisma.user.update({ where: { id: user.id }, data: { xp: 0 } });
    }
  }

  revalidatePath("/today");
  revalidatePath("/garden");
  revalidatePath("/leaderboard");
}

export async function saveJournalAction(date: string, note: string) {
  const user = await requireSessionUser();
  await prisma.dailyJournal.upsert({
    where: { userId_date: { userId: user.id, date } },
    update: { note },
    create: { userId: user.id, date, note },
  });
  revalidatePath("/today");
  revalidatePath("/garden");
}

export async function saveThresholdsAction(sun: number, cloud: number) {
  const user = await requireSessionUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { scoreThresholds: JSON.stringify({ sun, cloud }) },
  });
  revalidatePath("/garden");
  revalidatePath("/today");
  revalidatePath("/settings");
}
