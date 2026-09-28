import { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";

// ─── EDIT THESE ─────────────────────────────────────────────────────
const CONFIG = {
  bride: "Bride Name",
  groom: "Groom Name",
  initials: "B × G",
  weddingDate: new Date("2025-12-20T20:00:00"),
  venue: "Royal Gardens Hall",
  address: "Kano, Nigeria",
  story:
    "Under the same sky, across a thousand moments, two souls found each other. What began as a chance encounter became something the stars themselves could not have written better.",
  song: "A Thousand Years",
  artist: "Christina Perri",
};
// ────────────────────────────────────────────────────────────────────

// Inject fonts + global CSS once
if (!document.getElementById("cel-font")) {
  const l = document.createElement("link");
  l.id = "cel-font";
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Great+Vibes&family=Parisienne&family=Raleway:ital,wght@0,200;0,300;0,400;1,200;1,300&display=swap";
  document.head.appendChild(l);
}
if (!document.getElementById("cel-css")) {
  const s = document.createElement("style");
  s.id = "cel-css";
  s.innerHTML = `
    @keyframes twinkle { 0%,100%{opacity:.12} 50%{opacity:.85} }
    @keyframes spin-slow { to{transform:rotate(360deg)} }
    @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    /* The first selector here used to read .cel* — a star in the wrong
       place. It is not a selector at all, and an invalid selector voids
       the entire list it sits in, so the ::before and ::after reset and
       box-sizing went down with it. Every panel was then carrying the
       user agent's heading and paragraph margins on top of the spacing
       written in the JSX, which is what pushed the hero past the fold
       and left its button below it. */
    .cel *,.cel *::before,.cel *::after{box-sizing:border-box;margin:0;padding:0}
    .cel{font-family:'Raleway',sans-serif;-webkit-font-smoothing:antialiased;background:#07090F;overflow-x:clip}
    .cel-field{
      width:100%;padding:14px 16px;
      background:rgba(200,212,232,.03);
      border:1px solid rgba(200,212,232,.14);
      color:#EEF2F8;font-family:'Raleway',sans-serif;
      font-size:13px;font-weight:300;letter-spacing:.06em;
      outline:none;appearance:none;border-radius:0;transition:border-color .2s;
    }
    .cel-field:focus{border-color:rgba(240,192,96,.5)}
    .cel-field::placeholder{color:rgba(200,212,232,.22)}
    .cel-field option{background:#0D1535}
    .cel-ghost-btn{transition:background .22s,color .22s}
    .cel-ghost-btn:hover{background:rgba(240,192,96,.1)!important;color:#F0C060!important}
    .cel-opt:hover{border-color:rgba(240,192,96,.5)!important}
    .cel-map:hover{color:#F0C060!important;border-color:rgba(240,192,96,.6)!important}

    /* ── the three voices ────────────────────────────────────────────
       Cormorant Garamond speaks the names. Parisienne appears exactly
       once, on the word "and". Raleway carries everything that has to
       be read. Cinzel is gone: an inscriptional caps face has almost no
       thick-to-thin modulation, so it cannot do what the names need. */
    .cel-name{
      font-family:'Cormorant Garamond',Didot,'Times New Roman',serif;
      font-weight:400;
      font-size:clamp(2.85rem,13.5vw,5.5rem);
      line-height:1.04;letter-spacing:.02em
    }
    .cel-script{
      font-family:'Parisienne','Allura',cursive;
      font-weight:400;
      font-size:clamp(1.75rem,6.5vw,2.5rem);
      line-height:1.15;letter-spacing:0
    }
    /* "and", ruled in from both sides so the word sits inside the
       page's ornament instead of floating in the gap between names. */
    .cel-and{
      display:flex;align-items:center;justify-content:center;
      gap:clamp(.75rem,3vw,1.15rem);margin:.42em 0 .5em
    }
    .cel-and i{
      flex:0 0 auto;width:clamp(2rem,10vw,4.25rem);height:1px;
      background:linear-gradient(90deg,transparent,rgba(240,192,96,.5))
    }
    .cel-and i:last-child{
      background:linear-gradient(90deg,rgba(240,192,96,.5),transparent)
    }
    /* Wide tracking is the point of a label, but on a narrow phone it
       pushes the line into a ragged second row. Tighten it there. */
    .cel-micro{font-size:9px;letter-spacing:.38em}
    @media (max-width:30rem){
      .cel-micro{font-size:8px;letter-spacing:.22em}
    }

    /* ── Foils ───────────────────────────────────────────────────────
       The scroll-revealed ornament. The behaviour is in the engine
       below; this is only the paint. Three elements, because three
       things want to transform independently and only one of them can
       own transform at a time: the outer span holds the position and
       the ornament's fixed orientation, the middle holds the entrance,
       and the svg holds the drift. */
    .cel section, .cel footer { position: relative; isolation: isolate; }

    .cel-foil{
      position:absolute;inset:0;z-index:-1;overflow:hidden;
      pointer-events:none;color:#F0C060;
      --foil-o:.1;
      --rv-dur:1.5s;--rv-delay:0s;--rv-step:.1s;
      --rv-ease:cubic-bezier(.42,0,.2,1);
    }
    .cel-foil--wm{--foil-o:.1}
    .cel-foil--accent{--foil-o:.34}
    .cel-foil--inline{--foil-o:.5}
    /* Both panel colours are dark, but the navy is the lighter of the
       two, so a line of gold has less to bite against there. The same
       ornament needs a little more light on the navy to read at all. */
    .cel-foil--navy.cel-foil--wm{--foil-o:.13}
    .cel-foil--navy.cel-foil--accent{--foil-o:.4}

    /* The entrance sits on its own element so it can own opacity,
       transform and clip-path without fighting the two transforms that
       already exist: the ornament's fixed orientation on the span above
       it, and the drift on the svg below.

       Every transition here runs in both directions, which is the whole
       point — scrolling back up rewinds the ornament rather than
       leaving it lit. */
    .cel-foil-rv{
      display:block;width:100%;height:100%;
      opacity:0;transform-origin:50% 100%;
      transition:
        opacity var(--rv-dur) var(--rv-ease) var(--rv-delay),
        transform var(--rv-dur) var(--rv-ease) var(--rv-delay),
        clip-path var(--rv-dur) var(--rv-ease) var(--rv-delay);
    }
    .cel-foil.is-in .cel-foil-rv{
      opacity:var(--foil-o);transform:none;clip-path:inset(0 0 0 0);
    }

    /* Where each ornament comes from. Picked per ornament, not per tier,
       so nothing on the page arrives the way its neighbour did. */
    .cel-rv--rise{transform:translate3d(0,46px,0)}
    .cel-rv--settle{transform:translate3d(0,-42px,0)}
    .cel-rv--slide{transform:translate3d(-52px,0,0)}
    .cel-rv--slide-r{transform:translate3d(52px,0,0)}
    .cel-rv--bloom{transform:scale(.8);transform-origin:50% 50%}
    .cel-rv--unfurl{transform:scaleY(.08)}
    .cel-rv--sway{transform:rotate(-9deg)}
    /* A wipe is a wipe and not a fade, so these hold the tier's opacity
       throughout and only their clip-path moves — the rewind is then a
       wipe back rather than a dissolve. */
    .cel-rv--wipe,.cel-rv--wipe-r,.cel-rv--wipe-d,.cel-rv--wipe-u{opacity:var(--foil-o)}
    .cel-rv--wipe{clip-path:inset(0 100% 0 0)}
    .cel-rv--wipe-r{clip-path:inset(0 0 0 100%)}
    .cel-rv--wipe-d{clip-path:inset(0 0 100% 0)}
    .cel-rv--wipe-u{clip-path:inset(100% 0 0 0)}

    /* The drift. --p is written by the page's single scroll loop and runs
       about -1 below the fold to 1 above it, so every ornament on the
       page shares one measurement — which is what lets that loop do all
       of its reading before it does any writing. */
    .cel-foil-art{
      width:100%;height:100%;display:block;
      transform:translate3d(0,calc(var(--p,0) * var(--drift,0px)),0);
    }

    /* Drawing, not appearing. Every drawable shape in the set carries
       pathLength="1", which normalises its length to 1 whatever its real
       geometry — so this one dash rule draws any of them and nothing has
       to be measured with getTotalLength(). The stagger is nth-child and
       the step is random per ornament, so two rings never fill in at the
       same rhythm.

       It matters more here than on the botanical pages: a star chart is
       mostly long unbroken curves, and a curve that draws itself reads
       as being charted rather than as having faded up. */
    .cel-line path,.cel-line circle,.cel-line ellipse,.cel-line line,
    .cel-line-r path,.cel-line-r circle,.cel-line-r ellipse,.cel-line-r line{
      stroke-dasharray:1;stroke-dashoffset:1;
    }
    /* the same stroke drawn from its far end */
    .cel-line-r path,.cel-line-r circle,.cel-line-r ellipse,.cel-line-r line{stroke-dashoffset:-1}

    .is-in .cel-line path,.is-in .cel-line circle,
    .is-in .cel-line ellipse,.is-in .cel-line line,
    .is-in .cel-line-r path,.is-in .cel-line-r circle,
    .is-in .cel-line-r ellipse,.is-in .cel-line-r line{
      animation:cel-stroke var(--rv-dur) var(--rv-ease) var(--rv-delay) forwards;
    }
    .is-in .cel-line *:nth-child(2),.is-in .cel-line-r *:nth-child(2){animation-delay:calc(var(--rv-delay) + var(--rv-step))}
    .is-in .cel-line *:nth-child(3),.is-in .cel-line-r *:nth-child(3){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 2)}
    .is-in .cel-line *:nth-child(4),.is-in .cel-line-r *:nth-child(4){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 3)}
    .is-in .cel-line *:nth-child(5),.is-in .cel-line-r *:nth-child(5){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 4)}
    .is-in .cel-line *:nth-child(6),.is-in .cel-line-r *:nth-child(6){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 5)}
    .is-in .cel-line *:nth-child(n+7),.is-in .cel-line-r *:nth-child(n+7){animation-delay:calc(var(--rv-delay) + var(--rv-step) * 6)}
    @keyframes cel-stroke{to{stroke-dashoffset:0}}

    @media (prefers-reduced-motion: reduce){
      .cel-foil-rv{transition:none;opacity:var(--foil-o);transform:none;clip-path:none}
      .is-in .cel-line path,.is-in .cel-line circle,.is-in .cel-line ellipse,.is-in .cel-line line,
      .is-in .cel-line-r path,.is-in .cel-line-r circle,.is-in .cel-line-r ellipse,.is-in .cel-line-r line{
        animation:none;stroke-dashoffset:0;
      }
    }
  `;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════════════════════
//  The foil engine
//
//  Two dozen charted ornaments, each revealing as it enters and retiring
//  as it leaves, is more animation than it sounds, and the naive way to
//  do the drift is a listener per ornament. At that many that is that
//  many getBoundingClientRect() calls interleaved with as many style
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
   grows. Negative values put it off the edge, which is where a chart
   usually belongs — a diagram that stops politely short of the trim reads
   as a sticker.

   `navy` lifts the opacity for the lighter of the two panel colours.
   `inline` drops it back into the flow instead, for the few that flank a
   word rather than sit behind one. */
function Foil({
  art: Art,
  tier = "wm",
  size = 260,
  x = "-6%",
  y = "8%",
  rotate = 0,
  flip = false,
  drift = 46,
  navy = false,
  inline = false,
  style,
}) {
  const [ref, shown] = useFoil(drift);
  const [rv] = useState(pickReveal);

  const draws = rv.k === "line" || rv.k === "line-r";
  const svgCls = `cel-foil-art${draws ? ` cel-${rv.k}` : ""}`;

  return (
    <span
      ref={ref}
      className={`cel-foil cel-foil--${tier}${navy ? " cel-foil--navy" : ""}${shown ? " is-in" : ""}`}
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
      <span className={`cel-foil-rv cel-rv--${rv.k}`}>
        <Art className={svgCls} />
      </span>
    </span>
  );
}

// ── The celestial vocabulary ────────────────────────────────────────
//  Ten charted motifs, all stroke art in currentColor, so one set wears
//  gold on both panels. Nothing here is filled: at a tenth opacity a fill
//  turns to mud where a line still reads as a line, and the whole point
//  of these is that they look drawn.
//
//  Every drawable carries pathLength="1" — see the stylesheet for why.
//  Where a motif wants a dozen small marks (ring ticks, a field of stars)
//  they are gathered into ONE path of many subpaths rather than a dozen
//  elements, because pathLength normalises the whole path and the marks
//  then draw in sequence the way a hand would make them. A dozen separate
//  elements would also all land on the same nth-child stagger slot.
const S = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

// a ring of ticks. `n` marks between r1 and r2, skipping every `skip`th.
const tickRing = (cx, cy, r1, r2, n, skip = 0) => {
  let d = "";
  for (let i = 0; i < n; i++) {
    if (skip && i % skip === 0) continue;
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const c = Math.cos(a), s = Math.sin(a);
    d += `M${(cx + r1 * c).toFixed(2)} ${(cy + r1 * s).toFixed(2)}L${(cx + r2 * c).toFixed(2)} ${(cy + r2 * s).toFixed(2)}`;
  }
  return d;
};

const astrolabeTicks = tickRing(50, 50, 43, 47.5, 36, 9);

/* The astrolabe. The page's centrepiece, and the one ornament that is
   allowed to be a diagram: two rings, a graduated limb, and the four
   cardinal marks sitting outside the bezel. */
const Astrolabe = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <circle cx="50" cy="50" r="43" pathLength="1" opacity=".9" />
    <circle cx="50" cy="50" r="34" pathLength="1" opacity=".45" />
    <path d={astrolabeTicks} pathLength="1" opacity=".7" strokeWidth=".55" />
    <path d="M50 3v6M50 91v6M3 50h6M91 50h6" pathLength="1" strokeWidth=".9" />
  </svg>
);

/* Three orbits crossing, with a single body riding the widest one. The
   ellipses are drawn whole rather than as arcs: an orbit that stops
   halfway reads as a mistake, and the crossings are the point. */
const Orbit = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <ellipse cx="50" cy="50" rx="44" ry="17" pathLength="1" opacity=".8" />
    <ellipse cx="50" cy="50" rx="44" ry="17" transform="rotate(60 50 50)" pathLength="1" opacity=".55" />
    <ellipse cx="50" cy="50" rx="44" ry="17" transform="rotate(120 50 50)" pathLength="1" opacity=".35" />
    <circle cx="94" cy="50" r="1.8" pathLength="1" strokeWidth="1.1" />
  </svg>
);

