import type { ChatSection } from "../utils/chatProcessor";
import { categoryColor } from "../utils/categoryStyles";

type SectionListProps = {
  sections: ChatSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function SectionList({ sections, selectedId, onSelect }: SectionListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Sections ({sections.length})
      </h3>
      <ul className="space-y-2">
        {sections.map((section, index) => {
          const active = section.id === selectedId;
          return (
            <li key={section.id}>
              <button
                onClick={() => onSelect(section.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-brand-blue bg-brand-blue/10"
                    : "border-brand-border bg-brand-card/40 hover:border-brand-blue/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="code-font text-xs text-slate-500">
                    #{index + 1}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${categoryColor(
                      section.category,
                    )}`}
                  >
                    {section.category}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-sm font-medium text-slate-800">
                  {section.title}
                </p>
                <p className="code-font mt-1 text-[11px] text-slate-500">
                  ~{section.estimatedTokens} tokens
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
