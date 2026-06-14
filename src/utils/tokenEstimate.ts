/**
 * Rough token estimator for the frontend MVP.
 *
 * This is intentionally simple — it does not use a real BPE tokenizer.
 * The heuristic `words * 1.3` is good enough to give users a sense of scale
 * without shipping a tokenizer dependency. It can be swapped for a precise
 * tokenizer later without changing callers.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateTokens(text: string): number {
  return Math.ceil(countWords(text) * 1.3);
}
