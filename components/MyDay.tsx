"use client";

// She tells the story of her own day, one moment at a time, and then hears
// the whole thing read back as a single story. This is the bridge between
// saying single sentences and actually talking.
//
// Corrections appear UNDER her own words, never instead of them.

import { useState } from "react";
import { DAY_MODES, MOMENTS, type DayMode } from "@/content/moments";
import { ask, parseNumbered } from "@/lib/claude";
import { tidyDayPrompt } from "@/lib/prompts";
import { norm } from "@/lib/score";
import type { Heard } from "@/lib/speech";
import { Mic } from "./Mic";
import { SayButton } from "./Say";
import { UI } from "@/content/ui";

type Line = { head: string; said: string };
type Fixes = Record<number, { fix: string; note: string }>;

export function MyDay({
  mode: fixedMode, claudeOk, onDone, onExit, onTold, onAt,
}: {
  mode?: DayMode; claudeOk: boolean;
  onDone: () => void; onExit: () => void; onTold: () => void;
  onAt?: (index: number, total: number) => void;
}) {
  const [mode, setMode] = useState<DayMode | null>(fixedMode ?? null);
  const [i, setI] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [stage, setStage] = useState<"say" | "story">("say");

  if (!mode) return <Pick onExit={onExit} onPick={m => setMode(m)} />;
  if (stage === "story")
    return (
      <Story
        mode={mode} lines={lines} claudeOk={claudeOk} onExit={onExit}
        onDone={() => { onDone(); onExit(); }}
        onSwitch={() => {
          setMode(mode === "today" ? "yesterday" : "today");
          setLines([]); setI(0); setStage("say");
        }}
      />
    );

  const m = MOMENTS[i];
  const advance = () => {
    onAt?.(i + 1, MOMENTS.length);
    if (i + 1 >= MOMENTS.length) { onTold(); setStage("story"); }
    else setI(i + 1);
  };

  return (
    <MomentStep
      key={m.k}
      head={m.head} headEn={m.headEn} q={m.q} qEn={m.qEn} eg={m.eg[mode]}
      modeLabel={DAY_MODES[mode].label}
      where={`${i + 1} / ${MOMENTS.length}`}
      pct={Math.round((i / MOMENTS.length) * 100)}
      onExit={onExit}
      onSkip={advance}
      onSaid={(said) => { setLines([...lines, { head: m.head, said }]); }}
      onNext={advance}
      onRedo={() => setLines(lines.slice(0, -1))}
    />
  );
}

function Bar({ title, where, onExit }: { title: string; where: string; onExit: () => void }) {
  return (
    <div className="crumbs">
      <button className="back" type="button" onClick={onExit}>{UI.home}</button>
      <span className="where">{title} · {where}</span>
    </div>
  );
}

function Pick({ onPick, onExit }: { onPick: (m: DayMode) => void; onExit: () => void }) {
  return (
    <>
      <Bar title={UI.dayTitle} where="Khanbiyu" onExit={onExit} />
      <div className="card"><div className="band b-rp">
        <div className="blabel">Kari haininglibano? <span className="gloss">which one?</span></div>
        <p className="meaning" style={{ margin: "0 0 14px" }}>{UI.dayBlurb}</p>
        <div className="seg">
          {(Object.keys(DAY_MODES) as DayMode[]).map(k => (
            <button key={k} type="button" onClick={() => onPick(k)}>
              <b>{DAY_MODES[k].label}</b>
              <s>{DAY_MODES[k].sub} — {DAY_MODES[k].subEn}</s>
            </button>
          ))}
        </div>
      </div></div>
    </>
  );
}

