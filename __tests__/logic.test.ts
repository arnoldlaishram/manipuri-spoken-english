import { LEVELS, ALL_STEPS, stepId, levelOf } from "@/content/levels";
import { UNITS, unitByKey } from "@/content/units";
import { SCENES, SOON, sceneByKey } from "@/content/scenes";
import { MOMENTS, DAY_MODES } from "@/content/moments";
import { wordDiff, bestOf, accepts, slug, bareWords, GOOD } from "@/lib/score";
import { parseLabels, parseNumbered } from "@/lib/claude";
import { UI } from "@/content/ui";
import { ROUNDS, TALKS } from "@/content/talks";

let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log("  ok   " + name); }
  else { fail++; console.log("FAIL   " + name + (extra ? "  ::  " + extra : "")); }
};

// ---- the course is wired up correctly ----
ok("8 levels", LEVELS.length === 8, String(LEVELS.length));
ok("every step resolves to real content", ALL_STEPS.every(s =>
  s.kind === "unit" ? !!unitByKey(s.key)
  : s.kind === "scene" ? !!sceneByKey(s.key)
  : s.kind === "review" || s.kind === "fluency" ? true
  : !!DAY_MODES[s.mode]));
// "review" deliberately repeats across levels — it is due-driven, not positional.
{
  const ids = ALL_STEPS.filter(s => s.kind !== "review" && s.kind !== "fluency").map(stepId);
  ok("step ids are unique", new Set(ids).size === ids.length);
}
ok("every unit appears in some level",
  UNITS.every(u => ALL_STEPS.some(s => s.kind === "unit" && s.key === u.key)),
  UNITS.filter(u => !ALL_STEPS.some(s => s.kind === "unit" && s.key === u.key)).map(u => u.key).join(","));
ok("every scene appears in some level",
  SCENES.every(c => ALL_STEPS.some(s => s.kind === "scene" && s.key === c.key)),
  SCENES.filter(c => !ALL_STEPS.some(s => s.kind === "scene" && s.key === c.key)).map(c => c.key).join(","));
ok("both day modes appear", (["today","yesterday"] as const).every(m =>
  ALL_STEPS.some(s => s.kind === "day" && s.mode === m)));
ok("levelOf finds the owner", levelOf("scene:school")?.n === 4, String(levelOf("scene:school")?.n));
ok("past tense comes before the classroom parent talk",
  ALL_STEPS.findIndex(s => s.kind === "unit" && s.key === "past") <
  ALL_STEPS.findIndex(s => s.kind === "scene" && s.key === "school"));

// ---- content survived the port ----
ok("12 units, 15 scenes, 6 moments",
  UNITS.length === 12 && SCENES.length === 15 && MOMENTS.length === 6,
  `${UNITS.length}/${SCENES.length}/${MOMENTS.length}`);
// He asked for the "not built yet" list to be built. It must stay empty, and
// every scene must actually be reachable from a level — not just exist.
ok("nothing is left in the not-built list", SOON.length === 0, JSON.stringify(SOON));
ok("every situation is reachable from a level",
  SCENES.every(sc => ALL_STEPS.some(st => st.kind === "scene" && st.key === sc.key)),
  SCENES.filter(sc => !ALL_STEPS.some(st => st.kind === "scene" && st.key === sc.key)).map(s => s.key).join(","));
ok("the scenes he asked for are built",
  ["home","friends","phone","doctor","food","church"].every(k => !!sceneByKey(k)),
  ["home","friends","phone","doctor","food","church"].filter(k => !sceneByKey(k)).join(","));
ok("the hardest everyday situations come late",
  ["phone","doctor"].every(k => levelOf(`scene:${k}`)!.n >= 7),
  ["phone","doctor"].map(k => `${k}=L${levelOf(`scene:${k}`)?.n}`).join(" "));
ok("church scene present", !!sceneByKey("church"));
ok("every level from 2 onward ends with a review",
  LEVELS.slice(1).every(l => l.steps[l.steps.length - 1].kind === "review"),
  LEVELS.map(l => l.steps[l.steps.length - 1].kind).join(","));
ok("Arnold's correction: darkar oi",
  UNITS.some(u => u.items.some(i => i.mni === "Ei ising darkar oi.")));