/* A four-point star. The sides are concave — the waist control points sit
   near the centre — which is what separates a sparkle from a diamond. */
const StarBurst = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <path d="M50 4Q53 47 96 50Q53 53 50 96Q47 53 4 50Q47 47 50 4Z" pathLength="1" opacity=".9" />
    <circle cx="50" cy="50" r="14" pathLength="1" opacity=".45" strokeWidth=".55" />
    <path d="M50 22v56M22 50h56" pathLength="1" opacity=".26" strokeWidth=".55" />
  </svg>
);

/* The crescent drawn as two arcs meeting at the horns: the lit limb and
   the terminator. Both are the minor arc of their radius — the major arc
   would bulge the other way and close the shape into a lens — and the
   shallower of the two is what carves the bite out of the deeper one. */
const CrescentArc = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <path d="M68 6A46 46 0 0 0 68 94" pathLength="1" opacity=".85" />
    <path d="M68 6A58 58 0 0 0 68 94" pathLength="1" opacity=".6" />
    <path
      d="M20 30h6M23 27v6M74 22h5M76.5 19.5v5M78 68h5M80.5 65.5v5"
      pathLength="1"
      opacity=".45"
      strokeWidth=".55"
    />
  </svg>
);

/* Nodes and the lines between them. The lines are one path and the nodes
   one path, so the constellation draws as a chart being laid down rather
   than as eight things appearing at once. */
