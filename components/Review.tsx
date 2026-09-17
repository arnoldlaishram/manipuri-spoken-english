"use client";

// Reviewing what she already met, days later, by producing it again — not by
// recognising it. Retrieval is the part that makes spacing work.

import { useMemo, useState } from "react";
import { due, practise, type Card } from "@/lib/review";
import { bestOf, wordDiff, GOOD } from "@/lib/score";
import type { Heard } from "@/lib/speech";
import { Mic } from "./Mic";
import { SayPair } from "./Say";
import { SpeakTarget } from "./SpeakTarget";
import { MarkedUp, head, tone } from "./Feedback";
import { UI } from "@/content/ui";

export function Review({ onExit }: { onExit: () => void }) {
  const cards = useMemo(() => due(), []);
  const [i, setI] = useState(0);
  const [res, setRes] = useState<{ diff: ReturnType<typeof wordDiff>; typed?: boolean } | null>(null);

  if (cards.length === 0) return <Nothing onExit={onExit} />;
  if (i >= cards.length) return <Done n={cards.length} onExit={onExit} />;

  const card: Card = cards[i];

  return (
    <>
      <div className="crumbs">
        <button className="back" type="button" onClick={onExit}>{UI.home}</button>
        <span className="where">{UI.reviewTitle} · {i + 1} / {cards.length}</span>
      </div>
      <div className="progress"><i style={{ width: `${Math.round((i / cards.length) * 100)}%` }} /></div>

      <div className="card">
        <div className="band b-use">
          <div className="blabel">
            {UI.reviewTitle} <span className="gloss">{UI.reviewTitleEn}</span>
            <span className="spacer" />
            <span className="pill">{UI.reviewBox} {card.box + 1}</span>
          </div>
          <SpeakTarget en={card.en} mni={card.mni} />
          {!res && <Mic model={card.en} onResult={(r: Heard) => {
            if (r.recorded) { advance(true); return; }
            const best = bestOf(card.en, [r.best, ...(r.alts ?? [])]);
            const diff = wordDiff(card.en, best);
            practise(card.id, card.en, card.mni, diff.score >= GOOD);
            setRes({ diff, typed: r.typed });
          }} />}
        </div>

        {res && (
          <div className="band b-fb">
            <div className={`fb ${tone(res.diff.score)}`}>
              <span className="head">{head(res.diff.score)}</span>
              <span className="big">
                {res.typed ? card.en : <MarkedUp target={card.en} diff={res.diff} />}
                <SayPair text={card.en} />
              </span>
              <span className="exp">
                {res.diff.score >= GOOD ? UI.reviewKept : UI.reviewAgainSoon}
              </span>
            </div>
            <div className="btnrow">
              <button className="btn" type="button" onClick={() => advance()}>{UI.next}</button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  function advance(record?: boolean) {
    if (record) practise(card.id, card.en, card.mni, true);
    setRes(null);
    setI(i + 1);
  }
}

function Nothing({ onExit }: { onExit: () => void }) {
  return (
    <>
      <div className="crumbs">
        <button className="back" type="button" onClick={onExit}>{UI.home}</button>
        <span className="where">{UI.reviewTitle}</span>
      </div>
      <div className="card"><div className="band b-rp done-box">
        <h2>{UI.reviewNoneHead}</h2>
        <p className="meaning">{UI.reviewNone}</p>
        <div className="btnrow"><button className="btn" type="button" onClick={onExit}>{UI.next}</button></div>
      </div></div>
    </>
  );
}

function Done({ n, onExit }: { n: number; onExit: () => void }) {
  return (
    <>
      <div className="crumbs">
        <button className="back" type="button" onClick={onExit}>{UI.home}</button>
        <span className="where">{UI.reviewTitle} · {UI.doneBadge}</span>
      </div>
      <div className="card"><div className="band b-rp done-box">
        <h2>{UI.reviewDoneHead}</h2>
        <p className="meaning">{UI.reviewDone.replace("{n}", String(n))}</p>
        <div className="btnrow"><button className="btn" type="button" onClick={onExit}>{UI.next}</button></div>
      </div></div>
    </>
  );
}
