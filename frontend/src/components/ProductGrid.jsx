import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import SplitText from "@/components/SplitText";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductGrid = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["ALL"]);
  const [active, setActive] = useState("ALL");

  useEffect(() => {
    setActive("ALL");
    (async () => {
      try {
        const cRes = await axios.get(`${API}/products/categories`, { params: { lang } });
        setCategories(cRes.data?.categories || ["ALL"]);
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
    <div className="w-full bg-white" data-testid="product-grid-section">
      {/* Title block */}
      <div className="flex items-end justify-between px-5 md:px-10 py-14 md:py-20">
        {/* Parallax (decorative drift) wraps the reveal so the two transforms
            never collide. Both are disabled under prefers-reduced-motion. */}
        <div className="parallax" data-parallax="0.12">
          <div className="reveal text-[10px] tracking-[0.32em] uppercase mb-3 opacity-60">{t("catalog.eyebrow")}</div>
          <SplitText
            as="h2"
            className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-none tracking-tighter"
            data-testid="catalog-title"
            lines={[t("catalog.title_a"), t("catalog.title_b")]}
          />
        </div>
        <button onClick={() => navigate(`/${lang}/catalog`)} className="hidden md:inline axum-link" data-testid="see-all-link">
          {t("catalog.view_all")}
        </button>
      </div>

      {/* Airy underlined tabs */}
      <div className="flex flex-wrap items-center gap-x-6 md:gap-x-10 gap-y-2 px-5 md:px-10 pb-10 md:pb-14" data-testid="category-tabs">
        {categories.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative py-2 text-[11px] md:text-xs tracking-[0.25em] uppercase font-display axum-ease ${
                isActive ? "text-black" : "text-black/50 hover:text-black"
              }`}
              data-testid={`tab-${cat}`}
            >
              {cat}
              <span
                className={`absolute left-0 right-0 -bottom-0.5 h-px bg-black origin-left axum-ease ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
                style={{ transformOrigin: "left" }}
              />
            </button>
          );
        })}
      </div>

      {/* Product grid — airy gaps. The home grid is a curated PREVIEW (first 8);
          the full set lives on the catalog page via the CTA below, so the
          landing page isn't an endless scroll on mobile. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16 px-5 md:px-10 pb-16">
        {products.slice(0, 8).map((p, idx) => (
          <ProductCard key={p.id || idx} product={p} idx={idx} isNew={idx < 2} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full p-16 text-center text-xs tracking-[0.3em] uppercase" data-testid="empty-products">
            {t("catalog.empty")}
          </div>
        )}
      </div>

      <div className="flex justify-center py-12 md:py-16 axum-border-t" data-testid="open-catalog-cta-wrap">
        <button onClick={() => navigate(`/${lang}/catalog`)} data-magnetic className="axum-btn" data-testid="open-catalog-cta">
          {t("catalog.open_full")} →
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
