"use client";

import { useEffect, useState } from "react";
import { getVoiceURI, rankVoices, setVoice, speak } from "@/lib/speech";
import { UI } from "@/content/ui";

export function Header({ tag }: { tag?: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [uri, setUri] = useState<string>("");

  useEffect(() => {
    const load = () => {
      const list = rankVoices(window.speechSynthesis?.getVoices() ?? []);
      setVoices(list);
      setUri(getVoiceURI() ?? list[0]?.voiceURI ?? "");
    };
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);

  return (
    <header>
      <div className="mark">Hai<em>yu</em></div>
      <div className="tag">{tag ?? UI.tagline}</div>
      <div className="iconlink">
        {voices.length > 0 && (
          <>
            <select
              className="theme-btn"
              aria-label="Choose the English voice"
              value={uri}
              onChange={e => { setUri(e.target.value); setVoice(e.target.value); speak("How much is this?"); }}
            >
              {voices.map(v => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}{v.lang ? ` · ${v.lang}` : ""}
                </option>
              ))}
            </select>
            <button className="theme-btn" type="button" title="Hear this voice"
              onClick={() => speak("How much is this?")}>▶</button>
          </>
        )}
        <button
          className="theme-btn"
          type="button"
          onClick={() => {
            const cur = document.documentElement.getAttribute("data-theme");
            const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            document.documentElement.setAttribute(
              "data-theme",
              cur ? (cur === "dark" ? "light" : "dark") : sysDark ? "light" : "dark",
            );
          }}
        >
          {UI.themeBtn}
        </button>
      </div>
    </header>
  );
}
