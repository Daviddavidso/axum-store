import { useEffect } from "react";

/**
 * useScrollFX — IAMGIA-style scroll motion, built accessibility-first.
 *
 * Powers two effects from a single, centralised place:
 *   • `.reveal`         — fade + translate-in as elements enter the viewport
 *   • `[data-parallax]` — gentle, capped vertical parallax on scroll
 *
 * Accessibility guarantees (see accessibility-lead checklist):
 *   1. prefers-reduced-motion: reduce  → no effects armed, content stays
 *      visible & static. We also re-evaluate when the OS setting changes
 *      mid-session via matchMedia's `change` event.
 *   2. Progressive enhancement — the hidden/animated CSS only applies under
 *      `html.js-ready`, which we add ONLY when motion is allowed AND
 *      IntersectionObserver exists. No-JS / no-IO / reduced-motion users get
 *      the fully visible layout (`.reveal` defaults to opacity:1).
 *   3. Keyboard safety — if focus lands inside a not-yet-revealed block, it is
 *      revealed immediately so focus never sits on an invisible element.
 *   4. Safety net — any element still hidden a few seconds after arming is
 *      force-revealed, guarding against an observer that never fires.
 *
 * Parallax magnitude is capped (default ±56px) to stay vestibular-safe.
 *
 * Pass a deps array (e.g. [lang, productCount]) so the hook re-scans the DOM
 * after content that mounts asynchronously.
 */
export default function useScrollFX(deps = []) {
  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let io = null;
    let scrollHandler = null;
    let rafId = null;
    let cleanups = [];

    const reveal = (el) => el.classList.add("in");

    const teardown = () => {
      if (io) io.disconnect();
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (rafId) cancelAnimationFrame(rafId);
      cleanups.forEach((fn) => fn());
      cleanups = [];
      io = null;
      scrollHandler = null;
      rafId = null;
      // Remove `js-ready` from <html> so any subsequent page that does NOT mount
      // useScrollFX (e.g. /catalog, /product) sees the default `.reveal`
      // (opacity:1) CSS — otherwise products on those pages would stay stuck at
      // opacity:0 with no observer running to add `.in`. (Catalog blank-page fix.)
      root.classList.remove("js-ready");
    };

    const arm = () => {
      const reduced = mq.matches;
      const ioSupported = "IntersectionObserver" in window;

      // Reduced motion OR no IntersectionObserver: show everything, animate nothing.
      if (reduced || !ioSupported) {
        root.classList.remove("js-ready");
        document.querySelectorAll(".reveal").forEach(reveal);
        return;
      }

      root.classList.add("js-ready");

      // Elements driven by the scroll observer: `.reveal` (fade/translate or
      // word-mask headings) and `.wipe` (clip-path image reveal). Both are
      // triggered by adding `.in`.
      const REVEAL_SEL = ".reveal:not(.in), .wipe:not(.in)";

      // ---- Reveal on scroll ----
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              reveal(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      const observeReveal = (el) => {
        if (el.classList.contains("in")) return;
        io.observe(el);
        // Keyboard safety: reveal on focus so focus never lands on a hidden element.
        const onFocusIn = () => reveal(el);
        el.addEventListener("focusin", onFocusIn);
        cleanups.push(() => el.removeEventListener("focusin", onFocusIn));
      };

      document.querySelectorAll(REVEAL_SEL).forEach(observeReveal);

      // ---- Magnetic CTAs (cond 2) — pointer-only, fine-pointer, <=8px ----
      // Disabled entirely under reduced motion (we already returned above) and
      // on touch/coarse pointers. Handlers are passive: they never preventDefault
      // or interfere with click / Enter / Space activation (cond 2.7).
      const finePointer =
        window.matchMedia &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const wireMagnetic = (el) => {
        if (!finePointer || el.dataset.magWired === "1") return;
        el.dataset.magWired = "1";
        el.classList.add("magnetic");
        const MAX = 8; // px — cond 2.2, do not raise
        const onMove = (e) => {
          const r = el.getBoundingClientRect();
          const mx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2 || 1);
          const my = (e.clientY - (r.top + r.height / 2)) / (r.height / 2 || 1);
          const cx = Math.max(-1, Math.min(1, mx));
          const cy = Math.max(-1, Math.min(1, my));
          el.style.transform = `translate(${(cx * MAX).toFixed(1)}px, ${(cy * MAX).toFixed(1)}px)`;
        };
        const reset = () => { el.style.transform = ""; }; // spring back to origin (cond 2.3)
        el.addEventListener("pointermove", onMove, { passive: true });
        el.addEventListener("pointerleave", reset);
        el.addEventListener("blur", reset, true);
        cleanups.push(() => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", reset);
          el.removeEventListener("blur", reset, true);
          el.style.transform = "";
          el.classList.remove("magnetic");
          delete el.dataset.magWired;
        });
      };
      document.querySelectorAll("[data-magnetic]").forEach(wireMagnetic);

      // Content such as the product grid mounts asynchronously — it is fetched
      // and rendered AFTER this effect first runs. Watch the DOM so those late
      // `.reveal` nodes get observed too; otherwise they would never intersect
      // through the observer and would stay stuck at opacity:0 forever.
      const mo = new MutationObserver((mutations) => {
        for (const m of mutations) {
          m.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches(REVEAL_SEL)) observeReveal(node);
            if (node.matches && node.matches("[data-magnetic]")) wireMagnetic(node);
            if (node.querySelectorAll) {
              node.querySelectorAll(REVEAL_SEL).forEach(observeReveal);
              node.querySelectorAll("[data-magnetic]").forEach(wireMagnetic);
            }
          });
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());

      // Safety net: force-reveal anything still hidden a few seconds after
      // arming. Re-querying at fire time (rather than a snapshot) means this
      // also rescues late-mounted content if the observer never fired for it.
      const safety = setTimeout(
        () => document.querySelectorAll(REVEAL_SEL).forEach(reveal),
        2600
      );
      cleanups.push(() => clearTimeout(safety));

      // ---- Parallax ----
      const pxEls = Array.from(document.querySelectorAll("[data-parallax]"));
      if (pxEls.length) {
        const CAP = 56; // px — vestibular-safe ceiling
        let ticking = false;
        const update = () => {
          const vh = window.innerHeight || 1;
          pxEls.forEach((el) => {
            const speed = parseFloat(el.dataset.parallax) || 0.12;
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const offset = (center - vh / 2) / vh; // ~ -1..1 across the viewport
            let py = -offset * speed * vh;
            py = Math.max(-CAP, Math.min(CAP, py));
            el.style.setProperty("--py", py.toFixed(1) + "px");
          });
          ticking = false;
        };
        scrollHandler = () => {
          if (!ticking) {
            ticking = true;
            rafId = requestAnimationFrame(update);
          }
        };
        window.addEventListener("scroll", scrollHandler, { passive: true });
        update();
      }
    };

    arm();

    // Re-evaluate if the user flips the OS reduced-motion setting at runtime.
    const onChange = () => {
      teardown();
      arm();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange); // older Safari

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
