"use client";

/**
 * The line she is about to say, and its meaning.
 *
 * Hard rule: wherever the microphone is on screen, the BIG line is English.
 * The recogniser only understands English — showing Manipuri as the prominent
 * line made her read Manipuri aloud, which can never be recognised, and it
 * also meant an app for learning English was leading with Manipuri.
 *
 * Manipuri stays underneath as the meaning, which is what it is for.
 */
import { SayPair } from "./Say";

export function SpeakTarget({ en, mni }: { en: string; mni: string }) {
  return (
    <>
      <div className="phrase">
        <span className="words">{en}</span>
        <SayPair text={en} />
      </div>
      <div className="meaning">{mni}</div>
    </>
  );
}
