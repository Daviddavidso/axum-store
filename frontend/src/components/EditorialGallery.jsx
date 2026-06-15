import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// The 3D layer is code-split so the three/r3f bundle never blocks first paint.
const EditorialGalleryCanvas = lazy(() => import("@/components/EditorialGalleryCanvas"));

// --- Capability + preference gates ------------------------------------------
function detectWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}
function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function reducedData() {
  if (typeof navigator !== "undefined" && navigator.connection && navigator.connection.saveData) {
    return true;
  }
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-data: reduce)").matches
  );
}

/**
 * Error boundary for the decorative 3D layer. Any failure silently falls back
 * to the semantic grid (already in the DOM) — no announcement, because the
 * content never disappeared for assistive tech (WCAG 4.1.3 noise avoidance).
 */
class GLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    /* swallow — decorative layer only */
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Editorial scroll-gallery (pmndrs "cards with border radius" style).
 *
 * Two layers:
 *  1. A DECORATIVE WebGL canvas (aria-hidden) — shown only when motion + data +
 *     WebGL allow AND the section is in view.
 *  2. A SEMANTIC <ul> of <figure> cards (real <img alt> + name + price) that is
 *     ALWAYS in the DOM. It is the single source of truth for screen readers,
 *     keyboard users, no-WebGL and reduced-motion visitors. It is visually
 *     hidden only while the 3D layer is actively shown.
 */
const EditorialGallery = () => {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const h2Id = "editorial-gallery-h2";

  const [looks, setLooks] = useState([]);
  const [allowed3D, setAllowed3D] = useState(false);
  const [inView, setInView] = useState(false);

  // Decide whether the decorative layer may run, and react to live changes of
  // the motion preference.
  useEffect(() => {
    const compute = () => setAllowed3D(detectWebGL() && !reducedMotion() && !reducedData());
    compute();
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener?.("change", compute);
    return () => mq.removeEventListener?.("change", compute);
  }, []);

  // Mount the Canvas only while the section is near the viewport (battery/perf).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setInView(e.isIntersecting)),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Curated preview — first 8 looks, same source/language as the catalog.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/products`, { params: { lang } });
        if (alive) setLooks((data || []).slice(0, 8));
      } catch (e) {
        /* noop — the section stays valid; grid simply renders nothing */
      }
    })();
    return () => {
      alive = false;
    };
  }, [lang]);

  const show3D = allowed3D && inView && looks.length > 0;

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby={h2Id}
      className="relative bg-white axum-border-t"
      data-testid="editorial-gallery"
    >
      <div className="px-5 md:px-10 pt-14 md:pt-20">
        <div className="text-[10px] tracking-[0.32em] uppercase mb-3 opacity-60">
          {t("gallery.eyebrow")}
        </div>
        <h2
          id={h2Id}
          className="font-display text-4xl md:text-6xl lg:text-7xl uppercase leading-none tracking-tighter"
        >
          {t("gallery.title")}
        </h2>
        <p className="mt-5 max-w-xl text-sm leading-relaxed opacity-80">{t("gallery.intro")}</p>
      </div>

      {/* DECORATIVE WebGL layer — aria-hidden, zero tab stops. */}
      {show3D && (
        <div
          className="relative w-full h-[70vh] md:h-[80vh] mt-8 select-none"
          aria-hidden="true"
        >
          <GLErrorBoundary>
            <Suspense fallback={null}>
              <EditorialGalleryCanvas looks={looks} />
            </Suspense>
          </GLErrorBoundary>
        </div>
      )}

      {/* SEMANTIC representation — always present. Visually hidden only while the
          3D layer is shown; otherwise it IS the visible responsive grid. */}
      <ul
        className={
          show3D
            ? "sr-only"
            : "grid grid-cols-2 lg:grid-cols-4 gap-x-3 md:gap-x-6 gap-y-10 md:gap-y-16 px-5 md:px-10 mt-10 list-none"
        }
        data-testid="editorial-gallery-list"
      >
        {looks.map((p, idx) => (
          <li key={p.id || idx}>
            <figure className="m-0">
              <img
                src={p.image1}
                alt={p.alt1 || p.name}
                loading="lazy"
                className="w-full object-cover bg-neutral-100"
                style={{ aspectRatio: "3 / 4" }}
              />
              <figcaption className="pt-3 flex items-start justify-between gap-3 font-display text-[11px] md:text-xs tracking-[0.18em] uppercase">
                <span className="truncate">{p.name}</span>
                <span className="whitespace-nowrap">{p.price}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="flex justify-center py-12 md:py-16">
        <button
          type="button"
          onClick={() => navigate(`/${lang}/catalog`)}
          className="axum-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
          data-testid="editorial-gallery-cta"
        >
          {t("gallery.cta")} →
        </button>
      </div>
    </section>
  );
};

export default EditorialGallery;
