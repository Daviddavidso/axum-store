import React, { useState, useId, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";
import { useCart, formatPrice } from "@/contexts/CartContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Checkout details are stashed before the redirect to Xendit so a failed/cancelled
// payment can return the customer to a pre-filled form (WCAG 2.2 SC 3.3.7).
const SAVE_KEY = "axum:checkout";
const readSaved = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SAVE_KEY)) || {};
  } catch {
    return {};
  }
};

/**
 * Field — checkout input with a floating-label "box" pattern.
 *
 * Accessibility (accessibility-lead checklist):
 *   • Real <label htmlFor> wired to the <input id> — clickable + announced.
 *   • Visible 1px border around every field on dark surfaces (the old underline-
 *     only style was invisible against #242424). Border darkens to ink on hover
 *     and switches to a 2px focus ring on focus-visible — focus is never
 *     conveyed by colour alone (WCAG 2.4.7 / 2.4.13).
 *   • Placeholder is left empty so the label can pivot above the field on focus
 *     OR when the field has content — the floating label is the visible name,
 *     never duplicated by a placeholder ghost.
 *   • Label uses .ck-label so it reads as the field's accessible name in the
 *     resting state too; aria-required from `required` is implicit on the input.
 */
/**
 * Field — premium, minimal checkout input.
 *
 * Top-aligned static label (always visible) over a thin underline-style input
 * with a slightly raised charcoal fill — clearly delineates the field on the
 * dark surface without the boxy weight of full borders. Focus state lifts the
 * underline to 2px ink white. Touch target ≥44px.
 *
 * Accessibility (accessibility-lead checklist):
 *   • Real <label htmlFor> wired to <input id> — clicking label focuses input.
 *   • Visible underline 1px (>3:1 against fill) marks the input baseline; the
 *     focus state thickens to 2px white (>13:1) so focus is never colour-only
 *     (WCAG 2.4.7 / 2.4.13).
 *   • Label sits ABOVE the field as a true heading text — never disappears,
 *     never overlaps typed content (no floating-label state-trap).
 *   • Autocomplete attributes from each call site flow through `...props`.
 */
const Field = ({ label, id, className = "", ...props }) => {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={`ck-field ${className}`}>
      <label htmlFor={fieldId} className="ck-label">{label}</label>
      <input id={fieldId} {...props} className="ck-input" />
    </div>
  );
};

