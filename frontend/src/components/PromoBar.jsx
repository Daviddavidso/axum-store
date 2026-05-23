import React, { useEffect, useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const MESSAGES = {
  en: [
    "FREE EXPRESS SHIPPING ON ORDERS OVER $250",
    "SIGN UP — RECEIVE 10% OFF YOUR FIRST ORDER",
    "ATELIER PARIS · TOKYO · NEW YORK",
    "EDITIONS UNDER 200 PIECES — HAND-FINISHED",
  ],
  ru: [
    "БЕСПЛАТНАЯ ДОСТАВКА ПРИ ЗАКАЗЕ ОТ 18 000 ₽",
    "ПОДПИШИТЕСЬ — ПОЛУЧИТЕ −10% НА ПЕРВЫЙ ЗАКАЗ",
    "АТЕЛЬЕ — ПАРИЖ · ТОКИО · НЬЮ-ЙОРК",
    "ТИРАЖ МЕНЕЕ 200 ВЕЩЕЙ — РУЧНАЯ ОТДЕЛКА",
  ],
};

const PromoBar = () => {
  const { lang } = useLang();
  const list = MESSAGES[lang] || MESSAGES.en;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 4200);
    return () => clearInterval(t);
  }, [list.length]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-black text-white text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-center py-2.5 font-display select-none h-[34px] flex items-center justify-center"
      data-testid="promo-bar"
    >
      <span key={idx} className="inline-block px-4" style={{ animation: "promofade 0.45s ease both" }}>
        {list[idx]}
      </span>
      <style>{`@keyframes promofade { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
};

export default PromoBar;
