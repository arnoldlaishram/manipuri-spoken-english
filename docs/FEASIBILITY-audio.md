# Can the app tell her whether she is actually speaking correctly?

Measured in Chrome 152 on 2026-09-29, not assumed.

## The problem with what we have now

Google's speech recognition has a language model behind it. It does not
transcribe sounds — it guesses the most likely English sentence given the
sounds. So a rough attempt at *"How much is this?"* often comes back as
`how much is this`, and we score it correct.

**We are scoring Google's guess, not her mouth.** That is the complaint, and
it is right.

---

## What is NOT possible

**Sending her recording to Claude.** Claude has no audio input — the Messages
API content blocks are text, image and document only (checked in the installed
SDK: zero occurrences of "audio"). No prompt wording gets around it. Any
"send the audio to the AI" design needs a different provider.

---

## What Chrome can actually do

| | Available | Useful for this? |
|---|---|---|
| `MediaRecorder` | yes — webm/opus, mp4 | record her voice |
| Web Audio `AnalyserNode` | yes | volume, pitch, timing |
| `AudioWorklet` | yes | real-time analysis off the main thread |
| WebGPU | **yes** | runs a local speech model fast |
| WASM SIMD | yes | same, on the CPU |
| WASM threads | no (needs COOP/COEP headers) | would roughly halve CPU inference time |
| `SpeechRecognitionAlternative.confidence` | **yes, and we were discarding it** | how sure the recogniser was |
| `SpeechRecognition.processLocally` | **yes** (Chrome 139+) | on-device recognition, no Google round-trip |
| `window.LanguageModel` (Gemini Nano) | **yes** | on-device LLM feedback, no API key |
| `window.Translator` | yes | English↔major languages; Manipuri almost certainly not |

---

## The options, cheapest first

### 1. Hear yourself next to the model — **done**
The `Recorder` was already built as a fallback. It is now on every speaking
screen: record, play yours, play the model, compare. No key, no server, no
judgement claimed.

This is not a consolation prize. Comparing your own voice against a model is
how people actually fix pronunciation; a score out of six never told her *what*
was wrong anyway.

### 2. Say when the machine guessed — **done**
`confidence` was already being returned and thrown away. Below 0.75 she now
gets a line saying the machine was not sure and she should listen back.
It does not fix the correction problem; it makes it visible.

### 3. On-device recognition — one flag
`processLocally = true` keeps the audio on her laptop and off Google's servers.
Worth trying for privacy and offline use. **Unknown whether it corrects less** —
it is a smaller model, so it may correct *more*. Needs testing with a real
microphone, which this machine does not have.

### 4. Local Whisper (transformers.js + WebGPU) — the real answer
WebGPU and WASM SIMD are both available. Whisper-tiny or -base runs in the
browser, no key and no server. It transcribes what was *said* rather than
snapping to likely English, so a mispronounced word comes back wrong — which is
the honest signal she wants.

Cost: ~40–75 MB model download once, a few seconds per utterance, and a real
dependency. Everything else here has been zero-dependency.

### 5. Gemini Nano for the feedback text — no key needed
`window.LanguageModel` is present. It cannot hear either, but given her
transcript and the target it can write a plain explanation of what differed.
It would replace the Claude call for this one job and work with no API key.

---

## What none of this can do

No browser API scores *pronunciation* — phoneme accuracy, stress, intonation.
Whisper gets closer by not auto-correcting, but "you said *ship* not *sheep*"
needs forced alignment against a phoneme model. That is a research project, not
a feature.

**Recording her and letting her hear herself against the model remains the most
honest feedback available, and it is now in.**

---

---

## Gemini — the unlock, added 2026-09-30

Claude has no audio input. **Gemini does**, and it accepts `audio/webm` inline —
exactly what `MediaRecorder` already produces, so her recording goes over with no
conversion. 32 tokens per second of audio, so a five-second attempt is ~160
tokens. Verified against the API docs, not assumed.

`app/api/speech/route.ts` sends the clip plus the target sentence and asks it to
judge **only the sounds**, returning what it heard, the one word most worth
fixing, and a note in romanized Manipuri. `GET /api/speech` lists the models the
key actually has, so the model name never has to be guessed.

Without `GEMINI_API_KEY` the button simply does not appear. Nothing else changes.

## Android — not needed for this

The audio feature needs: a microphone, a recording, an HTTPS call. The web app
already has all three. Android would mean rebuilding twelve lessons, fifteen
situations, the levels, review, fluency and 273 tests in a second codebase, and
would gain nothing for this purpose.

If the goal is "an icon on her phone", that is a web app manifest, not a rewrite.
Native would only earn its keep for background recording, offline speech models,
or store distribution — none of which is the problem here.

## Recommendation

Ship 1 and 2 (done). Test 3 on her laptop — it is one flag and might be a real
improvement. Do 4 only if, after using 1 and 2 for a week, the auto-correction
is still the thing holding her back.
