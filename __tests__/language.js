// Two rules this file protects, both from the learner actually using the app:
//
//   1. Wherever the microphone is on screen, the big line must be ENGLISH.
//      She reads the big line aloud, and the recogniser only knows English.
//   2. English sits above, Manipuri underneath — the same way round on every
//      screen, and never English alone.
const puppeteer = require("puppeteer");
const path = require("path");
const Modules = require("module"), resolve = Modules._resolveFilename, buildRoot = path.resolve(".test-build");
Modules._resolveFilename = function (request, ...rest) {
  if (request.startsWith("@/")) request = path.join(buildRoot, request.slice(2));
  return resolve.call(this, request, ...rest);
};
const { UNITS } = require(path.join(buildRoot, "content/units.js"));
const { SCENES } = require(path.join(buildRoot, "content/scenes.js"));
const { MOMENTS } = require(path.join(buildRoot, "content/moments.js"));
const { LEVELS } = require(path.join(buildRoot, "content/levels.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const results = [];
const check = (name, passed, detail = "") =>
  results.push((passed ? "  ok   " : "FAIL   ") + name + (passed ? "" : "  ::  " + String(detail).replace(/\s+/g, " ").slice(0, 190)));

const wordsOf = english => english.replace(/[.?!]+$/, "").split(/\s+/);
const looksEnglish = text => /^[\x20-\x7E‘’“”–—▶◗]+$/.test(text);

const everyTargetSentence = new Set([
  ...UNITS.flatMap(unit => unit.items.map(item => item.en)),
  ...SCENES.flatMap(scene => scene.phrases.map(phrase => phrase.en)),
  ...MOMENTS.flatMap(moment => Object.values(moment.eg)),
].map(sentence => sentence.trim()));

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 420, height: 900 });
  await browser.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);

  const settle = (ms = 420) => new Promise(done => setTimeout(done, ms));
  const clickByText = async (label, required = true) => {
    const handle = await page.evaluateHandle(
      text => [...document.querySelectorAll("button")].find(button => button.textContent?.includes(text)), label);
    const element = handle.asElement();
    if (!element) { if (required) throw new Error("no button: " + label); return false; }
    await element.click(); await settle(); return true;
  };
  const clickChip = async word => {
    const handle = await page.evaluateHandle(
      text => [...document.querySelectorAll("#chips .chip")]
        .find(chip => chip.textContent === text && !chip.classList.contains("used")), word);
    await handle.asElement().click(); await settle(150);
  };
  const startFresh = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };

  const shown = [];

  /** On a screen with a microphone, the big line must be an English target. */
  const checkSpeakScreen = async label => {
    const state = await page.evaluate(() => ({
      big: document.querySelector(".phrase .words")?.textContent?.trim() ?? null,
      meaning: document.querySelector(".meaning")?.textContent?.trim() ?? null,
      hasMicrophone: Boolean(document.querySelector(".mic-btn")),
    }));
    if (!state.hasMicrophone) return;
    shown.push({ label, big: state.big, small: state.meaning });
    check(`${label}: the big line is English`, Boolean(state.big) && looksEnglish(state.big), `big="${state.big}"`);
    check(`${label}: it is a real target sentence`, everyTargetSentence.has(state.big ?? ""), `big="${state.big}"`);
  };

  /** Wherever the two languages are paired, English must sit above Manipuri. */
  const checkPairOrder = async (label, selector) => {
    const positions = await page.evaluate(query => {
      const block = [...document.querySelectorAll(query)].find(node => node.querySelector(".mni-twin"));
      if (!block) return { found: false };
      const manipuri = block.querySelector(".mni-twin");
      return {
        found: true,
        englishTop: Math.round(block.getBoundingClientRect().top),
        manipuriTop: Math.round(manipuri.getBoundingClientRect().top),
      };
    }, selector);
    if (!positions.found) { check(`${label}: pairs both languages`, false, "no Manipuri twin found"); return; }
    check(`${label}: English sits above the Manipuri`, positions.manipuriTop > positions.englishTop, JSON.stringify(positions));
  };

  // ---------- a drill item, past the word-ordering scaffold ----------
  await startFresh();
  await clickByText("Level 1"); await clickByText("Ei ... -i");
  await checkPairOrder("lesson: why it matters", ".whybox");
  await clickByText("Housi");
  const examplePair = await page.evaluate(() => {
    const row = document.querySelector(".pairs li");
    if (!row) return null;
    const english = row.querySelector(".pe"), manipuri = row.querySelector(".pm");
    return {
      englishFirst: row.children[0]?.className === "pe",
      englishAbove: manipuri.getBoundingClientRect().top > english.getBoundingClientRect().top,
    };
  });
  check("examples: English sits above its Manipuri",
    Boolean(examplePair?.englishFirst && examplePair?.englishAbove), JSON.stringify(examplePair));

  await clickByText("Khangle");
  const firstUnit = UNITS.find(unit => unit.key === "core");
  for (const word of wordsOf(firstUnit.items[0].en)) await clickChip(word);
  await settle(1300);
  await checkSpeakScreen("drill (after ordering)");

  for (let step = 0; step < 2; step++) {
    if (!(await page.$("#typeIn"))) await clickByText("Iduna haiyu", false);
    if (await page.$("#typeIn")) { await page.type("#typeIn", "x"); await clickByText("Thabiyu"); }
    await clickByText("Makha tana", false);
    if (await page.$("#chips")) {
      for (const word of wordsOf(firstUnit.items[step + 1].en)) await clickChip(word);
      await settle(1300);
    }
  }
  await checkSpeakScreen("drill (no scaffold)");

  // ---------- telling her day ----------
  await startFresh();
  const dayLevel = LEVELS.find(level => level.steps.some(step => step.kind === "day"));
  await clickByText(`Level ${dayLevel.n}`); await clickByText("Nanggi numit"); await clickByText("Ngasi", false);
  await checkSpeakScreen("my day");

  // ---------- review ----------
  await startFresh();
  await page.evaluate(() => localStorage.setItem("haiyu.review.v1", JSON.stringify({
    "unit:core:0": { id: "unit:core:0", en: "I want tea.", mni: "Ei cha thakning-i.", box: 0, due: Date.now() - 1000, seen: 1, lapses: 0 },
  })));
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector(".duecard");
  await page.click(".duecard"); await settle(600);
  await checkSpeakScreen("review");

  // ---------- a scene phrase, and its note ----------
  await startFresh();
  await clickByText("Level 1"); await clickByText("Awatpa wahei");
  await checkSpeakScreen("scene phrase");
  await checkPairOrder("scene note", ".band .meaning");

  console.log("\n  what she sees when the microphone is on screen:");
  shown.forEach(row => console.log(`    ${row.label.padEnd(24)} BIG: ${row.big}\n    ${"".padEnd(24)} under: ${row.small}`));

  console.log("\n" + results.join("\n"));
  const failures = results.filter(line => line.startsWith("FAIL")).length;
  console.log("\n" + (results.length - failures) + "/" + results.length + " checks passed");
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
