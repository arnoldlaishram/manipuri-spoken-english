"use client";

// Recording her voice with MediaRecorder.
//
// Why this exists: Chrome's SpeechRecognition uses a DIFFERENT audio path from
// getUserMedia, needs Google's servers, and exists only in Chrome. It can fail
// on a machine whose microphone demonstrably works. When it does, she can still
// record herself and hear it back against the model phrase — no service, no key,
// no transcription. That is real speaking practice; it just isn't scored.

export type RecState = "idle" | "recording" | "done";

export function recorderSupported() {
  return typeof window !== "undefined"
    && typeof window.MediaRecorder !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia);
}

function pickMime(): string | undefined {
  const want = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const m of want) {
    try { if (window.MediaRecorder.isTypeSupported(m)) return m; } catch {}
  }
  return undefined;                      // let the browser choose
}

export type Recording = { url: string; blob: Blob; ms: number };

export type SpokenFeedback = { heard: string; ok: boolean; word: string; note: string };

/** Send the clip to Gemini and ask how she said it. null when not configured. */
export async function checkPronunciation(blob: Blob, target: string): Promise<SpokenFeedback | null> {
  const base = process.env.NEXT_PUBLIC_HAIYU_BASE ?? "";
  const audio = await blobToBase64(blob);
  const res = await fetch(`${base}/api/speech`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ audio, mimeType: blob.type || "audio/webm", target }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.error ? null : (data as SpokenFeedback);
}

export async function pronunciationAvailable(): Promise<boolean> {
  try {
    const base = process.env.NEXT_PUBLIC_HAIYU_BASE ?? "";
    return Boolean((await (await fetch(`${base}/api/speech`)).json())?.ok);
  } catch { return false; }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Start recording. Resolves with a stop() that gives you the clip. */
export async function startRecording(): Promise<{
  stop: () => Promise<Recording>;
  cancel: () => void;
}> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMime();
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  const t0 = Date.now();

  rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
  rec.start();

  const release = () => stream.getTracks().forEach(t => t.stop());

  return {
    stop: () => new Promise<Recording>(resolve => {
      rec.onstop = () => {
        release();
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        resolve({ url: URL.createObjectURL(blob), blob, ms: Date.now() - t0 });
      };
      try { rec.stop(); } catch { release(); }
    }),
    cancel: () => { try { rec.stop(); } catch {} release(); },
  };
}
