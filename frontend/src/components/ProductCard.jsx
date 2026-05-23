import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";

/**
 * I.AM.GIA-style product card.
 * - Large vertical image on a white background
 * - Front + back hover swap
 * - "NEW" tag top-left, wishlist heart top-right
 * - Product name / price BELOW the image (not overlaid)
 * - Inline ADD button at the bottom that fills out on hover (always tappable on mobile)
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
      product_id: product.id, name: product.name, image: product.image1,
      price_value: product.price_value, price: product.price, currency: product.currency,
      size: "M", qty: 1,
    });
    toast.success(t("product.added_toast"));
  };

  return (
    <article
      className="group flex flex-col bg-white"
      data-testid={`product-card-${idx}`}
    >
      <div
        className="relative overflow-hidden bg-white cursor-pointer"
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
          <div className="absolute top-3 left-3 bg-white px-2 py-1 text-[10px] tracking-[0.3em] uppercase font-display">
            {t("product_card.new")}
          </div>
        )}

        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center axum-ease hover:scale-110"
          aria-label="Wishlist"
          data-testid={`wishlist-${product.id}`}
        >
          <Heart size={20} strokeWidth={1.4} fill={wished ? "#000" : "transparent"} />
        </button>
      </div>

      {/* Below image — name, price, ADD */}
      <div className="px-3 md:px-4 pt-4 pb-5 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={open}
            className="font-display text-[11px] md:text-xs tracking-[0.18em] uppercase text-left hover:underline underline-offset-4 truncate"
            data-testid={`product-name-${idx}`}
          >
            {product.name}
          </button>
        </div>
        <div className="text-sm font-display" data-testid={`product-price-${idx}`}>
          {product.price}
        </div>
        <button
          onClick={quickAdd}
          className="mt-3 w-full border border-black py-2.5 text-[11px] tracking-[0.3em] uppercase font-display bg-white text-black axum-ease hover:bg-black hover:text-white flex items-center justify-center gap-2"
          data-testid={`quick-add-${product.id}`}
        >
          <ShoppingBag size={14} strokeWidth={1.4} /> {t("product_card.add")}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
