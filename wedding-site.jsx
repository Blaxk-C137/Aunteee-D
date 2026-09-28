import { useState, useEffect, useLayoutEffect, useRef } from "react";

// ─── EDIT THESE ───────────────────────────────────────────────────
const CONFIG = {
  bride: "Bride Name",
  groom: "Groom Name",
  initials: "B & G",
  weddingDate: new Date("2025-12-20T16:00:00"),
  venue: "Royal Gardens Hall",
  address: "Kano, Nigeria",
  story:
    "Two hearts, one journey. We met, we laughed, we dreamed — and now we say forever. We can't wait to celebrate this special day with you.",
  song: "Perfect",
  artist: "Ed Sheeran",
};
// ──────────────────────────────────────────────────────────────────

// Inject fonts & global resets once
if (!document.getElementById("wf-init")) {
  const link = document.createElement("link");
  link.id = "wf-init";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Great+Vibes&family=Montserrat:wght@300;400;500&family=Parisienne&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.innerHTML = `
    .wf-root *, .wf-root *::before, .wf-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
    /* Off-edge botanicals hang past the trim by design. clip rather than
       hidden, because hidden makes this a scroll container and a panel
       that is its own scroll container swallows the scrollIntoView() the
       hero's own button depends on. */
    .wf-root { font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; overflow-x: clip; }
    .wf-root input, .wf-root select {
      width: 100%;
      padding: 13px 15px;
      background: #fff;
      border: 1px solid rgba(92,22,38,0.22);
      border-radius: 0;
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      color: #2A0C14;
      outline: none;
      appearance: none;
      transition: border-color 0.2s;
    }
    .wf-root input:focus, .wf-root select:focus { border-color: #C9A44A; }
    .wf-root input::placeholder { color: rgba(42,12,20,0.38); }
    .wf-hero-btn:hover { opacity: 0.88; }
    .wf-submit-btn:hover { background: #5C1626 !important; }
    .wf-map-link:hover { background: #5C1626 !important; color: #F5EDD8 !important; }

    /* ── the three voices ────────────────────────────────────────────
       Cormorant Garamond speaks the names, Parisienne appears exactly
       once on the word "and", Montserrat carries everything that has
       to be read. */
    .wf-name {
      font-family: 'Cormorant Garamond', Didot, 'Times New Roman', serif;
      font-weight: 400;
      font-size: clamp(2.85rem, 13.5vw, 5.5rem);
      line-height: 1.04;
      letter-spacing: .02em;
    }
    .wf-script {
      font-family: 'Parisienne', 'Allura', cursive;
      font-weight: 400;
      font-size: clamp(1.75rem, 6.5vw, 2.5rem);
      line-height: 1.15;
    }
    /* "and", ruled in from both sides so the word sits inside the
       page's ornament instead of floating in the gap between names. */
    .wf-and {
      display: flex; align-items: center; justify-content: center;
      gap: clamp(.75rem, 3vw, 1.15rem);
      margin: .42em 0 .5em;
    }
    .wf-and i {
      flex: 0 0 auto; width: clamp(2rem, 10vw, 4.25rem); height: 1px;
      background: linear-gradient(90deg, transparent, rgba(201,164,74,.55));
    }
    .wf-and i:last-child {
      background: linear-gradient(90deg, rgba(201,164,74,.55), transparent);
    }

    /* ── the foil ────────────────────────────────────────────────────
       Gold botanical line work, admitted on three conditions: it never
       sits where text sits, it never moves on its own, and it is drawn
       rather than placed.

       Three tiers, by how much attention each is allowed:
         --wm      a watermark, large and barely there, drifting against
                   the scroll so the ground has some depth behind it
         --accent  visible line work, close enough to the words to be read
         --inline  the only tier that goes near the type, so it stays
                   small and lives at the edge of a rule

       A tier sets --foil-o and nothing else. How an ornament arrives is
       its own business, drawn at random when it mounts — see REVEALS. */
    /* Every section is the containing block and its own stacking context,
       so the foil's z-index:-1 lands above that section's background but
       below its words. Without the isolation the negative index would
       drop the ornament behind the section's own background and nothing
       would show. */
    .wf-root section { position: relative; isolation: isolate; }
    .wf-foil {
      position: absolute; inset: 0; z-index: -1; overflow: hidden;
      pointer-events: none; color: #C9A44A;
      --foil-o: .07;
      --rv-dur: 1.5s; --rv-delay: 0s; --rv-step: .1s;
      --rv-ease: cubic-bezier(.42,0,.2,1);
    }
    .wf-foil--wm { --foil-o: .07; }
    .wf-foil--accent { --foil-o: .3; }
    .wf-foil--inline { --foil-o: .5; }
    /* Translucent gold over wine turns olive and stops reading as metal,
       so the wine panels take the light gold instead. */
    .wf-foil--dark { color: #E8C97A; }
    .wf-foil--dark.wf-foil--wm { --foil-o: .075; }

    /* The entrance sits on its own element so it can own opacity,
       transform and clip-path without fighting the two transforms that
       already exist: the ornament's fixed orientation on the span above
       it, and the drift on the svg below.

       Every transition here runs in both directions, which is the whole
       point — scrolling back up rewinds the ornament rather than leaving
       it lit. */
    .wf-foil-rv {
      display: block; width: 100%; height: 100%;
      opacity: 0; transform-origin: 50% 100%;
      transition:
        opacity var(--rv-dur) var(--rv-ease) var(--rv-delay),
        transform var(--rv-dur) var(--rv-ease) var(--rv-delay),
        clip-path var(--rv-dur) var(--rv-ease) var(--rv-delay);
    }
    .wf-foil.is-in .wf-foil-rv {
      opacity: var(--foil-o); transform: none; clip-path: inset(0 0 0 0);
    }

    /* Where each ornament comes from. Picked per ornament, not per tier,
       so nothing on the page arrives the way its neighbour did. */
    .wf-rv--rise { transform: translate3d(0,46px,0); }
    .wf-rv--settle { transform: translate3d(0,-42px,0); }
    .wf-rv--slide { transform: translate3d(-52px,0,0); }
    .wf-rv--slide-r { transform: translate3d(52px,0,0); }
    .wf-rv--bloom { transform: scale(.8); transform-origin: 50% 50%; }
    .wf-rv--unfurl { transform: scaleY(.08); }
    .wf-rv--sway { transform: rotate(-9deg); }
    /* A wipe is a wipe and not a fade, so these hold the tier's opacity
       throughout and only their clip-path moves — the rewind is then a
       wipe back rather than a dissolve. */
    .wf-rv--wipe, .wf-rv--wipe-r, .wf-rv--wipe-d, .wf-rv--wipe-u { opacity: var(--foil-o); }
    .wf-rv--wipe { clip-path: inset(0 100% 0 0); }
    .wf-rv--wipe-r { clip-path: inset(0 0 0 100%); }
    .wf-rv--wipe-d { clip-path: inset(0 0 100% 0); }
    .wf-rv--wipe-u { clip-path: inset(100% 0 0 0); }

    /* The drift. --p is written by the page's single scroll loop and runs
       about -1 below the fold to 1 above it, so every ornament on the
       page shares one measurement — which is what lets that loop do all
       of its reading before it does any writing. */
    .wf-foil-art {
      width: 100%; height: 100%; display: block;
      transform: translate3d(0, calc(var(--p,0) * var(--drift,0px)), 0);
    }

    /* Drawing, not appearing. Every drawable shape in the set carries
       pathLength="1", which normalises its length to 1 whatever its real
       geometry — so this one dash rule draws any of them and nothing has
       to be measured with getTotalLength(). The stagger is nth-child and
       the step is random per ornament, so two fronds never fill in at
       the same rhythm. */
    .wf-line path, .wf-line circle, .wf-line ellipse, .wf-line line,
    .wf-line-r path, .wf-line-r circle, .wf-line-r ellipse, .wf-line-r line {
      stroke-dasharray: 1; stroke-dashoffset: 1;
    }
    /* the same stroke drawn from its far end */
    .wf-line-r path, .wf-line-r circle, .wf-line-r ellipse, .wf-line-r line { stroke-dashoffset: -1; }

    .is-in .wf-line path, .is-in .wf-line circle,
    .is-in .wf-line ellipse, .is-in .wf-line line,
    .is-in .wf-line-r path, .is-in .wf-line-r circle,
    .is-in .wf-line-r ellipse, .is-in .wf-line-r line {
      animation: wf-stroke var(--rv-dur) var(--rv-ease) var(--rv-delay) forwards;
    }
    .is-in .wf-line *:nth-child(2), .is-in .wf-line-r *:nth-child(2) { animation-delay: calc(var(--rv-delay) + var(--rv-step)); }
    .is-in .wf-line *:nth-child(3), .is-in .wf-line-r *:nth-child(3) { animation-delay: calc(var(--rv-delay) + var(--rv-step) * 2); }
    .is-in .wf-line *:nth-child(4), .is-in .wf-line-r *:nth-child(4) { animation-delay: calc(var(--rv-delay) + var(--rv-step) * 3); }
    .is-in .wf-line *:nth-child(5), .is-in .wf-line-r *:nth-child(5) { animation-delay: calc(var(--rv-delay) + var(--rv-step) * 4); }
    .is-in .wf-line *:nth-child(6), .is-in .wf-line-r *:nth-child(6) { animation-delay: calc(var(--rv-delay) + var(--rv-step) * 5); }
    .is-in .wf-line *:nth-child(n+7), .is-in .wf-line-r *:nth-child(n+7) { animation-delay: calc(var(--rv-delay) + var(--rv-step) * 6); }
    @keyframes wf-stroke { to { stroke-dashoffset: 0; } }

    @media (prefers-reduced-motion: reduce) {
      .wf-foil-rv { transition: none; opacity: var(--foil-o); transform: none; clip-path: none; }
      .is-in .wf-line path, .is-in .wf-line circle, .is-in .wf-line ellipse, .is-in .wf-line line,
      .is-in .wf-line-r path, .is-in .wf-line-r circle, .is-in .wf-line-r ellipse, .is-in .wf-line-r line {
        animation: none; stroke-dashoffset: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// ═══════════════════════════════════════════════════════════════════
//  The foil engine
//
//  A dozen botanicals, each revealing as it enters and retiring as it
//  leaves, is more animation than it sounds, and the naive way to do the
//  drift is a listener per ornament. At that many that is that many
//  getBoundingClientRect() calls interleaved with as many style writes —
//  read, write, read, write — and each write invalidates the layout the
//  next read was about to do. So instead they all register here, and the
//  loop below measures everything before it touches anything.
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

   `dark` picks the light gold, for the wine panels.
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
  dark = false,
  inline = false,
  style,
}) {
  const [ref, shown] = useFoil(drift);
  const [rv] = useState(pickReveal);

  const draws = rv.k === "line" || rv.k === "line-r";
  const svgCls = `wf-foil-art${draws ? ` wf-${rv.k}` : ""}`;

  return (
    <span
      ref={ref}
      className={`wf-foil wf-foil--${tier}${dark ? " wf-foil--dark" : ""}${shown ? " is-in" : ""}`}
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
      <span className={`wf-foil-rv wf-rv--${rv.k}`}>
        <Art className={svgCls} />
      </span>
    </span>
  );
}

// ── The botanical vocabulary ────────────────────────────────────────
//  Ten motifs, all stroke art in currentColor, so one set wears gold on
//  the cream panels and light gold on the wine ones. Nothing here is
//  filled: at seven per cent opacity a fill turns to mud where a line
//  still reads as a line.
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

// ── Shared atoms ────────────────────────────────────────────────────
const Divider = ({ light }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "16px auto",
      width: "fit-content",
    }}
  >
    <div
      style={{
        width: 38,
        height: 1,
        background: light ? "rgba(201,164,74,0.55)" : "#C9A44A",
      }}
    />
    <div
      style={{
        width: 6,
        height: 6,
        background: light ? "rgba(201,164,74,0.55)" : "#C9A44A",
        transform: "rotate(45deg)",
      }}
    />
    <div
      style={{
        width: 38,
        height: 1,
        background: light ? "rgba(201,164,74,0.55)" : "#C9A44A",
      }}
    />
  </div>
);

const Eyebrow = ({ children, light }) => (
  <p
    style={{
      fontFamily: "Montserrat, sans-serif",
      fontSize: 10,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: light ? "rgba(245,237,216,0.55)" : "rgba(92,22,38,0.45)",
      marginBottom: 4,
    }}
  >
    {children}
  </p>
);

// ── Monogram circle ─────────────────────────────────────────────────
// ── Monogram ────────────────────────────────────────────────────────
//  The couple's two initials interlocked.
//
//  CONFIG.initials arrives as "B & G": initials *and* their separator,
//  so the letters are pulled out of it rather than drawn whole.
//
//  The interlock is the engraver's trick. The second letter is stroked
//  in the panel's own colour before its fill is laid down, which opens
//  a hairline gap through the first wherever the two cross. The pair
//  then reads as one woven mark instead of two letters set side by
//  side. A ring around it only turns it back into a logo.
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

function Monogram({ size = "clamp(104px,30vw,136px)", initials, fill = "#E8C97A", bg = "#400C15" }) {
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

// ── Sections ────────────────────────────────────────────────────────
function Hero() {
  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const dateDisplay = CONFIG.weddingDate
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <section
      id="hero"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #7A1E32 0%, #3D0A13 55%, #5C1626 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "70px 28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Foil art={WreathRing} tier="wm" size={780} x="50%" y="50%" drift={26} dark
            style={{ marginLeft: -390, marginTop: -390 }} />
      <Foil art={BlossomSpray} tier="accent" size={360} x="-8%" y="4%" rotate={-6} drift={60} dark />
      <Foil art={LeafFrond} tier="wm" size={320} x="76%" y="56%" rotate={10} flip drift={-54} dark />
      <Foil art={SingleBloom} tier="wm" size={200} x="2%" y="72%" rotate={10} drift={36} dark />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Monogram initials={CONFIG.initials} bg="#400C15" />

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            letterSpacing: "0.32em",
            fontWeight: 400,
            color: "rgba(245,237,216,0.55)",
            margin: "30px 0 22px",
            textTransform: "uppercase",
          }}
        >
          Together with their families
        </p>

        <h1 className="wf-name" style={{ color: "#F5EDD8", marginTop: "1.6rem" }}>
          {CONFIG.bride}
        </h1>

        <div className="wf-and" aria-hidden="true">
          <i />
          <span className="wf-script" style={{ color: "#C9A44A" }}>
            and
          </span>
          <i />
        </div>

        <h1 className="wf-name" style={{ color: "#F5EDD8" }}>
          {CONFIG.groom}
        </h1>

        <Divider light />

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            letterSpacing: "0.24em",
            fontWeight: 400,
            color: "rgba(245,237,216,0.65)",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Invite you to celebrate their wedding
        </p>

        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 17,
            color: "#E8C97A",
            letterSpacing: "0.18em",
            marginBottom: 44,
          }}
        >
          {dateDisplay}
        </p>

        <button
          className="wf-hero-btn"
          onClick={() => scrollTo("story")}
          style={{
            background: "linear-gradient(135deg, #C9A44A 0%, #E8C97A 100%)",
            color: "#3D0A13",
            border: "none",
            padding: "15px 46px",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 1,
            transition: "opacity 0.2s",
          }}
        >
          Open Invitation
        </button>
      </div>
    </section>
  );
}

function OurStory() {
  return (
    <section
      id="story"
      style={{
        background: "#F5EDD8",
        padding: "90px 28px",
        textAlign: "center",
        position: "relative",
      }}
    >
      <Foil art={BudCluster} tier="accent" size={250} x="-7%" y="6%" rotate={-10} drift={44} />
      <Foil art={FernCurl} tier="wm" size={310} x="74%" y="44%" rotate={-14} flip drift={-38} />

      <Eyebrow>Our Story</Eyebrow>
      <Divider />
      <p
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 22,
          fontStyle: "italic",
          fontWeight: 300,
          color: "#3D0A13",
          maxWidth: 440,
          margin: "8px auto 0",
          lineHeight: 1.85,
        }}
      >
        {CONFIG.story}
      </p>
      <p style={{ marginTop: 20, color: "#C9A44A", fontSize: 22 }}>♥</p>
    </section>
  );
}

function BigDay() {
  const d = CONFIG.weddingDate;
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const cols = [
    {
      icon: "◻",
      label: "Date & Time",
      content: (
        <>
          {dateStr}
          <br />
          <span style={{ opacity: 0.6 }}>{timeStr}</span>
        </>
      ),
    },
    {
      icon: "◻",
      label: "Venue",
      content: (
        <>
          {CONFIG.venue}
          <br />
          <span style={{ fontSize: 12, opacity: 0.55 }}>{CONFIG.address}</span>
        </>
      ),
    },
    {
      icon: "◻",
      label: "Location",
      content: (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            CONFIG.venue + " " + CONFIG.address
          )}`}
          target="_blank"
          rel="noreferrer"
          className="wf-map-link"
          style={{
            display: "inline-block",
            marginTop: 6,
            padding: "9px 20px",
            border: "1px solid #5C1626",
            color: "#5C1626",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
        >
          View on Map
        </a>
      ),
    },
  ];

  return (
    <section
      id="details"
      style={{
        background: "#EDE0C5",
        padding: "90px 28px",
        textAlign: "center",
      }}
    >
      <Foil art={LaurelArc} tier="accent" size={290} x="-6%" y="60%" rotate={-4} drift={-40} />
      <Foil art={LeafFrond} tier="wm" size={320} x="78%" y="-4%" rotate={12} flip drift={50} />
      <Foil art={SingleBloom} tier="wm" size={200} x="3%" y="6%" rotate={-8} drift={30} />

      <Eyebrow>The Big Day</Eyebrow>
      <Divider />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: 640,
          margin: "28px auto 0",
        }}
      >
        {cols.map((col, i) => (
          <div
            key={i}
            style={{
              flex: "1 1 160px",
              padding: "28px 20px",
              borderRight:
                i < cols.length - 1
                  ? "1px solid rgba(92,22,38,0.12)"
                  : "none",
            }}
          >
            <p
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: 14,
                color: "#3D0A13",
                lineHeight: 1.7,
              }}
            >
              {col.content}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Countdown() {
  const t = useCountdown(CONFIG.weddingDate);
  const boxes = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];

  return (
    <section
      id="countdown"
      style={{
        background:
          "linear-gradient(160deg, #3D0A13 0%, #5C1626 80%, #4A1020 100%)",
        padding: "90px 28px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Foil art={WreathRing} tier="wm" size={620} x="50%" y="50%" drift={22} dark
            style={{ marginLeft: -310, marginTop: -310 }} />
      <Foil art={FernCurl} tier="wm" size={250} x="80%" y="62%" rotate={-20} flip drift={-34} dark />
      <Foil art={BlossomSpray} tier="wm" size={240} x="-5%" y="6%" rotate={8} drift={36} dark />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Eyebrow light>Countdown</Eyebrow>
        <Divider light />
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 20,
            flexWrap: "wrap",
          }}
        >
          {boxes.map(({ v, l }) => (
            <div
              key={l}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,164,74,0.32)",
                padding: "18px 14px",
                minWidth: 72,
              }}
            >
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "clamp(30px, 8vw, 48px)",
                  color: "#E8C97A",
                  lineHeight: 1,
                }}
              >
                {String(v).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "rgba(245,237,216,0.45)",
                  marginTop: 7,
                  textTransform: "uppercase",
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurSong() {
  const [playing, setPlaying] = useState(false);
  const controls = [
    { icon: "⏮", small: true },
    { icon: playing ? "⏸" : "▶", small: false, action: () => setPlaying((p) => !p) },
    { icon: "⏭", small: true },
  ];

  return (
    <section
      style={{
        background: "#5C1626",
        borderTop: "1px solid rgba(201,164,74,0.18)",
        borderBottom: "1px solid rgba(201,164,74,0.18)",
        padding: "90px 28px",
        textAlign: "center",
      }}
    >
      <Foil art={BlossomSpray} tier="accent" size={250} x="-7%" y="4%" rotate={-12} drift={40} dark />
      <Foil art={LeafFrond} tier="wm" size={300} x="84%" y="58%" rotate={24} flip drift={-30} dark />
      <Foil art={BudCluster} tier="wm" size={230} x="70%" y="-8%" rotate={16} drift={28} dark />

      <Eyebrow light>Our Song</Eyebrow>
      <Divider light />
      <p
        style={{
          fontFamily: "Cormorant Garamond, serif",
          fontSize: 26,
          color: "#F5EDD8",
          margin: "14px 0 5px",
        }}
      >
        {CONFIG.song}
      </p>
      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "rgba(245,237,216,0.45)",
        }}
      >
        {CONFIG.artist}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          marginTop: 28,
        }}
      >
        {controls.map(({ icon, small, action }, i) => (
          <button
            key={i}
            onClick={action}
            style={{
              width: small ? 38 : 50,
              height: small ? 38 : 50,
              borderRadius: "50%",
              border: "1px solid rgba(201,164,74,0.35)",
              background: small
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg,#C9A44A,#E8C97A)",
              color: small ? "#C9A44A" : "#3D0A13",
              fontSize: small ? 14 : 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </button>
        ))}
      </div>
    </section>
  );
}

