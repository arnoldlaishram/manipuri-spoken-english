// Open EVERY step of EVERY level and check the right screen appears.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { LEVELS, stepId } = require(path.join(root, "content/levels.js"));
const { unitByKey } = require(path.join(root, "content/units.js"));
const { sceneByKey } = require(path.join(root, "content/scenes.js"));
const { DAY_MODES } = require(path.join(root, "content/moments.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).replace(/\s+/g," ").slice(0, 160)));

/** What the screen for this step should unmistakably contain. */
function expected(s) {
  if (s.kind === "unit")   { const u = unitByKey(s.key);  return [u.title, u.titleEn]; }
  if (s.kind === "scene")  { const c = sceneByKey(s.key); return [c.title, c.titleEn]; }
  if (s.kind === "day")    return [DAY_MODES[s.mode].label];
  if (s.kind === "review") return ["Amuk ningsingbiyu", "nothing to review"];
  if (s.kind === "fluency")return ["Yangna ngangba", "faster"];
  return [];
}

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await page.setViewport({ width: 420, height: 900 });
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);
  const pause = (ms = 380) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);
  const home = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };

  // Seed progress deliberately: a half-done step, a fully-walked step and a
  // finished one. Clicking a step by name must still open THAT step at its
  // start — resuming belongs to the button on the home screen.
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.setItem("haiyu.progress.v1", JSON.stringify({
    done: { "unit:core": true },
    at: { "scene:escape": 12, "unit:now": 3, "day:today": 6 },
    totals: { "scene:escape": 9, "unit:now": 6, "day:today": 6 },
    missed: {}, days: 1, updated: Date.now(),
  })));
  await home();

  for (const lvl of LEVELS) {
    // open the level
    const opened = await page.evaluate(n => {
      const h = [...document.querySelectorAll("button.level-head")]
        .find(x => x.textContent.includes("Level " + n));
      if (!h) return false;
      h.click(); return true;
    }, lvl.n);
    if (!opened) { ok(`Level ${lvl.n}: header exists`, false, "not found"); continue; }
    await pause();

    const rows = await page.$$eval(".step .step-t b", els => els.map(e => e.textContent.trim()));
    ok(`Level ${lvl.n}: lists all ${lvl.steps.length} steps`, rows.length === lvl.steps.length,
       `showed ${rows.length}: ${rows.join(" | ")}`);

    for (let i = 0; i < lvl.steps.length; i++) {
      const s = lvl.steps[i];
      // click the i-th step row of the open level
      const clicked = await page.evaluate(idx => {
        const rows = [...document.querySelectorAll(".step")];
        if (!rows[idx]) return false;
        rows[idx].click(); return true;
      }, i);
      if (!clicked) { ok(`L${lvl.n} step ${i + 1} (${stepId(s)}): clickable`, false, "row missing"); await home(); continue; }
      await pause(550);

      const t = await body();
      const want = expected(s);
      const hit = want.some(w => t.includes(w));
      ok(`L${lvl.n} → ${stepId(s)}`, hit, `wanted one of [${want.join(" / ")}] — got: ${t.slice(0, 150)}`);

      // A named step must open at its BEGINNING. Resuming mid-way is what the
      // button on the home screen is for; clicking "Awatpa wahei" must show
      // Awatpa wahei from the top, even with progress saved against it.
      if (s.kind === "scene" || s.kind === "unit") {
        const where = await page.evaluate(() => document.querySelector(".where")?.textContent?.trim() ?? "");
        const midway = /\b(?:[2-9]|\d\d)\s*\/\s*\d/.test(where);
        ok(`L${lvl.n} \u2192 ${stepId(s)}: opens at the start, not mid-way`, !midway, where);
      }

      // and the back link must return to the level map
      const back = await page.evaluate(() => {
        const b = document.querySelector("#back") ?? [...document.querySelectorAll("button")].find(x => x.textContent.includes("Mapham pumnamak"));
        if (!b) return false; b.click(); return true;
      });
      await pause(450);
      ok(`L${lvl.n} → ${stepId(s)}: back returns to the levels`,
         back && (await page.$("button.level-head")) !== null);

      // re-open the level for the next step
      await page.evaluate(n => {
        const h = [...document.querySelectorAll("button.level-head")].find(x => x.textContent.includes("Level " + n));
        if (h && !h.getAttribute("aria-expanded")?.includes("true")) h.click();
      }, lvl.n);
      await pause(260);
    }
    await home();
  }

  console.log(log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
