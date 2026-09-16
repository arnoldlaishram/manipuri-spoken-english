"use client";

// 4/3/2 — the same talk three times, with less time each round.
//
// This is the one strand the app was missing entirely. Nation's four conditions
// for fluency work are all met here on purpose: the language is already
// familiar (her own life, nothing new), attention is on the message, there is
// real time pressure, and it repeats. In the published studies the speech rate
// climbs sharply between the first telling and the third.
//
// The number she sees is words per minute — a real measurement of her own
// speech, not a score we invented. That distinction matters.

import { useCallback, useEffect, useRef, useState } from "react";
import { ROUNDS, TALKS, type Talk } from "@/content/talks";
import { useMic, type MicStatus } from "@/lib/speech";
import { MicWall } from "./Mic";
import { MicIcon } from "./icons";
import { UI } from "@/content/ui";

const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function Fluency({ onDone, onExit }: { onDone: () => void; onExit: () => void }) {
  const [talk, setTalk] = useState<Talk | null>(null);
  const [round, setRound] = useState(0);
  const [rates, setRates] = useState<(number | null)[]>([]);

  if (!talk) return <Pick onExit={onExit} onPick={setTalk} />;
  if (round >= ROUNDS.length)
    return <Done talk={talk} rates={rates} onDone={onDone} onExit={onExit}
      onAgain={() => { setRound(0); setRates([]); }} />;

  return (
    <Round
      key={round}
      talk={talk}
      n={round}
      onFinish={rate => { setRates([...rates, rate]); setRound(round + 1); }}
      onExit={onExit}
    />
  );
}

function Bar({ where, onExit }: { where: string; onExit: () => void }) {
  return (
    <div className="crumbs">
      <button className="back" type="button" onClick={onExit}>{UI.home}</button>
      <span className="where">{UI.fluencyTitle} · {where}</span>
    </div>
  );
}

function Pick({ onPick, onExit }: { onPick: (t: Talk) => void; onExit: () => void }) {
  return (
    <>
      <Bar where={UI.fluencyPickEn} onExit={onExit} />
      <div className="card"><div className="band b-rp">
        <div className="blabel">{UI.fluencyTitle} <span className="gloss">{UI.fluencyTitleEn}</span></div>
        <div className="whybox">
          {UI.fluencyWhy}
          <span className="en-twin">{UI.fluencyWhyEn}</span>
        </div>
        <p className="meaning" style={{ marginTop: 14, marginBottom: 8, fontWeight: 600 }}>
          {UI.fluencyPick}
        </p>
        <div className="seg">
          {TALKS.map(t => (
            <button key={t.key} type="button" onClick={() => onPick(t)}>
              <b>{t.title}</b><s>{t.titleEn}</s>
            </button>
          ))}
        </div>
      </div></div>
    </>
  );
}

