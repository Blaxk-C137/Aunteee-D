import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════
//  ASO-OKE WEDDING INVITATION
//
//  Aso-oke is woven in narrow strips sewn edge to edge — so this page
//  is built as woven cloth, not as stacked cards. Every panel meets
//  the next at a woven seam, and the site has exactly one ornament:
//  the aso-oke band. There is no starfield, no clip art, no filler.
//
//  The only animation is the hero's entrance. Everything else that
//  moves is answering something the guest did.
// ═══════════════════════════════════════════════════════════════════

// ─── EDIT THESE ─────────────────────────────────────────────────────
const CONFIG = {
  bride: "Adaeze",
  groom: "Emeka",

  // Monogram inside the woven medallion. Keep it short — 3–5 characters.
  initials: "A & E",

  // Drives the hero date and the countdown.
  weddingDate: "2027-07-18T14:00:00",

  // ── The card's wording ────────────────────────────────────────────
  // Where the couple have both an indigenous and an English name, fill
  // in `names` below and the hero sets them as the invitation does: the
  // traditional name large, the English one beneath it in script. Leave
  // `traditional` empty and the hero falls back to the single serif name
  // from `bride`/`groom` above.
  names: {
    bride: { traditional: "Adaeze", english: "Grace" },
    groom: { traditional: "Emeka", english: "Emmanuel" },
  },

  // Who is doing the inviting. One entry per household, set in the order
  // they should be read; the card puts an ampersand between them. Leave
  // the list empty and the section falls back to the hero's plain
  // "Together with their families".
  families: [
    { names: "Elder and Mrs Ochende Micheal", place: "Okehi L.G.A, Kogi State" },
    { names: "Elder and Deaconess Polarin Osore", place: "Ikere L.G.A, Ekiti State" },
  ],

  // The ceremony being announced. It sits in script on the card's centre
  // line, so it wants to read as "cordially request the honour of your
  // presence … to the Traditional Marriage of their beloved children".
  ceremonyType: "Traditional Marriage",

  // The Big Day. Add or remove entries freely — one event renders as a
  // single block, two or more sit side by side on wide screens. A
  // Nigerian wedding usually wants both lines here.
  events: [
    {
      label: "Traditional Ceremony",
      date: "2027-07-15T10:00:00",
      venue: "The Family Compound",
      address: "Kano, Nigeria",
    },
    {
      label: "White Wedding",
      date: "2027-07-18T14:00:00",
      venue: "Royal Gardens Hall",
      address: "Kano, Nigeria",
    },
  ],

  story:
    "It began with a borrowed umbrella and a queue that would not move. Ten years, three cities and one very persistent friendship later, we are standing here asking you to witness the promise. Come as you are, come hungry, come ready to dance — we have been waiting a long time to celebrate with you.",

  // ── Our song ──────────────────────────────────────────────────────
  // Paste a direct link to an audio file (mp3/m4a) and a real player
  // appears. Leave it empty and the player is not rendered at all —
  // a play button that plays nothing is worse than no play button.
  songTitle: "A Thousand Years",
  songArtist: "Christina Perri",
  songUrl: "",

  // ── RSVP ──────────────────────────────────────────────────────────
  // Replies arrive here. Digits only, with country code, no + or spaces.
  // Nigeria is 234. Leave empty to show the email fallback only.
  whatsapp: "2348012345678",
  email: "rsvp@example.com",
  rsvpBy: "2027-06-30T23:59:59",

  // Named contacts, for the guests who would rather telephone than fill
  // in a form. Numbers are printed as written and dialled as dialled —
  // see telHref below for how the local form is turned into a link.
  rsvpContacts: [
    { name: "Mr Paul", phone: "08067797492" },
    { name: "Mr Godwin", phone: "08078501600" },
  ],

  // ── The closing lines ─────────────────────────────────────────────
  // A verse set above the invitation wording, the blessing the toast
  // closes on, and the last line of the card. All three are optional —
  // empty ones render nothing rather than an empty frame.
  verse: {
    text: "This is the Lord’s doing, and it is marvellous in our eyes.",
    ref: "Psalm 118:23",
  },
  toast: "This is the Lord’s doing, very marvellous in our sight.",
  closing: "Your gracious presence will make our celebration more meaningful.",
  compliments: "",
};
// ────────────────────────────────────────────────────────────────────

// ── Small helpers ───────────────────────────────────────────────────
let uidCounter = 0;
const nextId = (prefix) => `${prefix}-${(uidCounter += 1)}`;

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
    weekday: "short",
    day: "numeric",
    month: "long",
  });

const fmtTime = (v) =>
  asDate(v).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" });

const mapHref = (e) =>
  `https://maps.google.com/?q=${encodeURIComponent(
    [e.venue, e.address].filter(Boolean).join(", ")
  )}`;

/* Nigerian numbers are written locally with a leading zero — 0803 123
   4567 — which will not dial from outside the country. An eleven-digit
   number starting in 0 is therefore read as +234. Anything else is taken
   to already carry its own country code, which is the safe assumption:
   mangling a number that was already correct is worse than leaving one
   the guest has to fix. */
const telHref = (p) => {
  const d = String(p || "").replace(/\D/g, "");
  return `tel:+${d.length === 11 && d.startsWith("0") ? `234${d.slice(1)}` : d}`;
};

// ── Fonts + stylesheet, injected once ───────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Fraunces:opsz,wght,SOFT,WONK@9..144,400,0..100,0..1&family=Great+Vibes&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Parisienne&display=swap";

