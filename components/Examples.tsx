"use client";

// Worked examples, before anything is asked of her.
//
// This stage exists because she got confused: the drill went straight from a
// short explanation to "now put these words in order". Novices need to SEE the
// mapping several times before producing it. Here there is nothing to get
// wrong — Manipuri on the left, English under it, a button to hear each one.

import type { Unit } from "@/content/units";
import { SayButton } from "./Say";
import { UI } from "@/content/ui";

export function Examples({ unit, onNext }: { unit: Unit; onNext: () => void }) {
  const pairs = unit.examples ?? unit.items.map(i => ({ mni: i.mni, en: i.en }));

  return (
    <div className="card">
      <div className="band b-use">
        <div className="blabel">
          {UI.examplesTitle} <span className="gloss">{UI.examplesTitleEn}</span>
        </div>
        <p className="meaning" style={{ marginTop: 0 }}>
          {UI.examplesLeadEn}
          <span className="mni-twin">{UI.examplesLead}</span>
        </p>

        {unit.table ? (
          unit.table.map(block => (
            <div key={block.action} className="tensewrap">
              <div className="tensehead">{block.action} <span>{block.actionEn}</span></div>
              <div className="tenserows">
                {block.rows.map(r => (
                  <div key={r.when} className="tenserow">
                    <div className="tw">{r.when}<span>{r.whenEn}</span></div>
                    <div className="tp">
                      <div className="te">{r.en} <SayButton text={r.en} /></div>
                      <div className="tm">{r.mni}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <ol className="pairs">
            {pairs.map(p => (
              <li key={p.mni + p.en}>
                <div className="pe">{p.en} <SayButton text={p.en} /></div>
                <div className="pm">{p.mni}</div>
              </li>
            ))}
          </ol>
        )}

        <div className="btnrow">
          <button className="btn" type="button" onClick={onNext}>{UI.examplesDone}</button>
        </div>
      </div>
    </div>
  );
}
