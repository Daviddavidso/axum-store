import React from "react";

/**
 * GraffitiSticker — hand-drawn abstract spray-mark stickers.
 *
 * Pure SVG path artwork, NO text and NO pseudo-letters (real designers don't
 * fake graffiti with a stroked Impact — it never reads as real). Three presets:
 *   • <SplatterSticker /> — irregular organic splat + satellite dots + drips
 *   • <ScribbleSticker /> — continuous wildstyle scribble that ends in an arrow
 *   • <ThrowieSticker />  — one chunky bulbous "throwie" shape with thick
 *                            outline, white fill and ink drips
 *
 * Accessibility contract (accessibility-lead Option B sign-off, this session):
 *   - aria-hidden on the wrapper
 *   - focusable="false" + role="presentation" on the <svg>
 *   - NO <title>/<desc> children (avoid accidental accessible names)
 *   - pointer-events:none, user-select:none, never receives focus
 *   - placed in deliberate whitespace corners only; never overlaps interactive
 *     hit areas (verified by per-sticker positioning class)
 *   - hidden under @media (forced-colors: active) | (prefers-contrast: more) | print
 *   - no animation, no motion
 *
 * The wrapper (.graffiti-sticker) provides the absolute positioning via CSS;
 * each preset accepts a `corner` prop ("tr" | "bl" | "br") that maps to a
 * positioning modifier class.
 */

const CORNER_CLASS = {
  tr: "graffiti-sticker--tr",
  bl: "graffiti-sticker--bl",
  br: "graffiti-sticker--br",
};

const StickerSvg = ({ viewBox, children, size }) => (
  <svg
    viewBox={viewBox}
    preserveAspectRatio="xMidYMid meet"
    width="100%"
    height="100%"
    focusable="false"
    role="presentation"
    style={size ? { width: size.w, height: size.h } : undefined}
  >
    {children}
  </svg>
);

const Wrapper = ({ corner = "tr", className = "", children }) => (
  <div
    aria-hidden="true"
    className={`graffiti-sticker ${CORNER_CLASS[corner] || ""} ${className}`}
  >
    {children}
  </div>
);

/* ----- 1. SPLATTER ---------------------------------------------------------
 * Irregular organic black blob (the "splat") + 4 satellite dots of varying
 * sizes + 3 paint drips dangling off the bottom of the main shape.
 */
export const SplatterSticker = ({ corner = "tr", className = "" }) => (
  <Wrapper corner={corner} className={className}>
    <StickerSvg viewBox="0 0 320 240">
      <g fill="#000000">
        {/* Main organic splat — 8 anchor points around a center, irregular
            bulges so it reads as wet paint splatter, not a regular shape. */}
        <path d="
          M 160 30
          C 200 30, 240 60, 230 95
          C 270 100, 285 145, 250 165
          C 270 195, 230 220, 200 205
          C 195 230, 145 235, 130 210
          C 95 230, 55 205, 70 175
          C 30 175, 25 130, 60 115
          C 35 85, 75 50, 115 65
          C 125 35, 145 30, 160 30
          Z
        " />
        {/* Satellite splatters */}
        <circle cx="40" cy="55" r="7" />
        <circle cx="55" cy="35" r="4" />
        <circle cx="290" cy="50" r="6" />
        <circle cx="305" cy="75" r="3" />
        <circle cx="15" cy="155" r="5" />
        <circle cx="300" cy="180" r="4" />
        <circle cx="290" cy="200" r="2.5" />
        <circle cx="270" cy="225" r="2" />
        {/* Drips off the bottom edge of the splat */}
        <path d="M 100 200 v 30 a 7 7 0 0 0 14 0 v -25 Z" />
        <path d="M 165 215 v 18 a 6 6 0 0 0 12 0 v -14 Z" />
        <path d="M 220 200 v 36 a 8 8 0 0 0 16 0 v -30 Z" />
      </g>
    </StickerSvg>
  </Wrapper>
);

/* ----- 2. SCRIBBLE ---------------------------------------------------------
 * A single continuous hand-drawn scribble line. Tight loops, sharp direction
 * changes, ends with an arrow head — the classic "fast tag" gesture.
 */
export const ScribbleSticker = ({ corner = "bl", className = "" }) => (
  <Wrapper corner={corner} className={className}>
    <StickerSvg viewBox="0 0 340 180">
      <g
        fill="none"
        stroke="#000000"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Main scribble — bezier ride from top-left, loops, swoops, ends
            tracking down-right toward the arrow */}
        <path d="
          M 20 90
          C 30 30, 90 30, 100 80
          C 110 130, 60 150, 70 110
          C 75 80, 130 65, 150 110
          C 165 145, 210 145, 220 95
          C 230 50, 285 55, 295 105
          L 320 130
        " />
        {/* Arrow head at the end (two short flicks) */}
        <path d="M 320 130 L 295 130" />
        <path d="M 320 130 L 305 110" />
        {/* A quick second small underline strike (typical for street tags) */}
        <path d="M 40 145 L 200 158" strokeWidth="7" />
      </g>
      {/* Ink dots at the start of the scribble */}
      <g fill="#000000">
        <circle cx="14" cy="84" r="6" />
        <circle cx="22" cy="62" r="3" />
      </g>
    </StickerSvg>
  </Wrapper>
);

