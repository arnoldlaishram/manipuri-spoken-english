"use client";

// Sentence building: one pattern, drilled out loud with different fillings.
//
// NOT a grammar lesson — the pattern is shown, never named. For the first two
// items she taps the words into order (silent, no speaking pressure); after
// that the scaffold disappears and she goes straight to the microphone.

import { useEffect, useMemo, useState } from "react";
import type { Unit } from "@/content/units";
import { bareWords, bestOf, norm, plain, wordDiff, GOOD } from "@/lib/score";
import { speak } from "@/lib/speech";
import { ask, parseLabels, type ClaudeError } from "@/lib/claude";
import { practise } from "@/lib/review";
import { checkSentencePrompt } from "@/lib/prompts";
import { Mic } from "./Mic";
import { SayButton, SayPair } from "./Say";
import { MarkedUp, head, tone } from "./Feedback";
import { SpeakTarget } from "./SpeakTarget";
import { Examples } from "./Examples";
import { Quiz } from "./Quiz";
import { UI } from "@/content/ui";
import type { Heard } from "@/lib/speech";

const SCAFFOLD_ITEMS = 2;

function shuffled<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// intro -> examples -> drill -> your own sentence -> assessment -> done
// The examples stage was added after the learner got confused: she was being
// asked to produce before she had seen the mapping enough times.
type Phase =
  | { kind: "intro" }
  | { kind: "examples" }
  | { kind: "item"; i: number }
  | { kind: "free" }
  | { kind: "quiz" }
  | { kind: "done" };

export function Drill({
  unit, claudeOk, onMiss, onDone, onExit, startAt = 0, onAt,
}: {
  unit: Unit; claudeOk: boolean;
  onMiss: (phrase: string) => void; onDone: () => void; onExit: () => void;
  /** Where she stopped last time. */
  startAt?: number;
  /** Called as she advances, so a half-finished lesson is never lost. */
  onAt?: (index: number, total: number) => void;
}) {
  // Straight back into the drill if she was part-way through it.
  const [phase, setPhase] = useState<Phase>(
    startAt > 0 && startAt < unit.items.length ? { kind: "item", i: startAt } : { kind: "intro" });

  if (phase.kind === "intro")
    return <Intro unit={unit} onExit={onExit} onGo={() => setPhase({ kind: "examples" })} />;

  if (phase.kind === "examples")
    return (
      <>
        <Bar title={unit.title} where={UI.examplesTitleEn} onExit={onExit} />
        <Examples unit={unit} onNext={() => setPhase({ kind: "item", i: 0 })} />
      </>
    );

  if (phase.kind === "quiz")
    return (
      <>
        <Bar title={unit.title} where={UI.quizTitleEn} onExit={onExit} />
        <Quiz
          unit={unit}
          onPass={() => { onDone(); setPhase({ kind: "done" }); }}
          onReview={() => setPhase({ kind: "examples" })}
        />
      </>
    );

  if (phase.kind === "item")
    return (
      <Item
        key={phase.i}
        unit={unit}
        i={phase.i}
        onExit={onExit}
        onMiss={onMiss}
        onNext={() => {
          onAt?.(phase.i + 1, unit.items.length);
          setPhase(phase.i + 1 >= unit.items.length ? { kind: "free" } : { kind: "item", i: phase.i + 1 });
        }}
      />
    );

  if (phase.kind === "free")
    return (
      <Free unit={unit} claudeOk={claudeOk} onExit={onExit}
        onNext={() => setPhase({ kind: "quiz" })} />
    );

  return <Done unit={unit} onExit={onExit} />;
}

function Bar({ title, where, onExit }: { title: string; where: string; onExit: () => void }) {
  return (
    <div className="crumbs">
      <button className="back" type="button" onClick={onExit}>{UI.home}</button>
      <span className="where">{title} · {where}</span>
    </div>
  );
}

function Intro({ unit, onGo, onExit }: { unit: Unit; onGo: () => void; onExit: () => void }) {
  return (
    <>
      <Bar title={unit.title} where={UI.newPattern} onExit={onExit} />
      <div className="card">
        <div className="band b-use">
          <div className="blabel">{UI.newPattern} <span className="gloss">{UI.newPatternEn}</span></div>
          <div className="phrase" style={{ fontSize: 25 }}><span className="words">{unit.title}</span></div>
          <div className="meaning" style={{ marginBottom: 13 }}>
            {unit.gistEn}
            <span className="mni-twin">{unit.gist}</span>
          </div>
          {/* `why` is authored content in content/units.ts, not user input. */}
          <div className="whybox">
            <div className="whyhead">
              <span className="whylabel">{UI.whyLabel}</span>
              <SayButton text={plain(unit.whyEn)} />
            </div>
            {/* English first, Manipuri under it — the same way round on every
                screen in the app, so she always knows where to look. */}
            <span dangerouslySetInnerHTML={{ __html: unit.whyEn }} />
            <span className="mni-twin" dangerouslySetInnerHTML={{ __html: unit.why }} />
          </div>
          <div className="pat" dangerouslySetInnerHTML={{ __html: unit.pat }} />
          <div className="eg">
            <span className="t">{unit.items[0].en}</span>
            <SayButton text={unit.items[0].en} />
          </div>
          <div className="btnrow"><button className="btn" type="button" onClick={onGo}>{UI.begin}</button></div>
        </div>
      </div>
    </>
  );
}

