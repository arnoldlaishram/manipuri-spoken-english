// Drives the app in a REAL Chrome, with a fake microphone that plays audio.
// This is the only way to find out what actually happens when she taps.
const puppeteer = require("puppeteer");

const BASE = process.env.BASE || "http://localhost:8765";

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox", "--disable-setuid-sandbox",
      "--use-fake-ui-for-media-stream",        // auto-accept the mic prompt
      "--use-fake-device-for-media-stream",    // a synthetic microphone
      ...(process.env.FAKE_AUDIO ? [`--use-file-for-fake-audio-capture=${process.env.FAKE_AUDIO}`] : []),
      "--autoplay-policy=no-user-gesture-required",
    ],
  });
  const page = await browser.newPage();
  const ctx = browser.defaultBrowserContext();
  await ctx.overridePermissions(new URL(BASE).origin, ["microphone"]);

  const console_ = [];
  page.on("console", m => console_.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", e => console_.push("pageerror: " + e.message));

  await page.goto(BASE + "/", { waitUntil: "networkidle2" });

  // --- what does this browser actually have? ---
  const caps = await page.evaluate(() => ({
    secureContext: window.isSecureContext,
    origin: location.origin,
    framed: window.self !== window.top,
    hasSR: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    hasGUM: Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    policyMic: (() => {
      const p = document.permissionsPolicy || document.featurePolicy;
      try { return p && p.allowsFeature ? p.allowsFeature("microphone") : "n/a"; } catch { return "threw"; }
    })(),
  }));
  console.log("environment:");
  for (const [k, v] of Object.entries(caps)) console.log(`  ${k.padEnd(16)} ${v}`);

  const perm = await page.evaluate(async () => {
    try { return (await navigator.permissions.query({ name: "microphone" })).state; }
    catch (e) { return "query threw: " + e.name; }
  });
  console.log(`  ${"permission".padEnd(16)} ${perm}`);

  // --- does getUserMedia work at all? ---
  const gum = await page.evaluate(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      const n = s.getTracks().length;
      s.getTracks().forEach(t => t.stop());
      return "ok, tracks=" + n;
    } catch (e) { return e.name + ": " + e.message; }
  });
  console.log(`  ${"getUserMedia".padEnd(16)} ${gum}`);

  // --- the real question: what does SpeechRecognition DO? ---
  console.log("\nSpeechRecognition, raw:");
  const events = await page.evaluate(() => new Promise(resolve => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return resolve([{ ev: "no constructor" }]);
    const r = new Ctor();
    const seen = [];
    const t0 = Date.now();
    const mark = (ev, extra) => seen.push({ ev, at: Date.now() - t0, ...(extra || {}) });
    r.lang = "en-IN"; r.interimResults = true; r.maxAlternatives = 3; r.continuous = false;
    r.onstart = () => mark("start");
    r.onaudiostart = () => mark("audiostart");
    r.onsoundstart = () => mark("soundstart");
    r.onspeechstart = () => mark("speechstart");
    r.onresult = e => mark("result", { text: e.results[0][0].transcript });
    r.onerror = e => mark("error", { error: e.error, message: e.message });
    r.onend = () => { mark("end"); resolve(seen); };
    try { r.start(); mark("start() returned"); } catch (e) { mark("start() threw", { error: e.name }); resolve(seen); }
    setTimeout(() => resolve(seen.concat([{ ev: "TIMEOUT after 12s — still waiting" }])), 12000);
  }));
  for (const e of events) console.log("  " + JSON.stringify(e));

  // --- now the actual app: tap the button and watch the UI ---
  console.log("\nthe app, when she taps 'Haiyu — say it':");
  await page.evaluate(() => localStorage.removeItem("haiyu.progress.v1"));
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector(".bigbtn", { timeout: 10000 });
  await page.click(".bigbtn");
  await page.waitForSelector(".mic-btn", { timeout: 10000 });

  const snap = async label => {
    const s = await page.evaluate(() => ({
      button: document.querySelector(".mic-btn")?.innerText.trim(),
      live: document.querySelector(".mic-btn")?.classList.contains("live"),
      note: document.querySelector(".mic-note")?.innerText.trim(),
      wall: document.querySelector(".micwall")?.innerText.replace(/\s+/g, " ").slice(0, 150) || null,
    }));
    console.log(`  [${label}] button="${s.button}" live=${s.live}`);
    console.log(`            note="${s.note}"`);
    if (s.wall) console.log(`            WALL: ${s.wall}`);
    return s;
  };

  await snap("before tap");
  await page.click(".mic-btn");
  await new Promise(r => setTimeout(r, 400));
  await snap("+0.4s");
  await new Promise(r => setTimeout(r, 2000));
  await snap("+2.4s");
  await new Promise(r => setTimeout(r, 6000));
  await snap("+8.4s");

  if (console_.length) console.log("\nconsole:\n  " + console_.slice(0, 10).join("\n  "));
  await browser.close();
})();
