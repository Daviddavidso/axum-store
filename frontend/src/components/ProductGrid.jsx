import React, { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["ALL"]);
  const [active, setActive] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/products/categories`),
        ]);
        setProducts(pRes.data || []);
        setCategories(cRes.data?.categories || ["ALL"]);
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products`, {
          params: active !== "ALL" ? { category: active } : {},
        });
        setProducts(data || []);
      } catch (e) { console.error(e); }
    })();
  }, [active]);

  return (
    <div className="w-full bg-white" data-testid="product-grid-section">
      <div className="flex items-end justify-between px-5 md:px-10 py-10 md:py-16 axum-border-b">
        <div className="reveal">
          <div className="text-xs tracking-[0.32em] uppercase mb-3">N°02 / Catalogue</div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-none" data-testid="catalog-title">
            Shop the<br />Edition
          </h2>
        </div>
        <a href="#lookbook" className="hidden md:inline axum-link" data-testid="see-all-link">View All →</a>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center axum-border-b" data-testid="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 md:px-7 py-4 text-[11px] md:text-xs tracking-[0.25em] uppercase axum-ease border-r border-black ${
              active === cat ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
            }`}
            data-testid={`tab-${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, idx) => (
          <article
            key={p.id || idx}
            className={`product-card axum-border-b ${idx % 4 !== 3 ? "lg:axum-border-r" : ""} ${idx % 2 === 0 ? "sm:axum-border-r lg:axum-border-r" : ""}`}
            style={{ aspectRatio: "3 / 4" }}
            data-testid={`product-card-${idx}`}
          >
            <img className="img-front" src={p.image1} alt={p.name} loading="lazy" />
            <img className="img-back" src={p.image2} alt={`${p.name} alt`} loading="lazy" />
            {/* footer overlay */}
            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4 py-3 bg-white axum-border-t">
              <div className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase truncate pr-3">
                {p.name}
              </div>
              <div className="font-display text-xs md:text-sm">{p.price}</div>
            </div>
            <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-white/90 px-2 py-1">
              {p.category}
            </div>
          </article>
        ))}
        {products.length === 0 && (
          <div className="col-span-full p-16 text-center text-xs tracking-[0.3em] uppercase" data-testid="empty-products">
            No pieces in this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
