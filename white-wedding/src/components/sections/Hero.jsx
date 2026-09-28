import { CONFIG } from "../../config/site.js";
import { photos } from "../../config/photos.js";
import { Foil } from "../../foil/Foil.jsx";
import { BlossomSpray, LeafFrond, SingleBloom, WreathRing } from "../../foil/motifs.jsx";
import { asDate, fmtDay, scrollToId } from "../../lib/format.js";
import { EngravedRule } from "../EngravedRule.jsx";
import { Monogram } from "../Monogram.jsx";

export function Hero() {
  const d = asDate(CONFIG.weddingDate);
  return (
    <section
      className="ww-panel ww-panel--beige"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        /* The ground when there is no photograph. With one, `.ww-photo-bg`
           covers this and supplies its own wash. */
        background:
          "radial-gradient(ellipse 130% 90% at 50% 0%, #FFFFFF 0%, var(--beige) 46%, var(--beige-deep) 100%)",
      }}
    >
      {photos.hero ? (
        <div className="ww-photo-bg ww-photo-bg--hero" aria-hidden="true">
          <img src={photos.hero} alt="" decoding="async" />
        </div>
      ) : null}

      <div className="ww-frame" aria-hidden="true">
        <span />
        <span />
      </div>

      <Foil art={WreathRing} tier="wm" size={780} x="50%" y="50%" drift={26}
            style={{ marginLeft: -390, marginTop: -390 }} />
      <Foil art={BlossomSpray} tier="accent" size={380} x="-8%" y="3%" rotate={-6} drift={64} />
      <Foil art={LeafFrond} tier="wm" size={330} x="76%" y="58%" rotate={10} flip drift={-56} />
      <Foil art={SingleBloom} tier="wm" size={210} x="2%" y="70%" rotate={10} drift={38} />

      <div className="ww-hero ww-inner" style={{ width: "100%" }}>
        <Monogram initials={CONFIG.initials} />

        <p className="ww-label" style={{ marginTop: "clamp(30px,7vw,46px)" }}>
          Together with their families
        </p>

        <h1
          className="ww-name"
          style={{
            marginTop: "1.6rem",
            color: "var(--ink)",
          }}
        >
          {CONFIG.bride}
        </h1>

        <div className="ww-and" aria-hidden="true">
          <i />
          <span className="ww-script" style={{ color: "var(--lilac)" }}>
            and
          </span>
          <i />
        </div>

        <h1 className="ww-name" style={{ color: "var(--ink)" }}>
          {CONFIG.groom}
        </h1>

        <EngravedRule width="min(17rem,64%)" style={{ margin: "2.2rem auto 1.7rem" }} />

        <p
          className="ww-label ww-label--plain"
          style={{ letterSpacing: ".26em" }}
        >
          {fmtDay(d)}
        </p>

        <p
          style={{
            marginTop: ".7rem",
            fontSize: ".875rem",
            letterSpacing: ".16em",
            color: "var(--ink-soft)",
          }}
        >
          {CONFIG.city}
        </p>

        <div style={{ marginTop: "clamp(30px,7vw,44px)" }}>
          <a className="ww-btn" href="#story" onClick={scrollToId("story")}>
            Open the invitation
          </a>
        </div>
      </div>
    </section>
  );
}