const ConstellationWeb = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".6" {...p}>
    <path
      d="M12 74L30 46L52 58L64 24L82 38L92 16M30 46L64 24M52 58L82 38M12 74L52 58"
      pathLength="1"
      opacity=".7"
    />
    <path
      d="M8 72h4M10 70v4M8 76h4M10 74v4M26 42h4M28 40v4M26 46h4M28 44v4M48 54h4M50 52v4M48 58h4M50 56v4M60 20h4M62 18v4M60 24h4M62 22v4M78 34h4M80 32v4M88 12h4M90 10v4"
      pathLength="1"
      opacity=".85"
      strokeWidth=".5"
    />
  </svg>
);

/* A comet: head, tapered tail, and the sparks it sheds. The tail is a
   closed shape but is stroked, not filled, so it reads as the outline of
   a wake rather than a solid smear. */
const Comet = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <circle cx="30" cy="30" r="7" pathLength="1" opacity=".9" />
    <path d="M36 26C52 22 72 16 92 8c-14 12-30 22-48 30" pathLength="1" opacity=".65" />
    <path d="M84 12l5-4M78 22l6-3M90 22l5-2" pathLength="1" opacity=".4" strokeWidth=".55" />
  </svg>
);

/* A zodiac wheel: bezel, inner ring, twelve spokes, and the twelve marks
   struck between them. The spokes and the marks are each one path. */
