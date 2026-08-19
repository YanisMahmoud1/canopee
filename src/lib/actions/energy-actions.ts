"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/current-user";

export async function saveEnergyLogAction(date: string, period: "MORNING" | "AFTERNOON" | "EVENING", value: number) {
  const user = await requireSessionUser();
  await prisma.energyLog.upsert({
    where: { userId_date_period: { userId: user.id, date, period } },
    update: { value },
    create: { userId: user.id, date, period, value },
  });
  revalidatePath("/today");
  revalidatePath("/settings");
}
