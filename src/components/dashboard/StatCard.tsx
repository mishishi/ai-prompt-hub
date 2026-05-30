
const colorMap: Record<string, string> = {
  accent: 'text-[var(--color-bench-accent)]',
  success: 'text-[var(--color-bench-success)]',
  warn: 'text-[var(--color-bench-warn)]',
  error: 'text-[var(--color-bench-error)]',
};

export function StatCard({ icon: Icon, color, value, label }: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl min-h-[72px] sm:min-h-[88px] p-4">
      <Icon size={14} className={(colorMap[color] || '') + ' mb-2'} />
      <div className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)]">{value}</div>
      <div className="text-xs text-[var(--color-bench-muted)] mt-0.5">{label}</div>
    </div>
  );
}