const ZodiacWheel = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <circle cx="50" cy="50" r="44" pathLength="1" opacity=".85" />
    <circle cx="50" cy="50" r="28" pathLength="1" opacity=".5" />
    <path
      d={Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const c = Math.cos(a), s = Math.sin(a);
        return `M${(50 + 30 * c).toFixed(2)} ${(50 + 30 * s).toFixed(2)}L${(50 + 42 * c).toFixed(2)} ${(50 + 42 * s).toFixed(2)}`;
      }).join("")}
      pathLength="1"
      opacity=".6"
      strokeWidth=".55"
    />
    <path
      d={Array.from({ length: 12 }, (_, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2;
        const c = Math.cos(a), s = Math.sin(a);
        return `M${(50 + 35 * c).toFixed(2)} ${(50 + 35 * s).toFixed(2)}L${(50 + 39 * c).toFixed(2)} ${(50 + 39 * s).toFixed(2)}`;
      }).join("")}
      pathLength="1"
      opacity=".45"
      strokeWidth=".5"
    />
  </svg>
);

/* A spiral, open at the centre. Two and a half turns, sampled rather than
   arced, because an arc chain this long is a string of near-degenerate
   radii and the browser rounds them into facets. */
const NebulaSpiral = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <path
      d={(() => {
        let d = "";
        for (let i = 0; i <= 180; i++) {
          const t = i / 180;
          const a = t * Math.PI * 2 * 2.4;
          const r = 3 + t * 43;
          d += `${i ? "L" : "M"}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`;
        }
        return d;
      })()}
      pathLength="1"
      opacity=".7"
    />
    <circle cx="50" cy="50" r="2" pathLength="1" opacity=".8" strokeWidth=".9" />
  </svg>
);

/* An eclipse: the disc, the terminator crossing it, and the corona. The
   shadow is an arc rather than a second circle so it reads as an edge
   passing over, which is what an eclipse is. */
const Eclipse = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".7" {...p}>
    <circle cx="50" cy="50" r="30" pathLength="1" opacity=".85" />
    <path d="M50 20A30 30 0 0 1 50 80" pathLength="1" opacity=".6" />
    <path d={tickRing(50, 50, 34, 46, 24, 2)} pathLength="1" opacity=".38" strokeWidth=".55" />
  </svg>
);

/* A chart grid with a reading taken across it. The faint squares are two
   paths and the reading one, so the grid lays down before the line is
   plotted over it. */
const StarChart = (p) => (
  <svg viewBox="0 0 100 100" {...S} strokeWidth=".55" {...p}>
    <path d="M20 20h60M20 40h60M20 60h60M20 80h60" pathLength="1" opacity=".32" />
    <path d="M20 20v60M40 20v60M60 20v60M80 20v60" pathLength="1" opacity=".22" />
    <path d="M20 78L34 58L48 66L64 34L80 24" pathLength="1" opacity=".75" strokeWidth=".7" />
  </svg>
);

// ── Countdown hook ──────────────────────────────────────────────────
function useCountdown(target) {
  const calc = () => {
    const d = target - Date.now();
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(d / 86400000),
      hours: Math.floor(d / 3600000) % 24,
      minutes: Math.floor(d / 60000) % 60,
      seconds: Math.floor(d / 1000) % 60,
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

// ── Starfield ───────────────────────────────────────────────────────
function Stars({ count = 80 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.7 + 0.3,
        delay: Math.random() * 6,
        dur: 2.5 + Math.random() * 3.5,
        gold: i % 8 === 0,
      })),
    []
  );
  return (
    <>
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.gold ? "#F0C060" : "#C8D4E8",
            animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}
    </>
  );
}

