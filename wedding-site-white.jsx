import { useState, useEffect, useRef, useCallback } from "react";

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
//  The only animation is the hero's entrance.
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
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap";

const CSS = `
.ww,.ww *,.ww *::before,.ww *::after{box-sizing:border-box}
.ww h1,.ww h2,.ww h3,.ww p,.ww figure,.ww blockquote,.ww ul,.ww ol,.ww fieldset{
  margin:0;padding:0;border:0;list-style:none
}
.ww button,.ww input,.ww select{font:inherit;color:inherit}
.ww a{color:inherit}

.ww{
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

/* ── two voices: Bodoni Moda speaks, Jost explains ──────────────── */
.ww-display{
  font-family:'Bodoni Moda',Didot,'Times New Roman',serif;
  font-variation-settings:'opsz' 96;
  font-weight:400;line-height:1.02;letter-spacing:-.008em
}
.ww-text{font-weight:300;line-height:1.78}
.ww-num{
  font-family:'Bodoni Moda',Didot,serif;
  font-variation-settings:'opsz' 96;
  font-weight:400;line-height:1;display:block;
  font-variant-numeric:tabular-nums
}

.ww-label{
  font-size:.6875rem;font-weight:500;letter-spacing:.3em;
  text-transform:uppercase;color:var(--gold)
}
.ww-label--plain{color:var(--ink-soft)}
.ww-label--onwine{color:var(--gold-lt)}

/* ── panels ──────────────────────────────────────────────────────── */
.ww-panel{position:relative;padding:var(--panel-y) var(--panel-x)}
.ww-panel--ivory{background:var(--ivory);color:var(--ink)}
.ww-panel--pearl{background:var(--pearl);color:var(--ink)}
.ww-panel--wine{background:var(--wine);color:var(--on-wine)}
.ww-panel--deep{background:var(--wine-deep);color:var(--on-wine)}
.ww-inner{position:relative;max-width:60rem;margin:0 auto}
.ww-measure{max-width:var(--measure)}

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
//  Monogram — the couple's initials in a double-ruled ring with four
//  engraved diamonds set between the rules.
// ═══════════════════════════════════════════════════════════════════
function Monogram({ size = 104, initials, onWine }) {
  const text = (initials || "").trim();
  const fontSize = text.length > 5 ? 15 : text.length > 3 ? 19 : 24;
  const R1 = 46;
  const R2 = 42;
  const mark = (R1 + R2) / 2;
  const stroke = onWine ? "rgba(223,193,121,.5)" : "rgba(176,138,51,.45)";
  const strokeSoft = onWine ? "rgba(223,193,121,.26)" : "rgba(176,138,51,.22)";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${CONFIG.bride} and ${CONFIG.groom}`}
      style={{ display: "block", margin: "0 auto" }}
    >
      <circle cx="50" cy="50" r={R1} fill="none" stroke={stroke} strokeWidth="1" />
      <circle cx="50" cy="50" r={R2} fill="none" stroke={strokeSoft} strokeWidth="1" />
      {[0, 90, 180, 270].map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return (
          <rect
            key={deg}
            x="46.4"
            y="46.4"
            width="7.2"
            height="7.2"
            fill="none"
            stroke={stroke}
            strokeWidth=".9"
            transform={`translate(${(50 + mark * Math.cos(a)).toFixed(2)} ${(
              50 +
              mark * Math.sin(a)
            ).toFixed(2)}) rotate(45) translate(-50 -50)`}
          />
        );
      })}
      <text
        x="50"
        y="51"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Bodoni Moda, Didot, serif"
        fontSize={fontSize}
        fontStyle="italic"
        fill={onWine ? "#DFC179" : "#8A6013"}
      >
        {text}
      </text>
    </svg>
  );
}

const Section = ({ id, tone = "ivory", children }) => (
  <section id={id} className={`ww-panel ww-panel--${tone}`}>
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

      <div className="ww-hero ww-inner" style={{ width: "100%" }}>
        <Monogram size={104} initials={CONFIG.initials} />

        <p className="ww-label" style={{ marginTop: "clamp(26px,6vw,38px)" }}>
          Together with their families
        </p>

        <h1
          className="ww-display"
          style={{
            marginTop: "1.4rem",
            fontSize: "clamp(3rem,14vw,6rem)",
            color: "var(--ink)",
          }}
        >
          {CONFIG.bride}
        </h1>

        <p
          className="ww-display"
          aria-hidden="true"
          style={{
            margin: ".22em 0 .28em",
            fontSize: "clamp(1.5rem,5.5vw,2.125rem)",
            fontStyle: "italic",
            color: "var(--gold)",
          }}
        >
          and
        </p>

        <h1
          className="ww-display"
          style={{ fontSize: "clamp(3rem,14vw,6rem)", color: "var(--ink)" }}
        >
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
    <Section id="story" tone="pearl">
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
    <Section id="details" tone="ivory">
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

  if (!t) {
    return (
      <Section id="countdown" tone="deep">
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
    <Section id="countdown" tone="wine">
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
    <Section id="song" tone="ivory">
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

  if (sent) {
    return (
      <Section id="rsvp" tone="pearl">
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
    <Section id="rsvp" tone="pearl">
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
      <div className="ww-inner">
        <Monogram size={96} initials={CONFIG.initials} onWine />

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
