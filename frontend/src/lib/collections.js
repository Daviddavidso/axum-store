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
  // Each tile's main `img` is the resting photo; `imgAlt` is the cross-fade on
  // hover. The four alt photos are HAND-PICKED to be UNIQUE — none is the main
  // of another tile, so a hovered tile never matches a neighbouring resting
  // tile and tiles can't look like duplicates.
  {
    slug: "new",
    img: "/products/col-new-violet-corset.jpg",
    imgAlt: "/products/dsc-05198-fuchsia-corset-cargo.jpg",
    pieces: 12,
    cat: { en: "NEW COLLECTION", ru: "НОВАЯ КОЛЛЕКЦИЯ" },
    label: { en: "New Collection", ru: "Новая коллекция" },
    eyebrow: { en: "Drop 04", ru: "Дроп 04" },
  },
  {
    slug: "dresses",
    img: "/products/axum-red-sheer-slip-dress.jpg",
    imgAlt: "/products/dsc-05434-ivory-pleat-back.jpg",
    pieces: 8,
    cat: { en: "DRESSES", ru: "ПЛАТЬЯ" },
    label: { en: "Dresses", ru: "Платья" },
    eyebrow: { en: "Evening", ru: "Вечер" },
  },
  {
    slug: "sets",
    img: "/products/col-sets-ivory-bustier.jpg",
    imgAlt: "/products/dsc-04491-graphite-zip-bustier.jpg",
    pieces: 10,
    cat: { en: "SETS", ru: "КОМПЛЕКТЫ" },
    label: { en: "Sets", ru: "Комплекты" },
    eyebrow: { en: "Two-piece", ru: "Две вещи" },
  },
  {
    slug: "streetwear",
    img: "/products/col-streetwear-onyx-wideleg.jpg",
    imgAlt: "/products/dsc-04772-onyx-hood-front.jpg",
    pieces: 14,
    cat: { en: "STREETWEAR", ru: "СТРИТВИР" },
    label: { en: "Streetwear", ru: "Стритвир" },
    eyebrow: { en: "Everyday", ru: "Каждый день" },
  },
];

/** Build the catalog deep-link for a collection in the given language. */
export const collectionHref = (lang, c) =>
  `/${lang}/catalog?category=${encodeURIComponent(c.cat[lang] || c.cat.en)}`;
