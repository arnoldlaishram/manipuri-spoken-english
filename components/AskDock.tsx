"use client";

// "Wahang leibra?" — she can ask anything, in romanized Manipuri, from any
// screen, and the answer knows what is in front of her.
//
// It is a floating head in a fixed corner rather than a bar along the bottom,
// because she cannot read English well: the affordance has to be carried by
// shape and position. A thin strip of text reads as part of the page.

import { useEffect, useRef, useState } from "react";
import { ask, parseLabels, type ClaudeError } from "@/lib/claude";
import { askPrompt } from "@/lib/prompts";
import { SayButton } from "./Say";
import { Avatar } from "./Avatar";
import { UI } from "@/content/ui";

const SEEN_KEY = "haiyu.askSeen";

export function AskDock({ context, enabled }: { context: string; enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(true);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ q: string; en: string; why: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ctl = useRef<AbortController | null>(null);
  const box = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    try { setSeen(Boolean(window.localStorage.getItem(SEEN_KEY))); } catch { setSeen(true); }
  }, []);
  useEffect(() => { if (open) box.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  function openIt() {
    setOpen(true);
    setSeen(true);
    try { window.localStorage.setItem(SEEN_KEY, "1"); } catch {}
  }

  async function send() {
    const question = q.trim();
    if (!question || busy) return;
    setBusy(true); setErr(null); setOut(null);
    ctl.current = new AbortController();
    try {
      const text = await ask(askPrompt({ context, question }), ctl.current.signal);
      const p = parseLabels(text, ["EN", "WHY"] as const);
      if (!p.EN && !p.WHY) setErr(UI.somethingWrong);
      else { setOut({ q: question, en: p.EN ?? "", why: p.WHY ?? "" }); setQ(""); }
    } catch (e) {
      const code = (e as ClaudeError).code;
      if (code !== "cancelled") {
        setErr(code === "rate_limited" ? UI.rateLimited : code === "refused" ? UI.refused : UI.noClaude);
      }
    } finally { setBusy(false); ctl.current = null; }
  }

  return (
    <>
      {!open && (
        <>
          {!seen && <div className="askhead-label">{UI.askOpen}</div>}
          <button className="askhead" type="button" onClick={openIt}
            aria-label={UI.askOpen} title={UI.askOpen}>
            {!seen && <span className="ping" />}
            <Avatar size={62} />
            {/* a small bubble so the face reads as "talk to me", not "profile" */}
            <span className="askhead-badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21 11.5a8 8 0 0 1-8 8H8.5L4 22.5V18A8 8 0 1 1 21 11.5Z"
                  fill="currentColor" />
              </svg>
            </span>
          </button>
        </>
      )}

      {open && (
        <div className="asksheet" role="dialog" aria-modal="true"
          onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div className="asksheet-in">
            <h3>
              <span className="askface"><Avatar size={34} /></span>
              {UI.askOpen}
              <span>{UI.askOpenEn}</span>
              <button className="askclose" type="button" onClick={() => setOpen(false)}
                aria-label={UI.close}>×</button>
            </h3>

            {!enabled ? (
              <div className="ask-panel">
                <div className="micwall" style={{ marginTop: 4 }}>
                  <div className="h">{UI.askOffHead}</div>
                  <div>{UI.askOffMni}</div>
                  <div className="en">{UI.askOffEn}</div>
                </div>
                <div className="btnrow">
                  <button className="btn" type="button" onClick={() => setOpen(false)}>{UI.close}</button>
                </div>
              </div>
            ) : (
            <div className="ask-panel">
              <textarea ref={box} rows={3} value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void send(); } }}
                placeholder={UI.askPlaceholder}
                aria-label="Your question in romanized Manipuri" />
              <div className="ask-eg">
                {UI.askEg} <b>{UI.askEg1}</b> · <b>{UI.askEg2}</b>
              </div>
              <div className="btnrow">
                <button className="btn" type="button" onClick={send} disabled={busy || !q.trim()}>{UI.ask}</button>
                {busy && <button className="btn ghost" type="button" onClick={() => ctl.current?.abort()}>{UI.stop}</button>}
              </div>

              <div className="ask-out">
                {busy && <div className="thinking"><span className="dot" />{UI.thinking}</div>}
                {err && <div className="ask-a"><div className="why">{err}</div></div>}
                {out && (
                  <>
                    <p className="ask-q">{out.q}</p>
                    <div className="ask-a">
                      {out.en && <div className="en"><span>{out.en}</span><SayButton text={out.en} /></div>}
                      {out.why && <div className="why">{out.why}</div>}
                    </div>
                  </>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
