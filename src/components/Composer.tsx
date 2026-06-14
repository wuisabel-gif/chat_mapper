import { samples, type Sample } from "../data/sampleChat";

export type InputMode = "paste" | "link";

type ComposerProps = {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  rawText: string;
  onRawTextChange: (value: string) => void;
  linkUrl: string;
  onLinkUrlChange: (value: string) => void;
  onGenerate: () => void;
  onLoadSample: (sample: Sample) => void;
  onClear: () => void;
  busy: boolean;
  ctaLabel: string;
  error: string | null;
};

const TABS: Array<{ id: InputMode; label: string }> = [
  { id: "paste", label: "Paste Chat" },
  { id: "link", label: "Share Link" },
];

export function Composer({
  mode,
  onModeChange,
  rawText,
  onRawTextChange,
  linkUrl,
  onLinkUrlChange,
  onGenerate,
  onLoadSample,
  onClear,
  busy,
  ctaLabel,
  error,
}: ComposerProps) {
  const canGenerate =
    !busy && (mode === "paste" ? rawText.trim().length > 0 : linkUrl.trim().length > 0);

  return (
    <div className="rounded-2xl border border-brand-border bg-white p-3 shadow-sm sm:p-4">
      {/* Segmented tabs */}
      <div
        role="tablist"
        aria-label="Input method"
        className="mb-3 inline-flex rounded-xl border border-brand-border bg-brand-black/60 p-1"
      >
        {TABS.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onModeChange(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {mode === "paste" ? (
        <div>
          <textarea
            value={rawText}
            onChange={(e) => onRawTextChange(e.target.value)}
            placeholder="Paste a long ChatGPT, Claude, or Gemini conversation here…"
            spellCheck={false}
            className="h-56 w-full resize-y rounded-xl border border-brand-border bg-brand-black/50 p-4 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="code-font text-xs text-slate-400">
              {rawText.length.toLocaleString()} characters
            </span>
            {rawText.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs font-medium text-slate-500 transition hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Try an example:</span>
            {samples.map((s) => (
              <button
                key={s.id}
                onClick={() => onLoadSample(s)}
                title={s.hint}
                className="rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-brand-blue hover:text-brand-blue"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
              <path d="M8.603 14.804a.75.75 0 0 0-.978 1.138 4 4 0 0 0 5.656-.225l3-3a4 4 0 0 0-5.656-5.656l-1.224 1.224a.75.75 0 1 0 1.06 1.06l1.225-1.224a2.5 2.5 0 0 1 3.536 3.536l-3 3a2.5 2.5 0 0 1-3.535.07Z" />
            </svg>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => onLinkUrlChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canGenerate && onGenerate()}
              placeholder="https://chatgpt.com/share/…"
              spellCheck={false}
              className="w-full rounded-xl border border-brand-border bg-brand-black/50 py-3 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Works with public <strong className="font-medium text-slate-600">ChatGPT</strong>,{" "}
            <strong className="font-medium text-slate-600">Claude</strong>, and{" "}
            <strong className="font-medium text-slate-600">Gemini</strong> share links.
            Everything runs in your browser — we don&apos;t store your chat history.
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {/* Primary call-to-action */}
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue text-base font-semibold text-white shadow-sm transition hover:bg-brand-glow disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
            </svg>
            {ctaLabel}
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path d="M10 1.5a.75.75 0 0 1 .75.75v6.25H17a.75.75 0 0 1 0 1.5h-6.25V16a.75.75 0 0 1-1.5 0V9.75H3a.75.75 0 0 1 0-1.5h6.25V2.25A.75.75 0 0 1 10 1.5Z" opacity="0" />
              <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25H12a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.085l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.289Z" />
            </svg>
            {ctaLabel}
          </>
        )}
      </button>
    </div>
  );
}
