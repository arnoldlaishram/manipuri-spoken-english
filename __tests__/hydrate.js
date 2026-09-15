// Loads the REAL built page from the running server, hydrates it in jsdom,
// and drives it the way she would. Speech APIs are stubbed; everything else
// is the actual app.
const { JSDOM } = require("jsdom");
const { ReadableStream, WritableStream, TransformStream } = require("node:stream/web");
const path = require("path");
// Read the real level count rather than hard-coding it, so adding a level does
// not fail a test that has nothing to do with the change.
const Mod = require("module"), origResolve = Mod._resolveFilename, buildRoot = path.resolve(".test-build");
Mod._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(buildRoot, q.slice(2)); return origResolve.call(this, q, ...a); };
const LEVEL_COUNT = require(path.join(buildRoot, "content/levels.js")).LEVELS.length;

const BASE = "http://localhost:8765";
const log = [];
const step = (n, f) => { try { f(); log.push("  ok   " + n); } catch (e) { log.push("FAIL   " + n + "  ::  " + e.message); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

let SAY = "";
const store = {};

(async () => {
  const html = await (await fetch(BASE + "/")).text();
  const errs = [];

  const dom = new JSDOM(html, {
    url: BASE + "/",
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
    beforeParse(w) {
      // jsdom predates these; React 19's client runtime needs them.
      w.ReadableStream = ReadableStream;
      w.WritableStream = WritableStream;
      w.TransformStream = TransformStream;
      w.TextEncoder = TextEncoder;
      w.TextDecoder = TextDecoder;
      w.Element.prototype.scrollIntoView = () => {};
      w.speechSynthesis = { cancel(){}, speak(){}, getVoices: () => [], addEventListener(){}, removeEventListener(){} };
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      w.SpeechRecognition = function () {
        this.start = () => setTimeout(() => {
          const r = [{ transcript: SAY, confidence: 1 }]; r.isFinal = true;
          this.onresult && this.onresult({ resultIndex: 0, results: [r] });
          this.onend && this.onend();
        }, 0);
        this.stop = () => {}; this.abort = () => {};
      };
      w.navigator.permissions = { query: async () => ({ state: "granted", onchange: null }) };
      w.navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => [{ stop(){} }] }) };
      // jsdom has no fetch; forward to the real server.
      w.fetch = (u, o) => fetch(String(u).startsWith("http") ? u : BASE + u, o);
      Object.defineProperty(w, "localStorage", { value: {
        getItem: k => (k in store ? store[k] : null),
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; },
      }, configurable: true });
      w.addEventListener("error", e => errs.push(String(e.error?.stack || e.message)));
      w.console.error = (...a) => errs.push("console.error: " + a.join(" "));
    },
  });

  const w = dom.window, d = w.document;
  const txt = () => d.body.textContent.replace(/\s+/g, " ").trim();
  const click = (el, what) => {
    if (!el) throw new Error("nothing to click: " + (what || "?") + " — screen: " + txt().slice(0, 180));
    el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  };
  const byText = (sel, s) => [...d.querySelectorAll(sel)].find(e => e.textContent.includes(s));

  await wait(4500);   // let the chunks load and React hydrate

  step("the app hydrated", () => { if (!d.querySelector("button.level-head")) throw new Error(txt().slice(0, 200)); });
  step("resume card appears after mount", () => { if (!txt().includes("Ngasigi tamjaba")) throw new Error(txt().slice(0, 200)); });
  step("every level in content/levels.ts is listed", () => { const n = d.querySelectorAll("button.level-head").length; if (n !== LEVEL_COUNT) throw new Error("listed=" + n + " expected=" + LEVEL_COUNT); });
  step("level 1 is open by default for a new learner", () => { if (!d.querySelector(".steps")) throw new Error("no steps shown"); });
  // With no API key the conversation features are switched off, not broken.
  // The question button STAYS — she has to be able to learn that it exists —
  // and it explains itself when tapped.
  step("the question button is present even with Claude off",
    () => { if (!d.querySelector(".askhead")) throw new Error("button missing"); });
  step("a quiet note says conversation practice is off", () => {
    if (!txt().includes("Conversation practice is switched off")) throw new Error(txt().slice(-260)); });
  step("no alarming error banner", () => { if (d.querySelector(".banner")) throw new Error("banner shown"); });

  // collapse / expand a level
  const heads = [...d.querySelectorAll("button.level-head")];
  step("level 4 header is clickable", () => click(heads[3], "level 4")); await wait(150);
  step("opening level 4 reveals its steps", () => { if (!txt().includes("Class-ta")) throw new Error(txt().slice(0, 300)); });
  step("only one level open at a time", () => { const n = d.querySelectorAll(".steps").length; if (n !== 1) throw new Error("open=" + n); });

  // jump straight into a level-4 step — the whole point of levels
  const stepBtn = byText(".step", "Class-ta");
  step("a level-4 step is directly clickable", () => { if (!stepBtn) throw new Error("step missing"); });
  step("opening the classroom step", () => click(stepBtn, "Class-ta step")); await wait(350);
  step("jumping in opens the classroom scene", () => { if (!txt().includes("Good morning, children")) throw new Error(txt().slice(0, 250)); });

  // speak it
  SAY = "Good morning children";
  step("mic button present", () => click(d.querySelector(".mic-btn"), "mic")); await wait(350);
  step("speech is scored locally, with no Claude", () => { if (!txt().includes("Nang khanglani")) throw new Error(txt().slice(-260)); });
  step("scoring used Arnold's corrected wording", () => { if (txt().includes("khanggani")) throw new Error("old wording"); });

  // a wrong answer must be marked, not praised
  step("advance to the next phrase", () => click(byText("button", "Makha tana"), "next")); await wait(250);
  SAY = "hello";
  step("mic again", () => click(d.querySelector(".mic-btn"), "mic2")); await wait(350);
  step("a wrong answer is not praised", () => { if (txt().includes("Nang khanglani ✓")) throw new Error("falsely praised"); });
  step("missed words are underlined", () => { if (!d.querySelector(".w-miss")) throw new Error("no underline"); });

  // go home, check progress survived and was written
  step("back link works", () => click(byText("button", "Mapham pumnamak"), "back")); await wait(300);
  step("back to the level map", () => { if (!d.querySelector("button.level-head")) throw new Error("not home"); });
  step("progress was saved to localStorage", () => {
    const raw = store["haiyu.progress.v1"];
    if (!raw) throw new Error("nothing saved");
    const p = JSON.parse(raw);
    if (p.last !== "scene:school") throw new Error("last=" + p.last);
    if (!Object.keys(p.missed).length) throw new Error("misses not recorded");
  });
  step("the resume button now points at where she stopped", () => {
    if (!txt().includes("Class-ta")) throw new Error(txt().slice(0, 300));
  });

  step("no runtime errors", () => { if (errs.length) throw new Error(errs.slice(0, 2).join(" | ")); });

  console.log(log.join("\n"));
  if (errs.length) console.log("\nERRORS:\n" + errs.slice(0, 5).join("\n"));
  const fails = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - fails) + "/" + log.length + " checks passed");
  process.exit(fails ? 1 : 0);
})();
