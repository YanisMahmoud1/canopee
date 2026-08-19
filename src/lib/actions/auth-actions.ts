"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "3 caractères minimum")
    .max(24, "24 caractères maximum")
    .regex(/^[a-z0-9_-]+$/, "Lettres, chiffres, - et _ uniquement"),
  displayName: z.string().trim().min(1, "Requis").max(40),
  password: z.string().min(4, "4 caractères minimum"),
});

export async function registerAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Formulaire invalide.";
  }

  const { username, displayName, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return "Cet identifiant est déjà pris.";
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, displayName, passwordHash } });

  try {
    await signIn("credentials", { username, password, redirectTo: "/today" });
  } catch (error) {
    if (error instanceof AuthError) return "Compte créé, mais la connexion a échoué.";
    throw error;
  }
  return null;
}

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/today",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Identifiant ou mot de passe incorrect.";
    }
    throw error;
  }
  return null;
}
