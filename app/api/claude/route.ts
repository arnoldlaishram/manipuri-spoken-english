// The Claude proxy.
//
// This runs on the server, so ANTHROPIC_API_KEY never reaches the browser.
//   GET  -> is Claude usable at all (so the UI can hide what won't work)
//   POST -> { prompt } -> { text }

import Anthropic, {
  APIConnectionError, APIError, AuthenticationError, InternalServerError,
  NotFoundError, PermissionDeniedError, RateLimitError,
} from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";

let client: Anthropic | null = null;
let problem: string | undefined;

function getClient(): Anthropic | null {
  if (client) return client;
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
    problem = "no ANTHROPIC_API_KEY — copy .env.local.example to .env.local and put your key in it";
    return null;
  }
  try {
    client = new Anthropic();
    problem = undefined;
    return client;
  } catch (e) {
    problem = `could not start the Anthropic client (${(e as Error).name})`;
    return null;
  }
}

export async function GET() {
  const c = getClient();
  return NextResponse.json({ ok: Boolean(c), problem, model: c ? MODEL : null });
}

export async function POST(req: Request) {
  let prompt = "";
  try {
    prompt = String(((await req.json()) as { prompt?: string }).prompt ?? "").trim();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  if (!prompt) return NextResponse.json({ error: "empty_prompt" }, { status: 400 });

  const c = getClient();
  if (!c) return NextResponse.json({ error: "no_claude", detail: problem }, { status: 503 });

  try {
    const r = await c.messages.create({
      model: MODEL,
      max_tokens: 700,
      // Short, simple, latency-sensitive tutoring turns — she is sitting there
      // with the microphone waiting. Depth matters far less than speed here.
      output_config: { effort: "low" },
      messages: [{ role: "user", content: prompt }],
    });

    // A policy decline arrives as HTTP 200 — check before reading content.
    if (r.stop_reason === "refusal") {
      return NextResponse.json({ error: "refused" }, { status: 200 });
    }

    const text = r.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");
    return NextResponse.json({ text });
  } catch (e) {
    // Most specific first — retryable and non-retryable are different problems.
    if (e instanceof AuthenticationError)
      return NextResponse.json({ error: "auth", detail: "The API key was rejected." }, { status: 401 });
    if (e instanceof PermissionDeniedError)
      return NextResponse.json({ error: "auth", detail: "This key may not use that model." }, { status: 403 });
    if (e instanceof NotFoundError)
      return NextResponse.json({ error: "model", detail: `${MODEL} is not available to this account.` }, { status: 404 });
    if (e instanceof RateLimitError)
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    if (e instanceof InternalServerError)
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    if (e instanceof APIConnectionError)
      return NextResponse.json({ error: "offline", detail: "Could not reach the Claude API." }, { status: 504 });
    if (e instanceof APIError)
      return NextResponse.json({ error: "api", detail: `HTTP ${e.status ?? "?"}` }, { status: 502 });
    return NextResponse.json({ error: "api", detail: (e as Error).message }, { status: 500 });
  }
}
