import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Heart, ShoppingBag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CatalogPage = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const { addItem, toggleWish, inWishlist } = useCart();

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
    <div className="App bg-white min-h-screen" data-testid="catalog-page">
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[68px]">
        <section className="px-5 md:px-10 py-16 md:py-24 axum-border-b" data-testid="catalog-title-block">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, idx) => {
            const wished = inWishlist(p.id);
            return (
              <article
                key={p.id || idx}
                className={`group product-card axum-border-b ${idx % 3 !== 2 ? "lg:axum-border-r" : ""} ${idx % 2 === 0 ? "sm:axum-border-r" : ""}`}
                style={{ aspectRatio: "3 / 4" }}
                data-testid={`catalog-card-${idx}`}
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
                  data-testid={`wishlist-${p.id}`}
                >
                  <Heart size={16} strokeWidth={1.5} fill={wished ? "#000" : "transparent"} />
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); quickAdd(p); }}
                  className="absolute left-3 right-3 bottom-14 bg-black text-white px-3 py-2.5 text-[11px] tracking-[0.25em] uppercase font-display axum-ease opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white hover:text-black border border-black flex items-center justify-center gap-2"
                  data-testid={`quick-add-${p.id}`}
                >
                  <ShoppingBag size={14} strokeWidth={1.5} /> {t("product_card.add_to_bag")}
                </button>

                <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4 py-3 bg-white axum-border-t pointer-events-none">
                  <div className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase truncate pr-3">{p.name}</div>
                  <div className="font-display text-xs md:text-sm whitespace-nowrap">{p.price}</div>
                </div>
                <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-white/90 px-2 py-1">{p.category}</div>
              </article>
            );
          })}
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
