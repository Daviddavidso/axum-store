import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// outcome: loading | paid | processing | failed | unknown
const OrderConfirmationPage = () => {
  const { lang, t } = useLang();
  const [params] = useSearchParams();
  const orderId = params.get("order") || "";
  const hint = (params.get("status") || "").toLowerCase();
  const [outcome, setOutcome] = useState("loading");

  // The backend order status (driven by Xendit's webhook) is the source of truth:
  // we never show "paid" on the redirect hint alone. While the webhook is still in
  // flight, a success redirect resolves to "processing".
  useEffect(() => {
    let active = true;
    (async () => {
      if (!orderId) {
        setOutcome("unknown");
        return;
      }
      let dbStatus = "";
      try {
        const { data } = await axios.get(`${API}/payments/orders/${orderId}`);
        dbStatus = data?.status || "";
      } catch {
        /* order not found or network error — fall back to the redirect hint */
      }
      if (!active) return;
      let next;
      if (dbStatus === "paid") next = "paid";
      else if (dbStatus === "failed" || hint === "failed") next = "failed";
      else if (hint === "paid") next = "processing";
      else next = "unknown";
      setOutcome(next);
      if (next === "paid") {
        try {
          sessionStorage.removeItem("axum:checkout");
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [orderId, hint]);

  const titleKey = {
    loading: "confirmation.loading",
    paid: "confirmation.title_paid",
    processing: "confirmation.title_processing",
    failed: "confirmation.title_failed",
    unknown: "confirmation.not_found",
  }[outcome];
  const title = t(titleKey);

  // On a real document load the <title> is the user's first "where am I" cue.
  useEffect(() => {
    if (outcome === "loading") return;
    document.title = `${title} — AXUM`;
  }, [outcome, title]);

  const bodyKey = {
    paid: "confirmation.body_paid",
    processing: "confirmation.body_processing",
    failed: "confirmation.body_failed",
  }[outcome];

  const announce = {
    paid: t("confirmation.announce_paid"),
    processing: t("confirmation.announce_processing"),
    failed: t("confirmation.announce_failed"),
    unknown: t("confirmation.not_found"),
    loading: "",
  }[outcome];
  const isFailure = outcome === "failed";
  const showOrder = orderId && outcome !== "unknown" && outcome !== "loading";
  const showRetry = outcome === "failed" || outcome === "unknown";

  return (
    <div className="App bg-white min-h-screen" data-testid="confirmation-page">
      <SiteHeader variant="solid" />
      <main className="pt-[68px]">
        <section className="px-5 md:px-10 py-16 md:py-24 max-w-2xl">
          {/* Outcome announced once: assertive for failure, polite otherwise. */}
          {announce && (
            <p
              className="sr-only"
              role={isFailure ? "alert" : "status"}
              aria-live={isFailure ? "assertive" : "polite"}
            >
              {announce}
            </p>
          )}

          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-3">{t("confirmation.eyebrow")}</div>
          <h1
            className="font-display uppercase text-4xl md:text-6xl tracking-tighter leading-[0.9]"
            data-testid="confirmation-title"
          >
            {title}
          </h1>

          {bodyKey && (
            <p className="mt-6 text-sm md:text-base opacity-80 max-w-prose" data-testid="confirmation-body">
              {t(bodyKey)}
            </p>
          )}

          {showOrder && (
            <dl className="mt-10 space-y-4 border-t border-black/30 pt-6">
              <div className="flex justify-between gap-6">
                <dt className="text-[10px] tracking-[0.3em] uppercase opacity-60">{t("confirmation.order_label")}</dt>
                <dd className="font-display text-sm" data-testid="confirmation-order">{orderId}</dd>
              </div>
            </dl>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            {showRetry && (
              <Link to={`/${lang}/checkout`} className="axum-btn" data-testid="confirmation-retry">
                {t("confirmation.try_again")}
              </Link>
            )}
            <Link
              to={`/${lang}`}
              className={showRetry ? "axum-btn axum-btn-ghost" : "axum-btn"}
              data-testid="confirmation-home"
            >
              {t("confirmation.back_home")}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;
