import React from "react";

const EditorialStrip = () => {
  return (
    <section className="w-full bg-white axum-border-t axum-border-b" data-testid="editorial-strip">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="p-8 md:p-12 axum-border-b md:axum-border-b-0 md:axum-border-r reveal">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">Manifesto</div>
          <p className="font-display text-2xl md:text-3xl uppercase leading-tight">
            Objects sized to the body. Lines sized to the room.
          </p>
        </div>
        <div className="p-8 md:p-12 axum-border-b md:axum-border-b-0 md:axum-border-r reveal">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">Studio</div>
          <p className="text-sm leading-relaxed">
            AXUM is a Paris-based studio working in tailoring, leatherwork and ceremonial garments.
            We design slowly, in editions of less than two hundred pieces, and we refuse to repeat
            what has already been said.
          </p>
        </div>
        <div className="p-8 md:p-12 reveal flex flex-col justify-between">
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">Index</div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>Established</span><span className="font-display">MMXIX</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>Pieces per edition</span><span className="font-display">≤ 200</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>Ateliers</span><span className="font-display">03</span>
              </li>
              <li className="flex justify-between">
                <span>Stockists</span><span className="font-display">17</span>
              </li>
            </ul>
          </div>
          <a href="#manifesto" className="axum-link mt-6" data-testid="editorial-cta">Read the manifesto →</a>
        </div>
      </div>
    </section>
  );
};

export default EditorialStrip;
