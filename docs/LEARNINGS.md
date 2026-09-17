# Learnings

Findings from building this, grouped by area, so they don't have to be
rediscovered. **Read this before changing anything in the matching area.**
Each entry says what was believed, what turned out to be true, and how it was
found — because the "how" is usually the reusable part.

Newest findings are added to the end of each section.

---

## 1. Language on screen

### The big line must be English wherever the microphone is on screen
*Found 2026-09-17, by the learner using it.*

The drill, review, quiz and day screens showed the **Manipuri** sentence as the
large bold line and asked her to speak. The recogniser only understands English,
so she read the Manipuri aloud and it could never match. Worse: an app for
learning English was leading with Manipuri on most of its screens.

**Rule:** if there is a microphone on the screen, the big line is English and
the Manipuri sits under it as the meaning. Where she reads and *picks* rather
than speaks (the quiz's choose/order questions) Manipuri may lead, but it is
styled differently (`.askline`) so it never looks like a "say this" line.

The chip-ordering step is the one exception: no microphone is present, so the
Manipuri leads — otherwise the answer would be sitting on screen.

Guarded by `__tests__/language.js`, which walks each screen, checks whether a
mic is present, and fails if the big line is not an English target sentence.

### Every Manipuri string needs an English twin
*Found 2026-09-13.*

70 strings across 6 field types had no English at all. She **understands**
English but cannot produce it — so the English is a second channel for her, not
a note for the maintainer. A Manipuri-only string is a screen she may not be
able to read.

Guarded in `logic.test.ts`: every unit, scene, moment and level is walked and
any missing twin is named.

### Prompts are one short clause
Situation lines used to end with `Karamna hairibano?`, duplicating the label
already on screen. Terse beats explanatory. A test caps their length and fails
on any reappearance of the phrase.

### The speak button carries a drawn microphone, and no animation
*Found 2026-09-16, then corrected 2026-09-17 on the owner's feedback.*

The button carried a plain dot. She cannot read the English label on it, so the
shape has to carry the meaning — it is now a drawn mic.

A pulsing halo was added to show listening and was rejected as "really bad": on
a 21px glyph a scaling ring reads as noise, not feedback. **Removed.** Listening
is already signalled twice without it — the button changes colour (madder →
turmeric) and the label changes to `Taribani…`. Two clear signals beat three
noisy ones.

The guard in `ui.js` now requires that listening is signalled *somehow* and that
the icon never changes size between states — it does not prescribe animation.

---

## 2. The microphone

### `getUserMedia` succeeding tells you nothing about `SpeechRecognition`
*Found 2026-09-13, in real Chrome via puppeteer.*

They use **different audio capture paths**. On a machine with no PCM device,
`getUserMedia` returned a track successfully and `SpeechRecognition` then died
1 ms later with `audio-capture`. The app reported "No microphone was found",
which was flatly untrue — the mic had just worked.

**Rule:** never attribute a recognition failure to the device. If
`getUserMedia` has succeeded, a subsequent failure is the recogniser's.

### SpeechRecognition does not reliably prompt for permission
Starting recognition alone often fails with `not-allowed` and never shows a
prompt. **`getUserMedia`, called from her tap, is what makes the browser ask.**
Ask first, then start recognition.

### Never claim to be listening before `onaudiostart`
The button used to flip to "listening" the instant she tapped. A mic that never
opened looked identical to one waiting for her. Only `onaudiostart` proves the
microphone opened.

### A page inside an iframe is never granted the microphone
A published artifact, and run-kit's web tile, are cross-origin iframes.
`microphone` is not delegated, so **no permission prompt ever appears and no
address-bar control shows up** — which is indistinguishable from "broken" unless
you say so. This is why the app is served locally rather than as an artifact.

### The mic only works on `localhost` or HTTPS
A browser rule. Serving from one machine and opening it from another over plain
`http://192.168.x.x` silently gives no microphone. Run it on the learner's own
laptop.

### `/check` exists for this
Open it on the learner's machine: it runs every probe, prints a
millisecond-by-millisecond event log and a plain verdict. **Ask for that output
before theorising about a microphone problem.** Two rounds were wasted guessing.

---

## 3. Teaching decisions

### Worked examples before production
*Found 2026-09-15, by the learner using it: she was confused.*

Lessons went from a short explanation straight to "put these words in order".
She was being asked to produce before she had ever seen the mapping. Every
lesson now shows 6 Manipuri↔English pairs, with play buttons and nothing to do,
before any production. Guarded in `logic.test.ts`.

### Nation's four strands — keep them balanced
A balanced course gives roughly equal time to meaning-focused input,
meaning-focused output, language-focused study and fluency development, with
**≤25% language study and ≥25% fluency**. This app began at ~70% language study
and **0% fluency**.

| Strand | Where it lives |
|---|---|
| Language-focused study | the 12 lessons (`content/units.ts`) |
| Meaning-focused output | role-play, free sentence, her day |
| Fluency development | the 4/3/2 drill (`components/Fluency.tsx`) |
| Meaning-focused input | **still the gap** — almost no connected listening |

### Fluency is measured, not scored
The 4/3/2 drill reports **words per minute** — a real measurement of her own
speech. Measured 20 → 27 → 40 across three rounds in test. Keep it a
measurement; the moment it becomes points it is the gamification that was
explicitly rejected.

### Levels are a map, not a gate
Nothing is locked. Ordered by **how exposed the learner feels**, not by topic:
home and friends early, the phone and the doctor last. No points, streaks or XP.

### Patterns are shown, never named
No grammar vocabulary reaches the screen. A frame is a chunk with a hole in it.

### Scoring is intelligibility, not pronunciation
`lib/score.ts` does LCS word matching against the target, locally, with no
network and no API key. If the recogniser transcribed it, a stranger would have
understood it. Do not claim more than that.

### Spaced review, or everything decays
Without it every sentence is practised exactly once. Expanding Leitner ladder
(1/3/7/16/35/90 days); a card is created the moment she answers anything. A
first correct answer is due **tomorrow** — the first review should come soon
after first meeting it.

---

## 4. The Manipuri content

**All of it is AI-drafted.** Errors found by a native speaker so far:

| Wrong | Right | Note |
|---|---|---|
| `mi amana khanggani` | `Nang khanglani` | |
| `Ei ising tang-i` | `Ei ising darkar oi` | `tang-i` may not be a word |
| `Houramsi` | `Hourasi` | "let's start" |

All three are locked in by tests so they cannot regress. **The riskiest area is
verb morphology** — the tense table (`chari`, `chakhi`, `chagani`, `charure`)
was guessed, and that is exactly where the errors above came from.

`docs/manipuri-to-check.md` lists every line beside what it is *supposed* to
mean, so a checker can verify meaning and not just spelling.

Nothing in the code depends on any Manipuri wording; corrections are a swap.

---

## 5. Testing

### jsdom cannot test the things that break
It cannot tell you `getUserMedia` succeeds while `SpeechRecognition` fails 1 ms
later, and it does not apply external stylesheets (computed padding is always
`0`). **Anything touching the microphone, layout or real timing needs
puppeteer.**

### `innerText` reflects `text-transform`
A check failed on casing, not content, because `.blabel` is uppercased. Compare
case-insensitively, or read `textContent`.

### Derive test expectations from content, not constants
Several tests broke on "4 levels" / "10 scenes" when content grew — noise that
hides real failures. Read `LEVELS.length` and friends from the content files.

### Add a guard with each fix
Every finding above has a test attached. Two have already caught real
regressions: the situation-length cap caught a two-clause line as it was being
written, and the English-twin check caught a missing gloss.

---

## 6. Deployment

- `npm run build && npm start` on port 8765. Chrome only, in a real tab.
- Behind a path-prefixing proxy (run-kit's `/proxy/8765/`), build with
  `HAIYU_BASE=/proxy/8765` — otherwise the asset URLs and the app's own API
  calls resolve at the proxy root and 404. **Check response bodies, not status
  codes:** the proxy returns its own dashboard HTML with `200`, which looks fine
  to `curl -o /dev/null -w '%{http_code}'` and is not.
- No API key is needed for the course, the drills or the scoring. It is needed
  only for role-play, the free sentence, the day-story tidy-up and the question
  button.
