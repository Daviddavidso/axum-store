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
  {
    slug: "new",
    img: "/products/col-new-violet-corset.jpg",
    cat: { en: "NEW COLLECTION", ru: "НОВАЯ КОЛЛЕКЦИЯ" },
    label: { en: "New Collection", ru: "Новая коллекция" },
  },
  {
    slug: "dresses",
    img: "/products/axum-red-sheer-slip-dress.jpg",
    cat: { en: "DRESSES", ru: "ПЛАТЬЯ" },
    label: { en: "Dresses", ru: "Платья" },
  },
  {
    slug: "sets",
    img: "/products/col-sets-ivory-bustier.jpg",
    cat: { en: "SETS", ru: "КОМПЛЕКТЫ" },
    label: { en: "Sets", ru: "Комплекты" },
  },
  {
    slug: "streetwear",
    img: "/products/col-streetwear-onyx-wideleg.jpg",
    cat: { en: "STREETWEAR", ru: "СТРИТВИР" },
    label: { en: "Streetwear", ru: "Стритвир" },
  },
];

/** Build the catalog deep-link for a collection in the given language. */
export const collectionHref = (lang, c) =>
  `/${lang}/catalog?category=${encodeURIComponent(c.cat[lang] || c.cat.en)}`;
