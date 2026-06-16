import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Heart } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
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

  // Every studio angle of this garment, front first. The API serves
  // `images` as [{src, alt}] (alt = name for the first, "name, view N" after).
  // Fall back to the legacy two-photo shape for any product without an array.
  const images =
    product.images?.length
      ? product.images
      : [
          { src: product.image1, alt: product.name },
          { src: product.image2, alt: product.alt2 || product.name },
        ].filter((im) => im.src);
  const safeActive = Math.min(active, images.length - 1);
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
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[88px] pb-[calc(50px+env(safe-area-inset-bottom,0px))] md:pb-0">
        <section className="grid grid-cols-1 lg:grid-cols-12 axum-border-b" data-testid="product-gallery">
          {/* Main active image — presentational projection of the selected
              thumbnail. Not focusable (no action on it); its alt updates to the
              active angle so the reading order stays accurate. */}
          <div
            className="lg:col-span-9 relative overflow-hidden bg-white lg:axum-border-r"
            style={{ aspectRatio: "3 / 4" }}
            data-testid="product-image-main"
          >
            <img
              src={images[safeActive].src}
              alt={images[safeActive].alt}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark plate + true #fff text — guarantees the counter holds
                ≥7:1 over ANY photo (busy/light/skin tones included), and
                bypasses the dark-theme global text-white→ink remap which would
                otherwise turn this counter mid-grey on the dark plate. */}
            <div
              className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 text-[10px] tracking-[0.32em] uppercase font-display"
              style={{
                color: "#fff",
                background: "rgba(10, 10, 10, 0.78)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
              }}
            >
              {safeActive + 1} / {images.length}
            </div>
          </div>

          {/* Thumbnail rail — toggle buttons that select which angle is shown.
              Single image (e.g. one-photo look) hides the rail entirely. */}
          {images.length > 1 && (
            <ul
              role="group"
              aria-label={t("product.gallery_label")}
              className="lg:col-span-3 flex lg:flex-col gap-2 p-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[75vh]"
              data-testid="product-thumbs"
            >
              {images.map((im, idx) => (
                <li key={idx} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-pressed={safeActive === idx}
                    aria-label={im.alt}
                    className={`relative block w-20 lg:w-full bg-white axum-ease focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                      safeActive === idx
                        ? "ring-2 ring-black ring-offset-2 ring-offset-white"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{ aspectRatio: "3 / 4" }}
                    data-testid={`product-thumb-${idx}`}
                  >
                    {/* alt="" — the button's aria-label already names it; an alt
                        here would double-announce. */}
                    <img
                      src={im.src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Polite, terse status so SR users hear the new angle after a
              thumbnail activates (focus stays on the button, so the swapped
              main image isn't otherwise announced). */}
          <div aria-live="polite" className="sr-only" data-testid="gallery-status">
            {`${t("product.view_word")} ${safeActive + 1} ${t("product.of_word")} ${images.length}`}
          </div>
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
                      size === sz ? "bg-[var(--axum-accent)] text-[#000] border-[var(--axum-accent)]" : "bg-white text-black hover:bg-black hover:text-white"
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
                  <img className="img-back" src={p.image2} alt={p.alt2 || p.name} loading="lazy" />
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
