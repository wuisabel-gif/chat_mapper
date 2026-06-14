import { useMemo, useState } from "react";
import {
  processChat,
  totalTokens,
  categoryBreakdown,
  type ChatSection,
} from "./utils/chatProcessor";
import { buildTxtExport } from "./utils/exportTxt";
import { categoryColor } from "./utils/categoryStyles";
import { importFromLink } from "./utils/importLink";
import { type Sample } from "./data/sampleChat";
import { Composer, type InputMode } from "./components/Composer";
import { HeroGraph } from "./components/HeroGraph";
import { GeneratePreview } from "./components/GeneratePreview";
import { ProgressSteps } from "./components/ProgressSteps";
import { StatsCards } from "./components/StatsCards";
import { SectionList } from "./components/SectionList";
import { SectionPreview } from "./components/SectionPreview";
import { ExportPreview } from "./components/ExportPreview";

type Status = "idle" | "busy" | "done";

const STEPS = ["Reading conversation", "Detecting topics", "Building sections", "Generating map"];

const REPO_URL = "https://github.com/wuisabel-gif/chat_mapper";

/** Deployed (non-localhost) host → share-link import is gated off. */
const IS_HOSTED =
  typeof window !== "undefined" &&
  !/^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname) &&
  window.location.hostname !== "";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countMessages(text: string): number {
  return (text.match(/^\s*(user|assistant|system)\s*:/gim) ?? []).length;
}

