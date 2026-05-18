import type { ReactNode } from 'react';

export function ChartCard({ title, icon: Icon, children, className = '' }: {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[var(--color-bench-elevated)] border border-[var(--color-bench-border)] rounded-xl overflow-hidden ${className}`}>
      <div className="px-5 py-3.5 border-b border-[var(--color-bench-border)] flex items-center gap-2">
        <Icon size={14} className="text-[var(--color-bench-accent)]" />
        <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
