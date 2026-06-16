import React from "react";
import SiteHeader from "@/components/SiteHeader";
import CartDrawer from "@/components/CartDrawer";
import MobileBagButton from "@/components/MobileBagButton";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";

const AboutPage = () => {
  const { t } = useLang();
  return (
    <div className="App bg-white min-h-screen" data-testid="about-page">
      <SiteHeader variant="solid" />
      <CartDrawer />
      <MobileBagButton />
      <main className="pt-[88px] pb-[calc(50px+env(safe-area-inset-bottom,0px))] md:pb-0">
        <section className="px-5 md:px-10 py-16 md:py-24 axum-border-b">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("about.eyebrow")}</div>
          <h1 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.88]">
            {t("about.title_a")}<br />{t("about.title_b")}
          </h1>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 axum-border-b">
          <div className="p-8 md:p-14 axum-border-b md:axum-border-b-0 md:axum-border-r">
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("about.studio_eyebrow")}</div>
            <p className="text-sm md:text-base leading-relaxed">{t("about.studio_text")}</p>
          </div>
          <div className="p-8 md:p-14">
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{t("about.philosophy_eyebrow")}</div>
            <p className="font-display uppercase text-2xl md:text-3xl leading-tight">{t("about.philosophy_text")}</p>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
};

export default AboutPage;
