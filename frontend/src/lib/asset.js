// Asset URL helper. On a project GitHub Pages deploy the site lives under a
// sub-path (e.g. /axum-store/), so root-absolute asset paths like /products/x.jpg
// would 404. CRA injects the sub-path as process.env.PUBLIC_URL at build time;
// prepend it to every static asset URL. On localhost / root deploys PUBLIC_URL is
// "" so these are no-ops.
//
// IMPORTANT: idempotent. Some sources (e.g. staticApi.withBase) already prepend
// BASE before the JSON reaches a component, and that same string then flows into
// the cart (which persists it to localStorage) and is later re-rendered through
// asset() again — without the guard below we'd build "/axum-store/axum-store/…"
// and 404 the image. Re-applying asset() to an already-prefixed value is a no-op.
const BASE = process.env.PUBLIC_URL || "";

/** Prefix a single root-absolute asset path with the deploy base. Idempotent. */
export const asset = (p) => {
  if (typeof p !== "string" || !p.startsWith("/")) return p;
  if (!BASE) return p;
  // already-prefixed (exact match or starts with BASE/) — leave it alone
  if (p === BASE || p.startsWith(BASE + "/")) return p;
  return `${BASE}${p}`;
};

/** Prefix every URL inside a srcSet string ("a.jpg 1x, b.jpg 2x"). */
export const assetSrcSet = (s) =>
  typeof s === "string"
    ? s
        .split(",")
        .map((part) => {
          const seg = part.trim().split(/\s+/);
          seg[0] = asset(seg[0]);
          return seg.join(" ");
        })
        .join(", ")
    : s;

export default asset;
