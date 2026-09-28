import { CONFIG } from "../../config/site.js";
import { Foil } from "../../foil/Foil.jsx";
import { LaurelArc, LeafFrond, SingleBloom } from "../../foil/motifs.jsx";
import { asDate, fmtShortDate, fmtTime, mapHref } from "../../lib/format.js";
import { EngravedRule } from "../EngravedRule.jsx";
import { Section } from "../Section.jsx";

export function BigDay() {
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
      tone="beige"
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
