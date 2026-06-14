/**
 * Import a conversation from a shared chat link (ChatGPT, Claude, etc.).
 *
 * Browsers cannot fetch chatgpt.com / claude.ai directly — those responses
 * have no CORS headers for our origin — so we route the request through a
 * public CORS proxy. The fetched page/JSON is then parsed into a normalized
 * "User: ... / Assistant: ..." transcript that `processChat` understands.
 *
 * This is best-effort: share pages change their markup, and proxies can be
 * rate-limited or down. On any failure the caller should fall back to manual
 * paste, which always works.
 */

export type ImportMethod = "structured" | "text";

export type ImportResult = {
  /** Normalized transcript ready to feed into processChat. */
  transcript: string;
  provider: string;
  method: ImportMethod;
  /** Number of speaker turns recovered (0 for plain-text fallback). */
  messageCount: number;
};

type RawMessage = { role: "User" | "Assistant" | "System"; text: string };

/** Our own backend proxy (Render Web Service), if configured at build time.
 *  Accepts a full URL or a bare host (https:// is added automatically). */
const RAW_API = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");
const API_BASE = RAW_API
  ? /^https?:\/\//i.test(RAW_API)
    ? RAW_API
    : `https://${RAW_API}`
  : undefined;

/** Public CORS proxies — unreliable fallback used when no backend is set. */
const PROXIES: Array<(url: string) => string> = [
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

/** Ordered fetch targets: our backend first (most reliable), then fallbacks. */
function buildAttempts(url: string): string[] {
  const attempts: string[] = [];
  if (API_BASE) attempts.push(`${API_BASE}/api/fetch?url=${encodeURIComponent(url)}`);
  attempts.push(url, ...PROXIES.map((p) => p(url)));
  return attempts;
}

/** Ensure the URL has a scheme so it can be fetched and parsed. */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isLikelyUrl(value: string): boolean {
  const v = value.trim();
  return /^https?:\/\/\S+$/i.test(v) || /^[\w-]+(\.[\w-]+)+\/\S*/i.test(v);
}

function detectProvider(url: string): string {
  const host = safeHost(url);
  if (host.includes("chatgpt.com") || host.includes("openai.com")) return "ChatGPT";
  if (host.includes("claude.ai")) return "Claude";
  if (host.includes("gemini.google") || host.includes("bard.google")) return "Gemini";
  if (host.includes("poe.com")) return "Poe";
  return "Link";
}

function safeHost(url: string): string {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

/** Fetch a URL as text, attempting the origin directly then each proxy. */
async function fetchText(url: string, timeoutMs = 15000): Promise<string> {
  const attempts = buildAttempts(url);
  let lastErr: unknown;

  for (const target of attempts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(target, {
        signal: controller.signal,
        headers: { Accept: "text/html,application/json,*/*" },
      });
      clearTimeout(timer);
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      const text = await res.text();
      if (text && text.trim().length > 0) return text;
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) console.debug("Chat Mapper link fetch failed:", lastErr);
  throw new Error(
    "Couldn't fetch this link — it may be private or blocked. Open it, copy the text, and paste it instead.",
  );
}

// --- Role / content normalization ---------------------------------------

function normRole(raw: unknown): RawMessage["role"] | null {
  if (typeof raw !== "string") return null;
  const s = raw.toLowerCase();
  if (s === "user" || s === "human") return "User";
  if (["assistant", "ai", "bot", "claude", "gpt", "model"].includes(s)) return "Assistant";
  if (s === "system" || s === "tool") return "System";
  return null;
}

/** Pull plain text out of the many content shapes providers use. */
function textFromContent(content: unknown, depth = 0): string {
  if (content == null || depth > 8) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c) => textFromContent(c, depth + 1)).filter(Boolean).join("\n");
  }
  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    if (Array.isArray(obj.parts)) return textFromContent(obj.parts, depth + 1);
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.content === "string") return obj.content;
    if (obj.content) return textFromContent(obj.content, depth + 1);
  }
  return "";
}

/** Parse the ChatGPT share JSON model into ordered messages. */
function fromChatGptJson(data: unknown): RawMessage[] {
  const root = data as Record<string, unknown> | null;
  if (!root) return [];

  const list = Array.isArray(root.linear_conversation)
    ? (root.linear_conversation as unknown[])
    : root.mapping && typeof root.mapping === "object"
      ? Object.values(root.mapping as Record<string, unknown>)
      : null;
  if (!list) return [];

  const out: RawMessage[] = [];
  for (const entry of list) {
    const node = entry as Record<string, unknown>;
    const msg = (node?.message ?? node) as Record<string, unknown> | undefined;
    if (!msg) continue;
    const author = msg.author as Record<string, unknown> | undefined;
    const role = normRole(author?.role ?? msg.role);
    if (!role) continue;
    const meta = msg.metadata as Record<string, unknown> | undefined;
    if (meta?.is_visually_hidden_from_conversation) continue;
    const text = textFromContent(msg.content).trim();
    if (text) out.push({ role, text });
  }
  return out;
}

