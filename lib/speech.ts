"use client";

// Hearing English, and being heard.
//
// Two separate browser APIs, both awkward:
//   speechSynthesis      — reads English aloud. Quality varies wildly by machine.
//   SpeechRecognition    — Chrome only in practice; transcribes what she says.

import { useCallback, useEffect, useRef, useState } from "react";
import { slug } from "./score";

/* ------------------------------------------------------------------ voices */

const GOOD = ["google", "natural", "premium", "enhanced", "samantha", "ava", "allison",
  "serena", "daniel", "karen", "moira", "tessa", "fiona", "aaron", "zoe", "siri",
  "microsoft", "rishi", "veena", "isha"];
const BAD = ["compact", "eloquence", "albert", "bad news", "good news", "bells", "bubbles",
  "cellos", "jester", "organ", "superstar", "trinoids", "whisper", "wobble", "zarvox",
  "boing", "bahh", "deranged"];

const VOICE_KEY = "haiyu.voice";

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = (v.name || "").toLowerCase();
  const lang = (v.lang || "").replace("_", "-").toLowerCase();
  if (!lang.startsWith("en")) return -1;
  if (BAD.some(b => name.includes(b))) return -1;       // novelty voices: never
  let s = 0;
  if (GOOD.some(g => name.includes(g))) s += 3;
  if (v.localService === false) s += 3;                 // network voices sound far better
  if (lang.startsWith("en-in")) s += 2;                 // her accent is the target
  else if (lang.startsWith("en-gb") || lang.startsWith("en-us")) s += 1;
  if (v.default) s += 1;
  return s;
}

export function rankVoices(all: SpeechSynthesisVoice[]) {
  return all.map(v => ({ v, s: scoreVoice(v) }))
            .filter(x => x.s >= 0)
            .sort((a, b) => b.s - a.s)
            .map(x => x.v);
}

/* -------------------------------------------------- recorded audio (public/audio) */

let recorded: Record<string, string> = {};

/** Empty normally; set only when served behind a path-prefixing proxy. */
const BASE = process.env.NEXT_PUBLIC_HAIYU_BASE ?? "";

export async function loadRecordedAudio() {
  try {
    const res = await fetch(`${BASE}/api/audio`);
    recorded = ((await res.json()) as { audio?: Record<string, string> }).audio ?? {};
  } catch { recorded = {}; }
  return recorded;
}
export const recordedCount = () => Object.keys(recorded).length;

/* ------------------------------------------------------------------ speaking */

let current: HTMLAudioElement | null = null;
let chosenURI: string | null = null;

export function setVoice(uri: string) {
  chosenURI = uri;
  try { window.localStorage.setItem(VOICE_KEY, uri); } catch {}
}
export function getVoiceURI(): string | null {
  if (chosenURI) return chosenURI;
  try { chosenURI = window.localStorage.getItem(VOICE_KEY); } catch {}
  return chosenURI;
}

function pickVoice(): SpeechSynthesisVoice | null {
  const list = rankVoices(window.speechSynthesis?.getVoices() ?? []);
  const want = getVoiceURI();
  if (want) {
    const hit = list.find(v => v.voiceURI === want);
    if (hit) return hit;
  }
  return list[0] ?? null;
}

export function stopSpeaking() {
  try { window.speechSynthesis?.cancel(); } catch {}
  if (current) { try { current.pause(); } catch {} current = null; }
}

/**
 * Say `text`. A real recording in public/audio wins over the synthesiser —
 * rate 0.95 is normal, 0.78 is the "slowly" button.
 */
export function speak(text: string, opts: { slow?: boolean; onDone?: () => void } = {}) {
  if (!text) return;
  stopSpeaking();
  const done = opts.onDone ?? (() => {});

  const file = recorded[slug(text)];
  if (file) {
    try {
      const a = (current = new Audio(`${BASE}/audio/${file}`));
      a.playbackRate = opts.slow ? 0.8 : 1;   // far better than slowing a synthesiser
      a.onended = a.onerror = () => { current = null; done(); };
      void a.play().catch(() => { current = null; synth(text, opts.slow, done); });
      return;
    } catch { /* fall through */ }
  }
  synth(text, opts.slow, done);
}

function synth(text: string, slow: boolean | undefined, done: () => void) {
  const s = typeof window !== "undefined" ? window.speechSynthesis : null;
  if (!s) return done();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; }
  // Heavy slowing wrecks concatenative voices — 0.78 is as low as it goes.
  u.rate = slow ? 0.78 : 0.95;
  u.pitch = 1;
  u.onend = u.onerror = () => done();
  s.speak(u);
}

/* --------------------------------------------------------------- the microphone */

export type MicGrant = "unknown" | "ok" | "policy" | "denied" | "nodevice" | "unsupported";

type SR = typeof window.SpeechRecognition;

function getSR(): SR | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function policyBlocked(): boolean {
  try {
    const pp = (document as unknown as {
      permissionsPolicy?: { allowsFeature(f: string): boolean };
      featurePolicy?: { allowsFeature(f: string): boolean };
    });
    const p = pp.permissionsPolicy ?? pp.featurePolicy;
    if (p?.allowsFeature) return !p.allowsFeature("microphone");
  } catch {}
  return false;
}

const framed = () => { try { return window.self !== window.top; } catch { return true; } };

export type Heard = {
  best: string;
  alts: string[];
  typed?: boolean;
  /** She recorded herself instead — there is no transcript, so do not score it. */
  recorded?: boolean;
};

