import React from "react";
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
const ProductCard = ({ product, idx, isNew = false }) => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { addItem, toggleWish, inWishlist } = useCart();
  const wished = inWishlist(product.id);

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
    <article className="group flex flex-col bg-white" data-testid={`product-card-${idx}`}>
      <div
        className="product-card cursor-pointer"
        style={{ aspectRatio: "3 / 4" }}
        onClick={open}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") open(); }}
      >
        <img className="img-front" src={product.image1} alt={product.name} loading="lazy" />
        <img className="img-back" src={product.image2} alt={`${product.name} alt`} loading="lazy" />

        {/* NEW tag */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-white/95 px-2 py-1 text-[10px] tracking-[0.3em] uppercase font-display z-10">
            {t("product_card.new")}
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center axum-ease hover:scale-110 z-10"
          aria-label="Wishlist"
          data-testid={`wishlist-${product.id}`}
        >
          <Heart size={20} strokeWidth={1.4} fill={wished ? "#000" : "transparent"} />
        </button>

        {/* Quick add — slides up on hover */}
        <button
          onClick={quickAdd}
          className="absolute left-3 right-3 bottom-3 bg-white text-black border border-black py-2.5 text-[11px] tracking-[0.3em] uppercase font-display axum-ease opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-black hover:text-white z-10"
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