/* ----- 3. THROWIE ----------------------------------------------------------
 * A single chunky bulbous shape — the silhouette of a "throwie" without
 * actually being a letter. Thick black outline, white fill, drips.
 */
export const ThrowieSticker = ({ corner = "br", className = "" }) => (
  <Wrapper corner={corner} className={className}>
    <StickerSvg viewBox="0 0 320 220">
      {/* Drop shadow — same shape, offset, solid black, painted behind */}
      <path
        d="
          M 60 50
          C 30 80, 30 130, 70 150
          C 60 175, 90 195, 120 180
          C 130 200, 175 200, 185 180
          C 215 200, 250 175, 240 145
          C 280 130, 280 80, 245 60
          C 250 30, 215 15, 190 35
          C 175 15, 140 15, 125 35
          C 95 20, 60 30, 60 50
          Z
        "
        transform="translate(7 7)"
        fill="#000000"
      />
      {/* Drips behind the main throwie (white fill of throwie covers their tops) */}
      <g fill="#000000">
        <path d="M 95 180 v 30 a 7 7 0 0 0 14 0 v -25 Z" />
        <path d="M 150 195 v 22 a 6 6 0 0 0 12 0 v -16 Z" />
        <path d="M 215 180 v 36 a 8 8 0 0 0 16 0 v -30 Z" />
      </g>
      {/* Main throwie — fat outline + white fill */}
      <path
        d="
          M 60 50
          C 30 80, 30 130, 70 150
          C 60 175, 90 195, 120 180
          C 130 200, 175 200, 185 180
          C 215 200, 250 175, 240 145
          C 280 130, 280 80, 245 60
          C 250 30, 215 15, 190 35
          C 175 15, 140 15, 125 35
          C 95 20, 60 30, 60 50
          Z
        "
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="14"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      />
      {/* White highlight ellipse — single shine on the upper-left bulge */}
      <ellipse cx="100" cy="60" rx="14" ry="7" fill="#ffffff" />
    </StickerSvg>
  </Wrapper>
);

/* ----- 4. KANJI ------------------------------------------------------------
 * Single brush-calligraphy CJK glyph rendered via Ma Shan Zheng (loaded in
 * index.css). Chosen for the Tokyo/streetwear visual idiom — used purely as
 * decorative art, NOT communication.
 *
 * Glyph set (accessibility-lead sign-off, this session):
 *   • 街 — "street" — used here in BOTH simplified and traditional (same
 *     character in both scripts); brand-neutral, on-vibe for streetwear.
 *   • 黑 — "black" — neutral, aesthetic; also identical in simplified and
 *     traditional.
 * We deliberately AVOID 道 (potential Taoist overtones) and 龍/龙 (heavy
 * zodiac/imperial cliché). Where a future glyph differs between scripts,
 * pick the TRADITIONAL form to keep the set visually consistent.
 *
 * Accessibility:
 *   - aria-hidden on the wrapper.
 *   - NO `lang="zh"`: the node is out of the AT tree (aria-hidden), and some
 *     AT (older JAWS, NVDA in certain modes) still try to pronounce a `lang`
 *     attribute even on hidden subtrees — better to leave it unset.
 *   - Font fallback chain ends in CJK-capable system serifs so the glyph
 *     renders (no tofu) even if Ma Shan Zheng fails to load.
 *   - Splatter dots around the glyph echo the brush-ink aesthetic without
 *     adding any glyphs that could OCR as text.
 */
const KANJI_FONT_STACK =
  "'Ma Shan Zheng', 'STKaiti', 'KaiTi', 'Noto Serif CJK SC', serif";

const KanjiSticker = ({
  glyph = "街",
  corner = "bl",
  tilt = -6,
  className = "",
}) => (
  <Wrapper corner={corner} className={className}>
    <StickerSvg viewBox="0 0 180 180">
      <g transform={`translate(90 130) rotate(${tilt})`}>
        {/* Ink-splatter satellite dots around the glyph for that wet-brush feel */}
        <g fill="#000000">
          <circle cx="-65" cy="-90" r="4.5" />
          <circle cx="-55" cy="-72" r="2.5" />
          <circle cx="62" cy="-88" r="5" />
          <circle cx="76" cy="-70" r="2.5" />
          <circle cx="-72" cy="20" r="3" />
          <circle cx="70" cy="22" r="3.5" />
          <circle cx="0" cy="36" r="2.5" />
          <circle cx="20" cy="40" r="1.8" />
        </g>
        {/* The glyph itself — brush calligraphy, painted last so the dots sit
            behind the strokes if they happen to touch. */}
        <text
          x="0"
          y="0"
          fontSize="150"
          fill="#000000"
          textAnchor="middle"
          dominantBaseline="alphabetic"
          style={{ fontFamily: KANJI_FONT_STACK }}
        >
          {glyph}
        </text>
      </g>
    </StickerSvg>
  </Wrapper>
);

