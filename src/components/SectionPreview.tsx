import type { ChatSection } from "../utils/chatProcessor";
import { categoryColor } from "../utils/categoryStyles";

type SectionPreviewProps = {
  section: ChatSection | null;
};

export function SectionPreview({ section }: SectionPreviewProps) {
  if (!section) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-brand-border p-8 text-center text-sm text-slate-500">
        Select a section to view its details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-border bg-brand-card/40 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColor(
            section.category,
          )}`}
        >
          {section.category}
        </span>
        <span className="code-font text-xs text-slate-500">
          ~{section.estimatedTokens} tokens
        </span>
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{section.title}</h3>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Summary
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">
          {section.summary}
        </p>
      </div>

      {section.keywords.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {section.keywords.map((kw) => (
            <span
              key={kw}
              className="code-font rounded border border-brand-border bg-brand-black/60 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Original Conversation
        </p>
        <pre className="code-font mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-brand-border bg-brand-black/80 p-3 text-xs leading-relaxed text-slate-700">
          {section.originalText}
        </pre>
      </div>
    </div>
  );
}
