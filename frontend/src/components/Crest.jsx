import React from "react";

/**
 * AXUM crest / emblem — a symmetrical gothic mark drawn in currentColor so it
 * adapts to any surface (light grey on the dark theme, inverts on light chips).
 *
 * Accessibility (accessibility-lead sign-off):
 *   • Purely decorative by default: the SVG is aria-hidden + focusable="false",
 *     so it is never announced and never a phantom tab stop. The accessible
 *     name for the brand is carried by the wrapping link/text ("AXUM home").
 *   • Set `title` (+ pass a non-empty `label`) only when the crest stands ALONE
 *     as the brand mark with no adjacent "AXUM" text — then it becomes
 *     role="img" with an accessible name.
 *   • Geometry is mirror-symmetric about the vertical axis and settles static
 *     (no animation here) — safe under prefers-reduced-motion.
 */
const Crest = ({ size = 28, label = "", className = "", ...rest }) => {
  const decorative = !label;
  const a11y = decorative
    ? { "aria-hidden": "true" }
    : { role: "img", "aria-label": label };

  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={(size * 150) / 120}
      focusable="false"
      className={`select-none ${className}`}
      style={{ display: "block", fill: "currentColor" }}
      {...a11y}
      {...rest}
    >
      {/* Central blade / spire */}
      <path d="M60 4 L66 40 L60 58 L54 40 Z" />
      {/* Inner pair of fangs descending from the centre */}
      <path d="M60 60 L70 96 L60 146 L50 96 Z" />
      {/* Mid wing flares (left + mirrored right) */}
      <path d="M54 30 L20 52 L40 60 L50 74 L56 58 Z" />
      <path d="M66 30 L100 52 L80 60 L70 74 L64 58 Z" />
      {/* Outer wing tips */}
      <path d="M40 60 L8 88 L34 84 L48 100 L46 78 Z" />
      <path d="M80 60 L112 88 L86 84 L72 100 L74 78 Z" />
      {/* Lower inner barbs */}
      <path d="M50 96 L34 116 L52 112 L60 132 L56 104 Z" />
      <path d="M70 96 L86 116 L68 112 L60 132 L64 104 Z" />
    </svg>
  );
};

export default Crest;