/** Recursively walk arbitrary parsed JSON collecting message-shaped nodes. */
function collectMessages(node: unknown, out: RawMessage[], depth = 0): void {
  if (!node || typeof node !== "object" || depth > 12) return;
  const obj = node as Record<string, unknown>;

  const author = obj.author as Record<string, unknown> | undefined;
  const sender = obj.sender as Record<string, unknown> | undefined;
  const role = normRole(author?.role ?? obj.role ?? sender?.role ?? obj.sender ?? obj.from);
  if (role) {
    const text = textFromContent(obj.content ?? obj.text ?? obj.parts).trim();
    if (text) out.push({ role, text });
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") collectMessages(value, out, depth + 1);
  }
}

/** Try to recover structured messages from embedded JSON in a share page. */
function extractMessagesFromHtml(html: string): RawMessage[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: RawMessage[] = [];

  for (const script of Array.from(doc.querySelectorAll("script"))) {
    const txt = script.textContent?.trim();
    if (!txt || (txt[0] !== "{" && txt[0] !== "[")) continue;
    try {
      collectMessages(JSON.parse(txt), out);
    } catch {
      /* not pure JSON — ignore */
    }
  }
  return dedupe(out);
}

/** Last-resort: strip chrome and return the page's readable text. */
function extractReadableText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc
    .querySelectorAll("script, style, noscript, svg, nav, header, footer, link, meta")
    .forEach((el) => el.remove());
  const body = doc.body?.textContent ?? "";
  return body
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

function dedupe(messages: RawMessage[]): RawMessage[] {
  const result: RawMessage[] = [];
  for (const m of messages) {
    const prev = result[result.length - 1];
    if (prev && prev.role === m.role && prev.text === m.text) continue;
    result.push(m);
  }
  return result;
}

function dropEmptyAndSystem(messages: RawMessage[]): RawMessage[] {
  return messages.filter((m) => m.role !== "System" && m.text.trim().length > 0);
}

function toTranscript(messages: RawMessage[]): string {
  return messages.map((m) => `${m.role}: ${m.text}`).join("\n\n");
}

function chatgptShareId(url: string): string | null {
  const m = url.match(/share\/(?:e\/)?([a-z0-9-]{8,})/i);
  return m ? m[1] : null;
}

/** Import and normalize a conversation from a shared chat link. */
export async function importFromLink(rawUrl: string): Promise<ImportResult> {
  const url = normalizeUrl(rawUrl);
  if (!url) throw new Error("Enter a link first.");
  const provider = detectProvider(url);

  // 1. ChatGPT exposes a clean, stable share JSON endpoint — prefer it.
  if (provider === "ChatGPT") {
    const id = chatgptShareId(url);
    if (id) {
      for (const apiUrl of [
        `https://chatgpt.com/backend-api/share/${id}`,
        `https://chat.openai.com/backend-api/share/${id}`,
      ]) {
        try {
          const data = JSON.parse(await fetchText(apiUrl));
          const msgs = dropEmptyAndSystem(fromChatGptJson(data));
          if (msgs.length >= 1) {
            return { transcript: toTranscript(msgs), provider, method: "structured", messageCount: msgs.length };
          }
        } catch {
          /* fall through to HTML scraping */
        }
      }
    }
  }

  // 2. Generic: fetch the page and try structured-then-text extraction.
  const html = await fetchText(url);

  const structured = dropEmptyAndSystem(extractMessagesFromHtml(html));
  if (structured.length >= 2) {
    return { transcript: toTranscript(structured), provider, method: "structured", messageCount: structured.length };
  }

  // The big AI providers render the chat with client-side JS behind a gated
  // API, so a fetched page is just an empty shell — its readable text is junk.
  // Don't pretend: tell the user to paste instead of producing garbage sections.
  const isAiProvider = ["ChatGPT", "Claude", "Gemini", "Poe"].includes(provider);
  const text = extractReadableText(html);

  if (isAiProvider || !text || text.length < 600) {
    throw new Error(
      "This chat is loaded by the page's JavaScript, so it can't be read from the link. " +
        "Open the link, select all (Ctrl/Cmd+A), copy, and paste it in the Paste Chat tab.",
    );
  }

  // Non-AI pages that ship real text in the HTML can still work.
  return { transcript: text, provider, method: "text", messageCount: 0 };
}
