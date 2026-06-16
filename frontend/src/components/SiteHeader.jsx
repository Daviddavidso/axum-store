import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, User, ShoppingBag } from "lucide-react";
import Logo from "@/components/Logo";
import Crest from "@/components/Crest";
import LanguageToggle from "@/components/LanguageToggle";
import NavOverlay from "@/components/NavOverlay";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useSmoothScroll } from "@/contexts/SmoothScrollContext";

/**
 * Unified site header.
 * variant="transparent" (home hero only — overlays with mix-blend)
 * variant="solid" (every other page — white background, black borders)
 */
const SiteHeader = ({ variant = "solid" }) => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef(null);
  const reducedRef = useRef(false);
  // Remember which control opened the menu so focus returns to it on close
  // (WCAG 2.4.3). The opener persists across route changes (header is global).
  const navTriggerRef = useRef(null);
  const { count, setDrawerOpen } = useCart();
  const { scrollTo } = useSmoothScroll();

  // Navigate home (if needed) then smooth-scroll to the #lookbook section via the
  // global Lenis controller — honours the sticky-header offset and falls back to
  // native scroll under reduced motion. The 100ms defer lets the home route mount
  // when coming from another page.
  const goToLookbook = () => {
    navigate(`/${lang}`);
    setTimeout(() => scrollTo("#lookbook"), 100);
  };

  const openNav = (e) => {
    navTriggerRef.current = e.currentTarget;
    setNavOpen(true);
  };
  const closeNav = () => {
    setNavOpen(false);
    const trigger = navTriggerRef.current;
    if (trigger && document.contains(trigger)) {
      trigger.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  /**
   * Smart-header animation (accessibility-lead sign-off):
   *   • ENTRANCE: one-shot slide-down + fade on first mount (data-anim/data-ready).
   *   • AUTO-HIDE: scrolling down past ~80px slides the bar up; scrolling up (or
   *     returning near the top) reveals it. rAF-throttled, user-scroll-driven
   *     (no WCAG 2.2.2 control needed — not auto-playing).
   *   • KEYBOARD SAFETY: a focusin anywhere in the header reveals it INSTANTLY
   *     (data-snap disables the transition for that one reveal) so a focused
   *     control is never left off-screen — WCAG 2.4.7 / 2.4.11.
   *   • REDUCED MOTION: under prefers-reduced-motion the bar is static and always
   *     visible — no data-anim is ever set, setHidden(true) is never called, and
   *     a CSS @media hard-override forces transform:none/opacity:1. Re-arms if the
   *     OS setting is flipped mid-session (mirrors useScrollFX).
   *   • The header stays in the DOM + tab order at all times; no aria-hidden is
   *     ever applied (it remains a reachable banner landmark).
   */
  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const SHOW_NEAR_TOP = 80;
    const DELTA = 4;
    let lastY = window.scrollY;
    let ticking = false;
    let rafId = null;
    let enterRaf = null;
    let enterTimer = null;

    const clearEntrance = () => {
      if (enterRaf) cancelAnimationFrame(enterRaf);
      if (enterTimer) clearTimeout(enterTimer);
      enterRaf = null;
      enterTimer = null;
    };

    const onScroll = () => {
      if (reducedRef.current || ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        if (y < SHOW_NEAR_TOP) {
          setHidden(false);
        } else if (y > lastY + DELTA) {
          setHidden(true); // scrolling down
        } else if (y < lastY - DELTA) {
          setHidden(false); // scrolling up
        }
        lastY = y;
        ticking = false;
      });
    };

    const setStatic = () => {
      el.removeAttribute("data-anim");
      el.removeAttribute("data-ready");
      setHidden(false);
    };

    const markReady = () => el.setAttribute("data-ready", "");

    const arm = () => {
      reducedRef.current = mq.matches;
      window.removeEventListener("scroll", onScroll);
      clearEntrance();
      if (mq.matches) {
        setStatic();
        return;
      }
      // Entrance: start state (no data-ready) is committed before paint here,
      // so the bar paints at translateY(-100%) with no up-flash; the double rAF
      // then adds data-ready to animate it down once. A setTimeout fallback
      // guarantees the bar is NEVER left stuck-hidden if rAF doesn't fire
      // (e.g. backgrounded tab) — mirrors the IntroOverlay safety net.
      el.setAttribute("data-anim", "on");
      enterRaf = requestAnimationFrame(() =>
        requestAnimationFrame(markReady)
      );
      enterTimer = setTimeout(markReady, 500);
      lastY = window.scrollY;
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    arm();

    const onChange = () => {
      window.removeEventListener("scroll", onScroll);
      arm();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else if (mq.removeListener) mq.removeListener(onChange);
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
      clearEntrance();
    };
  }, []);

  // Keyboard safety: reveal instantly (no slide) when focus enters the header,
  // so the focused control is never clipped off-screen mid-transition.
  const revealForFocus = () => {
    if (reducedRef.current) return;
    const el = headerRef.current;
    if (el) {
      el.setAttribute("data-snap", "");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => el.removeAttribute("data-snap"))
      );
    }
    setHidden(false);
  };

  const isTransparent = variant === "transparent" && !scrolled;
  // Dark theme: light-grey ink on the near-black bar (and white over the hero).
  const onColor = isTransparent ? "#fff" : "#cfcfcf";

  const headerStyle = {
    // Solid surface on inner pages — no transparency so cards never peek
    // through the bar during fast scroll. Hero variant stays clean transparent.
    background: isTransparent ? "transparent" : "var(--axum-surface)",
    backdropFilter: "none",
    borderBottom: isTransparent ? "1px solid transparent" : "1px solid #3a3a3a",
    // Force a dedicated compositing layer so the fixed header doesn't repaint
    // when the page underneath scrolls — keeps the bar buttery during inertia.
    willChange: "transform",
    transform: "translateZ(0)",
  };

  const iconBtnCls = "axum-ease p-1.5 hover:opacity-70 relative";
  const iconStyle = { color: onColor };

  const navItem = "axum-link";

  return (
    <>
      <header
        ref={headerRef}
        onFocus={revealForFocus}
        className={`fixed top-0 left-0 right-0 z-50 flex md:grid md:grid-cols-3 items-center gap-2 sm:gap-5 px-3 md:px-8 py-3.5 md:py-4 axum-ease ${hidden ? "is-hidden" : ""}`}
        style={headerStyle}
        data-testid="site-header"
      >
        {/* LEFT — center nav */}
        <div
          className="hidden md:flex items-center gap-6 lg:gap-8 justify-self-start"
          style={{ color: onColor }}
        >
          <button onClick={() => navigate(`/${lang}/catalog`)} className={navItem} data-testid="nav-shop">{t("nav.shop")}</button>
          <button onClick={() => navigate(`/${lang}/catalog?new=1`)} className={navItem} data-testid="nav-new">{t("nav.new")}</button>
          <button onClick={goToLookbook} className={navItem} data-testid="nav-collections">{t("nav.collections")}</button>
        </div>
        <div className="md:hidden flex items-center" style={iconStyle}>
          <button onClick={openNav} className="axum-ease p-1.5" aria-label="Open menu" data-testid="mobile-menu-btn">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* CENTER — crest + wordmark, LARGE. The crest is decorative
            (aria-hidden inside Crest); the link's aria-label carries the brand
            name so AT announces it once. The wordmark uses a light tone:
            "overlay" (white, mix-blend) over the hero, "white" on the solid
            dark bar. */}
        <a
          href={`/${lang}`}
          onClick={(e) => { e.preventDefault(); navigate(`/${lang}`); scrollTo(null, { top: true }); }}
          className="flex items-center md:justify-self-center ml-2 sm:ml-0"
          aria-label="AXUM home"
          data-testid="logo"
          style={{ color: onColor }}
        >
          {/* Mobile (<sm): crest BIGGER than wordmark; logo hugs the menu icon
              on the left. AXUM kept reasonably sized; cart count + EN/RU also
              fit on the right at this scale. */}
          {/* Mobile (<sm): SQUARE crest at 40 (gives a proper brand-mark feel,
              not a tall narrow sliver), wordmark 22 sits next to it with a bit
              of breathing room. Compact lang toggle on the right makes room. */}
          <span className="sm:hidden inline-flex items-center gap-1.5">
            <Crest size={isTransparent ? 44 : 40} className="shrink-0" />
            <Logo height={isTransparent ? 26 : 22} tone={isTransparent ? "overlay" : "white"} />
          </span>
          <span className="hidden sm:inline-flex items-center gap-2.5 md:gap-3">
            <Crest size={isTransparent ? 38 : 30} className="shrink-0" />
            <Logo height={isTransparent ? 40 : 32} tone={isTransparent ? "overlay" : "white"} />
          </span>
        </a>

        {/* RIGHT — icons. ml-auto on mobile pushes the right cluster to the
            edge while the logo stays left-of-center next to the menu icon. */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto md:ml-0 md:justify-self-end" style={iconStyle}>
          <button className={`${iconBtnCls} hidden sm:inline-flex`} aria-label="Search" data-testid="header-search" onClick={() => alert(t("header.search_soon"))}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`${iconBtnCls} flex items-center gap-1`}
            aria-label="Open cart"
            data-testid="header-bag"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {/* Cart count hidden on the smallest viewports — would not fit
                alongside crest + AXUM + EN/RU. Cart icon alone still works. */}
            <span className="hidden sm:inline text-[11px] tracking-[0.18em] font-display tabular-nums" data-testid="bag-count">
              ({count})
            </span>
          </button>
          {/* EN/RU visible on all viewports. On mobile sits next to the cart
              icon; the nav-menu copy is still there as a secondary fallback. */}
          <div className="flex items-center ml-0.5 md:ml-1">
            <LanguageToggle scrolled={!isTransparent} />
          </div>
          <button
            onClick={openNav}
            className={`${iconBtnCls} hidden md:inline-flex`}
            aria-label="Open menu"
            data-testid="open-nav-button"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <NavOverlay open={navOpen} onClose={closeNav} />
    </>
  );
};

export default SiteHeader;
