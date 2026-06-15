import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ScrollRevealText — premium scroll-triggered character reveal (GSAP 3 +
 * ScrollTrigger). Two variants:
 *   • "typewriter" — clean left-to-right reveal with a blinking terminal cursor.
 *   • "premium"    — staggered 3D reveal (y + scale + rotateX) with a per-char
 *     glow pulse and a faint glitch jitter, plus the cursor.
 *
 * Robustness for this app: product/hero content mounts asynchronously and grows
 * the document AFTER the heading's ScrollTrigger is created, which would leave
 * its start/end pixel coordinates stale. We therefore refresh ScrollTrigger once
 * layout has settled (next frame + window `load`) and on any later body resize.
 * A safety-net timeout also force-reveals the heading if a trigger never fires,
 * so it can never sit permanently hidden (mirrors useScrollFX).
 *
 * Accessibility (accessibility-lead sign-off — 9-point checklist):
 *   1. The semantic element (default <h2>) keeps a REAL accessible name: an
 *      sr-only copy of the text (lines joined with SPACES) lives inside it, and
 *      the per-char visual layer is aria-hidden. AT reads the heading once,
 *      normally — never letter-by-letter. (1.3.1 / 4.1.2 / 2.4.6)
 *   2. prefers-reduced-motion → no split, no cursor, no timeline. We render the
 *      plain visible text and react to the OS toggle flipping mid-session. (2.3.3)
 *   3. The text always ends fully visible — the safety net force-reveals anything
 *      still hidden after the reveal window. No stuck opacity:0 heading.
 *   4. Cursor blinks ONLY during the (sub-5s) reveal, then stops — satisfying
 *      2.2.2 without a pause control. aria-hidden, absent under reduced motion.
 *   5. Blink cadence ~1.1Hz; glow/glitch never approach the 3-flash threshold. (2.3.1)
 *   6. Inter-word spaces are real text nodes (not inline-block glyphs) so
 *      copy/select and find-in-page stay intact. (1.3.1)
 *   7. Clean re-split leaves exactly one sr-only name + one aria-hidden visual
 *      container; no orphaned cursor or stale nodes.
 *   8. Solid-color glyphs (glow is a shadow AROUND the text, never a lightening
 *      fill) so large-text 3:1 contrast holds at every frame. (1.4.3)
 *   9. Cursor / glow elements are never focusable.
 *
 * Props:
 *   as        — semantic tag for the heading element (default "h2").
 *   lines     — array of strings; each becomes a visual line (<br> equivalent).
 *   variant   — "premium" (default) | "typewriter".
 *   cursor    — show the terminal cursor (default true).
 *   className — classes for the heading element (your existing styles).
 *   ...rest   — forwarded to the heading element (e.g. data-testid).
 */
