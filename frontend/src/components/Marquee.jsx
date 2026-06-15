import React, { useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

/**
 * Auto-scrolling brand ticker.
 *
 * WCAG 2.2.2 (Pause, Stop, Hide): because the text loops indefinitely it does
 * NOT qualify for the 5-second exception, so a control is required. We provide:
 *   • an explicit Pause/Play <button> (keyboard-operable, aria-pressed),
 *   • pause on hover and on keyboard focus (CSS: .marquee:hover/:focus-within),
 *   • a full stop under prefers-reduced-motion (CSS) — the text shows statically.
 * The text also exists as plain DOM text so a screen reader reads it once; the
 * duplicated copy used for the seamless loop is aria-hidden.
 */
const Marquee = () => {
  const { strings, t } = useLang();
  const [paused, setPaused] = useState(false);
  const text = strings.marquee.join("   ·   ");

  return (
    <div
      className={`marquee relative w-full bg-black text-white axum-border-b overflow-hidden ${paused ? "is-paused" : ""}`}
      data-testid="marquee"
    >
      <div className="marquee-track py-3 md:py-4">
        <span className="font-display uppercase tracking-[0.25em] text-sm px-6">{text}</span>
        <span className="font-display uppercase tracking-[0.25em] text-sm px-6" aria-hidden="true">{text}</span>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? t("motion.marquee_play") : t("motion.marquee_pause")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-black/70 text-white axum-ease hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        data-testid="marquee-toggle"
      >
        {paused ? <Play size={16} strokeWidth={1.8} /> : <Pause size={16} strokeWidth={1.8} />}
      </button>
    </div>
  );
};

export default Marquee;
