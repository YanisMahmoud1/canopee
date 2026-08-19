import { HabitTreeSvg } from "./HabitTreeSvg";
import { TREE_STAGE_LABELS } from "@/lib/gamification";
import type { TreeState } from "@/types";

export interface GardenHabitEntry {
  id: string;
  name: string;
  categoryColor: string | null;
  tree: TreeState;
  isThirsty: boolean;
}

export function TreeGarden({ entries }: { entries: GardenHabitEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border-soft p-8 text-center text-sm text-canopy-500">
        Ton jardin est encore vide. Crée un objectif depuis &laquo; Aujourd&apos;hui &raquo; pour planter ton premier arbre.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-border-soft bg-gradient-to-b from-canopy-100/60 to-parchment-100 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {entries.map((e) => (
          <div key={e.id} className="flex flex-col items-center gap-1 rounded-xl p-2 text-center">
            <HabitTreeSvg stage={e.tree.stage} vigor={e.tree.vigor} size={84} />
            <p className="mt-1 max-w-[9rem] truncate text-sm font-medium text-canopy-800" title={e.name}>
              {e.name}
            </p>
            <p className="text-xs text-canopy-500">{TREE_STAGE_LABELS[e.tree.stage]}</p>
            {e.isThirsty && (
              <p className="mt-0.5 text-[11px] text-terracotta-600">💧 cet arbre a soif</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