function Item({
  unit, i, onNext, onMiss, onExit,
}: { unit: Unit; i: number; onNext: () => void; onMiss: (p: string) => void; onExit: () => void }) {
  const item = unit.items[i];
  const words = useMemo(() => bareWords(item.en), [item.en]);
  const tray = useMemo(() => shuffled(words.map((w, k) => ({ w, k }))), [words]);

  const needScaffold = i < SCAFFOLD_ITEMS;
  const [stage, setStage] = useState<"build" | "say">(needScaffold ? "build" : "say");
  const [built, setBuilt] = useState<{ w: string; k: number }[]>([]);
  const [order, setOrder] = useState<"building" | "wrong" | "right">("building");
  const [result, setResult] = useState<{ diff: ReturnType<typeof wordDiff>; typed?: boolean } | null>(null);

  // When she gets the order right: mark it green, read it back, and only then
  // hand over to the microphone. Hearing the sentence she just built is the point.
  useEffect(() => {
    if (order !== "right") return;
    speak(item.en);
    const t = setTimeout(() => setStage("say"), 900);
    return () => clearTimeout(t);
  }, [order, item.en]);

  function tapChip(c: { w: string; k: number }) {
    const next = [...built, c];
    setBuilt(next);
    if (next.length < words.length) { setOrder("building"); return; }
    setOrder(next.every((x, n) => x.w === words[n]) ? "right" : "wrong");
  }

  function onHeard(res: Heard) {
    if (res.recorded) { onNext(); return; }   // nothing to score; she already compared
    const best = bestOf(item.en, [res.best, ...(res.alts ?? [])]);
    const diff = wordDiff(item.en, best);
    if (diff.score < GOOD) onMiss(item.en);
    practise(`unit:${unit.key}:${i}`, item.en, item.mni, diff.score >= GOOD);
    setResult({ diff, typed: res.typed });
  }

  return (
    <>
      <Bar title={unit.title} where={`${i + 1} / ${unit.items.length}`} onExit={onExit} />
      <div className="progress"><i style={{ width: `${Math.round((i / unit.items.length) * 100)}%` }} /></div>
      <div className="card">
        <div className="band b-use">
          <div className="blabel">
            {UI.sayInEnglish} <span className="gloss">{UI.sayInEnglishEn}</span>
            <span className="spacer" /><span className="pill">{unit.gist}</span>
          </div>
          {/* While she is ordering the words there is no mic, so the Manipuri
              leads — otherwise the answer would be sitting on screen. The
              moment the mic appears, English leads. */}
          {stage === "build"
            ? <div className="phrase"><span className="words">{item.mni}</span></div>
            : <SpeakTarget en={item.en} mni={item.mni} />}

          {stage === "build" && (
            <>
              <div className="meaning" style={{ marginTop: 11 }}>{UI.tapIntoOrder}</div>
              <div id="slot" className={`slot${order === "right" ? " good" : ""}`}>
                {built.length === 0
                  ? <span className="ph">{UI.putWordsHere}</span>
                  : built.map((c, n) => (
                      <button key={n} className="chip" type="button"
                        onClick={() => { setBuilt(built.filter((_, m) => m !== n)); setOrder("building"); }}>
                        {c.w}
                      </button>
                    ))}
              </div>
              <div id="chips" className="chips">
                {tray.map(c => (
                  <button key={c.k} type="button"
                    className={`chip${built.some(b => b.k === c.k) ? " used" : ""}`}
                    onClick={() => tapChip(c)}>{c.w}</button>
                ))}
              </div>
              {order === "wrong" && (
                <div className="fb no" style={{ marginTop: 14 }}>
                  <span className="head">{UI.wrongOrder}</span>
                  <span className="exp">{UI.wrongOrderWhy}</span>
                </div>
              )}
            </>
          )}

          {stage === "say" && !result && (
            <>
              <Mic onResult={onHeard} model={item.en} />
            </>
          )}
        </div>

        {result && (
          <div className="band b-fb">
            <div className={`fb ${tone(result.diff.score)}`}>
              <span className="head">{head(result.diff.score)}</span>
              <span className="big">
                {result.typed ? item.en : <MarkedUp target={item.en} diff={result.diff} />}
                <SayPair text={item.en} />
              </span>
              {result.diff.score < GOOD && result.diff.words.some((_, n) => !result.diff.hit[n]) && (
                <span className="exp">
                  {UI.missedWords}{" "}
                  <b>{result.diff.words.filter((_, n) => !result.diff.hit[n]).join(", ")}</b>.
                </span>
              )}
              {item.note && (
                <span className="exp">
                  <span dangerouslySetInnerHTML={{ __html: item.noteEn ?? item.note }} />
                  {item.noteEn && <> <SayButton text={plain(item.noteEn)} /></>}
                  <span className="mni-twin" dangerouslySetInnerHTML={{ __html: item.note }} />
                </span>
              )}
            </div>
            <div className="btnrow"><button className="btn" type="button" onClick={onNext}>{UI.next}</button></div>
          </div>
        )}
      </div>
    </>
  );
}

