import React, { useEffect, useState } from "react";
import axios from "axios";
import SplitText from "@/components/SplitText";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

/**
 * TrendingRail — "Trending now" editorial showcase.
 *
 * The same products are fully shoppable in #shop, /catalog and /product/:id, so
 * this band carries no interactive controls by design. It renders a semantic
 * <ul> of <figure> cards (real <img alt> + name + price) — the single source of
 * truth for every visitor (screen readers, keyboard, no-WebGL, reduced-motion).
 */
const TrendingRail = () => {
  const { lang, t } = useLang();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products`, { params: { lang } });
        if (!cancelled) setProducts((data || []).slice(0, 8));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (products.length === 0) return null;

  return (
    <section
      className="w-full bg-white axum-border-t"
      aria-labelledby="trending-title"
      data-testid="trending-rail"
    >
      <div className="px-5 md:px-10 pt-8 md:pt-12 pb-5 md:pb-6">
        <div className="reveal text-[10px] tracking-[0.32em] uppercase mb-3 opacity-60">
          {t("trending.eyebrow")}
        </div>
        <SplitText
          as="h2"
          id="trending-title"
          className="font-display text-4xl md:text-6xl uppercase leading-none tracking-tighter"
          data-testid="trending-title"
          text={t("trending.title")}
        />
      </div>

      <ul
        className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16 px-5 md:px-10 pb-16 list-none"
        data-testid="trending-list"
      >
        {products.map((p, idx) => (
          <li key={p.id || idx}>
            <figure className="m-0">
              <img
                src={p.image1}
                alt={p.alt1 || p.name}
                loading="lazy"
                className="w-full object-cover bg-neutral-100"
                style={{ aspectRatio: "3 / 4" }}
              />
              <figcaption className="pt-3 flex items-start justify-between gap-3 font-display text-[11px] md:text-xs tracking-[0.18em] uppercase">
                <span className="truncate">{p.name}</span>
                <span className="whitespace-nowrap">{p.price}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrendingRail;
