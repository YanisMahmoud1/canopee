"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";

export async function saveWeeklyRetroAction(formData: FormData) {
  const user = await requireSessionUser();
  const weekStart = String(formData.get("weekStart"));
  const wentWell = String(formData.get("wentWell") ?? "");
  const didntWork = String(formData.get("didntWork") ?? "");
  const nextFocus = String(formData.get("nextFocus") ?? "");

  await prisma.weeklyRetro.upsert({
    where: { userId_weekStart: { userId: user.id, weekStart } },
    update: { wentWell, didntWork, nextFocus },
    create: { userId: user.id, weekStart, wentWell, didntWork, nextFocus },
  });
  revalidatePath("/settings");
}
