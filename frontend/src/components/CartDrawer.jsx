import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag, Heart, Tag, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { useCart, formatPrice } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";
import { asset } from "@/lib/asset";

/**
 * CartDrawer — full-featured shopping bag (Amazon / Zara / Balenciaga vocabulary).
 *
 * Features:
 *   • Persistent line items + wishlist + promo code (localStorage, see CartContext).
 *   • Quantity stepper, line-level remove, "save for later" (move to wishlist).
 *   • Free-shipping progress bar with copy that updates as you add pieces.
 *   • Promo code input with clear success/error feedback (toast + inline state).
 *   • Summary block: subtotal / discount / shipping / total (sticky at bottom).
 *   • Empty state with "Continue shopping" CTA.
 *
 * Accessibility (accessibility-lead checklist):
 *   • Dialog: role=dialog + aria-modal, aria-labelledby pointing at the title,
 *     Escape closes, body scroll lock while open, focus moves into the dialog
 *     and a focus trap keeps Tab inside (WCAG 2.1.2 / 2.4.3).
 *   • Focus return — owned by SiteHeader's bag button trigger.
 *   • Totals are wrapped in aria-live=polite so screen readers announce when
 *     subtotal/total update after qty changes (cond. discovery, not interruption).
 *   • Each control has a real accessible name; qty input is a button stepper
 *     (no spinner) so screen readers report increase/decrease intent clearly.
 *   • Progress bar pairs <progress> visual with text label — never colour-only.
 *   • Promo error/success communicated via toast AND inline text (cond 1.4.1).
 *   • Reduced motion: drawer transition stays (full-window movement is opt-in
 *     via opening the drawer), but the soft pulse on free-ship unlock is gated.
 */
