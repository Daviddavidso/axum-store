import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const KEY = "axum_cart_v1";
const WISH_KEY = "axum_wishlist_v1";

const CartContext = createContext(null);

const load = (k, fallback) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v == null ? fallback : v;
  } catch { return fallback; }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => load(KEY, []));
  const [wishlist, setWishlist] = useState(() => load(WISH_KEY, []));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); }, [wishlist]);

  // line key = product_id + size
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
  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + x.qty * (Number(x.price_value) || 0), 0), [items]);
  const currency = items[0]?.currency || null;

  const toggleWish = useCallback((productId) => {
    setWishlist((arr) => (arr.includes(productId) ? arr.filter((x) => x !== productId) : [...arr, productId]));
  }, []);
  const inWishlist = useCallback((id) => wishlist.includes(id), [wishlist]);

  const value = {
    items, count, subtotal, currency,
    addItem, removeItem, setQty, clear,
    drawerOpen, setDrawerOpen,
    wishlist, toggleWish, inWishlist,
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
  const v = Number(value);
  return v.toFixed(0) === String(v) ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;
};
