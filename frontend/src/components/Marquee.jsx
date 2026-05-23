import React from "react";
import { useLang } from "@/contexts/LanguageContext";

const Marquee = () => {
  const { strings } = useLang();
  const text = strings.marquee.join("   ·   ");
  return (
    <div className="w-full bg-black text-white axum-border-b overflow-hidden" data-testid="marquee">
      <div className="marquee-track py-3 md:py-4">
        <span className="font-display uppercase tracking-[0.25em] text-sm px-6">{text}</span>
        <span className="font-display uppercase tracking-[0.25em] text-sm px-6" aria-hidden="true">{text}</span>
      </div>
    </div>
  );
};

export default Marquee;
