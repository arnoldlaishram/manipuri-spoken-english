"use client";

import { useState } from "react";
import { speak } from "@/lib/speech";

/** The ▶ / ◗ buttons. ◗ is the slow one. */
export function SayButton({ text, slow = false }: { text: string; slow?: boolean }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`icon-btn${on ? " speaking" : ""}`}
      title={slow ? "Read it slowly" : "Read it aloud"}
      aria-label={slow ? "Read aloud slowly" : "Read aloud"}
      onClick={() => { setOn(true); speak(text, { slow, onDone: () => setOn(false) }); }}
    >
      {slow ? "◗" : "▶"}
    </button>
  );
}

export function SayPair({ text }: { text: string }) {
  return (<><SayButton text={text} /><SayButton text={text} slow /></>);
}
