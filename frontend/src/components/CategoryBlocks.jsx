import React from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/SplitText";
import { useLang } from "@/contexts/LanguageContext";
import { asset } from "@/lib/asset";

/**
 * CategoryBlocks — two full-width editorial "shop by category" tiles
 * (I.AM.GIA-style), kept in the AXUM black/white system.
 *
 * Accessibility (accessibility-lead sign-off — B1 applied):
 *   • Each tile is ONE link (the whole tile is the <Link>) — no nested anchors.
 *     The accessible name is the visible heading + CTA text, and the two CTAs
 *     are DISTINCT ("Shop tops" / "Shop sets") so the links are
 *     self-describing out of context (WCAG 2.4.4).
 *   • The photo is decorative (alt="") because the <h2> already names the
 *     category — no duplicate announcement (WCAG 1.1.1).
 *   • B1 — contrast: the white text/CTA sit over a bottom gradient that reaches
 *     90% black directly behind the text (from-black/90). 90% composited black
 *     gives white text well above 4.5:1, independent of the photo pixels
 *     (WCAG 1.4.3).
 *   • Keyboard focus uses the .tile-link two-tone ring (white halo + black) so
 *     it stays visible over any image (2.4.7 / 2.4.13). :focus-visible only.
 *   • Headings are flat <h2> siblings under the page's single <h1>.
 *   • Scroll entrance via the reduced-motion-gated `reveal`.
 */
const TILES = [
  {
    key: "tops",
    img: "/products/col-new-violet-corset.jpg",
    nameKey: "categories.tops_name",
    ctaKey: "categories.tops_cta",
  },
  {
    key: "sets",
    img: "/products/col-onyx-hood-set.jpg",
    nameKey: "categories.sets_name",
    ctaKey: "categories.sets_cta",
  },
];

const CategoryBlocks = () => {
  const { lang, t } = useLang();

  return (
    <section
      className="w-full bg-white axum-border-t"
      aria-labelledby="categories-title"
      data-testid="category-blocks"
    >
      <h2 id="categories-title" className="sr-only">
        {t("categories.eyebrow")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {TILES.map((tile, i) => (
          <Link
            key={tile.key}
            to={`/${lang}/catalog`}
            className="tile-link reveal group relative block overflow-hidden bg-black"
            style={{ minHeight: "min(80vh, 680px)", "--rd": `${i * 0.08}s` }}
            data-testid={`category-tile-${tile.key}`}
          >
            {/* Decorative — the heading names the category. */}
            <img
              src={asset(tile.img)}
              alt=""
              loading="lazy"
              className="wipe absolute inset-0 w-full h-full object-cover object-center axum-ease group-hover:scale-[1.04]"
            />
            {/* B1 scrim — reaches 90% black behind the text at the bottom. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute left-6 bottom-6 md:left-10 md:bottom-10 right-6 z-10">
              <SplitText
                as="h3"
                className="font-display text-3xl md:text-5xl uppercase leading-none tracking-tighter text-white"
                text={t(tile.nameKey)}
              />
              <span className="campaign-cta mt-5 inline-block bg-white text-black border border-black px-7 py-3 text-[11px] tracking-[0.3em] uppercase font-display">
                {t(tile.ctaKey)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryBlocks;
