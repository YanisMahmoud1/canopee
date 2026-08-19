export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border-soft bg-surface shadow-[0_1px_2px_rgba(20,33,23,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}
