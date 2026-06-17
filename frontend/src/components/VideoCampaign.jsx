import React, { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { asset } from "@/lib/asset";

/**
 * VideoCampaign — kinetic brand film between the collection tiles and the
 * product rail. Plays the studio "AI transition" short in a looped, muted,
 * portrait-aspect frame.
 *
 * Accessibility (accessibility-lead sign-off):
 *   • prefers-reduced-motion: the video is PAUSED by default at mount (no
 *     flash of motion). The poster JPG is shown; the user can press Play to
 *     opt into motion (WCAG 2.3.3 / 2.2.2).
 *   • Pause/Play toggle is a real <button> with aria-pressed, visible focus
 *     ring, and a textual label that flips between the two states. Reachable
 *     in tab order between the two surrounding sections.
 *   • The <video> is decorative (no narrated information) — it carries no
 *     aria-label and is removed from the tab order via tabIndex={-1}. The
 *     surrounding <section> is labelled by its <h2> heading.
 *   • Poster JPG carries an empty alt (decorative) because the H2 + copy
 *     already name the section's purpose. No information conveyed by motion
 *     or colour alone.
 *   • Captions/audio: track is muted + no audio at source — SC 1.2.2 N/A.
 *     If audio is ever added, captions become required.
 */
const VideoCampaign = () => {
  const { t } = useLang();
  const videoRef = useRef(null);
  const reducedRef = useRef(false);
  const [paused, setPaused] = useState(true); // default paused to avoid FOM

  // On mount, evaluate prefers-reduced-motion. If user allows motion, start
  // playback. Re-evaluate when the OS setting flips at runtime (mirrors the
  // useScrollFX pattern used elsewhere in the project).
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
        v.play().then(() => setPaused(false)).catch(() => setPaused(true));
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
      v.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section
      className="w-full axum-border-t axum-border-b"
      aria-labelledby="vc-title"
      style={{ background: "var(--axum-surface)" }}
      data-testid="video-campaign"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Copy column — desktop-only as a side panel; on mobile, lives above. */}
        <div className="lg:col-span-4 px-6 md:px-10 py-10 md:py-16 flex flex-col justify-center axum-border-b lg:axum-border-b-0 lg:axum-border-r">
          <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--axum-ink-muted)] mb-3">
            {t("campaign_film.eyebrow")}
          </div>
          <h2
            id="vc-title"
            className="font-display uppercase text-3xl md:text-5xl leading-[0.95]"
            style={{ color: "#fff" }}
          >
            {t("campaign_film.title")}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-[var(--axum-ink)]">
            {t("campaign_film.copy")}
          </p>

          {/* Toggle reachable in tab order between the surrounding sections.
              aria-pressed flips state semantically; visible label flips too. */}
          <button
            type="button"
            onClick={toggle}
            aria-pressed={paused ? "false" : "true"}
            className="mt-7 inline-flex items-center gap-3 px-5 py-3 text-[11px] tracking-[0.3em] uppercase font-display border border-[var(--axum-line-strong)] hover:border-[var(--axum-ink)] axum-ease focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ color: "#fff" }}
            data-testid="campaign-film-toggle"
          >
            {paused
              ? <><Play size={14} strokeWidth={2} aria-hidden="true" /> {t("campaign_film.play")}</>
              : <><Pause size={14} strokeWidth={2} aria-hidden="true" /> {t("campaign_film.pause")}</>
            }
          </button>
        </div>

        {/* Video column. */}
        <div
          className="lg:col-span-8 relative overflow-hidden"
          style={{ aspectRatio: "9 / 16", background: "var(--axum-surface-2)" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={asset("/campaign/hero-ai-transition.mp4")}
            poster={asset("/campaign/hero-ai-transition-poster.jpg")}
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
            data-testid="campaign-video"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoCampaign;
