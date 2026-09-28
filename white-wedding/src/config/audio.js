import { CONFIG } from "./site.js";

/* The track, resolved by filename for the same reason the photographs
   are: dropping `song.mp3` into `src/assets/audio/` should be the whole
   of the job.

   It is globbed rather than imported because a static import of a file
   that is not there yet is a build error, and the track is expected to
   be supplied after the site is built. With nothing in the folder this
   resolves to null, the audio element gets no source, and the control
   never renders — which is the rule the original CONFIG.songUrl comment
   already set out: a play button that plays nothing is worse than no
   play button. */
const found = import.meta.glob("../assets/audio/*.{mp3,m4a,ogg,wav}", {
  eager: true,
  query: "?url",
  import: "default",
});

const byName = Object.fromEntries(
  Object.entries(found).map(([p, url]) => [p.split("/").pop(), url])
);

export const trackSrc = byName["song.mp3"] ?? null;
export const trackTitle = CONFIG.songTitle;
