interface EnergyPoint {
  period: "MORNING" | "AFTERNOON" | "EVENING";
  value: number;
}

const LABELS: Record<EnergyPoint["period"], string> = {
  MORNING: "Matin",
  AFTERNOON: "Après-midi",
  EVENING: "Soir",
};

export function EnergyTrendChart({ logs }: { logs: EnergyPoint[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-canopy-400">Pas encore assez de données. Renseigne ton énergie depuis &laquo; Aujourd&apos;hui &raquo;.</p>;
  }

  const byPeriod: Record<EnergyPoint["period"], number[]> = { MORNING: [], AFTERNOON: [], EVENING: [] };
  for (const l of logs) byPeriod[l.period].push(l.value);

  const averages = (Object.keys(byPeriod) as EnergyPoint["period"][]).map((p) => ({
    period: p,
    avg: byPeriod[p].length ? byPeriod[p].reduce((a, b) => a + b, 0) / byPeriod[p].length : 0,
    count: byPeriod[p].length,
  }));

  return (
    <div className="flex items-end gap-6">
      {averages.map((a) => (
        <div key={a.period} className="flex flex-col items-center gap-1">
          <div className="flex h-24 w-8 items-end overflow-hidden rounded-md bg-parchment-200">
            <div
              className="w-full rounded-t-md bg-canopy-500 transition-all"
              style={{ height: `${(a.avg / 10) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-canopy-800">{a.count ? a.avg.toFixed(1) : "—"}</span>
          <span className="text-[11px] text-canopy-500">{LABELS[a.period]}</span>
        </div>
      ))}
    </div>
  );
}
