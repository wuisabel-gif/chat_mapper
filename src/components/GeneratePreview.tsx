/**
 * "What you'll generate" — a generic schematic of a single output section
 * (title + summary + keywords + token estimate), not specific example topics.
 * Keeps expectations clear without implying the user discussed any one subject.
 */
export function GeneratePreview() {
  return (
    <div className="rounded-2xl border border-brand-border bg-white/70 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        What you&apos;ll generate
      </p>

      {/* A representative section card */}
      <div className="mt-3 rounded-xl border border-brand-border bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-blue/70" />
          <span className="text-sm font-semibold text-slate-800">Topic section</span>
          {/* token-estimate placeholder */}
          <span className="ml-auto h-3.5 w-12 rounded bg-slate-100" />
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          A short summary of what this part of the conversation was about.
        </p>

        {/* keyword placeholders */}
        <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden>
          <span className="h-4 w-14 rounded bg-slate-100" />
          <span className="h-4 w-20 rounded bg-slate-100" />
          <span className="h-4 w-10 rounded bg-slate-100" />
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Chat Mapper creates one section like this for every topic it detects — each
        with a summary, keywords, and token estimate. Download them all as TXT.
      </p>
    </div>
  );
}
