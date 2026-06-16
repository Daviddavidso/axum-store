/**
 * AXUM collections — the single source of truth shared by the nav menu, the
 * homepage "Explore the collections" tiles, and the catalog deep-links.
 *
 * `cat` MUST equal the category string the API returns for that language
 * (see backend mock /api/products/categories), so a tile/menu link can preload
 * the filtered catalog by passing ?category=<cat[lang]>. `label` is the display
 * name (Title Case) and may differ from the (UPPERCASE) filter value.
 */
export const COLLECTIONS = [
  // 8 HAND-PICKED HD studio shots (sourced from 2560×3200 DSC originals,
  // downscaled to 1600×2000 at JPG 88% for max impact + reasonable weight).
  // Each tile shows the strongest hero shot at rest, with a contrasting
  // colorway / angle on hover — all 8 photos are unique across the grid.
  {
    slug: "new",
    img: "/products/tile-new-fuchsia.jpg",        // statement fuchsia corset + cargo
    imgAlt: "/products/tile-new-violet.jpg",       // contrast colorway: violet laceup
    pieces: 12,
    cat: { en: "NEW COLLECTION", ru: "НОВАЯ КОЛЛЕКЦИЯ" },
    label: { en: "New Collection", ru: "Новая коллекция" },
    eyebrow: { en: "Drop 04", ru: "Дроп 04" },
  },
  {
    slug: "dresses",
    img: "/products/tile-dresses-red.jpg",         // moody red sheer slip
    imgAlt: "/products/tile-dresses-ivory.jpg",    // contrast: ivory pleated back
    pieces: 8,
    cat: { en: "DRESSES", ru: "ПЛАТЬЯ" },
    label: { en: "Dresses", ru: "Платья" },
    eyebrow: { en: "Evening", ru: "Вечер" },
  },
  {
    slug: "sets",
    img: "/products/tile-sets-ivory.jpg",          // ivory canvas bustier set
    imgAlt: "/products/tile-sets-graphite.jpg",    // contrast: graphite zip bustier
    pieces: 10,
    cat: { en: "SETS", ru: "КОМПЛЕКТЫ" },
    label: { en: "Sets", ru: "Комплекты" },
    eyebrow: { en: "Two-piece", ru: "Две вещи" },
  },
  {
    slug: "streetwear",
    img: "/products/tile-street-onyx-three.jpg",   // dynamic onyx hood, three-quarter
    imgAlt: "/products/tile-street-onyx-front.jpg",// contrast angle: front view
    pieces: 14,
    cat: { en: "STREETWEAR", ru: "СТРИТВИР" },
    label: { en: "Streetwear", ru: "Стритвир" },
    eyebrow: { en: "Everyday", ru: "Каждый день" },
  },
];

/** Build the catalog deep-link for a collection in the given language. */
export const collectionHref = (lang, c) =>
  `/${lang}/catalog?category=${encodeURIComponent(c.cat[lang] || c.cat.en)}`;
