import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

/**
 * SmoothScrollContext — global Lenis inertial smooth scroll, accessibility-first.
 *
 * accessibility-lead sign-off (this session). Guardrails enforced here:
 *  1. prefers-reduced-motion: reduce  → Lenis is NEVER instantiated; the browser's
 *     native scroll is used. Re-evaluated live on the OS `change` event so flipping
 *     the setting mid-session destroys/re-arms the instance (mirrors useScrollFX).
 *  2. The perpetual RAF loop is cancelled and `lenis.destroy()` is called on
 *     unmount AND on every reduced-motion toggle — no leaked loops or listeners.
 *  3. Lenis runs in default window/body mode (no transformed wrapper), so the
 *     fixed header, back-to-top button and every :focus-visible ring render
 *     natively (WCAG 2.4.7). Lenis's own stylesheet sets
 *     `html.lenis-smooth { scroll-behavior: auto !important }`, neutralising the
 *     global `html { scroll-behavior: smooth }` only while Lenis is live.
 *  4. NO keydown handler — native keyboard scrolling (Space, PageUp/Down, Home,
 *     End, arrows) is never intercepted (WCAG 2.1.1).
 *  5. `scrollTo(...)` is the single entry point for every PROGRAMMATIC scroll on
 *     the site (back-to-top, #shop cue, logo→top, collections→#lookbook). It
 *     routes through `lenis.scrollTo` when active and falls back to native
 *     `window.scrollTo` / `scrollIntoView` otherwise, and ALWAYS moves keyboard
 *     focus to the destination (preventScroll) so the viewport and focus never
 *     desync (WCAG 2.4.3). A header `offset` keeps targets clear of the sticky
 *     bar (WCAG 2.4.11) since Lenis ignores CSS scroll-padding.
 */

// Keep in sync with index.css `scroll-padding-top: 84px` (sticky header clearance).
const HEADER_OFFSET = 84;

const SmoothScrollContext = createContext(null);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function SmoothScrollProvider({ children }) {
  // Holds the live Lenis instance, or null when reduced-motion / unmounted.
  const lenisRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let rafId = null;

    const start = () => {
      if (mq.matches) return; // honour reduced motion — native scroll only
      const lenis = new Lenis({
        duration: 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 3), // gentle ease-out cubic
        smoothWheel: true,
        // touch left on native — coarse pointers get the OS scroll they expect
        syncTouch: false,
      });
      lenisRef.current = lenis;
      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenisRef.current) lenisRef.current.destroy();
      lenisRef.current = null;
      rafId = null;
    };

    start();

    // Re-evaluate if the user flips the OS reduced-motion setting at runtime.
    const onChange = () => {
      stop();
      start();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange); // older Safari

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
      stop();
    };
  }, []);

  /**
   * Programmatic scroll + focus move. Pass `top: true` to go to page top.
   * `focusId` / `focusEl` names the element to receive keyboard focus.
   */
  const scrollTo = useCallback(
    (target, { offset = HEADER_OFFSET, top = false, focusId, focusEl } = {}) => {
      const lenis = lenisRef.current;
      const reduce = prefersReducedMotion();

      if (lenis) {
        lenis.scrollTo(top ? 0 : target, { offset: top ? 0 : -offset });
      } else {
        // Native fallback (reduced motion or Lenis not yet armed).
        if (top) {
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        } else {
          const el =
            typeof target === "string" ? document.querySelector(target) : target;
          if (el)
            el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        }
      }

      // Move keyboard focus to the destination so AT cursor + viewport stay in
      // sync (WCAG 2.4.3). preventScroll stops the focus call fighting the scroll.
      const fEl =
        focusEl ||
        (focusId ? document.getElementById(focusId) : null) ||
        (top ? document.getElementById("top") : null);
      if (fEl) {
        // Defer one frame so the element exists/settled before focusing.
        requestAnimationFrame(() => fEl.focus({ preventScroll: true }));
      }
    },
    []
  );

  return (
    <SmoothScrollContext.Provider value={{ scrollTo, lenisRef }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

/**
 * useSmoothScroll — consume the global scroll controller. Safe to call outside
 * the provider: returns a native-fallback `scrollTo` so components never crash.
 */
export function useSmoothScroll() {
  const ctx = useContext(SmoothScrollContext);
  if (ctx) return ctx;
  // Defensive fallback (e.g. a component rendered outside the provider in tests).
  return {
    lenisRef: { current: null },
    scrollTo: (target, opts = {}) => {
      const reduce = prefersReducedMotion();
      if (opts.top) {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else {
        const el =
          typeof target === "string" ? document.querySelector(target) : target;
        if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }
      const fEl =
        opts.focusEl ||
        (opts.focusId ? document.getElementById(opts.focusId) : null) ||
        (opts.top ? document.getElementById("top") : null);
      if (fEl) requestAnimationFrame(() => fEl.focus({ preventScroll: true }));
    },
  };
}

export default SmoothScrollContext;