export { KanjiSticker };

/* ----- 5. CROWN — Basquiat 3-spike hollow throw-up ------------------------
 * Classic 3-spike Basquiat crown rendered as a HOLLOW outlined throw-up:
 * drop shadow behind, thick black outline, white fill (paint-order stroke
 * fill), paint drips hanging off the base, ink-splatter dots scattered around.
 */
export const CrownSticker = ({ corner = "tr", tilt = -3, className = "" }) => {
  // Single closed path: 3 asymmetric spikes + base bar. Used three times:
  // once as drop shadow, once as the main outlined+filled crown.
  const crownPath =
    "M 24 118 L 56 22 L 92 84 L 118 40 L 144 84 L 184 24 L 208 118 L 208 134 L 24 134 Z";
  return (
    <Wrapper corner={corner} className={className}>
      <StickerSvg viewBox="0 0 240 170">
        <g transform={`rotate(${tilt} 120 90)`}>
          {/* 1. Drop shadow */}
          <path d={crownPath} transform="translate(7 7)" fill="#000000" />
          {/* 2. Paint drips hanging from baseline — drawn before main outline so
                 the white fill covers their tops; only the dripping bottoms
                 show below the base bar. */}
          <g fill="#000000">
            <path d="M 56 132 v 30 a 7 7 0 0 0 14 0 v -24 Z" />
            <path d="M 116 132 v 22 a 6 6 0 0 0 12 0 v -16 Z" />
            <path d="M 178 132 v 34 a 8 8 0 0 0 16 0 v -28 Z" />
          </g>
          {/* 3. Main crown — thick black outline + white fill */}
          <path
            d={crownPath}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="13"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          />
          {/* 4. Splatter dots around the crown */}
          <g fill="#000000">
            <circle cx="12" cy="60" r="5" />
            <circle cx="6" cy="42" r="2.5" />
            <circle cx="232" cy="58" r="6" />
            <circle cx="238" cy="80" r="3" />
            <circle cx="120" cy="6" r="3" />
            <circle cx="40" cy="160" r="3" />
            <circle cx="200" cy="160" r="3" />
          </g>
        </g>
      </StickerSvg>
    </Wrapper>
  );
};

/* ----- 6. TAG ARROW — wildstyle outlined throw-up arrow -------------------
 * Same throw-up recipe: drop shadow + thick black outline + white fill +
 * paint drips + splatter dots + an underline strike below the body.
 */
export const TagArrowSticker = ({ corner = "br", tilt = -8, className = "" }) => {
  // Single closed path: arrow body + head + feathered tail wings + V-notch.
  // Used twice — drop shadow then outlined main.
  const arrowPath =
    "M 36 38 L 156 38 L 156 16 L 224 62 L 156 108 L 156 86 L 36 86 L 14 110 L 34 62 L 14 14 Z";
  return (
    <Wrapper corner={corner} className={className}>
      <StickerSvg viewBox="0 0 250 160">
        <g transform={`rotate(${tilt} 125 80)`}>
          {/* 1. Drop shadow */}
          <path d={arrowPath} transform="translate(7 7)" fill="#000000" />
          {/* 2. Paint drips hanging from body underside */}
          <g fill="#000000">
            <path d="M 58 84 v 26 a 6 6 0 0 0 12 0 v -20 Z" />
            <path d="M 95 84 v 36 a 8 8 0 0 0 16 0 v -30 Z" />
            <path d="M 132 84 v 22 a 5 5 0 0 0 10 0 v -16 Z" />
          </g>
          {/* 3. Main arrow — thick black outline + white fill */}
          <path
            d={arrowPath}
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="12"
            strokeLinejoin="round"
            paintOrder="stroke fill"
          />
          {/* 4. Underline "tag-completion" strike — slightly tilted */}
          <rect x="44" y="130" width="148" height="7" fill="#000000" />
          {/* 5. Splatter dots */}
          <g fill="#000000">
            <circle cx="6" cy="62" r="5" />
            <circle cx="2" cy="44" r="2.5" />
            <circle cx="240" cy="60" r="5" />
            <circle cx="238" cy="78" r="2.5" />
            <circle cx="200" cy="14" r="3" />
            <circle cx="35" cy="148" r="3" />
          </g>
        </g>
      </StickerSvg>
    </Wrapper>
  );
};

export default {
  SplatterSticker,
  ScribbleSticker,
  ThrowieSticker,
  KanjiSticker,
  CrownSticker,
  TagArrowSticker,
};
