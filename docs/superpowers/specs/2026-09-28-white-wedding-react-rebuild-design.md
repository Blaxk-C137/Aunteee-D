# White Wedding — React rebuild with an envelope gate

Date: 2026-09-28
Status: approved in conversation, pending spec review

## Intent

Turn the white-wedding invitation from a single `.jsx` file compiled in the
browser by `@babel/standalone` into a real React application, fronted by an
envelope the guest opens.

The guest lands on a closed envelope over a photograph of the couple, with the
existing abstract foil animation running behind it. The envelope jiggles,
waiting. The guest clicks it: the flap lifts, the card slides out, a white flash
washes the screen, the envelope unmounts, and the site is revealed underneath
with the music already playing.

Two things this buys us beyond the visual upgrade:

- **The autoplay problem goes away honestly.** Every modern browser refuses
  audible playback until the page has been interacted with. The click that opens
  the envelope *is* that interaction, so `play()` issued from inside the click
  handler is allowed. There is no workaround, no muted-then-unmute hack, and no
  silent failure.
- **The engine survives.** The foil system, the reversible scroll reveals and
  the typography were debugged at length and are the expensive part. They get
  moved, not rewritten.

## Scope

**In:** the white-wedding variant only.

**Out, and explicitly not to be touched:**

- `wedding-site.jsx`, `wedding-site-asooke.jsx`, `wedding-site-celestial.jsx` —
  left exactly as they are, still working from `preview.html`.
- `preview.html` — unchanged, and it keeps working for the other three. It will
  stop being the way to view the white variant once the app exists.

Existing work is committed and merged locally at `dcbbe69` before this begins.

## Constraints

As an immersive page, this is a visual build, and the constraints that actually
bind are behavioural, not stylistic:

- **Audio must be started from the gesture.** `play()` is called synchronously
  in the click handler, before any `await`. Starting it from a `useEffect` — the
  obvious implementation, and the one the current `songUrl` code would have
  walked into — is blocked by the browser and fails silently.
- **Photos must be licensed.** No scraping photographers' portfolios. Unsplash,
  which is free for commercial use with no attribution required.
- **The engine is moved, not rewritten.** `wedding-site-white.jsx` stays on disk
  as the reference until the port is verified against it.
- **The art direction is fixed.** Ivory `#FCF9F3`, wine `#4A1526`, gold
  `#8A6013` / decorative `#B08A33`. shadcn's theme is mapped onto these; nothing
  introduces shadcn's default palette.

## Architecture

```
white-wedding/
  index.html
  package.json
  vite.config.js
  src/
    main.jsx
    App.jsx                 ← gate state machine: envelope → flash → site
    config/
      site.js               ← the CONFIG from wedding-site-white.jsx
      photos.js             ← role → filename map
    theme/
      tokens.css            ← ivory/wine/gold custom properties
      shadcn.css            ← shadcn vars aliased onto the tokens above
    foil/
      engine.js             ← REDUCED, drifters, flushDrift, scheduleDrift,
                              registerDrift, useFoil, REVEALS, EASES, pickReveal
      Foil.jsx
      foil.css              ← the .ww-foil / .ww-rv--* / draw rules
      motifs/               ← the botanical set, one export per motif
    components/
      Envelope/             ← new
      Audio/                ← new
      sections/             ← Hero, Story, BigDay, Countdown, Song, Rsvp, Footer
    assets/
      photos/
      audio/song.mp3
```

### Why this shape

- **`foil/` is a module, not a component.** The engine is ~200 lines of
  imperative scroll and observer code with no JSX in it. Splitting it from
  `Foil.jsx` means the section components import a hook and a component, not a
  1,800-line file.
- **CSS moves into real `.css` files.** Today the stylesheet lives inside a
  JavaScript template literal, which is a live hazard — a backtick in a CSS
  comment terminates the literal and silently truncates the whole stylesheet.
  That trap cost real debugging time during the foil port and it disappears
  entirely once the CSS is a `.css` file.
- **Tailwind is scoped to new chrome.** See "Styling" below.

## Styling

The existing sections keep their current approach: inline styles referencing CSS
custom properties, plus the token stylesheet. Rewriting 1,800 lines of working,
visually-verified markup into Tailwind would be a large risk taken for no visible
gain, and it is the single easiest way to lose the art direction.

Tailwind and shadcn are used for the **new interactive pieces only** — the
envelope, the audio control, any dialog. shadcn's variables are aliased onto the
existing tokens in `theme/shadcn.css`:

| shadcn variable | token |
| --- | --- |
| `--background` | `--ivory` |
| `--foreground` | `--ink` |
| `--primary` | `--wine` |
| `--accent` | `--gold` |
| `--radius` | small; the design is rectilinear |

