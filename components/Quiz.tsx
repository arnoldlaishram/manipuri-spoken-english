"use client";

// The end-of-lesson assessment.
//
// Every question is generated from the unit's own sentences, so there is no
// second set of content to keep in step and no extra Manipuri to get wrong.
// It ramps: recognise first, then order the words, then produce it yourself.
//
// A low score is not a failure screen — it sends her back to the examples,
// which is the thing that was missing when she got confused.

import { useMemo, useState } from "react";
import type { Unit } from "@/content/units";
import { bareWords, bestOf, norm, wordDiff, GOOD } from "@/lib/score";
import { practise } from "@/lib/review";
import type { Heard } from "@/lib/speech";
import { Mic } from "./Mic";
import { SayButton } from "./Say";
import { SpeakTarget } from "./SpeakTarget";
import { UI } from "@/content/ui";

type Q =
  | { kind: "choose"; mni: string; en: string; options: string[] }
  | { kind: "order"; mni: string; en: string }
  | { kind: "say"; mni: string; en: string };

function shuffled<T>(a: T[]): T[] {
  const x = a.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

function build(unit: Unit): Q[] {
  const items = shuffled(unit.items);
  const all = unit.items.map(i => i.en);
  const qs: Q[] = [];
  items.slice(0, 3).forEach(it => {
    const wrong = shuffled(all.filter(e => e !== it.en)).slice(0, 2);
    qs.push({ kind: "choose", mni: it.mni, en: it.en, options: shuffled([it.en, ...wrong]) });
  });
  items.slice(3, 5).forEach(it => qs.push({ kind: "order", mni: it.mni, en: it.en }));
  if (items[5] ?? items[0]) {
    const it = items[5] ?? items[0];
    qs.push({ kind: "say", mni: it.mni, en: it.en });
  }
  return qs;
}

export function Quiz({
  unit, onPass, onReview,
}: { unit: Unit; onPass: () => void; onReview: () => void }) {
  const [qs] = useState(() => build(unit));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    const passed = score >= Math.ceil(qs.length * 0.6);
    return (
      <div className="card"><div className="band b-rp done-box">
        <h2>{passed ? UI.quizPassHead : UI.quizAgainHead}</h2>
        <div className="scorebig"><b>{score}</b><span>/ {qs.length}</span></div>
        <p className="meaning">
          {passed ? UI.quizPass : UI.quizAgain}
          <span className="en-twin">{passed ? UI.quizPassEn : UI.quizAgainEn}</span>
        </p>
        <div className="btnrow">
          {passed
            ? <button className="btn" type="button" onClick={onPass}>{UI.next}</button>
            : <button className="btn" type="button" onClick={onReview}>{UI.quizBackToExamples}</button>}
          {!passed && <button className="btn ghost" type="button" onClick={onPass}>{UI.next}</button>}
        </div>
        <p className="meaning" style={{ fontSize: 13, opacity: .8, marginTop: 10 }}>{pct}%</p>
      </div></div>
    );
  }

  const q = qs[i];
  const advance = (right: boolean) => {
    if (right) setScore(s => s + 1);
    practise(`unit:${unit.key}:quiz:${q.en}`, q.en, q.mni, right);
    if (i + 1 >= qs.length) setDone(true); else setI(i + 1);
  };

  return (
    <>
      <div className="progress"><i style={{ width: `${Math.round((i / qs.length) * 100)}%` }} /></div>
      <div className="card"><div className="band b-use">
        <div className="blabel">
          {UI.quizTitle} <span className="gloss">{UI.quizTitleEn}</span>
          <span className="spacer" /><span className="pill">{i + 1} / {qs.length}</span>
        </div>
        {/* choose/order are read-and-pick, so the Manipuri may lead there; the
            spoken question puts English first because the mic needs English. */}
        {q.kind === "say"
          ? <SpeakTarget en={q.en} mni={q.mni} />
          : <div className="askline">{q.mni}</div>}

        {q.kind === "choose" && <Choose key={i} q={q} onAnswer={advance} />}
        {q.kind === "order" && <Order key={i} q={q} onAnswer={advance} />}
        {q.kind === "say" && <Say key={i} q={q} onAnswer={advance} />}
      </div></div>
    </>
  );
}

