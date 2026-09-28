import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { BlossomSpray, BudCluster, LeafFrond } from "../../foil/motifs.jsx";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

/* A dedication, not a player.

   This section used to carry its own <audio> and transport, gated on a
   `CONFIG.songUrl` that no longer exists. The track is supplied as a
   file now and is played by the single element in `App.jsx` from the
   moment the envelope opens, with the floating control as its only
   transport. Giving this section its own element would put a second
   copy of the same file on top of the first. */
export function Song() {
  return (
    <Section
      id="song"
      tone="beige"
      foil={
        <>
          <Foil art={BlossomSpray} tier="accent" size={250} x="76%" y="4%" rotate={-12} flip drift={44} />
          <Foil art={LeafFrond} tier="wm" size={300} x="-6%" y="52%" rotate={6} drift={-42} />
          <Foil art={BudCluster} tier="wm" size={230} x="4%" y="-6%" rotate={14} drift={32} />
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <p className="ww-label">Our song</p>
        <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 2rem" }} />

        <p
          className="ww-display"
          style={{ fontSize: "clamp(1.75rem,6.5vw,2.375rem)", color: "var(--ink)" }}
        >
          {CONFIG.songTitle}
        </p>
        <p
          style={{
            marginTop: ".6rem",
            fontSize: ".8125rem",
            fontWeight: 400,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          {CONFIG.songArtist}
        </p>
      </div>
    </Section>
  );
}
