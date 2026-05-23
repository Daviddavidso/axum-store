import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Menu, ArrowLeft } from "lucide-react";
import NavOverlay from "@/components/NavOverlay";
import LanguageToggle from "@/components/LanguageToggle";
import Logo from "@/components/Logo";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["ALL"]);
  const [active, setActive] = useState("ALL");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setActive("ALL");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products/categories`, { params: { lang } });
        setCategories(data?.categories || ["ALL"]);
      } catch (e) { console.error(e); }
    })();
  }, [lang]);

  useEffect(() => {
    (async () => {
      try {
        const params = { lang };
        if (active !== "ALL") params.category = active;
        const { data } = await axios.get(`${API}/products`, { params });
        setProducts(data || []);
      } catch (e) { console.error(e); }
    })();
  }, [active, lang]);

  return (
    <div className="App bg-white min-h-screen" data-testid="catalog-page">
      <header
        className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center px-5 md:px-8 py-4 axum-ease bg-white"
        style={{ borderBottom: "1px solid #000" }}
        data-testid="catalog-top-bar"
      >
        <div className="hidden md:flex items-center gap-8 justify-self-start">
          <button
            onClick={() => navigate(`/${lang}`)}
            className="axum-link flex items-center gap-2"
            data-testid="catalog-back-home"
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> {t("catalog.back_home")}
          </button>
        </div>
        <div className="md:hidden" />

        <a
          href={`/${lang}`}
          onClick={(e) => { e.preventDefault(); navigate(`/${lang}`); }}
          className="flex items-center justify-self-center"
          aria-label="AXUM home"
          data-testid="catalog-logo"
        >
          <Logo height={scrolled ? 22 : 30} />
        </a>

        <div className="flex items-center gap-3 md:gap-5 justify-self-end">
          <LanguageToggle scrolled={true} />
          <button
            onClick={() => setNavOpen(true)}
            className="flex items-center gap-2 axum-ease text-black"
            data-testid="catalog-open-nav"
            aria-label="Open menu"
          >
            <span className="hidden md:inline text-xs tracking-[0.18em] uppercase">{t("nav.menu")}</span>
            <Menu size={26} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <NavOverlay open={navOpen} onClose={() => setNavOpen(false)} />

      <main className="pt-[68px]">
        {/* Title block */}
        <section className="px-5 md:px-10 py-16 md:py-24 axum-border-b" data-testid="catalog-title-block">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("catalog.full_eyebrow")}</div>
          <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.88]">
            {t("catalog.full_title_a")}<br />
            {t("catalog.full_title_b")}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed opacity-80">
            {t("catalog.full_blurb")}
          </p>
          <div className="mt-8 text-[11px] tracking-[0.3em] uppercase opacity-70" data-testid="catalog-count">
            {products.length} {t("catalog.pieces")}
          </div>
        </section>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center axum-border-b" data-testid="catalog-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-5 md:px-7 py-4 text-[11px] md:text-xs tracking-[0.25em] uppercase axum-ease border-r border-black ${
                active === cat ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
              }`}
              data-testid={`catalog-tab-${cat}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid (3 columns on desktop for catalog) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, idx) => (
            <article
              key={p.id || idx}
              onClick={() => navigate(`/${lang}/product/${p.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/${lang}/product/${p.id}`); }}
              className={`product-card cursor-pointer axum-border-b ${idx % 3 !== 2 ? "lg:axum-border-r" : ""} ${idx % 2 === 0 ? "sm:axum-border-r" : ""}`}
              style={{ aspectRatio: "3 / 4" }}
              data-testid={`catalog-card-${idx}`}
            >
              <img className="img-front" src={p.image1} alt={p.name} loading="lazy" />
              <img className="img-back" src={p.image2} alt={`${p.name} alt`} loading="lazy" />
              <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4 py-3 bg-white axum-border-t">
                <div className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase truncate pr-3">{p.name}</div>
                <div className="font-display text-xs md:text-sm whitespace-nowrap">{p.price}</div>
              </div>
              <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-white/90 px-2 py-1">
                {p.category}
              </div>
            </article>
          ))}
          {products.length === 0 && (
            <div className="col-span-full p-16 text-center text-xs tracking-[0.3em] uppercase" data-testid="catalog-empty">
              {t("catalog.empty")}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default CatalogPage;
