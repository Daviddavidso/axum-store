import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { COLLECTIONS, collectionHref } from "@/lib/collections";
import { asset } from "@/lib/asset";

/**
 * CollectionTiles — kinetic, editorial "Explore the collections" grid.
 *
 * Reference vocabulary: Balenciaga / Bottega Veneta / Acne Studios. Photo and
 * type live in SEPARATE rows so the image breathes; type sits on the site
 * surface (no chunky black caption band). Hover triggers a cross-fade to a
 * second photo, an animated underline draw under the CTA, and the eyebrow
 * cycles to a piece-count chip — quiet movement, never wobbly.
 *
 * Accessibility (accessibility-lead checklist + house patterns):
 *   • Each tile is ONE <Link> wrapping the whole card — no nested interactives.
 *     Both photos carry alt="" because the visible <h3> already names the
 *     collection (WCAG 1.1.1). Accessible name comes from the link aria-label.
 *   • The eyebrow swap and piece-count chip are aria-hidden purely decorative
 *     overlays — they never change the link's accessible name.
 *   • Whole-tile focus uses .tile-link's two-tone ring (white halo + dark),
 *     stays visible over any photo on the dark theme (WCAG 2.4.7 / 2.4.13).
 *   • All motion (image scale, mask reveals, underline draw, cross-fade) is
 *     gated by prefers-reduced-motion in CSS — content stays fully visible
 *     and static when reduced (WCAG 2.3.3).
 *   • Tile is a labelled landmark group; <h3> siblings under the page <h1>.
 */
const CollectionTiles = () => {
  const { lang, t } = useLang();

  return (
    <section
      className="w-full axum-border-t ctiles"
      aria-labelledby="collections-title"
      data-testid="collection-tiles"
    >
      <div className="px-5 md:px-10 pt-8 md:pt-12 pb-5 md:pb-7">
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

      <div className="ctiles-grid">
        {COLLECTIONS.map((c, i) => {
          const name = c.label[lang] || c.label.en;
          const eye = c.eyebrow ? (c.eyebrow[lang] || c.eyebrow.en) : null;
          const indexStr = String(i + 1).padStart(2, "0");
          return (
            <Link
              key={c.slug}
              to={collectionHref(lang, c)}
              className="tile-link ctile reveal group"
              style={{ "--rd": `${i * 0.07}s` }}
              aria-label={t("collections.cta_aria").replace("{name}", name)}
              data-testid={`collection-tile-${c.slug}`}
            >
              {/* PHOTO ─ two stacked images, cross-fade on hover. */}
              <div className="ctile-media" aria-hidden="true">
                <img
                  src={asset(c.img)}
                  alt=""
                  loading="lazy"
                  className="ctile-img ctile-img--front"
                />
                {c.imgAlt ? (
                  <img
                    src={asset(c.imgAlt)}
                    alt=""
                    loading="lazy"
                    className="ctile-img ctile-img--back"
                  />
                ) : null}

                {/* Decorative top-right meta chip — index of the tile in the
                    grid. Replaced by a piece-count chip on hover (CSS swap). */}
                <div className="ctile-chip" aria-hidden="true">
                  <span className="ctile-chip__idx">N°{indexStr}</span>
                  <span className="ctile-chip__pieces">
                    {c.pieces} {t("collections.pieces")}
                  </span>
                </div>
              </div>

              {/* TEXT ─ on its own surface row beneath the photo. */}
              <div className="ctile-body">
                {eye ? (
                  <div className="ctile-eyebrow" aria-hidden="true">
                    <span>{eye}</span>
                    <span className="ctile-eyebrow-dot">·</span>
                    <span>N°{indexStr}</span>
                  </div>
                ) : null}

                <h3 className="ctile-title">
                  {/* Mask-reveal wrapper — heading slides up from below a clip
                      on .in (set by useScrollFX). Reduced-motion safe (CSS). */}
                  <span className="ctile-title__mask">
                    <span className="ctile-title__inner">{name}</span>
                  </span>
                </h3>

                <span className="ctile-cta" aria-hidden="true">
                  <span className="ctile-cta__label">{t("collections.cta")}</span>
                  <span className="ctile-cta__line" />
                  <span className="ctile-cta__arrow">→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CollectionTiles;
