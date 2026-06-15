import React, { createContext, useContext, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { STRINGS, t as translate } from "@/i18n";

const LangContext = createContext({ lang: "en", t: (k) => k, strings: STRINGS.en });

export const LangProvider = ({ children }) => {
  const { lang: paramLang } = useParams();
  const lang = paramLang === "ru" ? "ru" : "en";
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(
    () => ({
      lang,
      t: (key) => translate(lang, key),
      strings: STRINGS[lang],
    }),
    [lang]
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
