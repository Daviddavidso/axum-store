import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import BackToTop from "@/components/BackToTop";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLang } from "@/contexts/LanguageContext";

const PAGE_SIZE = 12;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  // Deep-link from the collection tiles / nav menu: ?category=<localized name>.
  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["ALL"]);
  const [active, setActive] = useState(categoryParam || "ALL");
  // "Show more" pagination — the catalog was one very long scroll on mobile.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const gridRef = useRef(null);

  // Reset the page size whenever the result set changes (filter / lang / new).
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [active, lang, isNew]);

  useEffect(() => {
    // Honour a ?category= deep-link on load / lang change; otherwise reset to ALL.
    setActive(categoryParam || "ALL");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products/categories`, { params: { lang } });
        const cats = data?.categories || ["ALL"];
        setCategories(cats);
        // If the deep-linked category isn't a known category for this language,
        // fall back to ALL so the user never lands on an empty, confusing grid.
        if (categoryParam && !cats.includes(categoryParam)) setActive("ALL");
      } catch (e) { /* noop */ }
    })();
  }, [lang, categoryParam]);

  useEffect(() => {
    (async () => {
      try {
        const params = { lang };
        if (active !== "ALL") params.category = active;
        const { data } = await axios.get(`${API}/products`, { params });
        let list = data || [];
        if (isNew) list = list.filter((p) => (p.sort_order ?? 0) >= 0).slice().reverse().slice(0, 6);
        setProducts(list);
      } catch (e) { /* noop */ }
    })();
  }, [active, lang, isNew]);

  const shown = Math.min(visibleCount, products.length);
  const allShown = shown >= products.length;
  const countMsg = allShown
    ? t("catalog.all_shown").replace("{total}", products.length)
    : t("catalog.showing_count").replace("{shown}", shown).replace("{total}", products.length);

  const handleLoadMore = () => {
    const next = visibleCount + PAGE_SIZE;
    setVisibleCount(next);
    if (next >= products.length) {
      // The button unmounts once the list is exhausted — move focus to the grid
      // so it isn't dropped (WCAG 2.4.3).
      requestAnimationFrame(() => gridRef.current?.focus());
    }
  };

  return (
    <div className="App bg-white min-h-screen" data-testid="catalog-page">
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />
      <BackToTop />

      <main
        id="top"
        tabIndex={-1}
        className="pt-[88px] pb-[calc(50px+env(safe-area-inset-bottom,0px))] md:pb-0 scroll-mt-[88px] focus:outline-none"
      >
        <section className="px-5 md:px-10 py-9 md:py-12" data-testid="catalog-title-block">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">
            {isNew ? t("nav.new") : t("catalog.full_eyebrow")}
          </div>
          <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.88]">
            {t("catalog.full_title_a")}<br />{t("catalog.full_title_b")}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed opacity-80">{t("catalog.full_blurb")}</p>
          {products.length > 0 && (
            <div
              role="status"
              className="mt-8 text-[11px] tracking-[0.3em] uppercase opacity-70"
              data-testid="catalog-count"
            >
              {countMsg}
            </div>
          )}
        </section>

        {/* Airy underlined tabs */}
        <div className="flex flex-wrap items-center gap-x-5 md:gap-x-10 gap-y-4 px-5 md:px-10 pb-10 md:pb-14" data-testid="catalog-tabs">
          {categories.map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`relative py-2 text-[11px] md:text-xs tracking-[0.25em] uppercase font-display axum-ease ${
                  isActive ? "text-black" : "text-black/50 hover:text-black"
                }`}
                data-testid={`catalog-tab-${cat}`}
              >
                {cat}
                <span
                  className={`absolute left-0 right-0 -bottom-0.5 h-px bg-black axum-ease ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                  style={{ transformOrigin: "left" }}
                />
              </button>
            );
          })}
        </div>

        <div
          ref={gridRef}
          tabIndex={-1}
          className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16 px-5 md:px-10 pb-12 focus:outline-none"
        >
          {products.slice(0, visibleCount).map((p, idx) => (
            <ProductCard key={p.id || idx} product={p} idx={idx} isNew={isNew || idx < 2} />
          ))}
          {products.length === 0 && (
            <div className="col-span-full p-16 text-center text-xs tracking-[0.3em] uppercase" data-testid="catalog-empty">
              {t("catalog.empty")}
            </div>
          )}
        </div>

        {!allShown && (
          <div className="flex justify-center pb-12" data-testid="catalog-load-more-wrap">
            <button
              type="button"
              onClick={handleLoadMore}
              className="axum-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
              data-testid="catalog-load-more"
            >
              {t("catalog.load_more")} ({products.length - shown})
            </button>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default CatalogPage;
