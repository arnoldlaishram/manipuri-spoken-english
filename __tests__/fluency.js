// Real Chrome. The speech service can't run on this box, so the recogniser is
// replaced with one the test feeds — everything else is the real drill.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { ROUNDS, TALKS } = require(path.join(root, "content/talks.js"));
const { LEVELS } = require(path.join(root, "content/levels.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 200)));

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await page.setViewport({ width: 420, height: 880 });
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);

  // A recogniser the test controls, installed before any app code runs.
  await page.evaluateOnNewDocument(() => {
    window.__say = null;
    function Fake() {
      const self = this;
      window.__live = self;
      self.start = () => { setTimeout(() => self.onaudiostart && self.onaudiostart(), 5); };
      self.stop = () => { self.onend && self.onend(); };
      self.abort = () => {};
    }
    window.SpeechRecognition = Fake;
    window.webkitSpeechRecognition = Fake;
    // feed words into the live recogniser as if she were speaking
    window.__speak = text => {
      const r = window.__live; if (!r || !r.onresult) return false;
      const res = [{ transcript: text, confidence: 1 }]; res.isFinal = true;
      r.onresult({ resultIndex: 0, results: [res] });
      return true;
    };
  });

  const pause = (ms = 400) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);
  const clickText = async (t, req = true) => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
    const el = h.asElement(); if (!el) { if (req) throw new Error("no button: " + t); return false; }
    await el.click(); await pause(); return true;
  };

  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector("button.level-head");

  const lvl = LEVELS.find(l => l.steps.some(s => s.kind === "fluency"));
  ok("a level carries a fluency drill", Boolean(lvl), "none found");
  await clickText(`Level ${lvl.n}`);
  await clickText("Yangna ngangba");
  ok("the drill opens", /say it again, faster/.test(await body()), (await body()).slice(0, 200));
  ok("it says nothing new is being taught", /Nothing new to learn here/.test(await body()));
  ok("it offers her own-life topics", (await page.$$(".seg button")).length === TALKS.length);

  await clickText("Nanggi numit");
  ok("the first round shows the full clock",
     (await page.$eval(".clock", e => e.textContent)) === String(ROUNDS[0]),
     await page.$eval(".clock", e => e.textContent));
  ok("prompts are there so she doesn't dry up", (await page.$$(".prompts li")).length >= 3);

  await clickText("Ngangbiyu");
  await pause(600);
  ok("the microphone opens and the clock starts",
     Number(await page.$eval(".clock", e => e.textContent)) < ROUNDS[0],
     await page.$eval(".clock", e => e.textContent));

  // speak 20 words, then stop early
  const said = "I got up at six and I made tea then I cleaned the house and I cooked rice for everyone";
  ok("the fake recogniser is wired in", await page.evaluate(t => window.__speak(t), said), "not wired");
  await pause(400);
  ok("what she says appears as she speaks", (await body()).includes("I got up at six"), (await body()).slice(-200));
  await clickText("Lepkhre");
  await pause(500);

  ok("round two starts, with less time",
     (await page.$eval(".clock", e => e.textContent)) === String(ROUNDS[1]),
     await page.$eval(".clock", e => e.textContent));
  ok("and it is the same talk, not a new one", /nanggi numit/i.test(await body()), (await body()).slice(0, 200));

  // round 2: same words, shorter window -> higher rate
  await clickText("Ngangbiyu"); await pause(500);
  await page.evaluate(t => window.__speak(t), said);
  await pause(300); await clickText("Lepkhre"); await pause(500);
  // round 3
  await clickText("Ngangbiyu"); await pause(500);
  await page.evaluate(t => window.__speak(t), said);
  await pause(300); await clickText("Lepkhre"); await pause(700);

  ok("after three rounds it finishes", /Loire/.test(await body()), (await body()).slice(0, 200));
  const rates = await page.$$eval(".rate b", els => els.map(e => Number(e.textContent)));
  ok("it shows a rate for each round", rates.length === 3, JSON.stringify(rates));
  ok("the same words in less time is a higher rate", rates[2] > rates[0], JSON.stringify(rates));
  ok("it tells her how much faster she got", /% henna yangna/.test(await body()), (await body()).slice(-260));
  console.log("\n  measured words-per-minute across the three rounds: " + rates.join("  →  "));

  await clickText("Makha tana");
  await pause(500);
  const done = await page.evaluate(() => JSON.parse(localStorage.getItem("haiyu.progress.v1") ?? "{}"));
  ok("finishing the drill is recorded", Boolean(done.done && done.done.fluency), JSON.stringify(done.done));

  console.log("\n" + log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