ok("Arnold's correction: no tang-i anywhere",
  !JSON.stringify(UNITS).includes("tang-i"));
ok("classroom scene present", !!sceneByKey("school"));
ok("classroom role-play forces past tense",
  /past tense/i.test(sceneByKey("school")!.rp.goalEn));
ok("every drill item has both languages",
  UNITS.every(u => u.items.every(i => i.en.trim() && i.mni.trim())));
ok("every scene phrase has both languages",
  SCENES.every(c => c.phrases.every(p => p.en.trim() && p.mni.trim())));
ok("every moment has an example in both tenses",
  MOMENTS.every(m => m.eg.today.trim() && m.eg.yesterday.trim()));

// ---- scoring works with no Claude and no network ----
ok("perfect match scores 1", wordDiff("I want tea", "I want tea").score === 1);
ok("missing word is caught", (() => {
  const d = wordDiff("I want tea", "I tea");
  return d.score < 1 && !d.hit[1];
})());
ok("extra words don't punish her", wordDiff("I want tea", "um I want tea please").score === 1);
ok("punctuation and case ignored", wordDiff("How much is this?", "how much is this").score === 1);
ok("best alternative is chosen",
  bestOf("I want tea", ["I want two", "I want tea"]) === "I want tea");
ok("accept list works",
  accepts("That's too expensive.", ["too expensive"], "Too expensive!"));
ok("wrong answer is rejected",
  !accepts("I'll take it.", ["i will take it"], "how much is this"));
ok("a good-but-imperfect attempt still passes the bar",
  wordDiff("Please speak slowly.", "please speak slowly").score >= GOOD);
ok("slug matches the audio filename convention",
  slug("How much is this?") === "how-much-is-this");
ok("bareWords strips terminal punctuation",
  JSON.stringify(bareWords("Did you eat?")) === JSON.stringify(["Did","you","eat"]));

// ---- the grammar he actually asked for ----
// His first stated weak points were "grammar, positions, and consumptions".
// "Positions" meant prepositions, and for a long time there was no unit for it.
{
  const need = {
    "present continuous": "now", "third person -s": "she", "past tense": "past",
    "future": "future", "questions and negatives": "ask", "conjunctions": "join",
    "PREPOSITIONS": "where", "ARTICLES a/an/the": "a",
    "ADJECTIVES": "how", "ADVERBS": "often",
  };
  const missing = Object.entries(need).filter(([, k]) => !unitByKey(k)).map(([t]) => t);
  ok("every grammar topic he named has a unit", missing.length === 0, missing.join(", "));
  ok("every unit is reachable from a level",
    UNITS.every(u => ALL_STEPS.some(st => st.kind === "unit" && st.key === u.key)),
    UNITS.filter(u => !ALL_STEPS.some(st => st.kind === "unit" && st.key === u.key)).map(u => u.key).join(","));
  ok("prepositions come before the situations that need them",
    levelOf("unit:where")!.n < levelOf("scene:phone")!.n,
    `where=L${levelOf("unit:where")?.n} phone=L${levelOf("scene:phone")?.n}`);
}

// ---- worked examples before production ----
// She got confused because the lesson went from a short explanation straight
// to "put these words in order". Every unit must show her the mapping first.
{
  const noEx = UNITS.filter(u => !(u.examples?.length) && !(u.table?.length));
  ok("every unit shows worked examples before asking her to produce",
    noEx.length === 0, noEx.map(u => u.key).join(","));
  ok("every example is a Manipuri sentence beside its English",
    UNITS.every(u => (u.examples ?? []).every(e => e.mni.trim() && e.en.trim())));
  const tense = unitByKey("tense");
  ok("there is a tense table covering every tense", Boolean(tense?.table?.length));
  ok("it shows one action across five tenses, including the perfect",
    Boolean(tense?.table?.every(b => b.rows.length === 5)) &&
    JSON.stringify(tense?.table).includes("have already"),
    JSON.stringify(tense?.table?.[0]?.rows.map(r => r.whenEn)));
}

