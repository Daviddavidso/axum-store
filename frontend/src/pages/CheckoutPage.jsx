import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";
import { useCart, formatPrice } from "@/contexts/CartContext";

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">{label}</span>
    <input
      {...props}
      className="w-full border-b border-black px-1 py-2 text-sm bg-transparent outline-none focus:border-black axum-ease"
    />
  </label>
);

const CheckoutPage = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { items, subtotal, currency, count, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "AXUM10") {
      setDiscount(0.1);
      toast.success(t("checkout.promo_ok"));
    } else {
      setDiscount(0);
      toast.error(t("checkout.promo_invalid"));
    }
  };

  const shipping = subtotal > 0 ? (currency === "RUB" ? 1200 : 18) : 0;
  const discountAmount = Math.round(subtotal * discount);
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const placeOrder = (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    setTimeout(() => {
      // MOCKED: real Stripe / Apple Pay / Google Pay flow to be wired separately
      clear();
      toast.success(t("checkout.order_placed"));
      setPlacing(false);
      navigate(`/${lang}`);
    }, 1200);
  };

  return (
    <div className="App bg-white min-h-screen" data-testid="checkout-page">
      <PromoBar />
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[102px]">
        <section className="px-5 md:px-10 py-10 md:py-14 axum-border-b">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-3">{t("checkout.eyebrow")}</div>
          <h1 className="font-display uppercase text-4xl md:text-6xl tracking-tighter leading-[0.9]">{t("checkout.title")}</h1>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left — form */}
          <form onSubmit={placeOrder} className="lg:col-span-7 p-6 md:p-12 lg:axum-border-r space-y-10" data-testid="checkout-form">
            {/* Express */}
            <div className="space-y-3">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-60">{t("checkout.express")}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => toast.message(t("checkout.applepay_mock"))} className="axum-btn" data-testid="apple-pay-btn">
                  <span className="text-base"></span>&nbsp;Pay
                </button>
                <button type="button" onClick={() => toast.message(t("checkout.googlepay_mock"))} className="axum-btn axum-btn-ghost" data-testid="google-pay-btn">
                  G&nbsp;Pay
                </button>
              </div>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 text-center py-2">{t("checkout.or_card")}</div>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-60">{t("checkout.contact")}</div>
              <Field label={t("checkout.email")} type="email" required placeholder="you@studio.com" data-testid="checkout-email" />
            </div>

            {/* Shipping */}
            <div className="space-y-5">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-60">{t("checkout.shipping_address")}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label={t("checkout.first_name")} required data-testid="checkout-first" />
                <Field label={t("checkout.last_name")} required data-testid="checkout-last" />
              </div>
              <Field label={t("checkout.address")} required data-testid="checkout-address" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label={t("checkout.city")} required data-testid="checkout-city" />
                <Field label={t("checkout.zip")} required data-testid="checkout-zip" />
                <Field label={t("checkout.country")} defaultValue={lang === "ru" ? "RU" : "US"} required data-testid="checkout-country" />
              </div>
              <Field label={t("checkout.phone")} type="tel" data-testid="checkout-phone" />
            </div>

            {/* Payment (card) */}
            <div className="space-y-5">
              <div className="text-[10px] tracking-[0.4em] uppercase opacity-60">{t("checkout.payment")}</div>
              <Field label={t("checkout.card_number")} required placeholder="•••• •••• •••• ••••" data-testid="checkout-card" />
              <div className="grid grid-cols-2 gap-5">
                <Field label={t("checkout.expiry")} required placeholder="MM / YY" data-testid="checkout-exp" />
                <Field label={t("checkout.cvc")} required placeholder="•••" data-testid="checkout-cvc" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-50">
                {t("checkout.payment_mock_note")}
              </p>
            </div>

            <button type="submit" className="axum-btn w-full" disabled={placing || items.length === 0} data-testid="place-order">
              {placing ? t("checkout.placing") : `${t("checkout.place_order")} — ${formatPrice(total, currency || "USD")}`}
            </button>
          </form>

          {/* Right — Order summary */}
          <aside className="lg:col-span-5 p-6 md:p-12 bg-white" data-testid="order-summary">
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("checkout.summary")} ({count})</div>
            {items.length === 0 ? (
              <div className="py-10 text-sm opacity-70">{t("checkout.empty")}</div>
            ) : (
              <div className="space-y-4">
                {items.map((it) => (
                  <div key={it.lineId} className="flex gap-3 items-start">
                    <img src={it.image} alt={it.name} className="w-16 h-20 object-cover border border-black" />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[11px] tracking-[0.18em] uppercase truncate">{it.name}</div>
                      <div className="text-[10px] tracking-[0.3em] uppercase opacity-60 mt-1">{it.size} · ×{it.qty}</div>
                    </div>
                    <div className="font-display text-xs whitespace-nowrap">
                      {formatPrice(it.price_value * it.qty, it.currency)}
                    </div>
                  </div>
                ))}

                {/* Promo */}
                <div className="pt-4 mt-4 border-t border-black/30 flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder={t("checkout.promo")}
                    className="flex-1 border border-black px-3 py-2 text-sm bg-white outline-none uppercase tracking-widest"
                    data-testid="promo-input"
                  />
                  <button type="button" onClick={applyPromo} className="axum-btn" data-testid="promo-apply">{t("checkout.apply")}</button>
                </div>

                <div className="pt-4 mt-2 border-t border-black/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t("checkout.subtotal")}</span>
                    <span className="font-display">{formatPrice(subtotal, currency)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span>{t("checkout.discount")} ({(discount * 100).toFixed(0)}%)</span>
                      <span className="font-display">−{formatPrice(discountAmount, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t("checkout.shipping")}</span>
                    <span className="font-display">{formatPrice(shipping, currency)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-black/30">
                    <span className="uppercase tracking-[0.2em] text-xs font-display">{t("checkout.total")}</span>
                    <span className="font-display text-xl" data-testid="checkout-total">{formatPrice(total, currency)}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default CheckoutPage;
