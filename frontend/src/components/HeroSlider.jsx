import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HeroSlider = () => {
  const { lang, t } = useLang();
  const [slides, setSlides] = useState([]);
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const fetchSlides = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/hero`, { params: { lang } });
      setSlides(data || []);
    } catch (e) {
      console.error("hero fetch failed", e);
    }
  }, [lang]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 6500);
    return () => clearTimeout(timerRef.current);
  }, [active, slides.length]);

  const go = (dir) => {
    if (slides.length === 0) return;
    setActive((i) => (i + dir + slides.length) % slides.length);
  };

  const startX = useRef(0);
  const onTouchStart = (e) => { startX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  if (!slides.length) {
    return <div className="h-screen w-full bg-black" data-testid="hero-loading" />;
  }

  return (
    <section
      className="relative w-full h-screen overflow-hidden axum-border-b"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      data-testid="hero-slider"
    >
      <div className="hero-track" style={{ transform: `translateX(-${active * 100}%)` }}>
        {slides.map((s, idx) => (
          <div
            key={s.id || idx}
            className={`hero-slide ${idx === active ? "active" : ""}`}
            data-testid={`hero-slide-${idx}`}
          >
            <img src={s.image} alt={s.headline} draggable={false} />
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-3 md:px-5 pointer-events-none">
        <button
          onClick={() => go(-1)}
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-black axum-ease hover:bg-black hover:text-white border border-black/0 hover:border-black"
          data-testid="hero-prev"
          aria-label="Previous slide"
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <button
          onClick={() => go(1)}
          className="pointer-events-auto w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-black axum-ease hover:bg-black hover:text-white border border-black/0 hover:border-black"
          data-testid="hero-next"
          aria-label="Next slide"
        >
          <ArrowRight size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className="absolute bottom-6 right-5 md:right-10 text-black font-display text-sm tracking-widest" data-testid="hero-counter">
        {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
};

export default HeroSlider;
