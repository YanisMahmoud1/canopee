export interface RecordEntry {
  id: string;
  label: string;
  value: number;
  unit: string;
  achievedAt: string;
}

const METRIC_LABEL: Record<string, string> = {
  "1RM_ESTIMATE": "1RM estimé",
  MAX_WEIGHT: "Charge max",
  LONGEST_DISTANCE: "Distance record",
};

export function RecordsShowcase({ records }: { records: RecordEntry[] }) {
  if (records.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border-soft bg-gradient-to-br from-terracotta-100/60 to-parchment-100 p-4 sm:p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-canopy-900">🏅 Records personnels</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {records.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-lg bg-surface/80 px-3 py-2">
            <span aria-hidden="true" className="text-lg">🍂</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-canopy-900">{r.label}</p>
              <p className="text-xs text-canopy-500">
                {r.value} {r.unit} · {new Date(r.achievedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { METRIC_LABEL };
