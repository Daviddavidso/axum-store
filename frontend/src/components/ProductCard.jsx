import React, { useRef } from "react";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * I.AM.GIA-style product card.
 * - Large vertical image on a white background
 * - Front + back hover swap (uses global .product-card CSS)
 * - "NEW" tag top-left, wishlist heart top-right
 * - Product name / price BELOW the image (not overlaid)
 * - Inline "+ ADD" button that fills out on hover
 */
const ProductCard = ({ product, idx, isNew = false, isBestSeller = false }) => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { addItem, toggleWish, inWishlist } = useCart();
  const wished = inWishlist(product.id);

  const tiltRef = useRef(null);
  // Pointer-driven 3D tilt — decorative, rests flat, never required for keyboard
  // users, and disabled when the visitor prefers reduced motion.
  const prefersReduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const onTiltMove = (e) => {
    const el = tiltRef.current;
    if (!el || prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const MAX = 5; // degrees — vestibular-safe
    el.style.transform = `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg)`;
  };
  const onTiltLeave = () => {
    const el = tiltRef.current;
    if (el) el.style.transform = "";
  };

  const open = () => navigate(`/${lang}/product/${product.id}`);
  const quickAdd = (e) => {
    e.stopPropagation();
    addItem({
      lineId: `${product.id}_M_${product.currency}`,
      product_id: product.id,
      name: product.name,
      image: product.image1,
      price_value: product.price_value,
      price: product.price,
      currency: product.currency,
      size: "M",
      qty: 1,
    });
    toast.success(t("product.added_toast"));
  };

  // Tilt kept around for the original light theme; under the current dark
  // redesign the carousel looks cleaner flat, so we no-op the handlers.
  void onTiltMove; void onTiltLeave; void tiltRef;

  return (
    <article
      className="product-card-v2 group flex flex-col reveal"
      style={{ "--rd": `${(idx % 4) * 0.06}s` }}
      data-testid={`product-card-${idx}`}
    >
      <div
        className="pc-media cursor-pointer"
        style={{ aspectRatio: "3 / 4" }}
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        }}
      >
        {/* Front image alt: dedicated alt1 (interim "AXUM studio look NN" for
            placeholder products) with the product name as fallback — improves
            automatically once real garment copy is added. accessibility-lead
            WCAG 1.1.1 sign-off. */}
        <img className="pc-img pc-img--front" src={product.image1} alt={product.alt1 || product.name} loading="lazy" />
        {/* Hover-swap image is decorative — alt="" so it isn't announced twice. */}
        <img className="pc-img pc-img--back" src={product.image2} alt="" loading="lazy" />

        {/* NEW badge — small pink dot + label, no jarring fill block. */}
        {isNew && (
          <span className="pc-badge pc-badge--new" data-testid={`badge-new-${product.id}`}>
            <span aria-hidden="true" className="pc-badge-dot" />
            {t("product_card.new")}
          </span>
        )}
        {isBestSeller && !isNew && (
          <span className="pc-badge pc-badge--best">{t("product_card.best_seller")}</span>
        )}

        {/* Wishlist heart — minimal, top-right, focus-visible ring. */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
          className="pc-wish"
          aria-label={t("product_card.wishlist")}
          aria-pressed={wished}
          data-testid={`wishlist-${product.id}`}
        >
          <Heart size={18} strokeWidth={1.5} fill={wished ? "currentColor" : "none"} />
        </button>

        {/* Quick add — thin underline-style CTA at the bottom, fades in on hover.
            Hidden on touch via CSS (no stale hover state). */}
        <button
          onClick={quickAdd}
          className="pc-quickadd"
          data-testid={`quick-add-${product.id}`}
        >
          + {t("product_card.add")}
        </button>
      </div>

      {/* Below image — name + price, single tight row */}
      <div className="pc-meta">
        <button
          onClick={open}
          className="pc-name"
          data-testid={`product-name-${idx}`}
        >
          {product.name}
        </button>
        <div className="pc-price" data-testid={`product-price-${idx}`}>
          {product.price}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
