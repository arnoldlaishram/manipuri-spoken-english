// Progress must survive a refresh, and partial work must be visible.
// The complaint was: "even if I've completed a lot of steps, it never gets
// recorded... every refresh starts from the beginning."
const puppeteer = require("puppeteer");
const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 200)));

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await page.setViewport({ width: 420, height: 900 });
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);
  const pause = (ms = 420) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);
  const click = async (t, req = true) => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
    const el = h.asElement(); if (!el) { if (req) throw new Error("no button: " + t); return false; }
    await el.click(); await pause(); return true;
  };
  const answer = async () => {
    if (!(await page.$("#typeIn"))) await click("Iduna haiyu", false);
    if (await page.$("#typeIn")) { await page.type("#typeIn", "x"); await click("Thabiyu"); }
    await click("Makha tana", false);
  };
  const home = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };

  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.clear());
  await home();

  // --- answer 3 phrases of a 6-phrase scene, then walk away ---
  await click("Level 1"); await click("Awatpa wahei");
  for (let i = 0; i < 3; i++) await answer();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("haiyu.progress.v1") ?? "{}"));
  ok("partial work is written straight away", (saved.at?.["scene:escape"] ?? 0) === 3,
     JSON.stringify(saved.at));
  ok("and it records how long the step is", (saved.totals?.["scene:escape"] ?? 0) === 9,
     JSON.stringify(saved.totals));

  // --- THE COMPLAINT: refresh ---
  await home();
  const shown = await page.evaluate(() => {
    const open = [...document.querySelectorAll(".step")].map(e => e.innerText.replace(/\s+/g, " ").trim());
    return { steps: open, resume: document.body.innerText.match(/Nangna lepkhiba maphamdagi:.*/)?.[0] };
  });
  ok("after a refresh the part-done step is marked", shown.steps.some(t => /3\/9/.test(t)),
     JSON.stringify(shown.steps));
  ok("the meter shows a part-filled segment",
     await page.evaluate(() => Boolean(document.querySelector(".level-meter i em"))));
  ok("resume points at the step she was in", /Awatpa wahei/.test(shown.resume ?? ""), shown.resume);

  // --- clicking a step BY NAME opens it at the start ---
  // Clicking "Awatpa wahei" must show Awatpa wahei from the top. Dropping her
  // into the middle of a lesson she chose by name is disorienting.
  await click("Level 1"); await click("Awatpa wahei");
  const byName = await page.evaluate(() => document.querySelector(".where")?.textContent?.trim());
  ok("clicking a step by name opens it at the beginning", /1 \/ 6/.test(byName ?? ""), byName);
  await home();

  // --- the resume button is what carries her back to where she stopped ---
  await click("Makha tana chatsi");
  const resumed = await page.evaluate(() => document.querySelector(".where")?.textContent?.trim());
  ok("the resume button lands where she stopped", /4 \/ 6/.test(resumed ?? ""), resumed);

  // --- and progress keeps accumulating from there ---
  for (let i = 0; i < 3; i++) await answer();
  await home();
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("haiyu.progress.v1") ?? "{}"));
  ok("progress keeps accumulating", (after.at?.["scene:escape"] ?? 0) >= 6, JSON.stringify(after.at));

  // --- survives a full browser restart (same profile) ---
  const dump = await page.evaluate(() => localStorage.getItem("haiyu.progress.v1"));
  const p2 = await b.newPage();
  await p2.goto(BASE + "/", { waitUntil: "networkidle2" });
  const seenInNewTab = await p2.evaluate(() => localStorage.getItem("haiyu.progress.v1"));
  ok("a second tab sees the same progress", seenInNewTab === dump);
  await p2.close();

  // --- the framed case must warn rather than silently forget ---
  const f = await b.newPage();
  await f.setContent(`<iframe src="${BASE}/" width="400" height="800"></iframe>`, { waitUntil: "networkidle2" });
  await pause(2600);
  const fr = f.frames().find(x => x.url().includes(BASE));
  const framedText = fr ? await fr.evaluate(() => document.body.innerText) : "";
  ok("inside an iframe it says progress cannot be saved",
     /will not let it save anything/.test(framedText), framedText.slice(0, 200));
  await f.close();

  console.log("\n" + log.join("\n"));
  const fails = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - fails) + "/" + log.length + " checks passed");
  await b.close(); process.exit(fails ? 1 : 0);
})();
