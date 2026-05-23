import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";
import NavOverlay from "@/components/NavOverlay";
import HeroSlider from "@/components/HeroSlider";
import ProductGrid from "@/components/ProductGrid";
import Lookbook from "@/components/Lookbook";
import EditorialStrip from "@/components/EditorialStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import { Menu } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal on scroll
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="App" data-testid="axum-app">
      <Toaster position="bottom-center" theme="light" />
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 md:px-8 py-4 axum-ease`}
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          borderBottom: scrolled ? "1px solid #000" : "1px solid transparent",
        }}
        data-testid="top-bar"
      >
        <a
          href="#top"
          className="font-display text-2xl md:text-3xl tracking-tighter"
          style={{ color: scrolled ? "#000" : "#fff", mixBlendMode: scrolled ? "normal" : "difference" }}
          data-testid="logo"
        >
          AXUM
        </a>
        <div
          className="hidden md:flex items-center gap-8"
          style={{ color: scrolled ? "#000" : "#fff", mixBlendMode: scrolled ? "normal" : "difference" }}
        >
          <a href="#shop" className="axum-link" data-testid="nav-shop">Shop</a>
          <a href="#lookbook" className="axum-link" data-testid="nav-lookbook">Lookbook</a>
          <a href="#manifesto" className="axum-link" data-testid="nav-manifesto">Manifesto</a>
        </div>
        <button
          onClick={() => setNavOpen(true)}
          className="flex items-center gap-2 axum-ease"
          style={{ color: scrolled ? "#000" : "#fff", mixBlendMode: scrolled ? "normal" : "difference" }}
          data-testid="open-nav-button"
          aria-label="Open menu"
        >
          <span className="hidden md:inline text-xs tracking-[0.18em] uppercase">Menu</span>
          <Menu size={26} strokeWidth={1.5} />
        </button>
      </header>

      <NavOverlay open={navOpen} onClose={() => setNavOpen(false)} />

      <main id="top">
        <HeroSlider />
        <Marquee />
        <section id="shop" className="axum-border-t">
          <ProductGrid />
        </section>
        <EditorialStrip />
        <section id="lookbook">
          <Lookbook />
        </section>
        <section id="manifesto">
          <Newsletter />
        </section>
        <Footer />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
