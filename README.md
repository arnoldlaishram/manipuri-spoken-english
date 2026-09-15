# Haiyu — spoken English for Manipuri speakers

A speaking app for an adult who **understands English but cannot produce it**, and
who reads Manipuri (Meiteilon) only in romanized Latin script.

It runs entirely on the learner's own laptop. Nothing is uploaded, there is no
account, and progress stays in that browser.

---

## Start it

```bash
git clone https://github.com/arnoldlaishram/manipuri-spoken-english.git
cd manipuri-spoken-english

npm install
npm run build
npm start                 # http://localhost:8765
```

While editing, `npm run dev` gives hot reload on the same port.

### Two things that will bite you otherwise

**Use Chrome.** Speech recognition is a Chrome feature. Other browsers fall back
to typing, which works but is not the point.

**The microphone only works on `localhost` or over HTTPS.** That is a browser
rule. Running the server on one machine and opening it from another over plain
`http://192.168.x.x` will silently give you no microphone — run it on the
learner's own laptop instead.

If the mic misbehaves, open **`/check`**. It runs every probe, prints a
millisecond-by-millisecond event log, and gives a plain verdict you can paste
to someone. `getUserMedia` succeeding does **not** mean recognition will work —
they use different audio paths, and `/check` tells the two apart.

### Optional: conversation practice

```bash
cp .env.local.example .env.local     # then put an Anthropic API key in it
```

Without a key everything still works except the four open-ended parts:
role-play, the free sentence at the end of a lesson, the day-story corrections,
and the question button. The drills, the scoring and the whole course run with
no key at all — speech is scored locally in `lib/score.ts`.

---

## What's in it

**12 lessons** (`content/units.ts`) — word order, present continuous, third
person, past, future, every tense side by side, questions and negatives,
conjunctions, prepositions, articles, adjectives, adverbs.

**15 situations** (`content/scenes.ts`) — escape phrases, home, shop, friends,
meeting someone, the classroom, church, eating out, the bank, the phone, the
doctor, and a whole journey: auto, airport, plane, train.

**8 levels** (`content/levels.ts`) ordered by *how exposed the learner feels*,
not by topic. Home and friends come early because the stakes are lowest; the
phone and the doctor come last.

Plus: telling the story of your own day, timed fluency drills, and spaced review.

### A lesson runs in five stages

| | |
|---|---|
| **Maong** | the pattern — shown, never named. No grammar words on screen. |
| **Khudamsing** | worked examples: Manipuri beside English, each with a play button. Nothing is asked. |
| **Drill** | tap the words into order, then say it aloud |
| **Nasagi wahei** | make a sentence of your own |
| **Yengba** | a scored assessment; a low score sends you back to the examples, not to a failure screen |

---

## Editing it

The files you are most likely to want are plain data, no React:

| To change… | Edit |
|---|---|
| A word in a lesson | `content/units.ts` |
| A situation or phrase | `content/scenes.ts` |
| Any button or heading | `content/ui.ts` — every UI string is here |
| The levels or their order | `content/levels.ts` |
| Fluency topics | `content/talks.ts` |
| What Claude is asked | `lib/prompts.ts` |
| How speech is scored | `lib/score.ts` |

**Nothing in the code depends on any Manipuri wording.** Corrections are a
straight swap.

> ⚠️ **Most of the Manipuri is AI-drafted and unverified.** Known errors have
> been found and fixed more than once. `docs/manipuri-to-check.md` lists every
> line beside what it is *supposed* to mean, so a native speaker can check the
> meaning and not just the spelling. The tense table is the riskiest part —
> verb endings were guessed.

Screens live in `components/`: `Drill`, `Examples`, `Quiz`, `MyDay`,
`SceneRunner`, `Fluency`, `Review`, `Mic`, `AskDock`.

### Recording the phrases in a real voice

The browser voices are the weakest part. Name an audio file after the English
phrase, lowercase, non-letters as hyphens:

```
"How much is this?"  ->  public/audio/how-much-is-this.mp3
```

Drop it in `public/audio/` and it plays instead of the synthesiser — including
for the "slowly" button, which slows the recording rather than the robot.
Any of `.mp3 .m4a .wav .ogg .aac .opus .webm`. Do as few or as many as you like.

---

## Tests

```bash
npx tsc --noEmit                       # types
npm run build                          # must stay clean

npx tsc -p tsconfig.test.json          # then, with the server running:
node __tests__/hydrate.js              # hydration, levels, saved progress
node __tests__/lesson.js               # a whole lesson end to end, in real Chrome
node __tests__/fluency.js              # the timed drill and its words-per-minute
node __tests__/ui.js                   # question button, spaced review
node __tests__/mic.js                  # every microphone failure mode
```

The browser suites use puppeteer. They matter: jsdom cannot tell you that
`getUserMedia` succeeds while `SpeechRecognition` fails 1 ms later — which is a
real thing that happens.

---

## Design decisions worth not undoing

- **Patterns are shown, never named.** No grammar vocabulary reaches the screen.
- **Worked examples before production.** Added after the learner got confused
  being asked to build sentences before she had seen enough pairs.
- **Every Manipuri string has an English twin.** She understands English; the
  English is a second channel for her, not a note for the maintainer.
- **Fluency is measured in words per minute** — a real measurement of her own
  speech, not an invented score. Keep it that way.
- **Levels are a map, not a gate.** Nothing is locked. No points, streaks or XP.
- **Scoring is intelligibility, not pronunciation.** If the recogniser
  transcribed it, a stranger would have understood it. Do not claim more.
- **Speech-to-text rates stay at 0.95 / 0.78.** Slower wrecks the voices.