const CSS = `
.wk,.wk *,.wk *::before,.wk *::after{box-sizing:border-box}
/* Reset. :where() holds this at the specificity of a bare class, so the
   spacing rules further down can still win. Written as .wk p the rule is
   (0,1,1) and quietly beats every class-scoped margin-top in the file —
   .wk-ceremony, .wk-beloved and .wk-pair-eng were all losing to it and
   rendering with no space above them. */
.wk :where(h1,h2,h3,p,figure,blockquote,ul,ol,fieldset){
  margin:0;padding:0;border:0;list-style:none
}
.wk button,.wk input,.wk select{font:inherit;color:inherit}
.wk a{color:inherit}

.wk{
  /* ── palette: alaari aso-oke ─────────────────────────────────── */  --wine-deep:#26070F;
  --wine:#3A0E1F;
  --wine-lift:#5A1730;
  --cloth:#F7EFE2;
  --ink:#2A1219;
  --brass:#C08A2E;
  --brass-lt:#E9C877;
  --alaari:#8C1D3F;

  --rule:rgba(192,138,46,.34);
  --on-wine:rgba(247,239,226,.84);
  --on-wine-dim:rgba(247,239,226,.5);
  --ink-soft:rgba(42,18,25,.74);

  --measure:33rem;
  --panel-y:clamp(58px,13vw,108px);
  --panel-x:clamp(20px,6vw,44px);

  font-family:'Karla',ui-sans-serif,system-ui,sans-serif;
  font-size:16px;
  line-height:1.6;
  color:var(--ink);
  background:var(--wine);
  /* The foil bleeds off the panels by design, so something has to clip it.
     Each panel clips its own, with overflow:clip and not overflow:hidden —
     hidden makes a box a scroll container, and a panel that is its own
     scroll container swallows the scrollIntoView() the hero's own button
     depends on. clip is not one, so it trims the overhang and leaves every
     anchor on the page working.

     This used to be done only on the root, and only in x. That trimmed the
     sides but left the last panel's ornament hanging past the bottom of the
     page, where nothing clipped it: the document grew by the length of the
     overhang and ended on a band of bare background with a few brass
     strokes still drawn across it. Clipping per panel ends the page where
     the page ends. */
  overflow-x:clip;
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

/* ── type roles: Cormorant Garamond is the ceremonial voice, Karla the
      functional one, Parisienne a single accent. Nothing switches roles.
      Fraunces survives only for the countdown's figures, where its
      numerals beat Cormorant's. ─────────────────────────────────────── */
.wk-display{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-weight:400;line-height:1.06;letter-spacing:.004em
}
/* The hero names. Editorial scale at the family's regular weight — the
   air belongs *around* the names, not inside them. */
.wk-name{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-weight:400;
  font-size:clamp(2.85rem,13.5vw,5.5rem);
  line-height:1.04;letter-spacing:.02em
}
/* The one script word. Script faces carry a small x-height, so this
   reads smaller than its size suggests. */
.wk-script{
  font-family:'Parisienne','Allura',cursive;
  font-weight:400;
  font-size:clamp(1.75rem,6.5vw,2.5rem);
  line-height:1.15;letter-spacing:0
}
/* "and", ruled in from both sides so the word sits inside the page's
   ornament instead of floating in the gap between the two names. */
.wk-and{
  display:flex;align-items:center;justify-content:center;
  gap:clamp(.75rem,3vw,1.15rem);margin:.42em 0 .5em
}
.wk-and i{
  flex:0 0 auto;width:clamp(2rem,10vw,4.25rem);height:1px;
  background:linear-gradient(90deg,transparent,var(--rule))
}
.wk-and i:last-child{background:linear-gradient(90deg,var(--rule),transparent)}
.wk-serif{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-variation-settings:normal;
  font-weight:400;line-height:1.72;letter-spacing:.002em
}
.wk-num{
  font-family:'Fraunces',Georgia,serif;
  font-variation-settings:'opsz' 96,'SOFT' 10,'WONK' 0;
  font-weight:400;line-height:1;letter-spacing:.01em;
  font-variant-numeric:tabular-nums;display:block
}

.wk-label{
  display:inline-flex;align-items:center;gap:.6em;
  font-size:.6875rem;font-weight:600;letter-spacing:.24em;
  text-transform:uppercase;color:var(--brass)
}
.wk-label--dim{color:rgba(192,138,46,.72)}

/* ── panels ──────────────────────────────────────────────────────── */
.wk-panel{position:relative;padding:var(--panel-y) var(--panel-x);overflow:clip}
.wk-panel--cloth{background:var(--cloth);color:var(--ink)}
.wk-panel--wine{background:var(--wine);color:var(--on-wine)}
.wk-panel--deep{background:var(--wine-deep);color:var(--on-wine)}

/* the warp: faint vertical threads behind reading panels */
.wk-warp::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(90deg,
    rgba(42,18,25,.05) 0 1px, transparent 1px 23px);
  -webkit-mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent);
          mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent);
}
.wk-panel--wine.wk-warp::before,.wk-panel--deep.wk-warp::before{
  background:repeating-linear-gradient(90deg,
    rgba(247,239,226,.045) 0 1px, transparent 1px 23px);
}

.wk-inner{position:relative;z-index:1;max-width:56rem;margin:0 auto}
.wk-measure{max-width:var(--measure)}

.wk-rule{height:1px;background:var(--rule);border:0}
.wk-rule--fade{
  height:1px;border:0;
  background:linear-gradient(90deg,transparent,var(--rule) 22%,var(--rule) 78%,transparent)
}

/* ── focus: visible for keyboards on every interactive thing ─────── */
.wk :focus-visible{outline:2px solid var(--brass-lt);outline-offset:3px;border-radius:2px}
.wk-panel--cloth :focus-visible{outline-color:var(--wine)}

/* ── buttons ─────────────────────────────────────────────────────── */
.wk-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:.6em;
  padding:1rem 2.1rem;border-radius:999px;border:1px solid transparent;
  font-size:.75rem;font-weight:600;letter-spacing:.17em;text-transform:uppercase;
  cursor:pointer;background:none;
  transition:transform .18s ease,background-color .18s ease,box-shadow .18s ease
}
.wk-btn--brass{
  background:linear-gradient(158deg,var(--brass-lt) 0%,var(--brass) 100%);
  color:#2A1219;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 12px 30px -14px rgba(192,138,46,.85)
}
.wk-btn--brass:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 16px 34px -14px rgba(192,138,46,.95)}
.wk-btn--brass:active{transform:translateY(0)}
.wk-btn--ghost{border-color:var(--rule);color:var(--brass-lt)}
.wk-btn--ghost:hover{background:rgba(192,138,46,.12)}
.wk-btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}

/* ── fields ──────────────────────────────────────────────────────── */
.wk-field{
  width:100%;padding:.85rem 1rem;
  background:rgba(255,255,255,.62);
  border:1px solid rgba(42,18,25,.2);border-radius:3px;
  font-size:1rem;color:var(--ink);                 /* 1rem stops iOS zoom */
  transition:border-color .18s ease,box-shadow .18s ease
}
.wk-field::placeholder{color:rgba(42,18,25,.34)}
.wk-field:focus{
  outline:none;border-color:var(--brass);
  box-shadow:0 0 0 3px rgba(192,138,46,.2)
}
.wk-field[aria-invalid="true"]{
  border-color:var(--alaari);box-shadow:0 0 0 3px rgba(140,29,63,.16)
}
select.wk-field{
  appearance:none;padding-right:2.5rem;
  background-image:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='7'%3E%3Cpath d='M1 1l4.5 4.5L10 1' fill='none' stroke='%23C08A2E' stroke-width='1.4'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 1rem center
}
.wk-fielabel{
  display:block;margin-bottom:.45rem;
  font-size:.6875rem;font-weight:600;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(42,18,25,.62)
}
.wk-error{
  display:flex;align-items:center;gap:.4em;margin-top:.4rem;
  font-size:.8125rem;color:var(--alaari)
}

/* accept / decline — real radios, so arrow keys work */
.wk-choice{position:absolute;opacity:0;width:1px;height:1px;margin:0}
.wk-choice-label{
  display:flex;align-items:center;gap:.8rem;
  padding:.9rem 1rem;border:1px solid rgba(42,18,25,.2);border-radius:3px;
  background:rgba(255,255,255,.5);cursor:pointer;
  font-size:.75rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(42,18,25,.66);
  transition:border-color .18s ease,background-color .18s ease,color .18s ease
}
.wk-choice-label:hover{border-color:rgba(192,138,46,.6)}
.wk-choice:checked+.wk-choice-label{
  border-color:var(--brass);background:rgba(192,138,46,.12);color:var(--ink)
}
.wk-choice:focus-visible+.wk-choice-label{outline:2px solid var(--wine);outline-offset:2px}
.wk-dot{
  flex:none;width:15px;height:15px;border-radius:50%;
  border:1.5px solid rgba(42,18,25,.32);
  display:flex;align-items:center;justify-content:center;
  transition:border-color .18s ease
}
.wk-choice:checked+.wk-choice-label .wk-dot{border-color:var(--brass)}
.wk-choice:checked+.wk-choice-label .wk-dot::after{
  content:"";width:7px;height:7px;border-radius:50%;background:var(--brass)
}

/* ── seams between panels ────────────────────────────────────────── */
/* No height here — it would override the height attribute and make
   every band the same size, including the small countdown ticks. */
.wk-seam{display:block;width:100%;background:var(--cloth)}
.wk-seam--onwine{background:var(--wine)}
.wk-seam--ondeep{background:var(--wine-deep)}

/* ── countdown strips ────────────────────────────────────────────── */
.wk-strips{
  display:grid;gap:clamp(14px,4vw,26px);
  grid-template-columns:repeat(2,1fr);
  margin:clamp(26px,6vw,40px) auto 0;max-width:40rem
}
@media (min-width:26rem){.wk-strips{grid-template-columns:repeat(4,1fr)}}
.wk-strip{text-align:center}
.wk-strip .wk-num{font-size:clamp(34px,10.5vw,58px);color:var(--brass-lt)}
.wk-strip .wk-unit{
  display:block;margin-top:.7rem;
  font-size:.625rem;font-weight:600;letter-spacing:.26em;
  text-transform:uppercase;color:var(--on-wine-dim)
}

/* ── big day ─────────────────────────────────────────────────────── */
.wk-events{
  display:grid;gap:clamp(34px,7vw,30px);
  grid-template-columns:1fr;margin-top:clamp(28px,6vw,44px)
}
@media (min-width:44rem){
  .wk-events[data-count="2"],.wk-events[data-count="3"]{grid-template-columns:repeat(2,1fr);gap:clamp(30px,5vw,58px)}
}
.wk-event{padding-top:1.6rem;border-top:1px solid rgba(247,239,226,.14)}
.wk-map{
  display:inline-flex;align-items:center;gap:.5em;margin-top:1.1rem;
  padding-bottom:.15rem;border-bottom:1px solid var(--rule);
  font-size:.75rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;
  color:var(--brass-lt);text-decoration:none;transition:border-color .18s ease
}
.wk-map:hover{border-color:var(--brass-lt)}

/* ── song ────────────────────────────────────────────────────────── */
.wk-song-title{color:var(--cloth)}
.wk-song-sub{color:var(--on-wine-dim)}
.wk-player{display:flex;align-items:center;gap:1.1rem;max-width:22rem;margin:1.8rem auto 0}
.wk-play{
  flex:none;width:56px;height:56px;border-radius:50%;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  border:1px solid var(--brass);color:#2A1219;
  background:linear-gradient(158deg,var(--brass-lt),var(--brass));
  transition:transform .18s ease
}
.wk-play:hover{transform:scale(1.04)}
.wk-play svg{display:block}
.wk-track{flex:1;min-width:0}
.wk-scrub{
  height:3px;border-radius:2px;background:rgba(247,239,226,.16);
  overflow:hidden;cursor:pointer
}
.wk-scrub span{display:block;height:100%;background:var(--brass-lt);width:0}
.wk-times{
  display:flex;justify-content:space-between;margin-top:.45rem;
  font-size:.6875rem;letter-spacing:.08em;color:var(--on-wine-dim);
  font-variant-numeric:tabular-nums
}
/* the song sits on cloth, so its furniture inverts with the panel */
.wk-panel--cloth .wk-song-title{color:var(--ink)}
.wk-panel--cloth .wk-song-sub{color:var(--ink-soft)}
.wk-panel--cloth .wk-scrub{background:rgba(42,18,25,.16)}
.wk-panel--cloth .wk-scrub span{background:var(--brass)}
.wk-panel--cloth .wk-times{color:var(--ink-soft)}

/* ── hero entrance — the page's single orchestrated moment ───────── */
@keyframes wk-draw{from{opacity:0;transform:scale(.9) rotate(-8deg)}to{opacity:1;transform:none}}
@keyframes wk-rise{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:none}}
.wk-hero-mono{animation:wk-draw 1.15s cubic-bezier(.22,1,.36,1) both}
.wk-hero-copy>*{animation:wk-rise .85s cubic-bezier(.22,1,.36,1) both}
.wk-hero-copy>*:nth-child(1){animation-delay:.18s}
.wk-hero-copy>*:nth-child(2){animation-delay:.26s}
.wk-hero-copy>*:nth-child(3){animation-delay:.34s}
.wk-hero-copy>*:nth-child(4){animation-delay:.42s}
.wk-hero-copy>*:nth-child(5){animation-delay:.5s}
.wk-hero-copy>*:nth-child(6){animation-delay:.58s}
.wk-hero-copy>*:nth-child(7){animation-delay:.66s}

/* ── the foil ────────────────────────────────────────────────────── */
/*  Gold botanical line work laid on the cloth. It is the one ornament
    here that is not the aso-oke band, and it is admitted on three
    conditions: it never sits where text sits, it never moves on its own,
    and it is drawn rather than placed.

    Three tiers, by how much attention each is allowed:

      --wm      a watermark. Large, barely there, drifting against the
                scroll so the cloth has some depth behind it.
      --accent  visible line work, close enough to the words to be read.
      --inline  the only tier that goes near the type, so it stays small
                and lives at the edge of a rule, never behind a
                paragraph.

    A tier sets --foil-o and nothing else. Where an ornament comes from is
    its own business, drawn at random when it mounts — see REVEALS. */
.wk-foil{
  position:absolute;inset:0;z-index:0;overflow:hidden;
  pointer-events:none;color:var(--brass);
  --foil-o:.07;
  --rv-dur:1.5s;--rv-delay:0s;--rv-step:.1s;
  --rv-ease:cubic-bezier(.42,0,.2,1)
}
.wk-foil--wm{--foil-o:.07}
.wk-foil--accent{--foil-o:.3}
.wk-foil--inline{--foil-o:.5}
/* Translucent brass over wine turns olive and stops reading as metal, so
   the wine panels take the light brass instead. */
.wk-panel--wine .wk-foil,.wk-panel--deep .wk-foil{color:var(--brass-lt)}
.wk-panel--wine .wk-foil--wm,.wk-panel--deep .wk-foil--wm{--foil-o:.075}
.wk-panel--wine .wk-foil--accent,.wk-panel--deep .wk-foil--accent{--foil-o:.3}

/* The entrance sits on its own element so it can own opacity, transform
   and clip-path without fighting the two transforms that already exist:
   the ornament's fixed orientation on the span above it, and the drift on
   the svg below.

   Every transition here runs in both directions, which is the whole point
   — scrolling back up rewinds the ornament rather than leaving it lit. */
.wk-foil-rv{
  display:block;width:100%;height:100%;
  opacity:0;transform-origin:50% 100%;
  transition:
    opacity var(--rv-dur) var(--rv-ease) var(--rv-delay),
    transform var(--rv-dur) var(--rv-ease) var(--rv-delay),
    clip-path var(--rv-dur) var(--rv-ease) var(--rv-delay)
}
.wk-foil.is-in .wk-foil-rv{opacity:var(--foil-o);transform:none;clip-path:inset(0 0 0 0)}

/* Where each ornament comes from. Picked per ornament, not per tier, so
   nothing on the page arrives the way its neighbour did. */
.wk-rv--rise{transform:translate3d(0,46px,0)}
.wk-rv--settle{transform:translate3d(0,-42px,0)}
.wk-rv--slide{transform:translate3d(-52px,0,0)}
.wk-rv--slide-r{transform:translate3d(52px,0,0)}
.wk-rv--bloom{transform:scale(.8);transform-origin:50% 50%}
.wk-rv--unfurl{transform:scaleY(.08)}
.wk-rv--sway{transform:rotate(-9deg)}
/* A wipe is a wipe and not a fade, so these hold the tier's opacity
   throughout and only their clip-path moves — the rewind is then a wipe
   back rather than a dissolve. */
.wk-rv--wipe,.wk-rv--wipe-r,.wk-rv--wipe-d,.wk-rv--wipe-u{opacity:var(--foil-o)}
.wk-rv--wipe{clip-path:inset(0 100% 0 0)}
.wk-rv--wipe-r{clip-path:inset(0 0 0 100%)}
.wk-rv--wipe-d{clip-path:inset(0 0 100% 0)}
.wk-rv--wipe-u{clip-path:inset(100% 0 0 0)}

/* The drift. --p is written by the page's single scroll loop and runs
   about -1 below the fold to 1 above it, so every ornament on the page
   shares one measurement — which is what lets that loop do all of its
   reading before it does any writing. */
.wk-foil-art{
  width:100%;height:100%;display:block;
  transform:translate3d(0,calc(var(--p,0) * var(--drift,0px)),0)
}

/* Drawing, not appearing. Every drawable shape in the set carries
   pathLength="1", which normalises its length to 1 whatever its real
   geometry — so this one dash rule draws any of them and nothing has to
   be measured with getTotalLength(). The stagger is nth-child and the
   step is random per ornament, so two fronds never fill in at the same
   rhythm. Named for the line rather than for the drawing, because
   wk-draw is already the hero medallion's entrance. */
.wk-line path,.wk-line circle,.wk-line ellipse,.wk-line line,
.wk-line-r path,.wk-line-r circle,.wk-line-r ellipse,.wk-line-r line{
  stroke-dasharray:1;stroke-dashoffset:1
}
/* the same stroke drawn from its far end */
.wk-line-r path,.wk-line-r circle,.wk-line-r ellipse,.wk-line-r line{stroke-dashoffset:-1}

.is-in .wk-line path,.is-in .wk-line circle,
.is-in .wk-line ellipse,.is-in .wk-line line,
.is-in .wk-line-r path,.is-in .wk-line-r circle,
.is-in .wk-line-r ellipse,.is-in .wk-line-r line{
  animation:wk-stroke var(--rv-dur) var(--rv-ease) var(--rv-delay) forwards
}
.is-in .wk-line *:nth-child(2),.is-in .wk-line-r *:nth-child(2){animation-delay:calc(var(--rv-delay) + var(--rv-step))}
.is-in .wk-line *:nth-child(3),.is-in .wk-line-r *:nth-child(3){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 2)}
.is-in .wk-line *:nth-child(4),.is-in .wk-line-r *:nth-child(4){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 3)}
.is-in .wk-line *:nth-child(5),.is-in .wk-line-r *:nth-child(5){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 4)}
.is-in .wk-line *:nth-child(6),.is-in .wk-line-r *:nth-child(6){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 5)}
.is-in .wk-line *:nth-child(n+7),.is-in .wk-line-r *:nth-child(n+7){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 6)}
@keyframes wk-stroke{to{stroke-dashoffset:0}}

/* ── the card's wording ──────────────────────────────────────────── */
.wk-fam{font-size:clamp(.9375rem,3.7vw,1.0625rem);line-height:1.5;letter-spacing:.015em}
.wk-fam-place{display:block;margin-top:.3rem;font-size:.8125rem;letter-spacing:.06em;opacity:.72}
.wk-fam-amp{
  display:block;margin:1.1rem 0;
  font-family:'Parisienne','Allura',cursive;font-size:1.5rem;line-height:1
}
/* the rule running in to "to the", as the printed card sets it */
.wk-tothe{display:flex;align-items:center;gap:clamp(.75rem,3.5vw,1.4rem);margin-top:clamp(1.9rem,6vw,2.8rem)}
.wk-tothe i{flex:1;height:1px;background:var(--rule)}
.wk-tothe span{
  flex:none;font-size:.6875rem;font-weight:400;
  letter-spacing:.28em;text-transform:uppercase;opacity:.72
}
/* Parisienne's ink stands 1.17em tall with a descender nearly half an em
   deep — more than the font's own content area, which the 1.12 leading of
   .wk-script cannot hold. The tail of the g ends up in the next line's
   space. Script needs the leading the serif does not. */
.wk-ceremony{
  margin-top:clamp(1.1rem,4vw,1.6rem);
  font-size:clamp(1.875rem,9vw,3rem);
  line-height:1.35;padding-bottom:.06em
}
.wk-beloved{margin-top:1.05rem;font-size:clamp(1rem,3.9vw,1.125rem);opacity:.78}
.wk-verse{
  font-size:clamp(1.0625rem,4.2vw,1.25rem);
  font-style:italic;line-height:1.6
}
.wk-verse-ref{
  display:block;margin-top:.9rem;font-style:normal;
  font-size:.6875rem;font-weight:400;letter-spacing:.28em;text-transform:uppercase
}

/* the two-pair hero: the traditional name carries the size, the English
   one answers it in script, which keeps the serif the page's voice */
/* The two names and the ampersand on one line. This is the widest thing
   on the page, so it needs its own scale on phones: at the display size
   the row measures ~369px inside a 328px column, and flex's default
   shrink then squeezes the h1 boxes narrower than their own glyphs —
   which the page's overflow-x:clip quietly shears off at both edges.
   Smaller type and no shrink, so the line fits by measurement instead of
   by cropping. It wraps rather than crops if even that runs out. */
.wk-pair{
  display:flex;align-items:center;justify-content:center;flex-wrap:wrap;
  gap:clamp(.5rem,3vw,2.75rem)
}
.wk-pair>*{flex:0 0 auto}
.wk-pair .wk-name{font-size:clamp(2.1rem,10.5vw,5.5rem)}
.wk-pair .wk-amp{font-size:clamp(1.9rem,9vw,4.25rem)}
.wk-pair-eng{margin-top:.55rem;font-size:clamp(1.25rem,4.6vw,1.75rem);line-height:1.1}
.wk-amp{
  font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
  font-weight:400;line-height:1;opacity:.9;
  font-size:clamp(2.5rem,11vw,4.25rem)
}

/* ── named RSVP contacts ─────────────────────────────────────────── */
.wk-contacts{display:grid;gap:.8rem;margin-top:1.2rem;grid-template-columns:1fr}
@media (min-width:30rem){.wk-contacts{grid-template-columns:repeat(2,1fr)}}
.wk-contact{
  display:block;padding:.95rem 1.1rem;text-decoration:none;
  border:1px solid rgba(42,18,25,.16);border-radius:3px;background:rgba(255,255,255,.5);
  transition:border-color .18s ease,background-color .18s ease
}
.wk-contact:hover{border-color:rgba(192,138,46,.6);background:rgba(255,255,255,.78)}
.wk-contact-name{
  display:block;font-size:.6875rem;font-weight:600;
  letter-spacing:.16em;text-transform:uppercase;color:rgba(42,18,25,.62)
}
.wk-contact-num{
  display:block;margin-top:.35rem;font-size:1.0625rem;
  letter-spacing:.04em;color:var(--ink);font-variant-numeric:tabular-nums
}

/* ── scroll thread ───────────────────────────────────────────────── */
.wk-thread{
  position:fixed;top:0;left:0;height:2px;z-index:60;
  background:linear-gradient(90deg,var(--brass),var(--brass-lt));
  transition:width .12s linear;pointer-events:none
}

@media (prefers-reduced-motion:reduce){
  .wk *,.wk *::before,.wk *::after{
    animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important;scroll-behavior:auto!important
  }
  .wk-hero-mono,.wk-hero-copy>*{opacity:1!important;transform:none!important}
}
`;

