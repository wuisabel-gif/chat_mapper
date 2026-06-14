import { DownloadButton } from "./DownloadButton";

type ExportPreviewProps = {
  content: string;
};

export function ExportPreview({ content }: ExportPreviewProps) {
  return (
    <section className="rounded-xl border border-brand-border bg-brand-card/60 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-600">
            TXT Export Preview
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            This is exactly what the downloaded <code>.txt</code> file will contain.
          </p>
        </div>
        <DownloadButton content={content} />
      </div>

      <pre className="code-font max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-brand-border bg-brand-black/80 p-4 text-xs leading-relaxed text-slate-700">
        {content}
      </pre>
    </section>
  );
}
