import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProductGrid = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { addItem, toggleWish, inWishlist } = useCart();
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

  const quickAdd = (p) => {
    addItem({
      lineId: `${p.id}_M_${p.currency}`,
      product_id: p.id, name: p.name, image: p.image1,
      price_value: p.price_value, price: p.price, currency: p.currency,
      size: "M", qty: 1,
    });
    toast.success(t("product.added_toast"));
  };

  return (
    <div className="w-full bg-white" data-testid="product-grid-section">
      <div className="flex items-end justify-between px-5 md:px-10 py-10 md:py-16 axum-border-b">
        <div className="reveal">
          <div className="text-xs tracking-[0.32em] uppercase mb-3">{t("catalog.eyebrow")}</div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-none" data-testid="catalog-title">
            {t("catalog.title_a")}<br />{t("catalog.title_b")}
          </h2>
        </div>
        <button onClick={() => navigate(`/${lang}/catalog`)} className="hidden md:inline axum-link" data-testid="see-all-link">
          {t("catalog.view_all")}
        </button>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, idx) => {
          const wished = inWishlist(p.id);
          return (
            <article
              key={p.id || idx}
              className={`group product-card axum-border-b ${idx % 4 !== 3 ? "lg:axum-border-r" : ""} ${idx % 2 === 0 ? "sm:axum-border-r lg:axum-border-r" : ""}`}
              style={{ aspectRatio: "3 / 4" }}
              data-testid={`product-card-${idx}`}
            >
              <div
                onClick={() => navigate(`/${lang}/product/${p.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter") navigate(`/${lang}/product/${p.id}`); }}
                className="absolute inset-0 cursor-pointer"
              >
                <img className="img-front" src={p.image1} alt={p.name} loading="lazy" />
                <img className="img-back" src={p.image2} alt={`${p.name} alt`} loading="lazy" />
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 border border-black flex items-center justify-center axum-ease hover:bg-black hover:text-white"
                aria-label="Wishlist"
                data-testid={`grid-wishlist-${p.id}`}
              >
                <Heart size={16} strokeWidth={1.5} fill={wished ? "#000" : "transparent"} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); quickAdd(p); }}
                className="absolute left-3 right-3 bottom-14 bg-black text-white px-3 py-2.5 text-[11px] tracking-[0.25em] uppercase font-display axum-ease opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white hover:text-black border border-black flex items-center justify-center gap-2"
                data-testid={`grid-quick-add-${p.id}`}
              >
                <ShoppingBag size={14} strokeWidth={1.5} /> {t("product_card.add_to_bag")}
              </button>

              <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4 py-3 bg-white axum-border-t pointer-events-none">
                <div className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase truncate pr-3">{p.name}</div>
                <div className="font-display text-xs md:text-sm whitespace-nowrap" data-testid={`product-price-${idx}`}>{p.price}</div>
              </div>
              <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-white/90 px-2 py-1">{p.category}</div>
            </article>
          );
        })}
        {products.length === 0 && (
          <div className="col-span-full p-16 text-center text-xs tracking-[0.3em] uppercase" data-testid="empty-products">
            {t("catalog.empty")}
          </div>
        )}
      </div>

      <div className="flex justify-center py-12 md:py-16 axum-border-t" data-testid="open-catalog-cta-wrap">
        <button onClick={() => navigate(`/${lang}/catalog`)} className="axum-btn" data-testid="open-catalog-cta">
          {t("catalog.open_full")} →
        </button>
      </div>
    </div>
  );
};

export default ProductGrid;
