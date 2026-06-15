import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Pause, Play } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Lookbook = () => {
  const { lang, t } = useLang();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [inView, setInView] = useState(false);
  // 2.2.2 Pause, Stop, Hide — user-controlled pause + auto-pause while the
  // section is hovered or holds focus, so the content can't slide away mid-read.
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const sectionRef = useRef(null);
  const fadeKey = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/lookbook`, { params: { lang } });
        setItems(data || []);
      } catch (e) { console.error(e); }
    })();
  }, [lang]);

  // Cross-fade the swapped image whenever the active tile changes.
  useEffect(() => {
    setVisible(false);
    const id = setTimeout(() => setVisible(true), 30);
    fadeKey.current += 1;
    return () => clearTimeout(id);
  }, [active]);

  // Track whether the section is on screen (auto-advance only runs in view).
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { threshold: 0.45 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  // Auto-advance — gated on: in view, more than one tile, not user-paused, and
  // not currently hovered/focused. Any of those flipping cleanly stops the timer.
  useEffect(() => {
    if (!inView || items.length < 2 || paused || interacting) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, 5500);
    return () => clearInterval(id);
  }, [inView, items.length, paused, interacting]);

  if (!items.length) return null;
  const current = items[active];
  const announce = `${current.tab} — ${current.title}`;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="lookbook-heading"
      className="w-full bg-white axum-border-t"
      data-testid="lookbook-section"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={() => setInteracting(false)}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 axum-border-b lg:axum-border-r lg:axum-border-b-0 flex flex-col">
          <div className="p-8 md:p-10 axum-border-b flex items-start justify-between gap-4">
            <div>
              <div className="text-xs tracking-[0.32em] uppercase mb-3">{t("lookbook.eyebrow")}</div>
              <h2 id="lookbook-heading" className="font-display text-4xl md:text-5xl uppercase leading-[0.92]">
                {t("lookbook.title_a")}<br />{t("lookbook.title_b")}
              </h2>
            </div>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={paused ? t("lookbook.play") : t("lookbook.pause")}
                className="shrink-0 mt-1 w-10 h-10 flex items-center justify-center border border-black bg-white text-black hover:bg-black hover:text-white axum-ease focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
                data-testid="lookbook-pause"
              >
                {paused
                  ? <Play size={16} strokeWidth={2} aria-hidden="true" />
                  : <Pause size={16} strokeWidth={2} aria-hidden="true" />}
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            {items.map((it, idx) => (
              <button
                key={it.id || idx}
                onClick={() => setActive(idx)}
                aria-pressed={idx === active}
                className={`text-left px-8 md:px-10 py-6 md:py-8 axum-border-b axum-ease flex items-center justify-between focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky-500 ${
                  idx === active ? "bg-[var(--axum-accent)] text-[#000]" : "bg-white text-black hover:bg-black hover:text-white"
                }`}
                data-testid={`lookbook-tab-${idx}`}
              >
                <div>
                  <div className="text-[10px] tracking-[0.4em] uppercase opacity-70 mb-2">
                    {String(idx + 1).padStart(2, "0")} — {it.tab}
                  </div>
                  <div className="font-display text-xl md:text-2xl uppercase leading-tight">
                    {it.title}
                  </div>
                </div>
                <span className="font-display text-lg ml-4" aria-hidden="true">{idx === active ? "●" : "○"}</span>
              </button>
            ))}
            <div className="p-8 md:p-10 mt-auto">
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-3">{t("lookbook.notes")}</div>
              <p className="text-sm leading-relaxed max-w-md" data-testid="lookbook-description">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 relative overflow-hidden bg-[#f3f2f0]" style={{ minHeight: "70vh" }}>
          <img
            key={fadeKey.current}
            src={current.image}
            alt={current.alt || current.title}
            className={`lookbook-img ${visible ? "visible" : ""} absolute inset-0 w-full h-full object-contain`}
            data-testid="lookbook-image"
          />
          <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 pointer-events-none">
            <div className="bg-black/80 px-3 py-2 inline-block">
              <div className="text-[10px] tracking-[0.4em] uppercase text-white">
                {t("lookbook.volume")} {String(active + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-2xl md:text-4xl uppercase leading-none mt-1 text-white">
                {current.tab}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Polite announcement so a screen-reader user hears the new tile when the
          carousel auto-advances (the image swaps without moving focus). */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="lookbook-status">
        {announce}
      </div>
    </section>
  );
};

export default Lookbook;
