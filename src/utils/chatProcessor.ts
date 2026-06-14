import { estimateTokens } from "./tokenEstimate";
import { CATEGORIES, OTHER_CATEGORY, getCategory, type CategoryDef } from "../data/categories";

/** A single topic-based section of a processed conversation. */
export type ChatSection = {
  id: string;
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  originalText: string;
  estimatedTokens: number;
};

type Turn = {
  speaker: string | null;
  text: string;
};

/** Speaker prefixes we recognise at the start of a line, e.g. "User:" / "ChatGPT -". */
const SPEAKER_PATTERN =
  /^\s*(user|you|me|human|assistant|chatgpt|gpt|ai|bot|claude|q|a|question|answer|system)\s*[:>\-–]\s*/i;

function normaliseSpeaker(raw: string): string {
  const s = raw.toLowerCase();
  if (["user", "you", "me", "human", "q", "question"].includes(s)) return "User";
  if (["assistant", "chatgpt", "gpt", "ai", "bot", "claude", "a", "answer"].includes(s)) return "Assistant";
  if (s === "system") return "System";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Collapse runs of whitespace and trailing spaces while preserving line breaks. */
function cleanWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split raw text into speaker turns. Falls back to blank-line paragraphs when
 * no speaker markers are present so unstructured pastes still get chunked.
 */
function parseTurns(text: string): Turn[] {
  const lines = text.split("\n");
  const turns: Turn[] = [];
  let current: Turn | null = null;

  for (const line of lines) {
    const match = line.match(SPEAKER_PATTERN);
    if (match) {
      if (current) turns.push(current);
      current = {
        speaker: normaliseSpeaker(match[1]),
        text: line.slice(match[0].length),
      };
    } else if (current) {
      current.text += "\n" + line;
    } else if (line.trim()) {
      current = { speaker: null, text: line };
    }
  }
  if (current) turns.push(current);

  const withContent = turns
    .map((t) => ({ speaker: t.speaker, text: t.text.trim() }))
    .filter((t) => t.text.length > 0);

  // No speaker markers detected → fall back to paragraph chunks.
  const hasSpeakers = withContent.some((t) => t.speaker !== null);
  if (!hasSpeakers) {
    return text
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => ({ speaker: null, text: p }));
  }

  return withContent;
}

