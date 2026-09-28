/* Photographs, resolved by filename.

   Vite needs to know about asset imports at build time, so the folder is
   globbed rather than each file imported by hand. The payoff is that
   swapping in the couple's real photographs is a file drop: put
   `hero.jpg` in `src/assets/photos/` and it is picked up, with no code
   change and nothing to keep in step.

   A role with no file resolves to `null`, and every consumer treats that
   as "use the gradient instead". A wedding site must never show a broken
   image, and it must not fall over because a photograph has not been
   supplied yet. */
const found = import.meta.glob("../assets/photos/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

const byName = Object.fromEntries(
  Object.entries(found).map(([p, url]) => [p.split("/").pop(), url])
);

export const photos = {
  /* full-bleed, behind the closed envelope */
  envelope: byName["envelope.jpg"] ?? null,
  /* the invitation plate */
  hero: byName["hero.jpg"] ?? null,
  /* the story panel */
  story: byName["story.jpg"] ?? null,
};
