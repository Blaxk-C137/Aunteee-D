export const PETAL = "M50 50C43 39 44 26 50 17c6 9 7 22 0 33Z";

/* One leaf, drawn from its stem at the origin up and to the right. Placed
   by transform wherever a leaf is wanted — the frond hangs a dozen off a
   rib, the wreath sets thirty round a ring — so every leaf on the page is
   the same leaf. */
export const LEAF = "M0 0C7 -2 13 -8 15 -17C7 -13 2 -6 0 0Z";

/* One bloom, from which every flower on the page is built: the spray,
   the single bloom and the bud cluster all use it, so the ornament reads
   as one hand rather than as ten separate drawings. */
export const Bloom = ({ cx = 50, cy = 50, s = 1, petals = 5 }) => (
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

export const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: ".85",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export const BlossomSpray = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M3 98C17 82 29 63 39 43 48 25 59 13 73 7" />
    <path pathLength="1" d="M37 57C28 52 19 52 10 57c8 7 19 9 27 0Z" />
    <path pathLength="1" d="M49 37c9-7 19-9 29-7-5 9-18 13-29 7Z" />
    <path pathLength="1" d="M61 19c-3-8-1-14 5-18 5 7 3 14-5 18Z" />
    <Bloom cx={79} cy={8} s={.44} />
  </svg>
);

export const LeafFrond = (p) => (
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
export const LaurelArc = (p) => (
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

export const SingleBloom = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <Bloom cx={50} cy={44} s={1.5} />
    <path pathLength="1" d="M50 96C50 78 48 66 42 56" />
    <path pathLength="1" d="M46 72C38 69 30 70 22 76c9 5 18 3 24-4Z" />
    <path pathLength="1" d="M48 84c8-4 17-3 24 3-8 5-18 3-24-3Z" />
    <path pathLength="1" d="M50 20V2M41 24l-8-15M59 24l8-15" />
  </svg>
);

export const BudCluster = (p) => (
  <svg viewBox="0 0 100 100" {...svgProps} {...p}>
    <path pathLength="1" d="M14 98C26 82 36 66 44 48 51 33 58 20 66 10" />
    <path pathLength="1" d="M42 56c-7-4-15-4-22 1 7 6 16 6 22-1Z" />
    <path pathLength="1" d="M52 36c7-5 15-6 22-2-6 7-16 8-22 2Z" />
    <Bloom cx={70} cy={8} s={.34} petals={5} />
    <Bloom cx={38} cy={30} s={.26} petals={5} />
    <path pathLength="1" d="M30 46c-4-4-9-6-15-5 3 6 9 8 15 5Z" />
  </svg>
);

export const FernCurl = (p) => {
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

export const SeedPod = (p) => (
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
export const WreathRing = (p) => {
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
