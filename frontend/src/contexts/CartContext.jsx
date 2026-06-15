import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const KEY = "axum_cart_v1";
const WISH_KEY = "axum_wishlist_v1";
const PROMO_KEY = "axum_promo_v1";

const CartContext = createContext(null);

const load = (k, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v == null ? fallback : v;
  } catch { return fallback; }
};

// Demo promo codes — production wires this to the backend. Codes are
// case-insensitive (we uppercase before lookup) and the discount is a flat
// percent off the subtotal. Easy to extend or move server-side later.
const PROMO_CODES = {
  AXUM10: { percent: 10, label: "AXUM10" },
  AXUM20: { percent: 20, label: "AXUM20" },
  FIRST:  { percent: 15, label: "FIRST" },
};

// Free-shipping threshold per currency. Pick a value that nudges users to add
// another piece without being unreachable.
const FREE_SHIP_THRESHOLD = { RUB: 15000, USD: 150, IDR: 2400000 };
// Flat shipping cost when below threshold (still cleared at checkout for real
// rates; this is the in-drawer estimate).
const FLAT_SHIPPING = { RUB: 590, USD: 8, IDR: 95000 };

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => load(KEY, []));
  const [wishlist, setWishlist] = useState(() => load(WISH_KEY, []));
  const [promo, setPromo] = useState(() => load(PROMO_KEY, null));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_KEY);
  }, [promo]);

  // line key = product_id + size + currency
  const addItem = useCallback((line) => {
    setItems((arr) => {
      const idx = arr.findIndex((x) => x.product_id === line.product_id && x.size === line.size && x.currency === line.currency);
      if (idx >= 0) {
        const copy = [...arr];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + (line.qty || 1) };
        return copy;
      }
      return [...arr, { ...line, qty: line.qty || 1 }];
    });
    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id) => setItems((arr) => arr.filter((x) => x.lineId !== id)), []);
  const setQty = useCallback((id, qty) => setItems((arr) => arr.map((x) => x.lineId === id ? { ...x, qty: Math.max(1, qty) } : x)), []);
  const clear = useCallback(() => { setItems([]); setPromo(null); }, []);

  /** Move a line out of the cart into wishlist (save-for-later pattern). */
  const moveToWishlist = useCallback((lineId) => {
    setItems((arr) => {
      const line = arr.find((x) => x.lineId === lineId);
      if (line && !wishlist.includes(line.product_id)) {
        setWishlist((w) => [...w, line.product_id]);
      }
      return arr.filter((x) => x.lineId !== lineId);
    });
  }, [wishlist]);

  /** Try to apply a promo code; returns true on success. */
  const applyPromo = useCallback((rawCode) => {
    const code = String(rawCode || "").trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromo({ code, ...PROMO_CODES[code] });
      return true;
    }
    return false;
  }, []);
  const removePromo = useCallback(() => setPromo(null), []);

  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + x.qty * (Number(x.price_value) || 0), 0), [items]);
  const currency = items[0]?.currency || null;

  // Derived totals — kept here so every view shows the same numbers.
  const discount = useMemo(() => promo ? Math.round(subtotal * (promo.percent / 100)) : 0, [promo, subtotal]);
  const threshold = currency ? (FREE_SHIP_THRESHOLD[currency] || FREE_SHIP_THRESHOLD.USD) : 0;
  const freeShipping = items.length > 0 && subtotal - discount >= threshold;
  const shipping = items.length === 0
    ? 0
    : (freeShipping ? 0 : (FLAT_SHIPPING[currency] || FLAT_SHIPPING.USD || 0));
  const total = Math.max(0, subtotal - discount + shipping);
  const remainingToFreeShip = Math.max(0, threshold - (subtotal - discount));

  const toggleWish = useCallback((productId) => {
    setWishlist((arr) => (arr.includes(productId) ? arr.filter((x) => x !== productId) : [...arr, productId]));
  }, []);
  const inWishlist = useCallback((id) => wishlist.includes(id), [wishlist]);

  const value = {
    items, count, subtotal, currency,
    addItem, removeItem, setQty, clear, moveToWishlist,
    drawerOpen, setDrawerOpen,
    wishlist, toggleWish, inWishlist,
    promo, applyPromo, removePromo,
    discount, shipping, total, freeShipping, threshold, remainingToFreeShip,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const formatPrice = (value, currency) => {
  if (currency === "RUB") {
    return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
  }
  if (currency === "IDR") {
    return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
  }
  const v = Number(value);
  return v.toFixed(0) === String(v) ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
};
