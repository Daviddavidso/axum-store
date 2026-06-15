import React, { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import CatalogPage from "@/pages/CatalogPage";
import ProductPage from "@/pages/ProductPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import AboutPage from "@/pages/AboutPage";
import AdminPage from "@/pages/AdminPage";
import AuthCallback from "@/components/AuthCallback";
import { LangProvider, useLang } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SmoothScrollProvider } from "@/contexts/SmoothScrollContext";
import { t as translate } from "@/i18n";

const detectBrowserLang = () => {
  if (typeof navigator === "undefined") return "en";
  const langs = (navigator.languages || [navigator.language || "en"]).map((s) => (s || "").toLowerCase());
  for (const l of langs) {
    if (l.startsWith("ru")) return "ru";
    if (l.startsWith("en")) return "en";
  }
  return "en";
};

const RootRedirect = () => {
  const target = `/${detectBrowserLang()}`;
  return <Navigate to={target} replace />;
};

const LocalizedHome = () => (
  <LangProvider>
    <Home />
  </LangProvider>
);

const LocalizedCatalog = () => (
  <LangProvider>
    <CatalogPage />
  </LangProvider>
);

const LocalizedProduct = () => (
  <LangProvider>
    <ProductPage />
  </LangProvider>
);

const LocalizedCheckout = () => (
  <LangProvider>
    <CheckoutPage />
  </LangProvider>
);

const LocalizedConfirmation = () => (
  <LangProvider>
    <OrderConfirmationPage />
  </LangProvider>
);

const LocalizedAbout = () => (
  <LangProvider>
    <AboutPage />
  </LangProvider>
);

// Admin uses lang from URL search/hash OR defaults to en; admin UI is mostly English.
const AdminWrapper = () => {
  // We allow admin UI to render in EN by default; we still expose t() for strings.
  const lang = (typeof window !== "undefined" && (window.location.pathname.startsWith("/ru") ? "ru" : "en")) || "en";
  const t = (key) => translate(lang, key);
  return <AdminPage t={t} />;
};

const AppRouter = () => {
  const location = useLocation();
  // Synchronous detection of OAuth callback hash before normal routes render
  if (location.hash && location.hash.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/admin" element={<AdminWrapper />} />
      <Route path="/:lang/catalog" element={<LocalizedCatalog />} />
      <Route path="/:lang/product/:id" element={<LocalizedProduct />} />
      <Route path="/:lang/checkout" element={<LocalizedCheckout />} />
      <Route path="/:lang/order/confirmation" element={<LocalizedConfirmation />} />
      <Route path="/:lang" element={<LocalizedHome />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || "/"}>
      <AuthProvider>
        <CartProvider>
          <SmoothScrollProvider>
            <Toaster position="bottom-center" theme="light" />
            <AppRouter />
          </SmoothScrollProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
