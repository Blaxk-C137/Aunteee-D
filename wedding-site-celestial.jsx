import { useState, useEffect, useMemo } from "react";

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
    "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cinzel+Decorative:wght@400&family=Raleway:ital,wght@0,200;0,300;0,400;1,200;1,300&display=swap";
  document.head.appendChild(l);
}
if (!document.getElementById("cel-css")) {
  const s = document.createElement("style");
  s.id = "cel-css";
  s.innerHTML = `
    @keyframes twinkle { 0%,100%{opacity:.12} 50%{opacity:.85} }
    @keyframes spin-slow { to{transform:rotate(360deg)} }
    @keyframes fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .cel*,.cel *::before,.cel *::after{box-sizing:border-box;margin:0;padding:0}
    .cel{font-family:'Raleway',sans-serif;-webkit-font-smoothing:antialiased;background:#07090F}
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
  `;
  document.head.appendChild(s);
}

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

// ── Astrolabe ring SVG ──────────────────────────────────────────────
function AstrolabeRing() {
  const size = 400;
  const cx = size / 2;
  const outerR = cx - 4;

  const ticks = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const isMajor = i % 12 === 0;
    const isMed = i % 4 === 0;
    const len = isMajor ? 18 : isMed ? 10 : 5;
    return {
      x1: cx + outerR * Math.cos(angle),
      y1: cx + outerR * Math.sin(angle),
      x2: cx + (outerR - len) * Math.cos(angle),
      y2: cx + (outerR - len) * Math.sin(angle),
      isMajor,
      isMed,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Rings */}
      <circle cx={cx} cy={cx} r={outerR} stroke="rgba(240,192,96,.2)" strokeWidth="0.8" fill="none" />
      <circle cx={cx} cy={cx} r={outerR - 22} stroke="rgba(240,192,96,.08)" strokeWidth="0.5" fill="none" />
      <circle cx={cx} cy={cx} r={outerR - 38} stroke="rgba(200,212,232,.05)" strokeWidth="0.4" fill="none" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={
            t.isMajor
              ? "rgba(240,192,96,.65)"
              : t.isMed
              ? "rgba(200,212,232,.22)"
              : "rgba(200,212,232,.08)"
          }
          strokeWidth={t.isMajor ? 1.3 : 0.6}
        />
      ))}

      {/* Cardinal star markers */}
      {[0, 90, 180, 270].map((deg) => {
        const a = (deg - 90) * (Math.PI / 180);
        const r = outerR + 14;
        return (
          <text key={deg} x={cx + r * Math.cos(a)} y={cx + r * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fontSize="12" fill="rgba(240,192,96,.55)">
            ✦
          </text>
        );
      })}
    </svg>
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
    fontFamily: "Cinzel, serif",
    fontSize: 9.5,
    letterSpacing: "0.32em",
    color: "#F0C060",
    textTransform: "uppercase",
    opacity: 0.65,
    marginBottom: 2,
  }}>{children}</p>
);

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
      <AstrolabeRing />

      <div style={{ position: "relative", zIndex: 2, animation: "fadein 1.2s ease both" }}>
        {/* Monogram */}
        <p style={{
          fontFamily: "Cinzel Decorative, serif",
          fontSize: 15,
          color: "#F0C060",
          letterSpacing: "0.32em",
          marginBottom: 32,
          opacity: 0.8,
        }}>
          {CONFIG.initials}
        </p>

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 9,
          letterSpacing: "0.38em",
          color: "rgba(200,212,232,.4)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>Together with their families</p>

        <h1 style={{
          fontFamily: "Cinzel, serif",
          fontSize: "clamp(38px, 9.5vw, 70px)",
          color: "#EEF2F8",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "0.14em",
        }}>{CONFIG.bride}</h1>

        <p style={{
          fontFamily: "Raleway, sans-serif",
          fontSize: 13,
          fontStyle: "italic",
          fontWeight: 200,
          color: "#F0C060",
          letterSpacing: "0.45em",
          margin: "14px 0",
        }}>& </p>

        <h1 style={{
          fontFamily: "Cinzel, serif",
          fontSize: "clamp(38px, 9.5vw, 70px)",
          color: "#EEF2F8",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "0.14em",
        }}>{CONFIG.groom}</h1>

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
            fontFamily: "Cinzel, serif",
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
      <div style={{ position: "relative", zIndex: 1 }}>
        <Constellation />

        <div style={{ margin: "44px 0 32px" }}>
          <SectionEyebrow>Our Story</SectionEyebrow>
          <GoldDivider />
        </div>

        {/* Large decorative opening quote */}
        <p style={{
          fontFamily: "Cinzel, serif",
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
          fontFamily: "Cinzel, serif",
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
    }}>
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
              fontFamily: "Cinzel, serif",
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
                fontFamily: "Cinzel, serif",
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
          fontFamily: "Cinzel, serif",
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
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 42, marginBottom: 22, opacity: 0.8 }}>✦</p>
          <p style={{
            fontFamily: "Cinzel, serif",
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
              fontFamily: "Cinzel, serif",
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
      <div style={{ position: "relative", zIndex: 1 }}>
        <CrescentMoon size={104} />

        <div style={{ marginTop: 28 }}>
          <p style={{
            fontFamily: "Cinzel Decorative, serif",
            fontSize: 14,
            color: "#F0C060",
            letterSpacing: "0.32em",
            marginBottom: 22,
            opacity: 0.75,
          }}>{CONFIG.initials}</p>

          <p style={{
            fontFamily: "Cinzel, serif",
            fontSize: 26,
            color: "#EEF2F8",
            letterSpacing: "0.12em",
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