// ── Constellation line SVG ─────────────────────────────────────────
function Constellation() {
  const nodes = [
    { x: 10, y: 38, r: 1.5 },
    { x: 68, y: 18, r: 1 },
    { x: 128, y: 46, r: 2.8 },
    { x: 200, y: 12, r: 1.2 },
    { x: 260, y: 42, r: 1.5 },
    { x: 318, y: 20, r: 1 },
    { x: 380, y: 38, r: 1.5 },
  ];
  return (
    <svg viewBox="0 0 390 60" width="100%"
      style={{ maxWidth: 500, display: "block", margin: "0 auto", overflow: "visible" }}>
      {nodes.slice(0, -1).map((n, i) => (
        <line key={i}
          x1={n.x} y1={n.y} x2={nodes[i + 1].x} y2={nodes[i + 1].y}
          stroke="rgba(200,212,232,.18)" strokeWidth="0.7" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 3} fill="rgba(240,192,96,.06)" />
          <circle cx={n.x} cy={n.y} r={n.r}
            fill={n.r > 2 ? "#F0C060" : "#C8D4E8"}
            opacity={n.r > 2 ? 0.9 : 0.55} />
        </g>
      ))}
    </svg>
  );
}

// ── Crescent Moon SVG ──────────────────────────────────────────────
function CrescentMoon({ size = 100 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="40" fill="rgba(240,192,96,.07)"
        stroke="rgba(240,192,96,.22)" strokeWidth="0.8" />
      <circle cx="62" cy="44" r="34" fill="#07090F" />
      <circle cx="80" cy="20" r="2" fill="#F0C060" opacity="0.75" />
      <circle cx="88" cy="40" r="1.2" fill="#C8D4E8" opacity="0.5" />
      <circle cx="74" cy="8" r="1" fill="#C8D4E8" opacity="0.4" />
    </svg>
  );
}

// ── Shared atoms ───────────────────────────────────────────────────
const GoldDivider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px auto", width: "fit-content" }}>
    <div style={{ width: 42, height: "0.5px", background: "rgba(240,192,96,.45)" }} />
    <span style={{ color: "#F0C060", fontSize: 11, opacity: 0.7 }}>✦</span>
    <div style={{ width: 42, height: "0.5px", background: "rgba(240,192,96,.45)" }} />
  </div>
);

const SectionEyebrow = ({ children }) => (
  <p style={{
    fontFamily: "Cormorant Garamond, serif",
    fontSize: 9.5,
    letterSpacing: "0.32em",
    color: "#F0C060",
    textTransform: "uppercase",
    opacity: 0.65,
    marginBottom: 2,
  }}>{children}</p>
);

// ── Monogram ────────────────────────────────────────────────────────
//  The couple's two initials interlocked.
//
//  CONFIG.initials arrives as "B × G": initials *and* their separator,
//  so the letters are pulled out of it rather than drawn whole.
//
//  The interlock is the engraver's trick. The second letter is stroked
//  in the panel's own colour before its fill is laid down, which opens
//  a hairline gap through the first wherever the two cross. The pair
//  then reads as one woven mark instead of two letters set side by
//  side. This page used to set the initials as tracked text, which is
//  a caption, not a monogram.
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

function Monogram({ size = "clamp(104px,30vw,136px)", initials, fill = "#F0C060", bg = "#0E1430" }) {
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
      <MonoLetters holder={holder} fit={fit} letters={letters} fill={fill} bg={bg} />
    </svg>
  );
}

