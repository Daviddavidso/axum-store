import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, User, ShoppingBag } from "lucide-react";
import Logo from "@/components/Logo";
import LanguageToggle from "@/components/LanguageToggle";
import NavOverlay from "@/components/NavOverlay";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

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
  const { count, setDrawerOpen } = useCart();

  useEffect(() => {
    if (variant !== "transparent") return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const isTransparent = variant === "transparent" && !scrolled;
  const onColor = isTransparent ? "#fff" : "#000";

  const headerStyle = {
    background: isTransparent ? "transparent" : "rgba(255,255,255,0.94)",
    backdropFilter: isTransparent ? "none" : "blur(8px)",
    borderBottom: isTransparent ? "1px solid transparent" : "1px solid #000",
  };

  const iconBtnCls = "axum-ease p-1.5 hover:opacity-70 relative";
  const iconStyle = { color: onColor, mixBlendMode: isTransparent ? "difference" : "normal" };

  const navItem = "axum-link";

  return (
    <>
      <header
        className="fixed top-[34px] left-0 right-0 z-50 grid grid-cols-3 items-center px-5 md:px-8 py-3.5 axum-ease"
        style={headerStyle}
        data-testid="site-header"
      >
        {/* LEFT — center nav */}
        <div
          className="hidden md:flex items-center gap-6 lg:gap-8 justify-self-start"
          style={{ color: onColor, mixBlendMode: isTransparent ? "difference" : "normal" }}
        >
          <button onClick={() => navigate(`/${lang}/catalog`)} className={navItem} data-testid="nav-shop">{t("nav.shop")}</button>
          <button onClick={() => navigate(`/${lang}/catalog?new=1`)} className={navItem} data-testid="nav-new">{t("nav.new")}</button>
          <button onClick={() => { navigate(`/${lang}`); setTimeout(() => { const el = document.getElementById("lookbook"); el && el.scrollIntoView({ behavior: "smooth" }); }, 100); }} className={navItem} data-testid="nav-collections">{t("nav.collections")}</button>
        </div>
        <div className="md:hidden flex items-center" style={iconStyle}>
          <button onClick={() => setNavOpen(true)} className="axum-ease p-1.5" aria-label="Open menu" data-testid="mobile-menu-btn">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>

        {/* CENTER — logo */}
        <a
          href={`/${lang}`}
          onClick={(e) => { e.preventDefault(); navigate(`/${lang}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="flex items-center justify-self-center"
          aria-label="AXUM home"
          data-testid="logo"
        >
          <Logo height={isTransparent ? 34 : 24} />
        </a>

        {/* RIGHT — icons */}
        <div className="flex items-center gap-2 md:gap-4 justify-self-end" style={iconStyle}>
          <button className={iconBtnCls} aria-label="Search" data-testid="header-search" onClick={() => alert(t("header.search_soon"))}>
            <Search size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className={`${iconBtnCls} flex items-center gap-1`}
            aria-label="Open cart"
            data-testid="header-bag"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="text-[11px] tracking-[0.18em] font-display tabular-nums" data-testid="bag-count">
              ({count})
            </span>
          </button>
          <div className="hidden md:flex items-center ml-1">
            <LanguageToggle scrolled={!isTransparent} />
          </div>
          <button
            onClick={() => setNavOpen(true)}
            className={`${iconBtnCls} hidden md:inline-flex`}
            aria-label="Open menu"
            data-testid="open-nav-button"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <NavOverlay open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
};

export default SiteHeader;
