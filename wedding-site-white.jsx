import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
//  WHITE WEDDING INVITATION
//
//  This is the white wedding, so the page is white — ivory ground,
//  formal and light, opening on an invitation plate rather than on a
//  dark screen. One deep wine panel (the countdown) carries the drama
//  and the footer closes it out.
//
//  Structural device: the double rule and the engraved rule of a
//  letterpress invitation. That single motif divides every section.
//  There are no illustrations and no icons.
//
//  The animation is the hero's entrance and the gold botanicals, which
//  draw themselves in as they enter and retire the way they came as they
//  leave — see the foil engine below.
// ═══════════════════════════════════════════════════════════════════

// ─── EDIT THESE ─────────────────────────────────────────────────────
const CONFIG = {
  bride: "Adaeze",
  groom: "Emeka",

  // Monogram. Keep it to initials only — 2 to 5 characters.
  initials: "A & E",

  // The ceremony. Drives the hero date and the countdown.
  weddingDate: "2027-07-18T11:00:00",

  city: "Kano, Nigeria",

  // The white wedding runs as one day with two parts. Add or remove
  // entries freely — one entry renders as a single card.
  events: [
    {
      label: "The Ceremony",
      date: "2027-07-18T11:00:00",
      venue: "St. Mary's Catholic Church",
      address: "Kano, Nigeria",
    },
    {
      label: "The Reception",
      date: "2027-07-18T16:30:00",
      venue: "Royal Gardens Hall",
      address: "Kano, Nigeria",
    },
  ],

  dressCode: "Black tie optional",

  story:
    "Ten years ago we were two people arguing about a borrowed umbrella. Somewhere between then and now it became a life — a shared kitchen, a hundred inside jokes, and a habit of choosing each other on the ordinary days. We would like you there on the day it becomes official.",

  // ── Our song ──────────────────────────────────────────────────────
  // Paste a direct link to an audio file (mp3/m4a) to get a real
  // player. Leave it empty and no player is rendered — a play button
  // that plays nothing is worse than no play button.
  songTitle: "A Thousand Years",
  songArtist: "Christina Perri",
  songUrl: "",

  // ── RSVP ──────────────────────────────────────────────────────────
  // Digits only with country code, no + or spaces. Leave empty to use
  // the email fallback instead.
  whatsapp: "2348012345678",
  email: "rsvp@example.com",
  rsvpBy: "2027-06-30T23:59:59",
};
// ────────────────────────────────────────────────────────────────────

// ── Helpers ─────────────────────────────────────────────────────────
const asDate = (v) => (v instanceof Date ? v : new Date(v));

const fmtDay = (v) =>
  asDate(v)
    .toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

const fmtShortDate = (v) =>
  asDate(v).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const fmtTime = (v) =>
  asDate(v).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

const mapHref = (e) =>
  `https://maps.google.com/?q=${encodeURIComponent(
    [e.venue, e.address].filter(Boolean).join(", ")
  )}`;

// ── Fonts + stylesheet, injected once ───────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Great+Vibes&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Parisienne&display=swap";

