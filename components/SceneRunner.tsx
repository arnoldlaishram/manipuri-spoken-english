"use client";

// A real situation, in three passes:
//   phrases  — hear it, then say it
//   use      — a situation in Manipuri, she produces the English herself
//   roleplay — a multi-turn conversation, Claude plays the other person
//
// The role-play judges whether a real person would have understood her and
// carried on. It never breaks character to correct grammar.

import { useEffect, useState } from "react";
import type { Scene } from "@/content/scenes";
import { accepts, bestOf, plain, wordDiff, GOOD, PARTIAL } from "@/lib/score";
import { speak } from "@/lib/speech";
import type { Heard } from "@/lib/speech";
import { ask, parseLabels, type ClaudeError } from "@/lib/claude";
import { practise } from "@/lib/review";
import { rolePlayPrompt } from "@/lib/prompts";
import { Mic } from "./Mic";
import { SayButton, SayPair } from "./Say";
import { MarkedUp, head, tone } from "./Feedback";
import { UI } from "@/content/ui";

type Turn = { who: "them" | "you"; line: string; repair?: string };
type Phase = { k: "phrase"; i: number } | { k: "use"; i: number } | { k: "rp" } | { k: "done" };

export function SceneRunner({
  scene, claudeOk, onMiss, onDone, onExit, weak,
}: {
  scene: Scene; claudeOk: boolean; weak: string[];
  onMiss: (p: string) => void; onDone: () => void; onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ k: "phrase", i: 0 });

  const bar = (where: string) => (
    <div className="crumbs">
      <button className="back" type="button" onClick={onExit}>{UI.home}</button>
      <span className="where">{scene.title} · {where}</span>
    </div>
  );

  if (phase.k === "phrase") {
    const total = scene.phrases.length;
    return (
      <PhraseStep
        key={phase.i} scene={scene} i={phase.i} bar={bar(`Wahei ${phase.i + 1} / ${total}`)}
        onMiss={onMiss}
        onNext={() => setPhase(phase.i + 1 >= total ? { k: "use", i: 0 } : { k: "phrase", i: phase.i + 1 })}
      />
    );
  }
  if (phase.k === "use") {
    const total = scene.use.length;
    return (
      <UseStep
        key={phase.i} scene={scene} i={phase.i} bar={bar(`Sijinnou ${phase.i + 1} / ${total}`)}
        onMiss={onMiss}
        onNext={() => setPhase(phase.i + 1 >= total ? { k: "rp" } : { k: "use", i: phase.i + 1 })}
      />
    );
  }
  if (phase.k === "rp")
    return <RolePlay scene={scene} claudeOk={claudeOk} bar={bar(UI.rolePlay)} onNext={() => setPhase({ k: "done" })} />;

  return <SceneDone scene={scene} weak={weak} bar={bar(UI.doneBadge)} onExit={() => { onDone(); onExit(); }} />;
}

