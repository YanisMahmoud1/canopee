"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/lib/actions/project-actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export function CreateProjectForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"LONG_TERM" | "ONE_SHOT" | "RECURRING">("LONG_TERM");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        + Nouveau projet
      </Button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const id = await createProjectAction(formData);
        formRef.current?.reset();
        setOpen(false);
        if (id) router.push(`/projects/${id}`);
      }}
      className="flex flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-4 sm:p-5"
    >
      <div>
        <Label htmlFor="title">Titre du projet</Label>
        <Input id="title" name="title" required maxLength={100} placeholder="Ex : Écrire mon livre" autoFocus />
      </div>

      <div>
        <Label htmlFor="type">Format</Label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          className="w-full rounded-lg border border-border-soft bg-surface px-3 py-2.5 text-sm"
        >
          <option value="LONG_TERM">Long terme (avec jalons)</option>
          <option value="ONE_SHOT">One-shot (objectif simple)</option>
          <option value="RECURRING">Récurrent / évolutif (paliers)</option>
        </select>
      </div>

      {type !== "RECURRING" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="startDate">Début</Label>
            <Input id="startDate" name="startDate" type="date" />
          </div>
          <div>
            <Label htmlFor="dueDate">Échéance</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          rows={2}
          maxLength={2000}
          className="w-full resize-none rounded-lg border border-border-soft bg-surface px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Créer le projet</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