if (typeof document !== "undefined" && !document.getElementById("wk-font")) {
  const link = document.createElement("link");
  link.id = "wk-font";
  link.rel = "stylesheet";
  link.href = FONT_HREF;
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.id = "wk-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

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
      done: false,
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
//  The foil — one observer, one scroll loop, eighteen ornaments.
//
//  Every ornament on this page is either drawn on as it arrives or
//  drifted against the scroll, and the naive way to do that is a
//  listener per ornament. At eighteen of them that is eighteen
//  getBoundingClientRect() calls interleaved with eighteen style
//  writes — read, write, read, write — and each write invalidates the
//  layout the next read was about to do. So instead they all register
//  here, and the loop below measures everything before it touches
//  anything.
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
   starts reading as a mechanism — which is what made the first pass feel
   repeated. Repeats here are deliberate weights, not accidents: the draw
   is the page's signature and stays the likeliest, and no ornament takes
   the same one as the ornament beside it. */
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
  const svgCls = `wk-foil-art${draws ? ` wk-${rv.k}` : ""}`;

  return (
    <span
      ref={ref}
      className={`wk-foil wk-foil--${tier}${shown ? " is-in" : ""}`}
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
      <span className={`wk-foil-rv wk-rv--${rv.k}`}>
        <Art className={svgCls} />
      </span>
    </span>
  );
}

