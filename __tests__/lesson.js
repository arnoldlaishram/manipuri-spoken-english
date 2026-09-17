// Walks a whole lesson in real Chrome, the way she would:
// pattern -> examples -> drill -> own sentence -> assessment.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { UNITS } = require(path.join(root, "content/units.js"));
const { LEVELS } = require(path.join(root, "content/levels.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 200)));
const words = en => en.replace(/[.?!]+$/, "").split(/\s+/);

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await page.setViewport({ width: 420, height: 900 });
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);
  const pause = (ms = 400) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);
  const click = async (t, req = true) => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
    const el = h.asElement(); if (!el) { if (req) throw new Error("no button: " + t); return false; }
    await el.click(); await pause(); return true;
  };
  const chip = async (w, sel = "#chips") => {
    const h = await page.evaluateHandle((s, q) => [...document.querySelectorAll(q + " .chip")].find(c => c.textContent === s && !c.classList.contains("used")), w, sel);
    const el = h.asElement(); if (!el) throw new Error("no chip " + w); await el.click(); await pause(140);
  };

  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector("button.level-head");

  await click("Level 1"); await click("Ei ... -i");

  // --- 1. the pattern screen, with read-aloud ---
  ok("the pattern screen explains why", /Karigino haibadi|why/i.test(await body()));
  ok("the explanation has a read-aloud button",
     await page.$(".whyhead .icon-btn") !== null);

  // --- 2. worked examples come BEFORE any production ---
  await click("Housi");
  ok("examples come next, not the drill",
     /just read and listen/i.test(await body()), (await body()).slice(0, 220));
  ok("nothing is asked of her here", /Nothing to do here/i.test(await body()));
  const pairs = await page.$$eval(".pairs li", els => els.map(e => ({
    mni: e.querySelector(".pm")?.textContent?.trim(),
    en: e.querySelector(".pe")?.textContent?.trim(),
    say: Boolean(e.querySelector(".icon-btn")),
  })));
  const core = UNITS.find(u => u.key === "core");
  ok("every example is Manipuri beside English",
     pairs.length === core.examples.length && pairs.every(p => p.mni && p.en && p.say),
     JSON.stringify(pairs[0]));
  ok("each one can be heard", pairs.every(p => p.say));
  console.log("\n  first three examples she sees:");
  pairs.slice(0, 3).forEach(p => console.log(`    ${p.mni}\n      ${p.en}`));

  // --- 3. drill ---
  await click("Khangle");
  ok("only then does the drill start", await page.$("#chips") !== null, (await body()).slice(0, 200));
  for (const item of core.items) {
    if (await page.$("#chips")) { for (const w of words(item.en)) await chip(w); await pause(1200); }
    if (!(await page.$("#typeIn"))) await click("Iduna haiyu", false);
    if (await page.$("#typeIn")) { await page.type("#typeIn", item.en); await click("Thabiyu"); }
    await click("Makha tana", false);
  }
  ok("reaches her own sentence", /Nasagi wahei ama semmu/.test(await body()), (await body()).slice(0, 200));
  if (!(await page.$("#typeIn"))) await click("Iduna haiyu", false);
  await page.type("#typeIn", "I like tea"); await click("Thabiyu"); await pause(600);
  await click("Loire", false) || await click("Makha tana", false);
  await pause(500);

  // --- 4. the assessment ---
  ok("a scored assessment follows", /a quick check/i.test(await body()), (await body()).slice(0, 250));
  let answered = 0;
  for (let n = 0; n < 8; n++) {
    const t = await body();
    if (/Phajei!|Amuk hanna yengsi/.test(t)) break;
    if (/Achumba English adu khanbiyu/.test(t)) {
      const target = await page.evaluate(() =>
        (document.querySelector(".askline") ?? document.querySelector(".phrase .words"))?.textContent?.trim());
      const item = core.items.find(i => i.mni === target || i.en === target);
      if (!item) throw new Error("could not match question: " + target);
      await click(item.en); await pause(250); await click("Makha tana"); answered++;
    } else if (/achumba maongda thamu/.test(t)) {
      const target = await page.evaluate(() =>
        (document.querySelector(".askline") ?? document.querySelector(".phrase .words"))?.textContent?.trim());
      const item = core.items.find(i => i.mni === target || i.en === target);
      if (!item) throw new Error("could not match question: " + target);
      for (const w of words(item.en)) await chip(w);
      await pause(300); await click("Makha tana"); answered++;
    } else if (/Houjik nasana haiyu/.test(t)) {
      const target = await page.evaluate(() =>
        (document.querySelector(".askline") ?? document.querySelector(".phrase .words"))?.textContent?.trim());
      const item = core.items.find(i => i.mni === target || i.en === target);
      if (!item) throw new Error("could not match question: " + target);
      if (!(await page.$("#typeIn"))) await click("Iduna haiyu", false);
      await page.type("#typeIn", item.en); await click("Thabiyu"); await pause(400);
      await click("Makha tana"); answered++;
    } else break;
  }
  ok("it asks several questions", answered >= 5, "answered=" + answered);
  ok("it scores her", /\/ 6|Phajei!/.test(await body()), (await body()).slice(0, 250));
  const score = await page.$eval(".scorebig b", e => e.textContent).catch(() => null);
  ok("answering correctly passes", score === "6", "score=" + score);
  console.log("  assessment score with all-correct answers: " + score + "/6");

  // --- 5. the tense table ---
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.waitForSelector("button.level-head");
  const tl = LEVELS.find(l => l.steps.some(s => s.kind === "unit" && s.key === "tense"));
  await click(`Level ${tl.n}`); await click("Matamsing"); await click("Housi");
  const rows = await page.$$eval(".tenserow", els => els.map(e => ({
    when: e.querySelector(".tw")?.textContent?.trim(),
    mni: e.querySelector(".tm")?.textContent?.trim(),
    en: e.querySelector(".te")?.textContent?.trim(),
  })));
  ok("the tense table shows every tense for one action", rows.length >= 15, "rows=" + rows.length);
  ok("each row pairs Manipuri with English", rows.every(r => r.mni && r.en));
  console.log("\n  one action across every tense:");
  rows.slice(0, 5).forEach(r => console.log(`    ${(r.when || "").padEnd(22)} ${r.mni}\n      ${"".padEnd(22)} ${r.en}`));

  console.log("\n" + log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
