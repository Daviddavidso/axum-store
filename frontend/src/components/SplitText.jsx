import React from "react";

/**
 * SplitText — renders a heading whose words rise out of an overflow clip on
 * scroll-in (premium "line-mask" reveal). Accessibility-lead conditions 1.1–1.6:
 *
 *   • ONE heading element (the `as` tag). The visual lines/words are inner
 *     <span>s with CLASS ONLY — no role, no aria-hidden, no aria-label. The
 *     text therefore stays in the accessible name at all times (cond 1.2).
 *   • The hidden state is a visual transform (translateY) under overflow:hidden
 *     — never display:none / visibility:hidden / aria-hidden (cond 1.3).
 *   • Split is by WORD, preserving whitespace as real text nodes between word
 *     spans, so screen readers and copy-paste never concatenate words (cond 1.4).
 *   • Splitting runs on the actual rendered (possibly RU) string — no hardcoded
 *     break indices (cond 1.5).
 *   • The root carries `reveal mask-lines`, so the existing useScrollFX
 *     IntersectionObserver adds `.in` to trigger the rise; under no-JS /
 *     reduced-motion the words are flat and fully visible (cond 1.6 / X2).
 *
 * Props:
 *   as     — heading tag ("h1".."h3"), default "h2"
 *   text   — single-line string  (use this OR lines)
 *   lines  — array of strings, one visual line each (replaces <br/>)
 *   step   — per-word stagger in seconds (default 0.05)
 *   baseDelay — initial delay in seconds (default 0)
 */
const SplitText = ({
  as: Tag = "h2",
  text,
  lines,
  className = "",
  step = 0.05,
  baseDelay = 0,
  ...rest
}) => {
  const arr = Array.isArray(lines) ? lines : [text ?? ""];
  let wordIndex = 0;

  return (
    <Tag className={`reveal mask-lines ${className}`} {...rest}>
      {arr.map((line, li) => (
        <React.Fragment key={li}>
          {/* Separate visual lines with a real space so the accessible name
              never concatenates the last word of one line with the first of
              the next (cond 1.4), e.g. "Покупайте Издание" not "ПокупайтеИздание". */}
          {li > 0 ? " " : null}
          <span className="mask-line-block">
          {String(line)
            .split(/(\s+)/)
            .map((tok, i) => {
              // Preserve whitespace tokens as plain text nodes (cond 1.4).
              if (tok === "" ) return null;
              if (/^\s+$/.test(tok)) return tok;
              const delay = baseDelay + wordIndex * step;
              wordIndex += 1;
              return (
                <span className="mask-word" key={i}>
                  <span
                    className="mask-word-inner"
                    style={{ "--wd": `${delay.toFixed(2)}s` }}
                  >
                    {tok}
                  </span>
                </span>
              );
            })}
          </span>
        </React.Fragment>
      ))}
    </Tag>
  );
};

export default SplitText;
