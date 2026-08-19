"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
}) {
  const [error, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {mode === "register" && (
        <div>
          <Label htmlFor="displayName">Nom affiché</Label>
          <Input id="displayName" name="displayName" required maxLength={40} placeholder="Ex : Yanis" />
        </div>
      )}
      <div>
        <Label htmlFor="username">Identifiant</Label>
        <Input
          id="username"
          name="username"
          required
          maxLength={24}
          placeholder="ex : yanis"
          autoComplete="username"
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-terracotta-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "..." : mode === "login" ? "Entrer dans le jardin" : "Planter mon jardin"}
      </Button>

      {mode === "login" ? (
        <p className="text-center text-sm text-canopy-700">
          Pas encore de jardin ?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Créer un compte
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-canopy-700">
          Déjà un jardin ?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      )}
    </form>
  );
}
