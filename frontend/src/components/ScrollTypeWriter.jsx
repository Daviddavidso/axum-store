import React, { useEffect, useRef } from "react";

/**
 * ScrollTypeWriter — scroll-driven character reveal ("typewriter on scroll").
 *
 * As the user scrolls the surrounding <section> through the viewport, the
 * headline reveals character by character. Progress is one-way (monotonic),
 * so scrolling back up never un-reveals what has already been read.
 *
 * Accessibility contract (accessibility-lead sign-off, this session):
 *   1. Semantic name intact — an sr-only copy of the FULL text is inside the
 *      heading element from first paint. The visual per-char layer is
 *      aria-hidden. AT reads the heading once, normally. (1.3.1 / 4.1.2)
 *   2. prefers-reduced-motion → no per-char split, no reveal animation; the
 *      heading renders as plain static text. Re-evaluated live on OS toggle.
 *   3. Visibility / find-in-page / tab safety:
 *        - Tabbing into the surrounding <section> (e.g. the newsletter input)
 *          immediately reveals all chars (section-level focusin delegation).
 *        - Cmd/Ctrl+F (find-in-page) immediately reveals all chars.
 *        - visibilitychange to hidden reveals all chars so coming back to the
 *          tab never lands on a half-revealed state.
 *   4. Safety net — anything still hidden 2.6s after arming is force-revealed,
 *      so the heading can never sit permanently invisible (mirrors useScrollFX).
 *   5. No layout shift — invisible chars still occupy their layout boxes
 *      (opacity:0), so the box dimensions of the heading are stable.
 *   6. No focusable nodes added, no live region, no announcements.
 *   7. Final visible text uses the inherited color (no token override),
 *      keeping the existing contrast unchanged. (1.4.3)
 */
const ScrollTypeWriter = ({
  as: Tag = "h2",
  lines = [],
  className = "",
  ...rest
}) => {
  const rootRef = useRef(null);
  const visualRef = useRef(null);
  const accessibleName = lines.join(" ");
  const textKey = lines.join("|");

  useEffect(() => {
    const root = rootRef.current;
    const visual = visualRef.current;
    if (!root || !visual) return undefined;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Section-level focus delegation: the heading itself has no focusables,
    // but tabbing into the input/submit BELOW the heading must also reveal it.
    const section = root.closest("section") || root.parentElement || root;
    let charSpans = [];
    let rafId = null;
    let safetyId = null;
    let cleanups = [];
    // Monotonic clamp — once a char is revealed it stays revealed; scrolling
    // back never un-reveals. Reads less twitchy than full two-way scrub.
    let monotonicProgress = 0;

    const teardown = () => {
      cleanups.forEach((fn) => fn());
      cleanups = [];
      if (rafId) cancelAnimationFrame(rafId);
      if (safetyId) clearTimeout(safetyId);
      rafId = null;
      safetyId = null;
    };

    const renderPlain = () => {
      visual.innerHTML = "";
      lines.forEach((line, li) => {
        const lineEl = document.createElement("span");
        lineEl.className = "stw-line";
        lineEl.textContent = line;
        visual.appendChild(lineEl);
        if (li < lines.length - 1)
          visual.appendChild(document.createElement("br"));
      });
      charSpans = [];
    };

    const renderAnimated = () => {
      visual.innerHTML = "";
      charSpans = [];
      lines.forEach((line, li) => {
        const lineEl = document.createElement("span");
        lineEl.className = "stw-line";
        for (const ch of line) {
          if (ch === " ") {
            // Real text node between words → preserves copy/select + find.
            lineEl.appendChild(document.createTextNode(" "));
            continue;
          }
          const span = document.createElement("span");
          span.className = "stw-char";
          span.textContent = ch;
          lineEl.appendChild(span);
          charSpans.push(span);
        }
        visual.appendChild(lineEl);
        if (li < lines.length - 1)
          visual.appendChild(document.createElement("br"));
      });
    };

    const revealUpTo = (n) => {
      const c = Math.max(0, Math.min(charSpans.length, n));
      for (let i = 0; i < c; i++) {
        if (!charSpans[i].classList.contains("shown")) {
          charSpans[i].classList.add("shown");
        }
      }
    };

    const revealAll = () => revealUpTo(charSpans.length);

    const compute = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as section's top reaches viewport bottom; 1 once section top crosses
      // ~30% from viewport top — typing is complete before the reader passes.
      const raw = (vh - rect.top) / (vh * 0.7);
      const p = Math.max(0, Math.min(1, raw));
      if (p > monotonicProgress) {
        monotonicProgress = p;
        revealUpTo(Math.ceil(p * charSpans.length));
      }
    };

    const arm = () => {
      teardown();
      monotonicProgress = 0;

      if (mq.matches) {
        renderPlain();
        return;
      }

      renderAnimated();
      if (!charSpans.length) return;

      // Passive scroll/resize driver — rAF throttled, mirrors useScrollFX.
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        rafId = requestAnimationFrame(() => {
          compute();
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });
      compute();

      // Tab-into safety — section-level focusin, so the form input/submit
      // below the heading also triggers reveal.
      const onFocusIn = () => revealAll();
      section.addEventListener("focusin", onFocusIn);
      cleanups.push(() => section.removeEventListener("focusin", onFocusIn));

      // Find-in-page (Cmd/Ctrl+F) — opacity:0 chars are still in the DOM and
      // findable, but reveal them so the visible match isn't invisible.
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === "f" || e.key === "F")) {
          revealAll();
        }
      };
      window.addEventListener("keydown", onKey);
      cleanups.push(() => window.removeEventListener("keydown", onKey));

      // visibilitychange → reveal everything when tab hides, so returning to
      // the tab never lands on a half-revealed heading.
      const onVis = () => {
        if (document.visibilityState !== "visible") revealAll();
      };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() =>
        document.removeEventListener("visibilitychange", onVis)
      );

      // Safety net — never leave the heading permanently hidden.
      safetyId = setTimeout(revealAll, 2600);
    };

    arm();

    const onMqChange = () => arm();
    if (mq.addEventListener) mq.addEventListener("change", onMqChange);
    else if (mq.addListener) mq.addListener(onMqChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onMqChange);
      else if (mq.removeListener) mq.removeListener(onMqChange);
      teardown();
    };
  }, [textKey, lines]);

  return (
    <Tag ref={rootRef} className={`stw-root ${className}`} {...rest}>
      <span className="sr-only">{accessibleName}</span>
      <span ref={visualRef} aria-hidden="true" className="stw-visual" />
    </Tag>
  );
};

export default ScrollTypeWriter;
