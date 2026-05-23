import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "1";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["ALL"]);
  const [active, setActive] = useState("ALL");

  useEffect(() => {
    setActive("ALL");
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products/categories`, { params: { lang } });
        setCategories(data?.categories || ["ALL"]);
      } catch (e) { /* noop */ }
    })();
  }, [lang]);

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

  return (
    <div className="App bg-white min-h-screen" data-testid="catalog-page">
      <PromoBar />
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[102px]">
        <section className="px-5 md:px-10 py-14 md:py-20" data-testid="catalog-title-block">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">
            {isNew ? t("nav.new") : t("catalog.full_eyebrow")}
          </div>
          <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.88]">
            {t("catalog.full_title_a")}<br />{t("catalog.full_title_b")}
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed opacity-80">{t("catalog.full_blurb")}</p>
          <div className="mt-8 text-[11px] tracking-[0.3em] uppercase opacity-70" data-testid="catalog-count">
            {products.length} {t("catalog.pieces")}
          </div>
        </section>

        {/* Airy underlined tabs */}
        <div className="flex flex-wrap items-center gap-x-6 md:gap-x-10 gap-y-2 px-5 md:px-10 pb-10 md:pb-14" data-testid="catalog-tabs">
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16 px-5 md:px-10 pb-20">
          {products.map((p, idx) => (
            <ProductCard key={p.id || idx} product={p} idx={idx} isNew={isNew || idx < 2} />
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
