import { useState } from "react";
import { pickReveal, useFoil } from "./engine.js";
import "./foil.css";

export function Foil({
  art: Art,
  tier = "wm",
  size = 260,
  x = "-6%",
  y = "8%",
  rotate = 0,
  flip = false,
  drift = 46,
  inline = false,
  style,
}) {
  const [ref, shown] = useFoil(drift);
  const [rv] = useState(pickReveal);

  const draws = rv.k === "line" || rv.k === "line-r";
  const svgCls = `ww-foil-art${draws ? ` ww-${rv.k}` : ""}`;

  return (
    <span
      ref={ref}
      className={`ww-foil ww-foil--${tier}${shown ? " is-in" : ""}`}
      style={{
        ...(inline ? { position: "relative", inset: "auto" } : { left: x, top: y }),
        width: size,
        height: size,
        transform: `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})`,
        "--rv-dur": `${rv.dur}s`,
        "--rv-delay": `${rv.delay}s`,
        "--rv-step": `${rv.step}s`,
        "--rv-ease": rv.ease,
        ...style,
      }}
    >
      <span className={`ww-foil-rv ww-rv--${rv.k}`}>
        <Art className={svgCls} />
      </span>
    </span>
  );
}
