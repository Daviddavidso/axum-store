import React from "react";
import { ChevronDown } from "lucide-react";
import { asset } from "@/lib/asset";
import { useLang } from "@/contexts/LanguageContext";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";

/**
 * HeroSlider — the full-screen homepage hero. A single portrait studio photo
 * (hero-dsc04992, 2560×3200 / 4:5) of a model on a pale off-white backdrop.
 * Because the source is a tall portrait shown in a landscape full-screen box,
 * it is cropped with object-cover object-top so the model's face stays in frame
 * rather than being letterboxed. (accessibility-lead sign-off.)
 *
 *   • Responsive <img> with srcset across the 1280/1920/2560w renders + sizes
 *     ="100vw"; intrinsic 2560×3200 width/height reserves the box → no CLS.
 *     LCP: eager + fetchPriority high.
 *   • The alt describes the full look (garment, gloves, socks) so nothing
 *     meaningful is lost to the object-cover crop (WCAG 1.1.1).
 *   • Scroll cue sits on its own near-black plate so its white text and its
 *     focus ring both clear 3:1 over the pale artwork at any viewport.
 *   • No entrance animation; the scroll-cue bob is already gated behind
 *     prefers-reduced-motion in CSS (.scroll-cue).
 */
const HeroSlider = () => {
  const { t } = useLang();
  const { scrollTo } = useSmoothScroll();

  // Keep href="#shop" as the no-JS fallback; when JS is on, route through the
  // global Lenis controller so the scroll honours the sticky-header offset and
  // moves keyboard focus to <section id="shop"> in sync (WCAG 2.4.3 / 2.4.11).
  const onShopCue = (e) => {
    e.preventDefault();
    scrollTo("#shop", { focusId: "shop" });
  };

  return (
    <section
      className="relative w-full h-screen overflow-hidden axum-border-b bg-[#efefed]"
      data-testid="hero-slider"
    >
      {/* Art-directed responsive hero: desktop gets the landscape wave-frame
          campaign photo; mobile (≤640px) gets the portrait magenta zine-poster.
          Single concise alt — WCAG 1.1.1 expects the alternative to convey the
          same PURPOSE across breakpoints (here: the AXUM campaign hero). We
          don't describe specific garments/poses because they differ per source. */}
      <picture>
        <source
          media="(max-width: 640px)"
          srcSet={asset("/campaign/hero-axum-mobile.jpg")}
          width="1152"
          height="1728"
        />
        <img
          src={asset("/campaign/hero-axum-2.jpg")}
          alt={t("hero.alt")}
          width="2560"
          height="1082"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover object-center"
          data-testid="hero-image"
        />
      </picture>

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