// ---- the fluency strand exists at all ----
// Nation: no less than 25% of time on fluency development. It was 0%.
{
  const fluency = ALL_STEPS.filter(s => s.kind === "fluency").length;
  ok("there are timed fluency drills", fluency >= 3, String(fluency));
  ok("fluency only appears once she has language to be fluent with",
    LEVELS.filter(l => l.steps.some(s => s.kind === "fluency")).every(l => l.n >= 3),
    LEVELS.filter(l => l.steps.some(s => s.kind === "fluency")).map(l => l.n).join(","));
  ok("each round is shorter than the last",
    ROUNDS.every((r, i) => i === 0 || r < ROUNDS[i - 1]), ROUNDS.join(","));
  ok("every talk topic is something she already has words for",
    TALKS.length >= 4 && TALKS.every(t => t.prompts.length >= 3 && t.titleEn.trim()));
}

// ---- EVERY Manipuri string must have an English twin ----
// She understands English but cannot produce it, so the English is a second
// channel for her. A Manipuri-only string is a screen she may not be able to
// read at all. This check exists so that gap cannot come back.
{
  const missing: string[] = [];
  const need = (cond: unknown, what: string) => { if (!cond || !String(cond).trim()) missing.push(what); };

  UNITS.forEach(u => {
    need(u.titleEn, `unit ${u.key}.titleEn`);
    need(u.gistEn, `unit ${u.key}.gistEn`);
    need(u.whyEn, `unit ${u.key}.whyEn`);
    need(u.free.qEn, `unit ${u.key}.free.qEn`);
    u.items.forEach(i => { if (i.note) need(i.noteEn, `unit ${u.key} note for "${i.en}"`); });
  });
  SCENES.forEach(sc => {
    need(sc.titleEn, `scene ${sc.key}.titleEn`);
    need(sc.blurbEn, `scene ${sc.key}.blurbEn`);
    need(sc.rp.goalEn, `scene ${sc.key}.rp.goalEn`);
    sc.phrases.forEach(ph => { if (ph.note) need(ph.noteEn, `scene ${sc.key} note for "${ph.en}"`); });
    sc.use.forEach(u => need(u.situEn, `scene ${sc.key} situEn for "${u.target}"`));
  });
  MOMENTS.forEach(m => { need(m.headEn, `moment ${m.k}.headEn`); need(m.qEn, `moment ${m.k}.qEn`); });
  LEVELS.forEach(l => { need(l.titleEn, `level ${l.n}.titleEn`); need(l.blurbEn, `level ${l.n}.blurbEn`); });

  ok("every Manipuri string has an English twin", missing.length === 0, missing.join("; "));
}

// ---- the situation prompts stay short ----
// They used to end with "Karamna hairibano?", duplicating the label already on
// screen. One clause is enough; the screen asks the question.
{
  const wordy = SCENES.flatMap(sc => sc.use)
    .filter(u => /Karamna|karamna/.test(u.situ) || u.situ.length > 46);
  ok("situations are one short clause, not a paragraph",
    wordy.length === 0, wordy.map(u => u.situ).join(" | "));
}

// ---- corrections a native speaker has made; these must not regress ----
ok("start button says Hourasi, not Houramsi",
  UI.start.includes("Hourasi") && !UI.start.includes("Houramsi"), UI.start);
ok("praise says Nang khanglani",
  UI.goodHead.includes("Nang khanglani") && !/khanggani/i.test(UI.goodHead), UI.goodHead);
ok("no corrected spelling survives anywhere in the UI strings",
  !/Houramsi|khanggani|tang-i/i.test(JSON.stringify(UI)));

// ---- parsing Claude's replies ----
const rp = parseLabels("WORKED: YES\nSAY: Of course, no problem.\nDONE: NO", ["WORKED","SAY","DONE","NOTE"] as const);
ok("role-play reply parses", rp.SAY === "Of course, no problem." && rp.DONE === "NO");
ok("absent NOTE stays undefined", rp.NOTE === undefined);
const day = parseNumbered("1| I got up at six. || Nangna \"got\" sijinnakhre.\n2| I made tea. ||");
ok("day fixes parse", day[1].fix === "I got up at six." && day[1].note.startsWith("Nangna"));
ok("empty note is empty, not undefined", day[2].note === "");
ok("junk lines are ignored", Object.keys(parseNumbered("hello\nnonsense")).length === 0);

console.log("\n" + pass + "/" + (pass + fail) + " checks passed");
process.exit(fail ? 1 : 0);