function Round({
  talk, n, onFinish, onExit,
}: { talk: Talk; n: number; onFinish: (rate: number | null) => void; onExit: () => void }) {
  const seconds = ROUNDS[n];
  const { grant, request, listenLong, inFrame } = useMic();
  const [phase, setPhase] = useState<"ready" | "live" | "over">("ready");
  const [left, setLeft] = useState(seconds);
  const [heard, setHeard] = useState("");
  const [status, setStatus] = useState<MicStatus | null>(null);
  const [wall, setWall] = useState<string | null>(null);
  const stopRef = useRef<(() => string) | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    const text = stopRef.current?.() ?? heard;
    stopRef.current = null;
    const words = countWords(text);
    setPhase("over");
    setHeard(text);
    onFinish(words > 0 ? Math.round((words / seconds) * 60) : null);
  }, [heard, onFinish, seconds]);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    stopRef.current?.();
  }, []);

  async function go() {
    if (grant !== "ok") {
      const g = await request();
      if (g !== "ok") { setWall(g); return; }
    }
    setPhase("live");
    setLeft(seconds);
    stopRef.current = listenLong(setHeard, setStatus);
    timer.current = setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) { finish(); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  const pct = Math.round(((seconds - left) / seconds) * 100);

  return (
    <>
      <Bar where={`${UI.fluencyRound} ${n + 1} / ${ROUNDS.length}`} onExit={onExit} />
      <div className="progress"><i style={{ width: `${pct}%`, background: "var(--madder)" }} /></div>

      <div className="card">
        <div className="band b-say">
          <div className="blabel">
            {talk.title} <span className="gloss">{talk.titleEn}</span>
            <span className="spacer" />
            <span className="pill">{seconds} {UI.fluencySeconds}</span>
          </div>

          {phase === "ready" && (
            <>
              <div className="clock">{seconds}</div>
              <ul className="prompts">
                {talk.prompts.map(p => (
                  <li key={p.mni}><b>{p.mni}</b><span>{p.en}</span></li>
                ))}
              </ul>
              <div className="meaning" style={{ marginTop: 12 }}>
                {UI.fluencyRule1}<span className="en-twin">{UI.fluencyRule1En}</span>
              </div>
              <div className="meaning" style={{ marginTop: 8 }}>
                {UI.fluencyRule2}<span className="en-twin">{UI.fluencyRule2En}</span>
              </div>
              {inFrame && !wall && (
                <div className="meaning" style={{ fontSize: 13, opacity: .75, marginTop: 8 }}>
                  This page is inside another page. If the microphone does nothing, open it in its own tab.
                </div>
              )}
              {wall && <MicWall code={wall as never} />}
              <div className="btnrow">
                <button className="btn mic-btn" type="button" onClick={go}><MicIcon /><span>{UI.fluencyGo}</span></button>
              </div>
            </>
          )}

          {phase === "live" && (
            <>
              <div className={`clock${left <= 5 ? " low" : ""}`}>{left}</div>
              <ul className="prompts">
                {talk.prompts.map(p => <li key={p.mni}><b>{p.mni}</b></li>)}
              </ul>
              <div className="heard" style={{ minHeight: 48 }}>
                {heard ? <b>{heard}</b> : <span>{status === "hearing" ? UI.micHearing : UI.micOpen}</span>}
              </div>
              <div className="btnrow">
                <button className="btn ghost" type="button" onClick={finish}>{UI.fluencyStop}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Done({
  talk, rates, onDone, onAgain, onExit,
}: {
  talk: Talk; rates: (number | null)[];
  onDone: () => void; onAgain: () => void; onExit: () => void;
}) {
  const known = rates.filter((r): r is number => typeof r === "number");
  const first = known[0];
  const last = known[known.length - 1];
  const gain = first && last && first > 0 ? Math.round(((last - first) / first) * 100) : null;

  return (
    <>
      <Bar where={UI.doneBadge} onExit={onExit} />
      <div className="card"><div className="band b-rp done-box">
        <h2>{UI.fluencyDoneHead}</h2>
        <p className="meaning">{talk.title} — {talk.titleEn}</p>

        {known.length > 0 ? (
          <>
            <div className="rates">
              {rates.map((r, i) => (
                <div key={i} className={`rate${i === rates.length - 1 ? " last" : ""}`}>
                  <b>{r ?? "—"}</b>
                  <s>{ROUNDS[i]}s</s>
                </div>
              ))}
            </div>
            <p className="meaning" style={{ fontSize: 13.5 }}>{UI.fluencyRate} · {UI.fluencyRateEn}</p>
            <p className="meaning" style={{ marginTop: 12 }}>
              {gain !== null && gain > 0
                ? UI.fluencyFaster.replace("{p}", String(gain))
                : UI.fluencySame}
            </p>
          </>
        ) : (
          <p className="meaning">{UI.fluencyNoCount}</p>
        )}

        <div className="btnrow">
          <button className="btn" type="button" onClick={onDone}>{UI.next}</button>
          <button className="btn ghost" type="button" onClick={onAgain}>{UI.again}</button>
        </div>
      </div></div>
    </>
  );
}