function MomentStep(p: {
  head: string; headEn: string; q: string; qEn: string; eg: string; modeLabel: string;
  where: string; pct: number;
  onExit: () => void; onSkip: () => void;
  onSaid: (s: string) => void; onNext: () => void; onRedo: () => void;
}) {
  const [said, setSaid] = useState<string | null>(null);

  return (
    <>
      <Bar title={`${UI.dayTitle} · ${p.modeLabel}`} where={p.where} onExit={p.onExit} />
      <div className="progress"><i style={{ width: `${p.pct}%` }} /></div>
      <div className="card">
        <div className="band b-use">
          <div className="blabel">
            {p.head} <span className="gloss">{p.headEn}</span>
            <span className="spacer" /><span className="pill">{p.modeLabel}</span>
          </div>
          {/* She answers freely here, but she still needs English in front of
              her — the example is the model, so the example leads. */}
          <div className="phrase">
            <span className="words">{p.eg}</span>
            <SayButton text={p.eg} />
          </div>
          <div className="meaning">{p.q}</div>
          <div className="meaning" style={{ fontSize: 14, marginTop: 6 }}>
            {UI.dayExampleNote}
            <span className="en-twin" dangerouslySetInnerHTML={{ __html: p.qEn }} />
          </div>

          {!said && (
            <>
              <Mic onResult={(r: Heard) => { setSaid(r.best); p.onSaid(r.best); }} />
              <div className="btnrow">
                <button className="btn ghost" type="button" onClick={p.onSkip}>{UI.skip} — skip</button>
              </div>
            </>
          )}
        </div>

        {said && (
          <div className="band b-fb">
            <div className="fb ok">
              <span className="head">{UI.captured}</span>
              <span className="big">{said}</span>
              <span className="exp">Aroiba matamda pumnamak amata oina taobigani.</span>
            </div>
            <div className="btnrow">
              <button className="btn" type="button" onClick={p.onNext}>{UI.next}</button>
              <button className="btn ghost" type="button" onClick={() => { p.onRedo(); setSaid(null); }}>
                {UI.again}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Story({
  mode, lines, claudeOk, onDone, onSwitch, onExit,
}: {
  mode: DayMode; lines: Line[]; claudeOk: boolean;
  onDone: () => void; onSwitch: () => void; onExit: () => void;
}) {
  const [fixes, setFixes] = useState<Fixes | null>(null);
  const [busy, setBusy] = useState(claudeOk && lines.length > 0);
  const [started, setStarted] = useState(false);

  if (!started) {
    setStarted(true);
    if (claudeOk && lines.length > 0) {
      void ask(tidyDayPrompt({ tense: DAY_MODES[mode].tense, lines: lines.map(l => l.said) }))
        .then(t => setFixes(parseNumbered(t)))
        .catch(() => setFixes(null))
        .finally(() => setBusy(false));
    }
  }

  if (lines.length === 0) {
    return (
      <>
        <Bar title={UI.dayTitle} where={UI.doneBadge} onExit={onExit} />
        <div className="card"><div className="band b-rp done-box">
          <h2>{UI.nothingSaid}</h2>
          <p className="meaning">{UI.nothingSaidWhy}</p>
          <div className="btnrow"><button className="btn" type="button" onClick={onExit}>{UI.next}</button></div>
        </div></div>
      </>
    );
  }

  const textOf = (n: number) => fixes?.[n + 1]?.fix || lines[n].said;
  const whole = lines.map((_, n) => textOf(n)).join(" ");

  return (
    <>
      <Bar title={`${UI.dayTitle} · ${DAY_MODES[mode].label}`} where="Nanggi wari" onExit={onExit} />
      <div className="card"><div className="band b-rp done-box">
        <h2>{UI.storyHead}</h2>
        <p className="meaning">{UI.storyBlurb}</p>
        <div className="btnrow" style={{ marginTop: 13 }}>
          <SayInline text={whole} label={UI.hearStory} />
          <SayInline text={whole} label={UI.hearSlow} slow ghost />
        </div>

        <div className="story" style={{ marginTop: 18 }}>
          {lines.map((l, n) => {
            const f = fixes?.[n + 1];
            const changed = Boolean(f?.fix) && norm(f!.fix) !== norm(l.said);
            return (
              <p key={n}>
                {textOf(n)}
                {changed && (
                  <span className="fixline">
                    {UI.youSaid} <span className="strike">{l.said}</span>
                    {f?.note && <><br /><b>{f.note}</b></>}
                  </span>
                )}
              </p>
            );
          })}
        </div>

        {busy && <div className="thinking"><span className="dot" />Yengsinjari…</div>}

        <div className="btnrow" style={{ marginTop: 16 }}>
          <button className="btn" type="button" onClick={onDone}>{UI.finish}</button>
          <button className="btn ghost" type="button" onClick={onSwitch}>
            {mode === "today" ? "Ngarang-gi oina haiyu" : "Ngasigi oina haiyu"}
          </button>
        </div>
      </div></div>
    </>
  );
}

function SayInline({ text, label, slow, ghost }: { text: string; label: string; slow?: boolean; ghost?: boolean }) {
  return (
    <button
      type="button"
      className={ghost ? "btn ghost" : "btn"}
      onClick={() => import("@/lib/speech").then(m => m.speak(text, { slow }))}
    >
      {label}
    </button>
  );
}
