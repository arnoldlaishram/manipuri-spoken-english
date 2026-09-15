// Walks the real app in a real browser and checks that no screen shows
// Manipuri without its English twin. Content-aware, so it can complete the
// tap-the-words step the way she would.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { UNITS } = require(path.join(root, "content/units.js"));
const { LEVELS } = require(path.join(root, "content/levels.js"));
const levelHolding = key => LEVELS.find(l => l.steps.some(st => st.kind === "scene" && st.key === key));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 180)));
const words = en => en.replace(/[.?!]+$/, "").split(/\s+/);

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);
  const pause = (ms = 400) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);

  const clickText = async (t, required = true) => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
    const el = h.asElement();
    if (!el) { if (required) throw new Error("no button: " + t); return false; }
    await el.click(); await pause(); return true;
  };
  const clickChip = async w => {
    const h = await page.evaluateHandle(s =>
      [...document.querySelectorAll("#chips .chip")].find(c => c.textContent === s && !c.classList.contains("used")), w);
    const el = h.asElement(); if (!el) throw new Error("no chip: " + w);
    await el.click(); await pause(120);
  };
  /** Finish whatever exercise is on screen and move on. */
  const advance = async (expectedEn) => {
    if (await page.$("#chips")) {
      for (const w of words(expectedEn)) await clickChip(w);
      await pause(1200);                       // it reads the sentence back first
    }
    if (!(await page.$("#typeIn"))) await clickText("Iduna haiyu", false);
    if (await page.$("#typeIn")) {
      await page.type("#typeIn", "x");
      await clickText("Thabiyu");
    }
    await clickText("Makha tana", false);
  };
  const goHome = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.evaluate(() => localStorage.removeItem("haiyu.progress.v1"));
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };

  // ---------- the pattern screen ----------
  await goHome();
  await clickText("Ei ... -i");
  ok("pattern screen gives the reason in English too",
    /Manipuri puts the verb at the end/.test(await body()), await body());

  // ---------- walk a whole unit to the make-your-own screen ----------
  await clickText("Housi");
  await clickText("Khangle", false);   // the worked-examples stage now sits here
  const core = UNITS.find(u => u.key === "core");
  for (const item of core.items) await advance(item.en);
  ok("reached the make-your-own screen", /Nasagi wahei ama semmu/.test(await body()), (await body()).slice(0, 200));
  ok("make-your-own screen has an English twin",
    /what do you like, or what do you want/.test(await body()), await body());

  // ---------- the situation screen: his actual complaint ----------
  await goHome();
  const shopLevel = levelHolding("shop");
  await clickText(`Level ${shopLevel.n}`);
  await clickText("Dukan-da");
  for (let i = 0; i < 8 && !/Nangna kari hairibano/.test(await body()); i++) await advance("");
  const situ = await page.evaluate(() => document.querySelector(".situ")?.innerText.trim() || "");
  ok("reached the situation screen", situ.length > 0, await body());
  ok("situation shows the English as well as the Manipuri",
    /shopkeeper|price|decided|cloth|too high/i.test(situ), situ);
  ok("the redundant 'Karamna hairibano?' is gone", !/Karamna hairibano/.test(situ), situ);
  ok("the Manipuri clause is short", situ.split("\n")[0].length <= 46, situ.split("\n")[0]);
  console.log("\n  the situation screen now reads:");
  console.log("    " + situ.replace(/\n/g, "\n    "));

  // ---------- a phrase note ----------
  await goHome();
  await clickText("Level 1");
  await clickText("Awatpa wahei");
  ok("phrase notes carry English too",
    /Everyone says it|not a mistake/i.test(await body()), (await body()).slice(0, 400));

  console.log("\n" + log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
