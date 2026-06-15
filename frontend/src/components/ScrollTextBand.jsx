import React, { useEffect, useRef } from "react";
import { useLang } from "@/contexts/LanguageContext";

/**
 * ScrollTextBand — a full-bleed kinetic typography band. Two giant rows of a
 * brand slogan slide horizontally in OPPOSITE directions, driven by the page's
 * scroll position (the band reacts to scrolling, it does not auto-play).
 *
 * Accessibility (accessibility-lead checklist + house patterns):
 *   • prefers-reduced-motion: reduce → NO scroll transform is armed and a CSS
 *     hard-override pins the rows static. Re-evaluated if the OS setting flips
 *     mid-session (matchMedia change). Content is fully readable when still.
 *   • Progressive enhancement: with no JS the rows render centered and static.
 *   • The slogan is exposed ONCE as the section's accessible name; the repeated
 *     visual copies are aria-hidden so a screen reader never hears it looping.
 *   • Motion is transform-only (translateX), no opacity flicker, no flashing
 *     (WCAG 2.3.1), and is user-scroll-driven so no Pause control is required
 *     (WCAG 2.2.2 — not auto-updating).
 *   • Large display text uses a grey that clears the 3:1 large-text ratio on the
 *     charcoal surface.
 */
const Row = ({ text, dir, trackRef }) => {
  // Repeat enough copies to cover the widest viewport while moving.
  const copies = Array.from({ length: 6 });
  return (
    <div className="stb-row" data-dir={dir}>
      <div className="stb-track" ref={trackRef}>
        {copies.map((_, i) => (
          <span className="stb-word" aria-hidden="true" key={i}>
            {text}
            <span className="stb-dot" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const ScrollTextBand = () => {
  const { t } = useLang();
  const line1 = t("scroll_band.line1");
  const line2 = t("scroll_band.line2");

  const sectionRef = useRef(null);
  const trackARef = useRef(null);
  const trackBRef = useRef(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = null;
    let ticking = false;
    let scrollHandler = null;

    // Translate range (px) each row sweeps across as the band crosses the
    // viewport. Rows start offset and move toward 0 → opposite signs per row.
    const RANGE = 220;

    const update = () => {
      const vh = window.innerHeight || 1;
      const rect = section.getBoundingClientRect();
      // progress: ~1 when the band enters from the bottom, ~-1 when it exits top.
      const center = rect.top + rect.height / 2;
      const progress = (center - vh / 2) / vh; // ~ +0.7 .. -0.7 while on screen
      const offset = Math.max(-1, Math.min(1, progress)) * RANGE;
      if (trackARef.current) trackARef.current.style.transform = `translate3d(${(-offset).toFixed(1)}px,0,0)`;
      if (trackBRef.current) trackBRef.current.style.transform = `translate3d(${offset.toFixed(1)}px,0,0)`;
      ticking = false;
    };

    const onScroll = () => {
      if (reducedRef.current || ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(update);
    };

    const arm = () => {
      reducedRef.current = mq.matches;
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      // Reset to the static, centered transform.
      if (trackARef.current) trackARef.current.style.transform = "";
      if (trackBRef.current) trackBRef.current.style.transform = "";
      if (mq.matches) return; // reduced motion → leave static
      scrollHandler = onScroll;
      window.addEventListener("scroll", scrollHandler, { passive: true });
      update();
    };

    arm();
    const onChange = () => arm();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="stb axum-border-t axum-border-b"
      role="group"
      aria-label={`${line1} — ${line2}`}
      data-testid="scroll-text-band"
    >
      <Row text={line1} dir="left" trackRef={trackARef} />
      <Row text={line2} dir="right" trackRef={trackBRef} />
    </section>
  );
};

export default ScrollTextBand;