/** Score a block of text against each category by counting keyword hits. */
function classify(text: string): { category: string; matched: string[] } {
  const haystack = text.toLowerCase();
  let best: { def: CategoryDef; score: number; matched: string[] } | null = null;

  for (const def of CATEGORIES) {
    const matched: string[] = [];
    let score = 0;
    for (const kw of def.keywords) {
      // Require a non-alphanumeric boundary *before* the keyword so "merge"
      // doesn't fire inside "submerge". For keywords of 4+ letters, allow a
      // trailing suffix (commit→committed, branch→branches, merge→merging).
      // Short keywords (git, rag) stay exact to avoid hits like "rage".
      const allowSuffix = kw.length >= 4 && !kw.includes(" ");
      const tail = allowSuffix ? "[a-z]*(?:[^a-z0-9]|$)" : "(?:[^a-z0-9]|$)";
      const re = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(kw)}${tail}`, "g");
      const hits = haystack.match(re);
      if (hits) {
        score += hits.length;
        matched.push(kw);
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { def, score, matched };
    }
  }

  if (!best) return { category: OTHER_CATEGORY, matched: [] };
  return { category: best.def.name, matched: best.matched };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const TITLE_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "for", "with",
  "how", "do", "i", "you", "can", "is", "are", "what", "why", "my", "me",
  "please", "help", "could", "would", "should", "this", "that", "it",
]);

/** Build a short Title-Cased heading from the first user-ish line of a section. */
function makeTitle(text: string, category: string): string {
  const rawLine = text.split("\n").find((l) => l.trim().length > 0) ?? "";
  // Drop a leading "User:" / "Assistant:" speaker label so it doesn't become
  // the first word of every title.
  const firstLine = rawLine.replace(/^\s*[A-Za-z]+\s*:\s*/, "");
  const firstSentence = firstLine.split(/[.!?]/)[0].trim();

  const words = firstSentence
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const meaningful = words.filter((w) => !TITLE_STOPWORDS.has(w.toLowerCase()));
  const picked = (meaningful.length >= 2 ? meaningful : words).slice(0, 6);

  if (picked.length === 0) return category;

  return picked
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Pick up to `limit` representative keywords for a section. */
function pickKeywords(text: string, matched: string[], limit = 5): string[] {
  const result = [...new Set(matched)];
  if (result.length >= limit) return result.slice(0, limit);

  // Top up with frequent content words from the section itself.
  const freq = new Map<string, number>();
  for (const raw of text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (TITLE_STOPWORDS.has(raw)) continue;
    freq.set(raw, (freq.get(raw) ?? 0) + 1);
  }
  const extra = [...freq.entries()]
    .filter(([w]) => !result.includes(w))
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w);

  for (const w of extra) {
    if (result.length >= limit) break;
    result.push(w);
  }
  return result;
}

function makeSummary(category: string, keywords: string[]): string {
  const kw = keywords.slice(0, 3).join(", ");
  return `This section covers ${getCategory(category).blurb}${kw ? ` (${kw})` : ""}.`;
}

/**
 * Process a raw conversation paste into topic-based sections.
 *
 * Adjacent turns sharing the same detected category are merged into a single
 * section, so a back-and-forth on one topic stays together.
 */
export function processChat(rawText: string): ChatSection[] {
  const cleaned = cleanWhitespace(rawText);
  if (!cleaned) return [];

  const turns = parseTurns(cleaned);
  if (turns.length === 0) return [];

  // Group turns into topic sections. A conversation exchange is user-led: the
  // user's question sets the topic and the assistant's reply inherits it (its
  // answer often name-drops adjacent tools, which shouldn't start a new topic).
  // A user follow-up with no clear topic continues the current section.
  type Group = { category: string; matched: string[]; turns: Turn[] };
  const groups: Group[] = [];
  let currentTopic: string | null = null;

  for (const turn of turns) {
    const { category, matched } = classify(turn.text);
    const isUserLed = turn.speaker === "User" || turn.speaker === null;

    let topic: string;
    if (isUserLed) {
      topic = category !== OTHER_CATEGORY ? category : currentTopic ?? OTHER_CATEGORY;
    } else {
      // Assistant / System turn inherits the established topic.
      topic = currentTopic ?? category;
    }
    currentTopic = topic;

    const last = groups[groups.length - 1];
    if (last && last.category === topic) {
      last.turns.push(turn);
      last.matched.push(...matched);
    } else {
      groups.push({ category: topic, matched: [...matched], turns: [turn] });
    }
  }

  return groups.map((group, index) => {
    const originalText = group.turns
      .map((t) => (t.speaker ? `${t.speaker}: ${t.text}` : t.text))
      .join("\n\n");

    const keywords = pickKeywords(originalText, group.matched);

    return {
      id: `section-${index + 1}`,
      title: makeTitle(originalText, group.category),
      category: group.category,
      summary: makeSummary(group.category, keywords),
      keywords,
      originalText,
      estimatedTokens: estimateTokens(originalText),
    };
  });
}

/** Convenience: total estimated tokens across all sections. */
export function totalTokens(sections: ChatSection[]): number {
  return sections.reduce((sum, s) => sum + s.estimatedTokens, 0);
}

/** Convenience: count of sections per category (for the breakdown UI). */
export function categoryBreakdown(sections: ChatSection[]): Record<string, number> {
  const breakdown: Record<string, number> = {};
  for (const s of sections) {
    breakdown[s.category] = (breakdown[s.category] ?? 0) + 1;
  }
  return breakdown;
}
