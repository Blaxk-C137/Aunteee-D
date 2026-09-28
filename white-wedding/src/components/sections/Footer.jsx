import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { BlossomSpray, LeafFrond, WreathRing } from "../../foil/motifs.jsx";
import { asDate } from "../../lib/format.js";
import { EngravedRule } from "../EngravedRule.jsx";
import { Monogram } from "../Monogram.jsx";

export function Footer() {
  const year = asDate(CONFIG.weddingDate).getFullYear();
  return (
    <footer className="ww-panel ww-panel--deep" style={{ textAlign: "center" }}>
      <Foil art={WreathRing} tier="wm" size={640} x="50%" y="50%" drift={22}
            style={{ marginLeft: -320, marginTop: -320 }} />
      <Foil art={BlossomSpray} tier="wm" size={250} x="4%" y="8%" rotate={-10} drift={34} />
      <Foil art={LeafFrond} tier="wm" size={280} x="80%" y="52%" rotate={8} flip drift={-40} />

      <div className="ww-inner">
        <Monogram size={124} initials={CONFIG.initials} onWine />

        <p
          className="ww-display"
          style={{
            marginTop: "2rem",
            fontSize: "clamp(1.875rem,7vw,2.5rem)",
            color: "var(--ivory)",
          }}
        >
          Thank you
        </p>

        <p
          className="ww-text"
          style={{
            margin: "1.2rem auto 0",
            maxWidth: "22rem",
            fontSize: "1.0625rem",
            color: "var(--on-wine-dim)",
          }}
        >
          for agreeing to be part of this one.
        </p>

        <EngravedRule tone="wine" width="min(12rem,50%)" style={{ margin: "2.8rem auto 1.7rem" }} />

        <p
          style={{
            fontSize: ".6875rem",
            fontWeight: 500,
            letterSpacing: ".26em",
            textTransform: "uppercase",
            color: "var(--on-wine-faint)",
          }}
        >
          {CONFIG.bride} &amp; {CONFIG.groom} · {year}
        </p>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────
