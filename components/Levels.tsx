"use client";

// The map. Four levels, each a short list of steps she can jump straight into.
//
// Nothing is locked. The ticks show where she got to; they are not a gate.
// Deliberately no points, streaks or XP — this is navigation, not a game.

import { LEVELS, stepId, type Step } from "@/content/levels";
import { unitByKey } from "@/content/units";
import { sceneByKey } from "@/content/scenes";
import { DAY_MODES } from "@/content/moments";
import type { Progress } from "@/lib/progress";
import { isDone, levelProgress } from "@/lib/progress";
import { UI } from "@/content/ui";

export function stepLabel(s: Step): { title: string; sub: string; kind: string } {
  if (s.kind === "unit") {
    const u = unitByKey(s.key);
    return { title: u?.title ?? s.key, sub: u?.titleEn ?? "", kind: "Wahei" };
  }
  if (s.kind === "scene") {
    const sc = sceneByKey(s.key);
    return { title: sc?.title ?? s.key, sub: sc?.titleEn ?? "", kind: "Wari" };
  }
  if (s.kind === "fluency") {
    return { title: UI.fluencyTitle, sub: UI.fluencyTitleEn, kind: "Yangna" };
  }
  if (s.kind === "review") {
    return { title: UI.reviewTitle, sub: UI.reviewTitleEn, kind: "Ningsing" };
  }
  const m = DAY_MODES[s.mode];
  return { title: `${UI.dayCard} — ${m.label}`, sub: m.subEn, kind: "Numit" };
}

export function Levels({
  progress, openLevel, onToggleLevel, onOpen,
}: {
  progress: Progress;
  openLevel: number | null;
  onToggleLevel: (n: number) => void;
  onOpen: (s: Step) => void;
}) {
  return (
    <div className="levels">
      {LEVELS.map(l => {
        const { done, total, complete } = levelProgress(progress, l.steps);
        const isOpen = openLevel === l.n;
        return (
          <div key={l.n} className={`level${complete ? " complete" : isOpen ? " active" : ""}`}>
            <button
              className="level-head"
              type="button"
              aria-expanded={isOpen}
              onClick={() => onToggleLevel(l.n)}
            >
              <span className="level-n">{complete ? "✓" : l.n}</span>
              <span className="level-t">
                <b>{UI.levelWord} {l.n} · {l.title}</b>
                <s>{l.titleEn} — {l.blurbEn}</s>
                <span className="level-meter">
                  {l.steps.map((s, k) => (
                    <i key={k} className={isDone(progress, s) ? "on" : ""} />
                  ))}
                </span>
              </span>
              <span className="level-chev">{isOpen ? "▲" : "▼"}&nbsp;{done}/{total}</span>
            </button>

            {isOpen && (
              <div className="steps">
                {l.steps.map(s => {
                  const info = stepLabel(s);
                  const done = isDone(progress, s);
                  return (
                    <button
                      key={stepId(s)}
                      className={`step${done ? " done" : ""}`}
                      type="button"
                      onClick={() => onOpen(s)}
                    >
                      <span className="step-tick">✓</span>
                      <span className="step-t"><b>{info.title}</b><s>{info.sub}</s></span>
                      <span className="step-kind">{info.kind}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