// ── The botanical vocabulary ────────────────────────────────────────
//  Eight motifs, all stroke art in currentColor, so one set wears brass
//  on the cloth panels and light brass on the wine ones. Nothing here is
//  filled: at seven per cent opacity a fill turns to mud where a line
//  still reads as a line.
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
   as one hand rather than as eight separate drawings. */
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

// ═══════════════════════════════════════════════════════════════════
//  The aso-oke band — the page's woven seam.
//  Warp threads running vertically, weft blocks crossing them in the
//  repeating rhythm of woven cloth. Every seam uses it. The foil above
//  is the only other thing that decorates anything.
// ═══════════════════════════════════════════════════════════════════
function AsoOkeBand({ height = 20, tone = "cloth", width, className = "" }) {
  const uid = useMemo(() => nextId("weft"), []);
  const onWine = tone !== "cloth";
  // Solid values, not low-opacity washes — translucent brass over wine
  // turns olive and the band stops reading as metal.
  const warp = onWine ? "rgba(247,239,226,.15)" : "rgba(42,18,25,.12)";
  const bright = onWine ? "#E9C877" : "rgba(192,138,46,.55)";
  const mid = onWine ? "rgba(192,138,46,.62)" : "rgba(192,138,46,.26)";
  const dark = onWine ? "rgba(30,6,12,.9)" : "rgba(42,18,25,.13)";
  const accent = onWine ? "#B02B52" : "rgba(140,29,63,.45)";

  const warpLines = [];
  for (let x = 0; x < 96; x += 6) warpLines.push(x);

  return (
    <svg
      className={`wk-seam ${className}`}
      height={height}
      width="100%"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", ...(width ? { width } : null) }}
    >
      <defs>
        <pattern id={uid} width="96" height={height} patternUnits="userSpaceOnUse">
          {/* weft blocks laid across the width */}
          <rect x="0" y="0" width="13" height={height} fill={bright} />
          <rect x="21" y="0" width="5" height={height} fill={dark} />
          <rect x="34" y="0" width="26" height={height} fill={mid} />
          <rect x="68" y="0" width="4" height={height} fill={accent} />
          <rect x="80" y="0" width="9" height={height} fill={dark} />
          <rect
            x="46"
            y={height / 2 - 4}
            width="8"
            height="8"
            fill={accent}
            transform={`rotate(45 50 ${height / 2})`}
          />
          {/* warp threads crossing over the weft — this is what makes
              the strip read as woven rather than as stripes */}
          {warpLines.map((x) => (
            <line
              key={x}
              x1={x + 0.5}
              y1="0"
              x2={x + 0.5}
              y2={height}
              stroke={warp}
              strokeWidth="1"
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${uid})`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  Woven medallion — the hero's one bold moment.
//  The ring is a real weave: two complementary dash rhythms on the
//  same radius, so brass and light-brass alternate block by block
//  around the circle exactly as weft does. The segment count divides
//  the circumference exactly, so the weave closes with no seam.
// ═══════════════════════════════════════════════════════════════════
// ── Monogram ────────────────────────────────────────────────────────
//  The couple's two initials interlocked.
//
//  CONFIG.initials arrives as "A & E": initials *and* their separator,
//  so the letters are pulled out of it rather than drawn whole. The
//  medallion used to set that whole string, ampersand and all, as one
//  line of centred text.
//
//  The interlock is the engraver's trick. The second letter is stroked
//  in the medallion's own colour before its fill is laid down, which
//  opens a hairline gap through the first wherever the two cross, so
//  the pair reads as one woven mark rather than two letters set side
//  by side.
//
//  Great Vibes is doing the ornament: its capitals carry the curled
//  terminals and long descending swash a drawn monogram has, which no
//  amount of tracking a text serif will fake.
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
 * until then, so a wrong-frame monogram is never painted. */
function useMonogramFit(letters) {
  const holder = useRef(null);
  const [fit, setFit] = useState(null);
  const key = letters.join("");

  useLayoutEffect(() => {
    let live = true;

    const measure = () => {
      const g = holder.current;
      if (!g || !live) return;
      const [a, b] = Array.from(g.querySelectorAll("text")).map((t) => t.getBBox());
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

function WovenMedallion({ size = 176, initials, bg = "#3A0E1F" }) {
  const uid = useMemo(() => nextId("med"), []);
  const C = 60; // viewBox is 120
  const RW = 45; // weave radius
  const SEG = 32; // segments — divides the circumference, so it closes
  const seg = (2 * Math.PI * RW) / SEG;
  const slow = (2 * Math.PI * RW) / 8; // a slower rhythm for the hot thread

  const letters = initialPair(initials);
  const [holder, fit] = useMonogramFit(letters);

  // Seat the measured mark inside the medallion's clear centre — the
  // cloth's sunk middle has a radius of 37, so the mark is fitted to a
  // box that clears it on both axes whatever the pair's proportions.
  const scale = fit ? Math.min(64 / fit.vw, 50 / fit.vh) : 1;

  // warp threads running radially across the weft
  const warp = Array.from({ length: SEG }, (_, i) => {
    const a = (i / SEG) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return {
      x1: C + (RW - 6) * cos,
      y1: C + (RW - 6) * sin,
      x2: C + (RW + 6) * cos,
      y2: C + (RW + 6) * sin,
    };
  });

  return (
    <svg
      className="wk-hero-mono"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={`${CONFIG.bride} and ${CONFIG.groom}`}
      style={{ display: "block", margin: "0 auto", overflow: "visible" }}
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2DCA0" />
          <stop offset="100%" stopColor="#C08A2E" />
        </linearGradient>
      </defs>

      <g transform={`rotate(-90 ${C} ${C})`}>
        {/* solid brass ground of the band */}
        <circle cx={C} cy={C} r={RW} fill="none" stroke={`url(#${uid}-g)`} strokeWidth="11" />
        {/* weft blocks knocked out of the brass */}
        <circle
          cx={C}
          cy={C}
          r={RW}
          fill="none"
          stroke="#2A0A14"
          strokeWidth="11"
          strokeDasharray={`${seg * 0.3} ${seg * 0.7}`}
        />
        {/* the hot alaari thread running through the middle */}
        <circle
          cx={C}
          cy={C}
          r={RW}
          fill="none"
          stroke="#B02B52"
          strokeWidth="2.2"
          strokeDasharray={`${slow * 0.16} ${slow * 0.84}`}
        />
        {/* warp */}
        <g stroke="rgba(247,239,226,.3)" strokeWidth="1">
          {warp.map((w, i) => (
            <line key={i} x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} />
          ))}
        </g>
      </g>

      {/* selvedge hairlines either side of the weave */}
      <circle cx={C} cy={C} r="52" fill="none" stroke="rgba(233,200,119,.34)" strokeWidth="0.7" />
      <circle cx={C} cy={C} r="38" fill="none" stroke="rgba(233,200,119,.26)" strokeWidth="0.7" />

      {/* the cloth's centre, sunk slightly so the initials lift off it */}
      <circle cx={C} cy={C} r="37" fill="rgba(30,6,12,.42)" />

      {/* The mark is always rendered so the hook has something to
          measure; until the measurement lands it sits untransformed at
          the origin and stays transparent, so a wrong-frame monogram is
          never painted. */}
      <g
        opacity={fit ? 1 : 0}
        style={{ transition: "opacity .5s ease" }}
        transform={
          fit
            ? `translate(${C} ${C}) scale(${scale}) translate(${-(fit.vx + fit.vw / 2)} ${-(
                fit.vy +
                fit.vh / 2
              )})`
            : undefined
        }
      >
        <MonoLetters
          holder={holder}
          fit={fit}
          letters={letters}
          fill={`url(#${uid}-g)`}
          bg={bg}
        />
      </g>
    </svg>
  );
}

// ── Section furniture ───────────────────────────────────────────────
const Label = ({ children, dim }) => (
  <p className={`wk-label${dim ? " wk-label--dim" : ""}`}>
    <svg width="17" height="7" viewBox="0 0 17 7" aria-hidden="true" focusable="false">
      <rect x="0" y="0" width="3" height="7" fill="currentColor" opacity=".85" />
      <rect x="5" y="0" width="1.4" height="7" fill="currentColor" opacity=".45" />
      <rect x="9" y="0" width="6" height="7" fill="currentColor" opacity=".3" />
      <rect x="16" y="0" width="1" height="7" fill="currentColor" opacity=".5" />
    </svg>
    {children}
  </p>
);

/* `foil` is the ornament layer, rendered inside the panel but outside
   .wk-inner, so it lands above the warp and below every word. */
const Panel = ({ id, tone = "cloth", warp, foil, children }) => (
  <section
    id={id}
    className={`wk-panel wk-panel--${tone}${warp ? " wk-warp" : ""}`}
  >
    {foil}
    <div className="wk-inner">{children}</div>
  </section>
);

/* The couple's names.
 *
 * Where a traditional and an English name are both given, the card's
 * two-pair arrangement is used — but the traditional name keeps the
 * serif and the size, and only the English one drops to script. Both
 * IVs set both pairs in script; this page's type system is built on the
 * serif being the voice and the script being an accent, and trading that
 * away inside one section would cost more than the arrangement is worth.
 * The arrangement survives; the roles do not swap.
 */
const NamePair = ({ pair, fallback, dual }) =>
  dual && pair.traditional ? (
    <>
      <h1 className="wk-name" style={{ color: "var(--cloth)" }}>
        {pair.traditional}
      </h1>
      {pair.english ? (
        <p className="wk-script wk-pair-eng" style={{ color: "var(--brass-lt)" }}>
          {pair.english}
        </p>
      ) : null}
    </>
  ) : (
    <h1 className="wk-name" style={{ color: "var(--cloth)" }}>
      {fallback}
    </h1>
  );

// ═══════════════════════════════════════════════════════════════════
//  Sections
// ═══════════════════════════════════════════════════════════════════
function Hero() {
  const d = asDate(CONFIG.weddingDate);
  const pairs = CONFIG.names || {};
  const bridePair = pairs.bride || {};
  const groomPair = pairs.groom || {};
  const dual = Boolean(bridePair.traditional && groomPair.traditional);

  return (
    <section
      className="wk-panel wk-panel--wine wk-warp"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingTop: "clamp(64px,14vw,110px)",
        paddingBottom: "clamp(64px,14vw,110px)",
        background:
          "radial-gradient(ellipse 120% 80% at 50% 8%, var(--wine-lift) 0%, var(--wine) 52%, var(--wine-deep) 100%)",
      }}
    >
      {/* The ring sits behind the medallion rather than beside it — it is
          the card's own watermark, so it takes the card's own position. */}
      <Foil
        art={WreathRing}
        tier="wm"
        size={780}
        x="50%"
        y="46%"
        drift={22}
        style={{ marginLeft: -390, marginTop: -390 }}
      />
      <Foil art={BlossomSpray} tier="wm" size={380} x="-8%" y="3%" rotate={-6} drift={64} />
      <Foil art={LeafFrond} tier="wm" size={330} x="76%" y="58%" flip drift={-56} />
      <Foil art={SingleBloom} tier="wm" size={210} x="2%" y="70%" rotate={10} drift={38} />

      <div className="wk-inner" style={{ width: "100%" }}>
        <WovenMedallion initials={CONFIG.initials} />

        <div className="wk-hero-copy" style={{ marginTop: "clamp(30px,7vw,46px)" }}>
          <p
            style={{
              fontSize: ".6875rem",
              fontWeight: 400,
              letterSpacing: ".32em",
              textTransform: "uppercase",
              color: "var(--on-wine-dim)",
            }}
          >
            Together with their families
          </p>

          {dual ? (
            <div className="wk-pair" style={{ marginTop: "1.6rem" }}>
              <div>
                <NamePair pair={bridePair} fallback={CONFIG.bride} dual />
              </div>
              <span className="wk-amp" style={{ color: "var(--brass-lt)" }} aria-hidden="true">
                &amp;
              </span>
              <div>
                <NamePair pair={groomPair} fallback={CONFIG.groom} dual />
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginTop: "1.6rem" }}>
                <NamePair pair={bridePair} fallback={CONFIG.bride} dual={false} />
              </div>

              <div className="wk-and" aria-hidden="true">
                <i />
                <span className="wk-script" style={{ color: "var(--brass-lt)" }}>
                  and
                </span>
                <i />
              </div>

              <NamePair pair={groomPair} fallback={CONFIG.groom} dual={false} />
            </>
          )}

          <p
            className="wk-rule--fade"
            style={{ width: "min(15rem,60%)", margin: "2rem auto 1.5rem" }}
            aria-hidden="true"
          />

          <p
            style={{
              fontSize: ".75rem",
              fontWeight: 600,
              letterSpacing: ".24em",
              color: "var(--brass-lt)",
            }}
          >
            {fmtDay(d)}
          </p>

          <div style={{ marginTop: "2.4rem" }}>
            <a className="wk-btn wk-btn--brass" href="#invitation" onClick={scrollToId("invitation")}>
              Open the invitation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  The invitation itself — the card's wording, in the card's order.
