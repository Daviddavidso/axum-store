import React, { useEffect, useState } from "react";
import { asset } from "@/lib/asset";

// Module-level flag: the intro plays once per page-load session. It persists
// across react-router v7 client navigations (the module stays loaded), so the
// overlay never replays on route change (cond 4.10). A real full reload resets
// it — that is the intended "first load".
let INTRO_PLAYED = false;

/**
 * IntroOverlay — one-shot white wipe-up intro with the AXUM logo image.
 *
 * Accessibility-lead contract (cond 4.1–4.9):
 *   • aria-hidden="true" on the root → the whole subtree (wordmark included) is
 *     removed from the accessibility tree: no announcement, no competing h1.
 *   • The wordmark is a plain <span> — NOT a heading (cond 4.2).
 *   • The real page is mounted underneath and fully interactive from frame 1;
 *     this overlay is a sibling layer, not a gate (cond 4.3).
 *   • Nothing inside is focusable and there is no skip/close button, so a
 *     keyboard user Tabs straight onto the first real control underneath — that
 *     is the "skip" (cond 4.4). No focus is ever moved here.
 *   • pointer-events:none from the first frame, so clicks pass through (cond 4.5).
 *   • Self-removes on animationend, with a setTimeout fallback in case the event
 *     never fires (backgrounded tab) (cond 4.6).
 *   • Not rendered at all under prefers-reduced-motion (cond 4.8 / X1) — also
 *     covers the no-JS path (content is already visible).
 *   • Single one-shot directional wipe, never loops, never replays on SPA route
 *     change — within 2.3.1 three-flash limits (cond 4.9).
 */
const IntroOverlay = () => {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [show, setShow] = useState(() => !INTRO_PLAYED && !prefersReduced);

  useEffect(() => {
    if (!show) return undefined;
    INTRO_PLAYED = true;
    // Fallback removal slightly after the 1.15s animation, in case
    // animationend doesn't fire (e.g. tab backgrounded mid-animation).
    const t = setTimeout(() => setShow(false), 1400);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="axum-intro"
      aria-hidden="true"
      onAnimationEnd={() => setShow(false)}
      data-testid="intro-overlay"
    >
      {/* Decorative: the real header logo + sr-only <h1> already name the
          brand/page, and the whole overlay is aria-hidden → alt="". */}
      <img
        src={asset("/brand/axum-logo-black.png")}
        alt=""
        aria-hidden="true"
        className="axum-intro__logo"
        draggable={false}
      />
    </div>
  );
};

export default IntroOverlay;
