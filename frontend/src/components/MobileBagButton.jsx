import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

const MobileBagButton = () => {
  const { count, setDrawerOpen } = useCart();
  return (
    <button
      onClick={() => setDrawerOpen(true)}
      className="md:hidden fixed bottom-4 right-4 z-40 bg-black text-white flex items-center gap-2 px-4 py-3 border border-black shadow-lg axum-ease hover:bg-white hover:text-black"
      data-testid="mobile-bag-button"
      aria-label="Open cart"
    >
      <ShoppingBag size={18} strokeWidth={1.5} />
      <span className="font-display text-xs tracking-[0.25em] uppercase">BAG ({count})</span>
    </button>
  );
};

export default MobileBagButton;
