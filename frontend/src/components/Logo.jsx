import React from "react";

/**
 * AXUM Logo component.
 * Uses the white wordmark with `mix-blend-mode: difference` so it reads correctly
 * on both white and dark backgrounds (becomes black on white, white on dark).
 *
 * Variants:
 *  - "wordmark": full AXUM lockup (default)
 *  - "logogram": square mark only
 *
 * `tone`:
 *  - "adaptive" (default): white asset + difference blend, scales with site
 *  - "black": forces pure black asset (use on guaranteed-white surfaces like footer)
 *  - "white": forces pure white asset (use on guaranteed-dark surfaces)
 */
const Logo = ({
  variant = "wordmark",
  tone = "adaptive",
  height = 28,
  className = "",
  alt = "AXUM",
  ...rest
}) => {
  const file =
    variant === "logogram"
      ? tone === "black"
        ? "/brand/axum-logogram-black.png"
        : "/brand/axum-logogram-white.png"
      : tone === "black"
      ? "/brand/axum-logo-black.png"
      : "/brand/axum-logo-white.png";

  const style = {
    height: `${height}px`,
    width: "auto",
    display: "block",
    transition:
      "height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  if (tone === "adaptive") {
    style.mixBlendMode = "difference";
  }

  return (
    <img
      src={file}
      alt={alt}
      draggable={false}
      style={style}
      className={`select-none ${className}`}
      {...rest}
    />
  );
};

export default Logo;
