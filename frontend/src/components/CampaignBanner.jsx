import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";

/**
 * CampaignBanner — a single FULL-BLEED studio band on the home page.
 *
 * Accessibility (accessibility-lead sign-off):
 *   • The band uses a real absolutely-positioned <img> with localised alt (NOT a
 *     CSS background-image) so the image stays in the a11y tree (WCAG 1.1.1). The
 *     photo carries no baked-in text, so the RU alt is fully Russian.
 *   • The band is a named landmark: aria-labelledby → an sr-only <h2> giving the
 *     SECTION NAME (not the alt) to avoid double-announcing.
 *   • The catalog CTA is a navigation control, so it is an <a> (Link) styled as a
 *     button — not a <button>. It is a solid white chip (black text/border) so its
 *     contrast is self-contained and photo-independent (1.4.3 / 1.4.11).
 *   • Focus indicator is a two-tone ring (white halo + black) via .campaign-cta in
 *     index.css, so it stays visible over the photo (2.4.7 / 2.4.13). :focus-visible.
 *   • min-height uses min(90vh, 760px) so the band never crops the CTA at extreme
 *     zoom / short viewports (1.4.10). Image is below the fold → lazy-loaded.
 *   • The portrait photo is shown object-cover object-top so the model's face is
 *     preserved when the band crops the bottom; the alt describes the full look so
 *     nothing meaningful is lost to the crop.
 *   • Scroll entrance uses the centrally reduced-motion-gated `reveal`.
 */
const CampaignBanner = () => {
  const { lang, t } = useLang();
  const bandStyle = { minHeight: "min(90vh, 760px)" };

  return (
    <>
      {/* Band — full-bleed studio shot with catalog CTA */}
      <section
        className="reveal relative w-full overflow-hidden bg-white"
        style={bandStyle}
        aria-labelledby="campaign-studio-title"
        data-testid="campaign-studio-section"
      >
        <h2 id="campaign-studio-title" className="sr-only">
          {t("campaign.studio_section_name")}
        </h2>
        <img
          src="/campaign/hero-dsc04992-1920w.jpg"
          srcSet="/campaign/hero-dsc04992-1280w.jpg 1280w, /campaign/hero-dsc04992-1920w.jpg 1920w, /campaign/hero-dsc04992-2560w.jpg 2560w"
          sizes="100vw"
          alt={t("campaign.studio_alt")}
          width="2560"
          height="3200"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-top"
          data-testid="campaign-studio"
        />
        <div className="absolute left-5 bottom-5 md:left-10 md:bottom-10 z-10">
          <Link
            to={`/${lang}/catalog`}
            data-magnetic
            className="campaign-cta inline-block bg-white text-black border border-black px-7 py-3 text-[11px] tracking-[0.3em] uppercase font-display"
            data-testid="campaign-cta"
          >
            {t("campaign.cta")}
          </Link>
        </div>
      </section>
    </>
  );
};

export default CampaignBanner;