/** What the recogniser is actually doing, so the UI can stop guessing. */
export type MicStatus = "starting" | "open" | "hearing";

export function useMic() {
  const [grant, setGrant] = useState<MicGrant>("unknown");
  const rec = useRef<SpeechRecognition | null>(null);

  /* Passive check — never prompts, so it is safe on mount. */
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!getSR() || !navigator.mediaDevices?.getUserMedia) return alive && setGrant("unsupported");
      if (policyBlocked()) return alive && setGrant("policy");
      try {
        const st = await navigator.permissions.query({ name: "microphone" as PermissionName });
        if (!alive) return;
        if (st.state === "granted") setGrant("ok");
        else if (st.state === "denied") setGrant(framed() ? "policy" : "denied");
        st.onchange = () => { if (st.state === "granted") setGrant("ok"); };
      } catch {
        /* Firefox has no microphone permission name — leave it unknown and ask on tap */
      }
    })();
    return () => { alive = false; };
  }, []);

  /**
   * Ask for the microphone. MUST be called from a click.
   *
   * SpeechRecognition alone does not reliably make the browser prompt —
   * getUserMedia is what does. Skipping this is why the mic silently failed.
   */
  const request = useCallback(async (): Promise<MicGrant> => {
    if (grant === "ok") return "ok";
    if (!navigator.mediaDevices?.getUserMedia) { setGrant("unsupported"); return "unsupported"; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());   // we wanted the grant, not the stream
      setGrant("ok");
      return "ok";
    } catch (e) {
      const n = (e as Error)?.name ?? "";
      const g: MicGrant =
        n === "NotFoundError" || n === "DevicesNotFoundError" ? "nodevice"
        : n === "NotAllowedError" || n === "SecurityError" ? (policyBlocked() || framed() ? "policy" : "denied")
        : "denied";
      setGrant(g);
      return g;
    }
  }, [grant]);

  /** Listen once. Returns a stop() you can call to end it early. */
  /** Listen once. Returns a stop() you can call to end it early. */
  const listen = useCallback((
    onPartial: (t: string) => void,
    onDone: (heard: Heard | null, err?: string) => void,
    onStatus?: (s: MicStatus) => void,
  ) => {
    const Ctor = getSR();
    if (!Ctor) { onDone(null, "unsupported"); return () => {}; }

    // Detach the previous recogniser's handlers BEFORE aborting it. abort()
    // fires its onend asynchronously, and that lands on the callbacks of the
    // run we are replacing — which reset the UI a moment after this one starts.
    const prev = rec.current;
    if (prev) {
      prev.onresult = null; prev.onerror = null; prev.onend = null;
      prev.onstart = null; prev.onaudiostart = null; prev.onspeechstart = null;
      try { prev.abort(); } catch {}
    }

    const r = (rec.current = new Ctor());
    r.lang = "en-IN";            // her accent is the target, not American English
    r.interimResults = true;
    r.maxAlternatives = 3;       // score all three; reduces false failures
    r.continuous = false;

    let best = "", alts: string[] = [], settled = false;
    let audioOpened = false;     // did the microphone actually open?

    const finish = (heard: Heard | null, err?: string) => {
      if (settled) return;
      settled = true;
      if (rec.current === r) rec.current = null;
      onDone(heard, err);
    };

    r.onstart = () => onStatus?.("starting");
    r.onaudiostart = () => { audioOpened = true; onStatus?.("open"); };
    r.onspeechstart = () => onStatus?.("hearing");

    r.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) { best = res[0].transcript; alts = Array.from(res, a => a.transcript); }
        else interim += res[0].transcript;
      }
      onPartial(best || interim);
    };
    r.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setGrant(policyBlocked() || framed() ? "policy" : "denied");
      }
      finish(null, e.error || "error");
    };
    r.onend = () => {
      if (best) return finish({ best, alts });
      // "the microphone never opened" and "I heard nothing" are different
      // problems and need different advice. Do not conflate them.
      finish(null, audioOpened ? "nospeech" : "nostart");
    };

    try { r.start(); } catch { finish(null, "error"); }
    return () => { try { r.stop(); } catch {} };
  }, []);

  /**
   * Listen for a whole talk, not one sentence. Chrome ends a continuous session
   * on its own every so often, so restart until the caller says stop.
   */
  const listenLong = useCallback((
    onText: (full: string) => void,
    onStatus?: (s: MicStatus) => void,
  ) => {
    const Ctor = getSR();
    if (!Ctor) { onStatus?.("starting"); return () => ""; }

    let finals: string[] = [];
    let stopped = false;
    let r: SpeechRecognition | null = null;

    const start = () => {
      const rec2 = (r = new Ctor());
      rec2.lang = "en-IN";
      rec2.interimResults = true;
      rec2.continuous = true;
      rec2.onaudiostart = () => onStatus?.("open");
      rec2.onspeechstart = () => onStatus?.("hearing");
      rec2.onresult = (e: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finals.push(res[0].transcript);
          else interim += res[0].transcript;
        }
        onText((finals.join(" ") + " " + interim).trim());
      };
      rec2.onerror = () => {};
      rec2.onend = () => { if (!stopped) { try { start(); } catch {} } };
      try { rec2.start(); } catch {}
    };
    start();

    return () => {
      stopped = true;
      try { r?.stop(); } catch {}
      return finals.join(" ").trim();
    };
  }, []);

  /** True when this page is inside a frame — where the mic is usually blocked. */
  const inFrame = typeof window !== "undefined" && framed();

  return { grant, request, listen, listenLong, inFrame };
}
