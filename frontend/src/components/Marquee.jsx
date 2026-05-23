import React from "react";

const items = [
  "AUTUMN / WINTER 25 — VOLUME 04",
  "FREE SHIPPING ABOVE €420",
  "MADE IN PARIS · TOKYO · NY",
  "EDITIONS UNDER 200 PIECES",
  "DISCIPLINE OVER DECORATION",
];

const Marquee = () => {
  const text = items.join("   ·   ");
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
