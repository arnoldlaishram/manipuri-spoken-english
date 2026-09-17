"use client";

/**
 * A microphone, drawn rather than described.
 *
 * The button used to carry a plain dot. The learner cannot read the English
 * label on it, so the shape has to do the work: a mic means speak.
 *
 * No animation. Listening is already signalled twice — the button changes
 * colour and the label changes — and a pulsing halo on a 21px glyph read as
 * noise rather than feedback.
 */
export function MicIcon() {
  return (
    <span className="micglyph" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="9" y="2.2" width="6" height="11.2" rx="3" fill="currentColor" />
        <path d="M5.4 11.2a6.6 6.6 0 0 0 13.2 0" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" />
        <path d="M12 17.8V21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        <path d="M8.6 21h6.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    </span>
  );
}
