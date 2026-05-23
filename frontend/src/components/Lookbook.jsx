import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Lookbook = () => {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const fadeKey = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/lookbook`);
        setItems(data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Trigger fade on tab switch
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 30);
    fadeKey.current += 1;
    return () => clearTimeout(t);
  }, [active]);

  // Auto-cycle when in view
  useEffect(() => {
    if (!sectionRef.current || items.length < 2) return;
    let inter;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          inter = setInterval(() => {
            setActive((i) => (i + 1) % items.length);
          }, 5500);
        } else {
          clearInterval(inter);
        }
      });
    }, { threshold: 0.45 });
    io.observe(sectionRef.current);
    return () => { io.disconnect(); clearInterval(inter); };
  }, [items.length]);

  if (!items.length) return null;
  const current = items[active];

  return (
    <div ref={sectionRef} className="w-full bg-white axum-border-t" data-testid="lookbook-section">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: tabs */}
        <div className="lg:col-span-4 axum-border-b lg:axum-border-r lg:axum-border-b-0 flex flex-col">
          <div className="p-8 md:p-10 axum-border-b">
            <div className="text-xs tracking-[0.32em] uppercase mb-3">N°03 / Lookbook</div>
            <h2 className="font-display text-4xl md:text-5xl uppercase leading-[0.92]">
              Volumes<br />of Discipline
            </h2>
          </div>
          <div className="flex-1 flex flex-col">
            {items.map((it, idx) => (
              <button
                key={it.id || idx}
                onClick={() => setActive(idx)}
                className={`text-left px-8 md:px-10 py-6 md:py-8 axum-border-b axum-ease flex items-center justify-between ${
                  idx === active ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
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
                <span className="font-display text-lg ml-4">{idx === active ? "●" : "○"}</span>
              </button>
            ))}
            <div className="p-8 md:p-10 mt-auto">
              <div className="text-[11px] tracking-[0.3em] uppercase opacity-70 mb-3">Notes</div>
              <p className="text-sm leading-relaxed max-w-md" data-testid="lookbook-description">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: dynamic image */}
        <div className="lg:col-span-8 relative overflow-hidden bg-black" style={{ minHeight: "70vh" }}>
          <img
            key={fadeKey.current}
            src={current.image}
            alt={current.title}
            className={`lookbook-img ${visible ? "visible" : ""} absolute inset-0 w-full h-full object-cover`}
            data-testid="lookbook-image"
          />
          <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8 text-white pointer-events-none">
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-80">
              Volume {String(active + 1).padStart(2, "0")}
            </div>
            <div className="font-display text-2xl md:text-4xl uppercase leading-none mt-2">
              {current.tab}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lookbook;
