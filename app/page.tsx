"use client";

// The whole app is one screen that swaps what it shows: the level map, or
// whichever step she opened. Progress is saved on every finish, so closing
// the laptop mid-drill loses at most one exercise.

import { useEffect, useMemo, useState } from "react";
import { LEVELS, levelOf, stepId, type Step } from "@/content/levels";
import { unitByKey } from "@/content/units";
import { sceneByKey, SOON } from "@/content/scenes";
import { DAY_MODES } from "@/content/moments";
import { nextStep, resumeAt, useProgress, weakSpots } from "@/lib/progress";
import { claudeStatus } from "@/lib/claude";
import { loadRecordedAudio, useMic } from "@/lib/speech";
import { Header } from "@/components/Header";
import { Levels, stepLabel } from "@/components/Levels";
import { Drill } from "@/components/Drill";
import { MyDay } from "@/components/MyDay";
import { SceneRunner } from "@/components/SceneRunner";
import { AskDock } from "@/components/AskDock";
import { MicWall } from "@/components/Mic";
import { Review } from "@/components/Review";
import { Fluency } from "@/components/Fluency";
import { useReview } from "@/lib/review";
import { UI } from "@/content/ui";

export default function Home() {
  const { progress, ready, canSave, markDone, markOpened, markAt, addMiss, addDay } = useProgress();
  const [open, setOpen] = useState<Step | null>(null);
  const [openLevel, setOpenLevel] = useState<number | null>(null);
  const [claude, setClaude] = useState<{ ok: boolean; problem?: string }>({ ok: false });
  const { grant } = useMic();
  const { dueCount, stats, refresh } = useReview();

  useEffect(() => { void claudeStatus().then(setClaude); void loadRecordedAudio(); }, []);

  // Once progress has loaded, open the level she is actually in.
  useEffect(() => {
    if (!ready || openLevel !== null) return;
    const n = nextStep(progress);
    setOpenLevel(levelOf(stepId(n))?.n ?? 1);
  }, [ready, progress, openLevel]);

  const resume = useMemo(() => (ready ? nextStep(progress) : null), [ready, progress]);
  const weak = useMemo(() => weakSpots(progress), [progress]);
  const micBad = grant !== "unknown" && grant !== "ok";

  /**
   * Opening a step by name starts it at the beginning — clicking "Awatpa wahei"
   * must show Awatpa wahei, not drop her into the middle of it. Carrying on
   * from where she stopped is what the big button on the home screen is for.
   */
  const [resuming, setResuming] = useState(false);
  function openStep(s: Step, resume = false) {
    markOpened(stepId(s));
    setResuming(resume);
    setOpen(s);
  }
  const trackAt = (s: Step) => (i: number, total: number) => markAt(stepId(s), i, total);
  function finish(s: Step) { markDone(stepId(s)); }

  const context = describe(open);

  return (
    <>
      <div className="wrap">
        <Header tag={open ? stepLabel(open).sub : undefined} />

        {!open && (
          <>
            {micBad && <MicWall code={grant} className="banner" />}

            {ready && !canSave && (
              <div className="banner">
                <b>{UI.noSaveHead}</b>
                <div>{UI.noSaveMni}</div>
                <div className="en">{UI.noSaveEn}</div>
                {typeof window !== "undefined" && (
                  <div className="linkrow">
                    <input readOnly value={window.location.href} aria-label="Link to this page"
                      onFocus={e => e.currentTarget.select()} />
                    <button className="btn ghost" type="button"
                      onClick={() => { try { void navigator.clipboard.writeText(window.location.href); } catch {} }}>
                      {UI.copy}
                    </button>
                  </div>
                )}
              </div>
            )}

            {resume && (
              <div className="today">
                <h2>{UI.todayHeading}</h2>
                <div className="sub">{UI.todayBlurb}</div>
                <button className="bigbtn" type="button" onClick={() => openStep(resume, true)}>
                  {progress.last ? UI.resume : UI.start}
                </button>
                <div className="meaning" style={{ fontSize: 13.5, marginTop: 10 }}>
                  {UI.resumeHint}: {stepLabel(resume).title}
                </div>
              </div>
            )}

            {dueCount > 0 && (
              <button className="duecard" type="button" onClick={() => openStep({ kind: "review" })}>
                <span className="duenum">{dueCount}</span>
                <span className="duet">
                  <b>{UI.reviewTitle}</b>
                  <s>{dueCount === 1 ? UI.reviewDueOne : UI.reviewDueMany.replace("{n}", String(dueCount))}</s>
                </span>
                <span className="level-chev">→</span>
              </button>
            )}

            {stats.total > 0 && (
              <p className="lead" style={{ fontSize: 13, marginTop: 14, marginBottom: 0, opacity: .85 }}>
                {UI.reviewHeld} <b style={{ color: "var(--moss)" }}>{stats.solid}</b> / {stats.total}
              </p>
            )}

            <div className="sect">{UI.levelsHeading} <s>{UI.levelsHeadingEn}</s></div>
            <Levels
              progress={progress}
              openLevel={openLevel}
              onToggleLevel={n => setOpenLevel(openLevel === n ? null : n)}
              onOpen={openStep}
            />

            {SOON.length > 0 && (
              <>
                <div className="sect">Makha tana <s>not built yet</s></div>
                <div className="levels">
                  {SOON.map(([t, e]) => (
                    <div key={t} className="level soon">
                      <div className="level-row">
                        <span className="level-n">·</span>
                        <span className="level-t"><b>{t}</b><s>{e}</s></span>
                        <span className="step-kind">{UI.soonBadge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="lead" style={{ fontSize: 13, opacity: .8, marginTop: 26 }}>
              Voice sounding robotic? Pick a different one at the top right — or record the phrases
              yourself into <code>public/audio</code> and they play instead. See the README.
              <span className="mni-twin">{UI.voiceTipMni}</span>
            </p>
            {!claude.ok && (
              <p className="lead" style={{ fontSize: 12.5, opacity: .65, marginTop: 12 }}>
                Conversation practice is switched off in this build — role-play, free sentences,
                the day story and the question box need an API key. Everything else, including all
                the speech scoring, runs without one.
                <span className="mni-twin">{UI.claudeOffMni}</span>
              </p>
            )}
          </>
        )}

        {open?.kind === "unit" && unitByKey(open.key) && (
          <Drill
            key={open.key}
            unit={unitByKey(open.key)!}
            claudeOk={claude.ok}
            onMiss={addMiss}
            onDone={() => finish(open)}
            onExit={() => setOpen(null)}
            startAt={resuming ? resumeAt(progress, stepId(open)) : 0}
            onAt={trackAt(open)}
          />
        )}

        {open?.kind === "scene" && sceneByKey(open.key) && (
          <SceneRunner
            key={open.key}
            scene={sceneByKey(open.key)!}
            claudeOk={claude.ok}
            weak={weak}
            onMiss={addMiss}
            onDone={() => finish(open)}
            onExit={() => setOpen(null)}
            startAt={resuming ? resumeAt(progress, stepId(open)) : 0}
            onAt={trackAt(open)}
          />
        )}

        {open?.kind === "fluency" && (
          <Fluency onDone={() => { finish(open); setOpen(null); }} onExit={() => setOpen(null)} />
        )}

        {open?.kind === "review" && (
          <Review onExit={() => { refresh(); setOpen(null); }} />
        )}

        {open?.kind === "day" && (
          <MyDay
            key={open.mode}
            mode={open.mode}
            claudeOk={claude.ok}
            onTold={addDay}
            onAt={trackAt(open)}
            onDone={() => finish(open)}
            onExit={() => setOpen(null)}
          />
        )}
      </div>

      {/* Always mounted. She learns where the button lives by it always being
          in the same corner; hiding it when Claude is unreachable means she
          never discovers it at all. When it can't answer, it says so. */}
      <AskDock context={context} enabled={claude.ok} />
    </>
  );
}

/** What the Ask dock tells Claude about where she is. */
function describe(s: Step | null): string {
  if (!s) return "She is on the home screen, choosing a level.";
  if (s.kind === "unit") {
    const u = unitByKey(s.key);
    return `She is in the sentence-building section, on the pattern "${u?.titleEn}" (${u?.gistEn}). The shape is ${u?.pat}.`;
  }
  if (s.kind === "scene") {
    const sc = sceneByKey(s.key);
    return `She is practising the situation "${sc?.titleEn}" — ${sc?.blurbEn}`;
  }
  if (s.kind === "review") return "She is reviewing sentences she met on earlier days.";
  if (s.kind === "fluency") return "She is doing a timed fluency drill — the same short talk three times, with less time each round. Speed and keeping going matter here, not accuracy.";
  const m = DAY_MODES[s.mode];
  return `She is telling the story of her own day in ${m.labelEn} (${m.tense}).`;
}
