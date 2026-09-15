"use client";

// When Chrome's recogniser will not run, she can still record herself and hear
// it next to the model phrase. No service, no key, no transcription — and no
// pretending we scored it. Hearing your own voice against a model is how people
// actually fix their own pronunciation.

import { useEffect, useRef, useState } from "react";
import { startRecording, type Recording } from "@/lib/recorder";
import { speak, stopSpeaking } from "@/lib/speech";
import { UI } from "@/content/ui";

export function Recorder({ model, onDone }: { model: string; onDone: () => void }) {
  const [state, setState] = useState<"idle" | "rec" | "done">("idle");
  const [clip, setClip] = useState<Recording | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const ctl = useRef<Awaited<ReturnType<typeof startRecording>> | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => {
    ctl.current?.cancel();
    if (clip) URL.revokeObjectURL(clip.url);
  }, [clip]);

  async function start() {
    setErr(null);
    try {
      ctl.current = await startRecording();
      setState("rec");
    } catch (e) {
      setErr(`${(e as Error).name}: ${(e as Error).message}`);
    }
  }

  async function stop() {
    const c = ctl.current;
    if (!c) return;
    ctl.current = null;
    setClip(await c.stop());
    setState("done");
  }

  return (
    <div style={{ marginTop: 14 }}>
      <div className="typelabel">
        {UI.recordIt.replace("● ", "")} <span>— record yourself and listen back</span>
      </div>

      {state === "idle" && (
        <div className="btnrow" style={{ marginTop: 0 }}>
          <button className="btn" type="button" onClick={start}>{UI.recordIt}</button>
        </div>
      )}

      {state === "rec" && (
        <div className="btnrow" style={{ marginTop: 0 }}>
          <button className="btn" type="button" onClick={stop}
            style={{ background: "var(--turmeric)" }}>{UI.recordStop}</button>
          <span className="mic-note">Taribani…</span>
        </div>
      )}

      {state === "done" && clip && (
        <>
          <div className="btnrow" style={{ marginTop: 0 }}>
            <button className="btn ghost" type="button" onClick={() => {
              stopSpeaking();
              audio.current?.pause();
              const a = (audio.current = new Audio(clip.url));
              void a.play().catch(() => {});
            }}>{UI.recordYours}</button>
            <button className="btn ghost" type="button" onClick={() => {
              audio.current?.pause();
              speak(model);
            }}>{UI.recordModel}</button>
          </div>
          <p className="meaning" style={{ fontSize: 13.5, marginTop: 10 }}>{UI.recordNote}</p>
          <div className="btnrow">
            <button className="btn" type="button" onClick={onDone}>{UI.next}</button>
            <button className="btn ghost" type="button"
              onClick={() => { setClip(null); setState("idle"); }}>{UI.recordAgain}</button>
          </div>
        </>
      )}

      {err && <p className="meaning" style={{ fontSize: 13, color: "var(--madder)" }}>{err}</p>}
    </div>
  );
}
