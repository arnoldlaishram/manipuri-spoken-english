// Scoring her speech. This is ALL local — no Claude, no network.
//
// What it measures is INTELLIGIBILITY, not pronunciation: if the machine
// transcribed the word, a stranger would have understood it. Do not dress
// this up as a pronunciation score, because it isn't one.

export const norm = (s: string) =>
  String(s).toLowerCase().replace(/[.,!?;:'"’\-]/g, "").replace(/\s+/g, " ").trim();

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Authored content may carry <b>/<i>; the synthesiser must not read the tags. */
export const plain = (html: string) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export const bareWords = (en: string) =>
  String(en).replace(/[.?!]+$/, "").split(/\s+/).filter(Boolean);

export type Diff = { words: string[]; hit: boolean[]; score: number };

/** Longest-common-subsequence word match: which target words actually came through? */
export function wordDiff(target: string, said: string): Diff {
  const t = norm(target).split(" ").filter(Boolean);
  const s = norm(said).split(" ").filter(Boolean);
  const m = t.length, n = s.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Array(m).fill(false);
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (t[i] === s[j]) { hit[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { words: t, hit, score: m ? hit.filter(Boolean).length / m : 0 };
}

/** Best of the recogniser's alternatives, so a stray first guess doesn't fail her. */
export function bestOf(target: string, candidates: string[]): string {
  return candidates.reduce(
    (a, b) => (wordDiff(target, b).score > wordDiff(target, a).score ? b : a),
    candidates[0] ?? ""
  );
}

export function accepts(target: string, accept: string[], said: string): boolean {
  const v = norm(said);
  return v === norm(target) || accept.some(a => norm(a) === v);
}

export const GOOD = 0.8;
export const PARTIAL = 0.5;
