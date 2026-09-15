"use client";

// Talking to Claude, from the browser.
//
// The browser never sees the API key: it calls our own /api/claude route,
// which holds the key server-side. See app/api/claude/route.ts.

export type ClaudeError = { code: string; message: string };

/** Empty normally; set only when served behind a path-prefixing proxy. */
const BASE = process.env.NEXT_PUBLIC_HAIYU_BASE ?? "";

export async function ask(prompt: string, signal?: AbortSignal): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/claude`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal,
    });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw { code: "cancelled", message: "" } as ClaudeError;
    throw { code: "offline", message: "Could not reach the local server." } as ClaudeError;
  }

  const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string; detail?: string };
  if (!res.ok || data.error) {
    throw { code: data.error ?? "api", message: data.detail ?? "" } as ClaudeError;
  }
  return data.text ?? "";
}

/** Is Claude usable at all? Checked once at startup so the UI can hide what won't work. */
export async function claudeStatus(): Promise<{ ok: boolean; problem?: string }> {
  try {
    const res = await fetch(`${BASE}/api/claude`, { method: "GET" });
    const d = (await res.json()) as { ok: boolean; problem?: string };
    return d;
  } catch {
    return { ok: false, problem: "the local server is not responding" };
  }
}

// ---- parsing the labelled formats the prompts ask for ----

export function parseLabels<K extends string>(text: string, keys: readonly K[]): Partial<Record<K, string>> {
  const out: Partial<Record<K, string>> = {};
  const re = new RegExp(`^\\s*(${keys.join("|")})\\s*:\\s*(.*)$`);
  for (const line of String(text).split("\n")) {
    const m = line.match(re);
    if (m) out[m[1] as K] = m[2].trim();
  }
  return out;
}

/** "3| I got up at six. || Nangna 'got' sijinnakhre." -> {3: {fix, note}} */
export function parseNumbered(text: string): Record<number, { fix: string; note: string }> {
  const out: Record<number, { fix: string; note: string }> = {};
  for (const line of String(text).split("\n")) {
    const m = line.match(/^\s*(\d+)\s*\|\s*(.*)$/);
    if (!m) continue;
    const [fix, note = ""] = m[2].split("||");
    out[Number(m[1])] = { fix: fix.trim(), note: note.trim() };
  }
  return out;
}