const CSS = `
.ww,.ww *,.ww *::before,.ww *::after{box-sizing:border-box}
/* :where() keeps this at the specificity of a bare class, so the spacing
   rules further down still win. As .ww p this is (0,1,1) and silently
   beats every class-scoped margin-top in the file. */
.ww :where(h1,h2,h3,p,figure,blockquote,ul,ol,fieldset){
  margin:0;padding:0;border:0;list-style:none
}
.ww button,.ww input,.ww select{font:inherit;color:inherit}
.ww a{color:inherit}

.ww{
  /* Off-edge botanicals hang past the trim by design, so something has to
     clip them. Each panel clips its own, with overflow:clip and not
     overflow:hidden — hidden makes a box a scroll container, and a panel
     that is its own scroll container swallows the scrollIntoView() the
     hero's own button depends on.

     This used to be done only here, and only in x. That trimmed the sides
     but left the last panel's botanical hanging past the bottom of the
     page, where nothing clipped it: the document grew by the length of the
     overhang and ended on a band of bare ground with a few gold strokes
     still drawn across it. */
  overflow-x:clip;
  /* ── ivory ground, wine depth, gold metal ────────────────────── */
  --ivory:#FCF9F3;
  --pearl:#F4ECDF;
  --wine:#4A1526;
  --wine-deep:#2E0C18;
  --ink:#2B2124;
  --ink-soft:rgba(43,33,36,.68);

  /* Two golds, because one cannot do both jobs. --gold is the text
     gold: 5.3:1 on ivory and 4.8:1 on pearl, so small caps labels stay
     legible. --gold-deco is the ornamental gold for hairlines, frames
     and the monogram, where being delicate is the point. */
  --gold:#8A6013;
  --gold-deco:#B08A33;
  --gold-lt:#DFC179;

  --rule:rgba(176,138,51,.42);
  --rule-soft:rgba(176,138,51,.2);
  --field-border:rgba(43,33,36,.5);
  --on-wine:rgba(252,249,243,.88);
  --on-wine-dim:rgba(252,249,243,.55);
  --on-wine-faint:rgba(252,249,243,.5);

  --measure:34rem;
  --panel-y:clamp(62px,13vw,116px);
  --panel-x:clamp(20px,6vw,44px);

  font-family:'Jost',ui-sans-serif,system-ui,sans-serif;
  font-size:16px;
  font-weight:300;
  line-height:1.7;
  color:var(--ink);
  background:var(--ivory);
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

/* ── three voices. Cormorant Garamond is the ceremonial serif and the
      only one the names are set in; Parisienne appears exactly once, on
      the word "and"; Jost carries everything that has to be read.
      Bodoni Moda survives solely for the countdown's tabular figures,
      where its figures beat Cormorant's. ──────────────────────────── */
.ww-display{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-weight:400;line-height:1.06;letter-spacing:.004em
}
/* The hero names. Editorial scale at the family's regular weight — the
   air belongs *around* the names, not inside them, so the tracking is
   barely open and the leading is tight. */
.ww-name{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-weight:400;
  font-size:clamp(2.85rem,13.5vw,5.5rem);
  line-height:1.04;letter-spacing:.02em
}
/* The one script word. Script faces carry a small x-height, so this
   reads smaller than its size suggests and needs to sit *above* the
   italic it replaces, not below it. */
.ww-script{
  font-family:'Parisienne','Allura',cursive;
  font-weight:400;
  font-size:clamp(1.75rem,6.5vw,2.5rem);
  line-height:1.15;letter-spacing:0
}
/* "and", ruled in from both sides. The hairlines pick up where the
   engraved rule leaves off, so the word sits inside the page's own
   ornament instead of floating in the gap between the two names. */
.ww-and{
  display:flex;align-items:center;justify-content:center;
  gap:clamp(.75rem,3vw,1.15rem);margin:.42em 0 .5em
}
.ww-and i{
  flex:0 0 auto;width:clamp(2rem,10vw,4.25rem);height:1px;
  background:linear-gradient(90deg,transparent,var(--rule))
}
.ww-and i:last-child{background:linear-gradient(90deg,var(--rule),transparent)}
.ww-text{font-weight:300;line-height:1.78}
.ww-num{
  font-family:'Bodoni Moda',Didot,serif;
  font-variation-settings:'opsz' 96;
  font-weight:400;line-height:1;display:block;
  font-variant-numeric:tabular-nums
}

.ww-label{
  font-size:.6875rem;font-weight:400;letter-spacing:.32em;
  text-transform:uppercase;color:var(--gold)
}
.ww-label--plain{color:var(--ink-soft)}
.ww-label--onwine{color:var(--gold-lt)}

/* Wide tracking is the point of the label, but on a narrow phone it
   pushes the line into a ragged second row. Tighten it there instead
   of letting the label wrap. */
@media (max-width:30rem){
  .ww-label,.ww-fielabel,.ww-eyebrow{font-size:.625rem;letter-spacing:.2em}
}

/* ── panels ──────────────────────────────────────────────────────── */
.ww-panel{position:relative;padding:var(--panel-y) var(--panel-x);overflow:clip}
.ww-panel--ivory{background:var(--ivory);color:var(--ink)}
.ww-panel--pearl{background:var(--pearl);color:var(--ink)}
.ww-panel--wine{background:var(--wine);color:var(--on-wine)}
.ww-panel--deep{background:var(--wine-deep);color:var(--on-wine)}
.ww-inner{position:relative;z-index:1;max-width:60rem;margin:0 auto}
.ww-measure{max-width:var(--measure)}

/* ── the foil ────────────────────────────────────────────────────── */
/*  Gold botanical line work laid on the ground. It is admitted on three
    conditions: it never sits where text sits, it never moves on its own,
    and it is drawn rather than placed.

    Three tiers, by how much attention each is allowed:

      --wm      a watermark. Large, barely there, drifting against the
                scroll so the ground has some depth behind it.
      --accent  visible line work, close enough to the words to be read.
      --inline  the only tier that goes near the type, so it stays small
                and lives at the edge of a rule, never behind a
                paragraph.

    A tier sets --foil-o and nothing else. How an ornament arrives is its
    own business, drawn at random when it mounts — see REVEALS. */
.ww-foil{
  position:absolute;inset:0;z-index:0;overflow:hidden;
  pointer-events:none;color:var(--gold-deco);
  --foil-o:.07;
  --rv-dur:1.5s;--rv-delay:0s;--rv-step:.1s;
  --rv-ease:cubic-bezier(.42,0,.2,1)
}
.ww-foil--wm{--foil-o:.07}
.ww-foil--accent{--foil-o:.3}
.ww-foil--inline{--foil-o:.5}
/* Translucent gold over wine turns olive and stops reading as metal, so
   the wine panels take the light gold instead. */
.ww-panel--wine .ww-foil,.ww-panel--deep .ww-foil{color:var(--gold-lt)}
.ww-panel--wine .ww-foil--wm,.ww-panel--deep .ww-foil--wm{--foil-o:.075}
.ww-panel--wine .ww-foil--accent,.ww-panel--deep .ww-foil--accent{--foil-o:.3}

/* The entrance sits on its own element so it can own opacity, transform
   and clip-path without fighting the two transforms that already exist:
   the ornament's fixed orientation on the span above it, and the drift on
   the svg below.

   Every transition here runs in both directions, which is the whole point
   — scrolling back up rewinds the ornament rather than leaving it lit. */
.ww-foil-rv{
  display:block;width:100%;height:100%;
  opacity:0;transform-origin:50% 100%;
  transition:
    opacity var(--rv-dur) var(--rv-ease) var(--rv-delay),
    transform var(--rv-dur) var(--rv-ease) var(--rv-delay),
    clip-path var(--rv-dur) var(--rv-ease) var(--rv-delay)
}
.ww-foil.is-in .ww-foil-rv{opacity:var(--foil-o);transform:none;clip-path:inset(0 0 0 0)}

/* Where each ornament comes from. Picked per ornament, not per tier, so
   nothing on the page arrives the way its neighbour did. */
.ww-rv--rise{transform:translate3d(0,46px,0)}
.ww-rv--settle{transform:translate3d(0,-42px,0)}
.ww-rv--slide{transform:translate3d(-52px,0,0)}
.ww-rv--slide-r{transform:translate3d(52px,0,0)}
.ww-rv--bloom{transform:scale(.8);transform-origin:50% 50%}
.ww-rv--unfurl{transform:scaleY(.08)}
.ww-rv--sway{transform:rotate(-9deg)}
/* A wipe is a wipe and not a fade, so these hold the tier's opacity
   throughout and only their clip-path moves — the rewind is then a wipe
   back rather than a dissolve. */
.ww-rv--wipe,.ww-rv--wipe-r,.ww-rv--wipe-d,.ww-rv--wipe-u{opacity:var(--foil-o)}
.ww-rv--wipe{clip-path:inset(0 100% 0 0)}
.ww-rv--wipe-r{clip-path:inset(0 0 0 100%)}
.ww-rv--wipe-d{clip-path:inset(0 0 100% 0)}
.ww-rv--wipe-u{clip-path:inset(100% 0 0 0)}

/* The drift. --p is written by the page's single scroll loop and runs
   about -1 below the fold to 1 above it, so every ornament on the page
   shares one measurement — which is what lets that loop do all of its
   reading before it does any writing. */
.ww-foil-art{
  width:100%;height:100%;display:block;
  transform:translate3d(0,calc(var(--p,0) * var(--drift,0px)),0)
}

/* Drawing, not appearing. Every drawable shape in the set carries
   pathLength="1", which normalises its length to 1 whatever its real
   geometry — so this one dash rule draws any of them and nothing has to
   be measured with getTotalLength(). The stagger is nth-child and the
   step is random per ornament, so two fronds never fill in at the same
   rhythm. */
.ww-line path,.ww-line circle,.ww-line ellipse,.ww-line line,
.ww-line-r path,.ww-line-r circle,.ww-line-r ellipse,.ww-line-r line{
  stroke-dasharray:1;stroke-dashoffset:1
}
/* the same stroke drawn from its far end */
.ww-line-r path,.ww-line-r circle,.ww-line-r ellipse,.ww-line-r line{stroke-dashoffset:-1}

.is-in .ww-line path,.is-in .ww-line circle,
.is-in .ww-line ellipse,.is-in .ww-line line,
.is-in .ww-line-r path,.is-in .ww-line-r circle,
.is-in .ww-line-r ellipse,.is-in .ww-line-r line{
  animation:ww-stroke var(--rv-dur) var(--rv-ease) var(--rv-delay) forwards
}
.is-in .ww-line *:nth-child(2),.is-in .ww-line-r *:nth-child(2){animation-delay:calc(var(--rv-delay) + var(--rv-step))}
.is-in .ww-line *:nth-child(3),.is-in .ww-line-r *:nth-child(3){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 2)}
.is-in .ww-line *:nth-child(4),.is-in .ww-line-r *:nth-child(4){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 3)}
.is-in .ww-line *:nth-child(5),.is-in .ww-line-r *:nth-child(5){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 4)}
.is-in .ww-line *:nth-child(6),.is-in .ww-line-r *:nth-child(6){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 5)}
.is-in .ww-line *:nth-child(n+7),.is-in .ww-line-r *:nth-child(n+7){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 6)}
@keyframes ww-stroke{to{stroke-dashoffset:0}}

/* ── focus ───────────────────────────────────────────────────────── */
.ww :focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:1px}
.ww-panel--wine :focus-visible,.ww-panel--deep :focus-visible{outline-color:var(--gold-lt)}

/* ── the engraved rule — the page's only ornament ────────────────── */
.ww-engraved{display:flex;align-items:center;gap:.75rem;color:var(--gold-deco)}
.ww-engraved i{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--rule))}
.ww-engraved i:last-child{background:linear-gradient(90deg,var(--rule),transparent)}
.ww-engraved--onwine{color:var(--gold-lt)}
.ww-engraved--onwine i{background:linear-gradient(90deg,transparent,rgba(223,193,121,.4))}
.ww-engraved--onwine i:last-child{background:linear-gradient(90deg,rgba(223,193,121,.4),transparent)}

/* ── the invitation plate's double rule ──────────────────────────── */
/* On a phone the viewport *is* the plate, so the rule hugs the screen.
   On a desktop a viewport-wide rule stretches into a page border that
   the centred column never touches. There it becomes an actual plate:
   a portrait card the content sits inside. */
.ww-frame{position:absolute;inset:clamp(11px,3.2vw,24px);pointer-events:none}
.ww-frame span{position:absolute;inset:0;border:1px solid var(--rule)}
.ww-frame span:last-child{inset:5px;border-color:var(--rule-soft)}
@media (min-width:46rem){
  .ww-frame{
    inset:clamp(1.35rem,4.4vh,2.75rem) auto;
    left:50%;transform:translateX(-50%);
    width:min(100% - 4rem,36rem)
  }
}

/* ── buttons ─────────────────────────────────────────────────────── */
/* Border is the affordance, so it is solid --gold-deco (3:1 on ivory)
   rather than a pale tint. Hover fills with the text gold, which keeps
   the label at 5.3:1 instead of the 3:1 a pale fill would give. */
.ww-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.6em;
  padding:1.05rem 2.4rem;border-radius:2px;
  font-size:.75rem;font-weight:500;letter-spacing:.24em;text-transform:uppercase;
  cursor:pointer;background:transparent;border:1px solid var(--gold-deco);color:var(--ink);
  transition:background-color .2s ease,color .2s ease,border-color .2s ease
}
.ww-btn:hover{background:var(--gold);border-color:var(--gold);color:var(--ivory)}
.ww-btn--solid{background:var(--gold);border-color:var(--gold);color:var(--ivory)}
.ww-btn--solid:hover{background:var(--wine);border-color:var(--wine)}
.ww-btn[disabled]{opacity:.5;cursor:not-allowed}

/* ── fields ──────────────────────────────────────────────────────── */
.ww-field{
  width:100%;padding:.9rem 1rem;
  background:rgba(255,255,255,.72);
  border:1px solid var(--field-border);border-radius:2px;
  font-family:'Jost',sans-serif;font-size:1rem;font-weight:300;color:var(--ink);
  transition:border-color .2s ease,box-shadow .2s ease
}
.ww-field::placeholder{color:rgba(43,33,36,.42)}
.ww-field:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(138,96,19,.18)}
.ww-field[aria-invalid="true"]{border-color:#96324B;box-shadow:0 0 0 3px rgba(150,50,75,.14)}
select.ww-field{
  appearance:none;padding-right:2.5rem;
  background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' fill='none' stroke='%238A6013' stroke-width='1.4'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 1rem center
}
.ww-fielabel{
  display:block;margin-bottom:.5rem;
  font-size:.6875rem;font-weight:500;letter-spacing:.2em;
  text-transform:uppercase;color:var(--ink-soft)
}
.ww-error{display:block;margin-top:.45rem;font-size:.8125rem;color:#96324B}

/* accept / decline — real radios so arrow keys work */
.ww-choice{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.ww-choice-label{
  display:flex;align-items:center;gap:.8rem;
  padding:.95rem 1rem;border:1px solid var(--field-border);border-radius:2px;
  background:rgba(255,255,255,.6);cursor:pointer;
  font-size:.75rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ink-soft);
  transition:border-color .2s ease,background-color .2s ease,color .2s ease
}
.ww-choice-label:hover{border-color:var(--gold-deco)}
.ww-choice:checked+.ww-choice-label{border-color:var(--gold);background:rgba(138,96,19,.09);color:var(--ink)}
.ww-choice:focus-visible+.ww-choice-label{outline:2px solid var(--gold);outline-offset:2px}
.ww-tick{
  flex:none;width:15px;height:15px;border:1px solid var(--field-border);border-radius:50%;
  display:flex;align-items:center;justify-content:center
}
.ww-choice:checked+.ww-choice-label .ww-tick{border-color:var(--gold)}
.ww-choice:checked+.ww-choice-label .ww-tick::after{
  content:"";width:7px;height:7px;border-radius:50%;background:var(--gold)
}

/* ── the big day cards ───────────────────────────────────────────── */
.ww-cards{
  display:grid;gap:clamp(20px,5vw,34px);
  grid-template-columns:1fr;margin-top:clamp(30px,7vw,48px)
}
@media (min-width:46rem){
  .ww-cards[data-count="2"],.ww-cards[data-count="3"]{grid-template-columns:repeat(2,1fr)}
}
.ww-card{
  position:relative;border:1px solid var(--rule-soft);background:var(--ivory);
  padding:clamp(30px,7vw,46px) clamp(22px,5vw,36px);text-align:center
}
.ww-card::before{
  content:"";position:absolute;inset:6px;border:1px solid rgba(176,138,51,.13);pointer-events:none
}
.ww-card h3{
  font-size:.6875rem;font-weight:500;letter-spacing:.28em;text-transform:uppercase;
  color:var(--gold);margin-bottom:1.4rem
}
.ww-map{
  display:inline-block;margin-top:1.3rem;padding-bottom:.2rem;
  border-bottom:1px solid var(--rule);
  font-size:.6875rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;
  color:var(--gold);text-decoration:none;transition:border-color .2s ease
}
.ww-map:hover{border-color:var(--gold)}

/* ── countdown ───────────────────────────────────────────────────── */
.ww-units{
  display:grid;grid-template-columns:repeat(2,1fr);
  gap:clamp(24px,6vw,40px) 0;
  margin:clamp(32px,7vw,50px) auto 0;max-width:38rem
}
@media (min-width:30rem){.ww-units{grid-template-columns:repeat(4,1fr)}}
.ww-unit{text-align:center;border-left:1px solid rgba(223,193,121,.18)}
.ww-unit:first-child,.ww-unit:nth-child(3){border-left:0}
@media (min-width:30rem){
  .ww-unit:nth-child(3){border-left:1px solid rgba(223,193,121,.18)}
  .ww-unit:first-child{border-left:0}
}
.ww-unit .ww-num{
  font-size:clamp(38px,11vw,64px);color:var(--ivory);
  font-variation-settings:'opsz' 96
}
.ww-unit span.ww-cap{
  display:block;margin-top:.85rem;
  font-size:.625rem;font-weight:500;letter-spacing:.3em;
  text-transform:uppercase;color:var(--gold-lt);opacity:.8
}

/* ── song ────────────────────────────────────────────────────────── */
.ww-player{display:flex;align-items:center;gap:1.1rem;max-width:23rem;margin:2rem auto 0}
.ww-play{
  flex:none;width:56px;height:56px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  border:1px solid var(--gold);color:var(--ivory);background:var(--gold);
  transition:background-color .2s ease,transform .2s ease
}
.ww-play:hover{background:var(--wine);border-color:var(--wine);transform:scale(1.03)}
.ww-play svg{display:block}
.ww-track{flex:1;min-width:0}
.ww-scrub{height:2px;background:rgba(43,33,36,.16);cursor:pointer;overflow:hidden}
.ww-scrub span{display:block;height:100%;background:var(--gold);width:0}
.ww-times{
  display:flex;justify-content:space-between;margin-top:.5rem;
  font-size:.6875rem;letter-spacing:.1em;color:var(--ink-soft);
  font-variant-numeric:tabular-nums
}

/* ── hero entrance — the page's single orchestrated moment ───────── */
@keyframes ww-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
.ww-hero>*{animation:ww-rise .9s cubic-bezier(.22,1,.36,1) both}
.ww-hero>*:nth-child(1){animation-delay:.05s}
.ww-hero>*:nth-child(2){animation-delay:.14s}
.ww-hero>*:nth-child(3){animation-delay:.23s}
.ww-hero>*:nth-child(4){animation-delay:.32s}
.ww-hero>*:nth-child(5){animation-delay:.41s}
.ww-hero>*:nth-child(6){animation-delay:.5s}
.ww-hero>*:nth-child(7){animation-delay:.58s}

.ww-thread{
  position:fixed;top:0;left:0;height:2px;z-index:60;
  background:var(--gold);transition:width .12s linear;pointer-events:none
}

@media (prefers-reduced-motion:reduce){
  .ww *,.ww *::before,.ww *::after{
    animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important;scroll-behavior:auto!important
  }
  .ww-hero>*{opacity:1!important;transform:none!important}
}
`;

