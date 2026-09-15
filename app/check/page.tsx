"use client";

// A page that answers one question: what does THIS machine actually do when
// the app asks for the microphone? Open /check, press the button, send me the
// text. Every value here is measured, not guessed.

import { useState } from "react";

type Line = { k: string; v: string };

export default function Check() {
  const [lines, setLines] = useState<Line[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    const out: Line[] = [];
    const add = (k: string, v: unknown) => out.push({ k, v: String(v) });

    add("userAgent", navigator.userAgent);
    add("origin", location.origin);
    add("secureContext", window.isSecureContext);
    add("insideAnotherPage", window.self !== window.top);

    add("SpeechRecognition", Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
    add("MediaRecorder", typeof window.MediaRecorder !== "undefined");
    add("mediaDevices", Boolean(navigator.mediaDevices?.getUserMedia));

    try {
      const pp = document as unknown as {
        permissionsPolicy?: { allowsFeature(f: string): boolean };
        featurePolicy?: { allowsFeature(f: string): boolean };
      };
      const p = pp.permissionsPolicy ?? pp.featurePolicy;
      add("micAllowedInThisFrame", p?.allowsFeature ? p.allowsFeature("microphone") : "browser won't say");
    } catch { add("micAllowedInThisFrame", "threw"); }

    try {
      const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
      add("permission", st.state);
    } catch (e) { add("permission", "query failed: " + (e as Error).name); }

    let gumOk = false;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      gumOk = true;
      add("getUserMedia", "OK");
      add("microphoneInUse", s.getAudioTracks().map(t => t.label || "(unnamed)").join(", ") || "none");
      s.getTracks().forEach(t => t.stop());
    } catch (e) {
      add("getUserMedia", `FAILED - ${(e as Error).name}: ${(e as Error).message}`);
    }

    try {
      const devs = await navigator.mediaDevices.enumerateDevices();
      const ins = devs.filter(d => d.kind === "audioinput");
      add("audioInputsFound", ins.length);
      ins.forEach((d, i) => add(`  input ${i + 1}`, d.label || "(label hidden until permission granted)"));
    } catch (e) { add("audioInputs", "failed: " + (e as Error).name); }

    // The real test: start recognition and record every event with its timing.
    const events: string[] = await new Promise(resolve => {
      const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
      if (!Ctor) return resolve(["not supported in this browser"]);
      const r = new Ctor();
      const seen: string[] = [];
      const t0 = Date.now();
      const mark = (s: string) => seen.push(`${String(Date.now() - t0).padStart(5)}ms  ${s}`);
      r.lang = "en-IN"; r.interimResults = true; r.continuous = false;
      r.onstart = () => mark("start");
      r.onaudiostart = () => mark("audiostart - the microphone opened");
      r.onspeechstart = () => mark("speechstart - it heard you");
      r.onresult = e => mark(`result: "${e.results[0][0].transcript}"`);
      r.onerror = e => mark(`ERROR: ${e.error}`);
      r.onend = () => { mark("end"); resolve(seen); };
      try { r.start(); mark("start() called - SAY SOMETHING NOW"); }
      catch (e) { mark("start() threw: " + (e as Error).name); resolve(seen); }
      setTimeout(() => resolve(seen.concat(["(still open after 15s)"])), 15000);
    });

    add("-- speech recognition --", "");
    events.forEach((e, i) => add(`  ${i + 1}`, e));

    if (gumOk) {
      const opened = events.some(e => e.includes("audiostart"));
      const err = events.find(e => e.includes("ERROR"));
      add("-- verdict --", "");
      add("verdict", opened
        ? (err ? `mic opened, then: ${err}` : "microphone opened correctly")
        : `the mic works (getUserMedia OK) but recognition never opened it${err ? ` - ${err}` : ""}`);
    }

    setLines(out);
    setBusy(false);
  }

  const text = lines ? lines.map(l => `${l.k}: ${l.v}`).join("\n") : "";

  return (
    <div className="wrap nodock">
      <h1 style={{ fontFamily: "var(--serif)", fontSize: 26, marginBottom: 6 }}>Microphone check</h1>
      <p className="lead">
        Press the button, allow the microphone if asked, and <b>say &ldquo;I want tea&rdquo; out loud</b>.
        Then copy everything below and send it to me.
      </p>

      <div className="btnrow">
        <button className="btn" type="button" onClick={run} disabled={busy}>
          {busy ? "Testing - speak now…" : "Run the check"}
        </button>
        {lines && (
          <button className="btn ghost" type="button"
            onClick={() => navigator.clipboard?.writeText(text).catch(() => {})}>
            Copy the result
          </button>
        )}
      </div>

      {lines && (
        <pre style={{
          marginTop: 18, background: "var(--surface)", border: "1px solid var(--line)",
          borderRadius: 4, padding: 14, fontSize: 12.5, lineHeight: 1.6,
          whiteSpace: "pre-wrap", wordBreak: "break-word", color: "var(--ink)",
        }}>{text}</pre>
      )}
    </div>
  );
}