const CartDrawer = () => {
  const {
    items, count, subtotal, currency,
    drawerOpen, setDrawerOpen, removeItem, setQty, clear, moveToWishlist,
    promo, applyPromo, removePromo,
    discount, shipping, total, freeShipping, remainingToFreeShip,
  } = useCart();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const asideRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  // Dialog behaviour: escape to close + body lock + initial focus.
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); setDrawerOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen, setDrawerOpen]);

  // Focus trap: keep Tab / Shift+Tab inside the dialog (WCAG 2.1.2 / 2.4.3).
  const onTrapKeyDown = (e) => {
    if (e.key !== "Tab") return;
    const root = asideRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const goCheckout = () => {
    setDrawerOpen(false);
    navigate(`/${lang}/checkout`);
  };

  const onApplyPromo = (e) => {
    e?.preventDefault?.();
    const ok = applyPromo(promoInput);
    if (ok) {
      setPromoInput("");
      setPromoError("");
      toast.success(t("cart.promo_applied").replace("{percent}", String(promo?.percent ?? "")));
    } else {
      setPromoError(t("cart.promo_invalid"));
      toast.error(t("cart.promo_invalid"));
    }
  };

  const onSaveForLater = (line) => {
    moveToWishlist(line.lineId);
    toast.success(t("cart.saved_to_wishlist"));
  };

  const onClear = () => {
    if (window.confirm(t("cart.clear_confirm"))) clear();
  };

  // Free-ship progress %: clamp 0..100. Show nothing if cart has zero ship cost
  // because total >= threshold already (we display "unlocked" state instead).
  const progressPct = items.length === 0
    ? 0
    : freeShipping ? 100
      : Math.min(100, Math.round(((subtotal - discount) / Math.max(1, subtotal - discount + remainingToFreeShip)) * 100));

  return (
    <>
      <div
        className={`nav-backdrop ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
        data-testid="cart-backdrop"
      />
      <aside
        ref={asideRef}
        className={`nav-overlay cart-drawer ${drawerOpen ? "open" : ""} flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        onKeyDown={onTrapKeyDown}
        inert={!drawerOpen ? true : undefined}
        data-testid="cart-drawer"
      >
        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="cart-head">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} strokeWidth={1.5} aria-hidden="true" />
            <span id="cart-drawer-title" className="font-display tracking-[0.25em] text-sm uppercase">
              {t("cart.title")} ({count})
            </span>
          </div>
          <div className="flex items-center gap-1">
            {items.length > 0 ? (
              <button
                onClick={onClear}
                className="cart-link-btn"
                data-testid="cart-clear"
                aria-label={t("cart.clear")}
              >
                {t("cart.clear")}
              </button>
            ) : null}
            <button
              ref={closeBtnRef}
              onClick={() => setDrawerOpen(false)}
              className="cart-icon-btn"
              aria-label="Close cart"
              data-testid="close-cart"
            >
              <X size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          // ── EMPTY STATE ──────────────────────────────────────────────
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5" data-testid="cart-empty">
            <ShoppingBag size={28} strokeWidth={1.25} className="opacity-40" aria-hidden="true" />
            <div className="font-display text-2xl uppercase" style={{ color: "#fff" }}>
              {t("cart.empty_title")}
            </div>
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
            {/* ── FREE-SHIP PROGRESS ──────────────────────────────────── */}
            <div className="cart-ship" data-testid="cart-ship-progress">
              <div className="cart-ship__bar" role="progressbar"
                aria-label={t("cart.shipping")}
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPct}>
                <span className="cart-ship__fill" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="cart-ship__copy">
                {freeShipping ? (
                  <span className="cart-ship__unlocked">
                    <Check size={12} strokeWidth={2.4} aria-hidden="true" /> {t("cart.free_ship_reached")}
                  </span>
                ) : (
                  t("cart.free_ship_progress").replace("{amount}", formatPrice(remainingToFreeShip, currency))
                )}
              </div>
            </div>

            {/* ── ITEMS ───────────────────────────────────────────────── */}
            <ul className="cart-lines" data-testid="cart-items">
              {items.map((it) => (
                <li key={it.lineId} className="cart-line" data-testid={`cart-line-${it.lineId}`}>
                  <img
                    src={asset(it.image)}
                    alt={it.name}
                    loading="lazy"
                    className="cart-line__img"
                  />
                  <div className="cart-line__body">
                    <div className="cart-line__name" data-testid={`cart-name-${it.lineId}`}>
                      {it.name}
                    </div>
                    <div className="cart-line__meta">
                      {t("cart.size")}: <span className="cart-line__meta-val">{it.size}</span>
                    </div>

                    <div className="cart-line__row">
                      <div className="cart-qty" role="group" aria-label={t("cart.qty")}>
                        <button
                          type="button"
                          onClick={() => setQty(it.lineId, it.qty - 1)}
                          disabled={it.qty <= 1}
                          className="cart-qty__btn"
                          aria-label={t("cart.qty_decrease")}
                          data-testid={`cart-dec-${it.lineId}`}
                        >
                          <Minus size={12} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                        <span className="cart-qty__val" data-testid={`cart-qty-${it.lineId}`} aria-live="off">
                          {it.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(it.lineId, it.qty + 1)}
                          className="cart-qty__btn"
                          aria-label={t("cart.qty_increase")}
                          data-testid={`cart-inc-${it.lineId}`}
                        >
                          <Plus size={12} strokeWidth={2.2} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="cart-line__actions">
                        <button
                          type="button"
                          onClick={() => onSaveForLater(it)}
                          className="cart-line__action"
                          aria-label={t("cart.save_for_later")}
                          title={t("cart.save_for_later")}
                          data-testid={`cart-save-${it.lineId}`}
                        >
                          <Heart size={15} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(it.lineId)}
                          className="cart-line__action"
                          aria-label={t("cart.remove")}
                          title={t("cart.remove")}
                          data-testid={`cart-remove-${it.lineId}`}
                        >
                          <Trash2 size={15} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="cart-line__price" data-testid={`cart-price-${it.lineId}`}>
                    {formatPrice(it.price_value * it.qty, it.currency)}
                  </div>
                </li>
              ))}
            </ul>

            {/* ── PROMO CODE ─────────────────────────────────────────── */}
            <div className="cart-promo">
              {promo ? (
                <div className="cart-promo__applied" data-testid="cart-promo-applied">
                  <Tag size={14} strokeWidth={1.6} aria-hidden="true" />
                  <span className="cart-promo__code">{promo.code}</span>
                  <span className="cart-promo__pct">−{promo.percent}%</span>
                  <button
                    type="button"
                    onClick={removePromo}
                    className="cart-promo__remove"
                    aria-label={t("cart.promo_remove")}
                    data-testid="cart-promo-remove"
                  >
                    {t("cart.promo_remove")}
                  </button>
                </div>
              ) : (
                <form onSubmit={onApplyPromo} className="cart-promo__form" data-testid="cart-promo-form">
                  <label htmlFor="cart-promo-input" className="cart-promo__label">
                    <Tag size={13} strokeWidth={1.6} aria-hidden="true" />
                    {t("cart.promo_label")}
                  </label>
                  <div className="cart-promo__row">
                    <input
                      id="cart-promo-input"
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value); setPromoError(""); }}
                      placeholder={t("cart.promo_placeholder")}
                      className="cart-promo__input"
                      data-testid="cart-promo-input"
                      aria-invalid={!!promoError}
                      aria-describedby={promoError ? "cart-promo-err" : undefined}
                    />
                    <button
                      type="submit"
                      disabled={!promoInput.trim()}
                      className="cart-promo__apply"
                      data-testid="cart-promo-apply"
                    >
                      {t("cart.promo_apply")}
                    </button>
                  </div>
                  {promoError ? (
                    <div id="cart-promo-err" className="cart-promo__err" role="alert">{promoError}</div>
                  ) : null}
                </form>
              )}
            </div>

            {/* ── SUMMARY + CHECKOUT ─────────────────────────────────── */}
            <div className="cart-foot" aria-live="polite">
              <div className="cart-total-row">
                <span className="cart-total-row__lbl">{t("cart.subtotal")}</span>
                <span className="cart-total-row__val" data-testid="cart-subtotal">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              {discount > 0 ? (
                <div className="cart-total-row cart-total-row--positive">
                  <span className="cart-total-row__lbl">{t("cart.discount")}</span>
                  <span className="cart-total-row__val" data-testid="cart-discount">
                    −{formatPrice(discount, currency)}
                  </span>
                </div>
              ) : null}
              <div className="cart-total-row">
                <span className="cart-total-row__lbl">{t("cart.shipping")}</span>
                <span className="cart-total-row__val" data-testid="cart-shipping">
                  {freeShipping ? t("cart.shipping_free") : formatPrice(shipping, currency)}
                </span>
              </div>
              <div className="cart-total-row cart-total-row--total">
                <span className="cart-total-row__lbl">{t("cart.total")}</span>
                <span className="cart-total-row__val" data-testid="cart-total">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <div className="cart-foot__note">{t("cart.shipping_at_checkout")}</div>
              <button onClick={goCheckout} className="cart-checkout-btn" data-testid="cart-checkout">
                {t("cart.checkout")} <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                onClick={() => { setDrawerOpen(false); navigate(`/${lang}/catalog`); }}
                className="cart-continue-link"
                data-testid="cart-continue"
              >
                {t("cart.continue_shopping")}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
