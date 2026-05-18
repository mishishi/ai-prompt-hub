export function SectionHeader({ icon: Icon, title }: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-2">
      <div className="w-1 h-5 rounded-full bg-[var(--color-bench-accent)]" />
      <Icon size={15} className="text-[var(--color-bench-accent)]" />
      <h3 className="text-sm font-semibold text-[var(--color-bench-text)]">{title}</h3>
    </div>
  );
}