function Free({
  unit, claudeOk, onNext, onExit,
}: { unit: Unit; claudeOk: boolean; onNext: () => void; onExit: () => void }) {
  const [state, setState] = useState<
    { s: "idle" } | { s: "busy" } | { s: "out"; said: string; ok: boolean; fix: string; why: string } | { s: "err"; msg: string }
  >({ s: "idle" });

  async function onHeard(res: Heard) {
    if (!claudeOk) {
      setState({ s: "out", said: res.best, ok: true, fix: res.best, why: UI.noClaude });
      return;
    }
    setState({ s: "busy" });
    try {
      const text = await ask(checkSentencePrompt({
        pattern: unit.free.pat, question: unit.free.q, said: res.best,
      }));
      const p = parseLabels(text, ["OK", "FIX", "WHY"] as const);
      setState({
        s: "out", said: res.best,
        ok: (p.OK ?? "YES").toUpperCase() !== "NO",
        fix: p.FIX || res.best,
        why: p.WHY ?? "",
      });
    } catch (e) {
      const code = (e as ClaudeError).code;
      setState({ s: "err", msg: code === "rate_limited" ? UI.rateLimited : code === "refused" ? UI.refused : UI.somethingWrong });
    }
  }

  return (
    <>
      <Bar title={unit.title} where={UI.makeYourOwn} onExit={onExit} />
      <div className="card">
        <div className="band b-rp">
          <div className="blabel">{UI.makeYourOwn} <span className="gloss">{UI.makeYourOwnEn}</span></div>
          <div className="phrase" style={{ fontSize: 24 }}>
            <span className="words" dangerouslySetInnerHTML={{ __html: unit.free.qEn }} />
          </div>
          <div className="mni-twin">{unit.free.q}</div>
          <div className="pat">{unit.free.pat}</div>
          {state.s === "idle" && <Mic onResult={onHeard} />}
        </div>

        {state.s === "busy" && (
          <div className="band b-fb"><div className="thinking"><span className="dot" />{UI.thinking}</div></div>
        )}
        {state.s === "err" && (
          <div className="band b-fb">
            <div className="fb no"><span className="head">{state.msg}</span></div>
            <div className="btnrow"><button className="btn" type="button" onClick={onNext}>{UI.next}</button></div>
          </div>
        )}
        {state.s === "out" && (
          <div className="band b-fb">
            <div className={`fb ${state.ok ? "ok" : "mid"}`}>
              <span className="head">{state.ok ? UI.goodHead : UI.betterHead}</span>
              <span className="big">{state.fix}<SayButton text={state.fix} /></span>
              {norm(state.fix) !== norm(state.said) && (
                <span className="exp">{UI.youSaid} “{state.said}”</span>
              )}
              {state.why && <span className="exp">{state.why}</span>}
            </div>
            <div className="btnrow">
              <button className="btn" type="button" onClick={onNext}>{UI.finish}</button>
              <button className="btn ghost" type="button" onClick={() => setState({ s: "idle" })}>{UI.again}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Done({ unit, onExit }: { unit: Unit; onExit: () => void }) {
  return (
    <>
      <Bar title={unit.title} where={UI.doneBadge} onExit={onExit} />
      <div className="card"><div className="band b-rp done-box">
        <h2>{unit.title} loire!</h2>
        <p className="meaning">{UI.unitDoneBlurb}</p>
        <div className="pat" dangerouslySetInnerHTML={{ __html: unit.pat }} />
        <ul className="can">{unit.items.slice(0, 4).map(it => <li key={it.en}>{it.en}</li>)}</ul>
        <div className="btnrow"><button className="btn" type="button" onClick={onExit}>{UI.next}</button></div>
      </div></div>
    </>
  );
}
