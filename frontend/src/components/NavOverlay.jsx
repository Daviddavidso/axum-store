import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Logo from "@/components/Logo";
import Crest from "@/components/Crest";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/contexts/LanguageContext";
import { COLLECTIONS, collectionHref } from "@/lib/collections";

const NavOverlay = ({ open, onClose }) => {
  const { lang, strings } = useLang();
  const navigate = useNavigate();
  const o = strings.nav_overlay;
  const asideRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Collection-led navigation (the client's reference): each collection
  // deep-links into the catalog pre-filtered to that category. `to` = SPA route
  // (navigated), `href` = in-page anchor (native scroll). Both render a real
  // <a href> so right-click / open-in-new-tab and AT semantics stay intact.
  const collectionLinks = [
    ...COLLECTIONS.map((c) => ({
      key: c.slug,
      label: c.label[lang] || c.label.en,
      to: collectionHref(lang, c),
    })),
    { key: "shop_all", label: o.shop_all, to: `/${lang}/catalog` },
  ];
  const serviceLinks = [
    { key: "customization", label: o.customization, href: "#manifesto" },
    { key: "delivery", label: o.delivery, href: "#footer" },
    { key: "contact", label: o.contact, href: "#manifesto" },
  ];

  // Activate a menu entry: SPA-navigate route links, let anchors fall through,
  // then close the overlay (focus returns to the trigger, owned by SiteHeader).
  const activate = (item) => (e) => {
    if (item.to) {
      e.preventDefault();
      navigate(item.to);
    }
    onClose();
  };

  // Dialog behaviour (modal-specialist sign-off): Escape to close, body scroll
  // lock while open, and move focus into the dialog on open. Focus RETURN to the
  // trigger is owned by SiteHeader (the trigger persists across route changes).
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the dialog. preventScroll stops the browser from scrolling
    // the off-screen-then-sliding aside into view before the transition runs.
    closeBtnRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Focus trap (WCAG 2.1.2 / 2.4.3): keep Tab / Shift+Tab inside the dialog.
  const onTrapKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const root = asideRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <div
        className={`nav-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        data-testid="nav-backdrop"
      />
      <aside
        ref={asideRef}
        className={`nav-overlay ${open ? "open" : ""} flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label={o.menu_title}
        onKeyDown={onTrapKeyDown}
        data-testid="nav-overlay"
        inert={!open ? true : undefined}
      >
        <div className="flex items-center justify-between px-8 py-6 axum-border-b">
          <span className="flex items-center gap-2 text-[var(--axum-ink)]">
            <Crest size={22} />
            <Logo tone="white" height={22} />
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center axum-ease hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
            aria-label="Close menu"
            data-testid="close-nav-button"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col overflow-y-auto" aria-label={o.menu_title}>
          <h2 className="px-8 pt-6 pb-2 text-[10px] tracking-[0.32em] uppercase text-[var(--axum-ink-muted)]">
            {o.group_collections}
          </h2>
          {collectionLinks.map((l, i) => (
            <a
              key={l.key}
              href={l.to || l.href}
              onClick={activate(l)}
              className="group flex items-center justify-between px-8 py-4 md:py-5 axum-border-b axum-ease hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
              data-testid={`nav-link-${l.key}`}
            >
              <span className="font-display uppercase text-2xl md:text-3xl tracking-tighter leading-none">
                {l.label}
              </span>
              <span className="text-xs tracking-[0.32em] opacity-50 group-hover:opacity-100">
                0{i + 1}
              </span>
            </a>
          ))}

          <h2 className="px-8 pt-7 pb-2 text-[10px] tracking-[0.32em] uppercase text-[var(--axum-ink-muted)]">
            {o.group_service}
          </h2>
          {serviceLinks.map((l) => (
            <a
              key={l.key}
              href={l.href}
              onClick={activate(l)}
              className="group flex items-center px-8 py-3.5 axum-border-b axum-ease hover:bg-black hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black"
              data-testid={`nav-link-${l.key}`}
            >
              <span className="font-display uppercase text-base md:text-lg tracking-[0.06em] leading-none">
                {l.label}
              </span>
            </a>
          ))}
        </nav>

        {/* Language switch — mobile users had no way to change RU/EN (the header
            toggle is desktop-only). Grouped + labelled so AT users know what the
            EN/RU buttons control; closes the menu after switching. */}
        <div className="px-8 py-5 axum-border-t flex items-center gap-3">
          <span className="opacity-60 text-xs tracking-[0.25em] uppercase">{o.language}</span>
          <div role="group" aria-label={o.language}>
            <LanguageToggle scrolled onNavigate={onClose} />
          </div>
        </div>

        <div className="px-8 py-8 axum-border-t flex flex-col gap-3 text-xs tracking-[0.25em] uppercase">
          <div className="opacity-60">{o.atelier}</div>
          <div className="flex gap-5">
            <a href="#manifesto" className="axum-link" data-testid="nav-newsletter">{o.newsletter}</a>
            <a
              href="https://www.instagram.com/axum.tm/"
              target="_blank"
              rel="noopener noreferrer"
              className="axum-link"
              data-testid="nav-instagram"
            >
              <span className="sr-only">AXUM </span>{o.instagram}
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> {strings.a11y.opens_new_tab}</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavOverlay;
