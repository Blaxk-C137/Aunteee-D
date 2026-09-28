/* The open sequence, in one place.

   App advances its phases on these numbers and the envelope animates to
   the same ones, so the two cannot drift apart: change a duration here
   and both the animation and the timer that follows it move together. */
export const SEAL_MS = 260;

export const FLAP_DELAY = 140;
export const FLAP_MS = 600;

export const CARD_DELAY = 620;
export const CARD_MS = 680;

/* How long the envelope takes to finish opening, measured from the click
   to the card coming to rest. */
export const OPEN_MS = CARD_DELAY + CARD_MS;

/* The white wash that covers the hand-off, and the fade that reveals the
   site underneath it. */
export const FLASH_MS = 260;
export const FADE_MS = 520;

/* Reduced motion keeps the whole sequence — the guest still has to open
   the envelope, and the click still has to happen for the music to be
   allowed — but compresses it so nothing travels far or lingers. */
export const timeScale = (reduced) => (reduced ? 0.22 : 1);

export const secs = (ms, reduced) => (ms * timeScale(reduced)) / 1000;
