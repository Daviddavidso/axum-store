import React from "react";
import IntroOverlay from "@/components/IntroOverlay";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import BackToTop from "@/components/BackToTop";
import HeroSlider from "@/components/HeroSlider";
import TrendingRail from "@/components/TrendingRail";
import ProductGrid from "@/components/ProductGrid";
import CollectionTiles from "@/components/CollectionTiles";
import VideoCampaign from "@/components/VideoCampaign";
import ScrollTextBand from "@/components/ScrollTextBand";
import CategoryBlocks from "@/components/CategoryBlocks";
import Lookbook from "@/components/Lookbook";
import EditorialStrip from "@/components/EditorialStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import { useLang } from "@/contexts/LanguageContext";
import useScrollFX from "@/hooks/useScrollFX";

const Home = () => {
  const { lang, t } = useLang();

  // Centralised scroll motion (reveal-on-scroll + parallax). Fully gated by
  // prefers-reduced-motion and progressively enhanced — see useScrollFX.
  // Re-scan when the language changes (async-loaded sections remount).
  useScrollFX([lang]);

  return (
    <div className="App" data-testid="axum-app">
      {/* One-shot intro — aria-hidden, non-focusable, never under reduced motion. */}
      <IntroOverlay />
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />
      <BackToTop />

      {/* tabIndex=-1 so the back-to-top control can move keyboard focus to the
          page top, not just the viewport (WCAG 2.4.3). Bottom padding clears the
          md:hidden mobile shop bar + iOS safe area. */}
      <main
        id="top"
        tabIndex={-1}
        className="pt-[72px] pb-[calc(50px+env(safe-area-inset-bottom,0px))] md:pb-0 focus:outline-none"
      >
        {/* The hero is image-only with no visible text headline, so the page's
            single <h1> is visually hidden. It names the page (durable, not a
            seasonal tagline) to give AT users a valid top-level anchor. */}
        <h1 className="sr-only">{t("home.page_h1")}</h1>
        <HeroSlider />
        <Marquee />
        {/* Browse by collection (reference: Balenciaga "explore") — high up so
            the collection-led navigation the client asked for leads the page. */}
        <CollectionTiles />
        {/* Brand film — kinetic AI-transition campaign clip. */}
        <VideoCampaign />
        <TrendingRail />
        {/* tabIndex=-1 so the #shop scroll cue moves keyboard focus here, not
            just the viewport (WCAG 2.4.3). scroll-mt clears the sticky header. */}
        <section id="shop" tabIndex={-1} className="axum-border-t scroll-mt-[72px] focus:outline-none">
          <ProductGrid />
        </section>
        <CategoryBlocks />
        {/* Kinetic slogan band — giant text that slides with scroll. */}
        <ScrollTextBand />
        <EditorialStrip />
        <section id="lookbook">
          <Lookbook />
        </section>
        <section id="manifesto">
          <Newsletter />
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default Home;
