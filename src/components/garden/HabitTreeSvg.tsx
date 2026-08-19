import type { TreeStage } from "@/types";

function mixColor(healthy: string, wilted: string, vigor: number) {
  const h = hexToRgb(healthy);
  const w = hexToRgb(wilted);
  const t = 1 - vigor;
  const r = Math.round(h[0] + (w[0] - h[0]) * t);
  const g = Math.round(h[1] + (w[1] - h[1]) * t);
  const b = Math.round(h[2] + (w[2] - h[2]) * t);
  return `rgb(${r},${g},${b})`;
}
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const STAGE_PARAMS: Record<TreeStage, { trunkH: number; trunkW: number; foliage: number; fruits: boolean }> = {
  seed: { trunkH: 0, trunkW: 0, foliage: 0, fruits: false },
  sprout: { trunkH: 10, trunkW: 3, foliage: 14, fruits: false },
  sapling: { trunkH: 26, trunkW: 5, foliage: 24, fruits: false },
  blooming: { trunkH: 40, trunkW: 7, foliage: 34, fruits: false },
  fruiting: { trunkH: 52, trunkW: 9, foliage: 42, fruits: true },
  ancient: { trunkH: 62, trunkW: 12, foliage: 50, fruits: true },
};

export function HabitTreeSvg({
  stage,
  vigor,
  size = 96,
}: {
  stage: TreeStage;
  vigor: number;
  size?: number;
}) {
  const foliageColor = mixColor("#4f7a55", "#a89a6a", vigor);
  const foliageColor2 = mixColor("#6b9a6e", "#c1b389", vigor);
  const foliageOpacity = 0.55 + vigor * 0.45;

  if (stage === "seed") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="88" rx="30" ry="5" fill="var(--bark-300)" opacity="0.3" />
        <ellipse cx="50" cy="80" rx="6" ry="8" fill="var(--bark-500)" />
        <path d="M50 80 Q54 70 50 62" stroke="var(--canopy-500)" strokeWidth="2" fill="none" opacity={foliageOpacity} />
      </svg>
    );
  }

  const p = STAGE_PARAMS[stage];
  const baseY = 88;
  const trunkTopY = baseY - p.trunkH;

  const foliageBlobs =
    stage === "sprout"
      ? [{ cx: 50, cy: trunkTopY - 4, r: p.foliage }]
      : stage === "sapling"
      ? [
          { cx: 42, cy: trunkTopY - 6, r: p.foliage * 0.7 },
          { cx: 58, cy: trunkTopY - 10, r: p.foliage * 0.65 },
          { cx: 50, cy: trunkTopY - 16, r: p.foliage * 0.6 },
        ]
      : [
          { cx: 50 - p.foliage * 0.35, cy: trunkTopY - p.foliage * 0.2, r: p.foliage * 0.62 },
          { cx: 50 + p.foliage * 0.35, cy: trunkTopY - p.foliage * 0.25, r: p.foliage * 0.6 },
          { cx: 50, cy: trunkTopY - p.foliage * 0.55, r: p.foliage * 0.55 },
          { cx: 50, cy: trunkTopY - p.foliage * 0.1, r: p.foliage * 0.5 },
        ];

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy={baseY + 2} rx="26" ry="5" fill="var(--bark-300)" opacity="0.25" />
      <rect
        x={50 - p.trunkW / 2}
        y={trunkTopY}
        width={p.trunkW}
        height={p.trunkH}
        rx={p.trunkW / 2.5}
        fill="var(--bark-500)"
      />
      {foliageBlobs.map((b, i) => (
        <circle key={i} cx={b.cx} cy={b.cy} r={b.r} fill={i % 2 === 0 ? foliageColor : foliageColor2} opacity={foliageOpacity} />
      ))}
      {p.fruits &&
        [
          [50 - p.foliage * 0.3, trunkTopY - p.foliage * 0.3],
          [50 + p.foliage * 0.25, trunkTopY - p.foliage * 0.15],
          [50 + p.foliage * 0.05, trunkTopY - p.foliage * 0.5],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.2} fill="var(--terracotta-500)" opacity={0.4 + vigor * 0.6} />
        ))}
    </svg>
  );
}
