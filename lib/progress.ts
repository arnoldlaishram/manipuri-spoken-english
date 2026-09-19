"use client";

// Saved progress. Lives in this browser's localStorage on her machine —
// nothing leaves the device and there is no account.
//
// Two things learned the hard way:
//
// 1. A cross-origin iframe (run-kit's tile, a published artifact) blocks
//    localStorage, sessionStorage AND cookies. Not "returns empty" — throws.
//    Nothing can be saved there, so the app has to say so rather than quietly
//    forget everything on each refresh.
//
// 2. Recording progress only when a whole step FINISHES makes a half-finished
//    lesson look untouched. Progress is now recorded per item, so four phrases
//    into a six-phrase scene shows 4/6 and reopening resumes there.

import { useCallback, useEffect, useState } from "react";
import { ALL_STEPS, stepId, type Step } from "@/content/levels";

const KEY = "haiyu.progress.v1";

export type Progress = {
  done: Record<string, true>;      // stepId -> finished outright
  at: Record<string, number>;      // stepId -> how many items done so far
  totals: Record<string, number>;  // stepId -> how many items it has
  missed: Record<string, number>;  // English phrase -> times missed
  last?: string;                   // stepId she was last in
  days: number;                    // how many times she has told her day
  updated: number;
};

const EMPTY: Progress = { done: {}, at: {}, totals: {}, missed: {}, days: 0, updated: 0 };

/** Can this browsing context store anything at all? Throws in a framed page. */
export function storageWorks(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = "__haiyu_probe";
    window.localStorage.setItem(k, "1");
    const ok = window.localStorage.getItem(k) === "1";
    window.localStorage.removeItem(k);
    return ok;
  } catch {
    return false;
  }
}

function read(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return EMPTY;
  }
}
function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...p, updated: Date.now() }));
  } catch {
    /* framed page, private window, storage full — the session still works */
  }
}

/**
 * Progress is read after mount, never during render, so the server-rendered
 * HTML and the first client render agree.
 */
export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(true);

  useEffect(() => { setP(read()); setCanSave(storageWorks()); setReady(true); }, []);

  const update = useCallback((fn: (prev: Progress) => Progress) => {
    setP(prev => { const next = fn(prev); write(next); return next; });
  }, []);

  const markDone = useCallback((id: string) => {
    update(prev => ({
      ...prev,
      done: { ...prev.done, [id]: true },
      at: { ...prev.at, [id]: prev.totals[id] ?? prev.at[id] ?? 0 },
      last: id,
    }));
  }, [update]);

  const markOpened = useCallback((id: string) => {
    update(prev => (prev.last === id ? prev : { ...prev, last: id }));
  }, [update]);

  /** Called as she moves through a step, so partial work is never lost. */
  const markAt = useCallback((id: string, index: number, total: number) => {
    update(prev => {
      const best = Math.max(prev.at[id] ?? 0, index);
      if (prev.at[id] === best && prev.totals[id] === total) return prev;
      return { ...prev, at: { ...prev.at, [id]: best }, totals: { ...prev.totals, [id]: total }, last: id };
    });
  }, [update]);

  const addMiss = useCallback((phrase: string) => {
    update(prev => ({ ...prev, missed: { ...prev.missed, [phrase]: (prev.missed[phrase] ?? 0) + 1 } }));
  }, [update]);

  const addDay = useCallback(() => {
    update(prev => ({ ...prev, days: prev.days + 1 }));
  }, [update]);

  const reset = useCallback(() => { update(() => ({ ...EMPTY })); }, [update]);

  return { progress: p, ready, canSave, markDone, markOpened, markAt, addMiss, addDay, reset };
}

/** Where to re-enter a step she left half-done. */
export function resumeAt(p: Progress, id: string): number {
  if (p.done[id]) return 0;                    // finished: start it again from the top
  return p.at[id] ?? 0;
}

/** The step to offer as "carry on". */
export function nextStep(p: Progress): Step {
  if (p.last && !p.done[p.last]) {
    const s = ALL_STEPS.find(x => stepId(x) === p.last);
    if (s) return s;
  }
  return ALL_STEPS.find(x => !p.done[stepId(x)]) ?? ALL_STEPS[0];
}

export const isDone = (p: Progress, s: Step) => Boolean(p.done[stepId(s)]);

/** 0 to 1, counting part-finished steps. */
export function stepFraction(p: Progress, s: Step): number {
  const id = stepId(s);
  if (p.done[id]) return 1;
  const total = p.totals[id] ?? 0;
  if (!total) return 0;
  return Math.min(1, (p.at[id] ?? 0) / total);
}

export function stepCounts(p: Progress, s: Step): { at: number; total: number } | null {
  const id = stepId(s);
  const total = p.totals[id] ?? 0;
  if (!total || p.done[id]) return null;
  const at = p.at[id] ?? 0;
  return at > 0 ? { at, total } : null;
}

export function levelProgress(p: Progress, steps: Step[]) {
  const done = steps.filter(s => isDone(p, s)).length;
  const part = steps.reduce((n, s) => n + stepFraction(p, s), 0);
  return { done, part, total: steps.length, complete: done === steps.length && steps.length > 0 };
}

export const weakSpots = (p: Progress) =>
  Object.keys(p.missed).filter(k => p.missed[k] >= 2);