export default function App() {
  const [mode, setMode] = useState<InputMode>("paste");
  const [rawText, setRawText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [step, setStep] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sections, setSections] = useState<ChatSection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleGenerate = async () => {
    setError(null);
    setStatus("busy");
    setStep(0);

    let text = rawText;
    if (mode === "link") {
      setFetching(true);
      try {
        const result = await importFromLink(linkUrl);
        text = result.transcript;
        setRawText(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
        setStatus("idle");
        setFetching(false);
        return;
      }
      setFetching(false);
    }

    const reduce = prefersReducedMotion();
    if (mode === "paste" && !reduce) await sleep(240);
    for (let i = 1; i < STEPS.length; i++) {
      setStep(i);
      if (!reduce) await sleep(240);
    }

    const result = processChat(text);
    setSections(result);
    setSelectedId(result[0]?.id ?? null);
    setStatus("done");
  };

  const handleLoadSample = (sample: Sample) => {
    setMode("paste");
    setRawText(sample.text);
    setStatus("idle");
    setError(null);
  };

  const handleClear = () => {
    setRawText("");
    setError(null);
  };

  const handleReset = () => {
    setStatus("idle");
    setSections([]);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedSection = sections.find((s) => s.id === selectedId) ?? null;
  const exportContent = useMemo(
    () => (sections.length ? buildTxtExport(sections) : ""),
    [sections],
  );
  const breakdown = useMemo(() => categoryBreakdown(sections), [sections]);
  const tokens = useMemo(() => totalTokens(sections), [sections]);

  const hasResults = sections.length > 0;
  const showResults = status === "done" && hasResults;
  const ctaLabel =
    status === "busy"
      ? fetching
        ? "Fetching link…"
        : "Generating…"
      : mode === "link"
        ? "Fetch & Generate"
        : "Generate Topic Map";

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="border-b border-brand-border/70 px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-blue text-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25H12a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.085l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.289Z" />
              </svg>
            </span>
            <span className="font-display text-lg tracking-wide text-slate-900">
              Chat Mapper
            </span>
          </div>
          <span className="hidden rounded-full border border-brand-border bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 sm:inline">
            Local-first · No API key
          </span>
        </div>
      </header>

      <main className="flex-1">
        {!showResults ? (
          /* ENTRY: focused hero + composer */
          <section className="relative px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
            <HeroGraph />
            <div className="mx-auto max-w-xl">
              <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Turn long AI chats into topic maps
              </h1>
              <p className="mx-auto mt-3 max-w-lg text-center text-base text-slate-600">
                Paste a conversation or drop a share link. Chat Mapper sorts it into
                clean, topic-based sections — skim the categories on screen, or download
                the whole map as a <code>.txt</code> file.
              </p>

              <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {[
                  {
                    label: "Free",
                    icon: (
                      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm3.03 4.97a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-1.5-1.5a.75.75 0 1 1 1.06-1.06l.97.97 2.97-2.97a.75.75 0 0 1 1.06 0Z" />
                    ),
                  },
                  {
                    label: "Secure & private",
                    icon: (
                      <path d="M8 1a3 3 0 0 0-3 3v2H4.5A1.5 1.5 0 0 0 3 7.5v5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 6H11V4a3 3 0 0 0-3-3Zm1.5 5h-3V4a1.5 1.5 0 0 1 3 0v2Z" />
                    ),
                  },
                  {
                    label: "Topic categories",
                    icon: (
                      <>
                        <rect x="2" y="2" width="5" height="5" rx="1.3" />
                        <rect x="9" y="2" width="5" height="5" rx="1.3" />
                        <rect x="2" y="9" width="5" height="5" rx="1.3" />
                        <rect x="9" y="9" width="5" height="5" rx="1.3" />
                      </>
                    ),
                  },
                  {
                    label: "Download as TXT",
                    icon: (
                      <path d="M8 1.5a.75.75 0 0 1 .75.75v6.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V2.25A.75.75 0 0 1 8 1.5ZM3 11.75a.75.75 0 0 1 .75.75v.5c0 .14.11.25.25.25h8a.25.25 0 0 0 .25-.25v-.5a.75.75 0 0 1 1.5 0v.5A1.75 1.75 0 0 1 12 14.75H4a1.75 1.75 0 0 1-1.75-1.75v-.5a.75.75 0 0 1 .75-.75Z" />
                    ),
                  },
                ].map((chip) => (
                  <li
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-brand-blue">
                      {chip.icon}
                    </svg>
                    {chip.label}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Composer
                  mode={mode}
                  onModeChange={setMode}
                  rawText={rawText}
                  onRawTextChange={setRawText}
                  linkUrl={linkUrl}
                  onLinkUrlChange={setLinkUrl}
                  onGenerate={handleGenerate}
                  onLoadSample={handleLoadSample}
                  onClear={handleClear}
                  busy={status === "busy"}
                  ctaLabel={ctaLabel}
                  error={error}
                  hosted={IS_HOSTED}
                  repoUrl={REPO_URL}
                />
              </div>

              <div className="mt-5">
                {status === "busy" ? (
                  <ProgressSteps steps={STEPS} current={step} />
                ) : status === "done" && !hasResults ? (
                  <p className="rounded-2xl border border-dashed border-brand-border bg-white/60 p-6 text-center text-sm text-slate-500">
                    No sections were produced — try a longer conversation.
                  </p>
                ) : (
                  <GeneratePreview />
                )}
              </div>
            </div>
          </section>
        ) : (
          /* RESULTS */
          <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Your topic map
                </h1>
                <p className="mt-0.5 text-sm text-slate-500">
                  {sections.length} sections across {Object.keys(breakdown).length}{" "}
                  topics.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-brand-border bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-blue hover:text-brand-blue"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M10 3.5a6.5 6.5 0 1 0 6.326 8.013.75.75 0 0 1 1.458.352A8 8 0 1 1 10 2c1.79 0 3.43.59 4.755 1.587V2.75a.75.75 0 0 1 1.5 0V6a.75.75 0 0 1-.75.75h-3.25a.75.75 0 0 1 0-1.5h1.41A6.47 6.47 0 0 0 10 3.5Z" />
                </svg>
                New map
              </button>
            </div>

            <StatsCards
              stats={[
                { label: "Topics", value: Object.keys(breakdown).length.toString() },
                { label: "Sections", value: sections.length.toString() },
                { label: "Messages", value: (countMessages(rawText) || "—").toString() },
                { label: "Est. Tokens", value: tokens.toLocaleString() },
              ]}
            />

            <div className="mt-4 rounded-xl border border-brand-border bg-white p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category breakdown
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(breakdown).map(([cat, count]) => (
                  <span
                    key={cat}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${categoryColor(
                      cat,
                    )}`}
                  >
                    {cat} · {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
              <SectionList
                sections={sections}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <SectionPreview section={selectedSection} />
            </div>

            <div className="mt-4">
              <ExportPreview content={exportContent} />
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-8 pt-4 text-center text-xs text-slate-400 sm:px-8">
        <p>Local-first · No API key · Processed entirely in your browser.</p>
        <p className="mt-1.5">
          © 2026 wuisabel-gif. All rights reserved.{" "}
          <a
            href="https://github.com/wuisabel-gif?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-slate-500 transition hover:text-brand-blue"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
              <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
            </svg>
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