const ScrollRevealText = ({
  as: Tag = "h2",
  lines = [],
  variant = "premium",
  cursor = true,
  className = "",
  ...rest
}) => {
  const rootRef = useRef(null);
  const visualRef = useRef(null);
  const accessibleName = lines.join(" ");
  // Re-run the whole effect when the text content changes (e.g. EN/RU toggle).
  const textKey = lines.join("");

  useEffect(() => {
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ctx = null;
    let cursorEl = null;
    let charSpans = [];
    let safetyId = null;
    let rafId = null;
    let onLoad = null;
    let resizeObs = null;
    let onFocusIn = null;

    const clearVisual = () => {
      if (ctx) {
        ctx.revert(); // kills the timeline + ScrollTrigger AND removes inline styles
        ctx = null;
      }
      if (safetyId) {
        clearTimeout(safetyId);
        safetyId = null;
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (onLoad) {
        window.removeEventListener("load", onLoad);
        onLoad = null;
      }
      if (resizeObs) {
        resizeObs.disconnect();
        resizeObs = null;
      }
      if (onFocusIn) {
        root.removeEventListener("focusin", onFocusIn);
        onFocusIn = null;
      }
      charSpans = [];
      cursorEl = null;
      visual.innerHTML = "";
    };

    // Plain, static render — used under reduced motion (and as the SSR/default).
    const renderPlain = () => {
      clearVisual();
      lines.forEach((line) => {
        const lineEl = document.createElement("span");
        lineEl.className = "srt-line";
        lineEl.textContent = line;
        visual.appendChild(lineEl);
      });
    };

    // Build per-char spans (spaces stay as real text nodes) + animate on scroll.
    const renderAnimated = () => {
      clearVisual();

      lines.forEach((line) => {
        const lineEl = document.createElement("span");
        lineEl.className = "srt-line";
        for (const ch of line) {
          if (ch === " ") {
            lineEl.appendChild(document.createTextNode(" "));
            continue;
          }
          const span = document.createElement("span");
          span.className = "srt-char";
          span.textContent = ch;
          lineEl.appendChild(span);
          charSpans.push(span);
        }
        visual.appendChild(lineEl);
      });

      if (cursor) {
        cursorEl = document.createElement("span");
        cursorEl.className = "srt-cursor";
        cursorEl.setAttribute("aria-hidden", "true");
        visual.appendChild(cursorEl);
      }

      if (!charSpans.length) return;

      const startTyping = () => visual.classList.add("srt-typing");
      const stopTyping = () => visual.classList.remove("srt-typing");

      const forceRevealHidden = () => {
        charSpans.forEach((s) => {
          if (parseFloat(getComputedStyle(s).opacity) < 0.99) {
            gsap.set(s, {
              opacity: 1, yPercent: 0, y: 0, scale: 1, rotateX: 0, x: 0, "--srt-glow": 0,
            });
          }
        });
      };

      ctx = gsap.context(() => {
        const fromVars =
          variant === "typewriter"
            ? { opacity: 0, y: 6, scale: 0.98 }
            : { opacity: 0, yPercent: 60, scale: 0.8, rotateX: -55, "--srt-glow": 1 };

        gsap.set(charSpans, { ...fromVars, transformOrigin: "50% 100%" });

        const tl = gsap.timeline({
          // Triggered by scroll; reverses when scrolled back up (both directions).
          scrollTrigger: {
            trigger: root,
            start: "top 85%",
            end: "top 45%",
            toggleActions: "play none none reverse",
          },
          onStart: startTyping,
          onComplete: stopTyping,
          // Scrolled back up → heading re-hides: stop the cursor so it never
          // blinks while parked off-screen. The next downward scroll re-fires
          // onStart and re-blinks. (WCAG 2.2.2)
          onReverseComplete: stopTyping,
        });

        if (variant === "typewriter") {
          tl.to(charSpans, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.18,
            ease: "power2.out",
            stagger: { each: 0.045, from: "start" },
          });
        } else {
          tl.to(charSpans, {
            opacity: 1,
            yPercent: 0,
            scale: 1,
            rotateX: 0,
            "--srt-glow": 0,
            duration: 0.62,
            ease: "back.out(1.7)",
            stagger: { each: 0.04, from: "start" },
          });
          // Faint, brief glitch jitter on the leading edge — well under any flash
          // threshold, fully inside the sub-5s reveal window.
          tl.fromTo(
            charSpans,
            { x: () => gsap.utils.random(-2.5, 2.5) },
            {
              x: 0,
              duration: 0.18,
              ease: "power1.inOut",
              stagger: { each: 0.04, from: "start" },
            },
            0
          );
        }

        // Keyboard safety: if focus lands inside the (aria-hidden) heading
        // region, reveal immediately so nothing meaningful is hidden behind focus.
        onFocusIn = () => {
          tl.play();
          stopTyping();
          forceRevealHidden();
        };
        root.addEventListener("focusin", onFocusIn);

        // Safety net: the heading must never sit permanently hidden — if a
        // trigger never fires (or the cursor would somehow blink past 5s),
        // stop typing and force-reveal anything still hidden. (WCAG 2.2.2 / a11y #3)
        safetyId = setTimeout(() => {
          stopTyping();
          forceRevealHidden();
        }, 5000);
      }, root);

      // Async content above the heading grows the document after init, so the
      // trigger's start/end can be stale. Refresh once layout has settled and
      // whenever the body resizes (late product grids, image loads, font swap).
      const refresh = () => ScrollTrigger.refresh();
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(refresh);
      });
      onLoad = refresh;
      window.addEventListener("load", onLoad, { once: true });
      if ("ResizeObserver" in window) {
        resizeObs = new ResizeObserver(() => ScrollTrigger.refresh());
        resizeObs.observe(document.body);
      }
    };

    const apply = () => (mq.matches ? renderPlain() : renderAnimated());
    apply();

    const onMqChange = () => apply();
    mq.addEventListener("change", onMqChange);

    return () => {
      mq.removeEventListener("change", onMqChange);
      clearVisual();
    };
  }, [textKey, variant, cursor, lines]);

  return (
    <Tag ref={rootRef} className={`srt-root ${className}`} {...rest}>
      <span className="sr-only">{accessibleName}</span>
      <span ref={visualRef} aria-hidden="true" className="srt-visual" />
    </Tag>
  );
};

export default ScrollRevealText;
