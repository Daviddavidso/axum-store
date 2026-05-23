import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";

const LanguageToggle = ({ scrolled }) => {
  const { lang } = useLang();
  const navigate = useNavigate();
  const location = useLocation();

  const switchTo = (target) => {
    if (target === lang) return;
    const newPath = location.pathname.replace(/^\/(en|ru)/, `/${target}`);
    navigate(newPath + location.search + location.hash);
  };

  const base = "px-2 py-1 text-xs tracking-[0.18em] uppercase font-display axum-ease";
  const onColor = scrolled ? "#000" : "#fff";
  return (
    <div
      className="flex items-center gap-1 select-none"
      style={{ color: onColor, mixBlendMode: scrolled ? "normal" : "difference" }}
      data-testid="language-toggle"
    >
      <button
        onClick={() => switchTo("en")}
        className={`${base}`}
        style={{
          opacity: lang === "en" ? 1 : 0.5,
          textDecoration: lang === "en" ? "underline" : "none",
          textUnderlineOffset: 4,
        }}
        data-testid="lang-en"
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <span className="opacity-50 text-xs">/</span>
      <button
        onClick={() => switchTo("ru")}
        className={`${base}`}
        style={{
          opacity: lang === "ru" ? 1 : 0.5,
          textDecoration: lang === "ru" ? "underline" : "none",
          textUnderlineOffset: 4,
        }}
        data-testid="lang-ru"
        aria-pressed={lang === "ru"}
      >
        RU
      </button>
    </div>
  );
};

export default LanguageToggle;
