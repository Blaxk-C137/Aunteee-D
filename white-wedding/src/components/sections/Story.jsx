import { CONFIG } from "../../config/site.js";
import { photos } from "../../config/photos.js";
import { Foil } from "../../foil/Foil.jsx";
import { BudCluster, FernCurl } from "../../foil/motifs.jsx";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

export function Story() {
  return (
    <Section
      id="story"
      tone="beige-deep"
      foil={
        <>
          <Foil art={BudCluster} tier="accent" size={260} x="-7%" y="6%" rotate={-10} drift={44} />
          <Foil art={FernCurl} tier="wm" size={320} x="74%" y="44%" rotate={-14} flip drift={-38} />
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <p className="ww-label">Our story</p>
        <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 2rem" }} />

        {/* Framed and shown, rather than washed into the ground the way the
            hero's is. The hero needs a ground it can put type on; this
            paragraph is short and the photograph is the more intimate of
            the two, so it earns being looked at directly. */}
        {photos.story ? (
          <figure className="ww-portrait">
            <img
              src={photos.story}
              alt={`${CONFIG.bride} and ${CONFIG.groom}`}
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}

        <p
          className="ww-text ww-measure"
          style={{
            margin: "0 auto",
            fontSize: "clamp(1.0625rem,4.3vw,1.25rem)",
            color: "var(--ink)",
          }}
        >
          {CONFIG.story}
        </p>
      </div>
    </Section>
  );
}
