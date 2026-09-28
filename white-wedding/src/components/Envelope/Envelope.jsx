import { motion, useReducedMotion } from "motion/react";

import { CONFIG } from "../../config/site.js";
import { Monogram } from "../Monogram.jsx";
import {
  CARD_DELAY,
  CARD_MS,
  FLAP_DELAY,
  FLAP_MS,
  SEAL_MS,
  secs,
} from "../../lib/timings.js";
import "./envelope.css";

const EASE = [0.22, 1, 0.36, 1];

/* Where in the flap's rotation it passes vertical. Segment one runs to
   here; segment two runs from here to flat. Read by the flap's rotation
   keyframes and by the face fade, so the two cannot drift apart. */
const FLAP_MID = 0.42;

/* Where the faces fade, as fractions of the same rotation. The lead is
   the sliver of travel after vertical where the front is still
   foreshortening and the liner has not yet opened up; the span is how
   long the dissolve takes. Both are read against FLAP_MID rather than
   written as absolutes, so retiming the flap cannot leave the fade
   describing a rotation that no longer happens. */
const FACE_LEAD = 0.04;
const FACE_SPAN = 0.22;

/* The envelope the guest opens.

   `phase` is owned by App — this component only knows how to look in
   each of them, so the sequence lives in one place and the animation in
   another, and neither has to be read to understand the other.

   The click handler is passed straight through. It has to be the thing
   that starts the music, because a play() issued from anywhere other
   than a real user gesture is refused by the browser. */
export function Envelope({ phase, onOpen, photo }) {
  const reduced = useReducedMotion();

  /* `flash` is not a look of its own — it is the tail of `opening`, held
     while the white washes over. It has to be mapped explicitly: passing
     `animate="flash"` with no `flash` key in `variants` makes motion fall
     back to the base state, and the envelope visibly re-closes under the
     overlay as it fades in. */
  const state = phase === "closed" ? "closed" : "opening";

  const seal = {
    closed: { opacity: 1, scale: 1 },
    opening: {
      opacity: 0,
      scale: 1.35,
      transition: { duration: secs(SEAL_MS, reduced), ease: "easeOut" },
    },
  };

  /* The flap drops behind the card as it passes vertical. Without this
     it would sit on top of the card for the rest of the sequence, since
     it has finished rotating into exactly the space the card rises
     into.

     Two segments rather than one curve. A single ease-in-out moves
     fastest through the middle of the rotation, which is precisely the
     90deg-140deg band where the purple liner shows and the overhang grows
     — so the liner was gone before it could be seen. Segment one takes
     the flap briskly to vertical, where the white front is just
     foreshortening and there is nothing to look at; segment two eases
     in, so it is slow across the band that matters and only accelerates
     once the faces have finished fading. */
  const flap = {
    closed: { rotateX: 0, zIndex: 3 },
    opening: {
      rotateX: [0, -90, -178],
      zIndex: 0,
      transition: {
        rotateX: {
          delay: secs(FLAP_DELAY, reduced),
          duration: secs(FLAP_MS, reduced),
          times: [0, FLAP_MID, 1],
          ease: ["easeIn", "easeIn"],
        },
        zIndex: { delay: secs(FLAP_DELAY + FLAP_MS * FLAP_MID, reduced), duration: 0 },
      },
    },
  };

  /* The faces dissolve as the flap swings past vertical.

     A flap laid flat behind an envelope is hidden by the envelope. This
     one is a plane with no thickness to hide behind, so past -90deg it
     projects a full flap-height of purple above the top edge — wider than
     the card, so it shows either side of it too — and reads as a dark
     arrowhead growing out of the envelope. Fading it as it goes over
     stands in for the thickness that is not there.

     The liner is only ever visible past -90deg, which is the same moment
     it starts to overhang, so the window is narrow by construction: the
     fade runs from just after edge-on and is finished by about -135deg,
     where the overhang is still under a fifth of the envelope's height.
     Longer than this and the purple reads as a shape floating above the
     envelope rather than as the flap going behind it.

     On the faces and not on `.env-flap`, because opacity below 1 on an
     element with `transform-style: preserve-3d` flattens it, and a
     flattened flap renders both of its faces at once. The faces are
     leaves, so fading them costs nothing. */
  const face = {
    closed: { opacity: 1 },
    opening: {
      opacity: 0,
      transition: {
        delay: secs(FLAP_DELAY + FLAP_MS * (FLAP_MID + FACE_LEAD), reduced),
        duration: secs(FLAP_MS * FACE_SPAN, reduced),
        ease: "linear",
      },
    },
  };

  const card = {
    closed: { y: "0%", scale: 1 },
    opening: {
      y: "-58%",
      scale: 1.04,
      transition: { delay: secs(CARD_DELAY, reduced), duration: secs(CARD_MS, reduced), ease: EASE },
    },
  };

  return (
    <div className="env-stage" data-phase={phase}>
      {photo ? (
        <div className="env-photo" style={{ backgroundImage: `url(${photo})` }} />
      ) : (
        /* No photograph supplied yet. A gradient is a deliberate-looking
           ground; a broken image is not. */
        <div className="env-fallback" />
      )}
      <div className="env-veil" />

      <div className="env-wrap">
        <div className="env-jiggle">
          <button
            type="button"
            className="env"
            onClick={onOpen}
            aria-label={`Open the invitation from ${CONFIG.bride} and ${CONFIG.groom}`}
          >
            <motion.span className="env-card" variants={card} initial="closed" animate={state}>
              <span className="env-card-rule" />
              <span className="env-card-name">
                {CONFIG.bride} &amp; {CONFIG.groom}
              </span>
              <span className="env-card-rule" />
            </motion.span>

            <span className="env-body">
              <span className="env-crease env-crease--l" />
              <span className="env-crease env-crease--r" />
            </span>

            <motion.span className="env-flap" variants={flap} initial="closed" animate={state}>
              <motion.span className="env-flap-face" variants={face} initial="closed" animate={state} />
              <motion.span className="env-flap-back" variants={face} initial="closed" animate={state} />
            </motion.span>

            <motion.span className="env-seal" variants={seal} initial="closed" animate={state}>
              <Monogram size="68%" initials={CONFIG.initials} onPurple />
            </motion.span>
          </button>
        </div>

        <p className="env-hint">Tap to open</p>
      </div>
    </div>
  );
}
