import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./prisma";

export async function requireSessionUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireUserRecord() {
  const sessionUser = await requireSessionUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");
  return user;
}