function RSVP() {
  const [form, setForm] = useState({
    guests: "1",
    name: "",
    phone: "",
    attending: "yes",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* Shared, because the thanks screen is a second return from this same
     component — one decoration written twice would drift apart. */
  const foil = (
    <>
      <Foil art={LaurelArc} tier="accent" size={280} x="-8%" y="2%" rotate={-8} drift={38} />
      <Foil art={FernCurl} tier="wm" size={300} x="82%" y="50%" rotate={18} flip drift={-32} />
    </>
  );

  if (submitted) {
    return (
      <section
        id="rsvp"
        style={{
          background: "#F5EDD8",
          padding: "90px 28px",
          textAlign: "center",
        }}
      >
        {foil}
        <div style={{ fontSize: 42, marginBottom: 18 }}>💌</div>
        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26,
            color: "#3D0A13",
            marginBottom: 6,
          }}
        >
          Thank you, {form.name}!
        </p>
        <Divider />
        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 20,
            fontStyle: "italic",
            color: "#5C1626",
            lineHeight: 1.6,
          }}
        >
          {form.attending === "yes"
            ? "We can't wait to celebrate with you!"
            : "We'll miss you, but thank you for letting us know."}
        </p>
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      style={{
        background: "#F5EDD8",
        padding: "90px 28px",
        textAlign: "center",
      }}
    >
      {foil}
      <Eyebrow>Kindly RSVP</Eyebrow>
      <Divider />
      <div
        style={{
          maxWidth: 380,
          margin: "24px auto 0",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <select
          value={form.guests}
          onChange={(e) => set("guests", e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
        />

        {[
          { val: "yes", label: "Accepts with Pleasure" },
          { val: "no", label: "Declines with Regret" },
        ].map(({ val, label }) => {
          const active = form.attending === val;
          return (
            <button
              key={val}
              onClick={() => set("attending", val)}
              style={{
                padding: "13px 16px",
                border: `1px solid ${
                  active ? "#5C1626" : "rgba(92,22,38,0.2)"
                }`,
                background: active ? "#5C1626" : "#fff",
                color: active ? "#F5EDD8" : "#2A0C14",
                fontFamily: "Montserrat, sans-serif",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all 0.18s",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: `1.5px solid ${active ? "#F5EDD8" : "rgba(92,22,38,0.35)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {active && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#F5EDD8",
                    }}
                  />
                )}
              </span>
              {label}
            </button>
          );
        })}

        <button
          className="wf-submit-btn"
          onClick={() => {
            if (!form.name.trim()) return alert("Please enter your name.");
            setSubmitted(true);
          }}
          style={{
            padding: "15px",
            background: "#3D0A13",
            color: "#E8C97A",
            border: "none",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: 4,
            transition: "background 0.18s",
          }}
        >
          Submit RSVP
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        background:
          "radial-gradient(ellipse at 70% 80%, #7A1E32 0%, #3D0A13 60%, #5C1626 100%)",
        padding: "80px 28px 60px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Foil art={WreathRing} tier="wm" size={640} x="50%" y="46%" drift={20} dark
            style={{ marginLeft: -320, marginTop: -320 }} />
      <Foil art={BlossomSpray} tier="wm" size={250} x="-6%" y="10%" rotate={-14} drift={34} dark />
      <Foil art={LeafFrond} tier="wm" size={280} x="84%" y="52%" rotate={20} flip drift={-28} dark />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Monogram size={124} initials={CONFIG.initials} bg="#3D0A13" />

        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 26,
            color: "#F5EDD8",
            margin: "22px 0 0",
          }}
        >
          Thank You
        </p>
        <Divider light />
        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 17,
            fontStyle: "italic",
            fontWeight: 300,
            color: "rgba(245,237,216,0.65)",
            maxWidth: 300,
            margin: "0 auto",
            lineHeight: 1.7,
          }}
        >
          for celebrating this unforgettable moment with us.
        </p>

        <p
          style={{
            marginTop: 48,
            fontFamily: "Montserrat, sans-serif",
            fontSize: 9,
            letterSpacing: "0.18em",
            color: "rgba(245,237,216,0.25)",
            textTransform: "uppercase",
          }}
        >
          {CONFIG.bride} & {CONFIG.groom} ·{" "}
          {CONFIG.weddingDate.getFullYear()}
        </p>
      </div>
    </footer>
  );
}

// ── Root ────────────────────────────────────────────────────────────
export default function WeddingSite() {
  return (
    <div className="wf-root">
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