if (typeof document !== "undefined" && !document.getElementById("ww-font")) {
  const link = document.createElement("link");
  link.id = "ww-font";
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "ww-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════════
//  The foil engine
//
//  Nine or ten botanicals per page, each revealing as it enters and
//  retiring as it leaves, is more animation than it sounds, and the
//  naive way to do the drift is a listener per ornament. At that many
//  that is that many getBoundingClientRect() calls interleaved with as
//  many style writes — read, write, read, write — and each write
//  invalidates the layout the next read was about to do. So instead they
//  all register here, and the loop below measures everything before it
//  touches anything.
// ═══════════════════════════════════════════════════════════════════
const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const drifters = new Set();
let driftFrame = null;

const flushDrift = () => {
  driftFrame = null;
  const vh = window.innerHeight || 1;
  const jobs = [];

  // read — every measurement, before a single style is touched
  for (const el of drifters) {
    const r = el.getBoundingClientRect();
    jobs.push([el, (r.top + r.height / 2 - vh / 2) / vh]);
  }
  // write
  for (const [el, p] of jobs) el.style.setProperty("--p", p.toFixed(4));
};

const scheduleDrift = () => {
  if (driftFrame === null) driftFrame = requestAnimationFrame(flushDrift);
};

const registerDrift = (el) => {
  drifters.add(el);
  if (drifters.size === 1) {
    window.addEventListener("scroll", scheduleDrift, { passive: true });
    window.addEventListener("resize", scheduleDrift);
  }
  scheduleDrift();
  return () => {
    drifters.delete(el);
    if (drifters.size === 0) {
      window.removeEventListener("scroll", scheduleDrift);
      window.removeEventListener("resize", scheduleDrift);
      if (driftFrame !== null) {
        cancelAnimationFrame(driftFrame);
        driftFrame = null;
      }
    }
  };
};

/* One ornament's worth of behaviour: a ref to hang on the element, and
   whether it is currently in view.

   The reveal is reversible on purpose. An ornament that only ever reveals
   leaves the upper half of the page inert once the guest scrolls back
   into it, and a page you can only walk forwards through reads as spent.
   So the observer stays connected and each ornament retires the way it
   arrived, which is what makes scrolling up and down again feel like a
   loop rather than a one-way trip.

   The two thresholds are what stop that from strobing on a trackpad: it
   takes a sixth of the ornament to arrive, and almost nothing to leave,
   so an ornament hovering at the fold cannot flip back and forth. */
function useFoil(drift) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (REDUCED) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const r = entry.intersectionRatio;
        setShown((was) => (was ? r > 0.02 : r > 0.16));
      },
      { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.02, 0.16, 0.4] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !drift || REDUCED) return;
    el.style.setProperty("--drift", `${drift}px`);
    return registerDrift(el);
  }, [drift]);

  return [ref, shown];
}

