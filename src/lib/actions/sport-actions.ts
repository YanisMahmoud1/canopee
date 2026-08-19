"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";
import { estimate1RM } from "@/lib/sport";
import { XP_RULES } from "@/lib/gamification";

const sessionSchema = z.object({
  activityType: z.string().trim().min(1).max(60),
  date: z.string(),
  durationMin: z.coerce.number().int().optional(),
  rpe: z.coerce.number().int().min(1).max(10).optional(),
  energyBefore: z.coerce.number().int().min(1).max(10).optional(),
  energyAfter: z.coerce.number().int().min(1).max(10).optional(),
  distanceKm: z.coerce.number().optional(),
  paceOrSpeed: z.string().trim().max(30).optional(),
  heartRate: z.coerce.number().int().optional(),
  elevationGain: z.coerce.number().int().optional(),
  notes: z.string().trim().max(1000).optional(),
  exercisesJson: z.string().optional(),
});

export async function createSportSessionAction(formData: FormData) {
  const user = await requireSessionUser();

  const parsed = sessionSchema.safeParse({
    activityType: formData.get("activityType"),
    date: formData.get("date"),
    durationMin: formData.get("durationMin") || undefined,
    rpe: formData.get("rpe") || undefined,
    energyBefore: formData.get("energyBefore") || undefined,
    energyAfter: formData.get("energyAfter") || undefined,
    distanceKm: formData.get("distanceKm") || undefined,
    paceOrSpeed: formData.get("paceOrSpeed") || undefined,
    heartRate: formData.get("heartRate") || undefined,
    elevationGain: formData.get("elevationGain") || undefined,
    notes: formData.get("notes") || undefined,
    exercisesJson: formData.get("exercisesJson") || undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Formulaire invalide");
  const data = parsed.data;

  let exercises: { name: string; sets: { reps: number; weightKg: number }[] }[] = [];
  if (data.exercisesJson) {
    try {
      exercises = JSON.parse(data.exercisesJson);
    } catch {
      exercises = [];
    }
  }

  const session = await prisma.sportSession.create({
    data: {
      userId: user.id,
      activityType: data.activityType,
      date: data.date,
      durationMin: data.durationMin,
      rpe: data.rpe,
      energyBefore: data.energyBefore,
      energyAfter: data.energyAfter,
      distanceKm: data.distanceKm,
      paceOrSpeed: data.paceOrSpeed,
      heartRate: data.heartRate,
      elevationGain: data.elevationGain,
      notes: data.notes ?? "",
    },
  });

  let prCount = 0;

  for (const ex of exercises) {
    const name = ex.name.trim();
    if (!name) continue;
    const exercise = await prisma.exercise.upsert({
      where: { userId_name: { userId: user.id, name } },
      update: {},
      create: { userId: user.id, name },
    });

    for (const [i, s] of ex.sets.entries()) {
      if (!s.reps || !s.weightKg) continue;
      await prisma.exerciseSet.create({
        data: { sportSessionId: session.id, exerciseId: exercise.id, setNumber: i + 1, reps: s.reps, weightKg: s.weightKg },
      });

      const est1RM = estimate1RM(s.weightKg, s.reps);
      const gotPR = await maybeRecordPR(user.id, exercise.id, null, "1RM_ESTIMATE", est1RM, "kg", data.date);
      const gotMaxWeight = await maybeRecordPR(user.id, exercise.id, null, "MAX_WEIGHT", s.weightKg, "kg", data.date);
      if (gotPR || gotMaxWeight) prCount++;
    }
  }

  if (data.distanceKm) {
    const gotPR = await maybeRecordPR(user.id, null, data.activityType, "LONGEST_DISTANCE", data.distanceKm, "km", data.date);
    if (gotPR) prCount++;
  }

  if (prCount > 0) {
    await prisma.user.update({ where: { id: user.id }, data: { xp: { increment: XP_RULES.personalRecord * prCount } } });
  }

  revalidatePath("/sport");
}

async function maybeRecordPR(
  userId: string,
  exerciseId: string | null,
  activityType: string | null,
  metric: string,
  value: number,
  unit: string,
  achievedAt: string
): Promise<boolean> {
  const existing = await prisma.personalRecord.findFirst({
    where: { userId, exerciseId, activityType, metric },
    orderBy: { value: "desc" },
  });
  if (existing && existing.value >= value) return false;

  await prisma.personalRecord.create({
    data: { userId, exerciseId, activityType, metric, value, unit, achievedAt },
  });
  return true;
}

export async function deleteSportSessionAction(id: string) {
  const user = await requireSessionUser();
  await prisma.sportSession.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/sport");
}

const goalSchema = z.object({
  targetValue: z.coerce.number(),
  unit: z.string().trim().min(1).max(10),
  targetDate: z.string().optional(),
  exerciseName: z.string().trim().max(60).optional(),
  activityType: z.string().trim().max(60).optional(),
});

export async function addSportGoalAction(formData: FormData) {
  const user = await requireSessionUser();
  const parsed = goalSchema.safeParse({
    targetValue: formData.get("targetValue"),
    unit: formData.get("unit"),
    targetDate: formData.get("targetDate") || undefined,
    exerciseName: formData.get("exerciseName") || undefined,
    activityType: formData.get("activityType") || undefined,
  });
  if (!parsed.success) return;
  const data = parsed.data;

  let exerciseId: string | undefined;
  if (data.exerciseName) {
    const exercise = await prisma.exercise.upsert({
      where: { userId_name: { userId: user.id, name: data.exerciseName } },
      update: {},
      create: { userId: user.id, name: data.exerciseName },
    });
    exerciseId = exercise.id;
  }

  await prisma.sportGoal.create({
    data: {
      userId: user.id,
      exerciseId,
      activityType: data.activityType,
      targetValue: data.targetValue,
      unit: data.unit,
      targetDate: data.targetDate,
    },
  });
  revalidatePath("/sport");
}

export async function deleteSportGoalAction(id: string) {
  const user = await requireSessionUser();
  await prisma.sportGoal.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/sport");
}