//  Who is inviting, then the request, then what is being announced. The
//  hero has already said the couple's names, so this does not say them
//  again: it ends where the printed card's wording ends, at "of their
//  beloved children", and lets the hero stand as the names.
// ═══════════════════════════════════════════════════════════════════
/* Whether the card's wording is worth a panel at all. Shared by the
   section and by the root, because the root has to know: an empty
   Invitation still leaves its seam behind, and two woven bands meeting
   with nothing between them reads as a mistake rather than as a hem. */
const hasInvitation = () =>
  Boolean((CONFIG.families || []).length || CONFIG.ceremonyType || (CONFIG.verse || {}).text);

function Invitation() {
  const families = CONFIG.families || [];
  const v = CONFIG.verse || {};

  if (!hasInvitation()) return null;

  return (
    <Panel
      id="invitation"
      tone="cloth"
      warp
      foil={
        <>
          <Foil art={LaurelArc} tier="accent" size={300} x="-7%" y="16%" rotate={-8} drift={40} />
          <Foil
            art={LaurelArc}
            tier="accent"
            size={300}
            x="72%"
            y="62%"
            rotate={8}
            flip
            drift={-40}
            draw
          />
          <Foil art={FernCurl} tier="wm" size={290} x="70%" y="-6%" rotate={16} drift={34} />
          <Foil art={BudCluster} tier="wm" size={250} x="-4%" y="66%" drift={-30} />
        </>
      }
    >
      <div style={{ textAlign: "center", maxWidth: "34rem", margin: "0 auto" }}>
        {v.text ? (
          <>
            <p className="wk-serif wk-verse" style={{ color: "var(--ink)" }}>
              “{v.text}”
            </p>
            {v.ref ? <span className="wk-verse-ref" style={{ color: "var(--brass)" }}>{v.ref}</span> : null}
            <div
              className="wk-rule--fade"
              style={{ width: "min(11rem,46%)", margin: "clamp(2rem,7vw,3rem) auto 0" }}
              aria-hidden="true"
            />
          </>
        ) : null}

        {families.length ? (
          <div style={{ marginTop: v.text ? "clamp(2rem,7vw,3rem)" : 0 }}>
            <p
              style={{
                fontSize: ".6875rem",
                fontWeight: 400,
                letterSpacing: ".3em",
                textTransform: "uppercase",
                color: "var(--brass)",
              }}
            >
              The families of
            </p>

            {families.map((f, i) => (
              <div key={i} style={{ marginTop: i === 0 ? "1.5rem" : 0 }}>
                {i > 0 ? (
                  <span className="wk-fam-amp" style={{ color: "var(--brass)" }} aria-hidden="true">
                    &amp;
                  </span>
                ) : null}
                <p className="wk-serif wk-fam" style={{ color: "var(--ink)" }}>
                  {f.names}
                  {f.place ? <span className="wk-fam-place">{f.place}</span> : null}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {CONFIG.ceremonyType ? (
          <>
            <p
              className="wk-serif"
              style={{
                marginTop: "clamp(2rem,7vw,3rem)",
                fontSize: "clamp(.9375rem,3.7vw,1.0625rem)",
                lineHeight: 1.5,
                color: "var(--ink-soft)",
              }}
            >
              Cordially request the honour of your presence
            </p>

            <div className="wk-tothe" aria-hidden="true">
              <i />
              <span style={{ color: "var(--ink-soft)" }}>to the</span>
            </div>

            <p className="wk-script wk-ceremony" style={{ color: "var(--brass)" }}>
              {CONFIG.ceremonyType}
            </p>

            <p className="wk-serif wk-beloved" style={{ color: "var(--ink-soft)" }}>
              of their beloved children.
            </p>
          </>
        ) : null}
      </div>
    </Panel>
  );
}

function Story() {
  return (
    <Panel
      id="story"
      tone="cloth"
      warp
      foil={
        <>
          <Foil art={BudCluster} tier="accent" size={260} x="-7%" y="6%" rotate={-10} drift={44} />
          <Foil art={FernCurl} tier="wm" size={320} x="74%" y="44%" rotate={-14} flip drift={-38} />
        </>
      }
    >
      <div className="wk-measure">
        <Label>Our story</Label>
        <p
          className="wk-serif"
          style={{
            marginTop: "1.6rem",
            fontSize: "clamp(1.0625rem,4.3vw,1.3125rem)",
            color: "var(--ink)",
          }}
        >
          {CONFIG.story}
        </p>
      </div>
    </Panel>
  );
}

function BigDay() {
  const events = CONFIG.events || [];
  return (
    <Panel
      id="details"
      tone="wine"
      warp
      foil={
        <>
          <Foil art={LaurelArc} tier="accent" size={320} x="-8%" y="10%" rotate={-6} drift={46} />
          <Foil art={LeafFrond} tier="wm" size={340} x="76%" y="34%" flip drift={-50} />
          <Foil art={SingleBloom} tier="wm" size={230} x="-2%" y="68%" rotate={12} drift={34} />
        </>
      }
    >
      <Label dim>The big day</Label>

      <div className="wk-events" data-count={Math.min(events.length, 3)}>
        {events.map((e, i) => (
          <article className="wk-event" key={i}>
            <h3
              className="wk-label"
              style={{ letterSpacing: ".2em", marginBottom: "1.1rem" }}
            >
              {e.label}
            </h3>

            <p
              className="wk-display"
              style={{
                fontSize: "clamp(1.5rem,5.6vw,2rem)",
                color: "var(--cloth)",
                lineHeight: 1.12,
              }}
            >
              {fmtShortDate(e.date)}
            </p>

            <p
              className="wk-serif"
              style={{
                marginTop: ".55rem",
                fontSize: "1.0625rem",
                color: "var(--on-wine-dim)",
              }}
            >
              {fmtTime(e.date)}
            </p>

            <p
              className="wk-serif"
              style={{ marginTop: "1.35rem", fontSize: "1.0625rem", color: "var(--on-wine)" }}
            >
              {e.venue}
              {e.address ? (
                <>
                  <br />
                  <span style={{ color: "var(--on-wine-dim)" }}>{e.address}</span>
                </>
              ) : null}
            </p>

            <a className="wk-map" href={mapHref(e)} target="_blank" rel="noreferrer">
              Open in maps
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
                <path d="M3 9L9 3M9 3H4.2M9 3v4.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
          </article>
        ))}
      </div>
    </Panel>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  The toast. A Nigerian programme sets the blessing the couple are
//  toasted with, and the card gives it its own small ceremony: the word
//  in script, a rule, the line itself. It is short by design — it is the
//  one place on the page that is allowed to be only a sentence.
// ═══════════════════════════════════════════════════════════════════
function Toast() {
  if (!CONFIG.toast) return null;

  return (
    <Panel
      id="toast"
      tone="deep"
      warp
      foil={
        <>
          <Foil art={WreathRing} tier="wm" size={460} x="50%" y="50%" drift={20}
                style={{ marginLeft: -230, marginTop: -230 }} />
          <Foil art={SeedPod} tier="wm" size={240} x="80%" y="8%" rotate={14} flip drift={-34} />
        </>
      }
    >
      <div style={{ textAlign: "center", maxWidth: "32rem", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(.7rem,3vw,1.3rem)",
          }}
        >
          <Foil art={LaurelArc} tier="inline" size={96} rotate={-6} inline style={{ height: 48 }} />
          <p className="wk-script" style={{ color: "var(--brass-lt)", fontSize: "clamp(1.75rem,7vw,2.5rem)" }}>
            Toast
          </p>
          <Foil art={LaurelArc} tier="inline" size={96} rotate={6} flip inline style={{ height: 48 }} />
        </div>

        <p
          className="wk-serif"
          style={{
            marginTop: "1.6rem",
            fontSize: "clamp(1.125rem,4.6vw,1.375rem)",
            lineHeight: 1.62,
            color: "var(--on-wine)",
          }}
        >
          {CONFIG.toast}
        </p>
      </div>
    </Panel>
  );
}

function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const by = asDate(CONFIG.rsvpBy);

  // Both of this section's states share one ornament layer, so the ring
  // does not jump when the countdown runs out and the panel swaps.
  const foil = (
    <>
      <Foil
        art={WreathRing}
        tier="wm"
        size={640}
        x="50%"
        y="50%"
        drift={18}
        style={{ marginLeft: -320, marginTop: -320 }}
      />
      <Foil art={FernCurl} tier="wm" size={290} x="-7%" y="58%" rotate={8} drift={-44} />
      <Foil art={BlossomSpray} tier="wm" size={310} x="76%" y="2%" rotate={-14} flip drift={40} />
    </>
  );

  if (!t) {
    return (
      <Panel id="countdown" tone="deep" warp foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "30rem", margin: "0 auto" }}>
          <Label dim>Today</Label>
          <p
            className="wk-display"
            style={{
              marginTop: "1.4rem",
              fontSize: "clamp(2rem,8vw,3rem)",
              color: "var(--cloth)",
            }}
          >
            The day is here
          </p>
          <p
            className="wk-serif"
            style={{ marginTop: "1rem", fontSize: "1.125rem", color: "var(--on-wine-dim)" }}
          >
            Thank you for celebrating with us.
          </p>
        </div>
      </Panel>
    );
  }

  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <Panel id="countdown" tone="deep" warp foil={foil}>
      <div style={{ textAlign: "center" }}>
        <Label dim>Until we celebrate</Label>

        <div className="wk-strips">
          {units.map(({ v, l }) => (
            <div className="wk-strip" key={l}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <AsoOkeBand height={7} width="34px" tone="wine" />
              </div>
              <div style={{ height: "1.1rem" }} />
              <p className="wk-num">
                <span
                  aria-hidden="true"
                  style={{ display: "inline-block", minWidth: "2ch", textAlign: "center" }}
                >
                  {String(v).padStart(2, "0")}
                </span>
                <span className="wk-sr" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
                  {v} {l}
                </span>
              </p>
              <span className="wk-unit">{l}</span>
            </div>
          ))}
        </div>

        {by && by.getTime() > Date.now() ? (
          <p
            style={{
              marginTop: "clamp(30px,7vw,46px)",
              fontSize: ".6875rem",
              fontWeight: 600,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "var(--on-wine-dim)",
            }}
          >
            Kindly reply by {fmtShortDate(by)}
          </p>
        ) : null}
      </div>
    </Panel>
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
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  return (
    <Panel
      id="song"
      tone="cloth"
      warp
      foil={
        <>
          <Foil art={BlossomSpray} tier="accent" size={300} x="-8%" y="14%" rotate={-8} drift={44} />
          <Foil art={LeafFrond} tier="wm" size={320} x="78%" y="24%" rotate={10} drift={-44} />
          <Foil art={BudCluster} tier="wm" size={240} x="-3%" y="62%" flip drift={32} />
        </>
      }
    >
      <div style={{ textAlign: "center" }}>
        <Label>Our song</Label>

        <p
          className="wk-display wk-song-title"
          style={{
            marginTop: "1.5rem",
            fontSize: "clamp(1.625rem,6.5vw,2.125rem)",
          }}
        >
          {CONFIG.songTitle}
        </p>
        <p
          className="wk-song-sub"
          style={{
            marginTop: ".5rem",
            fontSize: ".8125rem",
            fontWeight: 500,
            letterSpacing: ".14em",
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
            <div className="wk-player">
              <button
                type="button"
                className="wk-play"
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

              <div className="wk-track">
                <div
                  className="wk-scrub"
                  role="presentation"
                  onClick={seek}
                >
                  <span style={{ width: duration ? `${(elapsed / duration) * 100}%` : "0%" }} />
                </div>
                <div className="wk-times">
                  <span>{mmss(elapsed)}</span>
                  <span>{mmss(duration)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Panel>
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

  const buildMessage = () => {
    const lines = [
      `RSVP — ${CONFIG.bride} & ${CONFIG.groom}`,
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Guests: ${form.guests}`,
      form.attending === "yes" ? "Attending: Yes" : "Attending: No, with regret",
    ];
    return lines.join("\n");
  };

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
      const firstBad = document.querySelector("[aria-invalid='true']");
      firstBad?.focus();
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

  const contacts = CONFIG.rsvpContacts || [];

  const foil = (
    <>
      <Foil art={LaurelArc} tier="accent" size={310} x="-8%" y="8%" rotate={-7} drift={46} />
      <Foil art={BlossomSpray} tier="wm" size={300} x="77%" y="52%" rotate={-12} flip drift={-40} />
      <Foil art={BudCluster} tier="wm" size={230} x="-3%" y="72%" rotate={9} drift={30} />
    </>
  );

  if (sent) {
    return (
      <Panel id="rsvp" tone="cloth" warp foil={foil}>
        <div style={{ textAlign: "center", maxWidth: "30rem", margin: "0 auto" }}>
          <AsoOkeBand height={16} />
          <p
            className="wk-display"
            style={{
              marginTop: "1.8rem",
              fontSize: "clamp(1.75rem,7vw,2.375rem)",
              color: "var(--ink)",
            }}
          >
            Thank you, {form.name.trim().split(" ")[0]}
          </p>
          <p
            className="wk-serif"
            style={{ marginTop: "1.1rem", fontSize: "1.125rem", color: "var(--ink-soft)" }}
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
                style={{ color: "var(--alaari)", textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                send it by email instead
              </a>
              .
            </p>
          ) : null}
        </div>
      </Panel>
    );
  }

  return (
    <Panel id="rsvp" tone="cloth" warp foil={foil}>
      <div style={{ maxWidth: "27rem", margin: "0 auto" }}>
        <Label>Kindly RSVP</Label>

        <form onSubmit={submit} noValidate style={{ marginTop: "1.8rem" }}>
          <div>
            <label className="wk-fielabel" htmlFor="wk-guests">
              Number of guests
            </label>
            <select
              id="wk-guests"
              className="wk-field"
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

          <div style={{ marginTop: "1.15rem" }}>
            <label className="wk-fielabel" htmlFor="wk-name">
              Full name
            </label>
            <input
              id="wk-name"
              className="wk-field"
              placeholder="Your name"
              value={form.name}
              autoComplete="name"
              aria-invalid={errors.name ? "true" : undefined}
              aria-describedby={errors.name ? "wk-name-err" : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name ? (
              <p className="wk-error" id="wk-name-err">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div style={{ marginTop: "1.15rem" }}>
            <label className="wk-fielabel" htmlFor="wk-phone">
              Phone number
            </label>
            <input
              id="wk-phone"
              className="wk-field"
              placeholder="So we can reach you"
              type="tel"
              inputMode="tel"
              value={form.phone}
              autoComplete="tel"
              aria-invalid={errors.phone ? "true" : undefined}
              aria-describedby={errors.phone ? "wk-phone-err" : undefined}
              onChange={(e) => set("phone", e.target.value)}
            />
            {errors.phone ? (
              <p className="wk-error" id="wk-phone-err">
                {errors.phone}
              </p>
            ) : null}
          </div>

          <fieldset style={{ marginTop: "1.5rem" }}>
            <legend className="wk-fielabel" style={{ padding: 0 }}>
              Will you be joining us?
            </legend>
            <div style={{ display: "grid", gap: ".6rem" }}>
              {[
                { val: "yes", label: "Accepts with pleasure" },
                { val: "no", label: "Declines with regret" },
              ].map(({ val, label }) => (
                <div key={val} style={{ position: "relative" }}>
                  <input
                    className="wk-choice"
                    type="radio"
                    name="wk-attending"
                    id={`wk-att-${val}`}
                    value={val}
                    checked={form.attending === val}
                    onChange={() => set("attending", val)}
                  />
                  <label className="wk-choice-label" htmlFor={`wk-att-${val}`}>
                    <span className="wk-dot" aria-hidden="true" />
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="wk-btn wk-btn--brass" style={{ width: "100%", marginTop: "1.6rem" }}>
            Send my reply
          </button>

          <p
            style={{
              marginTop: ".9rem",
              fontSize: ".8125rem",
              lineHeight: 1.5,
              color: "var(--ink-soft)",
              textAlign: "center",
            }}
          >
            Your reply opens in WhatsApp, ready to send. Nothing is stored on this page.
          </p>
        </form>

        {contacts.length ? (
          <div
            style={{
              marginTop: "2.8rem",
              paddingTop: "2rem",
              borderTop: "1px solid rgba(42,18,25,.14)",
            }}
          >
            <p
              style={{
                fontSize: ".6875rem",
                fontWeight: 400,
                letterSpacing: ".28em",
                textTransform: "uppercase",
                color: "var(--brass)",
                textAlign: "center",
              }}
            >
              Or telephone
            </p>

            <div className="wk-contacts">
              {contacts.map((c, i) => (
                <a className="wk-contact" key={i} href={telHref(c.phone)}>
                  <span className="wk-contact-name">{c.name}</span>
                  <span className="wk-contact-num">{c.phone}</span>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}

function Footer() {
  const year = asDate(CONFIG.weddingDate).getFullYear();
  return (
    <footer className="wk-panel wk-panel--deep wk-warp" style={{ textAlign: "center" }}>
      <Foil
        art={WreathRing}
        tier="wm"
        size={640}
        x="50%"
        y="34%"
        drift={18}
        style={{ marginLeft: -320, marginTop: -320 }}
      />
      <Foil art={BlossomSpray} tier="wm" size={330} x="-8%" y="54%" rotate={-10} drift={42} />
      <Foil art={LeafFrond} tier="wm" size={310} x="78%" y="2%" flip drift={-42} />

      <div className="wk-inner">
        <WovenMedallion size={116} initials={CONFIG.initials} bg="#26070F" />

        <p
          className="wk-display"
          style={{
            marginTop: "1.8rem",
            fontSize: "clamp(1.75rem,6.5vw,2.25rem)",
            color: "var(--cloth)",
          }}
        >
          Thank you
        </p>

        <p
          className="wk-serif"
          style={{
            margin: "1rem auto 0",
            maxWidth: "22rem",
            fontSize: "1.0625rem",
            color: "var(--on-wine-dim)",
          }}
        >
          for agreeing to be part of this one.
        </p>

        {CONFIG.closing ? (
          <p
            className="wk-serif"
            style={{
              margin: "1.7rem auto 0",
              maxWidth: "26rem",
              fontSize: "1.0625rem",
              fontStyle: "italic",
              color: "var(--brass-lt)",
            }}
          >
            {CONFIG.closing}
          </p>
        ) : null}

        <div
          className="wk-rule--fade"
          style={{ width: "min(13rem,55%)", margin: "2.6rem auto 1.5rem" }}
          aria-hidden="true"
        />

        <p
          style={{
            fontSize: ".6875rem",
            fontWeight: 600,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "rgba(247,239,226,.28)",
          }}
        >
          {CONFIG.bride} &amp; {CONFIG.groom} · {year}
        </p>

        {CONFIG.compliments ? (
          <p
            style={{
              marginTop: "1.1rem",
              fontSize: ".75rem",
              letterSpacing: ".06em",
              color: "rgba(247,239,226,.42)",
            }}
          >
            {CONFIG.compliments}
          </p>
        ) : null}
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────
export default function AsoOkeWedding() {
  const progress = useScrollProgress();

  return (
    <div className="wk">
      <div
        className="wk-thread"
        style={{ width: `${progress * 100}%` }}
        aria-hidden="true"
      />

      <Hero />
      {/* Each seam takes the ground of the panel above it, so it reads as
          that panel's woven hem rather than as a stripe dropped between
          two sections. */}
      <AsoOkeBand height={20} tone="wine" className="wk-seam--onwine" />

      {hasInvitation() ? (
        <>
          <Invitation />
          <AsoOkeBand height={20} tone="cloth" />
        </>
      ) : null}

      <Story />
      <AsoOkeBand height={20} tone="cloth" />
      <BigDay />
      <AsoOkeBand height={20} tone="wine" className="wk-seam--onwine" />

      {CONFIG.toast ? (
        <>
          <Toast />
          <AsoOkeBand height={20} tone="wine" className="wk-seam--ondeep" />
        </>
      ) : null}

      <Countdown />
      <AsoOkeBand height={20} tone="wine" className="wk-seam--ondeep" />
      <Song />
      <AsoOkeBand height={20} tone="cloth" />
      <Rsvp />
      <AsoOkeBand height={20} tone="cloth" />
      <Footer />
    </div>
  );
}