function PhraseStep({
  scene, i, bar, onNext, onMiss,
}: { scene: Scene; i: number; bar: React.ReactNode; onNext: () => void; onMiss: (p: string) => void }) {
  const p = scene.phrases[i];
  const [res, setRes] = useState<{ diff: ReturnType<typeof wordDiff>; typed?: boolean } | null>(null);

  useEffect(() => { if (i === 0) { const t = setTimeout(() => speak(p.en), 350); return () => clearTimeout(t); } }, [i, p.en]);

  return (
    <>
      {bar}
      <div className="progress"><i style={{ width: `${Math.round((i / scene.phrases.length) * 100)}%` }} /></div>
      <div className="card">
        <div className="band b-say">
          <div className="blabel">
            {UI.listenThenSay} <span className="gloss">{UI.listenThenSayEn}</span>
            <span className="spacer" /><SayPair text={p.en} />
          </div>
          <div className="phrase"><span className="words">{p.en}</span></div>
          <div className="meaning">{p.mni}</div>
          {p.note && (
            <div className="meaning" style={{ fontSize: 14.5, opacity: .9 }}>
              <span dangerouslySetInnerHTML={{ __html: p.note }} />
              {p.noteEn && (
                <span className="en-twin">
                  <span dangerouslySetInnerHTML={{ __html: p.noteEn }} />
                  {" "}<SayButton text={plain(p.noteEn)} />
                </span>
              )}
            </div>
          )}
          {!res && (
            <Mic model={p.en} onResult={(r: Heard) => {
              if (r.recorded) { onNext(); return; }   // nothing to score; she already compared
              const best = bestOf(p.en, [r.best, ...(r.alts ?? [])]);
              const diff = wordDiff(p.en, best);
              if (diff.score < GOOD) onMiss(p.en);
              practise(`scene:${scene.key}:${i}`, p.en, p.mni, diff.score >= GOOD);
              setRes({ diff, typed: r.typed });
            }} />
          )}
        </div>
        {res && (
          <div className="band b-fb">
            <div className={`fb ${tone(res.diff.score)}`}>
              <span className="head">{head(res.diff.score)}</span>
              <span className="big">
                {res.typed ? p.en : <MarkedUp target={p.en} diff={res.diff} />}
                <SayPair text={p.en} />
              </span>
              {res.diff.score < GOOD && (
                <span className="exp">
                  {UI.missedWords} <b>{res.diff.words.filter((_, n) => !res.diff.hit[n]).join(", ")}</b>.
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

function UseStep({
  scene, i, bar, onNext, onMiss,
}: { scene: Scene; i: number; bar: React.ReactNode; onNext: () => void; onMiss: (p: string) => void }) {
  const u = scene.use[i];
  const [res, setRes] = useState<{ ok: boolean; said: string } | null>(null);

  return (
    <>
      {bar}
      <div className="progress"><i style={{ width: `${Math.round((i / scene.use.length) * 100)}%` }} /></div>
      <div className="card">
        <div className="band b-use">
          <div className="blabel">{UI.whatDoYouSay} <span className="gloss">{UI.whatDoYouSayEn}</span></div>
          <div className="situ">
            {u.situ}
            <span className="en-twin">{u.situEn}</span>
          </div>
          {!res && (
            <Mic onResult={(r: Heard) => {
              const cands = [r.best, ...(r.alts ?? [])];
              const ok = cands.some(c => accepts(u.target, u.accept, c))
                || wordDiff(u.target, bestOf(u.target, cands)).score >= GOOD;
              if (!ok) onMiss(u.target);
              setRes({ ok, said: r.best });
            }} />
          )}
        </div>
        {res && (
          <div className="band b-fb">
            <div className={`fb ${res.ok ? "ok" : "mid"}`}>
              <span className="head">{res.ok ? UI.correctHead : UI.betterHead}</span>
              <span className="big">{u.target}<SayButton text={u.target} /></span>
              {!res.ok && <span className="exp">{UI.youSaid} “{res.said}”</span>}
            </div>
            <div className="btnrow"><button className="btn" type="button" onClick={onNext}>{UI.next}</button></div>
          </div>
        )}
      </div>
    </>
  );
}

function RolePlay({
  scene, claudeOk, bar, onNext,
}: { scene: Scene; claudeOk: boolean; bar: React.ReactNode; onNext: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([{ who: "them", line: scene.rp.opener }]);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(!claudeOk);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { const t = setTimeout(() => speak(scene.rp.opener), 400); return () => clearTimeout(t); }, [scene.rp.opener]);

  async function reply(r: Heard) {
    const mine: Turn = { who: "you", line: r.best };
    const history = [...turns, mine];
    setTurns(history);
    if (!claudeOk) { setFinished(true); return; }
    setBusy(true); setErr(null);
    try {
      const text = await ask(rolePlayPrompt({
        role: scene.rp.role, scene: scene.rp.scene, goalEn: scene.rp.goalEn,
        history: turns.map(t => (t.who === "them" ? "YOU (in role): " : "HER: ") + t.line).join("\n") || "(nothing yet)",
        said: r.best,
      }));
      const p = parseLabels(text, ["WORKED", "SAY", "DONE", "NOTE"] as const);
      const next = [...history];
      if (p.NOTE) next[next.length - 1] = { ...mine, repair: p.NOTE };
      if (p.SAY) { next.push({ who: "them", line: p.SAY }); speak(p.SAY); }
      setTurns(next);
      if ((p.DONE ?? "").toUpperCase() === "YES" || next.filter(t => t.who === "you").length >= 5) setFinished(true);
    } catch (e) {
      const code = (e as ClaudeError).code;
      setErr(code === "rate_limited" ? UI.rateLimited : code === "refused" ? UI.refused : UI.noClaude);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {bar}
      <div className="card"><div className="band b-rp">
        <div className="blabel">
          {UI.rolePlay} <span className="gloss">{UI.rolePlayEn}</span>
          <span className="spacer" /><span className="pill">{scene.rp.roleShort}</span>
        </div>
        <div className="rp-goal"><b>{UI.yourTask}</b>{scene.rp.goal}</div>

        <div className="turns">
          {turns.map((t, n) => (
            <div key={n} className={`turn ${t.who}`}>
              <span className="who">{t.who === "them" ? scene.rp.roleShort : UI.you}</span>
              <span className="line">
                {t.line}{t.who === "them" && <> <SayButton text={t.line} /></>}
                {t.repair && <span className="repair">{t.repair}</span>}
              </span>
            </div>
          ))}
        </div>

        {busy && <div className="thinking"><span className="dot" />{UI.thinking}</div>}
        {err && <div className="fb no"><span className="head">{err}</span></div>}

        {!busy && !finished && <Mic label={UI.reply} onResult={reply} />}
        {!busy && finished && (
          <div className="btnrow">
            <button className="btn" type="button" onClick={onNext}>{UI.finish}</button>
            <button className="btn ghost" type="button"
              onClick={() => { setTurns([{ who: "them", line: scene.rp.opener }]); setFinished(!claudeOk); setErr(null); }}>
              {UI.again}
            </button>
          </div>
        )}
      </div></div>
    </>
  );
}

function SceneDone({
  scene, weak, bar, onExit,
}: { scene: Scene; weak: string[]; bar: React.ReactNode; onExit: () => void }) {
  return (
    <>
      {bar}
      <div className="card"><div className="band b-rp done-box">
        <h2>{scene.title} loire!</h2>
        <p className="meaning">{UI.sceneDoneBlurb}</p>
        <ul className="can">{scene.phrases.map(p => <li key={p.en}>{p.en}</li>)}</ul>
        {weak.length > 0 && (
          <p className="weak">{UI.practiseAgain}<br />{weak.map(w => <span key={w}>{w}<br /></span>)}</p>
        )}
        <div className="btnrow"><button className="btn" type="button" onClick={onExit}>{UI.next}</button></div>
      </div></div>
    </>
  );
}
