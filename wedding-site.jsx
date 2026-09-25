import { useState, useEffect } from "react";

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
    "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;1,300;1,500&family=Montserrat:wght@300;400;500&display=swap";
  document.head.appendChild(link);

  const style = document.createElement("style");
  style.innerHTML = `
    .wf-root *, .wf-root *::before, .wf-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .wf-root { font-family: 'Montserrat', sans-serif; -webkit-font-smoothing: antialiased; }
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
  `;
  document.head.appendChild(style);
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

// Botanical SVG corner (hand-crafted petal/leaf paths)
const Botanical = ({ flip, light }) => {
  const c = light ? "rgba(245,237,216,0.18)" : "rgba(201,164,74,0.18)";
  const s = light ? "rgba(245,237,216,0.25)" : "rgba(201,164,74,0.25)";
  return (
    <svg
      width="170"
      height="170"
      viewBox="0 0 170 170"
      fill="none"
      style={{
        position: "absolute",
        top: flip ? "auto" : 0,
        bottom: flip ? 0 : "auto",
        left: flip ? "auto" : 0,
        right: flip ? 0 : "auto",
        transform: flip ? "rotate(180deg)" : "none",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Main bloom */}
      <ellipse cx="52" cy="52" rx="26" ry="14" fill={c} transform="rotate(-45 52 52)" />
      <ellipse cx="52" cy="52" rx="26" ry="14" fill={c} transform="rotate(45 52 52)" />
      <ellipse cx="52" cy="52" rx="26" ry="14" fill={c} transform="rotate(0 52 52)" />
      <ellipse cx="52" cy="52" rx="26" ry="14" fill={c} transform="rotate(90 52 52)" />
      <circle cx="52" cy="52" r="9" fill={s} />
      {/* Stem */}
      <path d="M52 60 Q 60 90 55 120" stroke={s} strokeWidth="1.2" fill="none" />
      {/* Leaves */}
      <path d="M55 85 Q 80 78 90 58 Q 68 62 55 85Z" fill={c} />
      <path d="M54 100 Q 30 95 22 74 Q 44 80 54 100Z" fill={c} />
      {/* Small buds */}
      <circle cx="88" cy="28" r="5" fill={c} />
      <path d="M88 28 Q 70 35 60 44" stroke={s} strokeWidth="0.9" fill="none" />
      <circle cx="28" cy="88" r="5" fill={c} />
      <path d="M28 88 Q 35 70 46 60" stroke={s} strokeWidth="0.9" fill="none" />
      {/* Tiny accent dots */}
      <circle cx="110" cy="18" r="3" fill={c} />
      <circle cx="18" cy="112" r="3" fill={c} />
      <path d="M105 18 Q 85 22 74 34" stroke={s} strokeWidth="0.7" fill="none" />
    </svg>
  );
};

// ── Monogram circle ─────────────────────────────────────────────────
const Monogram = ({ size = 90, fontSize = 26 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: "1.5px solid rgba(201,164,74,0.45)",
      background: "rgba(201,164,74,0.07)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto",
    }}
  >
    <span
      style={{
        fontFamily: "Playfair Display, serif",
        fontSize,
        color: "#E8C97A",
        fontStyle: "italic",
        letterSpacing: 2,
      }}
    >
      {CONFIG.initials}
    </span>
  </div>
);

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
      <Botanical light />
      <Botanical flip light />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Monogram size={96} fontSize={28} />

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "rgba(245,237,216,0.55)",
            margin: "28px 0 20px",
            textTransform: "uppercase",
          }}
        >
          Together with their families
        </p>

        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(52px, 12vw, 84px)",
            color: "#F5EDD8",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: 3,
          }}
        >
          {CONFIG.bride}
        </h1>

        <p
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: 32,
            fontStyle: "italic",
            fontWeight: 300,
            color: "#C9A44A",
            margin: "6px 0",
            lineHeight: 1.2,
          }}
        >
          and
        </p>

        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(52px, 12vw, 84px)",
            color: "#F5EDD8",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: 3,
          }}
        >
          {CONFIG.groom}
        </h1>

        <Divider light />

        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(245,237,216,0.65)",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Invite you to celebrate their wedding
        </p>

        <p
          style={{
            fontFamily: "Playfair Display, serif",
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
                fontFamily: "Playfair Display, serif",
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
      <Botanical light />
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
                  fontFamily: "Playfair Display, serif",
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
      <Eyebrow light>Our Song</Eyebrow>
      <Divider light />
      <p
        style={{
          fontFamily: "Playfair Display, serif",
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
        <div style={{ fontSize: 42, marginBottom: 18 }}>💌</div>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
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
      <Botanical light />
      <Botanical flip light />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Monogram size={74} fontSize={20} />

        <p
          style={{
            fontFamily: "Playfair Display, serif",
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
