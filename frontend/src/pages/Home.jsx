import React, { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import HeroSlider from "@/components/HeroSlider";
import ProductGrid from "@/components/ProductGrid";
import Lookbook from "@/components/Lookbook";
import EditorialStrip from "@/components/EditorialStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import { useLang } from "@/contexts/LanguageContext";

const Home = () => {
  const { lang } = useLang();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  return (
    <div className="App" data-testid="axum-app">
      <SiteHeader variant="transparent" />
      <CartDrawer />
      <MobileBagButton />

      <main id="top">
        <HeroSlider />
        <Marquee />
        <section id="shop" className="axum-border-t">
          <ProductGrid />
        </section>
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
