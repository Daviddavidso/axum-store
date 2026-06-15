import React from "react";
import { asset } from "@/lib/asset";

/**
 * AXUM Logo component.
 *
 * Tone:
 *  - "adaptive" (default): grey wordmark that animates grey → black on mount.
 *                          For use on solid white headers / inner pages.
 *  - "overlay":            white wordmark with mix-blend-mode difference.
 *                          For use on the transparent hero overlay (auto-inverts).
 *  - "black":              settles immediately to black (no animation).
 *  - "white":              forces pure white asset.
 *
 * Variants:
 *  - "wordmark": full AXUM lockup (default)
 *  - "logogram": square mark only
 */
const Logo = ({
  variant = "wordmark",
  tone = "adaptive",
  height = 28,
  className = "",
  alt = "AXUM",
  ...rest
}) => {
  // Logogram still uses the legacy assets.
  if (variant === "logogram") {
    const file = asset(
      tone === "white"
        ? "/brand/axum-logogram-white.png"
        : "/brand/axum-logogram-black.png"
    );
    const style = {
      height: `${height}px`,
      width: "auto",
      display: "block",
      transition:
        "height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    };
    if (tone === "overlay") style.mixBlendMode = "difference";
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
  }

  // Wordmark — overlay (transparent hero header)
  if (tone === "overlay") {
    return (
      <img
        src={asset("/brand/axum-logo-white.png")}
        alt={alt}
        draggable={false}
        style={{
          height: `${height}px`,
          width: "auto",
          display: "block",
          mixBlendMode: "difference",
          transition: "height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
        className={`select-none ${className}`}
        {...rest}
      />
    );
  }

  // Wordmark — white surface forced
  if (tone === "white") {
    return (
      <img
        src={asset("/brand/axum-logo-white.png")}
        alt={alt}
        draggable={false}
        style={{ height: `${height}px`, width: "auto", display: "block" }}
        className={`select-none ${className}`}
        {...rest}
      />
    );
  }

  // Wordmark — adaptive (grey → black animation) OR black (settled)
  const settled = tone === "black";
  const style = {
    height: `${height}px`,
    width: "auto",
    display: "block",
    filter: settled ? "brightness(0)" : undefined,
    animation: settled
      ? undefined
      : "axum-logo-fade 1400ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
    transition: "height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  return (
    <img
      src={asset("/brand/axum-logo-grey.png")}
      alt={alt}
      draggable={false}
      style={style}
      className={`select-none ${className}`}
      {...rest}
    />
  );
};

export default Logo;
