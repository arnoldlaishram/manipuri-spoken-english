const puppeteer = require("puppeteer");
const BASE = process.env.BASE || "http://localhost:8765";
const log = [];
const ok = (n, c, x = "") => log.push((c ? "  ok   " : "FAIL   ") + n + (c ? "" : "  ::  " + x));

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox",
           "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const page = await browser.newPage();
  await browser.defaultBrowserContext().overridePermissions(new URL(BASE).origin, ["microphone"]);
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  page.on("console", m => { if (m.type() === "error") errs.push(m.text()); });

  // ---- the diagnostic page ----
  await page.goto(BASE + "/check", { waitUntil: "networkidle2" });
  ok("/check loads", await page.$(".btn") !== null);
  await page.click(".btn");
  await page.waitForSelector("pre", { timeout: 25000 });
  const report = await page.$eval("pre", e => e.innerText);
  ok("/check reports getUserMedia", /getUserMedia: OK/.test(report), report.slice(0, 120));
  ok("/check logs the recognition events", /speech recognition/.test(report));
  ok("/check gives a verdict", /verdict:/.test(report), report.slice(-200));
  console.log("\n--- what /check says on THIS machine ---");
  console.log(report.split("\n").filter(l =>
    /^(secureContext|insideAnotherPage|SpeechRecognition|MediaRecorder|permission|getUserMedia|audioInputsFound|verdict)/.test(l)
  ).map(l => "  " + l).join("\n"));
  console.log("  recognition events:");
  console.log(report.split("\n").filter(l => /ms  /.test(l)).map(l => "   " + l.trim()).join("\n"));

  // ---- the app itself ----
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await page.evaluate(() => localStorage.removeItem("haiyu.progress.v1"));
  await page.reload({ waitUntil: "networkidle2" });
  await page.waitForSelector(".bigbtn");
  await page.click(".bigbtn");
  await page.waitForSelector(".mic-btn");
  await page.click(".mic-btn");
  await new Promise(r => setTimeout(r, 1500));

  const ui = await page.evaluate(() => ({
    note: document.querySelector(".mic-note")?.textContent?.trim(),
    wall: document.querySelector(".micwall")?.innerText.replace(/\s+/g, " ") ?? null,
    hasRecorder: Boolean([...document.querySelectorAll("button")].find(b => b.textContent?.includes("Record"))),
    hasTyping: Boolean(document.querySelector("#typeIn")),
  }));
  console.log("\n--- the app after a failed recognition attempt ---");
  console.log("  note:     " + ui.note);
  console.log("  wall:     " + (ui.wall ?? "none").slice(0, 130));
  console.log("  recorder: " + ui.hasRecorder + "   typing: " + ui.hasTyping);

  ok("it no longer claims the microphone is missing", !/No microphone was found/.test(ui.wall ?? ""), ui.wall ?? "");
  ok("it blames the recogniser, which is what actually failed",
     /speech recogniser could not open it/.test(ui.wall ?? ""), ui.wall ?? "");
  ok("the note agrees with the wall instead of still saying 'tap then speak'",
     !/Namduna, adudagi wangna haiyu/.test(ui.note ?? ""), ui.note ?? "");
  ok("she is offered a recorder", ui.hasRecorder);
  ok("she is offered typing", ui.hasTyping);

  // ---- can she actually record and move on? ----
  const recBtn = await page.evaluateHandle(() =>
    [...document.querySelectorAll("button")].find(b => b.textContent?.includes("Record toubiyu")));
  await recBtn.asElement()?.click();
  await new Promise(r => setTimeout(r, 1200));
  const recording = await page.evaluate(() =>
    Boolean([...document.querySelectorAll("button")].find(b => b.textContent?.includes("Leppiyu"))));
  ok("recording starts", recording);
  const stopBtn = await page.evaluateHandle(() =>
    [...document.querySelectorAll("button")].find(b => b.textContent?.includes("Leppiyu")));
  await stopBtn.asElement()?.click();
  await new Promise(r => setTimeout(r, 1200));
  const played = await page.evaluate(() =>
    Boolean([...document.querySelectorAll("button")].find(b => b.textContent?.includes("Nangna haiba"))));
  ok("she can play her own recording back", played);
  const nextBtn = await page.evaluateHandle(() =>
    [...document.querySelectorAll("button")].find(b => b.textContent?.includes("Makha tana")));
  await nextBtn.asElement()?.click();
  await new Promise(r => setTimeout(r, 900));
  ok("recording carries her to the next phrase", await page.$(".mic-btn") !== null);

  ok("no runtime errors", errs.filter(e => !/404/.test(e)).length === 0, errs.slice(0, 2).join(" | "));

  console.log("\n" + log.join("\n"));
  const fails = log.filter(l => l.startsWith("FAIL")).length;
  console.log("\n" + (log.length - fails) + "/" + log.length + " checks passed");
  await browser.close();
  process.exit(fails ? 1 : 0);
})();
