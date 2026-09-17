// The one rule this file exists to protect:
// wherever the microphone is on screen, the BIG line must be English.
// Showing Manipuri there makes her read Manipuri aloud, which the recogniser
// can never match — and it leads an English course with Manipuri.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { UNITS } = require(path.join(root, "content/units.js"));
const { SCENES } = require(path.join(root, "content/scenes.js"));
const { MOMENTS } = require(path.join(root, "content/moments.js"));
const { LEVELS } = require(path.join(root, "content/levels.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 220)));
const words = en => en.replace(/[.?!]+$/, "").split(/\s+/);
const ASCII = s => /^[\x20-\x7E’‘“”—–]+$/.test(s);

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
  const chip = async w => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("#chips .chip")].find(c => c.textContent === s && !c.classList.contains("used")), w);
    await h.asElement().click(); await pause(140);
  };
  /** The check: if a mic is on screen, what is in the big line? */
  const screen = () => page.evaluate(() => ({
    big: document.querySelector(".phrase .words")?.textContent?.trim() ?? null,
    small: document.querySelector(".meaning")?.textContent?.trim() ?? null,
    mic: Boolean(document.querySelector(".mic-btn")),
  }));
  const fresh = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };
  const enSet = new Set([
    ...UNITS.flatMap(u => u.items.map(i => i.en)),
    ...SCENES.flatMap(s => s.phrases.map(p => p.en)),
    ...MOMENTS.flatMap(m => Object.values(m.eg)),
  ].map(s => s.trim()));

  const seen = [];
  const assertScreen = async label => {
    const s = await screen();
    if (!s.mic) return;
    seen.push({ label, ...s });
    ok(`${label}: the big line is English`, Boolean(s.big) && ASCII(s.big), `big="${s.big}"`);
    ok(`${label}: it is a real target sentence`, enSet.has(s.big ?? ""), `big="${s.big}"`);
  };

  // ---- a drill item, past the scaffold ----
  await fresh();
  await click("Level 1"); await click("Ei ... -i"); await click("Housi"); await click("Khangle");
  const core = UNITS.find(u => u.key === "core");
  for (const w of words(core.items[0].en)) await chip(w);
  await pause(1300);
  await assertScreen("drill (after ordering)");
  // advance to item 3, which has no scaffold at all
  for (let k = 0; k < 2; k++) {
    if (!(await page.$("#typeIn"))) await click("Iduna haiyu", false);
    if (await page.$("#typeIn")) { await page.type("#typeIn", "x"); await click("Thabiyu"); }
    await click("Makha tana", false);
    if (await page.$("#chips")) { const it = core.items[k + 1]; for (const w of words(it.en)) await chip(w); await pause(1300); }
  }
  await assertScreen("drill (no scaffold)");

  // ---- my day ----
  await fresh();
  const dayL = LEVELS.find(l => l.steps.some(s => s.kind === "day"));
  await click(`Level ${dayL.n}`); await click("Nanggi numit"); await click("Ngasi", false);
  await assertScreen("my day");

  // ---- review ----
  await fresh();
  await page.evaluate(() => localStorage.setItem("haiyu.review.v1", JSON.stringify({
    "unit:core:0": { id: "unit:core:0", en: "I want tea.", mni: "Ei cha thakning-i.", box: 0, due: Date.now() - 1000, seen: 1, lapses: 0 },
  })));
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector(".duecard");
  await page.click(".duecard"); await pause(600);
  await assertScreen("review");

  // ---- a scene phrase (this one was already right) ----
  await fresh();
  await click("Level 1"); await click("Awatpa wahei");
  await assertScreen("scene phrase");

  console.log("\n  what she sees when the microphone is on screen:");
  seen.forEach(s => console.log(`    ${s.label.padEnd(24)} BIG: ${s.big}\n    ${"".padEnd(24)} small: ${s.small}`));

  console.log("\n" + log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