/* Every ornament draws its entrance from this list at random, once, when
   it mounts. One reveal applied everywhere stops reading as an event and
   starts reading as a mechanism. Repeats here are deliberate weights, not
   accidents: the draw is the page's signature and stays the likeliest,
   and no ornament takes the same one as the ornament beside it. */
const REVEALS = [
  "line", "line", "line", "line-r",
  "rise", "rise", "settle", "slide", "slide-r",
  "bloom", "unfurl", "sway",
  "wipe", "wipe-r", "wipe-d", "wipe-u",
];

/* Four easings, so even two ornaments that drew the same reveal do not
   move identically. */
const EASES = [
  "cubic-bezier(.42,0,.2,1)",
  "cubic-bezier(.22,1,.36,1)",
  "cubic-bezier(.16,1,.3,1)",
  "cubic-bezier(.5,0,.15,1)",
];

const pickReveal = () => ({
  k: REVEALS[Math.floor(Math.random() * REVEALS.length)],
  dur: (1.15 + Math.random() * 1.05).toFixed(2),
  delay: (Math.random() * 0.3).toFixed(2),
  step: (0.05 + Math.random() * 0.13).toFixed(3),
  ease: EASES[Math.floor(Math.random() * EASES.length)],
});

/* Placement. `tier` picks the opacity (see the stylesheet); `x`/`y` are
   percentages of the panel, so an ornament keeps its station as the panel
   grows. Negative values put it off the edge, which is where a botanical
   usually belongs — a sprig that stops politely short of the trim reads
   as a sticker.

   `inline` drops it back into the flow instead, for the few that flank a
   word rather than sit behind one.

   Three elements, because three things want to transform independently
   and only one of them can own `transform` at a time: the outer span
   holds the position and the ornament's fixed orientation, the middle
   holds the entrance, and the svg holds the drift. */