function Choose({ q, onAnswer }: { q: Extract<Q, { kind: "choose" }>; onAnswer: (r: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <>
      <p className="meaning">{UI.quizChoose}</p>
      <div className="seg">
        {q.options.map(o => (
          <button key={o} type="button" disabled={picked !== null}
            className={picked === null ? "" : o === q.en ? "right" : o === picked ? "wrong" : ""}
            onClick={() => setPicked(o)}>
            <b>{o}</b>
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="btnrow">
          <SayButton text={q.en} />
          <button className="btn" type="button" onClick={() => onAnswer(picked === q.en)}>{UI.next}</button>
        </div>
      )}
    </>
  );
}

function Order({ q, onAnswer }: { q: Extract<Q, { kind: "order" }>; onAnswer: (r: boolean) => void }) {
  const words = useMemo(() => bareWords(q.en), [q.en]);
  const tray = useMemo(() => shuffled(words.map((w, k) => ({ w, k }))), [words]);
  const [built, setBuilt] = useState<{ w: string; k: number }[]>([]);
  const [verdict, setVerdict] = useState<boolean | null>(null);

  return (
    <>
      <p className="meaning">{UI.quizOrder}</p>
      <div id="slot" className={`slot${verdict === true ? " good" : ""}`}>
        {built.length === 0 ? <span className="ph">{UI.putWordsHere}</span>
          : built.map((c, n) => (
            <button key={n} className="chip" type="button" disabled={verdict !== null}
              onClick={() => setBuilt(built.filter((_, m) => m !== n))}>{c.w}</button>
          ))}
      </div>
      <div id="chips" className="chips">
        {tray.map(c => (
          <button key={c.k} type="button" disabled={verdict !== null}
            className={`chip${built.some(b => b.k === c.k) ? " used" : ""}`}
            onClick={() => {
              const next = [...built, c];
              setBuilt(next);
              if (next.length === words.length) setVerdict(next.every((x, n) => x.w === words[n]));
            }}>{c.w}</button>
        ))}
      </div>
      {verdict !== null && (
        <>
          <div className={`fb ${verdict ? "ok" : "no"}`} style={{ marginTop: 12 }}>
            <span className="head">{verdict ? UI.correctHead : UI.betterHead}</span>
            <span className="big">{q.en}<SayButton text={q.en} /></span>
          </div>
          <div className="btnrow">
            <button className="btn" type="button" onClick={() => onAnswer(verdict)}>{UI.next}</button>
          </div>
        </>
      )}
    </>
  );
}

function Say({ q, onAnswer }: { q: Extract<Q, { kind: "say" }>; onAnswer: (r: boolean) => void }) {
  const [res, setRes] = useState<{ ok: boolean; said: string } | null>(null);
  return (
    <>
      <p className="meaning">{UI.quizSay}</p>
      {!res && <Mic model={q.en} onResult={(r: Heard) => {
        if (r.recorded) { setRes({ ok: true, said: "" }); return; }
        const best = bestOf(q.en, [r.best, ...(r.alts ?? [])]);
        setRes({ ok: wordDiff(q.en, best).score >= GOOD || norm(best) === norm(q.en), said: r.best });
      }} />}
      {res && (
        <>
          <div className={`fb ${res.ok ? "ok" : "mid"}`} style={{ marginTop: 12 }}>
            <span className="head">{res.ok ? UI.correctHead : UI.betterHead}</span>
            <span className="big">{q.en}<SayButton text={q.en} /></span>
            {res.said && !res.ok && <span className="exp">{UI.youSaid} “{res.said}”</span>}
          </div>
          <div className="btnrow">
            <button className="btn" type="button" onClick={() => onAnswer(res.ok)}>{UI.next}</button>
          </div>
        </>
      )}
    </>
  );
}
