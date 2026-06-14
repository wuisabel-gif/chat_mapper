type ProgressStepsProps = {
  steps: string[];
  /** Index of the step currently running; steps before it are complete. */
  current: number;
};

export function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-sm">
      <ol className="space-y-3">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                  done
                    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                    : active
                      ? "border-brand-blue bg-brand-blue/10 text-brand-blue"
                      : "border-slate-300 bg-slate-50 text-slate-400"
                }`}
              >
                {done ? (
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06L6.75 10.19l5.97-5.97a.75.75 0 0 1 1.06 0Z" />
                  </svg>
                ) : active ? (
                  <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`text-sm ${
                  active ? "font-medium text-slate-800" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
