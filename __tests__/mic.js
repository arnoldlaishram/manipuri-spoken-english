// Drives the REAL built app with a controllable SpeechRecognition stub, to pin
// down the "it doesn't wait for me to speak" bug and keep it fixed.
const { JSDOM } = require("jsdom");
const { ReadableStream, WritableStream, TransformStream } = require("node:stream/web");

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const step = (n, f) => { try { f(); log.push("  ok   " + n); } catch (e) { log.push("FAIL   " + n + "  ::  " + e.message); } };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const html = await (await fetch(BASE + "/")).text();
  const errs = [];
  const store = {};
  const recs = [];

  const dom = new JSDOM(html, {
    url: BASE + "/", runScripts: "dangerously", resources: "usable", pretendToBeVisual: true,
    beforeParse(w) {
      w.ReadableStream = ReadableStream; w.WritableStream = WritableStream;
      w.TransformStream = TransformStream; w.TextEncoder = TextEncoder; w.TextDecoder = TextDecoder;
      w.Element.prototype.scrollIntoView = () => {};
      w.speechSynthesis = { cancel(){}, speak(){}, getVoices: () => [], addEventListener(){}, removeEventListener(){} };
      w.SpeechSynthesisUtterance = function (t) { this.text = t; };
      // A recogniser that does NOTHING on its own — the test fires every event.
      w.SpeechRecognition = function () {
        const self = this;
        self.aborted = false; self.started = false;
        self.start = () => { self.started = true; };
        self.stop = () => { if (self.onend) self.onend(); };   // Chrome ends the session
        self.abort = () => { self.aborted = true; };
        recs.push(self);
      };
      w.navigator.permissions = { query: async () => ({ state: "granted", onchange: null }) };
      w.navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => [{ stop(){} }] }) };
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
  const click = el => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  const micBtn = () => d.querySelector(".mic-btn");
  const btnByText = t => [...d.querySelectorAll("button")].find(b => b.textContent.includes(t));
  // React controlled inputs ignore a direct .value assignment — go through the
  // native setter so the change actually reaches React.
  const typeInto = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(w.HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  };
  // Move to the next phrase the way she would: tap Next if it is there,
  // otherwise finish the stuck one by typing.
  const nextPhrase = async () => {
    if (!btnByText("Makha tana")) {
      const inp = d.querySelector("#typeIn");
      if (!inp) throw new Error("stuck with no way forward");
      typeInto(inp, "excuse me");
      click(btnByText("Thabiyu"));
      await wait(300);
    }
    click(btnByText("Makha tana"));
    await wait(350);
  };
  const finalResult = t => { const r = [{ transcript: t, confidence: 1 }]; r.isFinal = true; return { resultIndex: 0, results: [r] }; };

  await wait(4500);
  click(d.querySelector(".bigbtn"));            // start -> first scene, first phrase
  await wait(400);
  step("reached an exercise with a microphone", () => { if (!micBtn()) throw new Error(txt().slice(0, 200)); });

  // ---------- 1. the button must not claim to be listening before the mic opens
  click(micBtn()); await wait(200);
  step("a recogniser was created", () => { if (recs.length !== 1) throw new Error("recs=" + recs.length); });
  step("it was actually started", () => { if (!recs[0].started) throw new Error("start() not called"); });
  step("before the mic opens it says 'opening', not 'listening'", () => {
    const t = micBtn().textContent;
    if (!t.includes("hangdokli")) throw new Error("button says: " + t);
  });
  step("and it is not showing the live pulse yet", () => {
    if (micBtn().classList.contains("live")) throw new Error("claims live too early");
  });

  recs[0].onaudiostart(); await wait(120);
  step("once the mic opens it says so and waits", () => {
    if (!txt().includes("speak now")) throw new Error(txt().slice(-200));
  });
  step("now it shows the live pulse", () => {
    if (!micBtn().classList.contains("live")) throw new Error("not live");
  });

  // ---------- 2. a finished run leaves nothing behind to interfere
  const first = recs[0];
  click(micBtn()); await wait(250);            // tap again -> stop() -> onend, no speech
  step("stopping with no speech reports silence, not a broken mic", () => {
    if (txt().includes("never opened")) throw new Error("wrong diagnosis");
    if (!txt().includes("Eina karisu tade")) throw new Error(txt().slice(-260));
  });
  step("the button is back to its resting state", () => {
    if (micBtn().classList.contains("live")) throw new Error("still claims to be listening");
  });

  click(micBtn()); await wait(250);
  step("tapping again starts a genuinely new recogniser", () => {
    if (recs.length !== 2) throw new Error("recs=" + recs.length);
  });
  recs[1].onaudiostart(); await wait(120);
  const liveBefore = micBtn().classList.contains("live");
  if (first.onend) first.onend();              // the finished one, firing late
  await wait(200);
  step("REGRESSION: a finished recogniser firing late cannot reset the live run", () => {
    if (!liveBefore) throw new Error("the new run was not live to begin with");
    if (!micBtn().classList.contains("live")) throw new Error("the live run was reset by the old one");
  });

  // ---------- 3. speaking still works
  recs[1].onresult(finalResult("sorry can you repeat that"));
  recs[1].onend(); await wait(250);
  step("a spoken answer is transcribed and scored", () => {
    if (!txt().includes("Nang khanglani")) throw new Error(txt().slice(-260));
  });

  // ---------- 4. mic-never-opened is not reported as silence
  await nextPhrase();
  const before = recs.length;
  click(micBtn()); await wait(200);
  const r = recs[before];
  r.onend();                                  // ended with no onaudiostart at all
  await wait(300);
  // getUserMedia succeeded earlier, so the microphone provably exists. A
  // recogniser that then fails to open it must be blamed for that, and never
  // reported as a missing device or as silence.
  step("a recogniser that never opened the mic is blamed, not the mic", () => {
    const t = txt();
    if (t.includes("No microphone was found")) throw new Error("wrongly blamed the device");
    if (t.includes("Eina karisu tade")) throw new Error("wrongly reported as silence");
    if (!t.includes("speech recogniser could not open it"))
      throw new Error("no clear attribution: " + (d.querySelector(".micwall")?.textContent || "(no wall)").slice(0, 160));
  });
  step("and it offers a way out", () => {
    if (!d.querySelector(".micwall")) throw new Error("no wall");
    if (!d.querySelector("#typeIn")) throw new Error("typing not offered");
  });

  // ---------- 5. typing is a real way out, not decoration
  step("she can finish the exercise by typing when the mic is dead", async () => {});
  await nextPhrase();
  step("typing carried her past the dead microphone", () => {
    if (!micBtn()) throw new Error("did not reach the next phrase: " + txt().slice(0, 200));
  });

  // ---------- 6. a speech-service failure names itself
  const n2 = recs.length;
  click(micBtn()); await wait(200);
  recs[n2].onerror({ error: "network" }); await wait(250);
  step("a speech-service failure says so and offers typing", () => {
    if (!txt().includes("Speech service")) throw new Error(txt().slice(-280));
    if (!d.querySelector("#typeIn")) throw new Error("typing not offered");
  });

  // ---------- 7. an unknown failure still shows its code rather than shrugging
  await nextPhrase();
  const n3 = recs.length;
  click(micBtn()); await wait(200);
  recs[n3].onerror({ error: "weird-new-thing" }); await wait(250);
  step("an unrecognised failure surfaces the raw code", () => {
    if (!txt().includes("weird-new-thing")) throw new Error(txt().slice(-280));
  });

  step("no runtime errors", () => { if (errs.length) throw new Error(errs.slice(0, 2).join(" | ")); });

  console.log(log.join("\n"));
  if (errs.length) console.log("\nERRORS:\n" + errs.slice(0, 4).join("\n"));
  const fails = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - fails) + "/" + log.length + " checks passed");
  process.exit(fails ? 1 : 0);
})();
