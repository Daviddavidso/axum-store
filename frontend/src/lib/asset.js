// Asset URL helper. On a project GitHub Pages deploy the site lives under a
// sub-path (e.g. /axum-store/), so root-absolute asset paths like /products/x.jpg
// would 404. CRA injects the sub-path as process.env.PUBLIC_URL at build time;
// prepend it to every static asset URL. On localhost / root deploys PUBLIC_URL is
// "" so these are no-ops.
const BASE = process.env.PUBLIC_URL || "";

/** Prefix a single root-absolute asset path with the deploy base. */
export const asset = (p) =>
  typeof p === "string" && p.startsWith("/") ? `${BASE}${p}` : p;

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
