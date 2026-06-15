import React from "react";
import { useLang } from "@/contexts/LanguageContext";

const EditorialStrip = () => {
  const { t } = useLang();
  return (
    <section className="w-full bg-white axum-border-t axum-border-b" data-testid="editorial-strip">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="p-8 md:p-12 axum-border-b md:axum-border-b-0 md:axum-border-r reveal reveal-3d">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("editorial.manifesto_eyebrow")}</div>
          <p className="font-display text-2xl md:text-3xl uppercase leading-tight">
            {t("editorial.manifesto_text")}
          </p>
        </div>
        <div className="p-8 md:p-12 axum-border-b md:axum-border-b-0 md:axum-border-r reveal reveal-3d" style={{ "--rd": "0.1s" }}>
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("editorial.studio_eyebrow")}</div>
          <p className="text-sm leading-relaxed">{t("editorial.studio_text")}</p>
        </div>
        <div className="p-8 md:p-12 reveal reveal-3d flex flex-col justify-between" style={{ "--rd": "0.2s" }}>
          <div>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("editorial.index_eyebrow")}</div>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("editorial.established")}</span><span className="font-display">MMXIX</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("editorial.pieces")}</span><span className="font-display">≤ 200</span>
              </li>
              <li className="flex justify-between border-b border-black/20 pb-2">
                <span>{t("editorial.ateliers")}</span><span className="font-display">03</span>
              </li>
              <li className="flex justify-between">
                <span>{t("editorial.stockists")}</span><span className="font-display">17</span>
              </li>
            </ul>
          </div>
          <a href="#manifesto" className="axum-link mt-6" data-testid="editorial-cta">{t("editorial.read_manifesto")}</a>
        </div>
      </div>
    </section>
  );
};

export default EditorialStrip;
