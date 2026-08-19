import Link from "next/link";

const TYPE_LABEL: Record<string, string> = {
  LONG_TERM: "Long terme",
  ONE_SHOT: "One-shot",
  RECURRING: "Récurrent",
};
const TYPE_ICON: Record<string, string> = {
  LONG_TERM: "🌳",
  ONE_SHOT: "🌱",
  RECURRING: "🌿",
};

export function ProjectCard({
  id,
  title,
  type,
  progress,
  dueDate,
}: {
  id: string;
  title: string;
  type: string;
  progress: number;
  dueDate: string | null;
}) {
  return (
    <Link
      href={`/projects/${id}`}
      className="flex flex-col gap-2 rounded-xl border border-border-soft bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-canopy-500">
          <span aria-hidden="true">{TYPE_ICON[type]}</span>
          {TYPE_LABEL[type]}
        </span>
        {dueDate && (
          <span className="text-xs text-canopy-400">
            {new Date(dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
      <h3 className="font-display text-base font-semibold text-canopy-900">{title}</h3>
      <div className="h-1.5 overflow-hidden rounded-full bg-parchment-200">
        <div className="h-full rounded-full bg-canopy-500" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-canopy-500">{progress}%</span>
    </Link>
  );
}
