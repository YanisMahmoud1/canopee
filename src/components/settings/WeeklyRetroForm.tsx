"use client";

import { useTransition } from "react";
import { saveWeeklyRetroAction } from "@/lib/actions/retro-actions";
import { Button } from "@/components/ui/Button";

export function WeeklyRetroForm({
  weekStart,
  initial,
}: {
  weekStart: string;
  initial: { wentWell: string; didntWork: string; nextFocus: string };
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(async () => { await saveWeeklyRetroAction(fd); })}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="weekStart" value={weekStart} />
      <div>
        <label className="mb-1 block text-sm font-medium text-canopy-800">Qu&apos;est-ce qui a bien marché ?</label>
        <textarea name="wentWell" defaultValue={initial.wentWell} rows={2} className="w-full resize-none rounded-lg border border-border-soft bg-parchment-50 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-canopy-800">Qu&apos;est-ce qui a coincé ?</label>
        <textarea name="didntWork" defaultValue={initial.didntWork} rows={2} className="w-full resize-none rounded-lg border border-border-soft bg-parchment-50 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-canopy-800">Quel est le focus de la semaine prochaine ?</label>
        <textarea name="nextFocus" defaultValue={initial.nextFocus} rows={2} className="w-full resize-none rounded-lg border border-border-soft bg-parchment-50 px-3 py-2 text-sm" />
      </div>
      <Button type="submit" size="sm" disabled={pending} className="w-fit">
        {pending ? "..." : "Enregistrer la rétro"}
      </Button>
    </form>
  );
}
