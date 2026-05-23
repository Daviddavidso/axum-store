import React from "react";
import { X } from "lucide-react";

const links = [
  { label: "Women", href: "#shop" },
  { label: "Men", href: "#shop" },
  { label: "Editorial", href: "#lookbook" },
  { label: "Archive", href: "#lookbook" },
  { label: "Stores", href: "#footer" },
  { label: "Contact", href: "#manifesto" },
];

const NavOverlay = ({ open, onClose }) => {
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
          <span className="font-display text-2xl tracking-tighter">AXUM</span>
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
              key={l.label}
              href={l.href}
              onClick={onClose}
              className="group flex items-center justify-between px-8 py-5 md:py-6 axum-border-b axum-ease hover:bg-black hover:text-white"
              data-testid={`nav-link-${l.label.toLowerCase()}`}
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
          <div className="opacity-60">Atelier — Paris · Tokyo · NY</div>
          <div className="flex gap-5">
            <a href="#manifesto" className="axum-link" data-testid="nav-newsletter">Newsletter</a>
            <a href="#footer" className="axum-link" data-testid="nav-instagram">Instagram</a>
          </div>
        </div>
      </aside>
    </>
  );
};

export default NavOverlay;
