export function charCount(text: string): number {
  return text.length;
}

function bigrams(text: string): Set<string> {
  const clean = text.replace(/\s+/g, "");
  const set = new Set<string>();
  for (let i = 0; i < clean.length - 1; i++) {
    set.add(clean.slice(i, i + 2));
  }
  return set;
}

export function similarity(a: string, b: string): number {
  if (!a.trim() || !b.trim()) return 0;
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const g of setA) {
    if (setB.has(g)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface SimilarMatch {
  text: string;
  score: number;
  label: string;
}

export function findSimilar(
  target: string,
  candidates: { text: string; label: string }[],
  threshold = 0.35
): SimilarMatch[] {
  return candidates
    .map((c) => ({ text: c.text, label: c.label, score: similarity(target, c.text) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
