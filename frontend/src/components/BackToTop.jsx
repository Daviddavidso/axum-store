import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";

/**
 * Floating "back to top" control (mobile complaint: "на телефоне нету кнопки вверх").
 * - Appears only after scrolling down ~600px; conditionally rendered (NOT aria-hidden)
 *   so it leaves the tab order cleanly when it disappears.
 * - On click: scrolls to top AND moves keyboard focus to <main id="top"> (WCAG 2.4.3 —
 *   move focus, not just the viewport). preventScroll keeps the focus call from
 *   fighting the smooth scroll.
 * - Honors prefers-reduced-motion (JS smooth scroll bypasses the global CSS override,
 *   so we branch the behavior explicitly).
 * - Solid black background guarantees contrast over white pages and hero imagery alike.
 * - Lifted above the md:hidden mobile bottom bar + safe-area inset via .back-to-top CSS.
 */
const BackToTop = () => {
  const { strings } = useLang();
  const { scrollTo } = useSmoothScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top AND move focus to <main id="top"> — routed through the global
  // Lenis controller (with native + reduced-motion fallback) so the smooth
  // scroll and the focus move stay in sync (WCAG 2.4.3).
  const handleClick = () => scrollTo(null, { top: true, focusId: "top" });

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={strings.a11y.back_to_top}
      data-testid="back-to-top"
      className="back-to-top fixed right-5 z-40 w-12 h-12 flex items-center justify-center bg-black text-white border border-white/20 axum-ease hover:bg-white hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black focus-visible:ring-offset-white"
    >
      <ArrowUp size={20} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
};

export default BackToTop;
