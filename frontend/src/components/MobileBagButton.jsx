import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Layers, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useLang } from "@/contexts/LanguageContext";

/**
 * Mobile-only bottom shop drawer (sticky bar) with three quick shortcuts:
 *   NEW ARRIVALS · COLLECTIONS · BAG (live count)
 * Replaces the previous floating bag button.
 */
const MobileBagButton = () => {
  const { count, setDrawerOpen } = useCart();
  const { lang, t } = useLang();
  const navigate = useNavigate();

  const Cell = ({ icon: Icon, label, onClick, testid, right }) => (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3.5 axum-ease text-white hover:bg-white hover:text-black ${right ? "" : "border-r border-white/30"}`}
      data-testid={testid}
    >
      <Icon size={16} strokeWidth={1.5} />
      <span className="font-display text-[11px] tracking-[0.22em] uppercase">{label}</span>
    </button>
  );

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black text-white border-t border-black flex"
      data-testid="mobile-shop-drawer"
    >
      <Cell
        icon={Sparkles}
        label={t("nav.new")}
        onClick={() => navigate(`/${lang}/catalog?new=1`)}
        testid="mobile-drawer-new"
      />
      <Cell
        icon={Layers}
        label={t("nav.collections")}
        onClick={() => { navigate(`/${lang}`); setTimeout(() => { const el = document.getElementById("lookbook"); el && el.scrollIntoView({ behavior: "smooth" }); }, 100); }}
        testid="mobile-drawer-collections"
      />
      <Cell
        icon={ShoppingBag}
        label={`${t("cart.title").toUpperCase()} (${count})`}
        onClick={() => setDrawerOpen(true)}
        testid="mobile-drawer-bag"
        right
      />
    </div>
  );
};

export default MobileBagButton;
