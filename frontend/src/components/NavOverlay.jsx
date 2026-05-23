import React from "react";
import { X } from "lucide-react";
import Logo from "@/components/Logo";
import { useLang } from "@/contexts/LanguageContext";

const NavOverlay = ({ open, onClose }) => {
  const { t, strings } = useLang();
  const o = strings.nav_overlay;
  const links = [
    { label: o.women, href: "#shop", key: "women" },
    { label: o.editorial, href: "#lookbook", key: "editorial" },
    { label: o.archive, href: "#lookbook", key: "archive" },
    { label: o.stores, href: "#footer", key: "stores" },
    { label: o.contact, href: "#manifesto", key: "contact" },
  ];

  return (
    <>
      <div
        className={`nav-backdrop ${open ? "open" : ""}`}
        onClick={onClose}
        data-testid="nav-backdrop"
      />
      <aside
        className={`nav-overlay ${open ? "open" : ""} flex flex-col`}
        role="dialog"
        aria-hidden={!open}
        data-testid="nav-overlay"
      >
        <div className="flex items-center justify-between px-8 py-6 axum-border-b">
          <Logo tone="black" height={26} />
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center axum-ease hover:bg-black hover:text-white"
            aria-label="Close menu"
            data-testid="close-nav-button"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col">
          {links.map((l, i) => (
            <a
              key={l.key}
              href={l.href}
              onClick={onClose}
              className="group flex items-center justify-between px-8 py-5 md:py-6 axum-border-b axum-ease hover:bg-black hover:text-white"
              data-testid={`nav-link-${l.key}`}
            >
              <span className="font-display uppercase text-3xl md:text-4xl tracking-tighter leading-none">
                {l.label}
              </span>
              <span className="text-xs tracking-[0.32em] opacity-50 group-hover:opacity-100">
                0{i + 1}
              </span>
            </a>
          ))}
        </nav>

        <div className="px-8 py-8 axum-border-t flex flex-col gap-3 text-xs tracking-[0.25em] uppercase">
          <div className="opacity-60">{o.atelier}</div>
          <div className="flex gap-5">
            <a href="#manifesto" className="axum-link" data-testid="nav-newsletter">{o.newsletter}</a>
            <a href="#footer" className="axum-link" data-testid="nav-instagram">{o.instagram}</a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavOverlay;
