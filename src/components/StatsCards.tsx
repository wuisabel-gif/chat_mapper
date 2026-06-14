type Stat = { label: string; value: string };

export function StatsCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-brand-border bg-white p-4"
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {s.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
