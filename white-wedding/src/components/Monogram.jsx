import { useLayoutEffect, useRef, useState } from "react";
import { CONFIG } from "../config/site.js";

const MONO_FACE = "'Great Vibes', 'Pinyon Script', cursive";
const MONO_SIZE = 58;
const MONO_SHARE = 0.24; // how much of the narrower letter the two share
const MONO_PAD = 4;

const initialPair = (s) => ((s || "").match(/[A-Za-z]/g) || []).slice(0, 2);

/* Where the two letters actually land.
 *
 * Great Vibes overhangs its advance width badly, and by a different
 * amount per letter — at 58 units a capital M inks 85 wide where an E
 * inks 51. A guessed offset therefore merges some pairs into one blob
 * and leaves others barely touching. So the overlap is taken from the
 * letters' real ink boxes, which means measuring, which in turn means
 * waiting for the face to land: measured before it does, the numbers
 * describe the fallback font and are worthless.
 *
 * The two <text> nodes are drawn on top of each other at the origin
 * until the measurement arrives; the caller keeps them transparent
 * until then, so a wrong-frame monogram is never painted.
 */
function useMonogramFit(letters) {
  const holder = useRef(null);
  const [fit, setFit] = useState(null);
  const key = letters.join("");

  useLayoutEffect(() => {
    let live = true;

    const measure = () => {
      const g = holder.current;
      if (!g || !live) return;
      const boxes = Array.from(g.querySelectorAll("text")).map((t) => t.getBBox());
      const [a, b] = boxes;
      if (!a || !b || !a.width || !b.width) return;

      const ov = MONO_SHARE * Math.min(a.width, b.width);
      const top = Math.min(a.y, b.y);
      const bottom = Math.max(a.y + a.height, b.y + b.height);

      setFit({
        vx: -MONO_PAD,
        vy: top - MONO_PAD,
        vw: a.width + b.width - ov + 2 * MONO_PAD,
        vh: bottom - top + 2 * MONO_PAD,
        first: `translate(${-a.x} 0)`,
        second: `translate(${a.width - ov - b.x} 0)`,
      });
    };

    measure();
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`${MONO_SIZE}px 'Great Vibes'`).then(measure).catch(measure);
    }
    return () => {
      live = false;
    };
  }, [key]);

  return [holder, fit];
}

/* The mark itself: two capitals on a shared baseline, the second
   stroked in the panel's own colour before its fill is laid down. That
   stroke is what opens a hairline gap through the first letter where
   the two cross, so the pair reads as one woven mark rather than two
   letters set side by side — the engraver's trick. */
const MonoLetters = ({ holder, fit, letters, fill, bg }) => (
  <g ref={holder}>
    {letters.map((ch, i) => (
      <text
        key={i}
        x="0"
        y="0"
        fontFamily={MONO_FACE}
        fontSize={MONO_SIZE}
        fill={fill}
        transform={fit ? (i ? fit.second : fit.first) : undefined}
        {...(i
          ? {
              stroke: bg,
              strokeWidth: "5",
              strokeLinejoin: "round",
              paintOrder: "stroke",
            }
          : {})}
      >
        {ch}
      </text>
    ))}
  </g>
);

export function Monogram({ size = "clamp(104px,30vw,136px)", initials, onWine, bg }) {
  const letters = initialPair(initials);
  const [holder, fit] = useMonogramFit(letters);
  const width = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      viewBox={fit ? `${fit.vx} ${fit.vy} ${fit.vw} ${fit.vh}` : "0 0 100 80"}
      role="img"
      aria-label={letters.length === 2 ? `${CONFIG.bride} and ${CONFIG.groom}` : CONFIG.bride}
      style={{
        display: "block",
        margin: "0 auto",
        width,
        height: "auto",
        aspectRatio: fit ? `${fit.vw} / ${fit.vh}` : "100 / 80",
        opacity: fit ? 1 : 0,
        transition: "opacity .5s ease",
        overflow: "visible",
      }}
    >
      <MonoLetters
        holder={holder}
        fit={fit}
        letters={letters}
        fill={onWine ? "#DFC179" : "#8A6013"}
        bg={bg || (onWine ? "#2E0C18" : "#FBF7F0")}
      />
    </svg>
  );
}
