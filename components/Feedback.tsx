"use client";

import type { Diff } from "@/lib/score";
import { GOOD, PARTIAL } from "@/lib/score";
import { UI } from "@/content/ui";

/** Her sentence with the words the recogniser missed underlined in red. */
export function MarkedUp({ target, diff }: { target: string; diff: Diff }) {
  const raw = String(target).split(/\s+/);
  return (
    <span>
      {raw.map((w, i) => (
        <span key={i} className={diff.hit[i] ? "w-hit" : "w-miss"}>{w}{i < raw.length - 1 ? " " : ""}</span>
      ))}
    </span>
  );
}

export const tone = (score: number) => (score >= GOOD ? "ok" : score >= PARTIAL ? "mid" : "no");
export const head = (score: number) =>
  score >= GOOD ? UI.goodHead : score >= PARTIAL ? UI.midHead : UI.badHead;
