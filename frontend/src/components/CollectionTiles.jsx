import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { COLLECTIONS, collectionHref } from "@/lib/collections";
import { asset } from "@/lib/asset";

/**
 * CollectionTiles — "Explore the collections" grid (reference: Balenciaga's
 * EXPLORE OUR SERVICES). Large image tiles that deep-link into the catalog
 * pre-filtered to that collection.
 *
 * Accessibility (accessibility-lead checklist applied):
 *   • Each tile is ONE <Link> wrapping the whole card — no nested interactives.
 *   • The collection photo is decorative (alt="") because the visible <h3>
 *     names the collection; the link's accessible name comes from that text +
 *     the aria-label, which is unique per tile (WCAG 1.1.1 / 2.4.4).
 *   • Whole-tile focus uses the two-tone .tile-link ring (white halo + dark)
 *     so it stays visible over any photo on the dark theme (2.4.7 / 2.4.13).
 *   • Section is a labelled region with a real <h2>; tiles are <h3> siblings —
 *     no skipped heading levels under the page's single <h1>.
 *   • Bottom scrim reaches ~92% black behind the label so white text holds
 *     ≥4.5:1 regardless of the photo pixels (WCAG 1.4.3).
 */
const CollectionTiles = () => {
  const { lang, t } = useLang();

  return (
    <section
      className="w-full bg-white axum-border-t"
      aria-labelledby="collections-title"
      data-testid="collection-tiles"
    >
      <div className="px-5 md:px-10 pt-14 md:pt-20 pb-8 md:pb-10">
        <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--axum-ink-muted)] mb-3">
          {t("collections.eyebrow")}
        </div>
        <h2
          id="collections-title"
          className="font-display uppercase text-4xl md:text-6xl tracking-tighter leading-[0.9]"
        >
          {t("collections.title")}
        </h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {COLLECTIONS.map((c, i) => (
          <Link
            key={c.slug}
            to={collectionHref(lang, c)}
            className="tile-link reveal group relative block overflow-hidden bg-black border-t border-l border-[var(--axum-line)]"
            style={{ minHeight: "min(64vh, 560px)", "--rd": `${i * 0.06}s` }}
            aria-label={t("collections.cta_aria").replace("{name}", c.label[lang] || c.label.en)}
            data-testid={`collection-tile-${c.slug}`}
          >
            {/* Decorative — the <h3> names the collection. */}
            <img
              src={asset(c.img)}
              alt=""
              loading="lazy"
              className="wipe absolute inset-0 w-full h-full object-cover object-center axum-ease group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-transparent" />

            <div className="absolute left-4 bottom-4 md:left-6 md:bottom-6 right-4 z-10">
              <h3 className="font-display text-2xl md:text-3xl uppercase leading-none tracking-tighter text-white">
                {c.label[lang] || c.label.en}
              </h3>
              <span
                aria-hidden="true"
                className="mt-3 inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-white/85 group-hover:text-white"
              >
                {t("collections.cta")} <span className="axum-ease group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CollectionTiles;
