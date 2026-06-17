import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Pause, Play } from "lucide-react";
import { asset } from "@/lib/asset";
import { useLang } from "@/contexts/LanguageContext";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";

/**
 * HeroSlider — full-screen homepage hero. Now a brand-film VIDEO of the
 * studio "AI-transition" moment, autoplaying muted on loop. The video
 * replaces the previous static photo per client direction.
 *
 * Accessibility (accessibility-lead sign-off):
 *   • prefers-reduced-motion: video is PAUSED at mount (no FOM); poster JPG
 *     is shown. User can press Play to opt into motion (WCAG 2.2.2 / 2.3.3).
 *     Re-evaluated when the OS setting flips at runtime.
 *   • Pause/Play <button> overlays the hero; aria-pressed mirrors state, label
 *     flips ("Pause hero film" / "Play hero film"), 2px white focus ring on
 *     a near-black plate (≥13:1 against fill, AAA), reachable with Tab.
 *   • Video is decorative — tabIndex=-1, aria-hidden=true, no aria-label. The
 *     <h1 class="sr-only"> on the page already names the brand/page; the poster
 *     img also carries alt="" since the page heading owns the context.
 *   • No audio at source → SC 1.2.2 captions N/A (would be required if unmuted).
 *   • Scroll cue link is unchanged: native href fallback, JS-routed scroll
 *     when available, full focus management.
 */
const HeroSlider = () => {
  const { t } = useLang();
  const { scrollTo } = useSmoothScroll();
  const videoRef = useRef(null);
  const reducedRef = useRef(false);
  const [paused, setPaused] = useState(true); // default paused to avoid FOM

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedRef.current = mq.matches;
      if (mq.matches) {
        v.pause();
        setPaused(true);
      } else {
        const p = v.play();
        if (p && p.then) p.then(() => setPaused(false)).catch(() => setPaused(true));
        else setPaused(false);
      }
    };
    apply();
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else if (mq.addListener) mq.addListener(apply);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else if (mq.removeListener) mq.removeListener(apply);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      const p = v.play();
      if (p && p.then) p.then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
      setPaused(true);
    }
  };

  const onShopCue = (e) => {
    e.preventDefault();
    scrollTo("#shop", { focusId: "shop" });
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden axum-border-b"
      style={{ background: "var(--axum-surface-2)" }}
      data-testid="hero-slider"
    >
      {/* Brand-film video — object-cover fills the hero on any aspect ratio.
          Decorative (aria-hidden + tabIndex -1); the page's sr-only <h1>
          carries the accessible name for the page. */}
      <video
        ref={videoRef}
        src={asset("/campaign/hero-ai-transition.mp4")}
        poster={asset("/campaign/hero-ai-transition-poster.jpg")}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
        data-testid="hero-video"
      />

      {/* Pause / Play overlay — top-right with dark plate so it always reads
          over any frame (light wall or AI debris). aria-pressed + flip-label
          state. */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={paused ? "false" : "true"}
        aria-label={paused ? t("hero.play_film") : t("hero.pause_film")}
        className="absolute top-5 right-5 md:top-7 md:right-7 z-10 inline-flex items-center justify-center w-10 h-10 bg-black/70 text-white axum-ease hover:bg-black/90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        style={{ backdropFilter: "blur(6px)" }}
        data-testid="hero-video-toggle"
      >
        {paused
          ? <Play size={16} strokeWidth={2} aria-hidden="true" />
          : <Pause size={16} strokeWidth={2} aria-hidden="true" />}
      </button>

      {/* Scroll cue — own near-black plate backs both the text and the focus ring */}
      <a
        href="#shop"
        onClick={onShopCue}
        className="absolute bottom-6 left-5 md:left-10 inline-flex items-center gap-2 bg-black/85 text-white font-display text-[10px] tracking-[0.4em] uppercase px-3 py-2 axum-ease focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        data-testid="hero-scroll-cue"
      >
        {t("motion.scroll_cue")}
        <ChevronDown size={16} strokeWidth={1.6} className="scroll-cue" aria-hidden="true" />
      </a>
    </section>
  );
};

export default HeroSlider;
