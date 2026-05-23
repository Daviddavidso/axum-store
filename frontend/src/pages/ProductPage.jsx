import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Heart } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SIZES = ["XS", "S", "M", "L", "XL"];

const ProductPage = () => {
  const { lang, t } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, toggleWish, inWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [more, setMore] = useState([]);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState(null);

  useEffect(() => {
    setActive(0);
    setSize(null);
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products/${id}`, { params: { lang } });
        setProduct(data);
      } catch (e) {
        if (e?.response?.status === 404) navigate(`/${lang}/catalog`, { replace: true });
      }
    })();
  }, [id, lang, navigate]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products`, { params: { lang } });
        setMore((data || []).filter((p) => p.id !== id).slice(0, 3));
      } catch (e) { /* ignore */ }
    })();
  }, [id, lang]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="font-display uppercase tracking-[0.3em] text-xs">…</div>
      </div>
    );
  }

  const gallery = [product.image1, product.image2].filter(Boolean);
  const wished = inWishlist(product.id);

  const handleAdd = () => {
    if (!size) { toast.error(t("product.pick_size_toast")); return; }
    addItem({
      lineId: `${product.id}_${size}_${product.currency}`,
      product_id: product.id,
      name: product.name,
      image: product.image1,
      price_value: product.price_value,
      price: product.price,
      currency: product.currency,
      size,
      qty: 1,
    });
    toast.success(t("product.added_toast"));
  };

  const handleInquire = () => {
    window.location.href = `mailto:atelier@axum.studio?subject=${encodeURIComponent(`Inquiry — ${product.name}`)}&body=${encodeURIComponent(`Hello AXUM atelier,\n\nI'd like to inquire about: ${product.name} (${product.price}).\n\n`)}`;
  };

  return (
    <div className="App bg-white min-h-screen" data-testid="product-page">
      <PromoBar />
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[102px]">
        <section className="grid grid-cols-1 lg:grid-cols-2 axum-border-b" data-testid="product-gallery">
          {gallery.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={`relative overflow-hidden bg-white axum-ease ${idx === 0 ? "lg:axum-border-r" : ""} ${idx === 0 ? "axum-border-b lg:axum-border-b-0" : ""}`}
              style={{ aspectRatio: "3 / 4" }}
              data-testid={`product-image-${idx}`}
            >
              <img
                src={src}
                alt={`${product.name} ${idx === 0 ? "front" : "alt"}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transition: "transform 6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: active === idx ? "scale(1.04)" : "scale(1)",
                }}
              />
              <div className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-white/90 px-2 py-1">
                {idx === 0 ? t("product.view_front") : t("product.view_alt")}
              </div>
            </button>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 axum-border-b" data-testid="product-info">
          <div className="lg:col-span-7 p-6 md:p-14 lg:axum-border-r">
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-6" data-testid="product-category">
              {product.category}
            </div>
            <div className="flex items-start justify-between gap-6">
              <h1 className="font-display uppercase text-4xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.92]" data-testid="product-name">
                {product.name}
              </h1>
              <button
                onClick={() => toggleWish(product.id)}
                className="axum-ease shrink-0 mt-2"
                aria-label="Toggle wishlist"
                data-testid="wishlist-toggle"
              >
                <Heart size={26} strokeWidth={1.5} fill={wished ? "#000" : "transparent"} />
              </button>
            </div>
            <div className="mt-8 font-display text-3xl md:text-4xl" data-testid="product-price">
              {product.price}
            </div>
            <p className="mt-8 max-w-xl text-sm md:text-base leading-relaxed opacity-80" data-testid="product-description">
              {product.description || "—"}
            </p>
          </div>

          <div className="lg:col-span-5 p-6 md:p-14 flex flex-col">
            {/* Size selector */}
            <div className="mb-8">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-3">{t("product.size")}</div>
              <div className="grid grid-cols-5 gap-2" data-testid="size-selector">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSize(sz)}
                    className={`py-3 border border-black text-xs tracking-[0.18em] uppercase font-display axum-ease ${
                      size === sz ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                    data-testid={`size-${sz}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-3">{t("product.details")}</div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("product.edition")}</span><span className="font-display">VOL. 04 — AW25</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("product.made_in")}</span><span className="font-display">FR · IT</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("product.fit")}</span><span className="font-display">{t("product.fit_value")}</span>
              </li>
              <li className="flex justify-between">
                <span>{t("product.shipping")}</span><span className="font-display">2–4 D</span>
              </li>
            </ul>

            <div className="mt-10 flex flex-col gap-3">
              <button onClick={handleAdd} className="axum-btn w-full" data-testid="add-to-bag">
                {t("product.add_to_bag")} <ArrowRight size={16} strokeWidth={2} />
              </button>
              <button onClick={handleInquire} className="axum-btn axum-btn-ghost w-full" data-testid="inquire">
                {t("product.inquire")}
              </button>
            </div>

            <p className="mt-8 text-[11px] tracking-[0.25em] uppercase opacity-60">{t("product.footnote")}</p>
          </div>
        </section>

        {more.length > 0 && (
          <section className="w-full" data-testid="more-section">
            <div className="px-5 md:px-10 py-10 md:py-14 flex items-end justify-between axum-border-b">
              <div>
                <div className="text-xs tracking-[0.32em] uppercase mb-3">{t("product.more_eyebrow")}</div>
                <h2 className="font-display text-3xl md:text-5xl uppercase leading-none">{t("product.more_title")}</h2>
              </div>
              <button onClick={() => navigate(`/${lang}/catalog`)} className="hidden md:inline axum-link" data-testid="more-view-all">
                {t("catalog.view_all")}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3">
              {more.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => { navigate(`/${lang}/product/${p.id}`); window.scrollTo({ top: 0 }); }}
                  className={`product-card axum-border-b text-left ${idx !== 2 ? "sm:axum-border-r" : ""}`}
                  style={{ aspectRatio: "3 / 4" }}
                  data-testid={`more-card-${idx}`}
                >
                  <img className="img-front" src={p.image1} alt={p.name} loading="lazy" />
                  <img className="img-back" src={p.image2} alt={`${p.name} alt`} loading="lazy" />
                  <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between px-4 py-3 bg-white axum-border-t">
                    <div className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase truncate pr-3">{p.name}</div>
                    <div className="font-display text-xs md:text-sm whitespace-nowrap">{p.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </main>
    </div>
  );
};

export default ProductPage;