function Foil({
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

// ── The botanical vocabulary ────────────────────────────────────────
//  Ten motifs, all stroke art in currentColor, so one set wears the
//  ornamental gold on the ivory panels and the light gold on the wine
//  ones. Nothing here is filled: at seven per cent opacity a fill turns
//  to mud where a line still reads as a line.
//
//  The page's own card is the source — white blossom, gold leaf outline,
//  the wreath ring behind the wording — not a general idea of "floral".
const PETAL = "M50 50C43 39 44 26 50 17c6 9 7 22 0 33Z";

/* One leaf, drawn from its stem at the origin up and to the right. Placed
   by transform wherever a leaf is wanted — the frond hangs a dozen off a
   rib, the wreath sets thirty round a ring — so every leaf on the page is
   the same leaf. */
const LEAF = "M0 0C7 -2 13 -8 15 -17C7 -13 2 -6 0 0Z";

/* One bloom, from which every flower on the page is built: the spray,
   the single bloom and the bud cluster all use it, so the ornament reads
   as one hand rather than as ten separate drawings. */
const Bloom = ({ cx = 50, cy = 50, s = 1, petals = 5 }) => (
  <g transform={`translate(${cx} ${cy}) scale(${s}) translate(-50 -50)`}>
    {Array.from({ length: petals }, (_, i) => (
      <path
        key={i}
        pathLength="1"
        d={PETAL}
        transform={`rotate(${(360 / petals) * i} 50 50)`}
      />
    ))}
    <circle pathLength="1" cx="50" cy="50" r="4.5" />
    <circle pathLength="1" cx="50" cy="50" r="1.5" />
  </g>
);

const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: ".85",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

const BlossomSpray = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M3 98C17 82 29 63 39 43 48 25 59 13 73 7" />
    <path pathLength="1" d="M37 57C28 52 19 52 10 57c8 7 19 9 27 0Z" />
    <path pathLength="1" d="M49 37c9-7 19-9 29-7-5 9-18 13-29 7Z" />
    <path pathLength="1" d="M61 19c-3-8-1-14 5-18 5 7 3 14-5 18Z" />
    <Bloom cx={79} cy={8} s={.44} />
  </svg>
);

const LeafFrond = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M50 100C50 76 48 48 43 24 40 12 35 4 28 0" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const y = 90 - i * 13;
      const x = 50 - i * 1.1;
      const s = 1.5 - i * 0.15;
      return (
        <g key={i}>
          <path
            pathLength="1"
            d={LEAF}
            transform={`translate(${x.toFixed(1)} ${y}) rotate(${-98 + i * 2}) scale(${s.toFixed(2)})`}
          />
          <path
            pathLength="1"
            d={LEAF}
            transform={`translate(${x.toFixed(1)} ${y}) rotate(${-6 - i * 2}) scale(${s.toFixed(2)})`}
          />
        </g>
      );
    })}
  </svg>
);

/* An arc carrying leaves on its outer edge — cut to run beside a rule or
   around the crook of a corner, which is where the card uses one. */
const LaurelArc = (p) => (
  <svg viewBox="0 0 140 70" {...svgProps} {...p}>
    <path pathLength="1" d="M2 68C26 68 52 58 74 40 94 24 116 14 138 12" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const t = i / 7;
      const x = 2 + t * 136;
      const y = 68 - Math.pow(t, 1.5) * 56;
      return (
        <g key={i}>
          <path pathLength="1" d={`M${x} ${y}c-3-9-9-14-17-15 1 9 7 15 17 15Z`} />
          <path pathLength="1" d={`M${x} ${y}c3-8 10-12 18-12-2 8-9 13-18 12Z`} />
        </g>
      );
    })}
  </svg>
);

const SingleBloom = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <Bloom cx={50} cy={44} s={1.5} />
    <path pathLength="1" d="M50 96C50 78 48 66 42 56" />
    <path pathLength="1" d="M46 72C38 69 30 70 22 76c9 5 18 3 24-4Z" />
    <path pathLength="1" d="M48 84c8-4 17-3 24 3-8 5-18 3-24-3Z" />
    <path pathLength="1" d="M50 20V2M41 24l-8-15M59 24l8-15" />
  </svg>
);

const BudCluster = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M14 98C26 82 36 66 44 48 51 33 58 20 66 10" />
    <path pathLength="1" d="M42 56c-7-4-15-4-22 1 7 6 16 6 22-1Z" />
    <path pathLength="1" d="M52 36c7-5 15-6 22-2-6 7-16 8-22 2Z" />
    <Bloom cx={70} cy={8} s={.34} petals={5} />
    <Bloom cx={38} cy={30} s={.26} petals={5} />
    <path pathLength="1" d="M30 46c-4-4-9-6-15-5 3 6 9 8 15 5Z" />
  </svg>
);