// ── Hero ────────────────────────────────────────────────────────────
function Hero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const dateStr = CONFIG.weddingDate
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();

  return (
    <section style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 38% 28%, #161E3A 0%, #07090F 58%, #0B0D1C 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      textAlign: "center",
      padding: "80px 28px",
    }}>
      <Stars count={120} />

      <Foil art={Astrolabe} tier="wm" size={780} x="50%" y="50%" drift={18}
            style={{ marginLeft: -390, marginTop: -390 }} />
      <Foil art={Orbit} tier="wm" size={420} x="-14%" y="62%" rotate={-18} drift={44} />
      <Foil art={StarBurst} tier="accent" size={230} x="82%" y="12%" rotate={12} drift={-38} />
      <Foil art={ZodiacWheel} tier="wm" size={340} x="78%" y="66%" rotate={8} flip drift={34} />
      <Foil art={ConstellationWeb} tier="wm" size={300} x="4%" y="6%" rotate={-6} drift={-30} />

      <div style={{ position: "relative", zIndex: 2, animation: "fadein 1.2s ease both" }}>
        {/* Monogram */}
        <Monogram initials={CONFIG.initials} bg="#0E1430" />

        <p className="cel-micro" style={{
          fontFamily: "Raleway, sans-serif",
          color: "rgba(200,212,232,.4)",
          textTransform: "uppercase",
          marginTop: 30,
          marginBottom: 22,
        }}>Together with their families</p>

        <h1 className="cel-name" style={{ color: "#EEF2F8" }}>{CONFIG.bride}</h1>

        <div className="cel-and" aria-hidden="true">
          <i />
          <span className="cel-script" style={{ color: "#F0C060" }}>and</span>
          <i />
        </div>

        <h1 className="cel-name" style={{ color: "#EEF2F8" }}>{CONFIG.groom}</h1>

        <GoldDivider />

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 11,
          fontWeight: 300,
          letterSpacing: "0.22em",
          color: "rgba(200,212,232,.5)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}>{dateStr}</p>

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 11,
          fontWeight: 200,
          letterSpacing: "0.14em",
          color: "rgba(200,212,232,.3)",
          marginBottom: 50,
        }}>{CONFIG.venue} · {CONFIG.address}</p>

        <button
          className="cel-ghost-btn"
          onClick={() => scrollTo("story")}
          style={{
            background: "transparent",
            border: "1px solid rgba(240,192,96,.45)",
            color: "rgba(240,192,96,.75)",
            padding: "13px 42px",
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 9.5,
            letterSpacing: "0.28em",
            cursor: "pointer",
            textTransform: "uppercase",
          }}>
          Open Invitation
        </button>
      </div>

      {/* Scroll line */}
      <div style={{
        position: "absolute", bottom: 30, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      }}>
        <div style={{ width: "0.5px", height: 44, background: "rgba(200,212,232,.25)" }} />
        <p style={{
          fontFamily: "Raleway, sans-serif", fontSize: 8,
          letterSpacing: "0.3em", color: "rgba(200,212,232,.25)",
          textTransform: "uppercase",
        }}>Scroll</p>
      </div>
    </section>
  );
}

// ── Our Story ───────────────────────────────────────────────────────
function OurStory() {
  return (
    <section id="story" style={{
      background: "#0D1535",
      padding: "100px 28px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Stars count={45} />
      <Foil art={ConstellationWeb} tier="wm" size={340} x="-10%" y="4%" rotate={-8} drift={40} navy />
      <Foil art={Comet} tier="accent" size={260} x="76%" y="8%" rotate={-16} drift={-34} navy />
      <Foil art={CrescentArc} tier="wm" size={300} x="78%" y="64%" rotate={-6} flip drift={32} navy />
      <div style={{ position: "relative", zIndex: 1 }}>
        <Constellation />

        <div style={{ margin: "44px 0 32px" }}>
          <SectionEyebrow>Our Story</SectionEyebrow>
          <GoldDivider />
        </div>

        {/* Large decorative opening quote */}
        <p style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 90,
          color: "rgba(240,192,96,.06)",
          lineHeight: 0.55,
          userSelect: "none",
        }}>"</p>

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 19,
          fontStyle: "italic",
          fontWeight: 200,
          color: "rgba(200,212,232,.8)",
          maxWidth: 500,
          margin: "0 auto",
          lineHeight: 2.1,
          letterSpacing: "0.02em",
        }}>{CONFIG.story}</p>

        <p style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 90,
          color: "rgba(240,192,96,.06)",
          lineHeight: 0.4,
          userSelect: "none",
          marginTop: 12,
        }}>"</p>

        <div style={{ marginTop: 36 }}>
          <Constellation />
        </div>
      </div>
    </section>
  );
}

