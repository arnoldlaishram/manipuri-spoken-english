"use client";

// The microphone, and everything that can go wrong with it.
//
// Three rules, all learned from real browser output:
//   1. Never claim to be listening until the microphone has actually opened.
//      `onaudiostart` is the only thing that proves it did.
//   2. getUserMedia succeeding does NOT mean SpeechRecognition will work — they
//      use different capture paths. So "recognition failed" must never be
//      reported as "no microphone found" when the mic demonstrably just worked.
//   3. She must always be able to finish: type it, or record herself and listen
//      back against the model.

import { useCallback, useEffect, useRef, useState } from "react";
import { useMic, type Heard, type MicGrant, type MicStatus } from "@/lib/speech";
import { recorderSupported } from "@/lib/recorder";
import { Recorder } from "./Recorder";
import { MIC_ERR, UI } from "@/content/ui";

/** Why the microphone isn't usable. "recog" = the mic works, the recogniser doesn't. */
export type MicFault = MicGrant | "nostart" | "recog";

export function micHelp(code: MicFault) {
  switch (code) {
    case "policy":   return { h: UI.micPolicyHead, mni: UI.micPolicyMni, en: UI.micPolicyEn, pop: true };
    case "denied":   return { h: UI.micDeniedHead, mni: UI.micDeniedMni, en: UI.micDeniedEn, pop: true };
    case "nodevice": return { h: UI.micNoneHead, mni: UI.micNoneMni, en: UI.micNoneEn, pop: false };
    case "nostart":  return { h: UI.micNoStartHead, mni: UI.micNoStartMni, en: UI.micNoStartEn, pop: true };
    case "recog":    return { h: UI.micRecogHead, mni: UI.micRecogMni, en: UI.micRecogEn, pop: false };
    default:         return { h: UI.micUnsupportedHead, mni: UI.micUnsupportedMni, en: UI.micUnsupportedEn, pop: false };
  }
}

