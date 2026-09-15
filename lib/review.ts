"use client";

// Spaced review.
//
// Without this, every sentence in the app is practised exactly once and then
// forgotten — which is what the spacing research says will happen. Expanding
// intervals with retrieval (she must produce it, not recognise it) are the
// best-evidenced thing we can do per minute of her time.
//
// A plain Leitner ladder, because it is predictable and needs no tuning:
//   got it   -> move up a box, next due further away
//   missed   -> straight back to box 0, due tomorrow
//
// Everything lives in this browser. No account, nothing uploaded.

import { useCallback, useEffect, useState } from "react";

const KEY = "haiyu.review.v1";
const DAY = 24 * 60 * 60 * 1000;

/** Days until the next sight of a card, by box. Expanding, as the research prefers. */
export const LADDER = [1, 3, 7, 16, 35, 90];

export type Card = {
  id: string;          // "unit:core:2" / "scene:shop:0"
  en: string;          // what she must say
  mni: string;         // the prompt she sees
  box: number;         // position on the ladder
  due: number;         // epoch ms
  seen: number;        // how many times practised
  lapses: number;      // how many times she has lost it
};

type Store = Record<string, Card>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Store; } catch { return {}; }
}
function write(s: Store) {
  try { window.localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

/**
 * Record one attempt. Called the moment she answers, so a half-finished unit
 * still leaves her something to review tomorrow.
 */
export function practise(id: string, en: string, mni: string, ok: boolean) {
  const s = read();
  const prev = s[id];
  const box = ok ? Math.min((prev?.box ?? -1) + 1, LADDER.length - 1) : 0;
  s[id] = {
    id, en, mni, box,
    due: Date.now() + LADDER[box] * DAY,
    seen: (prev?.seen ?? 0) + 1,
    lapses: (prev?.lapses ?? 0) + (ok ? 0 : 1),
  };
  write(s);
}

export const allCards = (): Card[] => Object.values(read());

/** Cards she should see now, weakest first, capped so a session stays short. */
export function due(limit = 12, at: number = Date.now()): Card[] {
  return allCards()
    .filter(c => c.due <= at)
    .sort((a, b) => a.box - b.box || a.due - b.due)
    .slice(0, limit);
}

export function nextDueAt(): number | null {
  const times = allCards().map(c => c.due).sort((a, b) => a - b);
  return times.length ? times[0] : null;
}

/** How much she is holding: a card at box 3+ has survived a fortnight. */
export function held(): { total: number; solid: number } {
  const all = allCards();
  return { total: all.length, solid: all.filter(c => c.box >= 3).length };
}

export function useReview() {
  const [count, setCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, solid: 0 });
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setCount(due().length);
    setStats(held());
  }, []);

  useEffect(() => { refresh(); setReady(true); }, [refresh]);
  return { dueCount: count, stats, ready, refresh };
}