so a shadcn component dropped into this page is already in the right palette.

## The envelope

An ivory envelope in the site's own idiom: gold wax seal stamped with the A & E
monogram, wine liner showing at the flap edge. It sits centred over the couple's
photograph, and idles with a slow jiggle so it reads as waiting to be opened.

The open sequence is a small explicit state machine in `App.jsx`:

```
closed ──click──▶ opening ──▶ flashing ──▶ open
```

1. **`closed`** — envelope idles. `play()` is issued here, in the handler.
2. **`opening`** — flap lifts, card slides out and scales up. Held for the
   flap duration.
3. **`flashing`** — a white overlay washes in over the whole viewport.
4. **`open`** — the envelope unmounts under the white, the overlay fades out,
   and the site is beneath it, already running.

The site is mounted and laid out *behind* the envelope from first paint, not
after it. That is deliberate: the hero's reveal fires while the envelope still
covers it, so when the flash clears there is no stutter of animation starting
late. The envelope is a fixed overlay, so the page beneath it is at scroll 0
with correct layout.

### Reduced motion

`prefers-reduced-motion: reduce` drops the idle jiggle and shortens the flash to
a near-instant fade. The audio still plays — it is user-initiated, so it is not
the kind of motion the preference is asking us to avoid.

### Showing once

`sessionStorage` records that the envelope has been opened, under the key
`ww.opened`, so a refresh goes straight to the site. It is read on mount and
written at the moment the envelope unmounts — not at click time, so an open
sequence interrupted half-way is not remembered as complete. Re-gating on every
refresh is the fastest way to make a guest dislike the page.

Every `sessionStorage` access is wrapped in `try/catch`: it throws outright in
some private-browsing configurations, and an exception there would take the
whole page down. A throw is treated as "not yet opened", so the failure mode is
the envelope appearing when it did not need to, never a blank page.

## Photos

Sourced from Unsplash, downloaded into `src/assets/photos/`, resolved through
`import.meta.glob` and mapped by role in `config/photos.js`:

```js
export const photos = {
  envelope: "envelope.jpg",   // behind the closed envelope
  hero: "hero.jpg",
  story: "story.jpg",
};
```

Swapping in the couple's real photographs is then a file drop with no code
change. A `CREDITS.md` beside the photos records each source URL and
photographer — not required by the licence, but it is the right habit and it
makes the files replaceable later.

**If a named photo is missing, the section falls back to its existing gradient
ground rather than rendering a broken image.** The site must never show a broken
image, and it must not depend on a file the couple has not supplied yet.

## Audio

`src/assets/audio/song.mp3`, referenced from `config/site.js`. The file is not in
the repository yet; the wiring is, and it stays silent and invisible until the
file is dropped in.

The control renders only after the audio element has successfully loaded
metadata. If the file is absent or fails to load, `onError` hides the control
entirely — a play button that plays nothing is worse than no play button, which
is the rule the existing `CONFIG.songUrl` comment already states.

The track loops. A small gold speaker control sits fixed in a corner and toggles
play/pause and mute.

## Error handling

The page must not be able to end up in a dead state, because a guest cannot
debug it and will simply leave.

| Failure | Behaviour |
| --- | --- |
| Audio file missing or fails to load | Control hidden; site works silently |
| Photo file missing | Section falls back to its gradient ground |
| `sessionStorage` throws | Treated as "not yet opened"; envelope shows |
| `play()` rejected | Swallowed; the site still opens |
| Fonts fail to load | Existing font fallback stack |

## Testing

The existing project has no test setup. This is a visual build, so the tests
worth writing are the behavioural rules that a screenshot cannot confirm, and a
smoke test for the flow.

**Vitest + React Testing Library**, for the logic:

- `play()` is called before the first `await` in the open handler. This is the
  single rule the whole design rests on, and it is invisible until it breaks on
  a real device.
- A rejected `play()` does not prevent the site from opening.
- `sessionStorage` throwing does not prevent the envelope from rendering.
- A missing photo resolves to the fallback, not a broken image.
- A missing audio file hides the control.

**Playwright**, one flow test: the envelope renders, clicking it opens the site,
and the audio element reports `paused === false` afterwards. This is the
end-to-end assertion that the gesture actually worked in a real browser.

## What this does not do

- Does not touch the other three variants, or `preview.html`.
- Does not change the foil engine's behaviour — the port is verified by
  comparing against `wedding-site-white.jsx`, which stays on disk.
- Does not add a build step for the other three variants; they keep compiling in
  the browser.
- Does not attempt to serve the couple's real content. Names, dates and venues
  carry over from the existing `CONFIG` as placeholders.
