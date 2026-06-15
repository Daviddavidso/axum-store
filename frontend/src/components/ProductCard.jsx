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

  return (
    <article
      className="group flex flex-col bg-white reveal reveal-3d"
      style={{ "--rd": `${(idx % 4) * 0.06}s` }}
      data-testid={`product-card-${idx}`}
    >
      <div
        ref={tiltRef}
        className="product-card tilt cursor-pointer"
        style={{ aspectRatio: "3 / 4" }}
        onClick={open}
        onMouseMove={onTiltMove}
        onMouseLeave={onTiltLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          // Native buttons fire on Enter AND Space; replicate that and stop
          // Space from scrolling the page (WCAG 2.1.1).
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
        }}
      >
        {/* Front image alt: dedicated alt1 (interim "AXUM studio look NN" for
            placeholder products) with the product name as fallback — improves
            automatically once real garment copy is added. accessibility-lead
            WCAG 1.1.1 sign-off. */}
        <img className="img-front" src={product.image1} alt={product.alt1 || product.name} loading="lazy" />
        {/* Hover-swap image is decorative — alt="" so it isn't announced twice. */}
        <img className="img-back" src={product.image2} alt="" loading="lazy" />

        {/* Status badges — real text + inverted fill (NEW: light, BEST SELLER:
            dark) + 1px hairline border so the badge edge stays visible over a
            light OR dark photo. Not color-dependent (each carries a text label).
            Stacked top-left so they never overlap. */}
        {(isNew || isBestSeller) && (
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
            {isNew && (
              /* Light badge intentionally kept light for contrast against the
                 dark theme; explicit #000 text (not the remapped text-black ink
                 token) so it stays dark-on-light and legible. */
              <span className="bg-[#ff3da5] text-[#000] border border-[#ff3da5] px-2 py-1 text-[10px] tracking-[0.3em] uppercase font-display">
                {t("product_card.new")}
              </span>
            )}
            {isBestSeller && (
              <span className="bg-black text-white border border-white/80 px-2 py-1 text-[10px] tracking-[0.3em] uppercase font-display">
                {t("product_card.best_seller")}
              </span>
            )}
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center axum-ease hover:scale-110 z-10"
          aria-label={t("product_card.wishlist")}
          aria-pressed={wished}
          data-testid={`wishlist-${product.id}`}
        >
          <Heart size={20} strokeWidth={1.4} fill={wished ? "#000" : "transparent"} />
        </button>

        {/* Quick add — slides up on hover. `pointer-events-none` while hidden
            so it can't intercept the card's link click before it transitions
            in. Hidden entirely on devices without true hover (touch / coarse
            pointer) via a CSS media query — see index.css `.quick-add-touch`
            block — because tapping a card on touch leaves a stale hover state
            that would otherwise keep the button visible. */}
        <button
          onClick={quickAdd}
          className="absolute left-3 right-3 bottom-3 bg-white text-black border border-black py-2.5 text-[11px] tracking-[0.3em] uppercase font-display axum-ease opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto hover:bg-black hover:text-white z-10"
          data-testid={`quick-add-${product.id}`}
        >
          + {t("product_card.add")}
        </button>
      </div>

      {/* Below image — name + price */}
      <div className="pt-4 pb-8 px-1 flex items-start justify-between gap-3">
        <button
          onClick={open}
          className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase text-left hover:underline underline-offset-4 truncate"
          data-testid={`product-name-${idx}`}
        >
          {product.name}
        </button>
        <div className="font-display text-[11px] md:text-xs tracking-[0.18em] whitespace-nowrap" data-testid={`product-price-${idx}`}>
          {product.price}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
