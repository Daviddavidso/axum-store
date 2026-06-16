import React from "react";
import { asset } from "@/lib/asset";

/**
 * AXUM crest / logogram — uses the official brand PNG asset (white version
 * for the dark theme; the inline SVG previously here was a placeholder).
 *
 * Decorative by default: the wrapping link's aria-label already names the
 * brand, so the image carries alt="" and is skipped by AT. Pass `label` only
 * when the crest stands alone with no adjacent "AXUM" text.
 */
const Crest = ({ size = 28, label = "", className = "", ...rest }) => {
  const decorative = !label;
  const a11y = decorative ? { "aria-hidden": "true", alt: "" } : { alt: label };
  return (
    <img
      src={asset("/brand/axum-logogram-white.png")}
      draggable={false}
      style={{ height: `${size}px`, width: "auto", display: "block" }}
      className={`select-none ${className}`}
      {...a11y}
      {...rest}
    />
  );
};

export default Crest;
