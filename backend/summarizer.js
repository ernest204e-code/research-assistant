export function summarizeText(text, maxSentences = 5) {
  if (!text) return "";
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length <= maxSentences) return sentences.join(" ");

  const wordCounts = {};
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  for (const w of words) wordCounts[w] = (wordCounts[w] || 0) + 1;

  const score = s =>
    (s.toLowerCase().match(/[a-z0-9]+/g) || []).reduce((acc, w) => acc + (wordCounts[w] || 0), 0);

  const ranked = sentences
    .map((s, i) => ({ i, s, sc: score(s) }))
    .sort((a, b) => b.sc - a.sc)
    .slice(0, maxSentences)
    .sort((a, b) => a.i - b.i)
    .map(o => o.s);

  return ranked.join(" ");
}
