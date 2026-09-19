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
import { isDone, levelProgress, stepCounts, stepFraction } from "@/lib/progress";
import { UI } from "@/content/ui";

export type StepLabel = { title: string; sub: string; subMni: string; kind: string };

/** Manipuri name, English gloss, and the Manipuri gloss under it. */
export function stepLabel(step: Step): StepLabel {
  if (step.kind === "unit") {
    const unit = unitByKey(step.key);
    return { title: unit?.title ?? step.key, sub: unit?.gistEn ?? "", subMni: unit?.gist ?? "", kind: "Wahei" };
  }
  if (step.kind === "scene") {
    const scene = sceneByKey(step.key);
    return { title: scene?.title ?? step.key, sub: scene?.titleEn ?? "", subMni: scene?.blurb ?? "", kind: "Wari" };
  }
  if (step.kind === "fluency") {
    return { title: UI.fluencyTitle, sub: UI.fluencyTitleEn, subMni: UI.fluencySubMni, kind: "Yangna" };
  }
  if (step.kind === "review") {
    return { title: UI.reviewTitle, sub: UI.reviewTitleEn, subMni: UI.reviewSubMni, kind: "Ningsing" };
  }
  const mode = DAY_MODES[step.mode];
  return { title: `${UI.dayCard} — ${mode.label}`, sub: mode.subEn, subMni: mode.sub, kind: "Numit" };
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
                <s className="mni-twin">{l.title} — {l.blurb}</s>
                <span className="level-meter">
                  {/* part-filled, so four phrases into a six-phrase scene shows */}
                  {l.steps.map((s, k) => {
                    const f = stepFraction(progress, s);
                    return (
                      <i key={k} className={f >= 1 ? "on" : ""}>
                        {f > 0 && f < 1 && <em style={{ width: `${Math.round(f * 100)}%` }} />}
                      </i>
                    );
                  })}
                </span>
              </span>
              <span className="level-chev">{isOpen ? "▲" : "▼"}&nbsp;{done}/{total}</span>
            </button>

            {isOpen && (
              <div className="steps">
                {l.steps.map(s => {
                  const info = stepLabel(s);
                  const done = isDone(progress, s);
                  const part = stepCounts(progress, s);
                  return (
                    <button
                      key={stepId(s)}
                      className={`step${done ? " done" : part ? " part" : ""}`}
                      type="button"
                      onClick={() => onOpen(s)}
                    >
                      <span className="step-tick">{done ? "✓" : part ? "•" : ""}</span>
                      <span className="step-t">
                        <b>{info.title}</b>
                        <s>{part ? `${UI.resumeHint} — ${part.at}/${part.total}` : info.sub}</s>
                        {!part && info.subMni && <s className="mni-twin">{info.subMni}</s>}
                      </span>
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
