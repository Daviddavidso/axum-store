import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import NavOverlay from "@/components/NavOverlay";
import HeroSlider from "@/components/HeroSlider";
import ProductGrid from "@/components/ProductGrid";
import Lookbook from "@/components/Lookbook";
import EditorialStrip from "@/components/EditorialStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import LanguageToggle from "@/components/LanguageToggle";
import { useLang } from "@/contexts/LanguageContext";

const Home = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  }, [lang]);

  const onColor = scrolled ? "#000" : "#fff";

  return (
    <div className="App" data-testid="axum-app">
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
          href={`/${lang}`}
          onClick={(e) => { e.preventDefault(); navigate(`/${lang}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="font-display text-2xl md:text-3xl tracking-tighter"
          style={{ color: onColor, mixBlendMode: scrolled ? "normal" : "difference" }}
          data-testid="logo"
        >
          AXUM
        </a>

        <div
          className="hidden md:flex items-center gap-8"
          style={{ color: onColor, mixBlendMode: scrolled ? "normal" : "difference" }}
        >
          <a href="#shop" className="axum-link" data-testid="nav-shop">{t("nav.shop")}</a>
          <a href="#lookbook" className="axum-link" data-testid="nav-lookbook">{t("nav.lookbook")}</a>
          <a href="#manifesto" className="axum-link" data-testid="nav-manifesto">{t("nav.manifesto")}</a>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <LanguageToggle scrolled={scrolled} />
          <button
            onClick={() => setNavOpen(true)}
            className="flex items-center gap-2 axum-ease"
            style={{ color: onColor, mixBlendMode: scrolled ? "normal" : "difference" }}
            data-testid="open-nav-button"
            aria-label="Open menu"
          >
            <span className="hidden md:inline text-xs tracking-[0.18em] uppercase">{t("nav.menu")}</span>
            <Menu size={26} strokeWidth={1.5} />
          </button>
        </div>
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

export default Home;
