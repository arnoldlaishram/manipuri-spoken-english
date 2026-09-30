// Pronunciation feedback from Gemini.
//
// Claude cannot take audio at all, so this is the one job that needs another
// provider. Gemini accepts audio/webm inline — exactly what MediaRecorder
// already gives us — so her recording goes over untouched.
//
// GET  -> is it usable, and which models does this key actually have
// POST -> { audio, mimeType, target } -> { verdict, note }

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-flash-latest";
const key = () => process.env.GEMINI_API_KEY;

/** Ask it to judge the sounds, not the grammar, and explain in her language. */
function prompt(target: string) {
  return `A woman whose first language is Manipuri (Meiteilon) is learning to speak English.
She was asked to say this sentence:

"${target}"

Listen to the recording and judge ONLY how she said it — the sounds, not grammar or vocabulary.

Be generous and concrete. She is a nervous beginner; the goal is that she keeps speaking.
If a real English speaker would have understood her, that is a pass, accent and all.

OUTPUT — these exact labels, nothing else, no markdown:
HEARD: <what she actually said, as best you can make out>
OK: YES or NO
WORD: <the single word most worth fixing, or NONE>
NOTE: <one short sentence in simple romanized Manipuri, Latin script only, telling her what to change. If it was fine, praise her in one short Manipuri sentence.>`;
}

function parse(text: string) {
  const field = (name: string) =>
    text.match(new RegExp(`^\\s*${name}\\s*:\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
  return {
    heard: field("HEARD"),
    ok: field("OK").toUpperCase() !== "NO",
    word: field("WORD").replace(/^NONE$/i, ""),
    note: field("NOTE"),
  };
}

export async function GET() {
  if (!key()) return NextResponse.json({ ok: false, problem: "no GEMINI_API_KEY" });
  try {
    const res = await fetch(`${API}/models?key=${key()}`);
    const data = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
    const usable = (data.models ?? [])
      .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
    return NextResponse.json({ ok: res.ok, model: MODEL, available: usable.slice(0, 40) });
  } catch {
    return NextResponse.json({ ok: false, problem: "could not reach Gemini" });
  }
}

export async function POST(req: Request) {
  if (!key()) return NextResponse.json({ error: "no_key" }, { status: 503 });

  let audio = "", mimeType = "audio/webm", target = "";
  try {
    ({ audio, mimeType = "audio/webm", target } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!audio || !target) return NextResponse.json({ error: "missing" }, { status: 400 });

  try {
    const res = await fetch(`${API}/models/${MODEL}:generateContent?key=${key()}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt(target) }, { inline_data: { mime_type: mimeType, data: audio } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 300 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const detail = data?.error?.message ?? `HTTP ${res.status}`;
      return NextResponse.json({ error: "gemini", detail }, { status: 502 });
    }
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
    if (!text) return NextResponse.json({ error: "empty" }, { status: 502 });
    return NextResponse.json(parse(text));
  } catch (e) {
    return NextResponse.json({ error: "offline", detail: (e as Error).message }, { status: 504 });
  }
}
