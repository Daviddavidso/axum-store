import React from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";

const CartDrawer = () => {
  const { items, count, subtotal, currency, drawerOpen, setDrawerOpen, removeItem, setQty } = useCart();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const goCheckout = () => {
    setDrawerOpen(false);
    navigate(`/${lang}/checkout`);
  };

  return (
    <>
      <div
        className={`nav-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        data-testid="cart-backdrop"
      />
      <aside
        className={`nav-overlay ${drawerOpen ? "open" : ""} flex flex-col`}
        role="dialog"
        aria-hidden={!drawerOpen}
        data-testid="cart-drawer"
      >
        <div className="flex items-center justify-between px-6 md:px-8 py-5 axum-border-b">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="font-display tracking-[0.25em] text-sm uppercase">
              {t("cart.title")} ({count})
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center axum-ease hover:bg-black hover:text-white"
            aria-label="Close cart"
            data-testid="close-cart"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5" data-testid="cart-empty">
            <ShoppingBag size={28} strokeWidth={1.25} className="opacity-40" />
            <div className="font-display text-2xl uppercase">{t("cart.empty_title")}</div>
            <p className="text-sm opacity-70 max-w-xs">{t("cart.empty_sub")}</p>
            <button
              onClick={() => { setDrawerOpen(false); navigate(`/${lang}/catalog`); }}
              className="axum-btn mt-2"
              data-testid="cart-empty-cta"
            >
              {t("cart.empty_cta")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto" data-testid="cart-items">
              {items.map((it) => (
                <div key={it.lineId} className="flex gap-4 px-6 md:px-8 py-5 axum-border-b" data-testid={`cart-line-${it.lineId}`}>
                  <img src={it.image} alt={it.name} className="w-20 h-28 object-cover border border-black flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-xs tracking-[0.18em] uppercase truncate" data-testid={`cart-name-${it.lineId}`}>{it.name}</div>
                    <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mt-1">{t("cart.size")}: {it.size}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button onClick={() => setQty(it.lineId, it.qty - 1)} className="w-7 h-7 border border-black flex items-center justify-center axum-ease hover:bg-black hover:text-white" data-testid={`cart-dec-${it.lineId}`} aria-label="Decrease">
                        <Minus size={12} />
                      </button>
                      <span className="font-display text-sm w-6 text-center" data-testid={`cart-qty-${it.lineId}`}>{it.qty}</span>
                      <button onClick={() => setQty(it.lineId, it.qty + 1)} className="w-7 h-7 border border-black flex items-center justify-center axum-ease hover:bg-black hover:text-white" data-testid={`cart-inc-${it.lineId}`} aria-label="Increase">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(it.lineId)} className="axum-ease hover:opacity-50" aria-label="Remove" data-testid={`cart-remove-${it.lineId}`}>
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>
                    <div className="font-display text-sm whitespace-nowrap" data-testid={`cart-price-${it.lineId}`}>
                      {formatPrice(it.price_value * it.qty, it.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 md:px-8 py-5 axum-border-t space-y-4 bg-white">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] tracking-[0.3em] uppercase">{t("cart.subtotal")}</span>
                <span className="font-display text-2xl" data-testid="cart-subtotal">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="text-[11px] tracking-[0.25em] uppercase opacity-60">
                {t("cart.shipping_at_checkout")}
              </div>
              <button onClick={goCheckout} className="axum-btn w-full" data-testid="cart-checkout">
                {t("cart.checkout")} →
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
