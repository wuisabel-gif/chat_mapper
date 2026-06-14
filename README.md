# Chat Mapper

Chat Mapper is a web application that transforms long AI conversations into structured topic-based knowledge sections with summaries, keywords, token estimates, and downloadable TXT exports.

The first version is intentionally local-first. It does not require an API key or backend. It demonstrates the information architecture behind conversation chunking before adding full LangChain or vector database support.

## Workflow

```text
Paste long chat history
    ↓
Organize into topic sections
    ↓
Preview structured result
    ↓
Download as .txt
```

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

Then open the printed local URL, paste a conversation (or click **Load Sample**), press **Process Chat**, and **Download TXT**.

## Importing a conversation

There are two ways to get a conversation in:

- **Paste (recommended — always works).** Open your ChatGPT / Claude / Gemini conversation, select all (`Cmd/Ctrl+A`), copy, and paste into the **Paste Chat** tab. Chat Mapper automatically strips the provider's page chrome (e.g. "Skip to content / Chat history / ChatGPT is AI…"), so even a whole-page copy produces clean sections.
- **Share link (local-only, best-effort).** In the **hosted/online version the Share Link tab is disabled** — it shows a notice linking to this repo, because fetching links needs the backend. Run Chat Mapper **locally from source** to enable it. Even then it's best-effort (see below).

### ⚠️ Known limitation: share links can't be read automatically

This is a provider restriction, **not a bug** in Chat Mapper:

1. **The conversation is rendered by the page's JavaScript** after load. A fetched share page is just an empty app shell — the messages aren't in the HTML.
2. **The underlying data endpoints are bot-/auth-protected and have no CORS headers.** ChatGPT's share API (`/backend-api/share/<id>`) returns **HTTP 403** to any non-browser request; Claude/Gemini load chats from gated APIs. So neither the browser nor a server-side proxy can retrieve the conversation.

Because of this, link import is **gated to local installs only**: the deployed site disables it (it would always fail), while running locally lets the included backend proxy (`server/`, used when `VITE_API_URL` is set) attempt a fetch. The proxy does **not** bypass the protections above — it only helps for pages that ship real text in their HTML. **For ChatGPT, Claude, and Gemini, paste is the reliable path**, online or local.

## How it works (MVP)

All processing happens in the browser — no network calls, no keys:

- **`src/utils/chatProcessor.ts`** — parses speaker turns (or paragraphs), classifies each by keyword-based topic detection, merges adjacent same-topic turns into sections, and generates a title, summary, keywords, and token estimate per section.
- **`src/utils/tokenEstimate.ts`** — rough estimate (`words × 1.3`); swap in a real tokenizer later.
- **`src/utils/exportTxt.ts`** — builds the structured `.txt` string and triggers a Blob-based download.

### Topic categories

Git / GitHub · LangChain · LangGraph · LangSmith · RAG / Retrieval · Prompt Engineering · AI Agents · Robotics / ROS2 · Embedded Systems · Resume / Portfolio · Image Generation · Other

## Tech stack

React · TypeScript · Vite · Tailwind CSS. No backend, no LangChain in v1. Deployable on GitHub Pages or Vercel (the build uses a relative base path).

## Project structure

```text
chat-mapper/
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── data/sampleChat.ts
│   ├── utils/{chatProcessor,exportTxt,tokenEstimate,categoryStyles}.ts
│   └── components/{ChatInput,SectionList,SectionPreview,ExportPreview,DownloadButton}.tsx
└── prototype/            # early static HTML design mockups
```

## Roadmap

Markdown & JSON export · semantic search · localStorage saved histories · LangChain backend pipeline · embeddings (Chroma/FAISS) · retrieval-based Q&A · AI-generated summaries · topic timeline · redundant-token detection.