const FernCurl = (p) => {
  const turns = 2.3;
  const N = 96;
  const pts = [];
  for (let i = 0; i <= N; i += 1) {
    const t = i / N;
    const a = t * turns * Math.PI * 2 - 0.6;
    const r = 36 * Math.pow(0.6, t * 3.3);
    pts.push(`${i ? "L" : "M"}${(54 + r * Math.cos(a)).toFixed(1)} ${(56 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 100 100" {...svgProps} {...p}>
      <path pathLength="1" d={pts.join("")} />
      <path pathLength="1" d="M54 92C44 92 34 88 26 80" />
      <path pathLength="1" d="M34 84c-3-6-8-10-15-11 2 7 8 12 15 11Z" />
      <path pathLength="1" d="M48 90c4-6 11-9 18-9-3 7-10 11-18 9Z" />
    </svg>
  );
};

const SeedPod = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M50 98C36 78 30 56 32 34 33 20 38 8 46 0" />
    <path pathLength="1" d="M50 96C62 76 68 54 66 32 65 19 60 8 53 1" />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <circle key={i} pathLength="1" cx={i % 2 ? 44 : 55} cy={14 + i * 14} r="3.4" />
    ))}
  </svg>
);

/* The ring the card sets behind its wording — a watermark, and the only
   motif here meant to close on itself. The leaves lean along the ring
   rather than standing out from it, which is the difference between a
   laurel wreath and a sun. */
const WreathRing = (p) => {
  const N = 30;
  return (
    <svg viewBox="0 0 100 100" {...svgProps} {...p}>
      <circle pathLength="1" cx="50" cy="50" r="39" />
      <circle pathLength="1" cx="50" cy="50" r="31" opacity=".42" />
      {Array.from({ length: N }, (_, i) => {
        const a = (i / N) * Math.PI * 2;
        const cx = 50 + 35 * Math.cos(a);
        const cy = 50 + 35 * Math.sin(a);
        const deg = (a * 180) / Math.PI;
        return (
          <path
            key={i}
            pathLength="1"
            d={LEAF}
            transform={`translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${(
              deg + 47 + (i % 2 ? 58 : 34)
            ).toFixed(1)}) scale(.3)`}
          />
        );
      })}
    </svg>
  );
};

// ── Hooks ───────────────────────────────────────────────────────────
function useCountdown(target) {
  const calc = useCallback(() => {
    const d = asDate(target).getTime() - Date.now();
    if (d <= 0) return null;
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor(d / 3600000) % 24,
      minutes: Math.floor(d / 60000) % 60,
      seconds: Math.floor(d / 1000) % 60,
    };
  }, [target]);

  const [t, setT] = useState(calc);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return p;
}

const scrollToId = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ═══════════════════════════════════════════════════════════════════
//  The engraved rule. One ornament for the whole page: a hairline
//  drawn in from both margins to a small diamond — the rule a
//  letterpress invitation uses to divide one thought from the next.
// ═══════════════════════════════════════════════════════════════════
const EngravedRule = ({ width = "min(19rem,74%)", tone = "ivory", style }) => (
  <div
    className={`ww-engraved${tone === "wine" ? " ww-engraved--onwine" : ""}`}
    style={{ width, margin: "0 auto", ...style }}
    aria-hidden="true"
  >
    <i />
    <svg width="11" height="11" viewBox="0 0 11 11" focusable="false">
      <rect
        x="2.2"
        y="2.2"
        width="6.6"
        height="6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth=".9"
        transform="rotate(45 5.5 5.5)"
      />
    </svg>
    <i />
  </div>
);

// ═══════════════════════════════════════════════════════════════════
//  Monogram — the couple's two initials interlocked.
//
//  CONFIG.initials arrives as "A & E": initials *and* their separator,
//  so the letters are pulled out of it rather than drawn whole.
//
//  The interlock is the engraver's trick. The second letter is stroked
//  in the panel's own colour before its fill is laid down, which opens
//  a hairline gap through the first wherever the two cross. The pair
//  then reads as one woven mark instead of two letters set side by
//  side. A ring or a badge around it would only turn it back into a
//  logo, which is the one thing a stationer's monogram is not.
//
//  Great Vibes is doing the ornament. Its capitals carry the curled
//  terminals and the long descending swash that a drawn monogram has,
//  which no amount of tracking a text serif will fake.
// ═══════════════════════════════════════════════════════════════════
const MONO_FACE = "'Great Vibes', 'Pinyon Script', cursive";
const MONO_SIZE = 58;
const MONO_SHARE = 0.24; // how much of the narrower letter the two share
const MONO_PAD = 4;

const initialPair = (s) => ((s || "").match(/[A-Za-z]/g) || []).slice(0, 2);

/* Where the two letters actually land.
 *
 * Great Vibes overhangs its advance width badly, and by a different
 * amount per letter — at 58 units a capital M inks 85 wide where an E
 * inks 51. A guessed offset therefore merges some pairs into one blob
 * and leaves others barely touching. So the overlap is taken from the
 * letters' real ink boxes, which means measuring, which in turn means
 * waiting for the face to land: measured before it does, the numbers
 * describe the fallback font and are worthless.
 *
 * The two <text> nodes are drawn on top of each other at the origin
 * until the measurement arrives; the caller keeps them transparent
 * until then, so a wrong-frame monogram is never painted.
 */
function useMonogramFit(letters) {
  const holder = useRef(null);
  const [fit, setFit] = useState(null);
  const key = letters.join("");

  useLayoutEffect(() => {
    let live = true;

    const measure = () => {
      const g = holder.current;
      if (!g || !live) return;
      const boxes = Array.from(g.querySelectorAll("text")).map((t) => t.getBBox());
      const [a, b] = boxes;
      if (!a || !b || !a.width || !b.width) return;

      const ov = MONO_SHARE * Math.min(a.width, b.width);
      const top = Math.min(a.y, b.y);
      const bottom = Math.max(a.y + a.height, b.y + b.height);

      setFit({
        vx: -MONO_PAD,
        vy: top - MONO_PAD,
        vw: a.width + b.width - ov + 2 * MONO_PAD,
        vh: bottom - top + 2 * MONO_PAD,
        first: `translate(${-a.x} 0)`,
        second: `translate(${a.width - ov - b.x} 0)`,
      });
    };

    measure();
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`${MONO_SIZE}px 'Great Vibes'`).then(measure).catch(measure);
    }
    return () => {
      live = false;
    };
  }, [key]);

  return [holder, fit];
}

/* The mark itself: two capitals on a shared baseline, the second
   stroked in the panel's own colour before its fill is laid down. That
   stroke is what opens a hairline gap through the first letter where
   the two cross, so the pair reads as one woven mark rather than two
   letters set side by side — the engraver's trick. */
const MonoLetters = ({ holder, fit, letters, fill, bg }) => (
  <g ref={holder}>
    {letters.map((ch, i) => (
      <text
        key={i}
        x="0"
        y="0"
        fontFamily={MONO_FACE}
        fontSize={MONO_SIZE}
        fill={fill}
        transform={fit ? (i ? fit.second : fit.first) : undefined}
        {...(i
          ? {
              stroke: bg,
              strokeWidth: "5",
              strokeLinejoin: "round",
              paintOrder: "stroke",
            }
          : {})}
      >
        {ch}
      </text>
    ))}
  </g>
);

function Monogram({ size = "clamp(104px,30vw,136px)", initials, onWine, bg }) {
  const letters = initialPair(initials);
  const [holder, fit] = useMonogramFit(letters);
  const width = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      viewBox={fit ? `${fit.vx} ${fit.vy} ${fit.vw} ${fit.vh}` : "0 0 100 80"}
      role="img"
      aria-label={letters.length === 2 ? `${CONFIG.bride} and ${CONFIG.groom}` : CONFIG.bride}
      style={{
        display: "block",
        margin: "0 auto",
        width,
        height: "auto",
        aspectRatio: fit ? `${fit.vw} / ${fit.vh}` : "100 / 80",
        opacity: fit ? 1 : 0,
        transition: "opacity .5s ease",
        overflow: "visible",
      }}
    >
      <MonoLetters
        holder={holder}
        fit={fit}
        letters={letters}
        fill={onWine ? "#DFC179" : "#8A6013"}
        bg={bg || (onWine ? "#2E0C18" : "#FBF7F0")}
      />
    </svg>
  );
}

/* `foil` is the ornament layer, rendered inside the panel but outside
   .ww-inner, so it lands below every word. */
const Section = ({ id, tone = "ivory", foil, children }) => (
  <section id={id} className={`ww-panel ww-panel--${tone}`}>
    {foil}
    <div className="ww-inner">{children}</div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
//  Sections
// ═══════════════════════════════════════════════════════════════════
function Hero() {
  const d = asDate(CONFIG.weddingDate);
  return (
    <section
      className="ww-panel ww-panel--ivory"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background:
          "radial-gradient(ellipse 130% 90% at 50% 0%, #FFFFFF 0%, var(--ivory) 46%, var(--pearl) 100%)",
      }}
    >
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
          <span className="ww-script" style={{ color: "var(--gold)" }}>
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

function Story() {
  return (
    <Section
      id="story"
      tone="pearl"
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

function BigDay() {
  const events = CONFIG.events || [];
  // A white wedding usually runs both parts on one day. When it does,
  // print the date once above the cards instead of twice inside them,
  // so each card leads with its own time.
  const dayKey = (v) => asDate(v).toDateString();
  const sameDay =
    events.length > 1 && events.every((e) => dayKey(e.date) === dayKey(events[0].date));

  return (
    <Section
      id="details"
      tone="ivory"
      foil={
        <>
          <Foil art={LaurelArc} tier="accent" size={300} x="-6%" y="62%" rotate={-4} drift={-40} />
          <Foil art={LeafFrond} tier="wm" size={330} x="78%" y="-4%" rotate={12} flip drift={52} />
          <Foil art={SingleBloom} tier="wm" size={210} x="3%" y="6%" rotate={-8} drift={30} />
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <p className="ww-label">The day</p>
        <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 0" }} />
        {sameDay ? (
          <p
            className="ww-display"
            style={{
              marginTop: "1.7rem",
              fontSize: "clamp(1.75rem,6.5vw,2.5rem)",
              color: "var(--ink)",
            }}
          >
            {fmtShortDate(events[0].date)}
          </p>
        ) : null}
      </div>

      <div className="ww-cards" data-count={Math.min(events.length, 3)}>
        {events.map((e, i) => (
          <article className="ww-card" key={i}>
            <h3>{e.label}</h3>

            {sameDay ? (
              <p
                className="ww-display"
                style={{ fontSize: "clamp(1.625rem,5.8vw,2rem)", color: "var(--ink)" }}
              >
                {fmtTime(e.date)}
              </p>
            ) : (
              <>
                <p
                  className="ww-display"
                  style={{ fontSize: "clamp(1.5rem,5.4vw,1.875rem)", color: "var(--ink)" }}
                >
                  {fmtShortDate(e.date)}
                </p>
                <p
                  className="ww-text"
                  style={{
                    marginTop: ".6rem",
                    fontSize: "1rem",
                    letterSpacing: ".1em",
                    color: "var(--ink-soft)",
                  }}
                >
                  {fmtTime(e.date)}
                </p>
              </>
            )}

            <EngravedRule width="min(7rem,50%)" style={{ margin: "1.5rem auto" }} />

            <p className="ww-text" style={{ fontSize: "1.0625rem", color: "var(--ink)" }}>
              {e.venue}
              {e.address ? (
                <>
                  <br />
                  <span style={{ color: "var(--ink-soft)" }}>{e.address}</span>
                </>
              ) : null}
            </p>

            <a className="ww-map" href={mapHref(e)} target="_blank" rel="noreferrer">
              Open in maps
            </a>
          </article>
        ))}
      </div>

      {CONFIG.dressCode ? (
        <p
          className="ww-text"
          style={{
            marginTop: "clamp(34px,8vw,52px)",
            textAlign: "center",
            fontSize: ".875rem",
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          {CONFIG.dressCode}
        </p>
      ) : null}
    </Section>
  );
}

function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const by = asDate(CONFIG.rsvpBy);

  // Shared between both branches so the ring does not jump the moment the
  // countdown runs out and the section swaps to its "today" copy.
  const foil = (
    <>
      <Foil art={WreathRing} tier="wm" size={640} x="50%" y="50%" drift={22}
            style={{ marginLeft: -320, marginTop: -320 }} />
      <Foil art={FernCurl} tier="wm" size={260} x="80%" y="64%" rotate={-20} flip drift={-34} />
      <Foil art={BlossomSpray} tier="wm" size={250} x="-5%" y="6%" rotate={8} drift={36} />
    </>
  );

  if (!t) {
    return (
      <Section id="countdown" tone="deep" foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
          <p className="ww-label ww-label--onwine">Today</p>
          <EngravedRule tone="wine" width="min(13rem,55%)" style={{ margin: "1.5rem auto" }} />
          <p
            className="ww-display"
            style={{ fontSize: "clamp(2.125rem,8vw,3.25rem)", color: "var(--ivory)" }}
          >
            The day is here
          </p>
        </div>
      </Section>
    );
  }

  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <Section id="countdown" tone="wine" foil={foil}>
      <div style={{ textAlign: "center" }}>
        <p className="ww-label ww-label--onwine">Until we say I do</p>
        <EngravedRule tone="wine" width="min(13rem,55%)" style={{ margin: "1.5rem auto 0" }} />

        <div className="ww-units">
          {units.map(({ v, l }) => (
            <div className="ww-unit" key={l}>
              <p className="ww-num">
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", minWidth: "2ch", textAlign: "center" }}
                >
                  {String(v).padStart(2, "0")}
                </span>
                <span
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {v} {l}
                </span>
              </p>
              <span className="ww-cap">{l}</span>
            </div>
          ))}
        </div>

        {by && by.getTime() > Date.now() ? (
          <p
            style={{
              marginTop: "clamp(36px,8vw,54px)",
              fontSize: ".6875rem",
              fontWeight: 500,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--on-wine-dim)",
            }}
          >
            Kindly reply by {fmtShortDate(by)}
          </p>
        ) : null}
      </div>
    </Section>
  );
}

function Song() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const hasAudio = Boolean(CONFIG.songUrl);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const seek = (e) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = ratio * duration;
  };

  const mmss = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  return (
    <Section
      id="song"
      tone="ivory"
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

        {hasAudio ? (
          <>
            <audio
              ref={audioRef}
              src={CONFIG.songUrl}
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />
            <div className="ww-player">
              <button
                type="button"
                className="ww-play"
                onClick={toggle}
                aria-label={playing ? `Pause ${CONFIG.songTitle}` : `Play ${CONFIG.songTitle}`}
              >
                <svg width="17" height="17" viewBox="0 0 17 17" aria-hidden="true" focusable="false">
                  {playing ? (
                    <>
                      <rect x="3.5" y="2.5" width="3.4" height="12" fill="currentColor" />
                      <rect x="10.1" y="2.5" width="3.4" height="12" fill="currentColor" />
                    </>
                  ) : (
                    <path d="M4.6 2.3l10 6.2-10 6.2z" fill="currentColor" />
                  )}
                </svg>
              </button>

              <div className="ww-track">
                <div className="ww-scrub" role="presentation" onClick={seek}>
                  <span style={{ width: duration ? `${(elapsed / duration) * 100}%` : "0%" }} />
                </div>
                <div className="ww-times">
                  <span>{mmss(elapsed)}</span>
                  <span>{mmss(duration)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Section>
  );
}

function Rsvp() {
  const [form, setForm] = useState({ guests: "1", name: "", phone: "", attending: "yes" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  const buildMessage = () =>
    [
      `RSVP — ${CONFIG.bride} & ${CONFIG.groom}`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Guests: ${form.guests}`,
      form.attending === "yes" ? "Attending: Yes" : "Attending: No, with regret",
    ].join("\n");

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Please enter your name so we know who is coming.";
    if (!form.phone.trim()) next.phone = "Please add a phone number we can reach you on.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) {
      document.querySelector("[aria-invalid='true']")?.focus();
      return;
    }
    const text = buildMessage();
    const to = (CONFIG.whatsapp || "").replace(/\D/g, "");
    const href = to
      ? `https://wa.me/${to}?text=${encodeURIComponent(text)}`
      : `mailto:${CONFIG.email}?subject=${encodeURIComponent(
          `RSVP — ${form.name.trim()}`
        )}&body=${encodeURIComponent(text)}`;

    window.open(href, "_blank", "noopener");
    setSent(true);
  };

  const mailtoHref = `mailto:${CONFIG.email}?subject=${encodeURIComponent(
    `RSVP — ${CONFIG.bride} & ${CONFIG.groom}`
  )}&body=${encodeURIComponent(buildMessage())}`;

  // Shared between both branches so the ornament does not restart when
  // the form is replaced by its thank-you.
  const foil = (
    <>
      <Foil art={LaurelArc} tier="accent" size={280} x="-7%" y="8%" rotate={-6} drift={38} />
      <Foil art={FernCurl} tier="wm" size={300} x="76%" y="58%" rotate={14} flip drift={-36} />
    </>
  );

  if (sent) {
    return (
      <Section id="rsvp" tone="pearl" foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
          <EngravedRule width="min(13rem,55%)" />
          <p
            className="ww-display"
            style={{
              marginTop: "2rem",
              fontSize: "clamp(1.875rem,7vw,2.5rem)",
              color: "var(--ink)",
            }}
          >
            Thank you, {form.name.trim().split(" ")[0]}
          </p>
          <p
            className="ww-text"
            style={{ marginTop: "1.2rem", fontSize: "1.0625rem", color: "var(--ink-soft)" }}
          >
            {form.attending === "yes"
              ? "Your reply is on its way to us. We cannot wait to see you."
              : "Your reply is on its way. We will miss you, and thank you for telling us."}
          </p>

          {form.attending === "yes" ? (
            <p style={{ marginTop: "2rem", fontSize: ".875rem", color: "var(--ink-soft)" }}>
              If the message did not open,{" "}
              <a
                href={mailtoHref}
                style={{
                  color: "var(--gold)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                send it by email instead
              </a>
              .
            </p>
          ) : null}
        </div>
      </Section>
    );
  }

  return (
    <Section id="rsvp" tone="pearl" foil={foil}>
      <div style={{ maxWidth: "27rem", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <p className="ww-label">Kindly RSVP</p>
          <EngravedRule width="min(13rem,55%)" style={{ margin: "1.5rem auto 2.2rem" }} />
        </div>

        <form onSubmit={submit} noValidate>
          <div>
            <label className="ww-fielabel" htmlFor="ww-guests">
              Number of guests
            </label>
            <select
              id="ww-guests"
              className="ww-field"
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "1.2rem" }}>
            <label className="ww-fielabel" htmlFor="ww-name">
              Full name
            </label>
            <input
              id="ww-name"
              className="ww-field"
              placeholder="Your name"
              value={form.name}
              autoComplete="name"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "ww-name-err" : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name ? (
              <p className="ww-error" id="ww-name-err">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div style={{ marginTop: "1.2rem" }}>
            <label className="ww-fielabel" htmlFor="ww-phone">
              Phone number
            </label>
            <input
              id="ww-phone"
              className="ww-field"
              placeholder="So we can reach you"
              type="tel"
              inputMode="tel"
              value={form.phone}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "ww-phone-err" : undefined}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone ? (
              <p className="ww-error" id="ww-phone-err">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <fieldset style={{ marginTop: "1.6rem" }}>
            <legend className="ww-fielabel" style={{ padding: 0 }}>
              Will you be joining us?
            </legend>
            <div style={{ display: "grid", gap: ".6rem" }}>
              {[
                { val: "yes", label: "Accepts with pleasure" },
                { val: "no", label: "Declines with regret" },
              ].map(({ val, label }) => (
                <div key={val} style={{ position: "relative" }}>
                  <input
                    className="ww-choice"
                    type="radio"
                    name="ww-attending"
                    id={`ww-att-${val}`}
                    value={val}
                    checked={form.attending === val}
                    onChange={() => set("attending", val)}
                  />
                  <label className="ww-choice-label" htmlFor={`ww-att-${val}`}>
                    <span className="ww-tick" aria-hidden="true" />
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            className="ww-btn ww-btn--solid"
            style={{ width: "100%", marginTop: "1.7rem" }}
          >
            Send my reply
          </button>

          <p
            style={{
              marginTop: "1rem",
              fontSize: ".8125rem",
              lineHeight: 1.6,
              color: "var(--ink-soft)",
              textAlign: "center",
            }}
          >
            Your reply opens in WhatsApp, ready to send. Nothing is stored on this page.
          </p>
        </form>
      </div>
    </Section>
  );
}

function Footer() {
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
export default function WhiteWedding() {
  const progress = useScrollProgress();

  return (
    <div className="ww">
      <div className="ww-thread" style={{ width: `${progress * 100}%` }} aria-hidden="true" />

      <Hero />
      <Story />
      <BigDay />
      <Countdown />
      <Song />
      <Rsvp />
      <Footer />
    </div>
  );
}