const CheckoutPage = () => {
  const { lang, t } = useLang();
  const { items, subtotal, currency, count } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState(""); // polite announcements
  const [error, setError] = useState(""); // assertive announcements
  const [saved] = useState(readSaved); // rehydrate after a failed-payment return
  const submitBtnRef = useRef(null);
  const noteId = useId();
  const errorId = useId();

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

  const returnFocus = () => {
    if (submitBtnRef.current) submitBtnRef.current.focus();
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (submitting || items.length === 0) return;
    const form = e.currentTarget;
    const fd = new FormData(form);

    setSubmitting(true);
    setError("");
    setStatus("");

    try {
      const cfg = (await axios.get(`${API}/payments/config`)).data;
      if (!cfg.enabled) throw new Error("not_configured");

      const payload = {
        items: items.map((it) => ({
          name: it.name,
          price_value: it.price_value,
          qty: it.qty,
          currency: it.currency,
        })),
        email: fd.get("email"),
        first_name: fd.get("first_name") || "",
        last_name: fd.get("last_name") || "",
        phone: fd.get("phone") || "",
        shipping,
        discount: discountAmount,
        currency: currency || "USD",
        lang,
        origin: window.location.origin,
      };

      const { data } = await axios.post(`${API}/payments/xendit/create`, payload);
      if (!data.invoice_url) throw new Error("no_invoice");

      // Preserve the entered details so a return from a failed payment can refill them.
      try {
        sessionStorage.setItem(
          SAVE_KEY,
          JSON.stringify({
            email: fd.get("email") || "",
            first_name: fd.get("first_name") || "",
            last_name: fd.get("last_name") || "",
            address: fd.get("address") || "",
            city: fd.get("city") || "",
            zip: fd.get("zip") || "",
            country: fd.get("country") || "",
            phone: fd.get("phone") || "",
          })
        );
      } catch {
        /* sessionStorage unavailable — retry will start from an empty form */
      }

      // Announce the impending context change politely, then give the live region
      // a moment to be read before this document is torn down by the redirect.
      setStatus(t("checkout.redirecting"));
      setTimeout(() => {
        window.location.href = data.invoice_url;
      }, 1200);
      // Note: submitting stays true through the redirect so the button can't refire.
    } catch (err) {
      setSubmitting(false);
      setStatus("");
      setError(t("checkout.create_error"));
      returnFocus();
    }
  };

  const orderDisabled = submitting || items.length === 0;

  return (
    <div className="App min-h-screen" data-testid="checkout-page" style={{ background: "var(--axum-surface)" }}>
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />

      <main className="pt-[88px] pb-[calc(50px+env(safe-area-inset-bottom,0px))] md:pb-0">
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
                  <span className="text-base" aria-hidden="true"></span>&nbsp;Pay
                </button>
                <button type="button" onClick={() => toast.message(t("checkout.googlepay_mock"))} className="axum-btn axum-btn-ghost" data-testid="google-pay-btn">
                  G&nbsp;Pay
                </button>
              </div>
              <div className="text-[10px] tracking-[0.3em] uppercase opacity-50 text-center py-2">{t("checkout.or_card")}</div>
            </div>

            {/* Contact */}
            <fieldset className="space-y-5 border-0 p-0 m-0">
              <legend className="text-[10px] tracking-[0.4em] uppercase opacity-60 p-0">{t("checkout.contact")}</legend>
              <Field label={t("checkout.email")} name="email" type="email" autoComplete="email" required defaultValue={saved.email} placeholder="you@studio.com" data-testid="checkout-email" />
            </fieldset>

            {/* Shipping */}
            <fieldset className="space-y-5 border-0 p-0 m-0">
              <legend className="text-[10px] tracking-[0.4em] uppercase opacity-60 p-0">{t("checkout.shipping_address")}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label={t("checkout.first_name")} name="first_name" autoComplete="given-name" required defaultValue={saved.first_name} data-testid="checkout-first" />
                <Field label={t("checkout.last_name")} name="last_name" autoComplete="family-name" required defaultValue={saved.last_name} data-testid="checkout-last" />
              </div>
              <Field label={t("checkout.address")} name="address" autoComplete="address-line1" required defaultValue={saved.address} data-testid="checkout-address" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label={t("checkout.city")} name="city" autoComplete="address-level2" required defaultValue={saved.city} data-testid="checkout-city" />
                <Field label={t("checkout.zip")} name="zip" autoComplete="postal-code" required defaultValue={saved.zip} data-testid="checkout-zip" />
                <Field label={t("checkout.country")} name="country" autoComplete="country" defaultValue={saved.country || (lang === "ru" ? "RU" : "US")} required data-testid="checkout-country" />
              </div>
              <Field label={`${t("checkout.phone")} (${t("checkout.optional")})`} name="phone" type="tel" autoComplete="tel" defaultValue={saved.phone} data-testid="checkout-phone" />
            </fieldset>

            {/* Payment — redirect to Xendit hosted page */}
            <fieldset className="space-y-3 border-0 p-0 m-0">
              <legend className="text-[10px] tracking-[0.4em] uppercase opacity-60 p-0">{t("checkout.payment")}</legend>
              <p id={noteId} className="text-sm opacity-80">
                {t("checkout.redirect_note")}
              </p>
            </fieldset>

            {/* Live status (polite) + error (assertive) */}
            <p className="sr-only" role="status" aria-live="polite">{status}</p>
            {error && (
              <p id={errorId} role="alert" className="text-sm text-red-700" data-testid="checkout-error">
                {error}
              </p>
            )}

            <button
              ref={submitBtnRef}
              type="submit"
              className="axum-btn w-full"
              disabled={orderDisabled}
              aria-describedby={error ? `${noteId} ${errorId}` : noteId}
              data-testid="place-order"
            >
              {submitting ? t("checkout.placing") : `${t("checkout.place_order")} — ${formatPrice(total, currency || "USD")}`}
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
                    aria-label={t("checkout.promo")}
                    className="flex-1 ck-input"
                    style={{ height: 44, padding: "10px 12px", textTransform: "uppercase", letterSpacing: "0.15em" }}
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