export function MicWall({
  code, className = "micwall", detail,
}: { code: MicFault; className?: string; detail?: string }) {
  const h = micHelp(code);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className={className}>
      {className === "banner" ? <b>{h.h}</b> : <div className="h">{h.h}</div>}
      <div>{h.mni}</div>
      <div className="en">{h.en}</div>
      {detail && <div className="en" style={{ opacity: .6, fontSize: 12 }}>({detail})</div>}
      {h.pop && url && (
        <>
          <div className="btnrow" style={{ marginTop: 12 }}>
            <button type="button" className="btn" onClick={() => {
              let opened = false;
              try { opened = Boolean(window.open(url, "_blank", "noopener")); } catch {}
              if (!opened) setFailed(true);
            }}>
              {failed ? "Link asi copy tourabada hangdoklu" : UI.openInTab}
            </button>
          </div>
          <div className="linkrow">
            <input readOnly value={url} aria-label="Link to this page"
              onFocus={e => e.currentTarget.select()} />
            <button type="button" className="btn ghost" onClick={async () => {
              try { await navigator.clipboard.writeText(url); } catch {}
              setCopied(true); setTimeout(() => setCopied(false), 1800);
            }}>
              {copied ? UI.copied : UI.copy}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function Mic({
  label = UI.sayIt,
  onResult,
  model,
}: {
  label?: string;
  onResult: (heard: Heard) => void;
  /** The phrase she is aiming for. Given here, she can record and compare. */
  model?: string;
}) {
  const { grant, request, listen, inFrame } = useMic();
  const [live, setLive] = useState(false);
  const [status, setStatus] = useState<MicStatus | null>(null);
  const [asking, setAsking] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [wall, setWall] = useState<MicFault | null>(null);
  const [detail, setDetail] = useState<string | undefined>();
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState("");
  const [micProven, setMicProven] = useState(false);   // getUserMedia has succeeded
  const stopRef = useRef<(() => void) | null>(null);
  const wallRef = useRef<HTMLDivElement | null>(null);

  const blocked = grant !== "unknown" && grant !== "ok";
  useEffect(() => { if (blocked) { setWall(grant); setTyping(true); } }, [blocked, grant]);
  useEffect(() => () => { stopRef.current?.(); }, []);
  useEffect(() => { if (wall) wallRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [wall]);

  const canRecord = Boolean(model) && micProven && recorderSupported();

  const fail = useCallback((code: MicFault, raw?: string, msg?: string) => {
    setWall(code);
    setDetail(raw);
    setNote(msg ?? micHelp(code).h);   // the note must never contradict the wall
    setTyping(true);
    setLive(false);
    setStatus(null);
    setHeard(null);
  }, []);

  const tap = useCallback(async () => {
    if (live) { stopRef.current?.(); return; }

    // Ask for the microphone properly, from this tap. SpeechRecognition on its
    // own does not reliably make the browser prompt — getUserMedia does.
    if (grant !== "ok") {
      setAsking(true);
      const g = await request();
      setAsking(false);
      if (g !== "ok") return fail(g);
    }
    setMicProven(true);                 // getUserMedia worked: the mic exists
    setWall(null); setDetail(undefined); setNote(null);

    setLive(true);
    setStatus("starting");
    setHeard(null);

    stopRef.current = listen(
      t => setHeard(t),
      (res, err) => {
        setLive(false);
        setStatus(null);
        stopRef.current = null;
        if (res) { setHeard(res.best); onResult(res); return; }

        if (err === "not-allowed" || err === "service-not-allowed") return fail("denied", err);
        // The mic just worked, so this is the recogniser failing — not a missing device.
        if (err === "audio-capture") return fail("recog", err);
        if (err === "nostart") return fail(inFrame ? "policy" : "recog", err);
        if (err === "network") {
          setNote(MIC_ERR.network);
          setTyping(true);
          setWall(canRecord ? "recog" : null);
          setDetail(err);
          return;
        }
        setHeard(null);
        setNote(MIC_ERR[err ?? ""] ?? `${UI.somethingWrong} (${err ?? "?"})`);
        setTyping(true);
      },
      s => setStatus(s),
    );
  }, [canRecord, fail, grant, inFrame, listen, live, onResult, request]);

  const sendTyped = () => {
    const v = typed.trim();
    if (v) { onResult({ best: v, alts: [v], typed: true }); setTyped(""); }
  };

  // Only say "listening" once the microphone has genuinely opened.
  const buttonText = asking ? UI.waiting
    : !live ? label
    : status === "starting" ? UI.micOpening
    : UI.listening;
  const noteText = note ?? (
    blocked ? `${UI.typeInstead} — type it instead.`
    : live && status === "hearing" ? UI.micHearing
    : live && status === "open" ? UI.micOpen
    : live ? UI.micOpening
    : UI.tapThenSpeak
  );

  return (
    <>
      <div className="mic">
        <button type="button" className={`mic-btn${live && status !== "starting" ? " live" : ""}`}
          onClick={tap} disabled={asking}>
          <span className="ring" />
          <span>{buttonText}</span>
        </button>
        <span className="mic-note">{noteText}</span>
      </div>

      {inFrame && !wall && (
        <div className="meaning" style={{ fontSize: 13, opacity: .75, marginTop: 8 }}>
          This page is inside another page. If the microphone does nothing, open it in its own tab.
        </div>
      )}

      {heard && <div className="heard">{UI.iHeard} <b>{heard}</b></div>}
      <div ref={wallRef}>{wall && <MicWall code={wall} detail={detail} />}</div>

      {wall && canRecord && model && (
        <Recorder model={model} onDone={() => onResult({ best: "", alts: [], recorded: true })} />
      )}

      {typing ? (
        <div style={{ marginTop: 14 }}>
          <div className="typelabel">{UI.typeInstead} <span>{UI.typeInsteadEn}</span></div>
          <input className="tin" id="typeIn" value={typed}
            onChange={e => setTyped(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); sendTyped(); } }}
            placeholder="Type what you would say…" aria-label="Type your answer" />
          <div className="btnrow"><button type="button" className="btn ghost" onClick={sendTyped}>{UI.send}</button></div>
        </div>
      ) : (
        <div className="btnrow">
          <button type="button" className="btn ghost" onClick={() => setTyping(true)}>{UI.typeInstead}</button>
        </div>
      )}
    </>
  );
}
