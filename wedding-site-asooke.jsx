import { useState, useEffect, useMemo, useRef, useCallback } from "react";

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

// ── Fonts + stylesheet, injected once ───────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";

const CSS = `
.wk,.wk *,.wk *::before,.wk *::after{box-sizing:border-box}
.wk h1,.wk h2,.wk h3,.wk p,.wk figure,.wk blockquote,.wk ul,.wk ol,.wk fieldset{
  margin:0;padding:0;border:0;list-style:none
}
.wk button,.wk input,.wk select{font:inherit;color:inherit}
.wk a{color:inherit}

.wk{
  /* ── palette: alaari aso-oke ─────────────────────────────────── */
  --wine-deep:#26070F;
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
  -webkit-font-smoothing:antialiased;
  text-rendering:optimizeLegibility;
}

/* ── type roles: Fraunces is the ceremonial voice, Karla the
      functional one. Nothing switches roles. ─────────────────────── */
.wk-display{
  font-family:'Fraunces',Georgia,'Times New Roman',serif;
  font-variation-settings:'opsz' 144,'SOFT' 28,'WONK' 1;
  font-weight:400;line-height:1.05;letter-spacing:-.02em
}
.wk-serif{
  font-family:'Fraunces',Georgia,'Times New Roman',serif;
  font-variation-settings:'opsz' 20,'SOFT' 16,'WONK' 0;
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
.wk-panel{position:relative;padding:var(--panel-y) var(--panel-x)}
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

.wk-inner{position:relative;max-width:56rem;margin:0 auto}
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
//  The aso-oke band — the page's only ornament.
//  Warp threads running vertically, weft blocks crossing them in the
//  repeating rhythm of woven cloth. Every seam uses it. Nothing else
//  decorates anything.
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
function WovenMedallion({ size = 176, initials }) {
  const uid = useMemo(() => nextId("med"), []);
  const C = 60; // viewBox is 120
  const RW = 45; // weave radius
  const SEG = 32; // segments — divides the circumference, so it closes
  const seg = (2 * Math.PI * RW) / SEG;
  const slow = (2 * Math.PI * RW) / 8; // a slower rhythm for the hot thread
  const text = (initials || "").trim();
  const fontSize = text.length > 5 ? 17 : text.length > 3 ? 22 : 28;

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

      <text
        x={C}
        y={C + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fraunces, Georgia, serif"
        fontSize={fontSize}
        fontStyle="italic"
        fill={`url(#${uid}-g)`}
      >
        {text}
      </text>
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

const Panel = ({ id, tone = "cloth", warp, children }) => (
  <section
    id={id}
    className={`wk-panel wk-panel--${tone}${warp ? " wk-warp" : ""}`}
  >
    <div className="wk-inner">{children}</div>
  </section>
);

// ═══════════════════════════════════════════════════════════════════
//  Sections
// ═══════════════════════════════════════════════════════════════════
function Hero() {
  const d = asDate(CONFIG.weddingDate);
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
      <div className="wk-inner" style={{ width: "100%" }}>
        <WovenMedallion initials={CONFIG.initials} />

        <div className="wk-hero-copy" style={{ marginTop: "clamp(26px,6vw,38px)" }}>
          <p
            style={{
              fontSize: ".6875rem",
              fontWeight: 600,
              letterSpacing: ".26em",
              textTransform: "uppercase",
              color: "var(--on-wine-dim)",
            }}
          >
            Together with their families
          </p>

          <h1
            className="wk-display"
            style={{
              marginTop: "1.1rem",
              fontSize: "clamp(2.75rem,13vw,5.25rem)",
              color: "var(--cloth)",
            }}
          >
            {CONFIG.bride}
          </h1>

          <p
            className="wk-display"
            aria-hidden="true"
            style={{
              margin: ".28em 0 .34em",
              fontSize: "clamp(1.875rem,7vw,2.75rem)",
              fontStyle: "italic",
              color: "var(--brass-lt)",
            }}
          >
            &amp;
          </p>

          <h1
            className="wk-display"
            style={{
              fontSize: "clamp(2.75rem,13vw,5.25rem)",
              color: "var(--cloth)",
            }}
          >
            {CONFIG.groom}
          </h1>

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
            <a className="wk-btn wk-btn--brass" href="#story" onClick={scrollToId("story")}>
              Open the invitation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Story() {
  return (
    <Panel id="story" tone="cloth" warp>
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
    <Panel id="details" tone="wine" warp>
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

function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const by = asDate(CONFIG.rsvpBy);

  if (!t) {
    return (
      <Panel id="countdown" tone="deep" warp>
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
    <Panel id="countdown" tone="deep" warp>
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
    <Panel id="song" tone="cloth" warp>
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

  if (sent) {
    return (
      <Panel id="rsvp" tone="cloth" warp>
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
    <Panel id="rsvp" tone="cloth" warp>
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
      </div>
    </Panel>
  );
}

function Footer() {
  const year = asDate(CONFIG.weddingDate).getFullYear();
  return (
    <footer className="wk-panel wk-panel--deep wk-warp" style={{ textAlign: "center" }}>
      <div className="wk-inner">
        <WovenMedallion size={104} initials={CONFIG.initials} />

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
      <Story />
      <AsoOkeBand height={20} tone="cloth" />
      <BigDay />
      <AsoOkeBand height={20} tone="wine" className="wk-seam--onwine" />
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
