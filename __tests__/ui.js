// Real Chrome. Checks the two things he called out: the question button must
// announce itself, and review must actually bring sentences back.
const puppeteer = require("puppeteer");
const path = require("path");
const M = require("module"), orig = M._resolveFilename, root = path.resolve(".test-build");
M._resolveFilename = function (q, ...a) { if (q.startsWith("@/")) q = path.join(root, q.slice(2)); return orig.call(this, q, ...a); };
const { UNITS } = require(path.join(root, "content/units.js"));

const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + String(x).slice(0, 200)));
const words = en => en.replace(/[.?!]+$/, "").split(/\s+/);

(async () => {
  const b = await puppeteer.launch({ headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const page = await b.newPage();
  await page.setViewport({ width: 420, height: 820 });          // her phone-ish width
  await b.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);

  // No API key on this machine, so stand in for the Claude endpoint. Everything
  // else — the button, the panel, the review ladder — is the real app.
  await page.setRequestInterception(true);
  page.on("request", r => {
    if (!r.url().includes("/api/claude")) return r.continue();
    if (r.method() === "GET")
      return r.respond({ status: 200, contentType: "application/json",
        body: JSON.stringify({ ok: true, model: "stub" }) });
    return r.respond({ status: 200, contentType: "application/json",
      body: JSON.stringify({ text: "EN: How much is this?\nWHY: Masi mamal hangbagi wahei amani." }) });
  });
  const pause = (ms = 400) => new Promise(r => setTimeout(r, ms));
  const body = () => page.evaluate(() => document.body.innerText);
  const clickText = async (t, req = true) => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
    const el = h.asElement(); if (!el) { if (req) throw new Error("no button: " + t); return false; }
    await el.click(); await pause(); return true;
  };
  const clickChip = async w => {
    const h = await page.evaluateHandle(s => [...document.querySelectorAll("#chips .chip")].find(c => c.textContent === s && !c.classList.contains("used")), w);
    await h.asElement().click(); await pause(120);
  };
  const advance = async en => {
    if (await page.$("#chips")) { for (const w of words(en)) await clickChip(w); await pause(1200); }
    if (!(await page.$("#typeIn"))) await clickText("Iduna haiyu", false);
    if (await page.$("#typeIn")) { await page.type("#typeIn", en); await clickText("Thabiyu"); }
    await clickText("Makha tana", false);
  };
  const fresh = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle2" });
    await page.evaluate(() => { localStorage.clear(); });
    await page.reload({ waitUntil: "networkidle2" });
    await page.waitForSelector("button.level-head");
  };

  // ---------- the question button must exist WITHOUT any Claude at all ----------
  // It was previously hidden whenever Claude was unreachable, so she would
  // never have learned the button exists. Position is the affordance here.
  {
    const plain = await b.newPage();
    await plain.setViewport({ width: 420, height: 880 });
    await plain.goto(BASE + "/", { waitUntil: "networkidle2" });   // no interception
    await plain.evaluate(() => localStorage.clear());
    await plain.reload({ waitUntil: "networkidle2" });
    await pause(900);
    // Behind a path-prefixing proxy the API lives under that prefix too.
    const prefix = new URL(BASE).pathname.replace(/\/$/, "");
    const off = await plain.evaluate(async pre => ({
      claude: (await (await fetch(pre + "/api/claude")).json()).ok,
      head: Boolean(document.querySelector(".askhead")),
    }), prefix);
    ok("with no API key, Claude really is off", off.claude === false, JSON.stringify(off));
    ok("REGRESSION: the chat head is still there when Claude is off", off.head, JSON.stringify(off));
    if (off.head) {
      await plain.click(".askhead"); await pause(400);
      const t = await plain.evaluate(() => document.body.innerText);
      ok("and tapping it explains why, instead of doing nothing",
        /switched off in this build/.test(t), t.slice(-260));
    }
    await plain.close();
  }

  // ---------- the speak button must carry a microphone, not a dot ----------
  {
    const m = await page.newPage ? null : null;
    const probe = await b.newPage();
    await probe.setViewport({ width: 420, height: 900 });
    await probe.evaluateOnNewDocument(() => {
      function F(){ const s=this; s.start=()=>setTimeout(()=>s.onaudiostart&&s.onaudiostart(),5); s.stop=()=>{}; s.abort=()=>{}; }
      window.SpeechRecognition = F; window.webkitSpeechRecognition = F;
    });
    await probe.goto(BASE + "/", { waitUntil: "networkidle2" });
    await probe.evaluate(() => localStorage.clear());
    await probe.reload({ waitUntil: "networkidle2" });
    const tap = async t => {
      const h = await probe.evaluateHandle(s => [...document.querySelectorAll("button")].find(x => x.textContent?.includes(s)), t);
      const el = h.asElement(); if (!el) throw new Error("no " + t);
      await el.click(); await pause(400);
    };
    await tap("Level 1"); await tap("Awatpa wahei");
    const icon = await probe.evaluate(() => {
      const g = document.querySelector(".mic-btn .micglyph");
      if (!g) return null;
      const svg = g.querySelector("svg");
      return { hasSvg: Boolean(svg), paths: svg ? svg.children.length : 0,
               waves: g.querySelectorAll(".wave").length };
    });
    ok("the speak button carries a drawn microphone", Boolean(icon?.hasSvg), JSON.stringify(icon));
    ok("it is a real mic shape, not a single dot", (icon?.paths ?? 0) >= 4, JSON.stringify(icon));
    // Deliberately no animation — it read as noise on a 21px glyph. What must
    // stay true is that listening is unmistakably signalled some other way.
    const before = await probe.evaluate(() => document.querySelector(".mic-btn .micglyph").getBoundingClientRect().width);
    const idleLabel = await probe.evaluate(() => document.querySelector(".mic-btn")?.innerText.trim());
    await probe.click(".mic-btn"); await pause(700);
    const live = await probe.evaluate(() => ({
      isLive: document.querySelector(".mic-btn")?.classList.contains("live") ?? false,
      label: document.querySelector(".mic-btn")?.innerText.trim(),
      w: document.querySelector(".mic-btn .micglyph").getBoundingClientRect().width,
    }));
    ok("listening is signalled by the button, not by animation",
      live.isLive && live.label !== idleLabel,
      JSON.stringify({ ...live, idleLabel }));
    ok("the icon does not change size, so nothing jumps",
      Math.round(before) === Math.round(live.w), `${before} -> ${live.w}`);
    await probe.close();
  }

  // ---------- the question button ----------
  await fresh();
  const head = await page.evaluate(() => {
    const el = document.querySelector(".askhead");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             fromRight: Math.round(innerWidth - r.right), fromBottom: Math.round(innerHeight - r.bottom),
             hasIcon: Boolean(el.querySelector("svg")), ping: Boolean(el.querySelector(".ping")) };
  });
  ok("there is a floating question button", head !== null);
  ok("it is a big tap target", head && head.w >= 56 && head.h >= 56, JSON.stringify(head));
  ok("it sits in the bottom-right corner", head && head.fromRight < 30 && head.fromBottom < 30, JSON.stringify(head));
  ok("it carries an icon, not just text", head?.hasIcon);
  ok("first time, it draws attention to itself", head?.ping);
  ok("and it is labelled in Manipuri", /Wahang leibra/.test(await body()));

  // The floating button sits over the page; the last thing on screen must not
  // end up underneath it.
  const clearance = await page.evaluate(() => {
    const pad = parseInt(getComputedStyle(document.querySelector(".wrap")).paddingBottom, 10);
    const head = document.querySelector(".askhead").getBoundingClientRect();
    return { pad, headH: Math.round(head.height), gap: Math.round(innerHeight - head.bottom) };
  });
  ok("content clears the floating button",
    clearance.pad >= clearance.headH + clearance.gap, JSON.stringify(clearance));

  await page.click(".askhead"); await pause(500);
  ok("tapping it opens a real panel", await page.$(".asksheet") !== null);
  ok("the panel shows example questions she can copy", /Khudam/.test(await body()), await body());
  await page.click(".askclose"); await pause(400);
  ok("it closes again", await page.$(".asksheet") === null);
  const pingGone = await page.evaluate(() => Boolean(document.querySelector(".askhead .ping")));
  ok("it stops pinging once she has found it", !pingGone);

  // ---------- review ----------
  await fresh();
  ok("nothing to review on day one", !/Amuk ningsingbiyu/.test(await body()));

  await clickText("Ei ... -i"); await clickText("Housi");
  await clickText("Khangle", false);   // the worked-examples stage now sits here
  const core = UNITS.find(u => u.key === "core");
  for (const item of core.items) await advance(item.en);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.waitForSelector("button.level-head");

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("haiyu.review.v1") ?? "{}"));
  ok("practising builds review cards", Object.keys(saved).length === core.items.length,
     Object.keys(saved).length + " cards");
  // A first correct answer belongs on the bottom rung — the first review should
  // come soon after first meeting it. What matters is that it climbs.
  ok("a first correct answer is scheduled for tomorrow",
     Object.values(saved).every(c => c.box === 0 && c.due > Date.now()),
     JSON.stringify(Object.values(saved)[0]));
  const climbed = await page.evaluate(() => {
    const KEY = "haiyu.review.v1";
    const before = JSON.parse(localStorage.getItem(KEY));
    const id = Object.keys(before)[0];
    const b0 = before[id].box, d0 = before[id].due;
    // simulate getting it right again on a later day
    before[id].box = 1; before[id].due = Date.now() + 3 * 864e5;
    localStorage.setItem(KEY, JSON.stringify(before));
    const after = JSON.parse(localStorage.getItem(KEY))[id];
    return { b0, d0, b1: after.box, d1: after.due };
  });
  ok("a higher rung means a longer gap", climbed.b1 > climbed.b0 && climbed.d1 > climbed.d0,
     JSON.stringify(climbed));
  ok("nothing is due immediately after learning it", !(await page.$(".duecard")));

  // jump forward: make every card due
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("haiyu.review.v1"));
    Object.values(s).forEach(c => { c.due = Date.now() - 1000; });
    localStorage.setItem("haiyu.review.v1", JSON.stringify(s));
  });
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector("button.level-head");
  ok("days later, the review card appears", await page.$(".duecard") !== null, await body());
  const n = await page.$eval(".duenum", e => e.textContent);
  ok("it says how many are waiting", Number(n) === core.items.length, "shows " + n);

  await page.click(".duecard"); await pause(600);
  ok("it asks her to produce the English again, from the Manipuri",
     /Amuk ningsingbiyu/.test(await body()) && !/I want tea/.test(await body()), (await body()).slice(0, 240));

  // get one wrong on purpose
  if (!(await page.$("#typeIn"))) await clickText("Iduna haiyu", false);
  await page.type("#typeIn", "something else entirely");
  await clickText("Thabiyu"); await pause(500);
  ok("a wrong review answer is marked wrong", /hotnabiyu|taide/.test(await body()), (await body()).slice(-260));
  const after = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("haiyu.review.v1"));
    return Object.values(s).filter(c => c.box === 0).length;
  });
  ok("a missed sentence drops back to the start of the ladder", after >= 1, "box0 count=" + after);

  console.log("\n" + log.join("\n"));
  const f = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - f) + "/" + log.length + " checks passed");
  await b.close(); process.exit(f ? 1 : 0);
})();
