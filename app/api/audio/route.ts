// Which phrases have a real recording?
//
// Drop audio files into public/audio named after the English phrase:
//   "How much is this?"  ->  public/audio/how-much-is-this.mp3
// The app then plays your voice instead of the browser's synthesiser.

import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TYPES = new Set([".mp3", ".m4a", ".wav", ".ogg", ".aac", ".opus", ".webm"]);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function GET() {
  const dir = path.join(process.cwd(), "public", "audio");
  const audio: Record<string, string> = {};
  try {
    for (const name of await readdir(dir)) {
      if (TYPES.has(path.extname(name).toLowerCase())) {
        audio[slug(path.basename(name, path.extname(name)))] = name;
      }
    }
  } catch {
    /* no audio folder yet — the synthesiser is used for everything */
  }
  return NextResponse.json({ audio });
}