// ── Big Day ─────────────────────────────────────────────────────────
function BigDay() {
  const d = CONFIG.weddingDate;
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const cols = [
    { label: "Ceremony", main: dateStr, sub: timeStr },
    { label: "Venue", main: CONFIG.venue, sub: CONFIG.address },
    {
      label: "Location",
      main: "View on Map",
      sub: "Get directions →",
      href: `https://maps.google.com/?q=${encodeURIComponent(CONFIG.venue + " " + CONFIG.address)}`,
    },
  ];

  return (
    <section id="details" style={{
      background: "#07090F",
      padding: "100px 28px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Foil art={NebulaSpiral} tier="wm" size={380} x="-12%" y="10%" rotate={-10} drift={42} />
      <Foil art={StarChart} tier="wm" size={300} x="80%" y="52%" rotate={6} flip drift={-36} />
      <Foil art={Eclipse} tier="accent" size={210} x="86%" y="-6%" rotate={14} drift={30} />

      <SectionEyebrow>The Big Day</SectionEyebrow>
      <GoldDivider />

      <div style={{
        display: "flex",
        flexWrap: "wrap",
        maxWidth: 720,
        margin: "36px auto 0",
      }}>
        {cols.map((col, i) => (
          <div key={i} style={{
            flex: "1 1 200px",
            padding: "36px 24px",
            borderTop: "1px solid rgba(240,192,96,.18)",
            borderRight: i < cols.length - 1
              ? "1px solid rgba(240,192,96,.07)" : "none",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 9,
              letterSpacing: "0.32em",
              color: "#F0C060",
              opacity: 0.55,
              textTransform: "uppercase",
              marginBottom: 18,
            }}>{col.label}</p>

            {col.href ? (
              <a href={col.href} target="_blank" rel="noreferrer"
                className="cel-map"
                style={{
                  fontFamily: "Raleway, sans-serif",
                  fontSize: 15,
                  fontWeight: 300,
                  color: "rgba(200,212,232,.7)",
                  textDecoration: "none",
                  display: "block",
                  marginBottom: 8,
                  letterSpacing: "0.04em",
                  borderBottom: "1px solid rgba(240,192,96,.25)",
                  paddingBottom: 2,
                  width: "fit-content",
                  margin: "0 auto 8px",
                  transition: "color .2s, border-color .2s",
                }}>{col.main}</a>
            ) : (
              <p style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: 15,
                fontWeight: 300,
                color: "rgba(200,212,232,.75)",
                marginBottom: 8,
                lineHeight: 1.65,
                letterSpacing: "0.03em",
              }}>{col.main}</p>
            )}

            <p style={{
              fontFamily: "Raleway, sans-serif",
              fontSize: 12,
              fontWeight: 200,
              color: "rgba(200,212,232,.3)",
              letterSpacing: "0.06em",
              marginTop: col.href ? 8 : 0,
            }}>{col.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Countdown ───────────────────────────────────────────────────────
function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <section id="countdown" style={{
      background: "#0D1535",
      padding: "100px 24px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Stars count={55} />
      <Foil art={Astrolabe} tier="wm" size={620} x="50%" y="50%" drift={16} navy
            style={{ marginLeft: -310, marginTop: -310 }} />
      <Foil art={Orbit} tier="wm" size={300} x="-10%" y="58%" rotate={14} drift={-38} navy />
      <Foil art={ZodiacWheel} tier="wm" size={250} x="84%" y="4%" rotate={-12} flip drift={34} navy />
      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionEyebrow>Until Forever Begins</SectionEyebrow>
        <GoldDivider />

        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          flexWrap: "wrap",
          maxWidth: 660,
          margin: "30px auto 0",
        }}>
          {units.map(({ v, l }, i) => (
            <div key={l} style={{
              flex: "1 1 110px",
              padding: "28px 12px",
              borderLeft: i > 0 ? "1px solid rgba(200,212,232,.08)" : "none",
            }}>
              <p style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "clamp(44px, 11vw, 76px)",
                fontWeight: 400,
                color: "#EEF2F8",
                lineHeight: 1,
                letterSpacing: "0.04em",
              }}>
                {String(v).padStart(2, "0")}
              </p>
              <p style={{
                fontFamily: "Raleway, sans-serif",
                fontSize: 9,
                fontWeight: 300,
                letterSpacing: "0.3em",
                color: "#F0C060",
                opacity: 0.55,
                textTransform: "uppercase",
                marginTop: 12,
              }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Our Song ────────────────────────────────────────────────────────
function OurSong() {
  const [playing, setPlaying] = useState(false);

  return (
    <section style={{
      background: "#07090F",
      padding: "100px 28px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Stars count={35} />
      <Foil art={StarBurst} tier="wm" size={320} x="-10%" y="34%" rotate={-14} drift={44} />
      <Foil art={NebulaSpiral} tier="wm" size={280} x="80%" y="58%" rotate={18} flip drift={-32} />
      <Foil art={StarChart} tier="accent" size={200} x="86%" y="2%" rotate={-8} drift={28} />

      {/* Vinyl record */}
      <div style={{ position: "relative", zIndex: 1, width: 148, height: 148, margin: "0 auto 42px" }}>
        <svg viewBox="0 0 148 148" width="148" height="148"
          style={{ animation: playing ? "spin-slow 9s linear infinite" : "none" }}>
          <circle cx="74" cy="74" r="72" fill="#111627"
            stroke="rgba(200,212,232,.08)" strokeWidth="0.6" />
          {[66, 58, 50, 42, 34, 26].map((r, i) => (
            <circle key={i} cx="74" cy="74" r={r}
              fill="none" stroke="rgba(200,212,232,.04)" strokeWidth="5" />
          ))}
          <circle cx="74" cy="74" r="18" fill="#0D1535"
            stroke="rgba(240,192,96,.28)" strokeWidth="0.8" />
          <circle cx="74" cy="74" r="5" fill="#F0C060" opacity="0.65" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionEyebrow>Our Song</SectionEyebrow>
        <GoldDivider />

        <p style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 26,
          color: "#EEF2F8",
          letterSpacing: "0.1em",
          marginBottom: 7,
        }}>{CONFIG.song}</p>

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 12,
          fontWeight: 200,
          letterSpacing: "0.18em",
          color: "rgba(200,212,232,.35)",
          marginBottom: 30,
        }}>{CONFIG.artist}</p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          {[
            { icon: "⏮", main: false },
            { icon: playing ? "⏸" : "▶", main: true, fn: () => setPlaying((p) => !p) },
            { icon: "⏭", main: false },
          ].map(({ icon, main, fn }, i) => (
            <button key={i} onClick={fn} style={{
              width: main ? 54 : 40,
              height: main ? 54 : 40,
              borderRadius: "50%",
              border: `1px solid ${main ? "rgba(240,192,96,.6)" : "rgba(200,212,232,.18)"}`,
              background: main ? "rgba(240,192,96,.1)" : "transparent",
              color: main ? "#F0C060" : "rgba(200,212,232,.45)",
              fontSize: main ? 22 : 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>{icon}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── RSVP ────────────────────────────────────────────────────────────
function RSVP() {
  const [form, setForm] = useState({ guests: "1", name: "", phone: "", attending: "yes" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* Shared, because the thanks screen is a second return from this same
     component — one decoration written twice would drift apart. */
  const foil = (
    <>
      <Foil art={Eclipse} tier="wm" size={360} x="-12%" y="6%" rotate={-8} drift={40} navy />
      <Foil art={Comet} tier="accent" size={250} x="78%" y="58%" rotate={14} flip drift={-34} navy />
      <Foil art={Orbit} tier="wm" size={300} x="76%" y="-8%" rotate={-16} drift={30} navy />
    </>
  );

  if (submitted) {
    return (
      <section id="rsvp" style={{
        background: "#0D1535",
        padding: "110px 28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <Stars count={45} />
        {foil}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 42, marginBottom: 22, opacity: 0.8 }}>✦</p>
          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26,
            color: "#EEF2F8",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}>Thank you, {form.name}</p>
          <GoldDivider />
          <p style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 17,
            fontStyle: "italic",
            fontWeight: 200,
            color: "rgba(200,212,232,.6)",
            lineHeight: 1.9,
            maxWidth: 380,
            margin: "0 auto",
          }}>
            {form.attending === "yes"
              ? "We can't wait to celebrate with you under the stars."
              : "We'll miss you, but thank you for letting us know."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" style={{
      background: "#0D1535",
      padding: "100px 28px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Stars count={45} />
      {foil}
      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionEyebrow>Kindly RSVP</SectionEyebrow>
        <GoldDivider />

        <div style={{ maxWidth: 390, margin: "26px auto 0", display: "flex", flexDirection: "column", gap: 10 }}>
          <select className="cel-field" value={form.guests}
            onChange={(e) => set("guests", e.target.value)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
            ))}
          </select>

          <input className="cel-field" placeholder="Full Name"
            value={form.name} onChange={(e) => set("name", e.target.value)} />

          <input className="cel-field" placeholder="Phone Number"
            value={form.phone} onChange={(e) => set("phone", e.target.value)} />

          {[
            { val: "yes", label: "Accepts with Pleasure" },
            { val: "no", label: "Declines with Regret" },
          ].map(({ val, label }) => {
            const active = form.attending === val;
            return (
              <button key={val} className="cel-opt" onClick={() => set("attending", val)}
                style={{
                  padding: "13px 16px",
                  border: `1px solid ${active ? "rgba(240,192,96,.65)" : "rgba(200,212,232,.14)"}`,
                  background: active ? "rgba(240,192,96,.07)" : "transparent",
                  color: active ? "#F0C060" : "rgba(200,212,232,.45)",
                  fontFamily: "Raleway, sans-serif",
                  fontSize: 11,
                  fontWeight: 300,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all .2s",
                }}>
                <span style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `1px solid ${active ? "#F0C060" : "rgba(200,212,232,.3)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {active && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F0C060" }} />
                  )}
                </span>
                {label}
              </button>
            );
          })}

          <button
            className="cel-ghost-btn"
            onClick={() => {
              if (!form.name.trim()) return alert("Please enter your name.");
              setSubmitted(true);
            }}
            style={{
              padding: "14px",
              background: "transparent",
              border: "1px solid rgba(240,192,96,.45)",
              color: "rgba(240,192,96,.75)",
              fontFamily: "Cormorant Garamond, serif",
              fontSize: 9.5,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              cursor: "pointer",
              marginTop: 4,
            }}>
            Submit RSVP
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: "radial-gradient(ellipse at 50% 100%, #131B38 0%, #07090F 65%)",
      padding: "80px 28px 60px",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <Stars count={70} />
      <Foil art={ZodiacWheel} tier="wm" size={560} x="50%" y="40%" drift={18}
            style={{ marginLeft: -280, marginTop: -280 }} />
      <Foil art={CrescentArc} tier="accent" size={260} x="-8%" y="6%" rotate={-12} drift={36} />
      <Foil art={ConstellationWeb} tier="wm" size={300} x="82%" y="52%" rotate={10} flip drift={-30} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <CrescentMoon size={88} />

        <div style={{ marginTop: 24 }}>
          <Monogram size={116} initials={CONFIG.initials} bg="#0C1226" />

          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26,
            color: "#EEF2F8",
            letterSpacing: "0.04em",
            marginTop: 18,
            marginBottom: 4,
          }}>Thank You</p>

          <GoldDivider />

          <p style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: 16,
            fontStyle: "italic",
            fontWeight: 200,
            color: "rgba(200,212,232,.45)",
            maxWidth: 320,
            margin: "0 auto",
            lineHeight: 1.9,
            letterSpacing: "0.03em",
          }}>for celebrating this celestial union with us</p>

          <p style={{
            marginTop: 52,
            fontFamily: "Raleway, sans-serif",
            fontSize: 9,
            letterSpacing: "0.22em",
            color: "rgba(200,212,232,.18)",
            textTransform: "uppercase",
          }}>
            {CONFIG.bride} & {CONFIG.groom} · {CONFIG.weddingDate.getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Root ─────────────────────────────────────────────────────────────
export default function CelestialWedding() {
  return (
    <div className="cel">
      <Hero />
      <OurStory />
      <BigDay />
      <Countdown />
      <OurSong />
      <RSVP />
      <Footer />
    </div>
  );
}
