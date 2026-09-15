"use client";

// Saved progress. Lives in this browser's localStorage on her laptop —
// nothing leaves the machine, and there is no account to sign into.

import { useCallback, useEffect, useState } from "react";
import { ALL_STEPS, stepId, type Step } from "@/content/levels";

const KEY = "haiyu.progress.v1";

export type Progress = {
  done: Record<string, true>;      // stepId -> finished
  missed: Record<string, number>;  // English phrase -> times missed
  last?: string;                   // stepId she was last in
  days: number;                    // how many times she has told her day
  updated: number;
};

const EMPTY: Progress = { done: {}, missed: {}, days: 0, updated: 0 };

function read(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) };
  } catch {
    return EMPTY;   // private window, blocked storage, corrupt value
  }
}

function write(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...p, updated: Date.now() }));
  } catch {
    /* storage unavailable — the session still works, it just won't be remembered */
  }
}

/**
 * Progress is read after mount, never during render, so the server-rendered
 * HTML and the first client render agree (otherwise React hydration errors).
 * `ready` is false until that has happened.
 */
export function useProgress() {
  const [p, setP] = useState<Progress>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => { setP(read()); setReady(true); }, []);

  const update = useCallback((fn: (prev: Progress) => Progress) => {
    setP(prev => { const next = fn(prev); write(next); return next; });
  }, []);

  const markDone = useCallback((id: string) => {
    update(prev => ({ ...prev, done: { ...prev.done, [id]: true }, last: id }));
  }, [update]);

  const markOpened = useCallback((id: string) => {
    update(prev => (prev.last === id ? prev : { ...prev, last: id }));
  }, [update]);

  const addMiss = useCallback((phrase: string) => {
    update(prev => ({ ...prev, missed: { ...prev.missed, [phrase]: (prev.missed[phrase] ?? 0) + 1 } }));
  }, [update]);

  const addDay = useCallback(() => {
    update(prev => ({ ...prev, days: prev.days + 1 }));
  }, [update]);

  const reset = useCallback(() => { update(() => ({ ...EMPTY })); }, [update]);

  return { progress: p, ready, markDone, markOpened, addMiss, addDay, reset };
}

/** The step to offer as "carry on" — where she stopped, else the first unfinished one. */
export function nextStep(p: Progress): Step {
  if (p.last && !p.done[p.last]) {
    const s = ALL_STEPS.find(x => stepId(x) === p.last);
    if (s) return s;
  }
  return ALL_STEPS.find(x => !p.done[stepId(x)]) ?? ALL_STEPS[0];
}

export const isDone = (p: Progress, s: Step) => Boolean(p.done[stepId(s)]);

export function levelProgress(p: Progress, steps: Step[]) {
  const done = steps.filter(s => isDone(p, s)).length;
  return { done, total: steps.length, complete: done === steps.length && steps.length > 0 };
}

/** Phrases she has missed more than once — worth showing again. */
export const weakSpots = (p: Progress) =>
  Object.keys(p.missed).filter(k => p.missed[k] >= 2);
